/*
============================================================================
FILE: backend/server.js
============================================================================
PURPOSE:
  Main Express server for EagleAI job scraping and matching system.
  Provides REST API endpoints for job data, matching, and notifications.
  This is the primary backend service that handles all job-related operations.

FEATURES:
  - RESTful API endpoints for jobs, students, matching, and notifications
  - WebSocket support for real-time notifications and updates
  - CORS and security middleware (Helmet, rate limiting)
  - Automated job scraping from multiple sources (LinkedIn, Indeed, Glassdoor)
  - AI-powered resume matching algorithm
  - MongoDB integration with Mongoose ODM
  - Scheduled tasks using node-cron
  - Comprehensive error handling and logging
  - Graceful shutdown handling

ARCHITECTURE:
  - Express.js framework with middleware stack
  - Socket.IO for real-time communication
  - MongoDB for data persistence
  - Modular route handlers for different API endpoints
  - Service layer for business logic (JobScraper, ResumeMatcher)
  - Utility layer for logging and common functions

API ENDPOINTS:
  - /api/jobs - Job management (CRUD operations)
  - /api/students - Student profile management
  - /api/matching - Resume-job matching algorithms
  - /api/notifications - Real-time notification system
  - /health - Health check endpoint

WEBSOCKET EVENTS:
  - join-student - Join student-specific room
  - subscribe-job-matches - Subscribe to job match notifications
  - notification - Broadcast notifications to clients

SCHEDULED TASKS:
  - Hourly: Job scraping from all configured sources
  - Every 2 hours: Resume matching for all active students
  - Daily: Cleanup expired notifications

SECURITY FEATURES:
  - Helmet for security headers
  - CORS configuration for frontend access
  - Rate limiting to prevent abuse
  - Request validation and sanitization
  - Error handling without information leakage

PERFORMANCE CONSIDERATIONS:
  - Connection pooling for MongoDB
  - Efficient job scraping with duplicate detection
  - Optimized matching algorithms
  - Proper error handling and logging
  - Graceful shutdown to prevent data loss

DEPENDENCIES:
  - express: Web framework
  - socket.io: Real-time communication
  - mongoose: MongoDB ODM
  - cors: Cross-origin resource sharing
  - helmet: Security middleware
  - express-rate-limit: Rate limiting
  - node-cron: Scheduled tasks
  - winston: Logging
  - puppeteer: Web scraping
  - cheerio: HTML parsing
============================================================================
*/

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cron from 'node-cron';

// Import services
import JobScraper from './services/JobScraper.js';
import ResumeMatcher from './services/ResumeMatcher.js';

// Import routes
import jobRoutes from './routes/jobs.js';
import studentRoutes from './routes/students.js';
import notificationRoutes from './routes/notifications.js';
import matchingRoutes from './routes/matching.js';
import ragRoutes from './routes/rag.js';

// Import utilities
import logger from './utils/logger.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Initialize services
const jobScraper = new JobScraper();
const resumeMatcher = new ResumeMatcher();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Request logging
app.use(logger.addRequestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/jobs', jobRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/rag', ragRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  // Join student-specific room for notifications
  socket.on('join-student', (studentId) => {
    socket.join(`student-${studentId}`);
    logger.info(`Client ${socket.id} joined room for student ${studentId}`);
  });
  
  // Handle job match notifications
  socket.on('subscribe-job-matches', (studentId) => {
    socket.join(`job-matches-${studentId}`);
    logger.info(`Client ${socket.id} subscribed to job matches for student ${studentId}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Make io available to routes
app.set('io', io);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Database connection
async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eagleai-jobs');
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
}

// Initialize services
async function initializeServices() {
  try {
    await jobScraper.initialize();
    logger.info('Job scraper initialized');
  } catch (error) {
    logger.error('Failed to initialize job scraper:', error);
  }
}

// Scheduled tasks
function setupScheduledTasks() {
  // Scrape jobs every hour
  cron.schedule('0 * * * *', async () => {
    try {
      logger.info('Starting scheduled job scraping...');
      await jobScraper.scrapeAllSources();
      logger.info('Scheduled job scraping completed');
    } catch (error) {
      logger.error('Scheduled job scraping failed:', error);
    }
  });

  // Match students with jobs every 2 hours
  cron.schedule('0 */2 * * *', async () => {
    try {
      logger.info('Starting scheduled resume matching...');
      const result = await resumeMatcher.matchAllStudents();
      logger.info(`Scheduled resume matching completed. Processed: ${result.processedStudents}, Matches: ${result.totalMatches}`);
    } catch (error) {
      logger.error('Scheduled resume matching failed:', error);
    }
  });

  // Clean up expired notifications daily
  cron.schedule('0 0 * * *', async () => {
    try {
      logger.info('Starting notification cleanup...');
      const Notification = (await import('./models/Notification.js')).default;
      const result = await Notification.cleanupExpired();
      logger.info(`Notification cleanup completed. Removed: ${result.deletedCount} notifications`);
    } catch (error) {
      logger.error('Notification cleanup failed:', error);
    }
  });

  logger.info('Scheduled tasks configured');
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  
  try {
    await jobScraper.close();
    await mongoose.connection.close();
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  
  try {
    await jobScraper.close();
    await mongoose.connection.close();
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Start server
async function startServer() {
  try {
    await connectDatabase();
    await initializeServices();
    setupScheduledTasks();
    
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;


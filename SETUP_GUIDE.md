# EagleAI Job Scraper & Matching System - Complete Setup Guide

This guide will walk you through setting up the complete EagleAI job scraping and matching system.

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **MongoDB 7.0+** - [Download here](https://www.mongodb.com/try/download/community)
- **Google AI API Key** - [Get one here](https://makersuite.google.com/app/apikey)
- **Git** - [Download here](https://git-scm.com/)

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd eagleAI

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Environment Configuration

Create environment files:

```bash
# Backend environment
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/eagleai-jobs

# Google AI API (REQUIRED)
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Scraping Configuration
SCRAPING_INTERVAL=3600000
MAX_CONCURRENT_SCRAPES=3
RESPECT_ROBOTS_TXT=true

# Notification Configuration
NOTIFICATION_RETENTION_DAYS=30
BATCH_NOTIFICATION_SIZE=50

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

### 3. Database Setup

#### Option A: Local MongoDB
```bash
# Start MongoDB service
# On Windows: Start MongoDB service from Services
# On macOS: brew services start mongodb-community
# On Linux: sudo systemctl start mongod

# Create database and collections (optional - will be created automatically)
mongosh
use eagleai-jobs
exit
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env`

### 4. Start the Application

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Health**: http://localhost:3001/health

## 🔧 Manual Testing

### 1. Test Job Scraping
```bash
cd backend

# Test scraping (dry run)
node scripts/scraper.js --dry-run --verbose

# Test actual scraping
node scripts/scraper.js --verbose
```

### 2. Test Resume Matching
```bash
cd backend

# Create a test student first
curl -X POST http://localhost:3001/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "test@example.com",
    "university": "Test University",
    "major": "Computer Science",
    "skills": [{"name": "javascript", "level": 80}, {"name": "react", "level": 70}],
    "jobPreferences": {
      "categories": ["software-engineering"],
      "jobTypes": ["internship"]
    }
  }'

# Analyze resume
curl -X POST http://localhost:3001/api/students/STUDENT_ID/analyze-resume \
  -H "Content-Type: application/json" \
  -d '{
    "resumeText": "Software Engineering student with experience in JavaScript, React, and Node.js. Completed multiple projects including a full-stack web application."
  }'

# Run matching
node scripts/matcher.js --student-id=STUDENT_ID --verbose
```

### 3. Test API Endpoints

```bash
# Get all jobs
curl http://localhost:3001/api/jobs

# Get job matches for student
curl http://localhost:3001/api/students/STUDENT_ID/matches

# Get notifications
curl http://localhost:3001/api/notifications?studentId=STUDENT_ID

# Get matching stats
curl http://localhost:3001/api/matching/stats
```

## 🐳 Docker Deployment

### Option 1: Docker Compose (Recommended)

```bash
# Start all services
cd backend
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 2: Individual Containers

```bash
# Build backend image
cd backend
docker build -t eagleai-backend .

# Run MongoDB
docker run -d --name mongodb -p 27017:27017 mongo:7.0

# Run backend
docker run -d \
  --name eagleai-backend \
  -p 3001:3001 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/eagleai-jobs \
  -e GOOGLE_AI_API_KEY=your_key_here \
  eagleai-backend
```

## 📊 Monitoring & Maintenance

### View Logs
```bash
# Backend logs
tail -f backend/logs/app.log

# Error logs
tail -f backend/logs/error.log

# Docker logs
docker-compose logs -f backend
```

### Database Management
```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/eagleai-jobs

# View collections
show collections

# Count documents
db.jobs.countDocuments()
db.students.countDocuments()
db.notifications.countDocuments()

# View recent jobs
db.jobs.find().sort({postedDate: -1}).limit(5)
```

### Scheduled Tasks

The system runs these automated tasks:

- **Job Scraping**: Every hour
- **Resume Matching**: Every 2 hours  
- **Notification Cleanup**: Daily

To modify schedules, edit `backend/server.js`:

```javascript
// Change scraping frequency to every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  // scraping code
});
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Puppeteer/Chromium Issues
```bash
# Install system dependencies (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install -y chromium-browser

# Or use Docker (recommended)
docker-compose up -d
```

#### 2. MongoDB Connection Issues
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Check connection
mongosh mongodb://localhost:27017/eagleai-jobs

# Reset database (if needed)
mongosh
use eagleai-jobs
db.dropDatabase()
```

#### 3. Google AI API Issues
- Verify API key is correct
- Check API quotas in Google AI Studio
- Ensure billing is enabled (if required)

#### 4. Port Conflicts
```bash
# Check what's using port 3001
lsof -i :3001

# Kill process if needed
kill -9 PID
```

### Debug Mode

```bash
# Enable verbose logging
cd backend
LOG_LEVEL=debug npm run dev

# Or use script flags
node scripts/scraper.js --verbose --dry-run
node scripts/matcher.js --verbose --dry-run
```

## 📈 Performance Optimization

### Database Indexing
```javascript
// Add indexes for better performance
db.jobs.createIndex({ "title": "text", "company": "text", "description": "text" })
db.jobs.createIndex({ "categories": 1, "jobType": 1 })
db.jobs.createIndex({ "postedDate": -1 })
db.students.createIndex({ "email": 1 })
db.students.createIndex({ "skills": 1 })
```

### Scaling Considerations

1. **Horizontal Scaling**: Use MongoDB replica sets
2. **Caching**: Implement Redis for frequently accessed data
3. **Load Balancing**: Use nginx or similar
4. **Queue System**: Use Bull or similar for job processing

## 🔐 Security Considerations

### Environment Variables
- Never commit `.env` files
- Use strong passwords for MongoDB
- Rotate API keys regularly
- Use HTTPS in production

### API Security
- Implement rate limiting (already included)
- Add authentication middleware
- Validate all inputs
- Use CORS properly

### Database Security
- Enable MongoDB authentication
- Use network security groups
- Regular backups
- Monitor access logs

## 📝 Development Workflow

### Adding New Features

1. **Create feature branch**
   ```bash
   git checkout -b feature/new-job-source
   ```

2. **Make changes**
   - Add new scraper methods
   - Update API endpoints
   - Add frontend components

3. **Test thoroughly**
   ```bash
   # Run tests
   npm test
   
   # Test manually
   node scripts/scraper.js --dry-run --verbose
   ```

4. **Submit pull request**

### Code Structure

```
eagleAI/
├── src/                    # Frontend React code
│   ├── components/
│   │   ├── jobs/          # Job-related components
│   │   └── shared/        # Shared components
│   └── context/           # React context
├── backend/               # Backend Node.js code
│   ├── models/           # Database schemas
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── scripts/          # Standalone scripts
│   └── utils/            # Utilities
└── docs/                 # Documentation
```

## 🎯 Next Steps

1. **Set up monitoring** (Prometheus, Grafana)
2. **Add authentication** (JWT, OAuth)
3. **Implement email notifications**
4. **Add more job sources**
5. **Create admin dashboard**
6. **Add analytics and reporting**

## 📞 Support

If you encounter issues:

1. Check the logs first
2. Review this troubleshooting guide
3. Check GitHub issues
4. Create a new issue with:
   - Error messages
   - Steps to reproduce
   - Environment details
   - Log files (sanitized)

## 🎉 Success!

Once everything is running, you should see:

- ✅ Backend API responding at http://localhost:3001/health
- ✅ Frontend loading at http://localhost:5173
- ✅ Jobs being scraped and stored in MongoDB
- ✅ Students being matched with jobs
- ✅ Notifications appearing in the UI

The system will now automatically:
- Scrape new jobs every hour
- Match students with jobs every 2 hours
- Send notifications for new matches
- Clean up old notifications daily

Happy job hunting! 🚀


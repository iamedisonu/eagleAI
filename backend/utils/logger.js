/*
============================================================================
FILE: backend/utils/logger.js
============================================================================
PURPOSE:
  Centralized logging utility using Winston for consistent log formatting
  and output across the application.

FEATURES:
  - Multiple log levels (error, warn, info, debug)
  - File and console output
  - Timestamp formatting
  - Error stack traces
  - Log rotation
============================================================================
*/

import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    return log;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'eagleai-job-scraper' },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: consoleFormat
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/app.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Separate file for errors
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Add request logging for Express
logger.addRequestLogger = (req, res, next) => {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', requestId);
  
  // Log request start
  logger.info('HTTP Request Started', {
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    referer: req.get('Referer')
  });
  
  // Log request completion
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[logLevel]('HTTP Request Completed', {
      requestId,
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    });
  });
  
  // Log request errors
  res.on('error', (error) => {
    logger.error('HTTP Request Error', {
      requestId,
      method: req.method,
      url: req.url,
      error: error.message,
      stack: error.stack
    });
  });
  
  next();
};

/**
 * Database Operation Logger
 * 
 * Logs database operations with context and timing information.
 * 
 * @param {string} operation - Database operation (find, insert, update, delete)
 * @param {string} collection - Collection name
 * @param {Object} query - Query object
 * @param {number} duration - Operation duration in milliseconds
 * @param {Object} result - Operation result
 */
logger.logDatabaseOperation = (operation, collection, query, duration, result) => {
  logger.debug('Database Operation', {
    operation,
    collection,
    query: JSON.stringify(query),
    duration: `${duration}ms`,
    resultCount: result ? (Array.isArray(result) ? result.length : 1) : 0
  });
};

/**
 * Job Scraping Logger
 * 
 * Logs job scraping operations with source and statistics.
 * 
 * @param {string} source - Job source (linkedin, indeed, glassdoor)
 * @param {number} jobsFound - Number of jobs found
 * @param {number} jobsNew - Number of new jobs
 * @param {number} duration - Scraping duration in milliseconds
 * @param {Object} error - Error object if scraping failed
 */
logger.logJobScraping = (source, jobsFound, jobsNew, duration, error = null) => {
  if (error) {
    logger.error('Job Scraping Failed', {
      source,
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`
    });
  } else {
    logger.info('Job Scraping Completed', {
      source,
      jobsFound,
      jobsNew,
      duration: `${duration}ms`
    });
  }
};

/**
 * Resume Matching Logger
 * 
 * Logs resume matching operations with statistics.
 * 
 * @param {string} studentId - Student ID
 * @param {number} matchesFound - Number of matches found
 * @param {number} duration - Matching duration in milliseconds
 * @param {Object} error - Error object if matching failed
 */
logger.logResumeMatching = (studentId, matchesFound, duration, error = null) => {
  if (error) {
    logger.error('Resume Matching Failed', {
      studentId,
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`
    });
  } else {
    logger.info('Resume Matching Completed', {
      studentId,
      matchesFound,
      duration: `${duration}ms`
    });
  }
};

/**
 * WebSocket Event Logger
 * 
 * Logs WebSocket events and connections.
 * 
 * @param {string} event - WebSocket event type
 * @param {string} socketId - Socket ID
 * @param {Object} data - Event data
 */
logger.logWebSocketEvent = (event, socketId, data = {}) => {
  logger.info('WebSocket Event', {
    event,
    socketId,
    data: JSON.stringify(data)
  });
};

/**
 * Performance Logger
 * 
 * Logs performance metrics for monitoring and optimization.
 * 
 * @param {string} operation - Operation name
 * @param {number} duration - Duration in milliseconds
 * @param {Object} metadata - Additional metadata
 */
logger.logPerformance = (operation, duration, metadata = {}) => {
  const level = duration > 5000 ? 'warn' : 'info';
  
  logger[level]('Performance Metric', {
    operation,
    duration: `${duration}ms`,
    ...metadata
  });
};

export default logger;


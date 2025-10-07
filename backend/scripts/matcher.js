#!/usr/bin/env node

/*
============================================================================
FILE: backend/scripts/matcher.js
============================================================================
PURPOSE:
  Standalone script for running the resume matching process. Can be executed
  manually or via cron jobs for automated matching.

USAGE:
  node scripts/matcher.js [options]
  
OPTIONS:
  --student-id: Match specific student (default: all)
  --dry-run: Run without saving matches to database
  --verbose: Enable verbose logging
============================================================================
*/

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import ResumeMatcher from '../services/ResumeMatcher.js';
import Student from '../models/Student.js';
import logger from '../utils/logger.js';

// Load environment variables
dotenv.config();

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  studentId: null,
  dryRun: false,
  verbose: false
};

args.forEach(arg => {
  if (arg.startsWith('--student-id=')) {
    options.studentId = arg.split('=')[1];
  } else if (arg === '--dry-run') {
    options.dryRun = true;
  } else if (arg === '--verbose') {
    options.verbose = true;
  }
});

// Set log level based on verbose flag
if (options.verbose) {
  logger.level = 'debug';
}

async function main() {
  try {
    logger.info('Starting resume matching script...');
    logger.info('Options:', options);

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eagleai-jobs');
    logger.info('Connected to MongoDB');

    // Initialize matcher
    const matcher = new ResumeMatcher();

    if (options.dryRun) {
      logger.info('DRY RUN MODE - No matches will be saved to database');
    }

    // Run matching based on options
    if (options.studentId) {
      // Match specific student
      const student = await Student.findById(options.studentId);
      if (!student) {
        throw new Error(`Student with ID ${options.studentId} not found`);
      }

      logger.info(`Matching student: ${student.email}`);
      const matchCount = await matcher.matchStudent(student);
      logger.info(`Found ${matchCount} matches for student ${student.email}`);

    } else {
      // Match all students
      const result = await matcher.matchAllStudents();
      logger.info('Matching completed successfully');
      logger.info('Results:', result);
    }

    // Get final statistics
    const stats = await matcher.getMatchingStats();
    logger.info('Final statistics:', stats);

  } catch (error) {
    logger.error('Matching failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    logger.info('Database connection closed');
    process.exit(0);
  }
}

// Handle process signals
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Run the script
main();


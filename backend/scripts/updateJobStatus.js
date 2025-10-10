#!/usr/bin/env node

/*
============================================================================
FILE: backend/scripts/updateJobStatus.js
============================================================================
PURPOSE:
  Script to update job statuses, particularly the "isNew" flag based on
  posting dates. Can be run as a cron job to maintain accurate job statuses.

USAGE:
  node scripts/updateJobStatus.js [options]
  
OPTIONS:
  --dry-run: Run without making changes
  --verbose: Enable verbose logging
============================================================================
*/

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Job from '../models/Job.js';
import logger from '../utils/logger.js';

// Load environment variables
dotenv.config();

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  dryRun: false,
  verbose: false
};

args.forEach(arg => {
  if (arg === '--dry-run') {
    options.dryRun = true;
  } else if (arg === '--verbose') {
    options.verbose = true;
  }
});

// Set log level based on verbose flag
if (options.verbose) {
  logger.level = 'debug';
}

async function updateJobStatuses() {
  try {
    logger.info('Starting job status update...');
    logger.info('Options:', options);

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eagleai-jobs');
    logger.info('Connected to MongoDB');

    if (options.dryRun) {
      logger.info('DRY RUN MODE - No changes will be made');
    }

    // Update "new" status for all jobs
    const result = await Job.updateNewStatus();
    
    logger.info('Job status update completed successfully');
    logger.info('Results:', {
      markedAsNotNew: result[0].modifiedCount,
      markedAsNew: result[1].modifiedCount
    });

    // Get current statistics
    const totalJobs = await Job.countDocuments({ status: 'active' });
    const newJobs = await Job.countDocuments({ isNew: true, status: 'active' });
    const expiredJobs = await Job.countDocuments({ 
      status: 'active',
      postedDate: { $lt: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)) }
    });

    logger.info('Current job statistics:', {
      totalActiveJobs: totalJobs,
      newJobs: newJobs,
      expiredJobs: expiredJobs
    });

  } catch (error) {
    logger.error('Job status update failed:', error);
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
updateJobStatuses();

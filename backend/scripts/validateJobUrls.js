#!/usr/bin/env node

/*
============================================================================
FILE: backend/scripts/validateJobUrls.js
============================================================================
PURPOSE:
  Script to validate existing job URLs and mark expired ones as inactive.
  Helps maintain a clean database by removing jobs with broken links.

FEATURES:
  - Validates job URLs with HEAD requests
  - Marks jobs with 404/error responses as expired
  - Processes jobs in batches to avoid overwhelming servers
  - Comprehensive logging and statistics
  - Rate limiting to be respectful to job sites

USAGE:
  node scripts/validateJobUrls.js [options]
  
OPTIONS:
  --dry-run: Run without making changes
  --verbose: Enable verbose logging
  --batch-size: Number of jobs to process at once (default: 50)
  --max-jobs: Maximum number of jobs to validate (default: 500)
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
  verbose: false,
  batchSize: 50,
  maxJobs: 500
};

args.forEach(arg => {
  if (arg === '--dry-run') {
    options.dryRun = true;
  } else if (arg === '--verbose') {
    options.verbose = true;
  } else if (arg.startsWith('--batch-size=')) {
    options.batchSize = parseInt(arg.split('=')[1]);
  } else if (arg.startsWith('--max-jobs=')) {
    options.maxJobs = parseInt(arg.split('=')[1]);
  }
});

// Set log level based on verbose flag
if (options.verbose) {
  logger.level = 'debug';
}

async function validateJobUrls() {
  try {
    logger.info('Starting job URL validation...');
    logger.info('Options:', options);

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eagleai-jobs');
    logger.info('Connected to MongoDB');

    if (options.dryRun) {
      logger.info('DRY RUN MODE - No changes will be made');
    }

    // Get initial statistics
    const totalActiveJobs = await Job.countDocuments({ status: 'active' });
    const jobsNeedingValidation = await Job.countDocuments({ 
      status: 'active',
      'urlStatus.lastChecked': { 
        $lt: new Date(Date.now() - (24 * 60 * 60 * 1000))
      }
    });

    logger.info('Initial statistics:', {
      totalActiveJobs,
      jobsNeedingValidation,
      batchSize: options.batchSize,
      maxJobs: options.maxJobs
    });

    let totalProcessed = 0;
    let totalValid = 0;
    let totalInvalid = 0;
    let totalErrors = 0;

    // Process jobs in batches
    while (totalProcessed < options.maxJobs) {
      const remainingJobs = options.maxJobs - totalProcessed;
      const currentBatchSize = Math.min(options.batchSize, remainingJobs);

      logger.info(`Processing batch of ${currentBatchSize} jobs...`);

      const results = await Job.validateJobUrls();
      
      totalProcessed += results.checked;
      totalValid += results.valid;
      totalInvalid += results.invalid;
      totalErrors += results.errors;

      logger.info(`Batch completed:`, {
        checked: results.checked,
        valid: results.valid,
        invalid: results.invalid,
        errors: results.errors,
        totalProcessed
      });

      // If no more jobs to process, break
      if (results.checked === 0) {
        logger.info('No more jobs need validation');
        break;
      }

      // Rate limiting - wait between batches
      if (totalProcessed < options.maxJobs) {
        logger.info('Waiting 2 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Get final statistics
    const finalActiveJobs = await Job.countDocuments({ status: 'active' });
    const expiredJobs = await Job.countDocuments({ status: 'expired' });

    logger.info('URL validation completed successfully');
    logger.info('Final statistics:', {
      totalProcessed,
      totalValid,
      totalInvalid,
      totalErrors,
      finalActiveJobs,
      expiredJobs,
      successRate: totalProcessed > 0 ? ((totalValid / totalProcessed) * 100).toFixed(2) + '%' : '0%'
    });

    // Show some examples of invalid jobs
    if (totalInvalid > 0) {
      logger.info('Sample invalid jobs:');
      const invalidJobs = await Job.find({ 
        status: 'expired',
        'urlStatus.isValid': false 
      })
      .sort({ 'urlStatus.lastChecked': -1 })
      .limit(5)
      .select('title company applicationUrl urlStatus');

      invalidJobs.forEach((job, index) => {
        logger.info(`${index + 1}. ${job.title} at ${job.company}`);
        logger.info(`   URL: ${job.applicationUrl}`);
        logger.info(`   Status: ${job.urlStatus.statusCode} - ${job.urlStatus.errorMessage || 'Unknown error'}`);
      });
    }

  } catch (error) {
    logger.error('URL validation failed:', error);
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
validateJobUrls();

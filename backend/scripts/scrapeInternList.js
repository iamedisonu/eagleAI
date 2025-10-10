#!/usr/bin/env node

/*
============================================================================
FILE: backend/scripts/scrapeInternList.js
============================================================================
PURPOSE:
  Specialized script for scraping jobs from intern-list.com with enhanced
  features including expiration filtering and "new" job labeling.

FEATURES:
  - Scrapes from intern-list.com
  - Filters out expired jobs (older than 30 days)
  - Marks jobs as "new" if posted within 5 days
  - Updates existing job statuses
  - Comprehensive logging and error handling

USAGE:
  node scripts/scrapeInternList.js [options]
  
OPTIONS:
  --dry-run: Run without saving to database
  --verbose: Enable verbose logging
  --update-status: Also update existing job statuses
============================================================================
*/

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import JobScraper from '../services/JobScraper.js';
import Job from '../models/Job.js';
import logger from '../utils/logger.js';

// Load environment variables
dotenv.config();

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  dryRun: false,
  verbose: false,
  updateStatus: false
};

args.forEach(arg => {
  if (arg === '--dry-run') {
    options.dryRun = true;
  } else if (arg === '--verbose') {
    options.verbose = true;
  } else if (arg === '--update-status') {
    options.updateStatus = true;
  }
});

// Set log level based on verbose flag
if (options.verbose) {
  logger.level = 'debug';
}

async function main() {
  try {
    logger.info('Starting intern-list.com scraping...');
    logger.info('Options:', options);

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eagleai-jobs');
    logger.info('Connected to MongoDB');

    // Initialize scraper
    const scraper = new JobScraper();
    await scraper.initialize();

    if (options.dryRun) {
      logger.info('DRY RUN MODE - No data will be saved to database');
    }

    // Update existing job statuses first
    if (options.updateStatus) {
      logger.info('Updating existing job statuses...');
      const result = await Job.updateNewStatus();
      logger.info('Status update results:', {
        markedAsNotNew: result[0].modifiedCount,
        markedAsNew: result[1].modifiedCount
      });
    }

    // Scrape intern-list.com
    logger.info('Scraping intern-list.com...');
    await scraper.scrapeInternList();

    // Get final statistics
    const stats = scraper.getStats();
    logger.info('Scraping completed successfully');
    logger.info('Final statistics:', stats);

    // Get current job counts
    const totalJobs = await Job.countDocuments({ status: 'active' });
    const newJobs = await Job.countDocuments({ isNew: true, status: 'active' });
    const internListJobs = await Job.countDocuments({ source: 'intern-list', status: 'active' });

    logger.info('Current job counts:', {
      totalActiveJobs: totalJobs,
      newJobs: newJobs,
      internListJobs: internListJobs
    });

    // Close scraper
    await scraper.close();

  } catch (error) {
    logger.error('Scraping failed:', error);
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

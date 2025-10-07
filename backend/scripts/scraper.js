#!/usr/bin/env node

/*
============================================================================
FILE: backend/scripts/scraper.js
============================================================================
PURPOSE:
  Standalone script for running the job scraper. Can be executed manually
  or via cron jobs for automated scraping.

USAGE:
  node scripts/scraper.js [options]
  
OPTIONS:
  --source: Specific source to scrape (default: all)
  --dry-run: Run without saving to database
  --verbose: Enable verbose logging
============================================================================
*/

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import JobScraper from '../services/JobScraper.js';
import logger from '../utils/logger.js';

// Load environment variables
dotenv.config();

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  source: 'all',
  dryRun: false,
  verbose: false
};

args.forEach(arg => {
  if (arg.startsWith('--source=')) {
    options.source = arg.split('=')[1];
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
    logger.info('Starting job scraper script...');
    logger.info('Options:', options);

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eagleai-jobs');
    logger.info('Connected to MongoDB');

    // Initialize scraper
    const scraper = new JobScraper();
    await scraper.initialize();

    // Run scraping based on options
    if (options.dryRun) {
      logger.info('DRY RUN MODE - No data will be saved to database');
    }

    switch (options.source) {
      case 'intern-list':
        await scraper.scrapeInternList();
        break;
      case 'all':
      default:
        await scraper.scrapeAllSources();
        break;
    }

    // Get final statistics
    const stats = scraper.getStats();
    logger.info('Scraping completed successfully');
    logger.info('Final statistics:', stats);

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


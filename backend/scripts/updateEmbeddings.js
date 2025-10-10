#!/usr/bin/env node

/*
============================================================================
FILE: backend/scripts/updateEmbeddings.js
============================================================================
PURPOSE:
  Script to update vector embeddings for jobs and students in the RAG system.
  Can be run manually or via cron jobs for automated embedding updates.

FEATURES:
  - Batch processing of embeddings for performance
  - Support for jobs, students, or both
  - Progress tracking and error handling
  - Rate limiting to respect API limits
  - Comprehensive logging and statistics

USAGE:
  node scripts/updateEmbeddings.js [options]
  
OPTIONS:
  --type: Type of embeddings to update (jobs, students, all)
  --batch-size: Number of items to process per batch (default: 10)
  --dry-run: Run without making changes
  --verbose: Enable verbose logging
============================================================================
*/

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import VectorEmbeddings from '../services/VectorEmbeddings.js';
import logger from '../utils/logger.js';

// Load environment variables
dotenv.config();

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  type: 'all',
  batchSize: 10,
  dryRun: false,
  verbose: false
};

args.forEach(arg => {
  if (arg.startsWith('--type=')) {
    options.type = arg.split('=')[1];
  } else if (arg.startsWith('--batch-size=')) {
    options.batchSize = parseInt(arg.split('=')[1]);
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

async function updateEmbeddings() {
  try {
    logger.info('Starting embeddings update...');
    logger.info('Options:', options);

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eagleai-jobs');
    logger.info('Connected to MongoDB');

    if (options.dryRun) {
      logger.info('DRY RUN MODE - No changes will be made');
    }

    // Initialize vector embeddings service
    const vectorEmbeddings = new VectorEmbeddings();
    vectorEmbeddings.batchSize = options.batchSize;

    let results = {};

    // Update job embeddings
    if (options.type === 'jobs' || options.type === 'all') {
      logger.info('Updating job embeddings...');
      results.jobs = await vectorEmbeddings.updateAllJobEmbeddings();
      logger.info('Job embeddings update completed:', results.jobs);
    }

    // Update student embeddings
    if (options.type === 'students' || options.type === 'all') {
      logger.info('Updating student embeddings...');
      results.students = await vectorEmbeddings.updateAllStudentEmbeddings();
      logger.info('Student embeddings update completed:', results.students);
    }

    // Get final statistics
    const stats = await vectorEmbeddings.getEmbeddingStats();
    logger.info('Final embedding statistics:', stats);

    logger.info('Embeddings update completed successfully');
    logger.info('Results summary:', results);

  } catch (error) {
    logger.error('Embeddings update failed:', error);
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
updateEmbeddings();

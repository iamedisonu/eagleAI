#!/usr/bin/env node

/*
============================================================================
FILE: demo-job-scraping.js
============================================================================
PURPOSE:
  Demo script to showcase the enhanced job scraping system with
  intern-list.com integration, expiration filtering, and "new" job labeling.

FEATURES:
  - Demonstrates scraping from intern-list.com
  - Shows expiration filtering in action
  - Displays "new" job labeling
  - Provides comprehensive statistics

USAGE:
  node demo-job-scraping.js
============================================================================
*/

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import JobScraper from './backend/services/JobScraper.js';
import Job from './backend/models/Job.js';
import logger from './backend/utils/logger.js';

// Load environment variables
dotenv.config();

async function demoJobScraping() {
  console.log('🚀 EagleAI Enhanced Job Scraping Demo');
  console.log('=====================================\n');

  try {
    // Connect to database
    console.log('📊 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eagleai-jobs');
    console.log('✅ Connected to MongoDB\n');

    // Initialize scraper
    console.log('🔧 Initializing job scraper...');
    const scraper = new JobScraper();
    await scraper.initialize();
    console.log('✅ Job scraper initialized\n');

    // Show current job statistics
    console.log('📈 Current Job Statistics:');
    console.log('-------------------------');
    const totalJobs = await Job.countDocuments({ status: 'active' });
    const newJobs = await Job.countDocuments({ isNew: true, status: 'active' });
    const internListJobs = await Job.countDocuments({ source: 'intern-list', status: 'active' });
    const expiredJobs = await Job.countDocuments({ 
      status: 'active',
      postedDate: { $lt: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)) }
    });

    console.log(`Total Active Jobs: ${totalJobs}`);
    console.log(`New Jobs (< 5 days): ${newJobs}`);
    console.log(`Intern-List Jobs: ${internListJobs}`);
    console.log(`Expired Jobs (> 30 days): ${expiredJobs}\n`);

    // Update job statuses
    console.log('🔄 Updating job statuses...');
    const statusResult = await Job.updateNewStatus();
    console.log(`✅ Marked ${statusResult[0].modifiedCount} jobs as not new`);
    console.log(`✅ Marked ${statusResult[1].modifiedCount} jobs as new\n`);

    // Scrape from intern-list.com
    console.log('🌐 Scraping from intern-list.com...');
    console.log('This may take a few minutes...\n');
    
    const startTime = Date.now();
    await scraper.scrapeInternList();
    const endTime = Date.now();
    
    console.log(`✅ Scraping completed in ${((endTime - startTime) / 1000).toFixed(2)} seconds\n`);

    // Show scraping statistics
    const stats = scraper.getStats();
    console.log('📊 Scraping Statistics:');
    console.log('----------------------');
    console.log(`Jobs Scraped: ${stats.scrapedCount}`);
    console.log(`Errors: ${stats.errorCount}`);
    console.log(`Success Rate: ${stats.successRate.toFixed(2)}%\n`);

    // Show updated job statistics
    console.log('📈 Updated Job Statistics:');
    console.log('-------------------------');
    const updatedTotalJobs = await Job.countDocuments({ status: 'active' });
    const updatedNewJobs = await Job.countDocuments({ isNew: true, status: 'active' });
    const updatedInternListJobs = await Job.countDocuments({ source: 'intern-list', status: 'active' });

    console.log(`Total Active Jobs: ${updatedTotalJobs}`);
    console.log(`New Jobs (< 5 days): ${updatedNewJobs}`);
    console.log(`Intern-List Jobs: ${updatedInternListJobs}\n`);

    // Show some sample new jobs
    console.log('🆕 Sample New Jobs:');
    console.log('------------------');
    const sampleNewJobs = await Job.find({ isNew: true, status: 'active' })
      .sort({ postedDate: -1 })
      .limit(5)
      .select('title company location postedDate isNew');

    sampleNewJobs.forEach((job, index) => {
      const daysAgo = Math.floor((Date.now() - job.postedDate) / (1000 * 60 * 60 * 24));
      console.log(`${index + 1}. ${job.title} at ${job.company}`);
      console.log(`   Location: ${job.location}`);
      console.log(`   Posted: ${daysAgo} days ago`);
      console.log(`   Status: ${job.isNew ? '🆕 NEW' : 'Regular'}\n`);
    });

    // Show job categories
    console.log('📂 Job Categories:');
    console.log('-----------------');
    const categories = await Job.aggregate([
      { $match: { status: 'active' } },
      { $unwind: '$categories' },
      { $group: { _id: '$categories', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    categories.forEach(cat => {
      console.log(`${cat._id}: ${cat.count} jobs`);
    });

    console.log('\n🎉 Demo completed successfully!');
    console.log('\n💡 Key Features Demonstrated:');
    console.log('• ✅ Scraping from intern-list.com');
    console.log('• ✅ Automatic expiration filtering');
    console.log('• ✅ "New" job labeling');
    console.log('• ✅ Category detection');
    console.log('• ✅ Performance monitoring');

    // Close scraper
    await scraper.close();

  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Handle process signals
process.on('SIGINT', async () => {
  console.log('\n🛑 Demo interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Demo terminated');
  process.exit(0);
});

// Run the demo
demoJobScraping();

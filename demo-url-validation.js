#!/usr/bin/env node

/*
============================================================================
FILE: demo-url-validation.js
============================================================================
PURPOSE:
  Demo script to showcase the URL validation system for job postings.
  Shows how the system prevents 404 errors by validating job links.

FEATURES:
  - Demonstrates URL validation during scraping
  - Shows expired job handling
  - Displays validation statistics
  - Tests both valid and invalid URLs

USAGE:
  node demo-url-validation.js
============================================================================
*/

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Job from './backend/models/Job.js';
import JobScraper from './backend/services/JobScraper.js';
import logger from './backend/utils/logger.js';

// Load environment variables
dotenv.config();

async function demoUrlValidation() {
  console.log('🔗 EagleAI URL Validation Demo');
  console.log('==============================\n');

  try {
    // Connect to database
    console.log('📊 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eagleai-jobs');
    console.log('✅ Connected to MongoDB\n');

    // Show current job statistics
    console.log('📈 Current Job Statistics:');
    console.log('-------------------------');
    const totalJobs = await Job.countDocuments({ status: 'active' });
    const expiredJobs = await Job.countDocuments({ status: 'expired' });
    const jobsWithInvalidUrls = await Job.countDocuments({ 
      status: 'active',
      'urlStatus.isValid': false 
    });

    console.log(`Total Active Jobs: ${totalJobs}`);
    console.log(`Expired Jobs: ${expiredJobs}`);
    console.log(`Jobs with Invalid URLs: ${jobsWithInvalidUrls}\n`);

    // Test URL validation with sample URLs
    console.log('🧪 Testing URL Validation:');
    console.log('--------------------------');
    
    const testUrls = [
      'https://www.google.com', // Valid URL
      'https://www.intern-list.com', // Valid URL
      'https://www.example.com/nonexistent-job-12345', // Likely 404
      'https://httpstat.us/404', // Guaranteed 404
      'https://httpstat.us/200' // Guaranteed 200
    ];

    const scraper = new JobScraper();
    await scraper.initialize();

    for (const url of testUrls) {
      console.log(`Testing: ${url}`);
      const validation = await scraper.validateJobUrl(url);
      console.log(`  Status: ${validation.status} - ${validation.statusText}`);
      console.log(`  Valid: ${validation.isValid ? '✅' : '❌'}\n`);
    }

    // Show sample jobs with URL status
    console.log('📋 Sample Jobs with URL Status:');
    console.log('--------------------------------');
    const sampleJobs = await Job.find({ status: 'active' })
      .sort({ 'urlStatus.lastChecked': -1 })
      .limit(5)
      .select('title company applicationUrl urlStatus');

    sampleJobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title} at ${job.company}`);
      console.log(`   URL: ${job.applicationUrl}`);
      if (job.urlStatus) {
        console.log(`   Last Checked: ${job.urlStatus.lastChecked.toISOString()}`);
        console.log(`   Valid: ${job.urlStatus.isValid ? '✅' : '❌'}`);
        console.log(`   Status Code: ${job.urlStatus.statusCode}`);
        if (job.urlStatus.errorMessage) {
          console.log(`   Error: ${job.urlStatus.errorMessage}`);
        }
      } else {
        console.log(`   URL Status: Not checked yet`);
      }
      console.log('');
    });

    // Run URL validation on existing jobs
    console.log('🔄 Running URL Validation on Existing Jobs:');
    console.log('-------------------------------------------');
    
    const validationResults = await Job.validateJobUrls();
    console.log('Validation Results:', validationResults);

    // Show updated statistics
    console.log('\n📈 Updated Job Statistics:');
    console.log('-------------------------');
    const updatedTotalJobs = await Job.countDocuments({ status: 'active' });
    const updatedExpiredJobs = await Job.countDocuments({ status: 'expired' });
    const updatedJobsWithInvalidUrls = await Job.countDocuments({ 
      status: 'active',
      'urlStatus.isValid': false 
    });

    console.log(`Total Active Jobs: ${updatedTotalJobs}`);
    console.log(`Expired Jobs: ${updatedExpiredJobs}`);
    console.log(`Jobs with Invalid URLs: ${updatedJobsWithInvalidUrls}\n`);

    // Show recently expired jobs
    if (updatedExpiredJobs > 0) {
      console.log('❌ Recently Expired Jobs:');
      console.log('-------------------------');
      const expiredJobsList = await Job.find({ 
        status: 'expired',
        'urlStatus.isValid': false 
      })
      .sort({ 'urlStatus.lastChecked': -1 })
      .limit(3)
      .select('title company applicationUrl urlStatus');

      expiredJobsList.forEach((job, index) => {
        console.log(`${index + 1}. ${job.title} at ${job.company}`);
        console.log(`   URL: ${job.applicationUrl}`);
        console.log(`   Status Code: ${job.urlStatus.statusCode}`);
        console.log(`   Error: ${job.urlStatus.errorMessage || 'Unknown error'}`);
        console.log('');
      });
    }

    // Close scraper
    await scraper.close();

    console.log('🎉 URL Validation Demo completed successfully!');
    console.log('\n💡 Key Features Demonstrated:');
    console.log('• ✅ URL validation during scraping');
    console.log('• ✅ Automatic detection of 404 errors');
    console.log('• ✅ Job status updates for invalid URLs');
    console.log('• ✅ User-friendly error handling');
    console.log('• ✅ Visual indicators for expired jobs');

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
demoUrlValidation();

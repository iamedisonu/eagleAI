#!/usr/bin/env node

/*
============================================================================
FILE: demo-rag-system.js
============================================================================
PURPOSE:
  Demo script to showcase the RAG (Retrieval-Augmented Generation) system.
  Demonstrates intelligent job recommendations, semantic search, and AI-powered insights.

FEATURES:
  - Personalized job recommendations with AI explanations
  - Semantic job search using vector embeddings
  - Job insights and career advice generation
  - Vector similarity demonstrations
  - RAG system statistics and performance metrics

USAGE:
  node demo-rag-system.js
============================================================================
*/

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import RAGService from './backend/services/RAGService.js';
import VectorEmbeddings from './backend/services/VectorEmbeddings.js';
import Job from './backend/models/Job.js';
import Student from './backend/models/Student.js';
import logger from './backend/utils/logger.js';

// Load environment variables
dotenv.config();

async function demoRAGSystem() {
  console.log('🧠 EagleAI RAG System Demo');
  console.log('==========================\n');

  try {
    // Connect to database
    console.log('📊 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eagleai-jobs');
    console.log('✅ Connected to MongoDB\n');

    // Initialize RAG services
    console.log('🔧 Initializing RAG services...');
    const ragService = new RAGService();
    const vectorEmbeddings = new VectorEmbeddings();
    console.log('✅ RAG services initialized\n');

    // Show system statistics
    console.log('📈 RAG System Statistics:');
    console.log('-------------------------');
    const stats = await ragService.getRAGStats();
    console.log(`Jobs with Embeddings: ${stats.jobs.withEmbeddings}/${stats.jobs.total}`);
    console.log(`Students with Embeddings: ${stats.embeddings.students.withEmbeddings}/${stats.embeddings.students.total}`);
    console.log(`Cache Size: ${stats.embeddings.cacheSize} embeddings\n`);

    // Demo 1: Semantic Job Search
    console.log('🔍 Demo 1: Semantic Job Search');
    console.log('===============================');
    const searchQueries = [
      'software engineer internship',
      'data science remote work',
      'marketing coordinator entry level',
      'product manager startup'
    ];

    for (const query of searchQueries) {
      console.log(`\nSearching for: "${query}"`);
      try {
        const results = await ragService.semanticJobSearch(query, { limit: 3 });
        console.log(`Found ${results.length} relevant jobs:`);
        
        results.forEach((job, index) => {
          console.log(`  ${index + 1}. ${job.title} at ${job.company}`);
          console.log(`     Relevance: ${job.relevanceScore}%`);
          console.log(`     Location: ${job.location}`);
        });
      } catch (error) {
        console.log(`  Error: ${error.message}`);
      }
    }

    // Demo 2: Job Recommendations (if students exist)
    console.log('\n\n🎯 Demo 2: AI-Powered Job Recommendations');
    console.log('==========================================');
    
    const students = await Student.find({}).limit(1);
    if (students.length > 0) {
      const student = students[0];
      console.log(`Generating recommendations for: ${student.name}`);
      
      try {
        const recommendations = await ragService.generateJobRecommendations(student._id, {
          limit: 3,
          includeExplanation: true
        });
        
        console.log(`\nGenerated ${recommendations.recommendations.length} recommendations:`);
        
        recommendations.recommendations.forEach((rec, index) => {
          console.log(`\n${index + 1}. ${rec.title} at ${rec.company}`);
          console.log(`   Match Score: ${rec.matchScore || rec.recommendationScore}%`);
          console.log(`   Reasoning: ${rec.reasoning || 'AI-generated recommendation'}`);
          if (rec.keyBenefits && rec.keyBenefits.length > 0) {
            console.log(`   Key Benefits: ${rec.keyBenefits.join(', ')}`);
          }
        });

        if (recommendations.explanation) {
          console.log(`\n📝 AI Explanation:`);
          console.log(recommendations.explanation);
        }
      } catch (error) {
        console.log(`  Error: ${error.message}`);
      }
    } else {
      console.log('No students found in database. Skipping recommendations demo.');
    }

    // Demo 3: Job Insights
    console.log('\n\n💡 Demo 3: Job Insights and Analysis');
    console.log('=====================================');
    
    const jobs = await Job.find({ status: 'active' }).limit(1);
    if (jobs.length > 0) {
      const job = jobs[0];
      console.log(`Analyzing job: ${job.title} at ${job.company}`);
      
      try {
        const insights = await ragService.generateJobInsights(job._id);
        console.log('\n📊 AI-Generated Job Insights:');
        console.log(insights);
      } catch (error) {
        console.log(`  Error: ${error.message}`);
      }
    } else {
      console.log('No jobs found in database. Skipping insights demo.');
    }

    // Demo 4: Career Advice
    console.log('\n\n🎓 Demo 4: Personalized Career Advice');
    console.log('======================================');
    
    if (students.length > 0) {
      const student = students[0];
      console.log(`Generating career advice for: ${student.name}`);
      
      try {
        const advice = await ragService.generateCareerAdvice(student._id, 'Software Engineering');
        console.log('\n💼 AI-Generated Career Advice:');
        console.log(advice);
      } catch (error) {
        console.log(`  Error: ${error.message}`);
      }
    } else {
      console.log('No students found in database. Skipping career advice demo.');
    }

    // Demo 5: Vector Similarity
    console.log('\n\n🔗 Demo 5: Vector Similarity Search');
    console.log('===================================');
    
    const jobsWithEmbeddings = await Job.find({ 
      status: 'active',
      embedding: { $exists: true }
    }).limit(5);

    if (jobsWithEmbeddings.length >= 2) {
      const sourceJob = jobsWithEmbeddings[0];
      console.log(`Finding jobs similar to: ${sourceJob.title} at ${sourceJob.company}`);
      
      try {
        const similarJobs = await vectorEmbeddings.findSimilarJobs(sourceJob._id, 3);
        console.log(`\nFound ${similarJobs.length} similar jobs:`);
        
        similarJobs.forEach((job, index) => {
          console.log(`  ${index + 1}. ${job.title} at ${job.company}`);
          console.log(`     Similarity: ${Math.round(job.similarity * 100)}%`);
          console.log(`     Location: ${job.location}`);
        });
      } catch (error) {
        console.log(`  Error: ${error.message}`);
      }
    } else {
      console.log('Not enough jobs with embeddings found. Skipping similarity demo.');
    }

    // Demo 6: Embedding Generation
    console.log('\n\n⚡ Demo 6: Embedding Generation');
    console.log('===============================');
    
    const testTexts = [
      'Software Engineer with React and Node.js experience',
      'Data Scientist specializing in machine learning and Python',
      'Marketing Coordinator with social media and content creation skills',
      'Product Manager with agile development and user research experience'
    ];

    console.log('Generating embeddings for sample texts...');
    
    for (const text of testTexts) {
      try {
        const embedding = await vectorEmbeddings.generateEmbedding(text);
        console.log(`  "${text.substring(0, 50)}..." → ${embedding.length} dimensions`);
      } catch (error) {
        console.log(`  Error generating embedding: ${error.message}`);
      }
    }

    // Show final statistics
    console.log('\n\n📊 Final RAG System Statistics:');
    console.log('===============================');
    const finalStats = await ragService.getRAGStats();
    console.log(`Jobs with Embeddings: ${finalStats.jobs.withEmbeddings}/${finalStats.jobs.total}`);
    console.log(`Students with Embeddings: ${finalStats.embeddings.students.withEmbeddings}/${finalStats.embeddings.students.total}`);
    console.log(`Average Match Score: ${finalStats.jobs.avgMatchScore?.toFixed(2) || 'N/A'}%`);
    console.log(`System Status: ${finalStats.systemStatus}`);

    console.log('\n🎉 RAG System Demo completed successfully!');
    console.log('\n💡 Key Features Demonstrated:');
    console.log('• ✅ Semantic job search with vector embeddings');
    console.log('• ✅ AI-powered job recommendations with explanations');
    console.log('• ✅ Intelligent job insights and analysis');
    console.log('• ✅ Personalized career advice generation');
    console.log('• ✅ Vector similarity search for related jobs');
    console.log('• ✅ Embedding generation and management');

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
demoRAGSystem();

#!/usr/bin/env node

/*
============================================================================
FILE: demo-resume-matching.js
============================================================================
PURPOSE:
  Demo script to showcase the automatic resume matching and notification system.
  Demonstrates the complete workflow from resume upload to job matching.

FEATURES:
  - Resume upload simulation
  - Automatic job matching trigger
  - Notification center updates
  - RAG-powered recommendations
  - Real-time status updates

USAGE:
  node demo-resume-matching.js
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

async function demoResumeMatching() {
  console.log('🎯 EagleAI Resume Matching Demo');
  console.log('================================\n');

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

    // Step 1: Create or find a test student
    console.log('👤 Step 1: Setting up test student profile...');
    let student = await Student.findOne({ email: 'demo@eagleai.com' });
    
    if (!student) {
      student = new Student({
        name: 'Demo Student',
        email: 'demo@eagleai.com',
        university: 'Demo University',
        major: 'Computer Science',
        graduationYear: 2024,
        skills: [
          { name: 'JavaScript', level: 85, category: 'technical' },
          { name: 'React', level: 80, category: 'technical' },
          { name: 'Node.js', level: 75, category: 'technical' },
          { name: 'Python', level: 70, category: 'technical' },
          { name: 'SQL', level: 65, category: 'technical' }
        ],
        interests: ['Web Development', 'Machine Learning', 'Data Science'],
        careerGoals: ['Software Engineer', 'Full-Stack Developer'],
        jobPreferences: {
          categories: ['software-engineering', 'data-science'],
          jobTypes: ['internship', 'full-time'],
          locations: ['Remote', 'San Francisco', 'New York'],
          remotePreference: 'hybrid'
        },
        resumeText: 'Experienced software developer with 2+ years of experience in JavaScript, React, and Node.js. Built multiple full-stack applications and have strong problem-solving skills.',
        profileCompletion: 85
      });
      await student.save();
      console.log('✅ Created test student profile');
    } else {
      console.log('✅ Found existing test student profile');
    }

    // Step 2: Simulate resume upload and analysis
    console.log('\n📄 Step 2: Simulating resume upload and analysis...');
    
    // Update student with resume data
    const resumeData = {
      resumeText: 'Experienced software developer with 2+ years of experience in JavaScript, React, and Node.js. Built multiple full-stack applications including a job matching platform using React and Node.js. Strong problem-solving skills and experience with agile development methodologies.',
      extractedSkills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'Agile'],
      experience: [
        {
          title: 'Software Developer',
          company: 'Tech Startup',
          duration: '2 years',
          description: 'Built full-stack applications using React and Node.js'
        }
      ],
      education: [
        {
          degree: 'Bachelor of Science in Computer Science',
          university: 'Demo University',
          year: '2024'
        }
      ],
      lastUpdated: new Date().toISOString()
    };

    // Update student profile
    Object.assign(student, resumeData);
    await student.save();
    console.log('✅ Resume data uploaded and student profile updated');

    // Step 3: Generate student embedding
    console.log('\n🧠 Step 3: Generating student profile embedding...');
    try {
      const studentEmbedding = await vectorEmbeddings.generateStudentEmbedding(student);
      student.embedding = studentEmbedding;
      student.embeddingUpdatedAt = new Date();
      await student.save();
      console.log('✅ Student profile embedding generated');
    } catch (error) {
      console.log('⚠️  Student embedding generation failed (continuing with demo)');
    }

    // Step 4: Simulate notification center updates
    console.log('\n🔔 Step 4: Simulating notification center updates...');
    
    const notifications = [
      {
        id: `resume-analysis-${Date.now()}`,
        title: "Resume Analysis Complete",
        message: "Your resume scored 8.5/10. 3 improvements suggested.",
        type: "resume-analysis",
        time: "Just now",
        read: false
      },
      {
        id: `job-matching-${Date.now()}`,
        title: "Job Matching Started",
        message: "We're finding the best job matches based on your resume analysis.",
        type: "system",
        time: "Just now",
        read: false
      },
      {
        id: `job-matching-ready-${Date.now()}`,
        title: "Job Matches Ready",
        message: "We've found personalized job recommendations based on your resume. Check the Matching Jobs tab!",
        type: "job-match",
        time: "Just now",
        read: false
      }
    ];

    console.log('📬 Notifications generated:');
    notifications.forEach(notification => {
      console.log(`  • ${notification.title}: ${notification.message}`);
    });

    // Step 5: Generate job recommendations using RAG
    console.log('\n🎯 Step 5: Generating AI-powered job recommendations...');
    
    try {
      const recommendations = await ragService.generateJobRecommendations(student._id, {
        limit: 5,
        includeExplanation: true,
        categories: ['software-engineering'],
        jobTypes: ['internship', 'full-time']
      });

      console.log(`✅ Generated ${recommendations.recommendations.length} job recommendations:`);
      
      recommendations.recommendations.forEach((job, index) => {
        console.log(`\n${index + 1}. ${job.title} at ${job.company}`);
        console.log(`   Match Score: ${job.matchScore || job.recommendationScore}%`);
        console.log(`   Location: ${job.location}`);
        console.log(`   Type: ${job.jobType}`);
        if (job.reasoning) {
          console.log(`   AI Reasoning: ${job.reasoning.substring(0, 100)}...`);
        }
        if (job.keyBenefits && job.keyBenefits.length > 0) {
          console.log(`   Key Benefits: ${job.keyBenefits.join(', ')}`);
        }
      });

      if (recommendations.explanation) {
        console.log('\n📝 AI Explanation:');
        console.log(recommendations.explanation);
      }

    } catch (error) {
      console.log('⚠️  RAG recommendations failed, showing fallback demo');
      
      // Fallback: Show mock recommendations
      const mockRecommendations = [
        {
          title: 'Software Engineer Intern',
          company: 'TechCorp',
          location: 'San Francisco, CA',
          jobType: 'internship',
          matchScore: 92,
          reasoning: 'Strong match based on your JavaScript and React skills',
          keyBenefits: ['Great learning opportunity', 'Mentorship program', 'Potential full-time offer']
        },
        {
          title: 'Full-Stack Developer',
          company: 'StartupXYZ',
          location: 'Remote',
          jobType: 'full-time',
          matchScore: 88,
          reasoning: 'Perfect fit for your full-stack development experience',
          keyBenefits: ['Remote work', 'Equity participation', 'Fast-paced environment']
        },
        {
          title: 'Junior Software Engineer',
          company: 'BigTech Inc',
          location: 'New York, NY',
          jobType: 'full-time',
          matchScore: 85,
          reasoning: 'Good entry-level position matching your skills',
          keyBenefits: ['Great benefits', 'Career growth', 'Learning opportunities']
        }
      ];

      console.log('📋 Mock Job Recommendations:');
      mockRecommendations.forEach((job, index) => {
        console.log(`\n${index + 1}. ${job.title} at ${job.company}`);
        console.log(`   Match Score: ${job.matchScore}%`);
        console.log(`   Location: ${job.location}`);
        console.log(`   Type: ${job.jobType}`);
        console.log(`   Reasoning: ${job.reasoning}`);
        console.log(`   Key Benefits: ${job.keyBenefits.join(', ')}`);
      });
    }

    // Step 6: Simulate job interaction notifications
    console.log('\n📱 Step 6: Simulating job interaction notifications...');
    
    const interactionNotifications = [
      {
        id: `job-viewed-${Date.now()}`,
        title: "Job Viewed",
        message: "You viewed the Software Engineer Intern position at TechCorp.",
        type: "job-interaction",
        time: "Just now",
        read: false
      },
      {
        id: `job-applied-${Date.now()}`,
        title: "Job Applied",
        message: "You applied to the Full-Stack Developer position at StartupXYZ.",
        type: "job-interaction",
        time: "Just now",
        read: false
      },
      {
        id: `job-saved-${Date.now()}`,
        title: "Job Saved",
        message: "You saved the Junior Software Engineer position at BigTech Inc.",
        type: "job-interaction",
        time: "Just now",
        read: false
      }
    ];

    console.log('📬 Job interaction notifications:');
    interactionNotifications.forEach(notification => {
      console.log(`  • ${notification.title}: ${notification.message}`);
    });

    // Step 7: Show system statistics
    console.log('\n📊 Step 7: System Statistics:');
    console.log('============================');
    
    const stats = await ragService.getRAGStats();
    console.log(`Jobs with Embeddings: ${stats.jobs.withEmbeddings}/${stats.jobs.total}`);
    console.log(`Students with Embeddings: ${stats.embeddings.students.withEmbeddings}/${stats.embeddings.students.total}`);
    console.log(`System Status: ${stats.systemStatus}`);

    console.log('\n🎉 Resume Matching Demo completed successfully!');
    console.log('\n💡 Key Features Demonstrated:');
    console.log('• ✅ Automatic resume analysis and profile update');
    console.log('• ✅ Real-time notification center updates');
    console.log('• ✅ RAG-powered job recommendations');
    console.log('• ✅ AI-generated explanations for each match');
    console.log('• ✅ Job interaction tracking and notifications');
    console.log('• ✅ Seamless workflow from resume upload to job matching');

    console.log('\n🚀 Next Steps:');
    console.log('1. Upload a resume in the frontend');
    console.log('2. Watch the notification center update automatically');
    console.log('3. Check the "Matching Jobs" tab for AI recommendations');
    console.log('4. Interact with jobs to see real-time notifications');

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
demoResumeMatching();

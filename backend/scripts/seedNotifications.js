/*
============================================================================
FILE: backend/scripts/seedNotifications.js
============================================================================
PURPOSE:
  Script to seed the database with sample notifications for testing.
  Creates various types of notifications to demonstrate the system.

USAGE:
  node scripts/seedNotifications.js
============================================================================
*/

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Notification from '../models/Notification.js';

// Load environment variables
dotenv.config();

const sampleNotifications = [
  {
    studentId: new mongoose.Types.ObjectId(),
    title: "New Job Match: Software Engineer Intern",
    message: "We found a 92% match for you at Google. Full-stack development internship with React and Node.js.",
    type: "job-match",
    relatedJobId: new mongoose.Types.ObjectId(),
    priority: "high",
    read: false,
    metadata: {
      source: "job-matcher",
      campaign: "summer-internships-2024"
    }
  },
  {
    studentId: new mongoose.Types.ObjectId(),
    title: "Resume Review Complete",
    message: "Your Software Engineer resume scored 8.2/10. Great technical skills, consider adding more project details.",
    type: "resume-analysis",
    priority: "medium",
    read: false,
    metadata: {
      source: "ai-analyzer",
      campaign: "resume-optimization"
    }
  },
  {
    studentId: new mongoose.Types.ObjectId(),
    title: "New Job Match: Data Science Intern",
    message: "Microsoft has a 87% match for you. Machine learning and Python experience required.",
    type: "job-match",
    relatedJobId: new mongoose.Types.ObjectId(),
    priority: "high",
    read: false,
    metadata: {
      source: "job-matcher",
      campaign: "data-science-roles"
    }
  },
  {
    studentId: new mongoose.Types.ObjectId(),
    title: "Mentorship Opportunity",
    message: "Sarah Chen, Senior Software Engineer at Google, is available for mentorship. 94% compatibility match.",
    type: "mentorship",
    priority: "medium",
    read: true,
    metadata: {
      source: "mentorship-matcher",
      campaign: "tech-mentors-2024"
    }
  },
  {
    studentId: new mongoose.Types.ObjectId(),
    title: "Project Recommendation",
    message: "Consider building a React Native mobile app to boost your portfolio. High demand in the job market.",
    type: "projects",
    priority: "low",
    read: false,
    metadata: {
      source: "ai-coach",
      campaign: "portfolio-building"
    }
  },
  {
    studentId: new mongoose.Types.ObjectId(),
    title: "Skill Development Alert",
    message: "AWS Cloud Services is trending in job postings. Consider learning it to increase your marketability.",
    type: "skills",
    priority: "medium",
    read: false,
    metadata: {
      source: "skill-tracker",
      campaign: "emerging-skills"
    }
  },
  {
    studentId: new mongoose.Types.ObjectId(),
    title: "Course Recommendation",
    message: "Advanced Data Structures and Algorithms course is highly recommended for your career path.",
    type: "roadmap",
    priority: "high",
    read: false,
    metadata: {
      source: "academic-advisor",
      campaign: "fall-2024-courses"
    }
  },
  {
    studentId: new mongoose.Types.ObjectId(),
    title: "System Maintenance",
    message: "Scheduled maintenance on Sunday 2AM-4AM. Some features may be temporarily unavailable.",
    type: "system",
    priority: "low",
    read: true,
    metadata: {
      source: "system",
      campaign: "maintenance-notice"
    }
  }
];

async function seedNotifications() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eagleai-jobs');
    console.log('Connected to MongoDB');

    // Clear existing notifications
    await Notification.deleteMany({});
    console.log('Cleared existing notifications');

    // Insert sample notifications
    const createdNotifications = await Notification.insertMany(sampleNotifications);
    console.log(`Created ${createdNotifications.length} sample notifications`);

    // Display summary
    const stats = await Notification.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] } }
        }
      }
    ]);

    console.log('\nNotification Summary:');
    stats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count} total, ${stat.unread} unread`);
    });

    console.log('\nSeeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding notifications:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedNotifications();

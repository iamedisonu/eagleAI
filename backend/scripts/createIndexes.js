/*
============================================================================
FILE: backend/scripts/createIndexes.js
============================================================================
PURPOSE:
  Create database indexes for optimal query performance.
  Implements compound indexes, text indexes, and sparse indexes for common queries.

FEATURES:
  - Job collection indexes for matching and filtering
  - Student collection indexes for profile queries
  - Notification collection indexes for user notifications
  - Text search indexes for full-text search
  - Compound indexes for complex queries
============================================================================
*/

import mongoose from 'mongoose';
import Job from '../models/Job.js';
import Student from '../models/Student.js';
import Notification from '../models/Notification.js';
import logger from '../utils/logger.js';

class DatabaseIndexer {
  constructor() {
    this.connection = null;
  }

  /**
   * Connect to MongoDB
   */
  async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/eagleai';
      this.connection = await mongoose.connect(mongoUri);
      logger.info('Connected to MongoDB for indexing');
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  /**
   * Create Job collection indexes
   */
  async createJobIndexes() {
    try {
      logger.info('Creating Job collection indexes...');

      // Basic indexes
      await Job.collection.createIndex({ title: 1 });
      await Job.collection.createIndex({ company: 1 });
      await Job.collection.createIndex({ location: 1 });
      await Job.collection.createIndex({ jobType: 1 });
      await Job.collection.createIndex({ status: 1 });
      await Job.collection.createIndex({ postedDate: -1 });
      await Job.collection.createIndex({ createdAt: -1 });
      await Job.collection.createIndex({ updatedAt: -1 });

      // Compound indexes for common queries
      await Job.collection.createIndex({ 
        status: 1, 
        postedDate: -1 
      });
      
      await Job.collection.createIndex({ 
        jobType: 1, 
        location: 1, 
        status: 1 
      });
      
      await Job.collection.createIndex({ 
        company: 1, 
        status: 1, 
        postedDate: -1 
      });

      // Text search index for job search
      await Job.collection.createIndex({
        title: 'text',
        company: 'text',
        description: 'text',
        requirements: 'text',
        skills: 'text'
      }, {
        weights: {
          title: 10,
          company: 8,
          skills: 6,
          requirements: 4,
          description: 2
        },
        name: 'job_text_search'
      });

      // Index for job matching queries
      await Job.collection.createIndex({ 
        'matchedStudents.studentId': 1, 
        'matchedStudents.matchScore': -1 
      });
      
      await Job.collection.createIndex({ 
        'matchedStudents.studentId': 1, 
        'matchedStudents.status': 1 
      });

      // Index for job categories and filters
      await Job.collection.createIndex({ categories: 1 });
      await Job.collection.createIndex({ isRemote: 1 });
      await Job.collection.createIndex({ salaryMin: 1, salaryMax: 1 });

      // Sparse index for URL validation
      await Job.collection.createIndex({ 
        'urlStatus.isValid': 1 
      }, { 
        sparse: true 
      });

      // Index for job expiration
      await Job.collection.createIndex({ 
        expiresAt: 1 
      }, { 
        sparse: true,
        expireAfterSeconds: 0 
      });

      logger.info('Job collection indexes created successfully');
    } catch (error) {
      logger.error('Error creating Job indexes:', error);
      throw error;
    }
  }

  /**
   * Create Student collection indexes
   */
  async createStudentIndexes() {
    try {
      logger.info('Creating Student collection indexes...');

      // Basic indexes
      await Student.collection.createIndex({ email: 1 }, { unique: true });
      await Student.collection.createIndex({ studentId: 1 }, { unique: true, sparse: true });
      await Student.collection.createIndex({ name: 1 });
      await Student.collection.createIndex({ university: 1 });
      await Student.collection.createIndex({ major: 1 });
      await Student.collection.createIndex({ graduationYear: 1 });
      await Student.collection.createIndex({ isActive: 1 });
      await Student.collection.createIndex({ createdAt: -1 });
      await Student.collection.createIndex({ lastLogin: -1 });

      // Compound indexes for profile queries
      await Student.collection.createIndex({ 
        university: 1, 
        major: 1, 
        isActive: 1 
      });
      
      await Student.collection.createIndex({ 
        graduationYear: 1, 
        university: 1, 
        isActive: 1 
      });

      // Text search index for student search
      await Student.collection.createIndex({
        name: 'text',
        email: 'text',
        university: 'text',
        major: 'text',
        skills: 'text',
        interests: 'text'
      }, {
        weights: {
          name: 10,
          email: 8,
          university: 6,
          major: 6,
          skills: 4,
          interests: 2
        },
        name: 'student_text_search'
      });

      // Index for job matches
      await Student.collection.createIndex({ 
        'jobMatches.jobId': 1, 
        'jobMatches.status': 1 
      });
      
      await Student.collection.createIndex({ 
        'jobMatches.jobId': 1, 
        'jobMatches.applicationStatus': 1 
      });

      // Index for skills and interests
      await Student.collection.createIndex({ skills: 1 });
      await Student.collection.createIndex({ interests: 1 });
      await Student.collection.createIndex({ careerGoals: 1 });

      // Index for profile completion
      await Student.collection.createIndex({ profileCompletion: -1 });

      // Sparse index for resume file
      await Student.collection.createIndex({ 
        'resumeFile.s3Key': 1 
      }, { 
        sparse: true 
      });

      // Index for authentication
      await Student.collection.createIndex({ 
        failedLoginAttempts: 1, 
        lockedUntil: 1 
      });

      logger.info('Student collection indexes created successfully');
    } catch (error) {
      logger.error('Error creating Student indexes:', error);
      throw error;
    }
  }

  /**
   * Create Notification collection indexes
   */
  async createNotificationIndexes() {
    try {
      logger.info('Creating Notification collection indexes...');

      // Basic indexes
      await Notification.collection.createIndex({ userId: 1 });
      await Notification.collection.createIndex({ type: 1 });
      await Notification.collection.createIndex({ status: 1 });
      await Notification.collection.createIndex({ createdAt: -1 });
      await Notification.collection.createIndex({ readAt: 1 });

      // Compound indexes for user notifications
      await Notification.collection.createIndex({ 
        userId: 1, 
        status: 1, 
        createdAt: -1 
      });
      
      await Notification.collection.createIndex({ 
        userId: 1, 
        type: 1, 
        status: 1 
      });

      // Index for notification cleanup
      await Notification.collection.createIndex({ 
        createdAt: 1 
      }, { 
        expireAfterSeconds: 30 * 24 * 60 * 60 // 30 days
      });

      // Sparse index for read notifications
      await Notification.collection.createIndex({ 
        readAt: 1 
      }, { 
        sparse: true 
      });

      logger.info('Notification collection indexes created successfully');
    } catch (error) {
      logger.error('Error creating Notification indexes:', error);
      throw error;
    }
  }

  /**
   * Create all indexes
   */
  async createAllIndexes() {
    try {
      await this.connect();
      
      await this.createJobIndexes();
      await this.createStudentIndexes();
      await this.createNotificationIndexes();
      
      logger.info('All database indexes created successfully');
    } catch (error) {
      logger.error('Error creating database indexes:', error);
      throw error;
    } finally {
      if (this.connection) {
        await mongoose.disconnect();
        logger.info('Disconnected from MongoDB');
      }
    }
  }

  /**
   * List all indexes for a collection
   * @param {string} collectionName - Collection name
   */
  async listIndexes(collectionName) {
    try {
      await this.connect();
      
      const collection = mongoose.connection.db.collection(collectionName);
      const indexes = await collection.indexes();
      
      logger.info(`Indexes for ${collectionName}:`);
      indexes.forEach((index, i) => {
        logger.info(`${i + 1}. ${index.name}: ${JSON.stringify(index.key)}`);
      });
      
    } catch (error) {
      logger.error(`Error listing indexes for ${collectionName}:`, error);
    } finally {
      if (this.connection) {
        await mongoose.disconnect();
      }
    }
  }

  /**
   * Drop all indexes for a collection
   * @param {string} collectionName - Collection name
   */
  async dropIndexes(collectionName) {
    try {
      await this.connect();
      
      const collection = mongoose.connection.db.collection(collectionName);
      await collection.dropIndexes();
      
      logger.info(`All indexes dropped for ${collectionName}`);
      
    } catch (error) {
      logger.error(`Error dropping indexes for ${collectionName}:`, error);
    } finally {
      if (this.connection) {
        await mongoose.disconnect();
      }
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const indexer = new DatabaseIndexer();
  const command = process.argv[2];
  
  switch (command) {
    case 'create':
      indexer.createAllIndexes()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    case 'list':
      const collection = process.argv[3] || 'jobs';
      indexer.listIndexes(collection)
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    case 'drop':
      const collectionToDrop = process.argv[3] || 'jobs';
      indexer.dropIndexes(collectionToDrop)
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    default:
      console.log('Usage: node createIndexes.js [create|list|drop] [collection]');
      process.exit(1);
  }
}

export default DatabaseIndexer;

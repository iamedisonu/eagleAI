/*
============================================================================
FILE: backend/services/VectorEmbeddings.js
============================================================================
PURPOSE:
  Service for generating and managing vector embeddings for jobs and student
  profiles. Enables semantic search and RAG-based recommendations.

FEATURES:
  - Text embedding generation using OpenAI/Google AI
  - Vector similarity search
  - Embedding storage and retrieval
  - Batch processing for large datasets
  - Caching for performance optimization

TECHNOLOGY:
  - OpenAI text-embedding-ada-002 or Google AI embeddings
  - Vector similarity using cosine similarity
  - MongoDB for embedding storage
  - Redis for caching (optional)
============================================================================
*/

import { GoogleGenerativeAI } from '@google/generative-ai';
import Job from '../models/Job.js';
import Student from '../models/Student.js';
import logger from '../utils/logger.js';

class VectorEmbeddings {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    this.embeddingModel = this.genAI.getGenerativeModel({ 
      model: 'text-embedding-004' // Google's latest embedding model
    });
    this.embeddingCache = new Map();
    this.batchSize = 10; // Process embeddings in batches
  }

  /**
   * Generate embedding for a single text
   */
  async generateEmbedding(text) {
    try {
      // Check cache first
      const cacheKey = this.getCacheKey(text);
      if (this.embeddingCache.has(cacheKey)) {
        return this.embeddingCache.get(cacheKey);
      }

      // Clean and prepare text
      const cleanText = this.cleanText(text);
      if (!cleanText || cleanText.length < 10) {
        throw new Error('Text too short for embedding');
      }

      // Generate embedding
      const result = await this.embeddingModel.embedContent(cleanText);
      const embedding = result.embedding.values;

      // Cache the result
      this.embeddingCache.set(cacheKey, embedding);
      
      logger.debug(`Generated embedding for text: ${cleanText.substring(0, 50)}...`);
      return embedding;

    } catch (error) {
      logger.error('Error generating embedding:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts in batch
   */
  async generateBatchEmbeddings(texts) {
    const embeddings = [];
    
    for (let i = 0; i < texts.length; i += this.batchSize) {
      const batch = texts.slice(i, i + this.batchSize);
      const batchPromises = batch.map(text => this.generateEmbedding(text));
      
      try {
        const batchEmbeddings = await Promise.all(batchPromises);
        embeddings.push(...batchEmbeddings);
        
        // Add delay between batches to respect rate limits
        if (i + this.batchSize < texts.length) {
          await this.delay(1000);
        }
      } catch (error) {
        logger.error(`Error processing batch ${i}-${i + this.batchSize}:`, error);
        // Add null embeddings for failed texts
        embeddings.push(...new Array(batch.length).fill(null));
      }
    }

    return embeddings;
  }

  /**
   * Generate job embedding from job data
   */
  async generateJobEmbedding(job) {
    const jobText = this.buildJobText(job);
    return await this.generateEmbedding(jobText);
  }

  /**
   * Generate student profile embedding
   */
  async generateStudentEmbedding(student) {
    const studentText = this.buildStudentText(student);
    return await this.generateEmbedding(studentText);
  }

  /**
   * Build comprehensive text representation of a job
   */
  buildJobText(job) {
    const parts = [
      `Title: ${job.title}`,
      `Company: ${job.company}`,
      `Location: ${job.location}`,
      `Description: ${job.description}`,
      `Job Type: ${job.jobType}`,
      `Experience Level: ${job.experienceLevel || 'entry'}`,
      `Categories: ${job.categories?.join(', ') || ''}`,
      `Skills: ${job.skills?.join(', ') || ''}`,
      `Requirements: ${job.requirements?.join('. ') || ''}`,
      `Remote: ${job.isRemote ? 'Yes' : 'No'}`,
      `Salary: ${job.salaryRange ? `$${job.salaryRange.min}-${job.salaryRange.max}` : 'Not specified'}`
    ];

    return parts.filter(part => part && part.length > 0).join('\n');
  }

  /**
   * Build comprehensive text representation of a student
   */
  buildStudentText(student) {
    const parts = [
      `Name: ${student.name}`,
      `Major: ${student.major}`,
      `University: ${student.university}`,
      `Graduation Year: ${student.graduationYear}`,
      `Skills: ${student.skills?.join(', ') || ''}`,
      `Interests: ${student.interests?.join(', ') || ''}`,
      `Experience: ${student.experience?.join('. ') || ''}`,
      `Projects: ${student.projects?.map(p => `${p.title}: ${p.description}`).join('. ') || ''}`,
      `Career Goals: ${student.careerGoals || ''}`,
      `Preferred Job Types: ${student.preferredJobTypes?.join(', ') || ''}`,
      `Preferred Locations: ${student.preferredLocations?.join(', ') || ''}`,
      `Resume Summary: ${student.resumeSummary || ''}`
    ];

    return parts.filter(part => part && part.length > 0).join('\n');
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  calculateCosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * Find similar jobs using vector similarity
   */
  async findSimilarJobs(jobId, limit = 10) {
    try {
      const job = await Job.findById(jobId);
      if (!job || !job.embedding) {
        throw new Error('Job not found or no embedding available');
      }

      // Find jobs with embeddings
      const jobs = await Job.find({ 
        _id: { $ne: jobId },
        embedding: { $exists: true },
        status: 'active'
      });

      // Calculate similarities
      const similarities = jobs.map(otherJob => ({
        job: otherJob,
        similarity: this.calculateCosineSimilarity(job.embedding, otherJob.embedding)
      }));

      // Sort by similarity and return top results
      return similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .map(item => ({
          ...item.job.toObject(),
          similarity: item.similarity
        }));

    } catch (error) {
      logger.error('Error finding similar jobs:', error);
      throw error;
    }
  }

  /**
   * Find jobs matching student profile using vector similarity
   */
  async findJobsForStudent(studentId, limit = 20) {
    try {
      const student = await Student.findById(studentId);
      if (!student || !student.embedding) {
        throw new Error('Student not found or no embedding available');
      }

      // Find active jobs with embeddings
      const jobs = await Job.find({ 
        embedding: { $exists: true },
        status: 'active'
      });

      // Calculate similarities
      const similarities = jobs.map(job => ({
        job,
        similarity: this.calculateCosineSimilarity(student.embedding, job.embedding)
      }));

      // Sort by similarity and return top results
      return similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .map(item => ({
          ...item.job.toObject(),
          matchScore: Math.round(item.similarity * 100)
        }));

    } catch (error) {
      logger.error('Error finding jobs for student:', error);
      throw error;
    }
  }

  /**
   * Update job embeddings for all jobs
   */
  async updateAllJobEmbeddings() {
    try {
      logger.info('Starting job embeddings update...');
      
      const jobs = await Job.find({ status: 'active' });
      const totalJobs = jobs.length;
      let processed = 0;
      let errors = 0;

      for (let i = 0; i < jobs.length; i += this.batchSize) {
        const batch = jobs.slice(i, i + this.batchSize);
        
        try {
          const jobTexts = batch.map(job => this.buildJobText(job));
          const embeddings = await this.generateBatchEmbeddings(jobTexts);

          // Update jobs with embeddings
          for (let j = 0; j < batch.length; j++) {
            if (embeddings[j]) {
              batch[j].embedding = embeddings[j];
              batch[j].embeddingUpdatedAt = new Date();
              await batch[j].save();
              processed++;
            } else {
              errors++;
            }
          }

          logger.info(`Processed ${processed}/${totalJobs} jobs (${errors} errors)`);
          
          // Rate limiting
          if (i + this.batchSize < jobs.length) {
            await this.delay(2000);
          }

        } catch (error) {
          logger.error(`Error processing batch ${i}-${i + this.batchSize}:`, error);
          errors += batch.length;
        }
      }

      logger.info(`Job embeddings update completed. Processed: ${processed}, Errors: ${errors}`);
      return { processed, errors, total: totalJobs };

    } catch (error) {
      logger.error('Error updating job embeddings:', error);
      throw error;
    }
  }

  /**
   * Update student embeddings for all students
   */
  async updateAllStudentEmbeddings() {
    try {
      logger.info('Starting student embeddings update...');
      
      const students = await Student.find({});
      const totalStudents = students.length;
      let processed = 0;
      let errors = 0;

      for (let i = 0; i < students.length; i += this.batchSize) {
        const batch = students.slice(i, i + this.batchSize);
        
        try {
          const studentTexts = batch.map(student => this.buildStudentText(student));
          const embeddings = await this.generateBatchEmbeddings(studentTexts);

          // Update students with embeddings
          for (let j = 0; j < batch.length; j++) {
            if (embeddings[j]) {
              batch[j].embedding = embeddings[j];
              batch[j].embeddingUpdatedAt = new Date();
              await batch[j].save();
              processed++;
            } else {
              errors++;
            }
          }

          logger.info(`Processed ${processed}/${totalStudents} students (${errors} errors)`);
          
          // Rate limiting
          if (i + this.batchSize < students.length) {
            await this.delay(2000);
          }

        } catch (error) {
          logger.error(`Error processing batch ${i}-${i + this.batchSize}:`, error);
          errors += batch.length;
        }
      }

      logger.info(`Student embeddings update completed. Processed: ${processed}, Errors: ${errors}`);
      return { processed, errors, total: totalStudents };

    } catch (error) {
      logger.error('Error updating student embeddings:', error);
      throw error;
    }
  }

  /**
   * Clean text for embedding generation
   */
  cleanText(text) {
    if (!text) return '';
    
    return text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\w\s.,!?-]/g, '') // Remove special characters except basic punctuation
      .trim()
      .substring(0, 8000); // Limit length for API constraints
  }

  /**
   * Generate cache key for text
   */
  getCacheKey(text) {
    return Buffer.from(text).toString('base64').substring(0, 50);
  }

  /**
   * Utility method for delays
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get embedding statistics
   */
  async getEmbeddingStats() {
    const jobStats = await Job.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          withEmbeddings: { $sum: { $cond: [{ $ifNull: ['$embedding', false] }, 1, 0] } }
        }
      }
    ]);

    const studentStats = await Student.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          withEmbeddings: { $sum: { $cond: [{ $ifNull: ['$embedding', false] }, 1, 0] } }
        }
      }
    ]);

    return {
      jobs: jobStats[0] || { total: 0, withEmbeddings: 0 },
      students: studentStats[0] || { total: 0, withEmbeddings: 0 },
      cacheSize: this.embeddingCache.size
    };
  }
}

export default VectorEmbeddings;

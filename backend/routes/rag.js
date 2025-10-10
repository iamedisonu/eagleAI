/*
============================================================================
FILE: backend/routes/rag.js
============================================================================
PURPOSE:
  API routes for RAG (Retrieval-Augmented Generation) system.
  Provides endpoints for intelligent job recommendations, semantic search,
  and AI-powered career advice.

ENDPOINTS:
  - POST /api/rag/recommendations - Get personalized job recommendations
  - POST /api/rag/search - Semantic job search
  - GET /api/rag/insights/:jobId - Get job insights and analysis
  - POST /api/rag/career-advice - Get personalized career advice
  - POST /api/rag/embeddings/update - Update embeddings for jobs/students
  - GET /api/rag/stats - Get RAG system statistics
============================================================================
*/

import express from 'express';
import RAGService from '../services/RAGService.js';
import VectorEmbeddings from '../services/VectorEmbeddings.js';
import Job from '../models/Job.js';
import Student from '../models/Student.js';
import logger from '../utils/logger.js';

const router = express.Router();
const ragService = new RAGService();
const vectorEmbeddings = new VectorEmbeddings();

// Middleware for error handling
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * POST /api/rag/recommendations
 * Get personalized job recommendations with RAG
 */
router.post('/recommendations', asyncHandler(async (req, res) => {
  const { studentId, options = {} } = req.body;

  if (!studentId) {
    return res.status(400).json({
      success: false,
      message: 'Student ID is required'
    });
  }

  try {
    const recommendations = await ragService.generateJobRecommendations(studentId, options);
    
    res.json({
      success: true,
      data: recommendations,
      message: 'Job recommendations generated successfully'
    });

  } catch (error) {
    logger.error('Error generating recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations',
      error: error.message
    });
  }
}));

/**
 * POST /api/rag/search
 * Semantic job search using vector embeddings
 */
router.post('/search', asyncHandler(async (req, res) => {
  const { query, options = {} } = req.body;

  if (!query || query.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
  }

  try {
    const results = await ragService.semanticJobSearch(query, options);
    
    res.json({
      success: true,
      data: {
        results,
        query,
        totalResults: results.length
      },
      message: 'Semantic search completed successfully'
    });

  } catch (error) {
    logger.error('Error in semantic search:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
}));

/**
 * GET /api/rag/insights/:jobId
 * Get detailed job insights and analysis
 */
router.get('/insights/:jobId', asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { studentId } = req.query;

  if (!jobId) {
    return res.status(400).json({
      success: false,
      message: 'Job ID is required'
    });
  }

  try {
    const insights = await ragService.generateJobInsights(jobId, studentId);
    
    res.json({
      success: true,
      data: {
        jobId,
        insights,
        generatedAt: new Date()
      },
      message: 'Job insights generated successfully'
    });

  } catch (error) {
    logger.error('Error generating job insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate insights',
      error: error.message
    });
  }
}));

/**
 * POST /api/rag/career-advice
 * Get personalized career advice
 */
router.post('/career-advice', asyncHandler(async (req, res) => {
  const { studentId, focusArea } = req.body;

  if (!studentId) {
    return res.status(400).json({
      success: false,
      message: 'Student ID is required'
    });
  }

  try {
    const advice = await ragService.generateCareerAdvice(studentId, focusArea);
    
    res.json({
      success: true,
      data: {
        advice,
        studentId,
        focusArea,
        generatedAt: new Date()
      },
      message: 'Career advice generated successfully'
    });

  } catch (error) {
    logger.error('Error generating career advice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate career advice',
      error: error.message
    });
  }
}));

/**
 * POST /api/rag/embeddings/update
 * Update embeddings for jobs or students
 */
router.post('/embeddings/update', asyncHandler(async (req, res) => {
  const { type, batchSize = 50 } = req.body;

  if (!type || !['jobs', 'students', 'all'].includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Type must be "jobs", "students", or "all"'
    });
  }

  try {
    let results = {};

    if (type === 'jobs' || type === 'all') {
      logger.info('Updating job embeddings...');
      results.jobs = await vectorEmbeddings.updateAllJobEmbeddings();
    }

    if (type === 'students' || type === 'all') {
      logger.info('Updating student embeddings...');
      results.students = await vectorEmbeddings.updateAllStudentEmbeddings();
    }

    res.json({
      success: true,
      data: results,
      message: 'Embeddings updated successfully'
    });

  } catch (error) {
    logger.error('Error updating embeddings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update embeddings',
      error: error.message
    });
  }
}));

/**
 * GET /api/rag/stats
 * Get RAG system statistics
 */
router.get('/stats', asyncHandler(async (req, res) => {
  try {
    const stats = await ragService.getRAGStats();
    
    res.json({
      success: true,
      data: stats,
      message: 'RAG statistics retrieved successfully'
    });

  } catch (error) {
    logger.error('Error getting RAG stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message
    });
  }
}));

/**
 * POST /api/rag/similar-jobs/:jobId
 * Find similar jobs using vector similarity
 */
router.post('/similar-jobs/:jobId', asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { limit = 10 } = req.body;

  if (!jobId) {
    return res.status(400).json({
      success: false,
      message: 'Job ID is required'
    });
  }

  try {
    const similarJobs = await vectorEmbeddings.findSimilarJobs(jobId, limit);
    
    res.json({
      success: true,
      data: {
        jobId,
        similarJobs,
        totalResults: similarJobs.length
      },
      message: 'Similar jobs found successfully'
    });

  } catch (error) {
    logger.error('Error finding similar jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find similar jobs',
      error: error.message
    });
  }
}));

/**
 * POST /api/rag/student-matches/:studentId
 * Find jobs matching student profile using vector similarity
 */
router.post('/student-matches/:studentId', asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { limit = 20 } = req.body;

  if (!studentId) {
    return res.status(400).json({
      success: false,
      message: 'Student ID is required'
    });
  }

  try {
    const matches = await vectorEmbeddings.findJobsForStudent(studentId, limit);
    
    res.json({
      success: true,
      data: {
        studentId,
        matches,
        totalResults: matches.length
      },
      message: 'Student job matches found successfully'
    });

  } catch (error) {
    logger.error('Error finding student matches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find student matches',
      error: error.message
    });
  }
}));

/**
 * POST /api/rag/embedding/:type/:id
 * Generate embedding for a specific job or student
 */
router.post('/embedding/:type/:id', asyncHandler(async (req, res) => {
  const { type, id } = req.params;

  if (!['job', 'student'].includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Type must be "job" or "student"'
    });
  }

  try {
    let entity, embedding;

    if (type === 'job') {
      entity = await Job.findById(id);
      if (!entity) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }
      embedding = await vectorEmbeddings.generateJobEmbedding(entity);
    } else {
      entity = await Student.findById(id);
      if (!entity) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }
      embedding = await vectorEmbeddings.generateStudentEmbedding(entity);
    }

    // Update entity with embedding
    entity.embedding = embedding;
    entity.embeddingUpdatedAt = new Date();
    await entity.save();

    res.json({
      success: true,
      data: {
        type,
        id,
        embeddingLength: embedding.length,
        updatedAt: entity.embeddingUpdatedAt
      },
      message: 'Embedding generated and saved successfully'
    });

  } catch (error) {
    logger.error('Error generating embedding:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate embedding',
      error: error.message
    });
  }
}));

export default router;

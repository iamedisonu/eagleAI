/*
============================================================================
FILE: backend/routes/matching.js
============================================================================
PURPOSE:
  REST API routes for job matching operations including triggering matches,
  getting matching statistics, and managing the matching process.

ENDPOINTS:
  POST /api/matching/match - Trigger manual matching process
  GET /api/matching/stats - Get matching statistics
  GET /api/matching/status - Get matching process status
  POST /api/matching/match-student - Match specific student
============================================================================
*/

import express from 'express';
import ResumeMatcher from '../services/ResumeMatcher.js';
import Student from '../models/Student.js';
import Job from '../models/Job.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Initialize resume matcher
const resumeMatcher = new ResumeMatcher();

// POST /api/matching/match - Trigger manual matching process
router.post('/match', async (req, res) => {
  try {
    logger.info('Manual matching process triggered');
    
    const result = await resumeMatcher.matchAllStudents();
    
    res.json({
      message: 'Matching process completed successfully',
      processedStudents: result.processedStudents,
      totalMatches: result.totalMatches
    });

  } catch (error) {
    logger.error('Error in manual matching process:', error);
    res.status(500).json({ error: 'Failed to complete matching process' });
  }
});

// POST /api/matching/match-student - Match specific student
router.post('/match-student', async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const matchCount = await resumeMatcher.matchStudent(student);
    
    res.json({
      message: 'Student matching completed successfully',
      studentId,
      matchesFound: matchCount
    });

  } catch (error) {
    logger.error('Error matching specific student:', error);
    res.status(500).json({ error: 'Failed to match student' });
  }
});

// GET /api/matching/stats - Get matching statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await resumeMatcher.getMatchingStats();
    
    // Get additional statistics
    const [totalStudents, totalJobs, totalNotifications] = await Promise.all([
      Student.countDocuments({ isActive: true }),
      Job.countDocuments({ status: 'active' }),
      // Add notification count if needed
      Promise.resolve(0)
    ]);

    res.json({
      ...stats,
      totalStudents,
      totalJobs,
      totalNotifications,
      matchingRate: stats.totalStudents > 0 ? 
        (stats.totalMatches / stats.totalStudents).toFixed(2) : 0
    });

  } catch (error) {
    logger.error('Error fetching matching stats:', error);
    res.status(500).json({ error: 'Failed to fetch matching statistics' });
  }
});

// GET /api/matching/status - Get matching process status
router.get('/status', async (req, res) => {
  try {
    // This would track if matching is currently in progress
    // For now, return basic status
    res.json({
      isRunning: false, // Would be tracked in a real implementation
      lastRun: new Date().toISOString(),
      nextScheduled: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours from now
    });

  } catch (error) {
    logger.error('Error fetching matching status:', error);
    res.status(500).json({ error: 'Failed to fetch matching status' });
  }
});

// GET /api/matching/students/:id/recommendations - Get job recommendations for student
router.get('/students/:id/recommendations', async (req, res) => {
  try {
    const { id: studentId } = req.params;
    const { limit = 10 } = req.query;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get jobs that match student preferences but haven't been matched yet
    const query = { 
      status: 'active',
      'matchedStudents.studentId': { $ne: studentId }
    };

    // Filter by student preferences
    if (student.jobPreferences?.categories?.length > 0) {
      query.categories = { $in: student.jobPreferences.categories };
    }

    if (student.jobPreferences?.jobTypes?.length > 0) {
      query.jobType = { $in: student.jobPreferences.jobTypes };
    }

    const jobs = await Job.find(query)
      .sort({ postedDate: -1 })
      .limit(parseInt(limit))
      .lean();

    // Calculate match scores for recommendations
    const recommendations = await Promise.all(
      jobs.map(async (job) => {
        const matchScore = await resumeMatcher.calculateMatchScore(student, job);
        return {
          ...job,
          matchScore,
          isRecommended: matchScore >= resumeMatcher.minMatchScore
        };
      })
    );

    // Filter and sort by match score
    const filteredRecommendations = recommendations
      .filter(rec => rec.isRecommended)
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      recommendations: filteredRecommendations,
      totalFound: filteredRecommendations.length
    });

  } catch (error) {
    logger.error('Error fetching job recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch job recommendations' });
  }
});

// GET /api/matching/jobs/:id/students - Get students matched to a specific job
router.get('/jobs/:id/students', async (req, res) => {
  try {
    const { id: jobId } = req.params;
    const { limit = 20 } = req.query;

    const job = await Job.findById(jobId)
      .populate('matchedStudents.studentId', 'name email university major skills')
      .lean();

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const matchedStudents = job.matchedStudents
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, parseInt(limit))
      .map(match => ({
        ...match.studentId,
        matchScore: match.matchScore,
        matchedAt: match.matchedAt,
        notificationSent: match.notificationSent
      }));

    res.json({
      job: {
        id: job._id,
        title: job.title,
        company: job.company
      },
      matchedStudents
    });

  } catch (error) {
    logger.error('Error fetching job matches:', error);
    res.status(500).json({ error: 'Failed to fetch job matches' });
  }
});

export default router;


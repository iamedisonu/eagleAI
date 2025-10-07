/*
============================================================================
FILE: backend/routes/jobs.js
============================================================================
PURPOSE:
  REST API routes for job-related operations including listing, searching,
  filtering, and job details.

ENDPOINTS:
  GET /api/jobs - List jobs with filtering and pagination
  GET /api/jobs/:id - Get specific job details
  GET /api/jobs/search - Search jobs by keywords
  GET /api/jobs/categories - Get available job categories
  POST /api/jobs/scrape - Trigger manual job scraping
============================================================================
*/

import express from 'express';
import Job from '../models/Job.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GET /api/jobs - List jobs with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      jobType,
      location,
      search,
      sortBy = 'postedDate',
      sortOrder = 'desc',
      minMatchScore
    } = req.query;

    // Build query
    const query = { status: 'active' };
    
    if (category) {
      query.categories = { $in: category.split(',') };
    }
    
    if (jobType) {
      query.jobType = { $in: jobType.split(',') };
    }
    
    if (location) {
      query.$or = [
        { location: { $regex: location, $options: 'i' } },
        { isRemote: true }
      ];
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (minMatchScore) {
      query.matchScore = { $gte: parseInt(minMatchScore) };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [jobs, total] = await Promise.all([
      Job.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('matchedStudents.studentId', 'name email')
        .lean(),
      Job.countDocuments(query)
    ]);

    res.json({
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    logger.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// GET /api/jobs/:id - Get specific job details
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('matchedStudents.studentId', 'name email university major')
      .lean();

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);

  } catch (error) {
    logger.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// GET /api/jobs/search - Search jobs by keywords
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const jobs = await Job.find({
      $text: { $search: q },
      status: 'active'
    })
    .sort({ score: { $meta: 'textScore' } })
    .limit(parseInt(limit))
    .lean();

    res.json({ jobs, query: q });

  } catch (error) {
    logger.error('Error searching jobs:', error);
    res.status(500).json({ error: 'Failed to search jobs' });
  }
});

// GET /api/jobs/categories - Get available job categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Job.distinct('categories');
    const jobTypes = await Job.distinct('jobType');
    const locations = await Job.distinct('location');
    
    res.json({
      categories,
      jobTypes,
      locations: locations.filter(loc => loc && loc.trim().length > 0)
    });

  } catch (error) {
    logger.error('Error fetching job metadata:', error);
    res.status(500).json({ error: 'Failed to fetch job metadata' });
  }
});

// GET /api/jobs/stats - Get job statistics
router.get('/meta/stats', async (req, res) => {
  try {
    const stats = await Job.aggregate([
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          activeJobs: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          byCategory: {
            $push: '$categories'
          },
          byType: {
            $push: '$jobType'
          },
          avgMatchScore: { $avg: '$matchScore' }
        }
      }
    ]);

    // Process category and type counts
    const categoryCounts = {};
    const typeCounts = {};
    
    if (stats[0]) {
      stats[0].byCategory.forEach(categories => {
        categories.forEach(category => {
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
      });
      
      stats[0].byType.forEach(type => {
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
    }

    res.json({
      totalJobs: stats[0]?.totalJobs || 0,
      activeJobs: stats[0]?.activeJobs || 0,
      categoryCounts,
      typeCounts,
      avgMatchScore: Math.round(stats[0]?.avgMatchScore || 0)
    });

  } catch (error) {
    logger.error('Error fetching job stats:', error);
    res.status(500).json({ error: 'Failed to fetch job statistics' });
  }
});

// POST /api/jobs/scrape - Trigger manual job scraping
router.post('/scrape', async (req, res) => {
  try {
    const jobScraper = req.app.get('jobScraper');
    
    if (!jobScraper) {
      return res.status(503).json({ error: 'Job scraper not available' });
    }

    // Check if scraping is already in progress
    if (jobScraper.isScraping) {
      return res.status(409).json({ error: 'Job scraping already in progress' });
    }

    // Start scraping in background
    jobScraper.scrapeAllSources()
      .then(() => {
        logger.info('Manual job scraping completed');
      })
      .catch(error => {
        logger.error('Manual job scraping failed:', error);
      });

    res.json({ message: 'Job scraping started' });

  } catch (error) {
    logger.error('Error starting job scraping:', error);
    res.status(500).json({ error: 'Failed to start job scraping' });
  }
});

// GET /api/jobs/scrape/status - Get scraping status
router.get('/scrape/status', async (req, res) => {
  try {
    const jobScraper = req.app.get('jobScraper');
    
    if (!jobScraper) {
      return res.status(503).json({ error: 'Job scraper not available' });
    }

    const stats = jobScraper.getStats();
    res.json(stats);

  } catch (error) {
    logger.error('Error fetching scraping status:', error);
    res.status(500).json({ error: 'Failed to fetch scraping status' });
  }
});

export default router;


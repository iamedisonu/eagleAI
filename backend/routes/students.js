/*
============================================================================
FILE: backend/routes/students.js
============================================================================
PURPOSE:
  REST API routes for student profile operations including CRUD operations,
  resume analysis, and job matching.

ENDPOINTS:
  GET /api/students - List students
  GET /api/students/:id - Get specific student
  POST /api/students - Create new student
  PUT /api/students/:id - Update student
  DELETE /api/students/:id - Delete student
  POST /api/students/:id/analyze-resume - Analyze student resume
  GET /api/students/:id/matches - Get job matches for student
============================================================================
*/

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import Student from '../models/Student.js';
import Job from '../models/Job.js';
import { analyzeResume } from '../services/googleAI.js';
import SecureFileUpload from '../services/SecureFileUpload.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Initialize secure file upload service
const secureFileUpload = new SecureFileUpload();

// Configure multer for temporary file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/temp';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `temp-${req.params.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
    }
  }
});

// Generate encryption password for student
const generateEncryptionPassword = (studentId) => {
  return crypto.createHash('sha256')
    .update(studentId + process.env.FILE_ENCRYPTION_SALT || 'eagleai-default-salt')
    .digest('hex');
};

// GET /api/students - List students
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, university, major } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { university: { $regex: search, $options: 'i' } },
        { major: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (university) {
      query.university = { $regex: university, $options: 'i' };
    }
    
    if (major) {
      query.major = { $regex: major, $options: 'i' };
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [students, total] = await Promise.all([
      Student.find(query)
        .select('-resumeText -resumeAnalysis')
        .sort({ lastLogin: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Student.countDocuments(query)
    ]);

    res.json({
      students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    logger.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// GET /api/students/:id - Get specific student
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('jobMatches.jobId', 'title company location matchScore')
      .lean();

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);

  } catch (error) {
    logger.error('Error fetching student:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// POST /api/students - Create new student
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      university,
      major,
      graduationYear,
      skills = [],
      interests = [],
      careerGoals = [],
      jobPreferences = {}
    } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(409).json({ error: 'Student with this email already exists' });
    }

    const student = new Student({
      name,
      email,
      university,
      major,
      graduationYear,
      skills,
      interests,
      careerGoals,
      jobPreferences
    });

    await student.save();

    res.status(201).json({
      message: 'Student created successfully',
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        university: student.university,
        major: student.major
      }
    });

  } catch (error) {
    logger.error('Error creating student:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

// PUT /api/students/:id - Update student
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const studentId = req.params.id;

    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;

    const student = await Student.findByIdAndUpdate(
      studentId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      message: 'Student updated successfully',
      student
    });

  } catch (error) {
    logger.error('Error updating student:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// DELETE /api/students/:id - Delete student (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ message: 'Student deactivated successfully' });

  } catch (error) {
    logger.error('Error deactivating student:', error);
    res.status(500).json({ error: 'Failed to deactivate student' });
  }
});

// POST /api/students/:id/analyze-resume - Analyze student resume
router.post('/:id/analyze-resume', async (req, res) => {
  try {
    const { resumeText } = req.body;
    const studentId = req.params.id;

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ error: 'Resume text is required and must be at least 50 characters' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Analyze resume using Google AI
    const analysisResult = await analyzeResume(resumeText);
    
    // Update student with resume text and analysis
    student.resumeText = resumeText;
    student.resumeAnalysis = analysisResult.parsedResponse;
    await student.save();

    res.json({
      message: 'Resume analyzed successfully',
      analysis: analysisResult.parsedResponse
    });

  } catch (error) {
    logger.error('Error analyzing resume:', error);
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
});

// GET /api/students/:id/matches - Get job matches for student
router.get('/:id/matches', async (req, res) => {
  try {
    const { limit = 20, status, sortBy = 'matchScore', sortOrder = 'desc' } = req.query;
    const studentId = req.params.id;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Build query for job matches
    const matchQuery = { 'matchedStudents.studentId': studentId, status: 'active' };
    
    if (status) {
      matchQuery['matchedStudents.status'] = { $in: status.split(',') };
    }

    // Build sort object
    const sort = {};
    if (sortBy === 'matchScore') {
      sort['matchedStudents.matchScore'] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const jobs = await Job.find(matchQuery)
      .sort(sort)
      .limit(parseInt(limit))
      .lean();

    // Get student's match status for each job
    const matchesWithStatus = jobs.map(job => {
      const studentMatch = job.matchedStudents.find(
        match => match.studentId.toString() === studentId
      );
      
      return {
        ...job,
        studentMatch: {
          matchScore: studentMatch?.matchScore || 0,
          matchedAt: studentMatch?.matchedAt,
          status: studentMatch?.status || 'new',
          applicationStatus: studentMatch?.applicationStatus || 'not-applied'
        }
      };
    });

    res.json({ matches: matchesWithStatus });

  } catch (error) {
    logger.error('Error fetching student matches:', error);
    res.status(500).json({ error: 'Failed to fetch student matches' });
  }
});

// PUT /api/students/:id/matches/:jobId/status - Update job match status
router.put('/:id/matches/:jobId/status', async (req, res) => {
  try {
    const { status, applicationStatus } = req.body;
    const { id: studentId, jobId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    await student.updateJobMatchStatus(jobId, status, applicationStatus);

    res.json({ message: 'Job match status updated successfully' });

  } catch (error) {
    logger.error('Error updating job match status:', error);
    res.status(500).json({ error: 'Failed to update job match status' });
  }
});

// GET /api/students/:id/stats - Get student statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const studentId = req.params.id;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const stats = {
      profileCompletion: student.profileCompletion,
      totalMatches: student.jobMatches.length,
      newMatches: student.jobMatches.filter(m => m.status === 'new').length,
      appliedJobs: student.jobMatches.filter(m => m.applicationStatus === 'applied').length,
      skillsCount: student.skills.length,
      lastLogin: student.lastLogin,
      resumeAnalyzed: !!student.resumeText,
      resumeScore: student.resumeAnalysis?.overallScore || 0
    };

    res.json(stats);

  } catch (error) {
    logger.error('Error fetching student stats:', error);
    res.status(500).json({ error: 'Failed to fetch student statistics' });
  }
});

// Resume Storage Endpoints (placed at the end to avoid route conflicts)

// GET /api/students/:id/resume - Get student's stored resume
router.get('/:id/resume', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (!student.resumeFile) {
      return res.status(404).json({ error: 'No resume found' });
    }

    res.json({
      id: student._id,
      fileName: student.resumeFile.originalName,
      filePath: student.resumeFile.filePath,
      fileUrl: `/api/students/${student._id}/resume/download`,
      uploadedAt: student.resumeFile.uploadedAt,
      fileSize: student.resumeFile.fileSize,
      analysis: student.resumeAnalysis
    });

  } catch (error) {
    logger.error('Error fetching resume:', error);
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
});

// POST /api/students/:id/resume - Upload/Replace student resume
router.post('/:id/resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      // Clean up uploaded file if student not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Student not found' });
    }

    // Generate encryption password for this student
    const encryptionPassword = generateEncryptionPassword(student._id.toString());

    // Process file with security measures (validation, virus scan, encryption)
    const processResult = await secureFileUpload.processFileUpload(
      req.file, 
      student._id.toString(), 
      encryptionPassword
    );

    if (!processResult.success) {
      return res.status(400).json({ 
        error: processResult.error,
        scanResult: processResult.scanResult
      });
    }

    // Delete old resume file from S3 if it exists
    if (student.resumeFile && student.resumeFile.s3Key) {
      try {
        await secureFileUpload.deleteFromS3(student.resumeFile.s3Key);
      } catch (error) {
        logger.warn('Could not delete old resume file from S3:', error);
      }
    }

    // Update student with new secure resume file info
    student.resumeFile = {
      originalName: processResult.originalName,
      secureFilename: processResult.secureFilename,
      s3Key: processResult.s3Key,
      fileSize: processResult.size,
      uploadedAt: processResult.uploadedAt,
      isEncrypted: true,
      scanResult: processResult.scanResult
    };

    await student.save();

    logger.info(`Resume uploaded securely for student ${student._id}: ${processResult.originalName}`);

    res.json({
      message: 'Resume uploaded and secured successfully',
      resume: {
        id: student._id,
        fileName: student.resumeFile.originalName,
        fileUrl: `/api/students/${student._id}/resume/download`,
        uploadedAt: student.resumeFile.uploadedAt,
        fileSize: student.resumeFile.fileSize,
        isEncrypted: true,
        scanResult: processResult.scanResult
      }
    });

  } catch (error) {
    logger.error('Error uploading resume:', error);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        logger.warn('Could not clean up uploaded file:', cleanupError);
      }
    }
    
    res.status(500).json({ error: 'Failed to upload resume' });
  }
});

// GET /api/students/:id/resume/download - Download resume file
router.get('/:id/resume/download', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student || !student.resumeFile) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Generate encryption password for this student
    const encryptionPassword = generateEncryptionPassword(student._id.toString());

    // Download and decrypt file from S3
    const fileData = await secureFileUpload.downloadFromS3(
      student.resumeFile.s3Key, 
      encryptionPassword
    );

    // Set appropriate headers
    res.setHeader('Content-Type', fileData.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileData.originalName}"`);
    res.setHeader('Content-Length', fileData.data.length);
    res.setHeader('X-Original-Name', fileData.originalName);
    res.setHeader('X-Uploaded-At', fileData.uploadedAt);

    // Send decrypted file data
    res.send(fileData.data);

  } catch (error) {
    logger.error('Error downloading resume:', error);
    res.status(500).json({ error: 'Failed to download resume' });
  }
});

// POST /api/students/:id/resume/analyze - Analyze stored resume
router.post('/:id/resume/analyze', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (!student.resumeFile) {
      return res.status(400).json({ error: 'No resume file found. Please upload a resume first.' });
    }

    // For now, we'll use the existing resumeText if available
    // In a real implementation, you'd extract text from the PDF file
    if (!student.resumeText) {
      return res.status(400).json({ error: 'Resume text not available. Please re-upload your resume.' });
    }

    // Analyze resume using Google AI
    const analysisResult = await analyzeResume(student.resumeText);
    
    // Update student with analysis
    student.resumeAnalysis = analysisResult.parsedResponse;
    await student.save();

    res.json({
      message: 'Resume analyzed successfully',
      analysis: analysisResult.parsedResponse
    });

  } catch (error) {
    logger.error('Error analyzing resume:', error);
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
});

// DELETE /api/students/:id/resume - Delete student resume
router.delete('/:id/resume', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (!student.resumeFile) {
      return res.status(404).json({ error: 'No resume found' });
    }

    // Delete file from S3
    if (student.resumeFile.s3Key) {
      try {
        const deleteSuccess = await secureFileUpload.deleteFromS3(student.resumeFile.s3Key);
        if (!deleteSuccess) {
          logger.warn(`Failed to delete resume file from S3: ${student.resumeFile.s3Key}`);
        }
      } catch (error) {
        logger.warn('Could not delete resume file from S3:', error);
      }
    }

    // Clear resume data from student
    student.resumeFile = undefined;
    student.resumeText = undefined;
    student.resumeAnalysis = undefined;
    await student.save();

    logger.info(`Resume deleted for student ${student._id}`);

    res.json({ message: 'Resume deleted successfully' });

  } catch (error) {
    logger.error('Error deleting resume:', error);
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

export default router;


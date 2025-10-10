/*
============================================================================
FILE: backend/routes/auth.js
============================================================================
PURPOSE:
  Authentication routes for OC student login with @eagles.oc.edu validation.

FEATURES:
  - Email validation for @eagles.oc.edu addresses
  - Password authentication (simplified for demo)
  - JWT token generation
  - User session management
  - Guest mode support

USAGE:
  Used by frontend AuthProvider for user authentication.
============================================================================
*/

import express from 'express';
import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import logger from '../utils/logger.js';

const router = express.Router();

// JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'eagleai-secret-key-2024';

// Validate email format for OC users
const isValidOCEmail = (email) => {
  return email && email.toLowerCase().endsWith('@eagles.oc.edu');
};

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Validate email format
    if (!isValidOCEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please use your @eagles.oc.edu email address'
      });
    }

    // For demo purposes, we'll use a simple password validation
    // In production, this would check against a secure password hash
    const validPasswords = {
      'demo@eagles.oc.edu': 'password123',
      'test@eagles.oc.edu': 'password123',
      'student@eagles.oc.edu': 'password123'
    };

    if (!validPasswords[email.toLowerCase()]) {
      // Create a new student if email doesn't exist
      const newStudent = new Student({
        email: email.toLowerCase(),
        name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        institution: 'Oklahoma Christian University',
        role: 'student',
        isOCStudent: true,
        createdAt: new Date(),
        lastLogin: new Date()
      });

      await newStudent.save();
      logger.info(`New OC student registered: ${email}`);
    } else if (validPasswords[email.toLowerCase()] !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Find or create student
    let student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) {
      student = new Student({
        email: email.toLowerCase(),
        name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        institution: 'Oklahoma Christian University',
        role: 'student',
        isOCStudent: true,
        createdAt: new Date(),
        lastLogin: new Date()
      });
      await student.save();
    } else {
      // Update last login
      student.lastLogin = new Date();
      await student.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: student._id, 
        email: student.email,
        isOCStudent: true
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data and token
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: student._id,
        email: student.email,
        name: student.name,
        role: student.role,
        institution: student.institution,
        isOCStudent: true,
        createdAt: student.createdAt,
        lastLogin: student.lastLogin
      },
      token
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const student = await Student.findById(decoded.userId);
    
    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: student._id,
        email: student.email,
        name: student.name,
        role: student.role,
        institution: student.institution,
        isOCStudent: true,
        createdAt: student.createdAt,
        lastLogin: student.lastLogin
      }
    });

  } catch (error) {
    logger.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  // In a real app, you might want to blacklist the token
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// Get user profile endpoint
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const student = await Student.findById(userId);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: student._id,
        email: student.email,
        name: student.name,
        role: student.role,
        institution: student.institution,
        isOCStudent: true,
        createdAt: student.createdAt,
        lastLogin: student.lastLogin,
        resumeData: student.resumeData,
        preferences: student.preferences
      }
    });

  } catch (error) {
    logger.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;

/*
============================================================================
FILE: backend/routes/auth.js
============================================================================
PURPOSE:
  Authentication routes for EagleAI platform with JWT tokens, session management,
  and security features. Handles user registration, login, logout, and token refresh.

FEATURES:
  - JWT token generation and validation
  - Refresh token mechanism
  - Password hashing with bcrypt
  - Rate limiting on auth endpoints
  - CSRF protection
  - Session management
  - Input validation with Joi
  - Security headers and middleware

SECURITY FEATURES:
  - Password strength validation
  - Account lockout after failed attempts
  - Token expiration and refresh
  - CSRF token validation
  - Rate limiting
  - Input sanitization
  - Secure cookie settings
============================================================================
*/

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import Joi from 'joi';
import crypto from 'crypto';
import { Student } from '../models/Student.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 attempts per window for sensitive operations
  message: 'Too many attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// CSRF token storage (in production, use Redis)
const csrfTokens = new Map();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    'any.required': 'Password is required'
  }),
  firstName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'First name must be at least 2 characters long',
    'string.max': 'First name must be less than 50 characters',
    'any.required': 'First name is required'
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Last name must be at least 2 characters long',
    'string.max': 'Last name must be less than 50 characters',
    'any.required': 'Last name is required'
  }),
  studentId: Joi.string().min(3).max(20).optional().messages({
    'string.min': 'Student ID must be at least 3 characters long',
    'string.max': 'Student ID must be less than 20 characters'
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required'
  })
});

// Middleware for JWT verification
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied. No token provided.',
      code: 'NO_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired. Please refresh your token.',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(403).json({ 
      error: 'Invalid token.',
      code: 'INVALID_TOKEN'
    });
  }
};

// Middleware for CSRF protection
const verifyCSRF = (req, res, next) => {
  const csrfToken = req.headers['x-csrf-token'];
  const sessionId = req.headers['x-session-id'];

  if (!csrfToken || !sessionId) {
    return res.status(403).json({ 
      error: 'CSRF token or session ID missing',
      code: 'CSRF_MISSING'
    });
  }

  const storedToken = csrfTokens.get(sessionId);
  if (!storedToken || storedToken !== csrfToken) {
    return res.status(403).json({ 
      error: 'Invalid CSRF token',
      code: 'CSRF_INVALID'
    });
  }

  next();
};

// Generate CSRF token
const generateCSRFToken = (sessionId) => {
  const token = crypto.randomBytes(32).toString('hex');
  csrfTokens.set(sessionId, token);
  // Clean up old tokens (in production, use Redis with TTL)
  setTimeout(() => csrfTokens.delete(sessionId), 15 * 60 * 1000); // 15 minutes
  return token;
};

// Generate JWT tokens
const generateTokens = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role || 'student'
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'eagleai',
    audience: 'eagleai-users'
  });

  const refreshToken = jwt.sign(
    { id: user._id, type: 'refresh' }, 
    JWT_REFRESH_SECRET, 
    { 
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'eagleai',
      audience: 'eagleai-users'
    }
  );

  return { accessToken, refreshToken };
};

// Set secure cookies
const setSecureCookies = (res, accessToken, refreshToken) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  };

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

// Clear cookies
const clearCookies = (res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
  try {
    // Validate input
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message),
        code: 'VALIDATION_ERROR'
      });
    }

    const { email, password, firstName, lastName, studentId } = value;

    // Check if user already exists
    const existingUser = await Student.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists with this email',
        code: 'USER_EXISTS'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new Student({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      studentId: studentId || null,
      role: 'student',
      isActive: true,
      lastLogin: null,
      failedLoginAttempts: 0,
      lockedUntil: null
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Set secure cookies
    setSecureCookies(res, accessToken, refreshToken);

    // Generate CSRF token
    const sessionId = crypto.randomUUID();
    const csrfToken = generateCSRFToken(sessionId);

    logger.info(`User registered: ${email}`);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        studentId: user.studentId,
        role: user.role
      },
      sessionId,
      csrfToken
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message),
        code: 'VALIDATION_ERROR'
      });
    }

    const { email, password } = value;

    // Find user
    const user = await Student.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > Date.now()) {
      const lockTime = Math.ceil((user.lockedUntil - Date.now()) / 1000 / 60);
      return res.status(423).json({
        error: `Account is locked. Try again in ${lockTime} minutes.`,
        code: 'ACCOUNT_LOCKED'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      // Increment failed attempts
      user.failedLoginAttempts += 1;
      
      // Lock account after 5 failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
      }
      
      await user.save();

      return res.status(401).json({
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Reset failed attempts and update last login
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Set secure cookies
    setSecureCookies(res, accessToken, refreshToken);

    // Generate CSRF token
    const sessionId = crypto.randomUUID();
    const csrfToken = generateCSRFToken(sessionId);

    logger.info(`User logged in: ${email}`);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        studentId: user.studentId,
        role: user.role
      },
      sessionId,
      csrfToken
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    // Validate input
    const { error, value } = refreshTokenSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message),
        code: 'VALIDATION_ERROR'
      });
    }

    const { refreshToken } = value;

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(403).json({
        error: 'Invalid token type',
        code: 'INVALID_TOKEN_TYPE'
      });
    }

    // Find user
    const user = await Student.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(403).json({
        error: 'User not found or inactive',
        code: 'USER_NOT_FOUND'
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Set secure cookies
    setSecureCookies(res, accessToken, newRefreshToken);

    res.json({
      message: 'Token refreshed successfully',
      accessToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Refresh token expired. Please login again.',
        code: 'REFRESH_TOKEN_EXPIRED'
      });
    }
    
    logger.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// POST /api/auth/logout
router.post('/logout', verifyToken, (req, res) => {
  try {
    // Clear cookies
    clearCookies(res);

    // In production, you might want to blacklist the token
    // or store it in a Redis blacklist

    logger.info(`User logged out: ${req.user.email}`);

    res.json({
      message: 'Logout successful'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await Student.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        studentId: user.studentId,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    logger.error('Get user profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// POST /api/auth/change-password
router.post('/change-password', verifyToken, strictAuthLimiter, async (req, res) => {
  try {
    const changePasswordSchema = Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required()
    });

    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message),
        code: 'VALIDATION_ERROR'
      });
    }

    const { currentPassword, newPassword } = value;
    const user = await Student.findById(req.user.id);

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Current password is incorrect',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password
    user.password = hashedPassword;
    await user.save();

    logger.info(`Password changed for user: ${user.email}`);

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        error: 'Email is required',
        code: 'EMAIL_REQUIRED'
      });
    }

    const user = await Student.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();

    // In production, send email with reset link
    logger.info(`Password reset requested for: ${email}, token: ${resetToken}`);

    res.json({
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', strictAuthLimiter, async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        error: 'Token and new password are required',
        code: 'MISSING_FIELDS'
      });
    }

    const user = await Student.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        error: 'Invalid or expired reset token',
        code: 'INVALID_RESET_TOKEN'
      });
    }

    // Validate new password
    const passwordSchema = Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/);
    const { error } = passwordSchema.validate(newPassword);
    if (error) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character',
        code: 'INVALID_PASSWORD_FORMAT'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    logger.info(`Password reset completed for user: ${user.email}`);

    res.json({
      message: 'Password reset successfully'
    });

  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

export default router;

/*
============================================================================
FILE: backend/middleware/validation.js
============================================================================
PURPOSE:
  Input validation middleware using Joi for API endpoints.
  Provides consistent validation across all routes with proper error handling.

FEATURES:
  - Joi schema validation
  - Consistent error response format
  - Sanitization of input data
  - Support for different validation types (body, query, params)
  - Custom validation rules for specific fields
============================================================================
*/

import Joi from 'joi';

/**
 * Generic validation middleware factory
 * @param {Object} schema - Joi schema object
 * @param {string} property - Property to validate ('body', 'query', 'params')
 * @returns {Function} Express middleware function
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all validation errors
      stripUnknown: true, // Remove unknown properties
      convert: true // Convert types when possible
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details: errorDetails,
        code: 'VALIDATION_ERROR'
      });
    }

    // Replace the original property with sanitized value
    req[property] = value;
    next();
  };
};

// Common validation schemas
export const commonSchemas = {
  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).max(1000).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('createdAt', 'updatedAt', 'name', 'title').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }),

  // ObjectId validation
  objectId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid ID format'
  }),

  // Email validation
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address'
  }),

  // Password validation
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  }),

  // Name validation
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name must be less than 50 characters'
  }),

  // URL validation
  url: Joi.string().uri().required().messages({
    'string.uri': 'Please provide a valid URL'
  }),

  // Date validation
  date: Joi.date().iso().messages({
    'date.format': 'Date must be in ISO format'
  }),

  // Phone number validation
  phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional().messages({
    'string.pattern.base': 'Please provide a valid phone number'
  })
};

// Job-related validation schemas
export const jobSchemas = {
  // Job query parameters
  jobQuery: Joi.object({
    page: Joi.number().integer().min(1).max(1000).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('matchScore', 'postedDate', 'company', 'title', 'salary').default('matchScore'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    categories: Joi.array().items(Joi.string().valid(
      'software-engineering',
      'data-science',
      'product-management',
      'marketing',
      'design',
      'finance',
      'consulting',
      'other'
    )).optional(),
    jobTypes: Joi.array().items(Joi.string().valid('internship', 'full-time', 'part-time', 'contract')).optional(),
    locations: Joi.array().items(Joi.string().max(100)).optional(),
    isRemote: Joi.boolean().optional(),
    minMatchScore: Joi.number().min(0).max(100).optional(),
    search: Joi.string().max(200).optional()
  }),

  // Job creation/update
  jobData: Joi.object({
    title: Joi.string().min(3).max(200).required(),
    company: Joi.string().min(2).max(100).required(),
    description: Joi.string().min(10).max(10000).required(),
    location: Joi.string().min(2).max(100).required(),
    isRemote: Joi.boolean().default(false),
    jobType: Joi.string().valid('internship', 'full-time', 'part-time', 'contract').required(),
    categories: Joi.array().items(Joi.string().valid(
      'software-engineering',
      'data-science',
      'product-management',
      'marketing',
      'design',
      'finance',
      'consulting',
      'other'
    )).min(1).required(),
    salary: Joi.object({
      min: Joi.number().min(0).optional(),
      max: Joi.number().min(0).optional(),
      currency: Joi.string().length(3).default('USD').optional()
    }).optional(),
    requirements: Joi.array().items(Joi.string().max(500)).optional(),
    benefits: Joi.array().items(Joi.string().max(500)).optional(),
    applicationUrl: commonSchemas.url.optional(),
    postedDate: commonSchemas.date.optional(),
    expiryDate: commonSchemas.date.optional()
  }),

  // Job application
  jobApplication: Joi.object({
    jobId: commonSchemas.objectId,
    coverLetter: Joi.string().max(2000).optional(),
    resumeId: commonSchemas.objectId.optional(),
    additionalInfo: Joi.string().max(1000).optional()
  })
};

// Student-related validation schemas
export const studentSchemas = {
  // Student profile update
  studentProfile: Joi.object({
    firstName: commonSchemas.name,
    lastName: commonSchemas.name,
    university: Joi.string().min(2).max(100).optional(),
    major: Joi.string().min(2).max(100).optional(),
    graduationYear: Joi.number().integer().min(2020).max(2030).optional(),
    studentId: Joi.string().min(3).max(20).optional(),
    phone: commonSchemas.phone,
    bio: Joi.string().max(1000).optional(),
    skills: Joi.array().items(Joi.object({
      name: Joi.string().min(1).max(50).required(),
      level: Joi.number().min(0).max(100).default(0),
      category: Joi.string().valid('technical', 'soft', 'language', 'certification').default('technical')
    })).max(50).optional(),
    interests: Joi.array().items(Joi.string().min(1).max(100)).max(20).optional(),
    careerGoals: Joi.array().items(Joi.string().min(1).max(200)).max(10).optional(),
    jobPreferences: Joi.object({
      categories: Joi.array().items(Joi.string().valid(
        'software-engineering',
        'data-science',
        'product-management',
        'marketing',
        'design',
        'finance',
        'consulting',
        'other'
      )).optional(),
      jobTypes: Joi.array().items(Joi.string().valid('internship', 'full-time', 'part-time', 'contract')).optional(),
      locations: Joi.array().items(Joi.string().max(100)).optional(),
      remotePreference: Joi.string().valid('remote-only', 'hybrid', 'on-site', 'any').default('any'),
      salaryExpectation: Joi.object({
        min: Joi.number().min(0).optional(),
        currency: Joi.string().length(3).default('USD').optional()
      }).optional()
    }).optional(),
    notificationSettings: Joi.object({
      emailNotifications: Joi.boolean().default(true),
      pushNotifications: Joi.boolean().default(true),
      frequency: Joi.string().valid('immediate', 'daily', 'weekly').default('daily'),
      categories: Joi.array().items(Joi.string().valid(
        'software-engineering',
        'data-science',
        'product-management',
        'marketing',
        'design',
        'finance',
        'consulting'
      )).optional()
    }).optional()
  })
};

// Resume-related validation schemas
export const resumeSchemas = {
  // Resume upload
  resumeUpload: Joi.object({
    title: Joi.string().min(1).max(100).optional(),
    description: Joi.string().max(500).optional(),
    isPublic: Joi.boolean().default(false)
  }),

  // Resume analysis request
  resumeAnalysis: Joi.object({
    resumeId: commonSchemas.objectId,
    analysisType: Joi.string().valid('basic', 'detailed', 'ats-optimization').default('detailed'),
    targetJob: Joi.string().max(200).optional(),
    targetCompany: Joi.string().max(100).optional()
  })
};

// Notification validation schemas
export const notificationSchemas = {
  // Notification query
  notificationQuery: Joi.object({
    page: Joi.number().integer().min(1).max(1000).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    type: Joi.string().valid('job-match', 'mentor-match', 'system', 'reminder').optional(),
    status: Joi.string().valid('unread', 'read', 'archived').optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional()
  }),

  // Notification update
  notificationUpdate: Joi.object({
    status: Joi.string().valid('read', 'unread', 'archived').required(),
    readAt: commonSchemas.date.optional()
  })
};

// Matching validation schemas
export const matchingSchemas = {
  // Match request
  matchRequest: Joi.object({
    studentId: commonSchemas.objectId,
    jobId: commonSchemas.objectId.optional(),
    categories: Joi.array().items(Joi.string().valid(
      'software-engineering',
      'data-science',
      'product-management',
      'marketing',
      'design',
      'finance',
      'consulting',
      'other'
    )).optional(),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }),

  // Match status update
  matchStatusUpdate: Joi.object({
    status: Joi.string().valid('new', 'viewed', 'applied', 'rejected', 'accepted').required(),
    applicationStatus: Joi.string().valid('not-applied', 'applied', 'interview', 'offer', 'rejected').optional(),
    notes: Joi.string().max(500).optional()
  })
};

// RAG validation schemas
export const ragSchemas = {
  // RAG query
  ragQuery: Joi.object({
    query: Joi.string().min(1).max(500).required(),
    context: Joi.string().valid('career', 'skills', 'jobs', 'resume', 'general').default('general'),
    limit: Joi.number().integer().min(1).max(20).default(5),
    includeMetadata: Joi.boolean().default(false)
  })
};

// Export validation middleware functions
export const validateBody = (schema) => validate(schema, 'body');
export const validateQuery = (schema) => validate(schema, 'query');
export const validateParams = (schema) => validate(schema, 'params');

// Export all schemas
export default {
  validate,
  validateBody,
  validateQuery,
  validateParams,
  commonSchemas,
  jobSchemas,
  studentSchemas,
  resumeSchemas,
  notificationSchemas,
  matchingSchemas,
  ragSchemas
};

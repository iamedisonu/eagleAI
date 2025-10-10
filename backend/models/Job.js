/*
============================================================================
FILE: backend/models/Job.js
============================================================================
PURPOSE:
  Mongoose schema for job postings scraped from intern-list.com and other sources.
  Stores job details, metadata, and matching information.

SCHEMA FIELDS:
  - Basic job info (title, company, location, description)
  - Application details (url, deadline, requirements)
  - Scraping metadata (source, scrapedAt, lastUpdated)
  - Matching data (categories, skills, difficulty)
  - Status tracking (active, expired, flagged)
============================================================================
*/

import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  // Basic job information
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  company: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    maxlength: 200
  },
  
  // Application details
  applicationUrl: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Application URL must be a valid HTTP/HTTPS URL'
    }
  },
  applicationDeadline: {
    type: Date
  },
  postedDate: {
    type: Date,
    default: Date.now
  },
  
  // Job requirements and details
  requirements: [{
    type: String,
    trim: true
  }],
  skills: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  categories: [{
    type: String,
    enum: [
      'software-engineering',
      'data-science',
      'product-management',
      'marketing',
      'design',
      'finance',
      'consulting',
      'other'
    ],
    required: true
  }],
  jobType: {
    type: String,
    enum: ['internship', 'full-time', 'part-time', 'contract'],
    default: 'internship'
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior'],
    default: 'entry'
  },
  salaryRange: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  
  // Scraping metadata
  source: {
    type: String,
    required: true,
    enum: ['intern-list', 'linkedin', 'indeed', 'glassdoor', 'company-website']
  },
  sourceId: {
    type: String,
    required: true,
    unique: true
  },
  scrapedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  // Status and flags
  status: {
    type: String,
    enum: ['active', 'expired', 'filled', 'flagged'],
    default: 'active'
  },
  isRemote: {
    type: Boolean,
    default: false
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  isNew: {
    type: Boolean,
    default: false
  },
  
  // URL validation tracking
  urlStatus: {
    lastChecked: {
      type: Date,
      default: Date.now
    },
    isValid: {
      type: Boolean,
      default: true
    },
    statusCode: {
      type: Number,
      default: 200
    },
    errorMessage: {
      type: String
    }
  },
  
  // Matching metadata
  matchScore: {
    type: Number,
    min: 0,
    max: 100
  },
  matchedStudents: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100
    },
    matchedAt: {
      type: Date,
      default: Date.now
    },
    notificationSent: {
      type: Boolean,
      default: false
    }
  }],
  
  // AI analysis results
  aiAnalysis: {
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    keySkills: [String],
    industryTags: [String],
    companySize: {
      type: String,
      enum: ['startup', 'small', 'medium', 'large', 'enterprise']
    },
    cultureFit: {
      type: String,
      enum: ['conservative', 'moderate', 'progressive', 'startup']
    }
  },

  // Vector embeddings for RAG
  embedding: {
    type: [Number],
    default: undefined
  },
  embeddingUpdatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
jobSchema.index({ title: 'text', company: 'text', description: 'text' });
jobSchema.index({ categories: 1, jobType: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ postedDate: -1 });
jobSchema.index({ status: 1, postedDate: -1 });
jobSchema.index({ 'matchedStudents.studentId': 1 });
jobSchema.index({ isNew: 1, status: 1 });
jobSchema.index({ embedding: 1 });

// Pre-save middleware to update lastUpdated
jobSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Virtual for days since posted
jobSchema.virtual('daysSincePosted').get(function() {
  return Math.floor((Date.now() - this.postedDate) / (1000 * 60 * 60 * 24));
});

// Method to check if job is still active
jobSchema.methods.isActive = function() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  return this.status === 'active' && 
         this.postedDate > thirtyDaysAgo &&
         (!this.applicationDeadline || this.applicationDeadline > now);
};

// Method to add student match
jobSchema.methods.addStudentMatch = function(studentId, matchScore) {
  const existingMatch = this.matchedStudents.find(
    match => match.studentId.toString() === studentId.toString()
  );
  
  if (existingMatch) {
    existingMatch.matchScore = matchScore;
    existingMatch.matchedAt = new Date();
    existingMatch.notificationSent = false;
  } else {
    this.matchedStudents.push({
      studentId,
      matchScore,
      matchedAt: new Date(),
      notificationSent: false
    });
  }
  
  return this.save();
};

// Static method to find jobs by category
jobSchema.statics.findByCategory = function(category, limit = 20) {
  return this.find({ 
    categories: category, 
    status: 'active' 
  })
  .sort({ postedDate: -1 })
  .limit(limit);
};

// Static method to find jobs for student
jobSchema.statics.findForStudent = function(studentId, limit = 20) {
  return this.find({ 
    'matchedStudents.studentId': studentId,
    status: 'active'
  })
  .sort({ 'matchedStudents.matchScore': -1 })
  .limit(limit);
};

// Static method to update "new" status for all jobs
jobSchema.statics.updateNewStatus = function() {
  const fiveDaysAgo = new Date(Date.now() - (5 * 24 * 60 * 60 * 1000));
  
  return Promise.all([
    // Mark jobs older than 5 days as not new
    this.updateMany(
      { 
        postedDate: { $lt: fiveDaysAgo },
        isNew: true 
      },
      { isNew: false }
    ),
    // Mark jobs newer than 5 days as new
    this.updateMany(
      { 
        postedDate: { $gte: fiveDaysAgo },
        isNew: false,
        status: 'active'
      },
      { isNew: true }
    )
  ]);
};

// Static method to find new jobs
jobSchema.statics.findNewJobs = function(limit = 20) {
  return this.find({ 
    isNew: true,
    status: 'active'
  })
  .sort({ postedDate: -1 })
  .limit(limit);
};

// Static method to validate job URLs
jobSchema.statics.validateJobUrls = async function() {
  const jobs = await this.find({ 
    status: 'active',
    'urlStatus.lastChecked': { 
      $lt: new Date(Date.now() - (24 * 60 * 60 * 1000)) // Older than 24 hours
    }
  }).limit(50); // Process 50 jobs at a time
  
  const results = {
    checked: 0,
    valid: 0,
    invalid: 0,
    errors: 0
  };
  
  for (const job of jobs) {
    try {
      results.checked++;
      
      const response = await fetch(job.applicationUrl, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });
      
      const isValid = response.ok;
      
      job.urlStatus = {
        lastChecked: new Date(),
        isValid: isValid,
        statusCode: response.status,
        errorMessage: isValid ? null : response.statusText
      };
      
      if (!isValid) {
        job.status = 'expired';
        results.invalid++;
      } else {
        results.valid++;
      }
      
      await job.save();
      
    } catch (error) {
      results.errors++;
      job.urlStatus = {
        lastChecked: new Date(),
        isValid: false,
        statusCode: 0,
        errorMessage: error.message
      };
      job.status = 'expired';
      await job.save();
    }
  }
  
  return results;
};

export default mongoose.model('Job', jobSchema);


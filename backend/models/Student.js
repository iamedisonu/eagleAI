/*
============================================================================
FILE: backend/models/Student.js
============================================================================
PURPOSE:
  Mongoose schema for student profiles and resume data.
  Stores student information, skills, preferences, and resume analysis results.

SCHEMA FIELDS:
  - Basic profile info (name, email, university)
  - Resume data and analysis results
  - Skills, interests, and career goals
  - Notification preferences
  - Job matching history
============================================================================
*/

import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  // Basic profile information
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please provide a valid email address'
    }
  },
  university: {
    type: String,
    trim: true
  },
  major: {
    type: String,
    trim: true
  },
  graduationYear: {
    type: Number,
    min: 2020,
    max: 2030
  },
  
  // Resume data
  resumeText: {
    type: String
  },
  resumeFile: {
    originalName: String,
    fileName: String,
    filePath: String,
    fileSize: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  resumeAnalysis: {
    overallScore: {
      type: Number,
      min: 0,
      max: 10
    },
    categoryScores: {
      bulletPoints: Number,
      header: Number,
      education: Number,
      experience: Number,
      secondarySections: Number,
      formatting: Number,
      language: Number,
      contentQuality: Number,
      targeting: Number,
      universalStandards: Number
    },
    strengths: [String],
    priorityImprovements: [String],
    lastAnalyzed: {
      type: Date,
      default: Date.now
    }
  },
  
  // Skills and interests
  skills: [{
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    level: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    category: {
      type: String,
      enum: ['technical', 'soft', 'language', 'certification'],
      default: 'technical'
    }
  }],
  interests: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  careerGoals: [{
    type: String,
    trim: true
  }],
  
  // Job preferences
  jobPreferences: {
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
      ]
    }],
    jobTypes: [{
      type: String,
      enum: ['internship', 'full-time', 'part-time', 'contract']
    }],
    locations: [String],
    remotePreference: {
      type: String,
      enum: ['remote-only', 'hybrid', 'on-site', 'any'],
      default: 'any'
    },
    salaryExpectation: {
      min: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    }
  },
  
  // Notification preferences
  notificationSettings: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    frequency: {
      type: String,
      enum: ['immediate', 'daily', 'weekly'],
      default: 'daily'
    },
    categories: [{
      type: String,
      enum: [
        'software-engineering',
        'data-science',
        'product-management',
        'marketing',
        'design',
        'finance',
        'consulting'
      ]
    }]
  },
  
  // Matching history
  jobMatches: [{
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
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
    status: {
      type: String,
      enum: ['new', 'viewed', 'applied', 'rejected', 'accepted'],
      default: 'new'
    },
    applicationStatus: {
      type: String,
      enum: ['not-applied', 'applied', 'interview', 'offer', 'rejected'],
      default: 'not-applied'
    }
  }],
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  
  // Profile completion
  profileCompletion: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
studentSchema.index({ email: 1 });
studentSchema.index({ skills: 1 });
studentSchema.index({ 'jobPreferences.categories': 1 });
studentSchema.index({ university: 1, major: 1 });
studentSchema.index({ isActive: 1, lastLogin: -1 });

// Pre-save middleware to calculate profile completion
studentSchema.pre('save', function(next) {
  let completion = 0;
  const fields = [
    'name', 'email', 'university', 'major', 'graduationYear',
    'resumeText', 'skills', 'interests', 'careerGoals'
  ];
  
  fields.forEach(field => {
    if (this[field] && (Array.isArray(this[field]) ? this[field].length > 0 : this[field].toString().trim().length > 0)) {
      completion += 100 / fields.length;
    }
  });
  
  this.profileCompletion = Math.round(completion);
  next();
});

// Method to add job match
studentSchema.methods.addJobMatch = function(jobId, matchScore) {
  const existingMatch = this.jobMatches.find(
    match => match.jobId.toString() === jobId.toString()
  );
  
  if (existingMatch) {
    existingMatch.matchScore = matchScore;
    existingMatch.matchedAt = new Date();
    existingMatch.status = 'new';
  } else {
    this.jobMatches.push({
      jobId,
      matchScore,
      matchedAt: new Date(),
      status: 'new'
    });
  }
  
  return this.save();
};

// Method to update job match status
studentSchema.methods.updateJobMatchStatus = function(jobId, status, applicationStatus = null) {
  const match = this.jobMatches.find(
    match => match.jobId.toString() === jobId.toString()
  );
  
  if (match) {
    match.status = status;
    if (applicationStatus) {
      match.applicationStatus = applicationStatus;
    }
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Method to get recent matches
studentSchema.methods.getRecentMatches = function(limit = 10) {
  return this.jobMatches
    .sort((a, b) => new Date(b.matchedAt) - new Date(a.matchedAt))
    .slice(0, limit);
};

// Method to get unread matches
studentSchema.methods.getUnreadMatches = function() {
  return this.jobMatches.filter(match => match.status === 'new');
};

// Static method to find students by skills
studentSchema.statics.findBySkills = function(skills, limit = 20) {
  return this.find({
    'skills.name': { $in: skills },
    isActive: true
  }).limit(limit);
};

// Static method to find students by preferences
studentSchema.statics.findByPreferences = function(categories, jobTypes, limit = 20) {
  const query = { isActive: true };
  
  if (categories && categories.length > 0) {
    query['jobPreferences.categories'] = { $in: categories };
  }
  
  if (jobTypes && jobTypes.length > 0) {
    query['jobPreferences.jobTypes'] = { $in: jobTypes };
  }
  
  return this.find(query).limit(limit);
};

export default mongoose.model('Student', studentSchema);


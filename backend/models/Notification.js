/*
============================================================================
FILE: backend/models/Notification.js
============================================================================
PURPOSE:
  Mongoose schema for notifications sent to students about job matches,
  system updates, and other relevant information.

SCHEMA FIELDS:
  - Notification content and metadata
  - Recipient and delivery information
  - Read status and interaction tracking
  - Notification type and priority
============================================================================
*/

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  // Recipient information
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  
  // Notification content
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  type: {
    type: String,
    required: true,
    enum: [
      'job-match',
      'resume-analysis',
      'mentorship',
      'projects',
      'skills',
      'roadmap',
      'system',
      'reminder'
    ],
    index: true
  },
  
  // Related data
  relatedJobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  relatedData: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Delivery information
  deliveryMethod: {
    type: String,
    enum: ['email', 'push', 'in-app'],
    default: 'in-app'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed'],
    default: 'pending',
    index: true
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date
  },
  
  // Delivery tracking
  sentAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  failedAt: {
    type: Date
  },
  failureReason: {
    type: String
  },
  
  // Interaction tracking
  clicked: {
    type: Boolean,
    default: false
  },
  clickedAt: {
    type: Date
  },
  actionTaken: {
    type: String,
    enum: ['viewed', 'applied', 'saved', 'dismissed']
  },
  actionTakenAt: {
    type: Date
  },
  
  // Expiration
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }
  },
  
  // Metadata
  metadata: {
    source: String,
    campaign: String,
    tags: [String]
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
notificationSchema.index({ studentId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ type: 1, status: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
notificationSchema.index({ createdAt: -1 });

// Pre-save middleware to set sentAt when status changes to 'sent'
notificationSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'sent' && !this.sentAt) {
    this.sentAt = new Date();
  }
  next();
});

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Method to mark as clicked
notificationSchema.methods.markAsClicked = function() {
  this.clicked = true;
  this.clickedAt = new Date();
  return this.save();
};

// Method to record action taken
notificationSchema.methods.recordAction = function(action) {
  this.actionTaken = action;
  this.actionTakenAt = new Date();
  return this.save();
};

// Method to check if notification is expired
notificationSchema.methods.isExpired = function() {
  return this.expiresAt && this.expiresAt < new Date();
};

// Static method to find unread notifications for student
notificationSchema.statics.findUnreadForStudent = function(studentId, limit = 20) {
  return this.find({
    studentId,
    read: false,
    status: { $in: ['sent', 'delivered'] },
    expiresAt: { $gt: new Date() }
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to find notifications by type
notificationSchema.statics.findByType = function(type, limit = 50) {
  return this.find({ type })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get notification statistics
notificationSchema.statics.getStats = function(studentId = null) {
  const match = studentId ? { studentId } : {};
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        unread: {
          $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] }
        },
        read: {
          $sum: { $cond: [{ $eq: ['$read', true] }, 1, 0] }
        },
        clicked: {
          $sum: { $cond: [{ $eq: ['$clicked', true] }, 1, 0] }
        },
        byType: {
          $push: {
            type: '$type',
            read: '$read',
            clicked: '$clicked'
          }
        }
      }
    }
  ]);
};

// Static method to clean up expired notifications
notificationSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

export default mongoose.model('Notification', notificationSchema);


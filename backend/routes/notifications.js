/*
============================================================================
FILE: backend/routes/notifications.js
============================================================================
PURPOSE:
  REST API routes for notification operations including listing, marking as read,
  and managing notification preferences.

ENDPOINTS:
  GET /api/notifications - List notifications for a student
  GET /api/notifications/:id - Get specific notification
  PUT /api/notifications/:id/read - Mark notification as read
  PUT /api/notifications/:id/action - Record action taken on notification
  DELETE /api/notifications/:id - Delete notification
  POST /api/notifications/mark-all-read - Mark all notifications as read
============================================================================
*/

import express from 'express';
import Notification from '../models/Notification.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GET /api/notifications - List notifications for a student
router.get('/', async (req, res) => {
  try {
    const { studentId, type, read, limit = 20, page = 1 } = req.query;

    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    // Build query
    const query = { studentId };
    
    if (type) {
      query.type = { $in: type.split(',') };
    }
    
    if (read !== undefined) {
      query.read = read === 'true';
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('relatedJobId', 'title company location')
        .lean(),
      Notification.countDocuments(query)
    ]);

    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    logger.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// GET /api/notifications/:id - Get specific notification
router.get('/:id', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('relatedJobId', 'title company location description applicationUrl')
      .lean();

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(notification);

  } catch (error) {
    logger.error('Error fetching notification:', error);
    res.status(500).json({ error: 'Failed to fetch notification' });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.markAsRead();

    // Emit real-time update via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to(`student-${notification.studentId}`).emit('notification-read', {
        notificationId: notification._id,
        readAt: notification.readAt
      });
    }

    res.json({ message: 'Notification marked as read' });

  } catch (error) {
    logger.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// PUT /api/notifications/:id/action - Record action taken on notification
router.put('/:id/action', async (req, res) => {
  try {
    const { action } = req.body;
    const { id } = req.params;

    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }

    const validActions = ['viewed', 'applied', 'saved', 'dismissed'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.recordAction(action);

    // Emit real-time update via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to(`student-${notification.studentId}`).emit('notification-action', {
        notificationId: notification._id,
        action: action,
        actionTakenAt: notification.actionTakenAt
      });
    }

    res.json({ message: 'Action recorded successfully' });

  } catch (error) {
    logger.error('Error recording notification action:', error);
    res.status(500).json({ error: 'Failed to record action' });
  }
});

// PUT /api/notifications/:id/click - Mark notification as clicked
router.put('/:id/click', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.markAsClicked();

    res.json({ message: 'Notification marked as clicked' });

  } catch (error) {
    logger.error('Error marking notification as clicked:', error);
    res.status(500).json({ error: 'Failed to mark notification as clicked' });
  }
});

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Emit real-time update via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to(`student-${notification.studentId}`).emit('notification-deleted', {
        notificationId: notification._id
      });
    }

    res.json({ message: 'Notification deleted successfully' });

  } catch (error) {
    logger.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// GET /api/notifications/student/:studentId - Get notifications for specific student
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { type, read, limit = 20, page = 1 } = req.query;

    // Build query
    const query = { studentId };
    
    if (type) {
      query.type = { $in: type.split(',') };
    }
    
    if (read !== undefined) {
      query.read = read === 'true';
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('relatedJobId', 'title company location')
        .lean(),
      Notification.countDocuments(query)
    ]);

    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    logger.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// POST /api/notifications/mark-all-read - Mark all notifications as read for a student
router.post('/mark-all-read', async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    const result = await Notification.updateMany(
      { studentId, read: false },
      { 
        $set: { 
          read: true, 
          readAt: new Date() 
        } 
      }
    );

    // Emit real-time update via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to(`student-${studentId}`).emit('all-notifications-read', {
        count: result.modifiedCount
      });
    }

    res.json({ 
      message: 'All notifications marked as read',
      count: result.modifiedCount
    });

  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// GET /api/notifications/stats - Get notification statistics for a student
router.get('/stats/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    const stats = await Notification.getStats(studentId);

    res.json(stats[0] || {
      total: 0,
      unread: 0,
      read: 0,
      clicked: 0,
      byType: []
    });

  } catch (error) {
    logger.error('Error fetching notification stats:', error);
    res.status(500).json({ error: 'Failed to fetch notification statistics' });
  }
});

export default router;


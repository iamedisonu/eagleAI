/*
============================================================================
FILE: src/context/NotificationProvider.jsx
============================================================================
PURPOSE:
  Context provider for managing notifications across the application.
  Provides centralized notification state management and real-time updates.

FEATURES:
  - Centralized notification state
  - Real-time WebSocket updates
  - Notification actions (mark as read, mark all as read)
  - Error handling and loading states
  - Integration with notification service

USAGE:
  Wrap your app with NotificationProvider and use useNotifications hook
  to access notification state and actions.
============================================================================
*/

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';
import { useAuth } from './AuthProvider';

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { hasResumeSubmitted, currentProfile } = useAuth();

  // Get student ID from current profile
  const studentId = currentProfile?.id || 'mock-student-id';

  // Load notifications
  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if user has uploaded a resume
      const hasResume = hasResumeSubmitted();
      
      if (!hasResume) {
        // If no resume, show only the "Upload your resume" notification
        const uploadNotification = {
          _id: 'upload-resume-notification',
          title: 'Upload Your Resume',
          message: 'Upload your resume to unlock personalized job matches and career insights.',
          type: 'reminder',
          read: false,
          createdAt: new Date().toISOString(),
          priority: 'high',
          actionRequired: true
        };
        setNotifications([uploadNotification]);
        return;
      }
      
      // If resume exists, fetch regular notifications
      const fetchedNotifications = await notificationService.fetchNotifications(studentId);
      setNotifications(fetchedNotifications);
    } catch (err) {
      setError('Failed to load notifications');
      console.error('Error loading notifications:', err);
      
      // Fallback: show upload notification if no resume
      if (!hasResumeSubmitted()) {
        const uploadNotification = {
          _id: 'upload-resume-notification',
          title: 'Upload Your Resume',
          message: 'Upload your resume to unlock personalized job matches and career insights.',
          type: 'reminder',
          read: false,
          createdAt: new Date().toISOString(),
          priority: 'high',
          actionRequired: true
        };
        setNotifications([uploadNotification]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [studentId, hasResumeSubmitted]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      // Handle special upload notification locally
      if (notificationId === 'upload-resume-notification') {
        setNotifications(prev => 
          prev.map(n => 
            n._id === notificationId ? { ...n, read: true } : n
          )
        );
        return;
      }
      
      await notificationService.markAsRead(notificationId);
      // Local state will be updated via the subscription
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      // Handle upload notification locally
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      
      // Only call API if there are real notifications (not just upload notification)
      const hasRealNotifications = notifications.some(n => n._id !== 'upload-resume-notification');
      if (hasRealNotifications) {
        await notificationService.markAllAsRead();
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [notifications]);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Initialize notifications and WebSocket connection
  useEffect(() => {
    // Load initial notifications
    loadNotifications();
    
    // Subscribe to real-time updates
    const unsubscribe = notificationService.subscribe((newNotifications) => {
      setNotifications(newNotifications);
    });

    // Connect to WebSocket for real-time updates (only if resume exists)
    if (hasResumeSubmitted()) {
      notificationService.connectWebSocket(studentId);
    }

    // Check connection status
    const checkConnection = () => {
      setIsConnected(notificationService.isConnected);
    };

    const interval = setInterval(checkConnection, 1000);

    return () => {
      unsubscribe();
      notificationService.disconnect();
      clearInterval(interval);
    };
  }, [loadNotifications, studentId, hasResumeSubmitted]);

  // Reload notifications when resume status changes
  useEffect(() => {
    loadNotifications();
  }, [hasResumeSubmitted, loadNotifications]);

  const value = {
    notifications,
    isLoading,
    error,
    isConnected,
    unreadCount,
    loadNotifications,
    markAsRead,
    markAllAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

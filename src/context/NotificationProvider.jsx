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

  // Mock student ID - in real app, this would come from auth context
  const studentId = 'mock-student-id';

  // Load notifications
  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedNotifications = await notificationService.fetchNotifications(studentId);
      setNotifications(fetchedNotifications);
    } catch (err) {
      setError('Failed to load notifications');
      console.error('Error loading notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Local state will be updated via the subscription
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      // Local state will be updated via the subscription
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

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

    // Connect to WebSocket for real-time updates
    notificationService.connectWebSocket(studentId);

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
  }, [loadNotifications, studentId]);

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

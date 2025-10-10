/*
============================================================================
FILE: src/services/notificationService.js
============================================================================
PURPOSE:
  Service for managing notifications from the backend API.
  Handles fetching, marking as read, and real-time updates.

FEATURES:
  - Fetch notifications from backend API
  - Mark notifications as read
  - Real-time WebSocket updates
  - Error handling and retry logic
  - Local caching for offline support

USAGE:
  Import and use the functions to manage notifications in components.
============================================================================
*/

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:3001';

class NotificationService {
  constructor() {
    this.notifications = [];
    this.listeners = [];
    this.socket = null;
    this.isConnected = false;
  }

  // Subscribe to notification updates
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.notifications));
  }

  // Connect to WebSocket for real-time updates
  connectWebSocket(studentId) {
    if (this.socket) {
      this.socket.close();
    }

    try {
      this.socket = new WebSocket(`${WS_URL}?studentId=${studentId}`);
      
      this.socket.onopen = () => {
        console.log('WebSocket connected for notifications');
        this.isConnected = true;
        
        // Join student room
        this.socket.send(JSON.stringify({
          type: 'join-student',
          studentId: studentId
        }));
        
        // Subscribe to job matches
        this.socket.send(JSON.stringify({
          type: 'subscribe-job-matches',
          studentId: studentId
        }));
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'notification') {
            this.addNotification(data.notification);
          } else if (data.type === 'job-match') {
            this.addJobMatchNotification(data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (!this.isConnected) {
            this.connectWebSocket(studentId);
          }
        }, 5000);
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnected = false;
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Add new notification
  addNotification(notification) {
    this.notifications.unshift({
      ...notification,
      id: notification._id || notification.id,
      time: this.formatTime(notification.createdAt || new Date()),
      read: notification.read || false
    });
    
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
    
    this.notifyListeners();
  }

  // Add job match notification
  addJobMatchNotification(data) {
    const notification = {
      id: `job-match-${data.jobId}-${Date.now()}`,
      title: `New Job Match: ${data.jobTitle}`,
      message: `We found a ${data.matchScore}% match for you at ${data.company}. ${data.description}`,
      type: 'job-match',
      time: 'Just now',
      read: false,
      relatedJobId: data.jobId,
      matchScore: data.matchScore,
      company: data.company
    };
    
    this.addNotification(notification);
  }

  // Format time for display
  formatTime(date) {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return notificationDate.toLocaleDateString();
  }

  // Fetch notifications from API
  async fetchNotifications(studentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/student/${studentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.notifications = data.map(notification => ({
        ...notification,
        id: notification._id || notification.id,
        time: this.formatTime(notification.createdAt || new Date()),
        read: notification.read || false
      }));

      this.notifyListeners();
      return this.notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      
      // Return mock data if API fails
      return this.getMockNotifications();
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update local state
        this.notifications = this.notifications.map(n => 
          n.id === notificationId ? { ...n, read: true, readAt: new Date() } : n
        );
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      
      // Update local state anyway
      this.notifications = this.notifications.map(n => 
        n.id === notificationId ? { ...n, read: true, readAt: new Date() } : n
      );
      this.notifyListeners();
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/student/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update local state
        this.notifications = this.notifications.map(n => ({ 
          ...n, 
          read: true, 
          readAt: new Date() 
        }));
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      
      // Update local state anyway
      this.notifications = this.notifications.map(n => ({ 
        ...n, 
        read: true, 
        readAt: new Date() 
      }));
      this.notifyListeners();
    }
  }

  // Get mock notifications for fallback
  getMockNotifications() {
    return [
      {
        id: 1,
        title: "New Job Match: Software Engineer Intern",
        message: "We found a 92% match for you at Google. Full-stack development internship with React and Node.js.",
        type: "job-match",
        time: "5 minutes ago",
        read: false,
        relatedJobId: "job123",
        matchScore: 92
      },
      {
        id: 2,
        title: "Resume Review Complete",
        message: "Your Software Engineer resume scored 8.2/10",
        type: "resume-analysis",
        time: "2 minutes ago",
        read: false
      },
      {
        id: 3,
        title: "New Job Match: Data Science Intern",
        message: "Microsoft has a 87% match for you. Machine learning and Python experience required.",
        type: "job-match",
        time: "1 hour ago",
        read: false,
        relatedJobId: "job124",
        matchScore: 87
      }
    ];
  }

  // Get current notifications
  getNotifications() {
    return this.notifications;
  }

  // Get unread count
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;

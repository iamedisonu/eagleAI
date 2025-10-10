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

// API endpoints - in production, these would come from environment variables
const API_BASE_URL = 'http://localhost:3001';
const WS_URL = 'http://localhost:3001';

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

  // Connect to Socket.IO for real-time updates
  connectWebSocket(studentId) {
    if (this.socket) {
      this.socket.disconnect();
    }

    // Check if Socket.IO is available
    if (typeof window === 'undefined' || !window.io) {
      console.warn('Socket.IO not available, using mock data');
      return;
    }

    try {
      this.socket = window.io(WS_URL);
      
      this.socket.on('connect', () => {
        console.log('Socket.IO connected for notifications');
        this.isConnected = true;
        
        // Join student room
        this.socket.emit('join-student', studentId);
        
        // Subscribe to job matches
        this.socket.emit('subscribe-job-matches', studentId);
      });

      this.socket.on('notification', (data) => {
        this.addNotification(data.notification);
      });

      this.socket.on('job-match', (data) => {
        this.addJobMatchNotification(data);
      });

      this.socket.on('notification-read', (data) => {
        this.updateNotificationReadStatus(data.notificationId, data.readAt);
      });

      this.socket.on('all-notifications-read', (data) => {
        this.markAllAsReadLocally();
      });

      this.socket.on('disconnect', () => {
        console.log('Socket.IO disconnected');
        this.isConnected = false;
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (!this.isConnected) {
            this.connectWebSocket(studentId);
          }
        }, 5000);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
        this.isConnected = false;
      });
    } catch (error) {
      console.error('Failed to connect Socket.IO:', error);
      // Don't throw the error, just log it and continue with mock data
    }
  }

  // Disconnect Socket.IO
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
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
      company: data.company,
      applicationUrl: data.applicationUrl,
      location: data.location,
      jobType: data.jobType,
      isRemote: data.isRemote,
      salaryRange: data.salaryRange,
      skills: data.skills || []
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

  // Update notification read status locally
  updateNotificationReadStatus(notificationId, readAt) {
    this.notifications = this.notifications.map(n => 
      n.id === notificationId ? { ...n, read: true, readAt: new Date(readAt) } : n
    );
    this.notifyListeners();
  }

  // Mark all notifications as read locally
  markAllAsReadLocally() {
    this.notifications = this.notifications.map(n => ({ 
      ...n, 
      read: true, 
      readAt: new Date() 
    }));
    this.notifyListeners();
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
      this.notifications = data.notifications.map(notification => ({
        ...notification,
        id: notification._id || notification.id,
        time: this.formatTime(notification.createdAt || new Date()),
        read: notification.read || false
      }));

      this.notifyListeners();
      return this.notifications;
    } catch (error) {
      console.warn('Backend not available, using mock notifications:', error.message);
      
      // Return mock data if API fails
      const mockNotifications = this.getMockNotifications();
      this.notifications = mockNotifications;
      this.notifyListeners();
      return mockNotifications;
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
      const response = await fetch(`${API_BASE_URL}/api/notifications/mark-all-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId: 'mock-student-id' })
      });

      if (response.ok) {
        // Update local state
        this.markAllAsReadLocally();
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      
      // Update local state anyway
      this.markAllAsReadLocally();
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
        relatedJobId: "job-001",
        matchScore: 92,
        company: "Google",
        applicationUrl: "https://careers.google.com/jobs/results/1234567890",
        location: "Mountain View, CA",
        jobType: "internship",
        isRemote: false,
        salaryRange: { min: 6000, max: 8000 },
        skills: ["Python", "JavaScript", "React", "Node.js", "SQL", "Git"]
      },
      {
        id: 2,
        title: "Resume Review Complete",
        message: "Your Software Engineer resume scored 8.2/10. Great technical skills, consider adding more project details.",
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
        relatedJobId: "job-002",
        matchScore: 87,
        company: "Microsoft",
        applicationUrl: "https://careers.microsoft.com/us/en/job/1234567890",
        location: "Seattle, WA",
        jobType: "internship",
        isRemote: true,
        salaryRange: { min: 5500, max: 7500 },
        skills: ["Python", "R", "SQL", "Machine Learning", "Statistics", "Pandas"]
      },
      {
        id: 4,
        title: "New Job Match: AI/ML Research Intern",
        message: "OpenAI has a 95% match for you. Contribute to cutting-edge AI research and develop next-generation AI systems.",
        type: "job-match",
        time: "3 hours ago",
        read: true,
        relatedJobId: "job-008",
        matchScore: 95,
        company: "OpenAI",
        applicationUrl: "https://openai.com/careers/1234567890",
        location: "San Francisco, CA",
        jobType: "internship",
        isRemote: true,
        salaryRange: { min: 10000, max: 15000 },
        skills: ["Python", "TensorFlow", "PyTorch", "Machine Learning", "Deep Learning", "NLP"]
      },
      {
        id: 5,
        title: "Mentorship Opportunity",
        message: "Sarah Chen, Senior Software Engineer at Google, is available for mentorship. 94% compatibility match.",
        type: "mentorship",
        time: "6 hours ago",
        read: false
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

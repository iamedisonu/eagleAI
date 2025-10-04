/*
============================================================================
FILE: src/components/shared/NotificationBell.jsx
============================================================================
PURPOSE:
  Notification bell component that shows real-time updates from across
  modules in a consistent, accessible way.

FEATURES:
  - Bell icon with badge count
  - Dropdown with recent notifications
  - Grouped by type (Projects, Mentorship, Resume Review, etc.)
  - Click to route to relevant pages
  - Mark all as read functionality
  - OC brand styling

PROPS:
  - isOpen: Boolean for dropdown state
  - onToggle: Function to toggle dropdown
  - onClose: Function to close dropdown
============================================================================
*/

import { useState } from 'react';
import { 
  Bell, 
  X, 
  CheckCircle, 
  FileText, 
  Users, 
  Briefcase, 
  Brain, 
  Code,
  Clock,
  ArrowRight
} from 'lucide-react';

const NotificationBell = ({ isOpen, onToggle, onClose }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Resume Review Complete",
      message: "Your Software Engineer resume scored 8.2/10",
      type: "resume",
      icon: FileText,
      time: "2 minutes ago",
      read: false
    },
    {
      id: 2,
      title: "New Mentor Match",
      message: "Sarah Chen is available for a mentorship session",
      type: "mentorship",
      icon: Users,
      time: "1 hour ago",
      read: false
    },
    {
      id: 3,
      title: "Project Update",
      message: "ML Resume Screener project needs your attention",
      type: "projects",
      icon: Briefcase,
      time: "3 hours ago",
      read: true
    },
    {
      id: 4,
      title: "Skill Assessment Ready",
      message: "System Design assessment is now available",
      type: "skills",
      icon: Code,
      time: "1 day ago",
      read: true
    },
    {
      id: 5,
      title: "Roadmap Milestone",
      message: "You've completed 65% of your learning path",
      type: "roadmap",
      icon: Brain,
      time: "2 days ago",
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeColor = (type) => {
    switch (type) {
      case 'resume': return 'text-brand-maroon';
      case 'mentorship': return 'text-accent-teal';
      case 'projects': return 'text-accent-gold';
      case 'skills': return 'text-brand-crimson';
      case 'roadmap': return 'text-accent-bluegray';
      default: return 'text-gray-600';
    }
  };

  const getTypeBg = (type) => {
    switch (type) {
      case 'resume': return 'bg-brand-maroon/10';
      case 'mentorship': return 'bg-accent-teal/10';
      case 'projects': return 'bg-accent-gold/10';
      case 'skills': return 'bg-brand-crimson/10';
      case 'roadmap': return 'bg-accent-bluegray/10';
      default: return 'bg-gray-100';
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    // Here you would navigate to the relevant page
    console.log(`Navigate to ${notification.type} page`);
    onClose();
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={onToggle}
        className="relative p-2 rounded-lg text-brand-white hover:bg-brand-white/10 transition-colors duration-200"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-brand-crimson text-brand-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={onClose}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-brand-white rounded-xl shadow-lg border border-gray-200 z-20">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-brand-maroon hover:text-brand-crimson transition-colors duration-200"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No notifications
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => {
                    const Icon = notification.icon;
                    return (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
                          !notification.read ? 'bg-brand-maroon/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${getTypeBg(notification.type)}`}>
                            <Icon className={getTypeColor(notification.type)} size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-800 truncate">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-brand-maroon rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2">
                              <Clock size={12} className="text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {notification.time}
                              </span>
                              <ArrowRight size={12} className="text-gray-400 ml-auto" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <button className="w-full text-center text-sm text-brand-maroon hover:text-brand-crimson transition-colors duration-200">
                View all notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;

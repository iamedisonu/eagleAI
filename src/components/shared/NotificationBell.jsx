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
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationProvider';
import { useNavigation } from '../../context/NavigationProvider';
import JobNotificationCard from './JobNotificationCard';

const NotificationBell = ({ isOpen, onToggle, onClose }) => {
  const { 
    notifications, 
    isLoading, 
    error, 
    unreadCount, 
    loadNotifications, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  
  const { handleNotificationNavigation } = useNavigation();

  const getTypeColor = (type) => {
    switch (type) {
      case 'job-match': return 'text-accent-gold';
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
      case 'job-match': return 'bg-accent-gold/10';
      case 'resume-analysis': return 'bg-brand-maroon/10';
      case 'resume': return 'bg-brand-maroon/10';
      case 'mentorship': return 'bg-accent-teal/10';
      case 'projects': return 'bg-accent-gold/10';
      case 'skills': return 'bg-brand-crimson/10';
      case 'roadmap': return 'bg-accent-bluegray/10';
      case 'system': return 'bg-gray-100';
      case 'reminder': return 'bg-accent-bluegray/10';
      default: return 'bg-gray-100';
    }
  };


  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    handleNotificationNavigation(notification);
    onClose();
  };

  const handleJobApply = (notification) => {
    if (notification.applicationUrl) {
      window.open(notification.applicationUrl, '_blank');
    }
  };

  const handleJobViewDetails = (notification) => {
    // Navigate to career page and open job details
    handleNotificationNavigation(notification);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'job-match': return Briefcase;
      case 'resume-analysis': return FileText;
      case 'mentorship': return Users;
      case 'projects': return Code;
      case 'skills': return Brain;
      case 'roadmap': return Brain;
      default: return Bell;
    }
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
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  <RefreshCw className="animate-spin mx-auto mb-2" size={20} />
                  Loading notifications...
                </div>
              ) : error ? (
                <div className="p-4 text-center text-red-500">
                  <div className="mb-2">Failed to load notifications</div>
                  <button
                    onClick={loadNotifications}
                    className="text-sm text-brand-maroon hover:text-brand-crimson"
                  >
                    Try again
                  </button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No notifications yet
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => {
                    // Use JobNotificationCard for job-match notifications
                    if (notification.type === 'job-match') {
                      return (
                        <JobNotificationCard
                          key={notification.id}
                          notification={notification}
                          onApply={handleJobApply}
                          onViewDetails={handleJobViewDetails}
                          onMarkAsRead={markAsRead}
                        />
                      );
                    }

                    // Use regular notification card for other types
                    const Icon = getNotificationIcon(notification.type);
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

/*
============================================================================
FILE: src/components/shared/JobNotificationCard.jsx
============================================================================
PURPOSE:
  Specialized notification card component for job match notifications.
  Displays job information in a compact, clickable format within the
  notification dropdown.

FEATURES:
  - Compact job information display
  - Match score indicator
  - Company and location details
  - Skills preview
  - Click to apply functionality
  - Responsive design
  - OC brand styling

PROPS:
  - notification: Job notification object with job data
  - onApply: Function to handle job application
  - onViewDetails: Function to view full job details
  - onMarkAsRead: Function to mark notification as read
============================================================================
*/

import { 
  MapPin, 
  ExternalLink, 
  Briefcase, 
  Users, 
  DollarSign,
  Clock,
  Star
} from 'lucide-react';

const JobNotificationCard = ({ 
  notification, 
  onApply, 
  onViewDetails, 
  onMarkAsRead 
}) => {
  const handleApply = (e) => {
    e.stopPropagation();
    if (notification.applicationUrl) {
      window.open(notification.applicationUrl, '_blank');
    }
    if (onApply) {
      onApply(notification);
    }
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(notification);
    }
  };

  const handleCardClick = () => {
    if (onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    // Navigate to career page or open job details
    if (notification.applicationUrl) {
      window.open(notification.applicationUrl, '_blank');
    }
  };

  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const formatSalary = (salaryRange) => {
    if (!salaryRange) return null;
    return `$${salaryRange.min?.toLocaleString()} - $${salaryRange.max?.toLocaleString()}`;
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200 border-l-4 ${
        !notification.read ? 'bg-brand-maroon/5 border-brand-maroon' : 'border-transparent'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Company Logo Placeholder */}
        <div className="w-12 h-12 bg-gradient-to-br from-brand-maroon to-brand-crimson rounded-lg flex items-center justify-center flex-shrink-0">
          <Briefcase className="text-white" size={20} />
        </div>

        {/* Job Details */}
        <div className="flex-1 min-w-0">
          {/* Header with title and match score */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
                {notification.title.replace('New Job Match: ', '')}
              </h4>
              <p className="text-brand-maroon font-medium text-xs">
                {notification.company}
              </p>
            </div>
            
            {/* Match Score */}
            {notification.matchScore && (
              <div className={`px-2 py-1 rounded-full text-xs font-semibold ml-2 ${getMatchScoreColor(notification.matchScore)}`}>
                {notification.matchScore}%
              </div>
            )}
          </div>

          {/* Location and Job Type */}
          <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
            <div className="flex items-center gap-1">
              <MapPin size={12} />
              <span>{notification.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Briefcase size={12} />
              <span className="capitalize">{notification.jobType}</span>
            </div>
            {notification.isRemote && (
              <div className="flex items-center gap-1 text-accent-teal">
                <Users size={12} />
                <span>Remote</span>
              </div>
            )}
          </div>

          {/* Skills Preview */}
          {notification.skills && notification.skills.length > 0 && (
            <div className="mb-2">
              <div className="flex flex-wrap gap-1">
                {notification.skills.slice(0, 3).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-brand-maroon/10 text-brand-maroon text-xs rounded-md"
                  >
                    {skill}
                  </span>
                ))}
                {notification.skills.length > 3 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">
                    +{notification.skills.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Salary and Time */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              {notification.salaryRange && (
                <div className="flex items-center gap-1">
                  <DollarSign size={12} />
                  <span>{formatSalary(notification.salaryRange)}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{notification.time}</span>
              </div>
            </div>
            
            {!notification.read && (
              <div className="w-2 h-2 bg-brand-maroon rounded-full flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-1 ml-2">
          <button
            onClick={handleApply}
            className="p-1.5 text-brand-maroon hover:bg-brand-maroon/10 rounded-lg transition-colors duration-200"
            title="Apply Now"
          >
            <ExternalLink size={14} />
          </button>
          
          <button
            onClick={handleViewDetails}
            className="p-1.5 text-gray-400 hover:text-brand-maroon hover:bg-brand-maroon/10 rounded-lg transition-colors duration-200"
            title="View Details"
          >
            <Star size={14} />
          </button>
        </div>
      </div>

      {/* Message */}
      <p className="text-xs text-gray-600 mt-2 line-clamp-2">
        {notification.message}
      </p>
    </div>
  );
};

export default JobNotificationCard;

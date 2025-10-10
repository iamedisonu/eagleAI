/*
============================================================================
FILE: src/components/jobs/JobCard.jsx
============================================================================
PURPOSE:
  Individual job card component displaying job information with match score,
  company details, and action buttons for applying or saving jobs.

FEATURES:
  - Job title, company, and location display
  - Match score indicator with color coding
  - Skills and requirements preview
  - Apply and save action buttons
  - Responsive design with mobile optimization
  - OC brand styling
============================================================================
*/

import { useState } from 'react';
import { 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Bookmark, 
  Check,
  Star,
  Clock,
  Users,
  Briefcase
} from 'lucide-react';

const JobCard = ({ job, onApply, onSave, onViewDetails, showMatchScore = true }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      if (onApply) {
        await onApply(job);
      }
      
      // Check if URL is valid before opening
      if (job.urlStatus && !job.urlStatus.isValid) {
        alert('This job posting is no longer available. The application link may have expired.');
        return;
      }
      
      // Open application URL in new tab
      window.open(job.applicationUrl, '_blank');
    } catch (error) {
      console.error('Error applying to job:', error);
      alert('Unable to open application link. Please try again later.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    if (onSave) {
      onSave(job, !isSaved);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(job);
    }
  };

  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently posted';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const formatSalary = (salaryRange) => {
    if (!salaryRange) return null;
    return `$${salaryRange.min?.toLocaleString()} - $${salaryRange.max?.toLocaleString()}`;
  };

  return (
    <div className="bg-brand-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Header with match score and save button */}
      <div className="p-4 md:p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 line-clamp-2">
                {job.title}
              </h3>
              {job.isNew && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 animate-pulse">
                  NEW
                </span>
              )}
              {job.urlStatus && !job.urlStatus.isValid && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                  EXPIRED
                </span>
              )}
            </div>
            <p className="text-brand-maroon font-semibold text-sm md:text-base">
              {job.company}
            </p>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            {/* Match Score */}
            {showMatchScore && job.studentMatch?.matchScore && (
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getMatchScoreColor(job.studentMatch.matchScore)}`}>
                {job.studentMatch.matchScore}% match
              </div>
            )}
            
            {/* Save Button */}
            <button
              onClick={handleSave}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                isSaved 
                  ? 'text-accent-gold bg-accent-gold/10' 
                  : 'text-gray-400 hover:text-accent-gold hover:bg-accent-gold/10'
              }`}
            >
              {isSaved ? <Check size={20} /> : <Bookmark size={20} />}
            </button>
          </div>
        </div>

        {/* Location and Job Type */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <MapPin size={16} />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Briefcase size={16} />
            <span className="capitalize">{job.jobType}</span>
          </div>
          {job.isRemote && (
            <div className="flex items-center gap-1 text-accent-teal">
              <Users size={16} />
              <span>Remote</span>
            </div>
          )}
        </div>

        {/* Posted Date */}
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock size={14} />
          <span>Posted {formatDate(job.postedDate)}</span>
        </div>
      </div>

      {/* Description */}
      <div className="p-4 md:p-6">
        <p className="text-gray-700 text-sm md:text-base line-clamp-3 mb-4">
          {job.shortDescription || job.description}
        </p>

        {/* Skills Preview */}
        {job.skills && job.skills.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Key Skills:</h4>
            <div className="flex flex-wrap gap-2">
              {job.skills.slice(0, 6).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-brand-maroon/10 text-brand-maroon text-xs rounded-md"
                >
                  {skill}
                </span>
              ))}
              {job.skills.length > 6 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                  +{job.skills.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Requirements Preview */}
        {job.requirements && job.requirements.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Requirements:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {job.requirements.slice(0, 3).map((req, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-accent-gold mt-1">•</span>
                  <span className="line-clamp-2">{req}</span>
                </li>
              ))}
              {job.requirements.length > 3 && (
                <li className="text-gray-500 text-xs">
                  +{job.requirements.length - 3} more requirements
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleApply}
            disabled={isApplying || !job.applicationUrl || (job.urlStatus && !job.urlStatus.isValid)}
            className="flex-1 bg-brand-maroon text-brand-white px-4 py-3 rounded-lg font-semibold hover:bg-brand-crimson transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isApplying ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Applying...
              </>
            ) : (
              <>
                <ExternalLink size={16} />
                {!job.applicationUrl ? 'Application Unavailable' : 
                 (job.urlStatus && !job.urlStatus.isValid) ? 'Link Expired' : 'Apply Now'}
              </>
            )}
          </button>
          
          <button
            onClick={handleViewDetails}
            className="px-4 py-3 border border-brand-maroon text-brand-maroon rounded-lg font-semibold hover:bg-brand-maroon hover:text-brand-white transition-colors duration-200"
          >
            View Details
          </button>
        </div>
      </div>

      {/* Footer with additional info */}
      <div className="px-4 md:px-6 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            {job.salaryRange && (
              <span className="font-medium text-gray-700">
                {formatSalary(job.salaryRange)}
              </span>
            )}
            <span className="capitalize">{job.experienceLevel} level</span>
            {job.isRemote && (
              <span className="text-accent-teal font-medium">Remote Available</span>
            )}
          </div>
          
          {job.categories && job.categories.length > 0 && (
            <div className="flex items-center gap-1">
              <Star size={12} />
              <span className="capitalize">{job.categories[0]}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;


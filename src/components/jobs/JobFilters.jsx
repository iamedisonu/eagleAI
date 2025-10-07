/*
============================================================================
FILE: src/components/jobs/JobFilters.jsx
============================================================================
PURPOSE:
  Filter component for job matches allowing users to filter by category,
  job type, match score, location, and other criteria.

FEATURES:
  - Category and job type filtering
  - Match score range slider
  - Location filtering with remote option
  - Clear all filters functionality
  - Responsive design
  - OC brand styling
============================================================================
*/

import { useState, useEffect } from 'react';
import { X, MapPin, Briefcase, Star } from 'lucide-react';

const JobFilters = ({ filters, onFiltersChange, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  // Available filter options
  const categories = [
    'software-engineering',
    'data-science',
    'product-management',
    'marketing',
    'design',
    'finance',
    'consulting'
  ];

  const jobTypes = [
    'internship',
    'full-time',
    'part-time',
    'contract'
  ];

  const locations = [
    'New York, NY',
    'San Francisco, CA',
    'Seattle, WA',
    'Austin, TX',
    'Boston, MA',
    'Chicago, IL',
    'Los Angeles, CA',
    'Remote'
  ];

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (filterType, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleArrayFilterChange = (filterType, value, checked) => {
    setLocalFilters(prev => ({
      ...prev,
      [filterType]: checked
        ? [...prev[filterType], value]
        : prev[filterType].filter(item => item !== value)
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      categories: [],
      jobTypes: [],
      minMatchScore: 0,
      locations: [],
      isRemote: false
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.categories.length > 0) count++;
    if (localFilters.jobTypes.length > 0) count++;
    if (localFilters.minMatchScore > 0) count++;
    if (localFilters.locations.length > 0) count++;
    if (localFilters.isRemote) count++;
    return count;
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <div className="flex items-center gap-2">
          {getActiveFilterCount() > 0 && (
            <span className="text-sm text-gray-600">
              {getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} active
            </span>
          )}
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Categories */}
        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Briefcase size={16} />
            Categories
          </h4>
          <div className="space-y-2">
            {categories.map(category => (
              <label key={category} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localFilters.categories.includes(category)}
                  onChange={(e) => handleArrayFilterChange('categories', category, e.target.checked)}
                  className="rounded border-gray-300 text-brand-maroon focus:ring-brand-maroon"
                />
                <span className="text-sm text-gray-700 capitalize">
                  {category.replace('-', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Job Types */}
        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Briefcase size={16} />
            Job Types
          </h4>
          <div className="space-y-2">
            {jobTypes.map(type => (
              <label key={type} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localFilters.jobTypes.includes(type)}
                  onChange={(e) => handleArrayFilterChange('jobTypes', type, e.target.checked)}
                  className="rounded border-gray-300 text-brand-maroon focus:ring-brand-maroon"
                />
                <span className="text-sm text-gray-700 capitalize">
                  {type.replace('-', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Match Score */}
        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Star size={16} />
            Minimum Match Score
          </h4>
          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max="100"
              value={localFilters.minMatchScore}
              onChange={(e) => handleFilterChange('minMatchScore', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>0%</span>
              <span className="font-semibold text-brand-maroon">
                {localFilters.minMatchScore}%
              </span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Locations */}
        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <MapPin size={16} />
            Locations
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {locations.map(location => (
              <label key={location} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localFilters.locations.includes(location)}
                  onChange={(e) => handleArrayFilterChange('locations', location, e.target.checked)}
                  className="rounded border-gray-300 text-brand-maroon focus:ring-brand-maroon"
                />
                <span className="text-sm text-gray-700">{location}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Remote Work */}
        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Work Arrangement</h4>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={localFilters.isRemote}
              onChange={(e) => handleFilterChange('isRemote', e.target.checked)}
              className="rounded border-gray-300 text-brand-maroon focus:ring-brand-maroon"
            />
            <span className="text-sm text-gray-700">Remote only</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={handleClearFilters}
          className="text-sm text-gray-600 hover:text-brand-maroon transition-colors"
        >
          Clear all filters
        </button>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-brand-maroon text-white rounded-lg hover:bg-brand-crimson transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #8B1538;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #8B1538;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
};

export default JobFilters;


/*
============================================================================
FILE: src/components/shared/LoadingSpinner.jsx
============================================================================
PURPOSE:
  Reusable loading spinner component for code splitting and async operations.
  Provides consistent loading states across the application.

FEATURES:
  - Multiple size variants (small, medium, large)
  - Customizable color and animation
  - Accessible loading indicators
  - OC brand styling
  - Skeleton loading for better perceived performance
============================================================================
*/

import { RefreshCw, Loader2 } from 'lucide-react';

const LoadingSpinner = ({ 
  size = 'medium', 
  variant = 'spinner',
  color = 'brand-maroon',
  text = 'Loading...',
  showText = true,
  className = ''
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
    xl: 'text-lg'
  };

  const colorClasses = {
    'brand-maroon': 'text-brand-maroon',
    'brand-crimson': 'text-brand-crimson',
    'accent-teal': 'text-accent-teal',
    'accent-gold': 'text-accent-gold',
    'gray': 'text-gray-600',
    'white': 'text-white'
  };

  const Icon = variant === 'dots' ? Loader2 : RefreshCw;

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Icon 
        className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`}
        aria-hidden="true"
      />
      {showText && (
        <p className={`${textSizeClasses[size]} ${colorClasses[color]} font-medium`}>
          {text}
        </p>
      )}
    </div>
  );
};

// Skeleton loading component for better perceived performance
export const SkeletonLoader = ({ 
  lines = 3, 
  className = '',
  showAvatar = false 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {showAvatar && (
        <div className="flex items-center space-x-4 mb-4">
          <div className="rounded-full bg-gray-300 h-10 w-10"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            {index === 0 && <div className="h-4 bg-gray-300 rounded w-5/6"></div>}
            {index === 1 && <div className="h-4 bg-gray-300 rounded w-4/6"></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

// Card skeleton for job listings
export const CardSkeleton = ({ count = 6, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
            <div className="h-6 bg-gray-300 rounded w-16"></div>
          </div>
          <div className="space-y-3 mb-4">
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            <div className="h-4 bg-gray-300 rounded w-4/6"></div>
          </div>
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-300 rounded w-20"></div>
            <div className="h-8 bg-gray-300 rounded w-24"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Table skeleton for data tables
export const TableSkeleton = ({ 
  rows = 5, 
  columns = 4, 
  className = '' 
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="h-6 bg-gray-300 rounded w-1/4 animate-pulse"></div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div 
                  key={colIndex} 
                  className={`h-4 bg-gray-300 rounded animate-pulse ${
                    colIndex === 0 ? 'w-1/4' : 
                    colIndex === 1 ? 'w-1/3' : 
                    colIndex === 2 ? 'w-1/6' : 'w-1/5'
                  }`}
                ></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;

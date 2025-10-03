/*
============================================================================
FILE: src/components/shared/ProgressBar.jsx
============================================================================
PURPOSE:
  Reusable progress bar component for displaying completion percentages,
  skill levels, and other progress indicators.

FEATURES:
  - Multiple colors: blue, green, red, yellow
  - Multiple sizes: sm, md, lg
  - Optional label display
  - Smooth animations
  - Customizable styling

PROPS:
  - progress: number (0-100)
  - color: 'blue' | 'green' | 'red' | 'yellow'
  - size: 'sm' | 'md' | 'lg'
  - showLabel: boolean
  - className: string (additional classes)
  - label: string (custom label)
============================================================================
*/

import React from 'react';

const ProgressBar = ({ 
  progress = 0, 
  color = 'blue', 
  size = 'md', 
  showLabel = true, 
  className = '', 
  label,
  ...props 
}) => {
  // Ensure progress is between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progress));
  
  // Base progress bar classes
  const baseClasses = 'w-full bg-gray-200 rounded-full overflow-hidden';
  
  // Size classes
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };
  
  // Color classes for the progress fill
  const colorClasses = {
    blue: 'bg-[#003459]',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500'
  };
  
  // Combine classes
  const progressBarClasses = `${baseClasses} ${sizeClasses[size]} ${className}`.trim();
  const progressFillClasses = `${colorClasses[color]} h-full transition-all duration-300 ease-out`;
  
  return (
    <div className="w-full" {...props}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-gray-700">
            {label || 'Progress'}
          </span>
          <span className="text-xs font-medium text-gray-700">
            {clampedProgress}%
          </span>
        </div>
      )}
      <div className={progressBarClasses}>
        <div 
          className={progressFillClasses}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

export default React.memo(ProgressBar);

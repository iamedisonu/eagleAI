/*
============================================================================
FILE: src/components/shared/Badge.jsx
============================================================================
PURPOSE:
  Reusable badge component for displaying status, priority, and category labels.
  Used throughout the application for consistent badge styling.

FEATURES:
  - Multiple variants: default, primary, success, warning, danger
  - Multiple sizes: sm, md, lg
  - Rounded corners with proper padding
  - Consistent color schemes

PROPS:
  - variant: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  - size: 'sm' | 'md' | 'lg'
  - className: string (additional classes)
  - children: React node (badge text)
============================================================================
*/

import React from 'react';

const Badge = ({ 
  variant = 'default', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}) => {
  // Base badge classes
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  // Variant classes
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-[#003459] text-white',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800'
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-xs',
    lg: 'px-3 py-2 text-sm'
  };
  
  // Combine all classes
  const badgeClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();
  
  return (
    <span className={badgeClasses} {...props}>
      {children}
    </span>
  );
};

export default React.memo(Badge);

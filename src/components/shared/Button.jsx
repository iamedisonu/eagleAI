/*
============================================================================
FILE: src/components/shared/Button.jsx
============================================================================
PURPOSE:
  Reusable button component with multiple variants, sizes, and icon support.
  Used throughout the application for consistent styling and behavior.

FEATURES:
  - Multiple variants: primary, secondary, success, danger
  - Multiple sizes: sm, md, lg
  - Icon support with proper spacing
  - Full width option for mobile layouts
  - Hover and focus states
  - Disabled state support

PROPS:
  - variant: 'primary' | 'secondary' | 'success' | 'danger' | 'default'
  - size: 'sm' | 'md' | 'lg'
  - fullWidth: boolean
  - icon: React component (from lucide-react)
  - disabled: boolean
  - className: string (additional classes)
  - children: React node (button text)
============================================================================
*/

import React from 'react';

const Button = ({ 
  variant = 'default', 
  size = 'md', 
  fullWidth = false, 
  icon: Icon, 
  disabled = false, 
  className = '', 
  children, 
  ...props 
}) => {
  // Base button classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-oc-maroon text-brand-white hover:bg-oc-maroon/90 focus:ring-oc-maroon shadow-md hover:shadow-lg',
    secondary: 'bg-oc-silver text-brand-black hover:bg-oc-silver/80 focus:ring-oc-silver',
    success: 'bg-oc-sky text-brand-white hover:bg-oc-sky/80 focus:ring-oc-sky shadow-md hover:shadow-lg',
    danger: 'bg-oc-salmon text-brand-white hover:bg-oc-salmon/80 focus:ring-oc-salmon shadow-md hover:shadow-lg',
    warning: 'bg-oc-marigold text-brand-black hover:bg-oc-marigold/80 focus:ring-oc-marigold shadow-md hover:shadow-lg',
    default: 'bg-brand-white text-brand-black border border-neutral-300 hover:bg-brand-nearwhite-1 focus:ring-neutral-500'
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  // Icon size classes
  const iconSizeClasses = {
    sm: 14,
    md: 16,
    lg: 18
  };
  
  // Full width class
  const fullWidthClass = fullWidth ? 'w-full' : '';
  
  // Combine all classes
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidthClass} ${className}`.trim();
  
  return (
    <button 
      className={buttonClasses}
      disabled={disabled}
      {...props}
    >
      {Icon && (
        <Icon 
          size={iconSizeClasses[size]} 
          className="mr-2 flex-shrink-0" 
        />
      )}
      {children}
    </button>
  );
};

export default React.memo(Button);

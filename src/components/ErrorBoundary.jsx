/*
============================================================================
FILE: src/components/ErrorBoundary.jsx
============================================================================
PURPOSE:
  React Error Boundary component that catches JavaScript errors anywhere in the
  component tree and displays a fallback UI instead of crashing the entire app.
  This provides graceful error handling and better user experience.

FEATURES:
  - Catches JavaScript errors in child components
  - Displays user-friendly error message
  - Provides refresh button for recovery
  - Logs errors for debugging purposes
  - Prevents entire app from crashing
  - Customizable error UI with OC branding

ARCHITECTURE:
  - Class component (required for Error Boundary)
  - Implements componentDidCatch lifecycle method
  - Uses getDerivedStateFromError for state updates
  - Renders fallback UI when errors occur
  - Maintains error state for debugging

ERROR HANDLING:
  - Catches errors in render methods
  - Catches errors in lifecycle methods
  - Catches errors in constructors
  - Does NOT catch errors in event handlers
  - Does NOT catch errors in async code
  - Does NOT catch errors during server-side rendering

USAGE:
  Wrap any component tree that might throw errors:
  <ErrorBoundary>
    <ComponentThatMightThrow />
  </ErrorBoundary>

PERFORMANCE CONSIDERATIONS:
  - Only re-renders when errors occur
  - Minimal impact on normal operation
  - Efficient error state management
  - Clean error recovery mechanism
============================================================================
*/

import React from 'react';

/**
 * Error Boundary Class Component
 * 
 * Catches JavaScript errors anywhere in the component tree and displays
 * a fallback UI. This prevents the entire application from crashing
 * when an error occurs in any child component.
 * 
 * @class ErrorBoundary
 * @extends {React.Component}
 */
class ErrorBoundary extends React.Component {
  /**
   * Constructor for ErrorBoundary component
   * 
   * @param {Object} props - Component props
   */
  constructor(props) {
    super(props);
    
    // Initialize error state
    this.state = { 
      hasError: false,    // Flag indicating if an error occurred
      error: null         // The error object that was thrown
    };
  }

  /**
   * Static method called when an error is thrown in a child component
   * 
   * This method is called during the render phase, so side effects are not allowed.
   * It should return a state update to indicate that an error occurred.
   * 
   * @param {Error} error - The error that was thrown
   * @returns {Object} State update object
   */
  static getDerivedStateFromError(error) {
    // Update state to indicate an error occurred and store the error
    return { hasError: true, error };
  }

  /**
   * Lifecycle method called when an error is caught
   * 
   * This method is called during the commit phase, so side effects are allowed.
   * It's used for logging errors and performing cleanup operations.
   * 
   * @param {Error} error - The error that was thrown
   * @param {Object} errorInfo - Additional error information
   */
  componentDidCatch(error, errorInfo) {
    // Log error for debugging purposes
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // In production, you might want to send this to an error reporting service
    // Example: errorReportingService.captureException(error, { extra: errorInfo });
  }

  /**
   * Render method that displays either the children or error UI
   * 
   * @returns {JSX.Element} Either the children components or error fallback UI
   */
  render() {
    // If an error occurred, render the fallback UI
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-red-100 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-4">
            {/* Error Icon */}
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg 
                className="w-6 h-6 text-red-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
            
            {/* Error Message */}
            <h2 className="text-xl font-bold text-red-600 mb-4 text-center">
              Something went wrong
            </h2>
            <p className="text-gray-700 mb-4 text-center">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            
            {/* Recovery Actions */}
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-brand-maroon text-white px-4 py-2 rounded hover:bg-brand-crimson transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-maroon"
              >
                Refresh Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Try Again
              </button>
            </div>
            
            {/* Development Error Details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  Error Details (Development Only)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto max-h-32">
                  <pre className="whitespace-pre-wrap">
                    {this.state.error.toString()}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    // If no error occurred, render the children normally
    return this.props.children;
  }
}

export default ErrorBoundary;

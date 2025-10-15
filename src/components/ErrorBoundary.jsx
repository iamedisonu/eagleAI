/*
============================================================================
FILE: src/components/ErrorBoundary.jsx
============================================================================
PURPOSE:
  Enhanced error boundary component with Sentry integration for comprehensive error tracking.
  Provides user-friendly error messages and detailed error reporting.

FEATURES:
  - Sentry error reporting
  - User-friendly error UI
  - Error recovery options
  - Performance monitoring
  - Accessibility support
============================================================================
*/

import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import monitoringService from '../services/simpleMonitoringService';

// Conditional Sentry import
let Sentry = null;
try {
  Sentry = require('@sentry/react');
} catch (error) {
  console.warn('Sentry not available:', error.message);
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error details
    // Send to Sentry
    let errorId = null;
    if (Sentry) {
      errorId = Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        },
        tags: {
          component: this.props.componentName || 'Unknown',
          boundary: 'ErrorBoundary'
        },
        extra: {
          errorInfo,
          retryCount: this.state.retryCount,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString()
        }
      });
    }

    this.setState({
      error,
      errorInfo,
      errorId
    });

    // Track error in monitoring service
    monitoringService.trackError(error, {
      component: this.props.componentName || 'ErrorBoundary',
      action: 'component_error',
      errorInfo: errorInfo.componentStack
    });
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: prevState.retryCount + 1
    }));

    // Track retry attempt
    monitoringService.trackEvent('error_retry', {
      component: this.props.componentName || 'ErrorBoundary',
      retryCount: this.state.retryCount + 1
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
    monitoringService.trackEvent('error_go_home', {
      component: this.props.componentName || 'ErrorBoundary'
    });
  };

  handleReportBug = () => {
    // Open Sentry issue if available
    if (this.state.errorId) {
      const sentryUrl = `https://sentry.io/organizations/your-org/issues/${this.state.errorId}/`;
      window.open(sentryUrl, '_blank');
    }

    monitoringService.trackEvent('error_report_bug', {
      component: this.props.componentName || 'ErrorBoundary',
      errorId: this.state.errorId
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom error UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo, this.handleRetry);
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-brand-nearwhite-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-brand-white rounded-xl shadow-lg border border-gray-200 p-6">
            {/* Error Icon */}
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-600" aria-hidden="true" />
            </div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Oops! Something went wrong
            </h1>

            {/* Error Description */}
            <p className="text-gray-600 text-center mb-6">
              We're sorry, but something unexpected happened. Our team has been notified and is working to fix this issue.
            </p>

            {/* Error ID for support */}
            {this.state.errorId && (
              <div className="bg-gray-50 rounded-lg p-3 mb-6">
                <p className="text-sm text-gray-600 mb-1">Error ID:</p>
                <code className="text-xs text-gray-800 font-mono break-all">
                  {this.state.errorId}
                </code>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full flex items-center justify-center gap-2 bg-brand-maroon text-brand-white px-4 py-3 rounded-lg font-semibold hover:bg-brand-crimson transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-maroon focus:ring-offset-2"
                aria-label="Try again"
              >
                <RefreshCw size={20} aria-hidden="true" />
                Try Again
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                aria-label="Go to home page"
              >
                <Home size={20} aria-hidden="true" />
                Go Home
              </button>

              {this.state.errorId && (
                <button
                  onClick={this.handleReportBug}
                  className="w-full flex items-center justify-center gap-2 bg-blue-100 text-blue-700 px-4 py-3 rounded-lg font-semibold hover:bg-blue-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Report this bug"
                >
                  <Bug size={20} aria-hidden="true" />
                  Report Bug
                </button>
              )}
            </div>

            {/* Technical Details (collapsible) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6">
                <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                  Technical Details (Development Only)
                </summary>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-auto max-h-40">
                    {this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}

            {/* Accessibility announcement */}
            <div className="sr-only" aria-live="polite" aria-atomic="true">
              An error has occurred. Error ID: {this.state.errorId || 'unknown'}. 
              Please try again or contact support if the problem persists.
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Sentry integration (conditional)
export const SentryErrorBoundary = Sentry ? Sentry.withErrorBoundary(ErrorBoundary, {
  fallback: ({ error, resetError }) => (
    <div className="min-h-screen bg-brand-nearwhite-1 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-brand-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
          <AlertTriangle className="w-8 h-8 text-red-600" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-600 text-center mb-6">
          We've been notified about this error and are working to fix it.
        </p>
        <button
          onClick={resetError}
          className="w-full bg-brand-maroon text-brand-white px-4 py-3 rounded-lg font-semibold hover:bg-brand-crimson transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    </div>
  ),
  beforeCapture: (scope, error, errorInfo) => {
    scope.setTag('errorBoundary', true);
    scope.setContext('errorInfo', errorInfo);
  }
}) : ErrorBoundary;

export default ErrorBoundary;
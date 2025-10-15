/*
============================================================================
FILE: src/services/monitoringService.js
============================================================================
PURPOSE:
  Comprehensive monitoring service for error tracking, analytics, and performance monitoring.
  Integrates Sentry for error tracking, Google Analytics for user behavior, and Web Vitals for performance.

FEATURES:
  - Error tracking and reporting with Sentry
  - User analytics with Google Analytics
  - Performance monitoring with Web Vitals
  - Custom event tracking
  - Performance metrics collection
  - User session tracking
============================================================================
*/

import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Conditional Sentry import
let Sentry = null;
try {
  Sentry = require('@sentry/react');
} catch (error) {
  console.warn('Sentry not available:', error.message);
}

class MonitoringService {
  constructor() {
    this.isInitialized = false;
    this.analytics = null;
    this.performanceMetrics = {};
    this.userSession = {
      startTime: Date.now(),
      pageViews: 0,
      events: []
    };
  }

  /**
   * Initialize monitoring services
   * @param {Object} config - Configuration object
   */
  async initialize(config = {}) {
    try {
      // Initialize Sentry for error tracking
      if (config.sentry?.dsn && Sentry) {
        Sentry.init({
          dsn: config.sentry.dsn,
          environment: config.sentry.environment || 'development',
          tracesSampleRate: config.sentry.tracesSampleRate || 0.1,
          profilesSampleRate: config.sentry.profilesSampleRate || 0.1,
          beforeSend(event) {
            // Filter out non-critical errors in development
            if (config.sentry.environment === 'development') {
              if (event.exception) {
                const error = event.exception.values[0];
                if (error.type === 'ChunkLoadError' || error.type === 'Loading chunk') {
                  return null; // Don't send chunk load errors
                }
              }
            }
            return event;
          },
        });
      }

      // Initialize Google Analytics
      if (config.analytics?.measurementId) {
        await this.initializeAnalytics(config.analytics);
      }

      // Initialize Web Vitals monitoring
      this.initializeWebVitals();

      // Initialize custom performance monitoring
      this.initializePerformanceMonitoring();

      this.isInitialized = true;
      console.log('Monitoring services initialized successfully');
    } catch (error) {
      console.error('Failed to initialize monitoring services:', error);
    }
  }

  /**
   * Initialize Google Analytics
   * @param {Object} config - Analytics configuration
   */
  async initializeAnalytics(config) {
    try {
      // Load Google Analytics script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${config.measurementId}`;
      document.head.appendChild(script);

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      window.gtag = gtag;

      gtag('js', new Date());
      gtag('config', config.measurementId, {
        page_title: document.title,
        page_location: window.location.href,
        custom_map: {
          custom_parameter_1: 'user_type',
          custom_parameter_2: 'feature_usage'
        }
      });

      this.analytics = gtag;
      console.log('Google Analytics initialized');
    } catch (error) {
      console.error('Failed to initialize Google Analytics:', error);
    }
  }

  /**
   * Initialize Web Vitals monitoring
   */
  initializeWebVitals() {
    // Core Web Vitals
    getCLS((metric) => this.recordWebVital('CLS', metric));
    getFID((metric) => this.recordWebVital('FID', metric));
    getLCP((metric) => this.recordWebVital('LCP', metric));

    // Additional metrics
    getFCP((metric) => this.recordWebVital('FCP', metric));
    getTTFB((metric) => this.recordWebVital('TTFB', metric));
  }

  /**
   * Initialize custom performance monitoring
   */
  initializePerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        this.recordPerformanceMetric('page_load_time', navigation.loadEventEnd - navigation.loadEventStart);
        this.recordPerformanceMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
        this.recordPerformanceMetric('first_byte', navigation.responseStart - navigation.requestStart);
      }
    });

    // Monitor memory usage (if available)
    if ('memory' in performance) {
      setInterval(() => {
        this.recordPerformanceMetric('memory_used', performance.memory.usedJSHeapSize);
        this.recordPerformanceMetric('memory_total', performance.memory.totalJSHeapSize);
      }, 30000); // Every 30 seconds
    }

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordPerformanceMetric('long_task', entry.duration);
        }
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    }
  }

  /**
   * Record Web Vital metric
   * @param {string} name - Metric name
   * @param {Object} metric - Metric data
   */
  recordWebVital(name, metric) {
    const data = {
      name,
      value: metric.value,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
      timestamp: Date.now()
    };

    this.performanceMetrics[name] = data;

    // Send to analytics
    if (this.analytics) {
      this.analytics('event', 'web_vital', {
        metric_name: name,
        metric_value: Math.round(metric.value),
        metric_delta: Math.round(metric.delta)
      });
    }

    // Send to Sentry
    if (Sentry) {
      Sentry.addBreadcrumb({
        category: 'web-vital',
        message: `${name}: ${Math.round(metric.value)}`,
        level: 'info',
        data
      });
    }

    console.log(`Web Vital recorded: ${name} = ${Math.round(metric.value)}`);
  }

  /**
   * Record custom performance metric
   * @param {string} name - Metric name
   * @param {number} value - Metric value
   */
  recordPerformanceMetric(name, value) {
    this.performanceMetrics[name] = {
      value,
      timestamp: Date.now()
    };

    // Send to analytics
    if (this.analytics) {
      this.analytics('event', 'performance_metric', {
        metric_name: name,
        metric_value: Math.round(value)
      });
    }
  }

  /**
   * Track user event
   * @param {string} eventName - Event name
   * @param {Object} parameters - Event parameters
   */
  trackEvent(eventName, parameters = {}) {
    const event = {
      name: eventName,
      parameters,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.userSession.events.push(event);

    // Send to analytics
    if (this.analytics) {
      this.analytics('event', eventName, parameters);
    }

    // Send to Sentry as breadcrumb
    if (Sentry) {
      Sentry.addBreadcrumb({
        category: 'user-action',
        message: eventName,
        level: 'info',
        data: parameters
      });
    }

    console.log(`Event tracked: ${eventName}`, parameters);
  }

  /**
   * Track page view
   * @param {string} pageName - Page name
   * @param {string} pagePath - Page path
   */
  trackPageView(pageName, pagePath = window.location.pathname) {
    this.userSession.pageViews++;

    // Send to analytics
    if (this.analytics) {
      this.analytics('event', 'page_view', {
        page_title: pageName,
        page_location: window.location.href,
        page_path: pagePath
      });
    }

    // Send to Sentry
    if (Sentry) {
      Sentry.addBreadcrumb({
        category: 'navigation',
        message: `Page view: ${pageName}`,
        level: 'info',
        data: {
          pageName,
          pagePath,
          pageViews: this.userSession.pageViews
        }
      });
    }

    console.log(`Page view tracked: ${pageName} (${pagePath})`);
  }

  /**
   * Track user error
   * @param {Error} error - Error object
   * @param {Object} context - Additional context
   */
  trackError(error, context = {}) {
    // Send to Sentry
    if (Sentry) {
      Sentry.captureException(error, {
        tags: {
          component: context.component || 'unknown',
          action: context.action || 'unknown'
        },
        extra: context
      });
    }

    // Track as custom event
    this.trackEvent('error_occurred', {
      error_message: error.message,
      error_stack: error.stack,
      component: context.component,
      action: context.action,
      url: window.location.href
    });

    console.error('Error tracked:', error, context);
  }

  /**
   * Track user session
   * @param {Object} userData - User data
   */
  trackUserSession(userData) {
    // Set user context in Sentry
    if (Sentry) {
      Sentry.setUser({
        id: userData.id,
        email: userData.email,
        username: userData.name
      });
    }

    // Track user properties in analytics
    if (this.analytics) {
      this.analytics('config', 'user_properties', {
        user_id: userData.id,
        user_type: userData.role || 'student',
        university: userData.university || 'unknown'
      });
    }

    this.trackEvent('user_session_start', {
      user_id: userData.id,
      user_type: userData.role,
      university: userData.university
    });
  }

  /**
   * Track feature usage
   * @param {string} feature - Feature name
   * @param {Object} data - Feature usage data
   */
  trackFeatureUsage(feature, data = {}) {
    this.trackEvent('feature_used', {
      feature_name: feature,
      ...data
    });
  }

  /**
   * Track API call
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {number} duration - Response time
   * @param {number} status - HTTP status
   */
  trackApiCall(endpoint, method, duration, status) {
    this.trackEvent('api_call', {
      endpoint,
      method,
      duration,
      status,
      success: status >= 200 && status < 300
    });

    // Record as performance metric
    this.recordPerformanceMetric(`api_${endpoint.replace(/\//g, '_')}`, duration);
  }

  /**
   * Get performance metrics
   * @returns {Object} - Performance metrics
   */
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      session: {
        duration: Date.now() - this.userSession.startTime,
        pageViews: this.userSession.pageViews,
        events: this.userSession.events.length
      }
    };
  }

  /**
   * Get user session data
   * @returns {Object} - User session data
   */
  getUserSession() {
    return {
      ...this.userSession,
      performance: this.getPerformanceMetrics()
    };
  }

  /**
   * Set custom tags for Sentry
   * @param {Object} tags - Tags to set
   */
  setCustomTags(tags) {
    if (Sentry) {
      Sentry.setTags(tags);
    }
  }

  /**
   * Set custom context for Sentry
   * @param {string} key - Context key
   * @param {Object} context - Context data
   */
  setCustomContext(key, context) {
    if (Sentry) {
      Sentry.setContext(key, context);
    }
  }

  /**
   * Flush all pending data
   */
  async flush() {
    try {
      if (Sentry) {
        await Sentry.flush();
      }
      console.log('Monitoring data flushed');
    } catch (error) {
      console.error('Failed to flush monitoring data:', error);
    }
  }
}

// Create singleton instance
const monitoringService = new MonitoringService();

export default monitoringService;

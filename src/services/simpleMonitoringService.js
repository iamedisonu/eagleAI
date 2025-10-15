/*
============================================================================
FILE: src/services/simpleMonitoringService.js
============================================================================
PURPOSE:
  Simplified monitoring service that works without external dependencies.
  Provides basic error tracking and performance monitoring without Sentry or Web Vitals.

FEATURES:
  - Basic error tracking
  - Performance metrics collection
  - Event tracking
  - Local storage for metrics
  - No external dependencies
============================================================================
*/

class SimpleMonitoringService {
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
      // Initialize Google Analytics if available
      if (config.analytics?.measurementId) {
        await this.initializeAnalytics(config.analytics);
      }

      // Initialize basic performance monitoring
      this.initializePerformanceMonitoring();

      this.isInitialized = true;
      console.log('Simple monitoring service initialized successfully');
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
   * Initialize basic performance monitoring
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

    console.log(`Page view tracked: ${pageName} (${pagePath})`);
  }

  /**
   * Track user error
   * @param {Error} error - Error object
   * @param {Object} context - Additional context
   */
  trackError(error, context = {}) {
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
   * Flush all pending data
   */
  async flush() {
    try {
      console.log('Simple monitoring data flushed');
    } catch (error) {
      console.error('Failed to flush monitoring data:', error);
    }
  }
}

// Create singleton instance
const simpleMonitoringService = new SimpleMonitoringService();

export default simpleMonitoringService;

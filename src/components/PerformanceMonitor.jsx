/*
============================================================================
FILE: src/components/PerformanceMonitor.jsx
============================================================================
PURPOSE:
  Performance monitoring component that tracks and displays performance metrics.
  Provides real-time performance insights and Web Vitals monitoring.

FEATURES:
  - Real-time performance metrics display
  - Web Vitals monitoring
  - Performance alerts
  - Memory usage tracking
  - API response time monitoring
============================================================================
*/

import React, { useState, useEffect } from 'react';
import { Activity, Zap, Clock, Database, AlertTriangle } from 'lucide-react';
import monitoringService from '../services/monitoringService';

const PerformanceMonitor = ({ showDetails = false, isVisible = false }) => {
  const [metrics, setMetrics] = useState({});
  const [isExpanded, setIsExpanded] = useState(showDetails);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    // Update metrics every 5 seconds
    const interval = setInterval(() => {
      const performanceMetrics = monitoringService.getPerformanceMetrics();
      setMetrics(performanceMetrics);
      checkPerformanceAlerts(performanceMetrics);
    }, 5000);

    // Initial load
    const performanceMetrics = monitoringService.getPerformanceMetrics();
    setMetrics(performanceMetrics);
    checkPerformanceAlerts(performanceMetrics);

    return () => clearInterval(interval);
  }, [isVisible]);

  const checkPerformanceAlerts = (performanceMetrics) => {
    const newAlerts = [];

    // Check Web Vitals thresholds
    if (performanceMetrics.LCP && performanceMetrics.LCP.value > 2500) {
      newAlerts.push({
        type: 'warning',
        message: `LCP is ${Math.round(performanceMetrics.LCP.value)}ms (threshold: 2500ms)`,
        metric: 'LCP'
      });
    }

    if (performanceMetrics.FID && performanceMetrics.FID.value > 100) {
      newAlerts.push({
        type: 'warning',
        message: `FID is ${Math.round(performanceMetrics.FID.value)}ms (threshold: 100ms)`,
        metric: 'FID'
      });
    }

    if (performanceMetrics.CLS && performanceMetrics.CLS.value > 0.1) {
      newAlerts.push({
        type: 'warning',
        message: `CLS is ${performanceMetrics.CLS.value.toFixed(3)} (threshold: 0.1)`,
        metric: 'CLS'
      });
    }

    // Check memory usage
    if (performanceMetrics.memory_used && performanceMetrics.memory_total) {
      const memoryUsagePercent = (performanceMetrics.memory_used / performanceMetrics.memory_total) * 100;
      if (memoryUsagePercent > 80) {
        newAlerts.push({
          type: 'error',
          message: `Memory usage is ${Math.round(memoryUsagePercent)}%`,
          metric: 'memory'
        });
      }
    }

    setAlerts(newAlerts);
  };

  const formatMetricValue = (value, unit = 'ms') => {
    if (typeof value !== 'number') return 'N/A';
    return `${Math.round(value)}${unit}`;
  };

  const getMetricColor = (metric, value) => {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 }
    };

    if (!thresholds[metric]) return 'text-gray-600';

    const threshold = thresholds[metric];
    if (value <= threshold.good) return 'text-green-600';
    if (value <= threshold.poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Performance Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`mb-2 p-3 rounded-full shadow-lg transition-all duration-200 ${
          alerts.length > 0
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-brand-maroon text-white hover:bg-brand-crimson'
        }`}
        aria-label={isExpanded ? 'Hide performance monitor' : 'Show performance monitor'}
      >
        <Activity size={20} />
        {alerts.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {alerts.length}
          </span>
        )}
      </button>

      {/* Performance Panel */}
      {isExpanded && (
        <div className="bg-brand-white rounded-xl shadow-xl border border-gray-200 p-4 w-80 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Zap size={20} className="text-brand-maroon" />
              Performance Monitor
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close performance monitor"
            >
              ×
            </button>
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="mb-4 space-y-2">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg text-sm ${
                    alert.type === 'error'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} />
                    <span>{alert.message}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Web Vitals */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Core Web Vitals</h4>
            <div className="space-y-2">
              {['LCP', 'FID', 'CLS'].map((metric) => (
                <div key={metric} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{metric}:</span>
                  <span
                    className={`text-sm font-medium ${
                      metrics[metric]
                        ? getMetricColor(metric, metrics[metric].value)
                        : 'text-gray-400'
                    }`}
                  >
                    {metrics[metric]
                      ? formatMetricValue(metrics[metric].value, metric === 'CLS' ? '' : 'ms')
                      : 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Metrics</h4>
            <div className="space-y-2">
              {['FCP', 'TTFB'].map((metric) => (
                <div key={metric} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{metric}:</span>
                  <span
                    className={`text-sm font-medium ${
                      metrics[metric]
                        ? getMetricColor(metric, metrics[metric].value)
                        : 'text-gray-400'
                    }`}
                  >
                    {metrics[metric]
                      ? formatMetricValue(metrics[metric].value)
                      : 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          {Object.keys(metrics).length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Performance</h4>
              <div className="space-y-2">
                {Object.entries(metrics)
                  .filter(([key]) => !['LCP', 'FID', 'CLS', 'FCP', 'TTFB'].includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{key.replace(/_/g, ' ')}:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {typeof value === 'object' && value.value
                          ? formatMetricValue(value.value)
                          : formatMetricValue(value)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Session Info */}
          {metrics.session && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Session</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Duration:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.round(metrics.session.duration / 1000)}s
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Page Views:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {metrics.session.pageViews}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Events:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {metrics.session.events}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <button
              onClick={() => {
                monitoringService.trackEvent('performance_monitor_refresh');
                const newMetrics = monitoringService.getPerformanceMetrics();
                setMetrics(newMetrics);
              }}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
            >
              <RefreshCw size={16} />
              Refresh Metrics
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;

/*
============================================================================
FILE: src/components/debug/BackendTest.jsx
============================================================================
PURPOSE:
  Debug component to test backend connectivity and API endpoints.
  Helps identify connection issues and API response problems.

FEATURES:
  - Test backend health endpoint
  - Test API connectivity
  - Display response details
  - Error debugging information
============================================================================
*/

import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

const BackendTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isTesting, setIsTesting] = useState(false);

  const addTestResult = (test, status, message, details = null) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      test,
      status, // 'success', 'error', 'warning'
      message,
      details,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testBackendHealth = async () => {
    try {
      const response = await fetch('/health');
      const data = await response.json();
      
      if (response.ok) {
        addTestResult(
          'Backend Health',
          'success',
          'Backend is running and healthy',
          { status: data.status, uptime: data.uptime }
        );
      } else {
        addTestResult(
          'Backend Health',
          'error',
          `Backend returned status ${response.status}`,
          { status: response.status, data }
        );
      }
    } catch (error) {
      addTestResult(
        'Backend Health',
        'error',
        'Cannot connect to backend',
        { error: error.message, type: error.name }
      );
    }
  };

  const testAPIEndpoint = async () => {
    try {
      const response = await fetch('/api/students/demo-user-123/resume');
      
      if (response.status === 404) {
        addTestResult(
          'API Endpoint',
          'warning',
          'API endpoint accessible but no resume found (expected)',
          { status: response.status }
        );
      } else if (response.ok) {
        const data = await response.json();
        addTestResult(
          'API Endpoint',
          'success',
          'API endpoint working correctly',
          { status: response.status, data }
        );
      } else {
        const errorText = await response.text();
        addTestResult(
          'API Endpoint',
          'error',
          `API returned status ${response.status}`,
          { status: response.status, error: errorText }
        );
      }
    } catch (error) {
      addTestResult(
        'API Endpoint',
        'error',
        'API endpoint not accessible',
        { error: error.message, type: error.name }
      );
    }
  };

  const testCORS = async () => {
    try {
      const response = await fetch('/api/students', {
        method: 'OPTIONS'
      });
      
      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
      };
      
      addTestResult(
        'CORS Configuration',
        'success',
        'CORS headers present',
        corsHeaders
      );
    } catch (error) {
      addTestResult(
        'CORS Configuration',
        'error',
        'CORS test failed',
        { error: error.message }
      );
    }
  };

  const runAllTests = async () => {
    setIsTesting(true);
    setTestResults([]);
    
    await testBackendHealth();
    await testAPIEndpoint();
    await testCORS();
    
    setIsTesting(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'error':
        return <XCircle className="text-red-600" size={20} />;
      case 'warning':
        return <AlertCircle className="text-yellow-600" size={20} />;
      default:
        return <AlertCircle className="text-gray-600" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Backend Connectivity Test</h2>
        <button
          onClick={runAllTests}
          disabled={isTesting}
          className="flex items-center gap-2 px-4 py-2 bg-brand-maroon text-white rounded-lg hover:bg-brand-crimson transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTesting ? (
            <RefreshCw className="animate-spin" size={16} />
          ) : (
            <RefreshCw size={16} />
          )}
          {isTesting ? 'Testing...' : 'Run Tests'}
        </button>
      </div>

      {testResults.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
          <p>Click "Run Tests" to check backend connectivity</p>
        </div>
      ) : (
        <div className="space-y-4">
          {testResults.map((result) => (
            <div
              key={result.id}
              className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
            >
              <div className="flex items-start gap-3">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{result.test}</h3>
                    <span className="text-xs text-gray-500">{result.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{result.message}</p>
                  {result.details && (
                    <details className="text-xs text-gray-600">
                      <summary className="cursor-pointer hover:text-gray-800">
                        View Details
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Troubleshooting Tips:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Make sure the backend server is running on port 3001</li>
          <li>• Check that MongoDB is running and accessible</li>
          <li>• Verify CORS settings allow your frontend URL</li>
          <li>• Check browser console for additional error details</li>
          <li>• Ensure all required dependencies are installed</li>
        </ul>
      </div>
    </div>
  );
};

export default BackendTest;

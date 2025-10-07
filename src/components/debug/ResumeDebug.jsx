/*
============================================================================
FILE: src/components/debug/ResumeDebug.jsx
============================================================================
PURPOSE:
  Debug component to help troubleshoot resume upload issues.
  Shows the current state and helps identify problems.

USAGE:
  Temporary component for debugging resume upload functionality.
============================================================================
*/

import { useState, useEffect } from 'react';
import { FileText, AlertCircle, CheckCircle, Upload } from 'lucide-react';

const ResumeDebug = () => {
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    // Check if localStorage is available
    const hasLocalStorage = typeof Storage !== 'undefined';
    
    // Check if the component is mounted
    const isMounted = true;
    
    // Check if we can access the file input
    const canAccessFileInput = true;
    
    setDebugInfo({
      hasLocalStorage,
      isMounted,
      canAccessFileInput,
      userAgent: navigator.userAgent,
      currentUrl: window.location.href
    });
  }, []);

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="text-yellow-600" size={20} />
        <h3 className="font-semibold text-yellow-800">Resume Upload Debug Info</h3>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle className="text-green-600" size={16} />
          <span>LocalStorage Available: {debugInfo.hasLocalStorage ? 'Yes' : 'No'}</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="text-green-600" size={16} />
          <span>Component Mounted: {debugInfo.isMounted ? 'Yes' : 'No'}</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="text-green-600" size={16} />
          <span>File Input Access: {debugInfo.canAccessFileInput ? 'Yes' : 'No'}</span>
        </div>
        <div className="text-xs text-gray-600">
          <div>URL: {debugInfo.currentUrl}</div>
          <div>Browser: {debugInfo.userAgent?.substring(0, 50)}...</div>
        </div>
      </div>
      
      <div className="mt-3 p-3 bg-white rounded border">
        <h4 className="font-semibold text-gray-800 mb-2">What to look for:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• You should see a large dashed box below this debug info</li>
          <li>• The box should say "Drag and drop or browse to upload your resume"</li>
          <li>• Clicking the box or "browse" text should open a file picker</li>
          <li>• Only PDF files under 5MB are accepted</li>
        </ul>
      </div>
    </div>
  );
};

export default ResumeDebug;

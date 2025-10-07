/*
============================================================================
FILE: src/components/debug/ResumeAnalysisDebug.jsx
============================================================================
PURPOSE:
  Debug component to help troubleshoot resume analysis issues.
  Shows the current state and helps identify problems.

USAGE:
  Temporary component for debugging resume analysis functionality.
============================================================================
*/

import { useState, useEffect } from 'react';
import { FileText, AlertCircle, CheckCircle, Upload, RefreshCw } from 'lucide-react';

const ResumeAnalysisDebug = ({ file, analysisData, isAnalyzing, error }) => {
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    setDebugInfo({
      hasFile: !!file,
      fileName: file?.name || 'No file',
      fileSize: file?.size || 0,
      fileType: file?.type || 'No type',
      hasAnalysisData: !!analysisData,
      isAnalyzing: isAnalyzing,
      hasError: !!error,
      errorMessage: error || 'No error',
      analysisKeys: analysisData ? Object.keys(analysisData) : [],
      timestamp: new Date().toLocaleString()
    });
  }, [file, analysisData, isAnalyzing, error]);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="text-blue-600" size={20} />
        <h3 className="font-semibold text-blue-800">Resume Analysis Debug Info</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="space-y-2">
          <h4 className="font-semibold text-blue-900">File Status</h4>
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-600" size={16} />
            <span>File: {debugInfo.hasFile ? 'Yes' : 'No'}</span>
          </div>
          <div className="text-xs text-gray-600">
            {debugInfo.fileName} ({debugInfo.fileSize} bytes)
          </div>
          <div className="text-xs text-gray-600">
            Type: {debugInfo.fileType}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-blue-900">Analysis Status</h4>
          <div className="flex items-center gap-2">
            {debugInfo.isAnalyzing ? (
              <RefreshCw className="text-blue-600 animate-spin" size={16} />
            ) : debugInfo.hasAnalysisData ? (
              <CheckCircle className="text-green-600" size={16} />
            ) : (
              <AlertCircle className="text-yellow-600" size={16} />
            )}
            <span>
              {debugInfo.isAnalyzing ? 'Analyzing...' : 
               debugInfo.hasAnalysisData ? 'Complete' : 'Pending'}
            </span>
          </div>
          <div className="text-xs text-gray-600">
            Keys: {debugInfo.analysisKeys?.join(', ') || 'None'}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-blue-900">Error Status</h4>
          <div className="flex items-center gap-2">
            {debugInfo.hasError ? (
              <AlertCircle className="text-red-600" size={16} />
            ) : (
              <CheckCircle className="text-green-600" size={16} />
            )}
            <span>{debugInfo.hasError ? 'Error' : 'No Error'}</span>
          </div>
          <div className="text-xs text-gray-600 max-w-xs truncate">
            {debugInfo.errorMessage}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-blue-900">Debug Info</h4>
          <div className="text-xs text-gray-600">
            Time: {debugInfo.timestamp}
          </div>
          <div className="text-xs text-gray-600">
            Status: {isAnalyzing ? 'Processing' : 'Ready'}
          </div>
        </div>
      </div>
      
      <div className="mt-3 p-3 bg-white rounded border">
        <h4 className="font-semibold text-gray-800 mb-2">What to check:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• File should be uploaded and valid PDF</li>
          <li>• Analysis should show "Complete" status</li>
          <li>• No error messages should appear</li>
          <li>• Analysis data should have keys like "overallScore", "categoryScores"</li>
        </ul>
      </div>
    </div>
  );
};

export default ResumeAnalysisDebug;

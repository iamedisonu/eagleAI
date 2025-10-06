/*
============================================================================
FILE: src/components/resume/ResumeAnalysis.jsx
============================================================================
PURPOSE:
  Displays AI analysis results with overall scoring, summary statistics,
  and individual bullet point feedback.

FEATURES:
  - Overall resume score and statistics
  - Individual bullet point analysis
  - Copy-paste functionality for improved bullets
  - Progress indicators and loading states
  - OC brand styling

PROPS:
  - file: Uploaded file object
  - analysisData: Analysis results from AI
  - isAnalyzing: Loading state
  - onNewUpload: Function to upload a new file
============================================================================
*/

import { useState } from 'react';
import { FileText, Sparkles, RefreshCw, Download, Copy, CheckCircle } from 'lucide-react';
import ResumeFeedback from './ResumeFeedback';

const ResumeAnalysis = ({ file, analysisData, isAnalyzing, onNewUpload }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-accent-teal';
    if (score >= 6) return 'text-accent-gold';
    return 'text-brand-crimson';
  };

  const getScoreBgColor = (score) => {
    if (score >= 8) return 'bg-accent-teal-soft';
    if (score >= 6) return 'bg-accent-gold/20';
    return 'bg-brand-crimson/10';
  };

  if (isAnalyzing) {
    return (
      <div className="bg-brand-white rounded-lg md:rounded-xl p-8 shadow-lg">
        <div className="text-center">
          <div className="bg-brand-maroon/10 p-4 rounded-full w-16 h-16 mx-auto mb-4">
            <RefreshCw className="text-brand-maroon animate-spin" size={32} />
          </div>
          <h3 className="text-xl font-bold text-brand-maroon mb-2">
            Analyzing Your Resume
          </h3>
          <p className="text-gray-600 mb-4">
            Our AI is reviewing your bullet points and generating feedback...
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-brand-maroon h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Raw AI Response Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Raw AI Response</h2>
        <p className="text-sm text-gray-600">
          Generated at: {new Date(analysisData.timestamp).toLocaleString()}
        </p>
      </div>

      {/* Raw Response Display */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Google AI Response</h3>
          <button
            onClick={() => handleCopy(analysisData.rawResponse, 'raw')}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            {copiedIndex === 'raw' ? (
              <>
                <CheckCircle size={16} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={16} />
                Copy Response
              </>
            )}
          </button>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200 max-h-96 overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
            {analysisData.rawResponse}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysis;

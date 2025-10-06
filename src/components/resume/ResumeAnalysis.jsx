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
      {/* AI Feedback Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {analysisData.parsedResponse ? 'AI Resume Feedback' : 'Raw AI Response'}
        </h2>
        <p className="text-sm text-gray-600">
          Generated at: {new Date(analysisData.timestamp).toLocaleString()}
        </p>
      </div>

      {/* Structured AI Feedback */}
      {analysisData.parsedResponse ? (
        <div className="space-y-6">
          {/* Overall Score */}
          {analysisData.parsedResponse.overallScore && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Overall Score</h3>
              <div className="text-3xl font-bold text-blue-600">
                {analysisData.parsedResponse.overallScore}/10
              </div>
            </div>
          )}

          {/* Statistics */}
          {analysisData.parsedResponse.totalBullets && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-800">{analysisData.parsedResponse.totalBullets}</div>
                <div className="text-sm text-gray-600">Total Bullets</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{analysisData.parsedResponse.strongBullets || 0}</div>
                <div className="text-sm text-gray-600">Strong Bullets</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{analysisData.parsedResponse.needsImprovement || 0}</div>
                <div className="text-sm text-gray-600">Need Improvement</div>
              </div>
            </div>
          )}

          {/* Individual Bullet Feedback */}
          {analysisData.parsedResponse.bullets && analysisData.parsedResponse.bullets.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Bullet Point Analysis</h3>
              {analysisData.parsedResponse.bullets.map((bullet, index) => (
                <div key={bullet.id || index} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 mb-2">
                        {bullet.category || 'Bullet Point'} #{bullet.id || index + 1}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">{bullet.original}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold text-white ${
                      bullet.score >= 8 ? 'bg-green-500' : 
                      bullet.score >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>
                      {bullet.score}/10
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-1">Feedback:</h5>
                      <p className="text-sm text-gray-600">{bullet.feedback}</p>
                    </div>
                    
                    {bullet.improved && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-1">Improved Version:</h5>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{bullet.improved}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Raw Response Toggle */}
          <details className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <summary className="cursor-pointer font-medium text-gray-700 mb-2">
              View Raw AI Response
            </summary>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-600">Raw Response</h4>
                <button
                  onClick={() => handleCopy(analysisData.rawResponse, 'raw')}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors duration-200"
                >
                  {copiedIndex === 'raw' ? (
                    <>
                      <CheckCircle size={12} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="bg-white rounded p-3 border border-gray-200 max-h-64 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-xs text-gray-700 font-mono leading-relaxed">
                  {analysisData.rawResponse}
                </pre>
              </div>
            </div>
          </details>
        </div>
      ) : (
        /* Fallback to Raw Response Display */
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
      )}
    </div>
  );
};

export default ResumeAnalysis;

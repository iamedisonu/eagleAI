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

      {/* Comprehensive Resume Analysis */}
      {analysisData.parsedResponse ? (
        <div className="space-y-6">
          {/* Overall Assessment */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
              <Sparkles className="text-blue-600" size={24} />
              Overall Assessment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {analysisData.parsedResponse.overallScore || 'N/A'}/10
                </div>
                <p className="text-sm text-blue-700 font-medium">Overall Score</p>
              </div>
              <div className="text-sm text-gray-700">
                {analysisData.parsedResponse.overallAssessment || 'Comprehensive analysis completed.'}
              </div>
            </div>
          </div>

          {/* Category Scores */}
          {analysisData.parsedResponse.categoryScores && (
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Scores</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(analysisData.parsedResponse.categoryScores).map(([category, score]) => (
                  <div key={category} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className={`text-2xl font-bold ${
                      score >= 4 ? 'text-green-600' : 
                      score >= 3 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {score}/5
                    </div>
                    <div className="text-xs text-gray-600 capitalize mt-1">
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths */}
          {analysisData.parsedResponse.strengths && analysisData.parsedResponse.strengths.length > 0 && (
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                <CheckCircle className="text-green-600" size={20} />
                Strengths
              </h3>
              <ul className="space-y-2">
                {analysisData.parsedResponse.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-green-700">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Priority Improvements */}
          {analysisData.parsedResponse.priorityImprovements && analysisData.parsedResponse.priorityImprovements.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
              <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center gap-2">
                <FileText className="text-yellow-600" size={20} />
                Priority Improvements
              </h3>
              <ul className="space-y-2">
                {analysisData.parsedResponse.priorityImprovements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-yellow-700">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed Feedback */}
          {analysisData.parsedResponse.detailedFeedback && analysisData.parsedResponse.detailedFeedback.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Detailed Feedback</h3>
              {analysisData.parsedResponse.detailedFeedback.map((feedback, index) => (
                <div key={index} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-800 capitalize">
                          {feedback.category}
                        </h4>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {feedback.location}
                        </span>
                      </div>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold text-white ${
                        feedback.score >= 4 ? 'bg-green-500' : 
                        feedback.score >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}>
                        {feedback.score}/5
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-red-700 mb-2">Current Problem:</h5>
                      <p className="text-sm text-gray-700 bg-red-50 p-3 rounded border-l-4 border-red-200">
                        {feedback.currentProblem}
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-orange-700 mb-2">Why It Matters:</h5>
                      <p className="text-sm text-gray-700 bg-orange-50 p-3 rounded border-l-4 border-orange-200">
                        {feedback.whyItMatters}
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-green-700 mb-2">Specific Fix:</h5>
                      <p className="text-sm text-gray-700 bg-green-50 p-3 rounded border-l-4 border-green-200">
                        {feedback.specificFix}
                      </p>
                    </div>
                    
                    {feedback.alternativeExamples && (
                      <div>
                        <h5 className="font-medium text-blue-700 mb-2">Alternative Examples:</h5>
                        <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded border-l-4 border-blue-200">
                          {feedback.alternativeExamples}
                        </p>
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

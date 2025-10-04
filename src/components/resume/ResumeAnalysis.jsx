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
      {/* Analysis Header */}
      <div className="bg-brand-white rounded-lg md:rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-accent-teal p-2 rounded-lg">
              <FileText className="text-brand-white" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{file.name}</h3>
              <p className="text-sm text-gray-600">Analysis completed</p>
            </div>
          </div>
          <button
            onClick={onNewUpload}
            className="flex items-center gap-2 px-4 py-2 text-brand-maroon hover:bg-brand-maroon/10 rounded-lg transition-colors duration-200"
          >
            <RefreshCw size={16} />
            Upload New File
          </button>
        </div>

        {/* Overall Score */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-brand-maroon to-brand-crimson text-white rounded-xl">
            <div className="text-3xl font-bold">{analysisData.overallScore}</div>
            <div className="text-sm opacity-90">Overall Score</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-gray-800">{analysisData.totalBullets}</div>
            <div className="text-sm text-gray-600">Total Bullets</div>
          </div>
          
          <div className="text-center p-4 bg-accent-teal-soft rounded-xl">
            <div className="text-2xl font-bold text-accent-teal">{analysisData.strongBullets}</div>
            <div className="text-sm text-gray-600">Strong Bullets</div>
          </div>
          
          <div className="text-center p-4 bg-brand-crimson/10 rounded-xl">
            <div className="text-2xl font-bold text-brand-crimson">{analysisData.needsImprovement}</div>
            <div className="text-sm text-gray-600">Need Improvement</div>
          </div>
        </div>
      </div>

      {/* Bullet Point Analysis */}
      <div className="bg-brand-white rounded-lg md:rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="text-brand-maroon" size={20} />
          <h3 className="text-lg font-bold text-gray-800">Bullet Point Analysis</h3>
        </div>

        <div className="space-y-4">
          {analysisData.bullets.map((bullet, index) => (
            <ResumeFeedback
              key={bullet.id}
              bullet={bullet}
              index={index}
              onCopy={handleCopy}
              copiedIndex={copiedIndex}
              getScoreColor={getScoreColor}
              getScoreBgColor={getScoreBgColor}
            />
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-brand-white rounded-lg md:rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-maroon text-brand-white rounded-xl font-semibold hover:bg-brand-crimson transition-colors duration-200">
            <Download size={18} />
            Download Analysis Report
          </button>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-accent-teal text-brand-white rounded-xl font-semibold hover:bg-accent-teal/80 transition-colors duration-200">
            <Sparkles size={18} />
            Get More Suggestions
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysis;

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
      {/* Experiences Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Experiences ({analysisData.bullets.length})</h2>
      </div>

      {/* Bullet Point Analysis */}
      <div className="space-y-6">
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
  );
};

export default ResumeAnalysis;

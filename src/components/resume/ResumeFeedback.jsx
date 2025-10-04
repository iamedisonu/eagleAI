/*
============================================================================
FILE: src/components/resume/ResumeFeedback.jsx
============================================================================
PURPOSE:
  Individual bullet point feedback component displaying original text,
  AI score, feedback, and improved suggestions with copy functionality.

FEATURES:
  - Score display with color coding
  - Original and improved bullet text
  - AI feedback explanation
  - Copy-paste functionality
  - Category tagging
  - OC brand styling

PROPS:
  - bullet: Bullet point data object
  - index: Index for copy state tracking
  - onCopy: Function to handle copy action
  - copiedIndex: Currently copied item index
  - getScoreColor: Function to get score color
  - getScoreBgColor: Function to get score background color
============================================================================
*/

import { Copy, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';

const ResumeFeedback = ({ 
  bullet, 
  index, 
  onCopy, 
  copiedIndex, 
  getScoreColor, 
  getScoreBgColor 
}) => {
  const isCopied = copiedIndex === index;

  return (
    <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
      {/* Header with score and category */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreBgColor(bullet.score)}`}>
            <span className={getScoreColor(bullet.score)}>
              Score: {bullet.score}/10
            </span>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {bullet.category}
          </span>
        </div>
        
        <button
          onClick={() => onCopy(bullet.improved, index)}
          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
            isCopied
              ? 'bg-accent-teal text-brand-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isCopied ? (
            <>
              <CheckCircle size={14} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={14} />
              Copy Improved
            </>
          )}
        </button>
      </div>

      {/* Original bullet point */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="text-gray-500" size={16} />
          <span className="text-sm font-semibold text-gray-700">Original:</span>
        </div>
        <div className="bg-gray-50 border-l-4 border-gray-300 p-3 rounded-r-lg">
          <p className="text-gray-800">{bullet.original}</p>
        </div>
      </div>

      {/* AI Feedback */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="text-brand-maroon" size={16} />
          <span className="text-sm font-semibold text-gray-700">AI Feedback:</span>
        </div>
        <div className="bg-brand-maroon/5 border-l-4 border-brand-maroon p-3 rounded-r-lg">
          <p className="text-gray-700 text-sm">{bullet.feedback}</p>
        </div>
      </div>

      {/* Improved bullet point */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="text-accent-teal" size={16} />
          <span className="text-sm font-semibold text-gray-700">Improved:</span>
        </div>
        <div className="bg-accent-teal-soft border-l-4 border-accent-teal p-3 rounded-r-lg">
          <p className="text-gray-800 font-medium">{bullet.improved}</p>
        </div>
      </div>

      {/* Improvement highlights */}
      <div className="mt-3 flex flex-wrap gap-2">
        {bullet.score < 6 && (
          <span className="text-xs bg-brand-crimson/10 text-brand-crimson px-2 py-1 rounded-full">
            Add Quantified Results
          </span>
        )}
        {bullet.original.length > 100 && (
          <span className="text-xs bg-accent-gold/20 text-accent-gold px-2 py-1 rounded-full">
            Make More Concise
          </span>
        )}
        {!bullet.original.match(/\b(led|developed|created|implemented|optimized|increased|reduced|improved)\b/i) && (
          <span className="text-xs bg-brand-maroon/10 text-brand-maroon px-2 py-1 rounded-full">
            Use Stronger Action Verbs
          </span>
        )}
      </div>
    </div>
  );
};

export default ResumeFeedback;

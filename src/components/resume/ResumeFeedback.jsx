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
    <div className="space-y-4">
      {/* Job Title and Company */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {bullet.jobTitle && bullet.company ? 
            `${bullet.jobTitle}, ${bullet.company}` : 
            bullet.category === 'Experience' ? 'IT Support Intern, Bridge2Rwanda' : 
            bullet.category === 'Projects' ? 'Software Developer, Personal Project' : 
            `${bullet.category} Experience`}
        </h3>
      </div>

      {/* Bullet Point with Score */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-gray-800 text-sm leading-relaxed">
              {bullet.original}
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className={`px-3 py-1 rounded-full text-sm font-bold text-white ${
              bullet.score >= 8 ? 'bg-green-500' : 
              bullet.score >= 6 ? 'bg-yellow-500' : 'bg-red-500'
            }`}>
              {bullet.score}
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700 text-sm leading-relaxed">
            {bullet.feedback}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResumeFeedback;

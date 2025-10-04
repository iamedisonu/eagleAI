/*
============================================================================
FILE: src/components/mentorship/MentorCard.jsx
============================================================================
PURPOSE:
  Individual mentor profile card displaying mentor information, AI
  compatibility match percentage, reasoning, and success insights.

FEATURES:
  - AI match percentage badge with gradient background
  - Compatibility analysis box
  - Success insight metrics
  - Action buttons (Request Introduction, View Profile)
  - Responsive flex layouts
  - Hover effects

PROPS:
  - mentor: Object containing:
    * name, role, match percentage
    * reason (compatibility analysis)
    * aiInsight (success metrics)

RESPONSIVE BEHAVIOR:
  - Mobile: Stacked layout, match badge on left
  - Tablet (sm+): Horizontal layout, match badge on right
  - Buttons stack on mobile, inline on tablet+
============================================================================
*/

import React from 'react';
import { Brain, Star, Sparkles } from 'lucide-react';
import Button from '../shared/Button';

const MentorCard = ({ mentor }) => {
  return (
    // Card with gradient background and hover effect
    <div className="border-2 border-gray-200 rounded-lg md:rounded-xl p-4 md:p-6 hover:shadow-xl transition-all hover:border-brand-maroon bg-gradient-to-br from-white to-blue-50">
      {/* Mentor header: name, role, match score */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3 md:mb-4">
        {/* Mentor info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg md:text-xl text-gray-800 break-words">
            {mentor.name}
          </h3>
          <p className="text-xs md:text-sm text-gray-600 mt-1 break-words">
            {mentor.role}
          </p>
        </div>
        {/* AI match score badge with gradient */}
        <div className="text-center bg-gradient-to-br from-brand-maroon to-brand-crimson text-white px-4 md:px-5 py-2 md:py-3 rounded-xl shadow-md flex-shrink-0 self-start sm:self-auto">
          <div className="text-xl md:text-2xl font-bold">{mentor.match}%</div>
          <div className="text-xs font-semibold">AI Match</div>
        </div>
      </div>
      
      {/* AI Compatibility Analysis box */}
      <div className="bg-gradient-to-r from-blue-50 to-white border-l-4 border-brand-maroon p-3 md:p-4 rounded-lg mb-2 md:mb-3">
        <div className="flex items-start gap-2 mb-2">
          <Brain size={16} className="text-brand-maroon mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-brand-maroon mb-1">
              AI COMPATIBILITY ANALYSIS
            </p>
            <p className="text-xs md:text-sm text-gray-700 break-words">
              {mentor.reason}
            </p>
          </div>
        </div>
      </div>
      
      {/* Success Insight box */}
      <div className="bg-yellow-50 border-l-4 border-brand-crimson p-3 md:p-4 rounded-lg mb-3 md:mb-4">
        <div className="flex items-start gap-2">
          <Star size={16} className="text-brand-crimson mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-brand-crimson mb-1">
              SUCCESS INSIGHT
            </p>
            <p className="text-xs md:text-sm text-gray-700 break-words">
              {mentor.aiInsight}
            </p>
          </div>
        </div>
      </div>
      
      {/* Action buttons - stack on mobile, inline on tablet+ */}
      <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
        <Button variant="primary" fullWidth icon={Sparkles} size="md">
          Request AI Introduction
        </Button>
        <Button variant="secondary" fullWidth size="md" className="sm:w-auto sm:px-6">
          Profile
        </Button>
      </div>
    </div>
  );
};

export default React.memo(MentorCard);

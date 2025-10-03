/*
============================================================================
FILE: src/components/roadmap/ElectiveRecommendations.jsx
============================================================================
PURPOSE:
  Displays AI-recommended elective courses based on job market analysis,
  career goals, and student interests. Each elective shows relevance score,
  AI confidence level, and market-driven reasoning.

FEATURES:
  - Relevance percentage badges with star icons
  - AI confidence indicators
  - Market analysis explanations
  - "Add to My Plan" action buttons
  - Hover effects for interactivity

DATA SOURCE:
  Pulls from AppContext: roadmap.electives array

RESPONSIVE BEHAVIOR:
  - Mobile: Stacked vertical layout, badges at top
  - Tablet (sm+): Horizontal layout with badges aligned right
  - Text truncation and wrapping prevents overflow
============================================================================
*/

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Lightbulb, Star } from 'lucide-react';
import Button from '../shared/Button';

const ElectiveRecommendations = () => {
  // Get roadmap data from global context
  const { roadmap } = useApp();

  return (
    <div>
      {/* Section header with sparkles icon (OC red accent) */}
      <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4 flex items-center gap-2 text-[#003459]">
        <Sparkles className="text-[#C8102E] flex-shrink-0" size={18} />
        <span className="truncate">AI-Recommended Electives</span>
      </h3>
      
      {/* Elective cards container */}
      <div className="space-y-2 md:space-y-3">
        {roadmap.electives.map(elective => (
          <div 
            key={elective.id} 
            className="border-2 border-gray-200 bg-white p-3 md:p-5 rounded-lg md:rounded-xl hover:shadow-xl transition-all hover:border-[#003459]"
          >
            {/* Elective header: name and relevance badges */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2 md:mb-3">
              {/* Elective name */}
              <p className="font-bold text-gray-800 text-base md:text-lg break-words flex-1 min-w-0">
                {elective.name}
              </p>
              {/* Relevance score and confidence badges */}
              <div className="flex flex-col items-start sm:items-end gap-1 flex-shrink-0">
                {/* Relevance percentage badge with gradient background */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-[#003459] to-[#002D4D] text-white px-2 md:px-3 py-1 rounded-full">
                  <Star size={12} />
                  <span className="text-xs md:text-sm font-bold">{elective.relevance}%</span>
                </div>
                {/* AI confidence level */}
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {elective.aiConfidence} Confidence
                </span>
              </div>
            </div>
            
            {/* AI analysis/reasoning box */}
            <div className="bg-gradient-to-r from-yellow-50 to-white border-l-4 border-[#C8102E] p-2 md:p-3 rounded-lg mb-2 md:mb-3">
              <div className="flex items-start gap-2">
                <Lightbulb size={14} className="text-[#C8102E] mt-0.5 flex-shrink-0" />
                <p className="text-xs md:text-sm text-gray-700 break-words">
                  <span className="font-semibold">AI Analysis:</span> {elective.reason}
                </p>
              </div>
            </div>
            
            {/* Add to plan action button */}
            <Button variant="primary" fullWidth icon={Sparkles} size="md">
              Add to My Plan
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(ElectiveRecommendations);

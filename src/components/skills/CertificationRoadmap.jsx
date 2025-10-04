/*
============================================================================
FILE: src/components/skills/CertificationRoadmap.jsx
============================================================================
PURPOSE:
  Displays AI-recommended professional certifications with readiness
  assessments, target deadlines, and guided preparation paths.

FEATURES:
  - Certification cards with deadlines
  - AI readiness percentage with progress bars
  - Preparation status badges
  - "Begin AI-Guided Prep" action buttons
  - Responsive flex layouts

DATA SOURCE:
  AppContext: skills.certifications array

RESPONSIVE BEHAVIOR:
  - Mobile: Stacked layout, badges on left
  - Tablet (sm+): Horizontal layout with badges on right
  - Progress bars scale properly across all sizes
============================================================================
*/

import React from 'react';
import { useApp } from '../../context/AppContext.js';
import { Award, Brain, Sparkles } from 'lucide-react';
import Button from '../shared/Button';
import Badge from '../shared/Badge';

const CertificationRoadmap = () => {
  // Get skills/certification data from context
  const { skills } = useApp();

  return (
    <div>
      {/* Section header */}
      <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4 flex items-center gap-2 text-brand-maroon">
        <Award className="text-brand-crimson flex-shrink-0" size={18} />
        <span className="truncate">Certification Roadmap - AI Readiness Assessment</span>
      </h3>
      
      {/* Certification cards container */}
      <div className="space-y-3 md:space-y-4">
        {skills.certifications.map((cert, idx) => (
          <div 
            key={idx} 
            className="border-2 border-gray-200 bg-white p-3 md:p-5 rounded-lg md:rounded-xl hover:shadow-lg transition-shadow"
          >
            {/* Certification header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3 md:mb-4">
              {/* Cert name and deadline */}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-800 text-base md:text-lg break-words">
                  {cert.name}
                </h4>
                <p className="text-xs md:text-sm text-gray-600 mt-1">
                  Target Completion: {cert.deadline}
                </p>
              </div>
              {/* Preparation status badge */}
              <Badge variant="default" size="sm" className="self-start sm:self-auto">
                {cert.prep}
              </Badge>
            </div>
            
            {/* AI readiness assessment box */}
            <div className="bg-blue-50 border-l-4 border-brand-maroon p-3 md:p-4 rounded-lg mb-2 md:mb-3">
              <div className="flex items-start gap-2 mb-2">
                <Brain size={14} className="text-brand-maroon mt-0.5 flex-shrink-0" />
                <p className="text-xs md:text-sm text-gray-700 break-words">
                  <span className="font-semibold">AI Readiness:</span> {cert.aiReady}
                </p>
              </div>
              {/* Readiness progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-brand-maroon h-2 rounded-full transition-all"
                  style={{ width: cert.aiReady }}
                />
              </div>
            </div>
            
            {/* Start prep button */}
            <Button variant="primary" fullWidth icon={Sparkles} size="md">
              Begin AI-Guided Prep
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(CertificationRoadmap);

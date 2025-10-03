/*
============================================================================
FILE: src/components/skills/PrioritySkills.jsx
============================================================================
PURPOSE:
  Displays AI-recommended priority skills for the student to learn based on
  job market demand, career trajectory, and skill gap analysis.

FEATURES:
  - Priority badges (High/Medium)
  - Estimated learning time
  - AI career match percentage
  - Market reasoning for each skill
  - Action buttons (Start Learning Path, Details)
  - Fully responsive card layout

DATA SOURCE:
  AppContext: skills.recommended array

RESPONSIVE BEHAVIOR:
  - Mobile: Vertical stack, full-width buttons
  - Tablet: Side-by-side content
  - Desktop (lg): Horizontal layout with match score badge on right
============================================================================
*/

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Zap, Clock, BarChart3, Sparkles } from 'lucide-react';
import Button from '../shared/Button';
import Badge from '../shared/Badge';

const PrioritySkills = () => {
  // Get skills data from context
  const { skills } = useApp();

  return (
    <div className="mb-6 md:mb-8">
      {/* Section header */}
      <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4 flex items-center gap-2 text-[#003459]">
        <Zap className="text-[#C8102E] flex-shrink-0" size={18} />
        <span className="truncate">Priority Skills - AI Market Intelligence</span>
      </h3>
      
      {/* Skills cards container */}
      <div className="space-y-3 md:space-y-4">
        {skills.recommended.map((skill, idx) => (
          <div 
            key={idx} 
            className="border-2 border-[#C8102E] bg-gradient-to-r from-yellow-50 via-white to-yellow-50 p-3 md:p-5 rounded-lg md:rounded-xl shadow-md hover:shadow-xl transition-all"
          >
            {/* Skill header and info */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-3 mb-2 md:mb-3">
              {/* Skill details */}
              <div className="flex-1 min-w-0">
                {/* Skill name and priority badge */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h4 className="font-bold text-gray-800 text-base md:text-lg break-words">
                    {skill.name}
                  </h4>
                  <Badge variant={skill.priority === 'High' ? 'danger' : 'warning'} size="sm">
                    {skill.priority} Priority
                  </Badge>
                </div>
                {/* AI reasoning */}
                <p className="text-xs md:text-sm text-gray-700 mb-2 break-words">
                  {skill.reason}
                </p>
                {/* Stats: learning time and AI match */}
                <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <Clock size={12} />
                    Est. {skill.weeks} weeks
                  </span>
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <BarChart3 size={12} />
                    AI Match: {skill.aiMatch}%
                  </span>
                </div>
              </div>
              {/* Career match score badge */}
              <div className="text-center bg-[#003459] text-white px-3 md:px-4 py-2 md:py-3 rounded-lg flex-shrink-0 self-start lg:self-auto">
                <div className="text-xl md:text-2xl font-bold">{skill.aiMatch}</div>
                <div className="text-xs">Career Match</div>
              </div>
            </div>
            
            {/* Action buttons - stack on mobile, inline on tablet+ */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="primary" fullWidth icon={Sparkles} size="md">
                Start AI Learning Path
              </Button>
              <Button variant="secondary" fullWidth size="md" className="sm:w-auto sm:px-6">
                Details
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(PrioritySkills);

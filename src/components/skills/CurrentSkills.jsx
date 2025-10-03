/*
============================================================================
FILE: src/components/skills/CurrentSkills.jsx
============================================================================
PURPOSE:
  Displays student's current skill proficiency levels with market demand
  indicators, job growth trends, and active job posting counts.

FEATURES:
  - Progress bars showing skill level (0-100%)
  - Demand badges (Very High, High, Essential)
  - Market growth percentages
  - Job posting counts
  - Responsive grid layout

DATA SOURCE:
  AppContext: skills.current array

RESPONSIVE BEHAVIOR:
  - Mobile: Single column grid
  - Tablet (sm+): 2-column grid
  - Cards scale padding based on screen size
============================================================================
*/

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Target } from 'lucide-react';
import ProgressBar from '../shared/ProgressBar';
import Badge from '../shared/Badge';

const CurrentSkills = () => {
  // Get skills data from context
  const { skills } = useApp();

  return (
    <div className="mb-6 md:mb-8">
      {/* Section header */}
      <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4 flex items-center gap-2 text-[#003459]">
        <Target className="text-[#003459] flex-shrink-0" size={18} />
        <span className="truncate">Current Skills - Market Performance</span>
      </h3>
      
      {/* Skills grid - 1 column mobile, 2 columns tablet+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {skills.current.map((skill, idx) => (
          <div 
            key={idx} 
            className="bg-gradient-to-br from-white to-blue-50 p-3 md:p-5 rounded-lg md:rounded-xl shadow-md border border-gray-200"
          >
            {/* Skill name and demand badge */}
            <div className="flex justify-between items-center mb-2 md:mb-3 gap-2">
              <span className="text-sm md:text-base font-bold text-gray-800 truncate flex-1">
                {skill.name}
              </span>
              <Badge variant="success" size="sm">{skill.demand}</Badge>
            </div>
            
            {/* Proficiency progress bar */}
            <ProgressBar 
              progress={skill.level} 
              showLabel={false}
              color="blue"
              size="md"
              className="mb-2 md:mb-3"
            />
            
            {/* Market stats grid */}
            <div className="grid grid-cols-2 gap-2 md:gap-3 text-xs">
              {/* Market growth stat */}
              <div className="bg-white p-2 rounded border border-gray-200">
                <div className="text-gray-500 mb-1 truncate">Market Growth</div>
                <div className="font-bold text-green-600 text-xs md:text-sm">
                  {skill.aiGrowth}
                </div>
              </div>
              {/* Job postings stat */}
              <div className="bg-white p-2 rounded border border-gray-200">
                <div className="text-gray-500 mb-1 truncate">Job Postings</div>
                <div className="font-bold text-[#003459] text-xs md:text-sm">
                  {skill.jobs}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(CurrentSkills);

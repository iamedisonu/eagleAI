/*
============================================================================
FILE: src/components/career/CareerCard.jsx
============================================================================
PURPOSE:
  Individual career path card displaying career title, match percentage,
  salary range, job outlook, local openings, AI forecast, and skills gap
  analysis with actionable next steps.

FEATURES:
  - Career fit percentage badge with gradient
  - Salary range display
  - Job outlook and local job count stats
  - AI career forecast with reasoning
  - Skills gap badges (what student needs to learn)
  - Action buttons (AI Learning Path, Find Jobs)
  - Fully responsive grid and flex layouts

PROPS:
  - career: Object containing:
    * title, match percentage, avgSalary
    * outlook, localJobs, aiInsight
    * gaps array (missing skills)

RESPONSIVE BEHAVIOR:
  - Mobile: Stacked layouts, 2-column stat grid
  - Tablet (sm+): Horizontal layouts where appropriate
  - Desktop: Optimized spacing and proportions
  - All text wraps properly, no overflow
============================================================================
*/

import React from 'react';
import { Brain, Sparkles, Briefcase } from 'lucide-react';
import Button from '../shared/Button';
import Badge from '../shared/Badge';

const CareerCard = ({ career }) => {
  return (
    // Card with gradient background and hover effect
    <div className="border-3 border-gray-300 rounded-lg md:rounded-xl p-4 md:p-6 hover:border-brand-maroon transition-all bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-2xl">
      {/* Career header: title, salary, match score */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3 md:mb-4">
        {/* Career title and salary */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg md:text-xl text-gray-800 mb-2 break-words">
            {career.title}
          </h3>
          <p className="text-base md:text-lg text-brand-maroon font-bold">
            {career.avgSalary}
          </p>
        </div>
        {/* Career fit percentage badge with gradient */}
        <div className="text-center bg-gradient-to-br from-brand-maroon to-brand-crimson text-white px-4 md:px-5 py-2 md:py-3 rounded-xl shadow-md flex-shrink-0 self-start sm:self-auto">
          <div className="text-2xl md:text-3xl font-bold">{career.match}%</div>
          <div className="text-xs font-semibold">Career Fit</div>
        </div>
      </div>
      
      {/* Stats grid: job outlook and local openings */}
      <div className="grid grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-4">
        {/* Job outlook stat */}
        <div className="bg-accent-teal-soft border border-accent-teal p-2 md:p-3 rounded-lg">
          <div className="text-xs text-gray-600 mb-1 truncate">Job Outlook</div>
          <div className="text-xs md:text-sm font-bold text-accent-teal break-words">
            {career.outlook.split('(')[0]}
          </div>
        </div>
        {/* Local jobs stat */}
        <div className="bg-blue-50 border border-blue-200 p-2 md:p-3 rounded-lg">
          <div className="text-xs text-gray-600 mb-1 truncate">Local Openings</div>
          <div className="text-xs md:text-sm font-bold text-brand-maroon">
            {career.localJobs} jobs
          </div>
        </div>
      </div>
      
      {/* AI Career Forecast box */}
      <div className="bg-gradient-to-r from-blue-50 to-white border-l-4 border-brand-maroon p-3 md:p-4 rounded-lg mb-2 md:mb-3">
        <div className="flex items-start gap-2">
          <Brain size={16} className="text-brand-maroon mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-brand-maroon mb-1">
              AI CAREER FORECAST
            </p>
            <p className="text-xs md:text-sm text-gray-700 break-words">
              {career.aiInsight}
            </p>
          </div>
        </div>
      </div>
      
      {/* Skills gap analysis section */}
      <div className="mb-3 md:mb-4">
        <p className="text-xs font-bold text-gray-700 mb-2 md:mb-3">
          SKILLS GAP ANALYSIS - AI RECOMMENDATIONS
        </p>
        {/* Gap badges in flexible wrap layout */}
        <div className="flex flex-wrap gap-1.5 md:gap-2">
          {career.gaps.map((gap, gidx) => (
            <Badge key={gidx} variant="warning" size="sm">
              {gap}
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Action buttons - stack on mobile, inline on tablet+ */}
      <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
        <Button variant="primary" fullWidth icon={Sparkles} size="md">
          AI Learning Path
        </Button>
        <Button variant="success" fullWidth icon={Briefcase} size="md">
          Find Jobs
        </Button>
      </div>
    </div>
  );
};

export default React.memo(CareerCard);

/*
============================================================================
FILE: src/components/career/Career.jsx
============================================================================
PURPOSE:
  Main container for the Career Intelligence screen. Displays AI-analyzed
  career paths with fit scores, salary data, job outlook, and skills gap
  analysis.

FEATURES:
  - OC blue branding with trending up icon
  - Responsive spacing and layout
  - Maps through careers array rendering CareerCard for each

CHILD COMPONENTS:
  - CareerCard: Individual career path with match %, salary, gaps, outlook

DATA SOURCE:
  AppContext: careers array

USAGE:
  Rendered when user navigates to "Career" tab in main navigation.
============================================================================
*/

import { TrendingUp } from 'lucide-react';
import CareerCard from './CareerCard';
import { useApp } from '../../context/AppContext';

const Career = () => {
  // Get careers data from context
  const { careers } = useApp();

  return (
    // Main container with responsive spacing
    <div className="space-y-4 md:space-y-6">
      {/* White card container */}
      <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg">
        {/* Header with trending up icon */}
        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
          <div className="bg-[#003459] p-2 md:p-3 rounded-lg flex-shrink-0">
            <TrendingUp className="text-white" size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-[#003459] truncate">
              AI Career Intelligence Platform
            </h2>
            <p className="text-gray-600 text-xs md:text-sm mt-0.5 md:mt-0 break-words">
              Real-time market analysis and personalized career pathway optimization
            </p>
          </div>
        </div>

        {/* Careers list - each rendered as CareerCard */}
        <div className="space-y-3 md:space-y-5">
          {careers.map((career, idx) => (
            <CareerCard key={idx} career={career} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Career;

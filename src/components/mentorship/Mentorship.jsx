/*
============================================================================
FILE: src/components/mentorship/Mentorship.jsx
============================================================================
PURPOSE:
  Main container for the Mentorship Matching screen. Displays AI-matched
  mentors based on compatibility analysis of student's interests, skills,
  and career goals.

FEATURES:
  - OC blue branding with users icon
  - Responsive spacing and layout
  - Maps through mentorship array rendering MentorCard for each

CHILD COMPONENTS:
  - MentorCard: Individual mentor profile with match %, analysis, insights

DATA SOURCE:
  AppContext: mentorship array

USAGE:
  Rendered when user navigates to "Mentorship" tab in main navigation.
============================================================================
*/

import { Users } from 'lucide-react';
import MentorCard from './MentorCard';
import { useApp } from '../../context/AppContext.js';

const Mentorship = () => {
  // Get mentorship data from context
  const { mentorship } = useApp();

  return (
    // Main container with responsive spacing
    <div className="space-y-4 md:space-y-6">
      {/* White card container */}
      <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg">
        {/* Header with users icon */}
        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
          <div className="bg-[#003459] p-2 md:p-3 rounded-lg flex-shrink-0">
            <Users className="text-white" size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-[#003459] truncate">
              AI-Powered Mentorship Matching
            </h2>
            <p className="text-gray-600 text-xs md:text-sm mt-0.5 md:mt-0 break-words">
              Intelligent connections based on deep compatibility analysis
            </p>
          </div>
        </div>

        {/* Mentors list - each rendered as MentorCard */}
        <div className="space-y-3 md:space-y-5">
          {mentorship.map((mentor, idx) => (
            <MentorCard key={idx} mentor={mentor} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Mentorship;

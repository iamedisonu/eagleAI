/*
============================================================================
FILE: src/components/roadmap/Roadmap.jsx
============================================================================
PURPOSE:
  Main container component for the Academic Roadmap screen. Orchestrates
  and displays two key sections: UpcomingCourses (required courses) and
  ElectiveRecommendations (AI-suggested electives).

FEATURES:
  - Fully responsive design (mobile, tablet, desktop)
  - OC blue branding (#003459)
  - Proper spacing and padding across all breakpoints
  - Brain icon header with truncating title text

USAGE:
  Rendered when user navigates to the "Roadmap" tab in the main navigation.
  Pulls data from AppContext via child components.

RESPONSIVE BEHAVIOR:
  - Mobile: Stacked layout with reduced padding
  - Tablet (md): Increased spacing between sections
  - Desktop: Full padding and optimal spacing
============================================================================
*/

import React from 'react';
import { Brain } from 'lucide-react';
import UpcomingCourses from './UpcomingCourses';
import ElectiveRecommendations from './ElectiveRecommendations';

const Roadmap = () => {
  return (
    // Main container with responsive vertical spacing
    <div className="space-y-4 md:space-y-6">
      {/* White card container with shadow and responsive padding */}
      <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg">
        {/* Header section with OC blue icon and title */}
        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
          {/* Brain icon in OC blue circle - flex-shrink-0 prevents squishing */}
          <div className="bg-[#003459] p-2 md:p-3 rounded-lg flex-shrink-0">
            <Brain className="text-white" size={20} />
          </div>
          {/* Title and subtitle with responsive text sizing */}
          <div className="min-w-0 flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-[#003459] truncate">
              AI-Generated Academic Roadmap
            </h2>
            <p className="text-gray-600 text-xs md:text-sm mt-0.5 md:mt-0">
              Personalized course sequence optimized for your career goals
            </p>
          </div>
        </div>

        {/* Child sections container with responsive spacing */}
        <div className="space-y-4 md:space-y-6">
          <UpcomingCourses />
          <ElectiveRecommendations />
        </div>
      </div>
    </div>
  );
};

export default Roadmap;

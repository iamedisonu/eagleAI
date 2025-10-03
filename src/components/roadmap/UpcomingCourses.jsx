/*
============================================================================
FILE: src/components/roadmap/UpcomingCourses.jsx
============================================================================
PURPOSE:
  Displays the student's upcoming required/core courses with AI-generated
  priority levels and reasoning for each course selection.

FEATURES:
  - Dynamic priority badges (high/core/medium)
  - AI reasoning boxes for each course
  - Responsive flex layouts (column on mobile, row on tablet+)
  - Text wrapping to prevent overflow on small screens

DATA SOURCE:
  Pulls from AppContext: roadmap.upcoming array

RESPONSIVE BEHAVIOR:
  - Mobile: Stacked vertical layout, reduced padding
  - Tablet (sm+): Horizontal layout with course info and badge side-by-side
  - Desktop: Increased padding and spacing
============================================================================
*/

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, Brain } from 'lucide-react';
import Badge from '../shared/Badge';

const UpcomingCourses = () => {
  // Get roadmap data from global context
  const { roadmap } = useApp();

  // Helper function to map priority level to badge color variant
  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'high': return 'danger';    // Red badge for high priority
      case 'core': return 'primary';   // Blue badge for core courses
      default: return 'warning';       // Yellow badge for medium priority
    }
  };

  return (
    <div>
      {/* Section header with clock icon */}
      <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4 flex items-center gap-2 text-[#003459]">
        <Clock className="text-[#003459]" size={18} />
        Upcoming Required Courses
      </h3>
      
      {/* Course cards container with responsive spacing */}
      <div className="space-y-2 md:space-y-3">
        {roadmap.upcoming.map(course => (
          <div 
            key={course.id} 
            className="border-l-4 border-[#003459] bg-gradient-to-r from-blue-50 to-white p-3 md:p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            {/* Course header: title, semester, and priority badge */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2 md:mb-3">
              {/* Course information */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-base md:text-lg break-words">
                  {course.course}
                </p>
                <p className="text-xs md:text-sm text-gray-600 mt-1">
                  {course.semester}
                </p>
              </div>
              {/* Priority badge - positioned on right on tablet+ */}
              <div className="self-start sm:self-auto">
                <Badge variant={getPriorityVariant(course.priority)} size="sm">
                  {course.priority.toUpperCase()}
                </Badge>
              </div>
            </div>
            
            {/* AI reasoning box */}
            <div className="bg-white border border-blue-200 rounded-lg p-2 md:p-3 flex items-start gap-2">
              <Brain size={14} className="text-[#003459] mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#003459] mb-1">AI Reasoning:</p>
                <p className="text-xs text-gray-700 break-words">{course.aiReason}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(UpcomingCourses);

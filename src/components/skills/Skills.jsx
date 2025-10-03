/*
============================================================================
FILE: src/components/skills/Skills.jsx
============================================================================
PURPOSE:
  Main container for the Skills Development screen. Displays three sections:
  priority skills to learn, current skill levels, and certification roadmap.
  Powered by real-time job market AI analysis.

FEATURES:
  - OC blue branding and responsive design
  - Organizes three distinct skill-related sections
  - Header with code icon
  - Responsive spacing between sections

CHILD COMPONENTS:
  - PrioritySkills: AI-recommended skills to learn
  - CurrentSkills: Student's existing skill proficiency
  - CertificationRoadmap: Suggested professional certifications

USAGE:
  Rendered when user navigates to "Skills" tab in main navigation.
============================================================================
*/

import { Code } from 'lucide-react';
import PrioritySkills from './PrioritySkills';
import CurrentSkills from './CurrentSkills';
import CertificationRoadmap from './CertificationRoadmap';

const Skills = () => {
  return (
    // Main container with responsive spacing
    <div className="space-y-4 md:space-y-6">
      {/* White card container */}
      <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg">
        {/* Header with code icon */}
        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
          <div className="bg-[#003459] p-2 md:p-3 rounded-lg flex-shrink-0">
            <Code className="text-white" size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-[#003459] truncate">
              AI Skills Development Engine
            </h2>
            <p className="text-gray-600 text-xs md:text-sm mt-0.5 md:mt-0 break-words">
              Real-time job market analysis and personalized skill recommendations
            </p>
          </div>
        </div>

        {/* Three main sections with increased spacing */}
        <div className="space-y-6 md:space-y-8">
          <PrioritySkills />
          <CurrentSkills />
          <CertificationRoadmap />
        </div>
      </div>
    </div>
  );
};

export default Skills;

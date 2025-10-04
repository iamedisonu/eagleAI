/*
============================================================================
FILE: src/components/projects/Projects.jsx
============================================================================
PURPOSE:
  Main container for the Projects/Portfolio Builder screen. Displays all
  student projects (active, planned, and ideas) with AI recommendations.

FEATURES:
  - OC blue branding with briefcase icon
  - Responsive spacing and layout
  - Maps through projects array and renders ProjectCard for each

CHILD COMPONENTS:
  - ProjectCard: Individual project display with status, progress, AI insights

DATA SOURCE:
  AppContext: projects array

USAGE:
  Rendered when user navigates to "Projects" tab in main navigation.
============================================================================
*/

import { Briefcase } from 'lucide-react';
import ProjectCard from './ProjectCard';
import { useApp } from '../../context/AppContext.js';

const Projects = () => {
  // Get projects data from context
  const { projects } = useApp();

  return (
    // Main container with responsive spacing
    <div className="space-y-4 md:space-y-6">
      {/* White card container */}
      <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg">
        {/* Header with briefcase icon */}
        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
          <div className="bg-brand-maroon p-2 md:p-3 rounded-lg flex-shrink-0">
            <Briefcase className="text-white" size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-brand-maroon truncate">
              AI Portfolio Builder
            </h2>
            <p className="text-gray-600 text-xs md:text-sm mt-0.5 md:mt-0 break-words">
              Smart project recommendations tailored to your career trajectory
            </p>
          </div>
        </div>

        {/* Projects list - each rendered as ProjectCard */}
        <div className="space-y-3 md:space-y-5">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;

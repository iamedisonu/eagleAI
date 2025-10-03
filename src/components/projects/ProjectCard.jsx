/*
============================================================================
FILE: src/components/projects/ProjectCard.jsx
============================================================================
PURPOSE:
  Individual project card component displaying project details, progress,
  AI suggestions, next steps, and career impact analysis.

FEATURES:
  - Status-based border colors (active=green, planned=blue, idea=gray)
  - Progress bar (for active/in-progress projects)
  - Skill badges showing required technologies
  - Three AI insight boxes:
    * AI Suggestion (improvement recommendations)
    * Next Step (immediate action items)
    * Career Impact (portfolio value assessment)
  - Action buttons (Update/Start, Details)
  - Fully responsive layout

PROPS:
  - project: Object containing:
    * id, title, status, progress, skills array
    * aiSuggestion, aiNextStep, aiImpact

RESPONSIVE BEHAVIOR:
  - Mobile: Stacked vertical layout, full-width buttons
  - Tablet (sm+): Horizontal layouts where appropriate
  - All text wraps properly to prevent overflow
============================================================================
*/

import React from 'react';
import { Lightbulb, Zap, Star, Sparkles } from 'lucide-react';
import ProgressBar from '../shared/ProgressBar';
import Button from '../shared/Button';
import Badge from '../shared/Badge';

const ProjectCard = ({ project }) => {
  // Helper: Determine border color based on project status
  const getBorderColor = (status) => {
    switch (status) {
      case 'active': return 'border-green-500 bg-gradient-to-br from-green-50 to-white';
      case 'planned': return 'border-[#003459] bg-gradient-to-br from-blue-50 to-white';
      default: return 'border-gray-300 bg-gradient-to-br from-gray-50 to-white';
    }
  };

  // Helper: Map status to badge variant
  const getStatusVariant = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'planned': return 'primary';
      default: return 'default';
    }
  };

  return (
    // Card with dynamic border based on status
    <div className={`border-3 rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg hover:shadow-2xl transition-all ${getBorderColor(project.status)}`}>
      {/* Project header: title, skills, status */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 md:gap-3 mb-3 md:mb-4">
        {/* Project title and skill badges */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg md:text-xl text-gray-800 mb-2 break-words">
            {project.title}
          </h3>
          {/* Skill/technology badges */}
          <div className="flex gap-1.5 md:gap-2 flex-wrap">
            {project.skills.map((skill, idx) => (
              <Badge key={idx} variant="default" size="sm">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
        {/* Status badge */}
        <Badge variant={getStatusVariant(project.status)} size="md" className="self-start sm:self-auto">
          {project.status.toUpperCase()}
        </Badge>
      </div>
      
      {/* Progress bar (only shown if progress > 0) */}
      {project.progress > 0 && (
        <ProgressBar 
          progress={project.progress}
          color="green"
          size="md"
          className="mb-3 md:mb-4"
        />
      )}
      
      {/* AI insights section - three boxes */}
      <div className="space-y-2 md:space-y-3 mb-3 md:mb-4">
        {/* AI Suggestion box */}
        <div className="bg-white border-2 border-blue-300 p-3 md:p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <Lightbulb size={16} className="text-[#C8102E] mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#003459] mb-1">AI SUGGESTION</p>
              <p className="text-xs md:text-sm text-gray-700 break-words">
                {project.aiSuggestion}
              </p>
            </div>
          </div>
        </div>
        
        {/* Next Step box */}
        <div className="bg-blue-50 border-l-4 border-[#003459] p-2 md:p-3 rounded">
          <div className="flex items-start gap-2">
            <Zap size={14} className="text-[#003459] mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#003459] mb-1">NEXT STEP</p>
              <p className="text-xs md:text-sm text-gray-700 break-words">
                {project.aiNextStep}
              </p>
            </div>
          </div>
        </div>
        
        {/* Career Impact box */}
        <div className="bg-yellow-50 border-l-4 border-[#C8102E] p-2 md:p-3 rounded">
          <div className="flex items-start gap-2">
            <Star size={14} className="text-[#C8102E] mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#C8102E] mb-1">CAREER IMPACT</p>
              <p className="text-xs md:text-sm text-gray-700 break-words">
                {project.aiImpact}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action buttons - stack on mobile, inline on tablet+ */}
      <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
        <Button variant="primary" fullWidth icon={Sparkles} size="md">
          {project.status === 'idea' ? 'Start with AI Guidance' : 'Update Progress'}
        </Button>
        <Button variant="secondary" fullWidth size="md" className="sm:w-auto sm:px-6">
          Details
        </Button>
      </div>
    </div>
  );
};

export default React.memo(ProjectCard);

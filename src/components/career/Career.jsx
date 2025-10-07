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

import { useState } from 'react';
import { TrendingUp, Briefcase, Users, Globe, FileText } from 'lucide-react';
import CareerCard from './CareerCard';
import JobMatches from '../jobs/JobMatches';
import JobScrapingSimulator from '../jobs/JobScrapingSimulator';
import MockResumeStorage from '../resume/MockResumeStorage';
import { useApp } from '../../context/AppContext.js';

const Career = () => {
  // Get careers data from context
  const { careers } = useApp();
  const [activeTab, setActiveTab] = useState('careers');
  
  // Mock student ID - in real app, this would come from auth context
  const studentId = 'mock-student-id';

  return (
    // Main container with responsive spacing
    <div className="space-y-4 md:space-y-6">
      {/* Tab Navigation */}
      <div className="bg-brand-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg">
        <div className="flex items-center gap-2 md:gap-3 mb-4">
          <div className="bg-brand-maroon p-2 md:p-3 rounded-lg flex-shrink-0">
            <TrendingUp className="text-brand-white" size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-brand-maroon truncate">
              AI Career Intelligence Platform
            </h2>
            <p className="text-neutral-600 text-xs md:text-sm mt-0.5 md:mt-0 break-words">
              Real-time market analysis and personalized career pathway optimization
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('careers')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-md font-semibold transition-all duration-200 ${
              activeTab === 'careers'
                ? 'bg-brand-white text-brand-maroon shadow-sm'
                : 'text-gray-600 hover:text-brand-maroon hover:bg-white/50'
            }`}
          >
            <TrendingUp size={18} />
            <span className="hidden sm:inline">Career Paths</span>
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-md font-semibold transition-all duration-200 ${
              activeTab === 'jobs'
                ? 'bg-brand-white text-brand-maroon shadow-sm'
                : 'text-gray-600 hover:text-brand-maroon hover:bg-white/50'
            }`}
          >
            <Briefcase size={18} />
            <span className="hidden sm:inline">Job Matches</span>
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-md font-semibold transition-all duration-200 ${
              activeTab === 'resume'
                ? 'bg-brand-white text-brand-maroon shadow-sm'
                : 'text-gray-600 hover:text-brand-maroon hover:bg-white/50'
            }`}
          >
            <FileText size={18} />
            <span className="hidden sm:inline">My Resume</span>
          </button>
          <button
            onClick={() => setActiveTab('scraping')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-md font-semibold transition-all duration-200 ${
              activeTab === 'scraping'
                ? 'bg-brand-white text-brand-maroon shadow-sm'
                : 'text-gray-600 hover:text-brand-maroon hover:bg-white/50'
            }`}
          >
            <Globe size={18} />
            <span className="hidden sm:inline">Job Scraping</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'careers' && (
        <div className="bg-brand-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg">
          {/* Careers list - each rendered as CareerCard */}
          <div className="space-y-3 md:space-y-5">
            {careers.map((career, idx) => (
              <CareerCard key={idx} career={career} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'jobs' && (
        <JobMatches studentId={studentId} />
      )}

      {activeTab === 'resume' && (
        <MockResumeStorage 
          userId={studentId} 
          onResumeUpdate={(resume) => {
            console.log('Resume updated:', resume);
            // In a real app, this would trigger job matching updates
          }} 
        />
      )}

      {activeTab === 'scraping' && (
        <JobScrapingSimulator />
      )}
    </div>
  );
};

export default Career;

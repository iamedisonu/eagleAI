/*
============================================================================
FILE: src/router/AppRouter.jsx
============================================================================
PURPOSE:
  React Router configuration for EagleAI application.
  Provides URL-based routing with proper navigation and deep linking.

FEATURES:
  - URL-based routing for all main sections
  - Browser history support
  - Deep linking to specific pages
  - Scroll position restoration
  - Route-based code splitting
  - Protected routes (future implementation)
  - 404 error handling

ROUTES:
  - / - Dashboard (default)
  - /career - Career Intelligence
  - /mentorship - Mentorship Matching
  - /projects - Project Portfolio
  - /roadmap - Academic Roadmap
  - /skills - Skills Development
  - /resume - Resume Review
============================================================================
*/

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import Navigation from '../components/navigation/Navigation';

// Lazy load page components for better performance
const Dashboard = lazy(() => import('../components/dashboard/Dashboard'));
const Career = lazy(() => import('../components/career/Career'));
const Mentorship = lazy(() => import('../components/mentorship/Mentorship'));
const Projects = lazy(() => import('../components/projects/Projects'));
const Roadmap = lazy(() => import('../components/roadmap/Roadmap'));
const Skills = lazy(() => import('../components/skills/Skills'));
const ResumeReview = lazy(() => import('../components/resume/ResumeReview'));

// 404 Not Found component
const NotFound = () => (
  <div className="flex items-center justify-center min-h-screen bg-brand-nearwhite-1">
    <div className="text-center">
      <div className="bg-gradient-to-br from-brand-maroon/10 to-brand-crimson/10 p-8 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center">
        <svg className="w-16 h-16 text-brand-maroon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.291A7.962 7.962 0 0012 5c-2.34 0-4.29 1.009-5.824 2.709" />
        </svg>
      </div>
      <h1 className="text-4xl font-bold text-brand-maroon mb-4">404 - Page Not Found</h1>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button
        onClick={() => window.history.back()}
        className="bg-brand-maroon text-white px-6 py-3 rounded-lg hover:bg-brand-crimson transition-colors duration-200 font-semibold"
      >
        Go Back
      </button>
    </div>
  </div>
);

// Loading component for route transitions
const RouteLoader = () => (
  <div className="flex items-center justify-center py-12">
    <LoadingSpinner 
      size="large" 
      text="Loading page..." 
      color="brand-maroon"
    />
  </div>
);

// Main router component
const AppRouter = () => {
  return (
    <Router>
      <div className="min-h-screen bg-brand-nearwhite-1">
        {/* Navigation Header */}
        <Navigation />
        
        {/* Main Content */}
        <main className="max-w-full mx-auto px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 my-2 sm:my-3 lg:my-4">
          <Suspense fallback={<RouteLoader />}>
            <Routes>
              {/* Default route - redirect to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Main application routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/career" element={<Career />} />
              <Route path="/mentorship" element={<Mentorship />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/skills" element={<Skills />} />
              <Route path="/resume" element={<ResumeReview />} />
              
              {/* Legacy routes for backward compatibility */}
              <Route path="/resume-review" element={<Navigate to="/resume" replace />} />
              
              {/* 404 route - must be last */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
};

export default AppRouter;

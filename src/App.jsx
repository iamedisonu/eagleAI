/*
============================================================================
FILE: src/App.jsx
============================================================================
PURPOSE:
  Main application component that renders all the EagleAI screens with
  navigation between different sections.

FEATURES:
  - Tab-based navigation between sections
  - Responsive design with mobile-first approach
  - OC blue branding throughout
  - Clean, modern UI with proper spacing

SECTIONS:
  - Career: AI career intelligence and job matching
  - Mentorship: AI-powered mentor matching
  - Projects: Portfolio builder with AI recommendations
  - Roadmap: Academic roadmap with course recommendations
  - Skills: Skills development with market analysis
============================================================================
*/

import { useState } from 'react';
import TestComponent from './TestComponent';
import { AppProvider } from './context/AppProvider';
import { EagleMentorProvider } from './context/EagleMentorProvider';
import Dashboard from './components/dashboard/Dashboard';
import Career from './components/career/Career';
import Mentorship from './components/mentorship/Mentorship';
import Projects from './components/projects/Projects';
import Roadmap from './components/roadmap/Roadmap';
import Skills from './components/skills/Skills';
import ResumeReview from './components/resume/ResumeReview';
import NotificationBell from './components/shared/NotificationBell';
import UniversalSearch from './components/shared/UniversalSearch';
import FloatingMentorButton from './components/eagle-mentor/FloatingMentorButton';
import EagleMentorPanel from './components/eagle-mentor/EagleMentorPanel';
import ErrorBoundary from './components/ErrorBoundary';
import { 
  Home,
  TrendingUp, 
  Users, 
  Briefcase, 
  Brain, 
  Code,
  FileText,
  Menu,
  X
} from 'lucide-react';

const App = () => {
  console.log('App component is rendering...');
  
  // Simple test - return the test component directly
  return <TestComponent />;
};

export default App;

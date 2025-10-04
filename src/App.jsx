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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Navigation items with icons
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'career', label: 'Career', icon: TrendingUp },
    { id: 'mentorship', label: 'Mentorship', icon: Users },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'roadmap', label: 'Roadmap', icon: Brain },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'resume', label: 'Resume Review', icon: FileText }
  ];

  // Render the active component
  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'career':
        return <Career />;
      case 'mentorship':
        return <Mentorship />;
      case 'projects':
        return <Projects />;
      case 'roadmap':
        return <Roadmap />;
      case 'skills':
        return <Skills />;
      case 'resume':
        return <ResumeReview />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <AppProvider>
      <EagleMentorProvider>
        <div className="min-h-screen bg-brand-nearwhite-1">
          {/* Debug indicator */}
          <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: 'green',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 9999
          }}>
            App is rendering
          </div>
        {/* Header */}
            <header className="bg-brand-maroon text-brand-white shadow-lg">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              {/* Logo and title */}
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-brand-white to-brand-nearwhite-1 p-3 rounded-xl shadow-md">
                  <Brain className="text-brand-maroon" size={28} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-brand-white tracking-tight">EagleAI</h1>
                  <p className="text-sm text-brand-nearwhite-1 font-medium">Career Intelligence Platform</p>
                </div>
              </div>

              {/* Desktop: Search and Notifications */}
              <div className="hidden md:flex items-center gap-3">
                <UniversalSearch 
                  isOpen={isSearchOpen}
                  onToggle={() => setIsSearchOpen(!isSearchOpen)}
                  onClose={() => setIsSearchOpen(false)}
                />
                <NotificationBell 
                  isOpen={isNotificationOpen}
                  onToggle={() => setIsNotificationOpen(!isNotificationOpen)}
                  onClose={() => setIsNotificationOpen(false)}
                />
              </div>

              {/* Mobile menu button */}
              <button
                    className="md:hidden p-3 rounded-xl text-brand-white hover:bg-brand-white/10 transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex space-x-2 pb-6">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                        className={`flex items-center gap-3 px-5 py-3 rounded-xl font-semibold transition-all duration-200 ${
                          activeTab === item.id
                            ? 'bg-brand-white text-brand-maroon shadow-lg transform scale-105'
                            : 'text-brand-white/90 hover:bg-brand-white/10 hover:text-brand-white hover:scale-105'
                        }`}
                  >
                    <Icon size={20} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Navigation - Mobile */}
            {isMobileMenuOpen && (
              <nav className="md:hidden space-y-2 pb-6">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                          className={`flex items-center gap-4 w-full px-5 py-4 rounded-xl font-semibold transition-all duration-200 ${
                            activeTab === item.id
                              ? 'bg-brand-white text-brand-maroon shadow-lg'
                              : 'text-brand-white/90 hover:bg-brand-white/10 hover:text-brand-white'
                          }`}
                    >
                      <Icon size={22} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            )}
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-full mx-auto px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 my-2 sm:my-3 lg:my-4">
          {renderActiveComponent()}
        </main>

        {/* Footer */}
            <footer className="bg-brand-maroon text-brand-white">
          <div className="max-w-full mx-auto px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4">
            <div className="text-center">
              <p className="text-sm">
                © 2024 EagleAI - AI-Powered Career Intelligence Platform
              </p>
              <p className="text-xs mt-1 text-brand-nearwhite-1">
                Empowering students with data-driven career insights
              </p>
            </div>
          </div>
        </footer>

        {/* AI Disclaimer Banner */}
        <div className="bg-accent-gold/10 border-t border-accent-gold/20 py-3">
          <div className="max-w-full mx-auto px-2 sm:px-3 lg:px-4">
            <div className="flex items-center justify-center gap-2 text-center">
              <div className="w-2 h-2 bg-accent-gold rounded-full flex-shrink-0"></div>
              <p className="text-xs text-gray-600 max-w-4xl">
                <span className="font-semibold">EagleAI can make mistakes.</span> Check important info.
              </p>
            </div>
          </div>
        </div>

        {/* Eagle Mentor Components */}
        <ErrorBoundary>
          <FloatingMentorButton />
          <EagleMentorPanel />
        </ErrorBoundary>
      </div>
      </EagleMentorProvider>
    </AppProvider>
  );
};

export default App;

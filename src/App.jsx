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
import Career from './components/career/Career';
import Mentorship from './components/mentorship/Mentorship';
import Projects from './components/projects/Projects';
import Roadmap from './components/roadmap/Roadmap';
import Skills from './components/skills/Skills';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  Brain, 
  Code,
  Menu,
  X
} from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('career');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation items with icons
  const navigationItems = [
    { id: 'career', label: 'Career', icon: TrendingUp },
    { id: 'mentorship', label: 'Mentorship', icon: Users },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'roadmap', label: 'Roadmap', icon: Brain },
    { id: 'skills', label: 'Skills', icon: Code }
  ];

  // Render the active component
  const renderActiveComponent = () => {
    switch (activeTab) {
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
      default:
        return <Career />;
    }
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo and title */}
              <div className="flex items-center gap-3">
                <div className="bg-[#003459] p-2 rounded-lg">
                  <Brain className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#003459]">EagleAI</h1>
                  <p className="text-xs text-gray-600">Career Intelligence Platform</p>
                </div>
              </div>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex space-x-1 pb-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      activeTab === item.id
                        ? 'bg-[#003459] text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-[#003459]'
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Navigation - Mobile */}
            {isMobileMenuOpen && (
              <nav className="md:hidden space-y-1 pb-4">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-all ${
                        activeTab === item.id
                          ? 'bg-[#003459] text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-[#003459]'
                      }`}
                    >
                      <Icon size={20} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            )}
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {renderActiveComponent()}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-gray-600">
              <p className="text-sm">
                © 2024 EagleAI - AI-Powered Career Intelligence Platform
              </p>
              <p className="text-xs mt-1">
                Empowering students with data-driven career insights
              </p>
            </div>
          </div>
        </footer>
      </div>
    </AppProvider>
  );
};

export default App;

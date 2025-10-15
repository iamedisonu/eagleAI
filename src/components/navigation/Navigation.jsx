/*
============================================================================
FILE: src/components/navigation/Navigation.jsx
============================================================================
PURPOSE:
  Navigation component for EagleAI application using React Router.
  Provides header navigation with proper routing and mobile support.

FEATURES:
  - React Router integration
  - Mobile-responsive hamburger menu
  - Active route highlighting
  - Search and notification integration
  - OC brand styling
  - Accessibility features
============================================================================
*/

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
import { useNavigation } from '../../hooks/useNavigation';
import NotificationBell from '../shared/NotificationBell';
import UniversalSearch from '../shared/UniversalSearch';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const { availableRoutes, isActive } = useNavigation();
  const location = useLocation();

  // Icon mapping
  const iconMap = {
    Home,
    TrendingUp,
    Users,
    Briefcase,
    Brain,
    Code,
    FileText
  };

  const handleNavigation = (path) => {
    setIsMobileMenuOpen(false);
    // Navigation is handled by React Router Link components
  };

  return (
    <header className="bg-brand-maroon text-brand-white shadow-lg">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and title */}
          <Link to="/dashboard" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
            <div className="bg-gradient-to-br from-brand-white to-brand-nearwhite-1 p-3 rounded-xl shadow-md">
              <Brain className="text-brand-maroon" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-brand-white tracking-tight">EagleAI</h1>
              <p className="text-sm text-brand-nearwhite-1 font-medium">Career Intelligence Platform</p>
            </div>
          </Link>

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
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex space-x-2 pb-6">
          {availableRoutes.map((route) => {
            const Icon = iconMap[route.icon];
            const isRouteActive = isActive(route.path);
            
            return (
              <Link
                key={route.path}
                to={route.path}
                className={`flex items-center gap-3 px-5 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  isRouteActive
                    ? 'bg-brand-white text-brand-maroon shadow-lg transform scale-105'
                    : 'text-brand-white/90 hover:bg-brand-white/10 hover:text-brand-white hover:scale-105'
                }`}
                onClick={() => handleNavigation(route.path)}
              >
                <Icon size={20} />
                {route.label}
              </Link>
            );
          })}
        </nav>

        {/* Navigation - Mobile */}
        {isMobileMenuOpen && (
          <nav className="md:hidden space-y-2 pb-6">
            {availableRoutes.map((route) => {
              const Icon = iconMap[route.icon];
              const isRouteActive = isActive(route.path);
              
              return (
                <Link
                  key={route.path}
                  to={route.path}
                  className={`flex items-center gap-4 w-full px-5 py-4 rounded-xl font-semibold transition-all duration-200 ${
                    isRouteActive
                      ? 'bg-brand-white text-brand-maroon shadow-lg'
                      : 'text-brand-white/90 hover:bg-brand-white/10 hover:text-brand-white'
                  }`}
                  onClick={() => handleNavigation(route.path)}
                >
                  <Icon size={22} />
                  {route.label}
                </Link>
              );
            })}
            
            {/* Mobile Search and Notifications */}
            <div className="pt-4 border-t border-brand-white/20">
              <div className="flex items-center gap-3 px-5 py-3">
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
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navigation;

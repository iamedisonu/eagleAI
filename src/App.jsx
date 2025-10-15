/*
============================================================================
FILE: src/App.jsx
============================================================================
PURPOSE:
  Main application component that renders all the EagleAI screens with
  navigation between different sections. This is the root component that
  orchestrates the entire application state and routing.

FEATURES:
  - Tab-based navigation between sections
  - Responsive design with mobile-first approach
  - OC brand styling throughout (maroon #811429, crimson #660000)
  - Clean, modern UI with proper spacing and animations
  - Mobile-responsive hamburger menu
  - Real-time notifications and search functionality
  - AI mentor integration with floating button

ARCHITECTURE:
  - Uses React Context for global state management
  - Implements custom navigation system (no React Router)
  - Integrates multiple context providers for different features
  - Error boundaries for graceful error handling

SECTIONS:
  - Dashboard: Overview and quick actions
  - Career: AI career intelligence and job matching
  - Mentorship: AI-powered mentor matching
  - Projects: Portfolio builder with AI recommendations
  - Roadmap: Academic roadmap with course recommendations
  - Skills: Skills development with market analysis
  - Resume: Resume upload, analysis, and feedback

CONTEXT PROVIDERS:
  - AppProvider: Main application data (careers, projects, skills, etc.)
  - EagleMentorProvider: AI mentor chat and task management

RESPONSIVE BREAKPOINTS:
  - Mobile: < 768px (hamburger menu)
  - Tablet: 768px - 1024px (condensed navigation)
  - Desktop: > 1024px (full navigation)

PERFORMANCE CONSIDERATIONS:
  - Lazy loading of components (implemented via switch statement)
  - Memoized navigation items to prevent unnecessary re-renders
  - Optimized mobile menu state management
============================================================================
*/

import { AppProvider } from './context/AppProvider';
import { EagleMentorProvider } from './context/EagleMentorProvider';
import { NotificationProvider } from './context/NotificationProvider';
import { NavigationProvider } from './context/NavigationProvider';
import AppRouter from './router/AppRouter';
import ErrorBoundary from './components/ErrorBoundary';
import FloatingMentorButton from './components/eagle-mentor/FloatingMentorButton';
import EagleMentorPanel from './components/eagle-mentor/EagleMentorPanel';

/**
 * Main App Component
 * 
 * This is the root component of the EagleAI application that provides:
 * - Context providers for global state management
 * - Router-based navigation
 * - Error boundaries for graceful error handling
 * - Global UI components (notifications, search, mentor)
 * 
 * @returns {JSX.Element} The complete application UI
 */
const App = () => {
  return (
    <AppProvider>
      <EagleMentorProvider>
        <NotificationProvider>
          <NavigationProvider>
            <div className="min-h-screen bg-brand-nearwhite-1">
              {/* Router-based navigation and content */}
              <AppRouter />
              
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
          </NavigationProvider>
        </NotificationProvider>
      </EagleMentorProvider>
    </AppProvider>
  );
};

export default App;

/*
============================================================================
FILE: src/context/AppContext.js
============================================================================
PURPOSE:
  Defines the AppContext and custom hook for consuming it throughout the app.
  This file is separated from AppProvider to prevent Vite Fast Refresh errors.
  
IMPORTANT:
  Keep this file separate from AppProvider.jsx to maintain Vite HMR compatibility.
  Mixing component exports with hook exports can cause preamble detection errors.
============================================================================
*/

import { createContext, useContext } from 'react';

/**
 * Global application context for EagleAI data
 * Provides access to careers, mentorship, projects, roadmap, and skills data
 * @type {React.Context}
 */
export const AppContext = createContext(null);

/**
 * Custom hook to safely consume AppContext
 * 
 * @returns {Object} Context value containing all app data
 * @throws {Error} If used outside of AppProvider
 * 
 * @example
 * function MyComponent() {
 *   const { careers, mentorship } = useApp();
 *   return <div>{careers.length} careers found</div>;
 * }
 */
export const useApp = () => {
  const context = useContext(AppContext);
  
  // Throw error if hook is used outside provider
  // This prevents silent bugs from undefined context values
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  
  return context;
};



/*
============================================================================
FILE: src/context/NavigationProvider.jsx
============================================================================
PURPOSE:
  Context provider for handling navigation throughout the application.
  Provides centralized navigation state and functions for routing between
  different sections and handling job-related navigation.

FEATURES:
  - Active tab management
  - Job navigation handling
  - Modal state management
  - Deep linking support
  - Navigation history

USAGE:
  Wrap your app with NavigationProvider and use useNavigation hook
  to access navigation state and functions.
============================================================================
*/

import { createContext, useContext, useState, useCallback } from 'react';

const NavigationContext = createContext(null);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export const NavigationProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [navigationHistory, setNavigationHistory] = useState(['dashboard']);

  // Navigate to a specific tab
  const navigateToTab = useCallback((tab) => {
    setActiveTab(tab);
    setNavigationHistory(prev => [...prev, tab]);
  }, []);

  // Navigate to career page and optionally open a specific job
  const navigateToJob = useCallback((job = null) => {
    setActiveTab('career');
    if (job) {
      setSelectedJob(job);
      setIsJobModalOpen(true);
    }
    setNavigationHistory(prev => [...prev, 'career']);
  }, []);

  // Open job details modal
  const openJobModal = useCallback((job) => {
    setSelectedJob(job);
    setIsJobModalOpen(true);
  }, []);

  // Close job details modal
  const closeJobModal = useCallback(() => {
    setIsJobModalOpen(false);
    setSelectedJob(null);
  }, []);

  // Navigate back in history
  const navigateBack = useCallback(() => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop(); // Remove current
      const previousTab = newHistory[newHistory.length - 1];
      setActiveTab(previousTab);
      setNavigationHistory(newHistory);
    }
  }, [navigationHistory]);

  // Handle job application
  const handleJobApplication = useCallback((job) => {
    if (job.applicationUrl) {
      // Open application URL in new tab
      window.open(job.applicationUrl, '_blank');
      
      // Track application in navigation history
      setNavigationHistory(prev => [...prev, `job-application-${job._id}`]);
    } else {
      console.warn('No application URL available for job:', job.title);
    }
  }, []);

  // Handle notification navigation
  const handleNotificationNavigation = useCallback((notification) => {
    switch (notification.type) {
      case 'job-match':
        if (notification.applicationUrl) {
          // Open job application directly
          window.open(notification.applicationUrl, '_blank');
        } else if (notification.relatedJobId) {
          // Navigate to career page and try to find the job
          navigateToJob({ _id: notification.relatedJobId });
        } else {
          // Just navigate to career page
          navigateToTab('career');
        }
        break;
      case 'resume-analysis':
        navigateToTab('resume');
        break;
      case 'mentorship':
        navigateToTab('mentorship');
        break;
      case 'projects':
        navigateToTab('projects');
        break;
      case 'skills':
        navigateToTab('skills');
        break;
      case 'roadmap':
        navigateToTab('roadmap');
        break;
      default:
        navigateToTab('dashboard');
    }
  }, [navigateToTab, navigateToJob]);

  const value = {
    activeTab,
    setActiveTab,
    isJobModalOpen,
    selectedJob,
    navigationHistory,
    navigateToTab,
    navigateToJob,
    openJobModal,
    closeJobModal,
    navigateBack,
    handleJobApplication,
    handleNotificationNavigation
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

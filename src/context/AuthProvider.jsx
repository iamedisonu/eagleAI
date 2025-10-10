/*
============================================================================
FILE: src/context/AuthProvider.jsx
============================================================================
PURPOSE:
  Context provider for authentication system supporting both guest mode and
  real user login for @eagles.oc.edu email addresses.

FEATURES:
  - Email-based authentication for @eagles.oc.edu users
  - Guest mode fallback for non-OC users
  - Session management and persistence
  - User profile integration
  - Automatic guest profile creation

USAGE:
  Wrap the app with this provider to enable authentication.
============================================================================
*/

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUserProfile } from './UserProfileProvider';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const { currentProfile, createNewProfile, switchProfile } = useUserProfile();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(true);

  // Load authentication state from localStorage on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('eagleAI-auth');
    const savedUser = localStorage.getItem('eagleAI-user');
    const savedToken = localStorage.getItem('eagleAI-token');
    
    if (savedAuth && savedUser && savedToken) {
      try {
        const authData = JSON.parse(savedAuth);
        const userData = JSON.parse(savedUser);
        
        if (authData.isAuthenticated && userData.email) {
          setUser(userData);
          setIsAuthenticated(true);
          setIsGuestMode(false);
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
        // Clear invalid data
        localStorage.removeItem('eagleAI-auth');
        localStorage.removeItem('eagleAI-user');
        localStorage.removeItem('eagleAI-token');
      }
    }
    
    setIsLoading(false);
  }, []);

  // Save authentication state to localStorage
  useEffect(() => {
    if (isAuthenticated && user) {
      localStorage.setItem('eagleAI-auth', JSON.stringify({ isAuthenticated: true }));
      localStorage.setItem('eagleAI-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('eagleAI-auth');
      localStorage.removeItem('eagleAI-user');
      localStorage.removeItem('eagleAI-token');
    }
  }, [isAuthenticated, user]);

  // Validate email format for OC users
  const isValidOCEmail = (email) => {
    return email && email.toLowerCase().endsWith('@eagles.oc.edu');
  };

  // Handle Google OAuth callback
  const handleGoogleCallback = async (token) => {
    try {
      setIsLoading(true);
      
      // Verify token with backend
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
        setIsAuthenticated(true);
        setIsGuestMode(false);
        
        // Create fresh user profile (always fresh start)
        const userProfile = await createOrGetUserProfile(userData.user);
        if (userProfile) {
          switchProfile(userProfile.id);
        }
        
        return { success: true };
      } else {
        throw new Error('Token verification failed');
      }
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Main login function (simplified for guest mode only)
  const login = async (userName) => {
    return switchToGuestMode(userName);
  };

  // Clear all user-specific data for fresh start
  const clearUserData = () => {
    const keysToRemove = [
      'eagleAI-resume-data',
      'eagleAI-job-matches', 
      'eagleAI-user-preferences',
      'eagleAI-saved-jobs',
      'eagleAI-application-history',
      'eagleAI-skill-assessments',
      'eagleAI-career-goals',
      'eagleAI-mentorship-sessions',
      'eagleAI-notifications',
      'eagleAI-search-history',
      'eagleAI-filters',
      'eagleAI-dashboard-state'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('All user-specific data cleared for fresh start');
  };

  // Create fresh user profile for authenticated user
  const createOrGetUserProfile = async (userData) => {
    try {
      const existingProfiles = JSON.parse(localStorage.getItem('eagleAI-profiles') || '[]');
      
      // Remove any existing profile for this user to ensure fresh start
      const filteredProfiles = existingProfiles.filter(p => p.userId !== userData.id);
      
      // Clear all user-specific data for fresh start
      clearUserData();
      
      // Create fresh profile for authenticated user
      const userProfile = {
        id: `profile-${userData.id}`,
        userId: userData.id,
        name: userData.name,
        email: userData.email,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        resumeData: null,
        jobMatches: [],
        preferences: {
          jobTypes: ['internship', 'full-time'],
          locations: [],
          skills: [],
          experienceLevel: 'entry'
        },
        isAuthenticated: true
      };
      
      // Add fresh profile to the list
      const updatedProfiles = [...filteredProfiles, userProfile];
      localStorage.setItem('eagleAI-profiles', JSON.stringify(updatedProfiles));
      
      console.log(`Fresh profile created for user: ${userData.email}`);
      return userProfile;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsGuestMode(true);
    
    // Clear user-specific data on logout
    clearUserData();
    
    // Switch to guest profile
    const guestProfiles = JSON.parse(localStorage.getItem('eagleAI-profiles') || '[]');
    const guestProfile = guestProfiles.find(p => !p.isAuthenticated);
    if (guestProfile) {
      switchProfile(guestProfile.id);
    }
  };

  // Switch to guest mode
  const switchToGuestMode = (guestName = 'Guest User') => {
    setIsGuestMode(true);
    setIsAuthenticated(true); // Set to true for guest mode
    setUser({ name: guestName, email: null, id: 'guest' });
    
    // Clear user-specific data when switching to guest mode
    clearUserData();
    
    // Create or switch to guest profile
    const guestProfiles = JSON.parse(localStorage.getItem('eagleAI-profiles') || '[]');
    let guestProfile = guestProfiles.find(p => !p.isAuthenticated);
    
    if (!guestProfile) {
      guestProfile = createNewProfile(guestName);
      if (guestProfile) {
        switchProfile(guestProfile.id);
      }
    } else {
      // Update existing guest profile with new name
      guestProfile.name = guestName;
      const profiles = JSON.parse(localStorage.getItem('eagleAI-profiles') || '[]');
      const profileIndex = profiles.findIndex(p => p.id === guestProfile.id);
      if (profileIndex !== -1) {
        profiles[profileIndex] = guestProfile;
        localStorage.setItem('eagleAI-profiles', JSON.stringify(profiles));
      }
      switchProfile(guestProfile.id);
    }
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (isAuthenticated && user) {
      return user.name || user.email.split('@')[0];
    }
    return currentProfile?.name || 'Guest User';
  };

  // Get user email
  const getUserEmail = () => {
    if (isAuthenticated && user) {
      return user.email;
    }
    return currentProfile?.email || null;
  };

  // Check if current user is OC student
  const isOCStudent = () => {
    return isAuthenticated && user && isValidOCEmail(user.email);
  };

  // Check if user has submitted their resume
  const hasResumeSubmitted = () => {
    if (!isAuthenticated || !user) return false;
    
    // Check if resume data exists in current profile
    const profiles = JSON.parse(localStorage.getItem('eagleAI-profiles') || '[]');
    const userProfile = profiles.find(p => p.userId === user.id);
    
    // Check if resume data exists and is not null/empty
    return userProfile && 
           userProfile.resumeData && 
           userProfile.resumeData !== null &&
           Object.keys(userProfile.resumeData).length > 0;
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    isGuestMode,
    login,
    logout,
    switchToGuestMode,
    getUserDisplayName,
    getUserEmail,
    isOCStudent,
    isValidOCEmail,
    hasResumeSubmitted,
    handleGoogleCallback
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-maroon"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

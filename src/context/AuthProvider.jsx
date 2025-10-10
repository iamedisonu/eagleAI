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
        
        // Create or switch to user profile
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

  // Login function for OC users (legacy - now uses Google OAuth)
  const login = async (email, password) => {
    // This is now handled by Google OAuth
    throw new Error('Please use Google Sign-In instead');
  };

  // Create or get user profile for authenticated user
  const createOrGetUserProfile = async (userData) => {
    try {
      // Check if profile already exists
      const existingProfiles = JSON.parse(localStorage.getItem('eagleAI-profiles') || '[]');
      let userProfile = existingProfiles.find(p => p.userId === userData.id);
      
      if (!userProfile) {
        // Create new profile for authenticated user
        userProfile = {
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
        
        // Add to profiles
        const updatedProfiles = [...existingProfiles, userProfile];
        localStorage.setItem('eagleAI-profiles', JSON.stringify(updatedProfiles));
      }
      
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
    
    // Switch to guest profile
    const guestProfiles = JSON.parse(localStorage.getItem('eagleAI-profiles') || '[]');
    const guestProfile = guestProfiles.find(p => !p.isAuthenticated);
    if (guestProfile) {
      switchProfile(guestProfile.id);
    }
  };

  // Switch to guest mode
  const switchToGuestMode = () => {
    setIsGuestMode(true);
    setIsAuthenticated(false);
    setUser(null);
    
    // Create or switch to guest profile
    const guestProfiles = JSON.parse(localStorage.getItem('eagleAI-profiles') || '[]');
    let guestProfile = guestProfiles.find(p => !p.isAuthenticated);
    
    if (!guestProfile) {
      guestProfile = createNewProfile('Guest User');
    } else {
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

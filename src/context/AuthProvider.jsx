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
    
    if (savedAuth && savedUser) {
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
    }
  }, [isAuthenticated, user]);

  // Validate email format for OC users
  const isValidOCEmail = (email) => {
    return email && email.toLowerCase().endsWith('@eagles.oc.edu');
  };

  // Login function for OC users
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      
      // Validate email format
      if (!isValidOCEmail(email)) {
        throw new Error('Please use your @eagles.oc.edu email address');
      }

      // For now, we'll simulate authentication
      // In a real app, this would call your backend API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
        setIsGuestMode(false);
        
        // Create or switch to user profile
        const userProfile = await createOrGetUserProfile(userData);
        if (userProfile) {
          switchProfile(userProfile.id);
        }
        
        return { success: true };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
    } catch (error) {
      // If backend is not available, simulate successful login for demo
      if (error.message.includes('fetch')) {
        console.log('Backend not available, simulating login for demo');
        const userData = {
          id: `user-${Date.now()}`,
          email: email,
          name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          role: 'student',
          institution: 'Oklahoma Christian University',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        setIsGuestMode(false);
        
        // Create or switch to user profile
        const userProfile = await createOrGetUserProfile(userData);
        if (userProfile) {
          switchProfile(userProfile.id);
        }
        
        return { success: true };
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
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
    isValidOCEmail
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

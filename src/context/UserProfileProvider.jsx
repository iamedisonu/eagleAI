/*
============================================================================
FILE: src/context/UserProfileProvider.jsx
============================================================================
PURPOSE:
  Context provider for managing user profiles in guest mode.
  Allows multiple users to have separate profiles without requiring login.

FEATURES:
  - Guest mode with profile switching
  - Profile persistence in localStorage
  - Unique profile IDs for data separation
  - Profile creation and management
  - Resume data isolation per profile

USAGE:
  Wrap the app with this provider to enable multi-user guest mode.
============================================================================
*/

import React, { createContext, useContext, useState, useEffect } from 'react';

const UserProfileContext = createContext();

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

export const UserProfileProvider = ({ children }) => {
  const [currentProfile, setCurrentProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load profiles from localStorage on mount
  useEffect(() => {
    const savedProfiles = localStorage.getItem('eagleAI-profiles');
    const savedCurrentProfile = localStorage.getItem('eagleAI-current-profile');
    
    if (savedProfiles) {
      const parsedProfiles = JSON.parse(savedProfiles);
      setProfiles(parsedProfiles);
      
      if (savedCurrentProfile) {
        const currentProfileData = parsedProfiles.find(p => p.id === savedCurrentProfile);
        if (currentProfileData) {
          setCurrentProfile(currentProfileData);
        }
      }
    }
    
    // If no profiles exist, create a default guest profile
    if (!savedProfiles || JSON.parse(savedProfiles).length === 0) {
      createNewProfile('Guest User');
    }
    
    setIsLoading(false);
  }, []);

  // Save profiles to localStorage whenever profiles change
  useEffect(() => {
    if (profiles.length > 0) {
      localStorage.setItem('eagleAI-profiles', JSON.stringify(profiles));
    }
  }, [profiles]);

  // Save current profile to localStorage whenever it changes
  useEffect(() => {
    if (currentProfile) {
      localStorage.setItem('eagleAI-current-profile', currentProfile.id);
    }
  }, [currentProfile]);

  // Create a new profile
  const createNewProfile = (name = 'Guest User') => {
    const newProfile = {
      id: `profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      resumeData: null,
      jobMatches: [],
      preferences: {
        jobTypes: ['internship', 'full-time'],
        locations: [],
        skills: [],
        experienceLevel: 'entry'
      }
    };

    setProfiles(prev => [...prev, newProfile]);
    setCurrentProfile(newProfile);
    return newProfile;
  };

  // Switch to a different profile
  const switchProfile = (profileId) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      setCurrentProfile(profile);
      // Update last active time
      updateProfile(profileId, { lastActive: new Date().toISOString() });
    }
  };

  // Update profile data
  const updateProfile = (profileId, updates) => {
    setProfiles(prev => 
      prev.map(profile => 
        profile.id === profileId 
          ? { ...profile, ...updates, lastActive: new Date().toISOString() }
          : profile
      )
    );
    
    // Update current profile if it's the one being updated
    if (currentProfile && currentProfile.id === profileId) {
      setCurrentProfile(prev => ({ ...prev, ...updates, lastActive: new Date().toISOString() }));
    }
  };

  // Delete a profile
  const deleteProfile = (profileId) => {
    if (profiles.length <= 1) {
      // Don't allow deleting the last profile
      return false;
    }

    setProfiles(prev => prev.filter(profile => profile.id !== profileId));
    
    // If current profile is deleted, switch to the first available profile
    if (currentProfile && currentProfile.id === profileId) {
      const remainingProfiles = profiles.filter(profile => profile.id !== profileId);
      if (remainingProfiles.length > 0) {
        setCurrentProfile(remainingProfiles[0]);
      }
    }
    
    return true;
  };

  // Update resume data for current profile
  const updateResumeData = (resumeData) => {
    if (currentProfile) {
      updateProfile(currentProfile.id, { resumeData });
    }
  };

  // Update job matches for current profile
  const updateJobMatches = (jobMatches) => {
    if (currentProfile) {
      updateProfile(currentProfile.id, { jobMatches });
    }
  };

  // Get profile-specific data key
  const getProfileKey = (key) => {
    return currentProfile ? `${key}-${currentProfile.id}` : key;
  };

  // Clear all profiles (reset to default)
  const clearAllProfiles = () => {
    localStorage.removeItem('eagleAI-profiles');
    localStorage.removeItem('eagleAI-current-profile');
    setProfiles([]);
    setCurrentProfile(null);
    createNewProfile('Guest User');
  };

  const value = {
    currentProfile,
    profiles,
    isLoading,
    createNewProfile,
    switchProfile,
    updateProfile,
    deleteProfile,
    updateResumeData,
    updateJobMatches,
    getProfileKey,
    clearAllProfiles
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-maroon"></div>
      </div>
    );
  }

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};

export default UserProfileProvider;

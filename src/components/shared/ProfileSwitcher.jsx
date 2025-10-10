/*
============================================================================
FILE: src/components/shared/ProfileSwitcher.jsx
============================================================================
PURPOSE:
  Component for switching between user profiles in guest mode.
  Provides a dropdown interface for profile management.

FEATURES:
  - Profile switching dropdown
  - Create new profile option
  - Profile deletion (with confirmation)
  - Profile information display
  - Guest mode indicators

USAGE:
  Used in the main navigation or header to allow profile switching.
============================================================================
*/

import React, { useState } from 'react';
import { 
  User, 
  Plus, 
  Trash2, 
  ChevronDown, 
  Users, 
  Clock,
  Briefcase,
  FileText,
  LogIn,
  LogOut,
  GraduationCap
} from 'lucide-react';
import { useUserProfile } from '../../context/UserProfileProvider';
import { useAuth } from '../../context/AuthProvider';
import LoginModal from '../auth/LoginModal';

const ProfileSwitcher = () => {
  const {
    currentProfile,
    profiles,
    createNewProfile,
    switchProfile,
    deleteProfile,
    clearAllProfiles
  } = useUserProfile();
  
  const {
    isAuthenticated,
    user,
    isGuestMode,
    logout,
    switchToGuestMode,
    getUserDisplayName,
    getUserEmail,
    isOCStudent
  } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleCreateProfile = () => {
    const name = prompt('Enter profile name:', 'Guest User');
    if (name && name.trim()) {
      createNewProfile(name.trim());
    }
    setIsOpen(false);
  };

  const handleDeleteProfile = (profileId, profileName) => {
    if (profiles.length <= 1) {
      alert('Cannot delete the last profile. Create a new profile first.');
      return;
    }

    if (confirm(`Are you sure you want to delete "${profileName}"? This action cannot be undone.`)) {
      deleteProfile(profileId);
      setShowDeleteConfirm(null);
    }
  };

  const formatLastActive = (lastActive) => {
    const date = new Date(lastActive);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (!currentProfile) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
        <User size={16} className="text-gray-500" />
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isOCStudent() ? 'bg-green-600' : isAuthenticated ? 'bg-blue-600' : 'bg-brand-maroon'
        }`}>
          {isOCStudent() ? (
            <GraduationCap size={16} className="text-white" />
          ) : (
            <User size={16} className="text-white" />
          )}
        </div>
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900">{getUserDisplayName()}</div>
          <div className="text-xs text-gray-500">
            {isOCStudent() ? 'OC Student' : isAuthenticated ? 'Authenticated' : 'Guest Mode'}
          </div>
        </div>
        <ChevronDown size={16} className="text-gray-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isOCStudent() ? 'bg-green-600' : isAuthenticated ? 'bg-blue-600' : 'bg-brand-maroon'
              }`}>
                {isOCStudent() ? (
                  <GraduationCap size={20} className="text-white" />
                ) : (
                  <User size={20} className="text-white" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{getUserDisplayName()}</h3>
                <p className="text-sm text-gray-500">
                  {isOCStudent() ? 'OC Student' : isAuthenticated ? 'Authenticated User' : 'Guest Profile'}
                </p>
                {getUserEmail() && (
                  <p className="text-xs text-gray-400">{getUserEmail()}</p>
                )}
                <p className="text-xs text-gray-400">
                  Last active: {formatLastActive(currentProfile.lastActive)}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Stats */}
          <div className="p-4 border-b border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-blue-500" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {currentProfile.resumeData ? '1' : '0'}
                  </div>
                  <div className="text-xs text-gray-500">Resume</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase size={16} className="text-green-500" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {currentProfile.jobMatches?.length || 0}
                  </div>
                  <div className="text-xs text-gray-500">Job Matches</div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile List */}
          <div className="max-h-60 overflow-y-auto">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className={`flex items-center justify-between p-3 hover:bg-gray-50 ${
                  profile.id === currentProfile.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    profile.id === currentProfile.id ? 'bg-brand-maroon' : 'bg-gray-200'
                  }`}>
                    <User size={16} className={profile.id === currentProfile.id ? 'text-white' : 'text-gray-600'} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{profile.name}</div>
                    <div className="text-xs text-gray-500">
                      {formatLastActive(profile.lastActive)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {profile.id === currentProfile.id && (
                    <span className="text-xs bg-brand-maroon text-white px-2 py-1 rounded-full">
                      Active
                    </span>
                  )}
                  
                  {profile.id !== currentProfile.id && (
                    <button
                      onClick={() => {
                        switchProfile(profile.id);
                        setIsOpen(false);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Switch
                    </button>
                  )}
                  
                  {profiles.length > 1 && (
                    <button
                      onClick={() => setShowDeleteConfirm(profile.id)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-gray-100 space-y-2">
            {/* Authentication Actions */}
            {!isAuthenticated ? (
              <button
                onClick={() => {
                  setShowLoginModal(true);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-brand-maroon hover:bg-brand-maroon/10 rounded-lg transition-colors duration-200 font-medium"
              >
                <LogIn size={16} />
                Sign In with OC Email
              </button>
            ) : (
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            )}

            {/* Guest Mode Actions */}
            {isAuthenticated && (
              <button
                onClick={() => {
                  switchToGuestMode();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                <User size={16} />
                Switch to Guest Mode
              </button>
            )}

            {/* Profile Management */}
            {isGuestMode && (
              <>
                <button
                  onClick={handleCreateProfile}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <Plus size={16} />
                  Create New Profile
                </button>
                
                {profiles.length > 1 && (
                  <button
                    onClick={() => {
                      if (confirm('Clear all profiles and start fresh? This will delete all profile data.')) {
                        clearAllProfiles();
                        setIsOpen(false);
                      }
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 size={16} />
                    Clear All Profiles
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Profile</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this profile? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const profile = profiles.find(p => p.id === showDeleteConfirm);
                  if (profile) {
                    handleDeleteProfile(profile.id, profile.name);
                  }
                }}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </div>
  );
};

export default ProfileSwitcher;

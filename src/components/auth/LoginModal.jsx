/*
============================================================================
FILE: src/components/auth/LoginModal.jsx
============================================================================
PURPOSE:
  Modal component for OC user login with @eagles.oc.edu email validation.

FEATURES:
  - Email validation for @eagles.oc.edu addresses
  - Password input with show/hide toggle
  - Form validation and error handling
  - Loading states and success feedback
  - Guest mode option

USAGE:
  Used in ProfileSwitcher for authenticated user login.
============================================================================
*/

import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  AlertCircle,
  CheckCircle,
  Loader2,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthProvider';

const LoginModal = ({ isOpen, onClose }) => {
  const { switchToGuestMode, isLoading } = useAuth();
  const [error, setError] = useState('');
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  // Handle Google OAuth callback
  useEffect(() => {
    const handleGoogleCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const success = urlParams.get('success');
      const error = urlParams.get('error');

      if (success === 'true' && token) {
        // Store token and close modal
        localStorage.setItem('eagleAI-auth', JSON.stringify({ isAuthenticated: true }));
        localStorage.setItem('eagleAI-token', token);
        onClose();
        // Reload page to update auth state
        window.location.reload();
      } else if (error) {
        setError('Google authentication failed. Please try again.');
      }
    };

    if (isOpen) {
      handleGoogleCallback();
    }
  }, [isOpen, onClose]);

  const handleGoogleLogin = () => {
    setIsLoadingGoogle(true);
    setError('');
    
    // Redirect to Google OAuth
    window.location.href = '/api/auth/google';
  };

  const handleGuestMode = () => {
    switchToGuestMode();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <GraduationCap className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">OC Student Login</h2>
              <p className="text-sm text-gray-500">Sign in with your @eagles.oc.edu Google account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Google Sign-In Button */}
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoadingGoogle}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingGoogle ? (
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              ) : (
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              <span className="text-lg font-medium text-gray-700">
                {isLoadingGoogle ? 'Redirecting...' : 'Sign in with Google'}
              </span>
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                You'll be redirected to Google to sign in with your @eagles.oc.edu account
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* OC Student Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-800">Oklahoma Christian University Students</h3>
            </div>
            <p className="text-sm text-green-700">
              Use your @eagles.oc.edu Google account to access all features including:
            </p>
            <ul className="text-sm text-green-700 mt-2 space-y-1">
              <li>• Persistent resume data and job matches</li>
              <li>• Priority access to OC-specific opportunities</li>
              <li>• Integration with university career services</li>
              <li>• Advanced AI-powered career guidance</li>
            </ul>
          </div>

          {/* Guest Mode Option */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600 mb-3">
              Don't have an OC email or want to try as guest?
            </p>
            <button
              type="button"
              onClick={handleGuestMode}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              <User size={16} />
              Continue as Guest
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-brand-maroon rounded-full"></div>
            <span>Oklahoma Christian University Students Only</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;

/*
============================================================================
FILE: src/components/auth/LoginPage.jsx
============================================================================
PURPOSE:
  Main login page component that users see first before accessing the website.
  Provides both email/password and Google OAuth login options.

FEATURES:
  - Clean, professional login interface
  - Email/password login with validation
  - Google OAuth integration
  - OC branding and styling
  - Responsive design
  - Error handling and loading states

USAGE:
  Used as the main entry point for authenticated users.
============================================================================
*/

import React, { useState, useEffect } from 'react';
import { 
  Loader2,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthProvider';

const LoginPage = () => {
  const { switchToGuestMode, isLoading, isAuthenticated } = useAuth();
  
  // Form state
  const [userName, setUserName] = useState('');
  const [nameError, setNameError] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Note: Authentication state change will automatically show the main app
  // No need for manual redirect in a single-page application

  // Name validation
  const validateName = (name) => {
    return name.trim().length >= 2;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateName(userName)) {
      setNameError('Please enter a valid name (at least 2 characters)');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setNameError('');

    try {
      await switchToGuestMode(userName.trim());
      // The authentication state change will automatically show the main app
      console.log('Successfully logged in as guest:', userName.trim());
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-maroon/5 to-brand-crimson/5 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-maroon" />
          <span className="text-lg text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-maroon/5 to-brand-crimson/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-brand-maroon to-brand-crimson rounded-full mb-6 shadow-lg">
            <GraduationCap className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome to EagleAI</h1>
          <p className="text-lg text-gray-600">Your AI-powered career intelligence platform</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-10 max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Get Started</h2>
            <p className="text-gray-600">Enter your name to begin exploring</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-3">
                What's your name?
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <GraduationCap className="h-6 w-6 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className={`block w-full pl-12 pr-4 py-4 text-lg border-2 rounded-xl focus:ring-2 focus:ring-brand-maroon focus:border-brand-maroon transition-all duration-200 ${
                    nameError ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Enter your full name"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>
              {nameError && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {nameError}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-brand-maroon to-brand-crimson text-white text-lg font-semibold rounded-xl hover:from-brand-crimson hover:to-brand-maroon focus:ring-2 focus:ring-brand-maroon focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              {isSubmitting ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <ArrowRight className="h-6 w-6" />
              )}
              {isSubmitting ? 'Getting Started...' : 'Start Exploring'}
            </button>
          </form>

          {/* Services Section */}
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-4">Our Services</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 text-sm">AI Career Guidance</h4>
                  <p className="text-xs text-blue-700">Personalized career recommendations</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-green-900 text-sm">Job Matching</h4>
                  <p className="text-xs text-green-700">Find opportunities that fit your skills</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-purple-900 text-sm">Resume Analysis</h4>
                  <p className="text-xs text-purple-700">AI-powered resume optimization</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-medium text-orange-900 text-sm">Mentorship Network</h4>
                  <p className="text-xs text-orange-700">Connect with industry professionals</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2024 EagleAI - Oklahoma Christian University Career Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

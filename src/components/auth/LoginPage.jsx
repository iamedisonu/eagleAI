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
  ArrowRight,
  Brain,
  Briefcase,
  Users
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-maroon/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-crimson/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-gold/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-maroon to-brand-crimson rounded-full blur-lg opacity-75 animate-pulse"></div>
            <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-brand-maroon to-brand-crimson rounded-full shadow-2xl">
              <GraduationCap className="text-white" size={48} />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            EagleAI
          </h1>
          <p className="text-xl text-gray-300 mb-2">Your AI-Powered Career Intelligence Platform</p>
          <p className="text-gray-400">Discover, Learn, and Excel in Your Career Journey</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-3">Welcome Aboard!</h2>
            <p className="text-gray-300 text-lg">Let's start your career journey together</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            {/* Name Field */}
            <div>
              <label htmlFor="userName" className="block text-lg font-medium text-white mb-4">
                What should we call you?
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <GraduationCap className="h-7 w-7 text-gray-400 group-focus-within:text-brand-maroon transition-colors duration-200" />
                </div>
                <input
                  type="text"
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className={`block w-full pl-14 pr-6 py-5 text-lg bg-white/10 border-2 rounded-2xl text-white placeholder-gray-400 focus:ring-4 focus:ring-brand-maroon/50 focus:border-brand-maroon transition-all duration-300 backdrop-blur-sm ${
                    nameError ? 'border-red-400 bg-red-500/10' : 'border-white/30 hover:border-white/50'
                  }`}
                  placeholder="Enter your full name"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>
              {nameError && (
                <p className="mt-3 text-sm text-red-300 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {nameError}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-5 bg-red-500/20 border border-red-400/30 rounded-2xl backdrop-blur-sm">
                <AlertCircle className="h-6 w-6 text-red-300 flex-shrink-0" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-brand-maroon to-brand-crimson text-white text-xl font-bold py-5 px-8 rounded-2xl hover:from-brand-crimson hover:to-brand-maroon focus:ring-4 focus:ring-brand-maroon/50 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-brand-maroon/25 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center gap-3">
                {isSubmitting ? (
                  <Loader2 className="h-7 w-7 animate-spin" />
                ) : (
                  <ArrowRight className="h-7 w-7 group-hover:translate-x-1 transition-transform duration-200" />
                )}
                <span>{isSubmitting ? 'Getting Started...' : 'Start Your Journey'}</span>
              </div>
            </button>
          </form>

          {/* Features Preview */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Brain className="h-6 w-6 text-blue-300" />
              </div>
              <h4 className="text-white font-semibold mb-1">AI Career Guidance</h4>
              <p className="text-gray-400 text-sm">Personalized insights and recommendations</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Briefcase className="h-6 w-6 text-green-300" />
              </div>
              <h4 className="text-white font-semibold mb-1">Job Matching</h4>
              <p className="text-gray-400 text-sm">Find opportunities that fit your skills</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-purple-300" />
              </div>
              <h4 className="text-white font-semibold mb-1">Mentorship</h4>
              <p className="text-gray-400 text-sm">Connect with industry professionals</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-400 text-sm">
            © 2024 EagleAI - Oklahoma Christian University Career Platform
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Empowering students with data-driven career insights
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

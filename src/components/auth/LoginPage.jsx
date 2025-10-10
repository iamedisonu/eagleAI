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
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          
          {/* Left Services Cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-brand-maroon/20 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-brand-maroon rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-maroon">AI Career Guidance</h3>
                  <p className="text-sm text-gray-600">Personalized recommendations</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Get AI-powered career insights tailored to your skills, interests, and goals. 
                Discover the perfect career path for your future at OC.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-brand-maroon/20 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-brand-crimson rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-maroon">Job Matching</h3>
                  <p className="text-sm text-gray-600">Find your perfect role</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Our advanced algorithm matches you with job opportunities that align with 
                your skills, experience, and career aspirations.
              </p>
            </div>
          </div>

          {/* Center Login Form */}
          <div className="lg:col-span-1">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-maroon rounded-full mb-6">
                <GraduationCap className="text-white" size={40} />
              </div>
              <h1 className="text-4xl font-bold text-brand-maroon mb-3">EagleAI</h1>
              <p className="text-lg text-brand-maroon font-semibold mb-2">Oklahoma Christian University</p>
              <p className="text-gray-700">Your AI-powered career intelligence platform</p>
            </div>

            {/* Login Form */}
            <div className="bg-white rounded-2xl shadow-lg border border-brand-maroon/20 p-10">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-brand-maroon mb-2">Get Started</h2>
                <p className="text-gray-700">Enter your name to begin exploring</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label htmlFor="userName" className="block text-sm font-semibold text-brand-maroon mb-3">
                    What's your name?
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <GraduationCap className="h-6 w-6 text-brand-maroon" />
                    </div>
                    <input
                      type="text"
                      id="userName"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className={`block w-full pl-12 pr-4 py-4 text-lg border-2 rounded-xl focus:ring-2 focus:ring-brand-maroon/30 focus:border-brand-maroon transition-all duration-200 ${
                        nameError ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-brand-maroon/50'
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
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-brand-maroon text-white text-lg font-semibold rounded-xl hover:bg-brand-crimson focus:ring-2 focus:ring-brand-maroon focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <ArrowRight className="h-6 w-6" />
                  )}
                  {isSubmitting ? 'Getting Started...' : 'Start Your Journey'}
                </button>
              </form>
            </div>

            {/* Footer */}
            <div className="text-center mt-8">
              <p className="text-sm text-brand-maroon">
                © 2024 EagleAI - Oklahoma Christian University Career Platform
              </p>
            </div>
          </div>

          {/* Right Services Cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-brand-maroon/20 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-brand-crimson rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-maroon">Resume Analysis</h3>
                  <p className="text-sm text-gray-600">AI-powered optimization</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Upload your resume and get instant AI feedback on how to improve it. 
                Optimize for ATS systems and stand out to recruiters.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-brand-maroon/20 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-brand-maroon rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-maroon">Mentorship Network</h3>
                  <p className="text-sm text-gray-600">Connect with professionals</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Join our network of OC alumni and industry professionals. Get personalized 
                mentorship and career guidance from experienced Eagles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

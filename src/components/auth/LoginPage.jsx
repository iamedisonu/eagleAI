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
    <div className="min-h-screen bg-gradient-to-br from-brand-maroon/10 via-brand-crimson/5 to-accent-gold/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* OC Brand Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-brand-maroon/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-brand-crimson/20 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-accent-gold/30 rounded-full blur-xl"></div>
        <div className="absolute top-1/3 right-1/4 w-28 h-28 bg-brand-maroon/15 rounded-full blur-2xl"></div>
      </div>

      <div className="w-full max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          
          {/* Left Services Cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-brand-maroon/20 p-6 hover:shadow-brand-maroon/25 hover:border-brand-maroon/40 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-brand-maroon to-brand-crimson rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-maroon">AI Career Guidance</h3>
                  <p className="text-sm text-brand-crimson font-medium">Personalized recommendations</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Get AI-powered career insights tailored to your skills, interests, and goals. 
                Discover the perfect career path for your future at OC.
              </p>
              <div className="mt-4 h-1 bg-gradient-to-r from-brand-maroon to-brand-crimson rounded-full"></div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-accent-gold/30 p-6 hover:shadow-accent-gold/25 hover:border-accent-gold/50 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-accent-gold to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-maroon">Job Matching</h3>
                  <p className="text-sm text-accent-gold font-medium">Find your perfect role</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Our advanced algorithm matches you with job opportunities that align with 
                your skills, experience, and career aspirations.
              </p>
              <div className="mt-4 h-1 bg-gradient-to-r from-accent-gold to-yellow-500 rounded-full"></div>
            </div>
          </div>

          {/* Center Login Form */}
          <div className="lg:col-span-1">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-maroon to-brand-crimson rounded-full blur-lg opacity-60"></div>
                <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-brand-maroon to-brand-crimson rounded-full shadow-2xl">
                  <GraduationCap className="text-white" size={48} />
                </div>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-brand-maroon to-brand-crimson bg-clip-text text-transparent mb-3">
                EagleAI
              </h1>
              <p className="text-xl text-brand-maroon font-semibold mb-2">Oklahoma Christian University</p>
              <p className="text-lg text-gray-700">Your AI-powered career intelligence platform</p>
            </div>

            {/* Login Form */}
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-brand-maroon/20 p-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-maroon via-brand-crimson to-accent-gold"></div>
              
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-brand-maroon mb-2">Get Started</h2>
                <p className="text-gray-700 font-medium">Enter your name to begin exploring</p>
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
                      className={`block w-full pl-12 pr-4 py-4 text-lg border-2 rounded-xl focus:ring-4 focus:ring-brand-maroon/30 focus:border-brand-maroon transition-all duration-200 ${
                        nameError ? 'border-red-400 bg-red-50' : 'border-brand-maroon/30 hover:border-brand-maroon/50'
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
                  <div className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                )}

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full group relative overflow-hidden bg-gradient-to-r from-brand-maroon to-brand-crimson text-white text-xl font-bold py-5 px-8 rounded-2xl hover:from-brand-crimson hover:to-brand-maroon focus:ring-4 focus:ring-brand-maroon/50 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-brand-maroon/25 transform hover:scale-[1.02] active:scale-[0.98]"
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
            </div>

            {/* Footer */}
            <div className="text-center mt-8">
              <p className="text-sm text-brand-maroon font-medium">
                © 2024 EagleAI - Oklahoma Christian University Career Platform
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Empowering OC students with data-driven career insights
              </p>
            </div>
          </div>

          {/* Right Services Cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-brand-crimson/20 p-6 hover:shadow-brand-crimson/25 hover:border-brand-crimson/40 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-brand-crimson to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-maroon">Resume Analysis</h3>
                  <p className="text-sm text-brand-crimson font-medium">AI-powered optimization</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Upload your resume and get instant AI feedback on how to improve it. 
                Optimize for ATS systems and stand out to recruiters.
              </p>
              <div className="mt-4 h-1 bg-gradient-to-r from-brand-crimson to-pink-600 rounded-full"></div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-brand-maroon/20 p-6 hover:shadow-brand-maroon/25 hover:border-brand-maroon/40 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-brand-maroon to-red-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-maroon">Mentorship Network</h3>
                  <p className="text-sm text-brand-crimson font-medium">Connect with professionals</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Join our network of OC alumni and industry professionals. Get personalized 
                mentorship and career guidance from experienced Eagles.
              </p>
              <div className="mt-4 h-1 bg-gradient-to-r from-brand-maroon to-red-700 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

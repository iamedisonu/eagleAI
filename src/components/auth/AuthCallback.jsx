/*
============================================================================
FILE: src/components/auth/AuthCallback.jsx
============================================================================
PURPOSE:
  Handles OAuth callback from Google authentication. Processes the token
  and user data from the URL parameters and completes the login process.

FEATURES:
  - Processes Google OAuth callback
  - Handles success and error states
  - Redirects to dashboard on success
  - Shows loading and error states
  - Validates token and user data

USAGE:
  Used as a callback page for Google OAuth authentication.
============================================================================
*/

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { Loader2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

const AuthCallback = () => {
  const { handleGoogleCallback } = useAuth();
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const success = urlParams.get('success');
        const error = urlParams.get('error');
        const email = urlParams.get('email');
        const name = urlParams.get('name');

        // Check for error
        if (error) {
          setStatus('error');
          setMessage('Authentication failed. Please try again.');
          return;
        }

        // Check for success and token
        if (success === 'true' && token) {
          setMessage('Completing login...');
          
          // Process the callback
          const result = await handleGoogleCallback(token);
          
          if (result.success) {
            setStatus('success');
            setMessage('Login successful! Redirecting to dashboard...');
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 2000);
          } else {
            setStatus('error');
            setMessage('Login failed. Please try again.');
          }
        } else {
          setStatus('error');
          setMessage('Invalid authentication response. Please try again.');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('An error occurred during authentication. Please try again.');
      }
    };

    processCallback();
  }, [handleGoogleCallback]);

  const handleRetry = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-maroon/5 to-brand-crimson/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          {status === 'processing' && (
            <>
              <div className="flex justify-center mb-6">
                <Loader2 className="h-12 w-12 animate-spin text-brand-maroon" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Processing Authentication</h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 p-4 rounded-full">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Successful!</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <ArrowRight className="h-4 w-4 animate-pulse" />
                <span>Redirecting to dashboard...</span>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="bg-red-100 p-4 rounded-full">
                  <AlertCircle className="h-12 w-12 text-red-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Failed</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-6 py-3 bg-brand-maroon text-white rounded-lg hover:bg-brand-crimson transition-colors duration-200 mx-auto"
              >
                <ArrowRight className="h-5 w-5" />
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;

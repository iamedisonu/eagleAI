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

import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  X, 
  User, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthProvider';

const LoginModal = ({ isOpen, onClose }) => {
  const { login, switchToGuestMode, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        onClose();
        setFormData({ email: '', password: '' });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestMode = () => {
    switchToGuestMode();
    onClose();
  };

  const isValidEmail = formData.email && formData.email.toLowerCase().endsWith('@eagles.oc.edu');
  const isFormValid = isValidEmail && formData.password.length >= 6;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-maroon rounded-full flex items-center justify-center">
              <User className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">OC Student Login</h2>
              <p className="text-sm text-gray-500">Sign in with your @eagles.oc.edu email</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.name@eagles.oc.edu"
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-brand-maroon focus:border-brand-maroon transition-colors duration-200 ${
                  formData.email && !isValidEmail
                    ? 'border-red-300 bg-red-50'
                    : formData.email && isValidEmail
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300'
                }`}
                required
              />
              {formData.email && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {isValidEmail ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {formData.email && !isValidEmail && (
              <p className="mt-1 text-sm text-red-600">
                Please use your @eagles.oc.edu email address
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-maroon focus:border-brand-maroon transition-colors duration-200"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Minimum 6 characters
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
              isFormValid && !isSubmitting
                ? 'bg-brand-maroon text-white hover:bg-brand-crimson'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>

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
        </form>

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

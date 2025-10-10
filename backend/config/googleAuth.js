/*
============================================================================
FILE: backend/config/googleAuth.js
============================================================================
PURPOSE:
  Google OAuth configuration for OC student authentication.
  Handles Google OAuth setup and email validation for @eagles.oc.edu.

FEATURES:
  - Google OAuth 2.0 configuration
  - @eagles.oc.edu email validation
  - Passport.js integration
  - Session management

USAGE:
  Used by backend server for Google OAuth authentication.
============================================================================
*/

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import Student from '../models/Student.js';
import logger from '../utils/logger.js';

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your-google-client-id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret';
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback';

// Validate OC email
const isValidOCEmail = (email) => {
  return email && email.toLowerCase().endsWith('@eagles.oc.edu');
};

// Configure Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    
    // Validate OC email
    if (!isValidOCEmail(email)) {
      return done(new Error('Please use your @eagles.oc.edu email address'), null);
    }

    // Find or create student
    let student = await Student.findOne({ email: email.toLowerCase() });
    
    if (!student) {
      // Create new OC student
      student = new Student({
        googleId: profile.id,
        email: email.toLowerCase(),
        name: profile.displayName || profile.name.givenName + ' ' + profile.name.familyName,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        profilePicture: profile.photos[0]?.value,
        institution: 'Oklahoma Christian University',
        role: 'student',
        isOCStudent: true,
        isGoogleAuthenticated: true,
        createdAt: new Date(),
        lastLogin: new Date()
      });
      
      await student.save();
      logger.info(`New OC student registered via Google: ${email}`);
    } else {
      // Update existing student
      student.googleId = profile.id;
      student.name = profile.displayName || profile.name.givenName + ' ' + profile.name.familyName;
      student.firstName = profile.name.givenName;
      student.lastName = profile.name.familyName;
      student.profilePicture = profile.photos[0]?.value;
      student.isGoogleAuthenticated = true;
      student.lastLogin = new Date();
      
      await student.save();
      logger.info(`OC student logged in via Google: ${email}`);
    }

    return done(null, student);
  } catch (error) {
    logger.error('Google OAuth error:', error);
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await Student.findById(id);
    done(null, user);
  } catch (error) {
    logger.error('Deserialize user error:', error);
    done(error, null);
  }
});

export default passport;

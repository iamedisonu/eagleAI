# Google OAuth Setup Guide for EagleAI

This guide will help you set up Google OAuth authentication for OC students using @eagles.oc.edu email addresses.

## Prerequisites

1. A Google Cloud Platform account
2. Access to create OAuth 2.0 credentials
3. Your domain registered with Google (for @eagles.oc.edu)

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google OAuth2 API

## Step 2: Configure OAuth Consent Screen

1. Navigate to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - **App name**: EagleAI Career Platform
   - **User support email**: your-email@eagles.oc.edu
   - **Developer contact**: your-email@eagles.oc.edu
4. Add scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
5. Add test users with @eagles.oc.edu emails

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:3001/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)
5. Copy the Client ID and Client Secret

## Step 4: Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-super-secret-session-key-here

# Other required variables
MONGODB_URI=mongodb://localhost:27017/eagleai
PORT=3001
FRONTEND_URL=http://localhost:3000
```

## Step 5: Domain Verification (For Production)

1. Go to "APIs & Services" > "OAuth consent screen"
2. Add your domain to "Authorized domains"
3. Verify domain ownership through Google Search Console

## Step 6: Test the Integration

1. Start the backend server: `npm run dev`
2. Start the frontend: `npm run dev`
3. Click "Sign in with Google" in the profile dropdown
4. Use an @eagles.oc.edu email address
5. Verify successful authentication

## Security Considerations

1. **HTTPS Required**: Use HTTPS in production
2. **Domain Restrictions**: Restrict to @eagles.oc.edu emails only
3. **Token Security**: Store JWT secrets securely
4. **Session Management**: Implement proper session handling

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch"**: Check that redirect URI matches exactly
2. **"invalid_client"**: Verify Client ID and Secret
3. **"access_denied"**: Check OAuth consent screen configuration
4. **"invalid_grant"**: Ensure domain is verified

### Debug Steps:

1. Check browser console for errors
2. Verify environment variables are loaded
3. Test OAuth flow step by step
4. Check Google Cloud Console logs

## Production Deployment

1. Update redirect URIs for production domain
2. Set `NODE_ENV=production`
3. Use secure JWT and session secrets
4. Enable HTTPS
5. Configure proper CORS settings

## Support

For issues specific to Oklahoma Christian University:
- Contact IT department for domain verification
- Ensure @eagles.oc.edu emails are properly configured
- Verify Google Workspace integration if applicable

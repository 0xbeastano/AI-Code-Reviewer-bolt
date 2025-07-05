# OAuth Authentication Setup Guide

This guide will help you set up OAuth authentication for the AI Code Review application with Email, GitHub, and Google integration using Supabase.

## Prerequisites

- [Supabase](https://supabase.com) account
- [GitHub](https://github.com) account
- [Google Cloud Console](https://console.cloud.google.com) account
- Node.js and npm installed

## 1. Supabase Project Setup

### Create a New Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in your project details:
   - **Name**: AI Code Review
   - **Database Password**: Choose a strong password
   - **Region**: Select the closest region to your users
4. Click "Create new project"
5. Wait for the project to be created (this may take a few minutes)

### Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (VITE_SUPABASE_URL)
   - **Project API Key** (anon public) (VITE_SUPABASE_ANON_KEY)

### Set Up Database Schema

1. In your Supabase project, go to **SQL Editor**
2. Create a new query and paste the contents of `supabase-schema.sql`
3. Run the query to create all necessary tables, policies, and functions

## 2. GitHub OAuth Setup

### Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "OAuth Apps" → "New OAuth App"
3. Fill in the application details:
   - **Application name**: AI Code Review
   - **Homepage URL**: `http://localhost:5173` (for development)
   - **Authorization callback URL**: `http://localhost:5173/auth/callback`
   - **Application description**: AI-powered code review and analysis tool
4. Click "Register application"
5. Copy the **Client ID** and **Client Secret**

### Configure GitHub OAuth in Supabase

1. In your Supabase project, go to **Authentication** → **Providers**
2. Find "GitHub" and click "Configure"
3. Enable the GitHub provider
4. Enter your GitHub OAuth credentials:
   - **Client ID**: Your GitHub Client ID
   - **Client Secret**: Your GitHub Client Secret
5. Set the **Redirect URL** to: `https://your-project-ref.supabase.co/auth/v1/callback`
6. Click "Save"

### GitHub Scopes

The application requests the following GitHub scopes:
- `user:email` - Access user email addresses
- `repo` - Access public and private repositories
- `read:org` - Read organization membership

## 3. Google OAuth Setup

### Create Google OAuth App

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Configure the consent screen if prompted
   - Select "Web application" as the application type
   - Add authorized redirect URIs:
     - `http://localhost:5173/auth/callback` (for development)
     - `https://your-project-ref.supabase.co/auth/v1/callback` (for Supabase)
   - Click "Create"
5. Copy the **Client ID** and **Client Secret**

### Configure Google OAuth in Supabase

1. In your Supabase project, go to **Authentication** → **Providers**
2. Find "Google" and click "Configure"
3. Enable the Google provider
4. Enter your Google OAuth credentials:
   - **Client ID**: Your Google Client ID
   - **Client Secret**: Your Google Client Secret
5. Click "Save"

## 4. Environment Variables Setup

Create a `.env` file in your project root with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# GitHub OAuth
VITE_GITHUB_CLIENT_ID=your-github-client-id
VITE_GITHUB_CLIENT_SECRET=your-github-client-secret

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

**Important**: 
- Replace `your-project-ref` with your actual Supabase project reference
- Replace all placeholder values with your actual credentials
- Never commit the `.env` file to version control
- Add `.env` to your `.gitignore` file

## 5. Authentication Flow

### Sign In/Sign Up Process

1. **Email Authentication**:
   - Users can sign up with email and password
   - Email confirmation is required
   - Password reset functionality is available

2. **GitHub OAuth**:
   - Users authenticate with GitHub
   - Application requests repository access
   - GitHub access token is stored for API calls
   - User profile is created/updated with GitHub data

3. **Google OAuth**:
   - Users authenticate with Google
   - Basic profile information is retrieved
   - User profile is created/updated with Google data

### Repository Import Flow

1. User signs in with GitHub OAuth
2. Application retrieves GitHub access token
3. User can browse their GitHub repositories
4. Selected repositories are imported into the application
5. Repository data is stored in Supabase
6. Code analysis can be performed on imported repositories

## 6. Security Considerations

### Row Level Security (RLS)

The database schema includes RLS policies that ensure:
- Users can only access their own data
- Profiles, repositories, and code reviews are properly isolated
- API access is automatically restricted based on authentication

### Token Management

- GitHub access tokens are encrypted in the database
- OAuth refresh tokens are handled by Supabase
- User sessions are managed securely

### Environment Variables

- Client secrets should never be exposed to the frontend
- Use environment variables for all sensitive configuration
- Implement proper CORS policies for production

## 7. Testing the Integration

### Local Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173/auth`

3. Test each authentication method:
   - Email sign up/sign in
   - GitHub OAuth
   - Google OAuth

### Repository Import Testing

1. Sign in with GitHub OAuth
2. Navigate to `/github/import`
3. Browse your GitHub repositories
4. Import test repositories
5. Verify data appears in Supabase dashboard

## 8. Production Deployment

### Update OAuth Redirect URLs

1. **GitHub OAuth App**:
   - Update Authorization callback URL to your production domain
   - Example: `https://your-domain.com/auth/callback`

2. **Google OAuth App**:
   - Update authorized redirect URIs
   - Example: `https://your-domain.com/auth/callback`

3. **Supabase Auth Settings**:
   - Update site URL in Authentication settings
   - Add your production domain to allowed origins

### Environment Variables

Update your production environment variables:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GITHUB_CLIENT_ID=your-github-client-id
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## 9. Troubleshooting

### Common Issues

1. **OAuth Redirect Mismatch**:
   - Ensure callback URLs match exactly in all services
   - Check for trailing slashes and protocol (http vs https)

2. **Missing Scopes**:
   - Verify GitHub scopes include `repo` for repository access
   - Check Google scopes include email and profile

3. **CORS Issues**:
   - Update Supabase CORS settings
   - Ensure your domain is whitelisted

4. **Database Connection Issues**:
   - Verify database schema is applied correctly
   - Check RLS policies are set up properly

### Debug Mode

Enable debug logging by setting:
```env
VITE_DEBUG=true
```

This will provide detailed logs for authentication and API calls.

## 10. Additional Features

### GitHub Repository Sync

- Automatic repository synchronization
- Webhook support for real-time updates
- Branch and commit tracking

### Advanced Authentication

- Multi-factor authentication
- Social login with additional providers
- Enterprise SSO integration

### Analytics and Monitoring

- User authentication metrics
- Repository usage statistics
- Error tracking and monitoring

## Support

For additional support:
- Check the [Supabase Documentation](https://supabase.com/docs)
- Review [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/oauth-apps)
- Consult [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)

## Security Checklist

- [ ] Environment variables are properly configured
- [ ] OAuth redirect URLs are correct for all environments
- [ ] RLS policies are enabled and tested
- [ ] Client secrets are not exposed to frontend
- [ ] CORS settings are configured properly
- [ ] Database schema is applied correctly
- [ ] OAuth scopes are minimal and appropriate
- [ ] Error handling is implemented for all auth flows
- [ ] User data is properly validated and sanitized
- [ ] Session management is secure and efficient
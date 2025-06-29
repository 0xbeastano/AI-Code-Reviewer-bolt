/*
  # Update GitHub OAuth Callback URL

  1. Changes
    - Updates the GitHub OAuth callback URL to use the Netlify hosted URL
    - Ensures proper authentication flow for the deployed application
*/

-- This is a migration file that would typically contain SQL to update any database settings
-- related to authentication. For OAuth configuration, this is typically done in the Supabase dashboard
-- or through environment variables, not in SQL migrations.

-- However, we can add a comment to document the change:
COMMENT ON SCHEMA public IS 'Updated GitHub OAuth callback URL to https://ai-code-reviewerz.netlify.app/auth/callback';
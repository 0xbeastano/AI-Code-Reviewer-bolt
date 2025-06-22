import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase, authService } from '../lib/auth';
import { useAuth } from '../components/Auth/AuthProvider';
import toast from 'react-hot-toast';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isDemoMode } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check for OAuth callback in demo mode
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      
      if (isDemoMode && code && state) {
        try {
          // Determine provider based on state or other parameters
          const githubState = localStorage.getItem('github_oauth_state');
          const googleState = localStorage.getItem('google_oauth_state');
          
          let result;
          if (state === githubState) {
            result = await authService.handleGitHubCallback(code, state);
          } else if (state === googleState) {
            result = await authService.handleGoogleCallback(code, state);
          } else {
            throw new Error('Invalid OAuth state');
          }
          
          const { user, error } = result;
          
          if (error) {
            toast.error(error);
            navigate('/auth');
            return;
          }

          if (user) {
            const providerName = user.provider === 'github' ? 'GitHub' : 'Google';
            toast.success(`Welcome ${user.name}! ${providerName} account connected successfully.`);
            
            // Redirect to the intended page or dashboard
            const returnTo = sessionStorage.getItem('auth_return_to') || '/';
            sessionStorage.removeItem('auth_return_to');
            navigate(returnTo);
            return;
          }
        } catch (error) {
          console.error('OAuth callback error:', error);
          toast.error('Failed to complete authentication');
          navigate('/auth');
          return;
        }
      }

      // Handle Supabase OAuth callback in production mode
      if (!isDemoMode && supabase) {
        try {
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Auth callback error:', error);
            toast.error('Authentication failed. Please try again.');
            navigate('/auth');
            return;
          }

          if (data.session) {
            toast.success('Successfully signed in!');
            
            // Redirect to the intended page or dashboard
            const returnTo = sessionStorage.getItem('auth_return_to') || '/';
            sessionStorage.removeItem('auth_return_to');
            navigate(returnTo);
          } else {
            navigate('/auth');
          }
        } catch (error) {
          console.error('Unexpected error during auth callback:', error);
          toast.error('An unexpected error occurred');
          navigate('/auth');
        }
        return;
      }

      // Check for error in URL params
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      
      if (error) {
        console.error('OAuth error:', error, errorDescription);
        toast.error(errorDescription || 'Authentication failed');
        navigate('/auth');
        return;
      }

      // If no specific callback handling is needed, redirect to auth
      navigate('/auth');
    };

    handleAuthCallback();
  }, [navigate, searchParams, isDemoMode]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 dark:text-primary-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Completing sign in...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we finish setting up your account.
        </p>
      </div>
    </div>
  );
};
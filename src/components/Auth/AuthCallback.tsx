import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader, CheckCircle, AlertCircle, Github } from 'lucide-react';
import { supabase, auth, profiles } from '../../lib/supabase';
import { log } from '../../utils/logger';
import { githubService, createAuthenticatedGitHubService } from '../../services/githubService';
import toast from 'react-hot-toast';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        log.info('Processing OAuth callback');
        
        // Get the session from the URL
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          log.error('Auth callback error', error);
          setStatus('error');
          setMessage('Authentication failed. Please try again.');
          toast.error('Authentication failed');
          return;
        }

        if (!data.session) {
          log.warn('No session found in callback');
          setStatus('error');
          setMessage('No authentication session found.');
          toast.error('No session found');
          return;
        }

        const { user } = data.session;
        const session = data.session;
        log.info('Authentication successful', { userId: user.id, provider: user.app_metadata.provider });

        // Create or update user profile
        const profile: any = {
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata.full_name || user.user_metadata.name || null,
          avatar_url: user.user_metadata.avatar_url || null,
          provider: user.app_metadata.provider as 'email' | 'github' | 'google',
          github_username: user.user_metadata.user_name || user.user_metadata.preferred_username || null,
          google_id: user.user_metadata.sub || null,
        };

        // Handle GitHub-specific data
        if (user.app_metadata.provider === 'github') {
          profile.github_username = user.user_metadata.user_name || user.user_metadata.preferred_username;
          
          // Store GitHub access token if available
          if (session.provider_token) {
            profile.github_access_token = session.provider_token;
            
            // Initialize GitHub service with the token
            const githubServiceInstance = createAuthenticatedGitHubService(session.provider_token);
            
            try {
              // Get additional GitHub user info
              const githubUser = await githubServiceInstance.getCurrentUser();
              profile.full_name = profile.full_name || githubUser.name;
              profile.avatar_url = profile.avatar_url || githubUser.avatar_url;
              
              log.info('GitHub user info retrieved', { 
                username: githubUser.login,
                repos: githubUser.public_repos 
              });
            } catch (githubError) {
              log.warn('Failed to fetch GitHub user info', githubError);
              // Don't fail the whole process if GitHub API fails
            }
          }
        }

        // Handle Google-specific data
        if (user.app_metadata.provider === 'google') {
          profile.google_id = user.user_metadata.sub;
          profile.full_name = profile.full_name || user.user_metadata.name;
          profile.avatar_url = profile.avatar_url || user.user_metadata.picture;
        }

        // Save profile to database
        await profiles.upsertProfile(profile);
        log.info('User profile saved', { userId: user.id, provider: profile.provider });

        setStatus('success');
        setMessage('Authentication successful! Redirecting to dashboard...');
        toast.success(`Welcome${profile.full_name ? `, ${profile.full_name}` : ''}!`);

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 2000);

      } catch (error) {
        log.error('Auth callback processing failed', error);
        setStatus('error');
        setMessage('Authentication processing failed. Please try again.');
        toast.error('Authentication failed');
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  const handleRetry = () => {
    navigate('/auth', { replace: true });
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-gray-200 dark:border-gray-700">
          <div className="mb-6">
            {status === 'loading' && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ repeat: Infinity, duration: 1, repeatType: 'reverse' }}
                className="w-16 h-16 mx-auto bg-gradient-ai rounded-full flex items-center justify-center mb-4"
              >
                <Loader className="w-8 h-8 text-white animate-spin" />
              </motion.div>
            )}
            
            {status === 'success' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-4"
              >
                <CheckCircle className="w-8 h-8 text-white" />
              </motion.div>
            )}
            
            {status === 'error' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                className="w-16 h-16 mx-auto bg-red-500 rounded-full flex items-center justify-center mb-4"
              >
                <AlertCircle className="w-8 h-8 text-white" />
              </motion.div>
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {status === 'loading' && 'Authenticating...'}
            {status === 'success' && 'Welcome!'}
            {status === 'error' && 'Authentication Failed'}
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {message}
          </p>

          {status === 'loading' && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3, ease: 'easeInOut' }}
                  className="bg-gradient-ai h-2 rounded-full"
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Setting up your account...
              </p>
            </div>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <button
                onClick={handleGoToDashboard}
                className="w-full bg-gradient-ai text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center"
              >
                Go to Dashboard
              </button>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <button
                onClick={handleRetry}
                className="w-full bg-gradient-ai text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Continue to Dashboard
              </button>
            </motion.div>
          )}

          {/* Security Note */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center justify-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              Your authentication is secure and encrypted
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthCallback;
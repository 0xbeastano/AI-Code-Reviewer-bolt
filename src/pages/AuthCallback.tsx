import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase, isDemoMode } from '../lib/supabase';
import toast from 'react-hot-toast';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        if (isDemoMode()) {
          // In demo mode, simulate successful authentication
          toast.success('Successfully signed in with demo account!');
          const returnTo = sessionStorage.getItem('auth_return_to') || '/dashboard';
          sessionStorage.removeItem('auth_return_to');
          navigate(returnTo);
          return;
        }

        if (!supabase) {
          toast.error('Authentication service not available');
          navigate('/auth');
          return;
        }

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
          const returnTo = sessionStorage.getItem('auth_return_to') || '/dashboard';
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
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

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

export default AuthCallback;
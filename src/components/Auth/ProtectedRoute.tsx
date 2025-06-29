import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log('ProtectedRoute check:', { 
      requireAuth, 
      user: user ? 'Authenticated' : 'Not authenticated', 
      loading,
      path: location.pathname
    });
  }, [requireAuth, user, loading, location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
          </motion.div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    console.log('Access denied: Authentication required. Redirecting to /auth');
    // Save the current location to redirect back after login
    sessionStorage.setItem('auth_return_to', location.pathname);
    // Redirect to auth page
    return <Navigate to="/auth" replace />;
  }

  if (!requireAuth && user) {
    console.log('User already authenticated. Redirecting to dashboard');
    // Redirect authenticated users away from auth pages
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
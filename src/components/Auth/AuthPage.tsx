import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Code2, Shield, Zap, Star, ArrowRight, Mail, Github, Eye, EyeOff, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { ResetPasswordForm } from './ResetPasswordForm';
import { useAuth } from './AuthProvider';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { isDemoMode } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { auth } from '../../lib/supabase';
import { log } from '../../utils/logger';

type AuthMode = 'login' | 'signup' | 'reset';

interface AuthPageProps {
  mode?: 'signin' | 'signup';
  onSuccess?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode = 'signin', onSuccess }) => {
  const [searchParams] = useSearchParams();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(mode);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check if signup parameter is present in URL
    if (searchParams.get('signup') === 'true') {
      setAuthMode('signup');
    }
    
    // If user is already authenticated, redirect to dashboard
    if (user) {
      navigate('/dashboard');
    }
  }, [searchParams, user, navigate]);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced ChatGPT-4 integration for comprehensive code review'
    },
    {
      icon: Shield,
      title: 'Security First',
      description: 'Detect vulnerabilities and security issues automatically'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Get results in under 30 seconds with 99.2% accuracy'
    }
  ];

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (authMode === 'signup' && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle email authentication
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      if (authMode === 'signin') {
        log.info('Attempting email sign in');
        await auth.signIn(email, password);
        toast.success('Successfully signed in!');
      } else {
        log.info('Attempting email sign up');
        await auth.signUp(email, password, {
          email_confirm: true
        });
        toast.success('Please check your email to confirm your account!');
      }
      
      onSuccess?.();
      navigate('/dashboard');
    } catch (error: any) {
      log.error('Email authentication failed', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OAuth authentication
  const handleOAuthSignIn = async (provider: 'github' | 'google') => {
    setIsLoading(true);
    
    try {
      log.info(`Attempting ${provider} OAuth sign in`);
      await auth.signInWithOAuth(provider);
      // Note: OAuth will redirect, so success handling happens in callback
    } catch (error: any) {
      log.error(`${provider} OAuth failed`, error);
      toast.error(`Failed to sign in with ${provider}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-ai rounded-2xl">
              <Code2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {authMode === 'signin' ? 'Welcome Back' : 'Join AI Code Review'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {authMode === 'signin' 
              ? 'Sign in to continue your AI-powered development journey' 
              : 'Get started with intelligent code analysis and reviews'
            }
          </p>
        </motion.div>

        {/* Auth Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700"
        >
          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <motion.button
              onClick={() => handleOAuthSignIn('github')}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Github className="w-5 h-5 mr-3" />
              <span className="text-gray-900 dark:text-white font-medium">
                Continue with GitHub
              </span>
            </motion.button>

            <motion.button
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-gray-900 dark:text-white font-medium">
                Continue with Google
              </span>
            </motion.button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center"
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </motion.p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-4 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center"
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password}
                </motion.p>
              )}
            </div>

            {/* Confirm Password (signup only) */}
            <AnimatePresence>
              {authMode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Confirm your password"
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-ai text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </motion.button>
          </form>

          {/* Toggle Auth Mode */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {authMode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                className="ml-2 text-primary-600 dark:text-primary-400 font-medium hover:underline"
                disabled={isLoading}
              >
                {authMode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Features for Signup */}
          {authMode === 'signup' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                What you'll get:
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  AI-powered code analysis
                </div>
                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  GitHub repository integration
                </div>
                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Real-time collaboration tools
                </div>
                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Advanced security insights
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
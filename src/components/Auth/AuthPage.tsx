import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Code2, Shield, Zap, Star, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { ResetPasswordForm } from './ResetPasswordForm';
import { useAuth } from './AuthProvider';
import { useSearchParams, useNavigate } from 'react-router-dom';

type AuthMode = 'login' | 'signup' | 'reset';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('login');
  const { isDemoMode, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if signup parameter is present in URL
    if (searchParams.get('signup') === 'true') {
      setMode('signup');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-ai" />
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                <Brain className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">AI Code Reviewer</h1>
                <p className="text-blue-100">Powered by ChatGPT-4</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold mb-6 leading-tight">
              Transform Your Code with
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                AI Intelligence
              </span>
            </h2>

            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join thousands of developers using AI to write better, more secure code. 
              Get instant feedback, security analysis, and performance optimizations.
            </p>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  className="flex items-start space-x-4"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-blue-100 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Trusted by developers worldwide</h3>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">50K+</div>
                  <div className="text-xs text-blue-100">Developers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">1M+</div>
                  <div className="text-xs text-blue-100">Code Reviews</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">99.2%</div>
                  <div className="text-xs text-blue-100">Accuracy</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-purple-300/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-blue-300/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Right Side - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Production Mode Notice */}
          {!isDemoMode && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
            >
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200">Production Mode Active</h4>
                  <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                    Connected to Supabase backend. Your data will be securely stored and you can use real OAuth providers.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Demo Mode Notice */}
          {isDemoMode && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
            >
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-200">Demo Mode</h4>
                  <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                    Authentication is running in demo mode. You can sign in with any email/password or use OAuth buttons to explore the app.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {mode === 'login' && (
              <LoginForm
                key="login"
                onSwitchToSignup={() => setMode('signup')}
                onSwitchToReset={() => setMode('reset')}
              />
            )}
            {mode === 'signup' && (
              <SignupForm
                key="signup"
                onSwitchToLogin={() => setMode('login')}
              />
            )}
            {mode === 'reset' && (
              <ResetPasswordForm
                key="reset"
                onSwitchToLogin={() => setMode('login')}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
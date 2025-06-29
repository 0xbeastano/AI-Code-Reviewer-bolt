import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isDemoMode } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  signInWithGitHub: () => Promise<{ error: any; url?: string }>;
  signInWithGoogle: () => Promise<{ error: any; url?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider initialized');
    // If in demo mode or Supabase client not available, set up demo state
    if (isDemoMode() || !supabase) {
      console.log('🔄 Running in demo mode - authentication disabled');
      setUser(null);
      setSession(null);
      setLoading(false);
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          console.log('Session retrieved:', session ? 'Valid session' : 'No session');
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            console.log('User authenticated:', session.user.email);
            console.log('User metadata:', session.user.user_metadata);
            console.log('App metadata:', session.user.app_metadata);
            console.log('Provider token:', session.provider_token ? 'Available' : 'Not available');
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('Sign in attempt for:', email);
    if (isDemoMode() || !supabase) {
      console.log('🔄 Demo mode: Sign in simulated');
      return { error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }
      
      console.log('Sign in successful:', data.user?.email);
      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    console.log('Sign up attempt for:', email);
    if (isDemoMode() || !supabase) {
      console.log('🔄 Demo mode: Sign up simulated');
      return { error: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      
      if (error) {
        console.error('Sign up error:', error);
        
        // Enhanced error handling for database issues
        if (error.message && (
          error.message.includes('Database error saving new user') ||
          error.message.includes('unexpected_failure') ||
          error.status === 500
        )) {
          console.error('Database configuration error detected in AuthProvider');
          return { 
            error: {
              ...error,
              message: 'Database error saving new user',
              isDatabaseError: true
            }
          };
        }
        
        return { error };
      }
      
      console.log('Sign up successful:', data.user?.email);
      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { 
        error: {
          message: 'An unexpected error occurred during signup',
          isDatabaseError: true
        }
      };
    }
  };

  const signOut = async () => {
    console.log('Sign out attempt');
    if (isDemoMode() || !supabase) {
      console.log('🔄 Demo mode: Sign out simulated');
      setUser(null);
      setSession(null);
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      } else {
        console.log('Sign out successful');
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const resetPassword = async (email: string) => {
    console.log('Password reset attempt for:', email);
    if (isDemoMode() || !supabase) {
      console.log('🔄 Demo mode: Password reset simulated');
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) {
        console.error('Reset password error:', error);
        return { error };
      }
      
      console.log('Password reset email sent');
      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error };
    }
  };

  const signInWithGitHub = async () => {
    console.log('GitHub sign in attempt');
    if (isDemoMode() || !supabase) {
      console.log('🔄 Demo mode: GitHub sign in simulated');
      return { error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'repo user:email read:user'
        },
      });
      
      if (error) {
        console.error('GitHub sign in failed:', error);
        toast.error(`GitHub sign in failed: ${error.message}`);
        return { error };
      }
      
      if (data.url) {
        console.log('Redirecting to GitHub OAuth URL:', data.url);
        window.location.href = data.url;
      }
      
      return { url: data.url, error: null };
    } catch (error) {
      console.error('GitHub sign in error:', error);
      toast.error('Failed to sign in with GitHub');
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    console.log('Google sign in attempt');
    if (isDemoMode() || !supabase) {
      console.log('🔄 Demo mode: Google sign in simulated');
      return { error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        console.error('Google sign in failed:', error);
        toast.error(`Google sign in failed: ${error.message}`);
        return { error };
      }
      
      if (data.url) {
        console.log('Redirecting to Google OAuth URL:', data.url);
        window.location.href = data.url;
      }
      
      return { url: data.url, error: null };
    } catch (error) {
      console.error('Google sign in error:', error);
      toast.error('Failed to sign in with Google');
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    signInWithGitHub,
    signInWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
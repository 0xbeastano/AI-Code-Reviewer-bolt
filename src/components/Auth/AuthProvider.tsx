import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isDemoMode } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error?: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: AuthError | null }>;
  signInWithGitHub: () => Promise<{ error?: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error?: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Demo user for when Supabase is not available
const demoUser = {
  id: 'demo-user-id',
  email: 'demo@example.com',
  user_metadata: {
    full_name: 'Demo User',
    avatar_url: 'https://ui-avatars.com/api/?name=Demo+User&background=random',
    role: 'developer'
  },
  app_metadata: {
    provider: 'email'
  },
  created_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  email_confirmed_at: new Date().toISOString()
} as unknown as User;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemoMode()) {
      // Set up demo user
      setUser(demoUser);
      setLoading(false);
      console.log('🔄 Using demo user in demo mode');
      return;
    }

    if (!supabase) {
      console.error('Supabase client not initialized');
      setLoading(false);
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Failed to get initial session:', error);
        }
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (isDemoMode()) {
      // Simulate successful sign-in in demo mode
      setUser(demoUser);
      return { error: undefined };
    }

    if (!supabase) {
      toast.error('Authentication service not available');
      return { error: new AuthError('Supabase client not initialized') };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { error };
      }
      
      return { error: undefined };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: new AuthError('An unexpected error occurred') };
    }
  };

  const signUp = async (email: string, password: string) => {
    if (isDemoMode()) {
      // Simulate successful sign-up in demo mode
      setUser(demoUser);
      return { error: undefined };
    }

    if (!supabase) {
      toast.error('Authentication service not available');
      return { error: new AuthError('Supabase client not initialized') };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        return { error };
      }
      
      return { error: undefined };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: new AuthError('An unexpected error occurred') };
    }
  };

  const signOut = async () => {
    if (isDemoMode()) {
      setUser(null);
      setSession(null);
      return;
    }

    if (!supabase) {
      setUser(null);
      setSession(null);
      return;
    }

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn('Sign out error:', error);
      // Force local logout even if Supabase fails
      setUser(null);
      setSession(null);
    }
  };

  const resetPassword = async (email: string) => {
    if (isDemoMode()) {
      // Simulate successful password reset in demo mode
      return { error: undefined };
    }

    if (!supabase) {
      toast.error('Authentication service not available');
      return { error: new AuthError('Supabase client not initialized') };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) {
        return { error };
      }
      
      return { error: undefined };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: new AuthError('An unexpected error occurred') };
    }
  };

  const signInWithGitHub = async () => {
    if (isDemoMode()) {
      // Simulate successful GitHub sign-in in demo mode
      setUser(demoUser);
      return { error: undefined };
    }

    if (!supabase) {
      toast.error('Authentication service not available');
      return { error: new AuthError('Supabase client not initialized') };
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        return { error };
      }
      
      if (data.url) {
        window.location.href = data.url;
      }
      
      return { error: undefined };
    } catch (error) {
      console.error('GitHub sign in error:', error);
      return { error: new AuthError('An unexpected error occurred') };
    }
  };

  const signInWithGoogle = async () => {
    if (isDemoMode()) {
      // Simulate successful Google sign-in in demo mode
      setUser(demoUser);
      return { error: undefined };
    }

    if (!supabase) {
      toast.error('Authentication service not available');
      return { error: new AuthError('Supabase client not initialized') };
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        return { error };
      }
      
      if (data.url) {
        window.location.href = data.url;
      }
      
      return { error: undefined };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { error: new AuthError('An unexpected error occurred') };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    signInWithGitHub,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
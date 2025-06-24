import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signUp: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: AuthError }>;
  signInWithGitHub: () => Promise<{ error?: AuthError }>;
  signInWithGoogle: () => Promise<{ error?: AuthError }>;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      console.error('Supabase client not initialized');
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.warn('Failed to get initial session:', error);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
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
    if (!supabase) {
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
    if (!supabase) {
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
    if (!supabase) {
      return { error: new AuthError('Supabase client not initialized') };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        return { error };
      }
      
      return { error: undefined };
    } catch (error) {
      console.error('GitHub sign in error:', error);
      return { error: new AuthError('An unexpected error occurred') };
    }
  };

  const signInWithGoogle = async () => {
    if (!supabase) {
      return { error: new AuthError('Supabase client not initialized') };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        return { error };
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
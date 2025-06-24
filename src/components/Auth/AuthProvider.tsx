import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isDemoMode, enableDemoMode } from '../../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDemoMode: boolean;
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
  const [demoMode, setDemoMode] = useState(isDemoMode());

  useEffect(() => {
    // Only set up Supabase auth if not in demo mode
    if (!demoMode && supabase) {
      // Get initial session
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          console.warn('Failed to get initial session:', error);
          // Don't switch to demo mode for session errors
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
    } else {
      // In demo mode, just set loading to false
      setLoading(false);
    }
  }, [demoMode]);

  const handleAuthError = (error: any) => {
    // Check for reCAPTCHA or other configuration errors
    if (error?.message?.includes('captcha') || 
        error?.message?.includes('unexpected_failure') ||
        error?.status === 500) {
      console.warn('Supabase authentication error detected, switching to demo mode:', error);
      enableDemoMode();
      setDemoMode(true);
      return { error: null }; // Return success in demo mode
    }
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    if (demoMode || !supabase) {
      // Demo mode - simulate successful login
      const demoUser = {
        id: 'demo-user-id',
        email,
        user_metadata: { name: email.split('@')[0] },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as User;
      
      setUser(demoUser);
      return { error: undefined };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return handleAuthError(error);
      }
      
      return { error: undefined };
    } catch (error) {
      return handleAuthError(error);
    }
  };

  const signUp = async (email: string, password: string) => {
    if (demoMode || !supabase) {
      // Demo mode - simulate successful signup
      const demoUser = {
        id: 'demo-user-id',
        email,
        user_metadata: { name: email.split('@')[0] },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as User;
      
      setUser(demoUser);
      return { error: undefined };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        return handleAuthError(error);
      }
      
      return { error: undefined };
    } catch (error) {
      return handleAuthError(error);
    }
  };

  const signOut = async () => {
    if (demoMode || !supabase) {
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
    if (demoMode || !supabase) {
      // Demo mode - simulate successful password reset
      return { error: undefined };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) {
        return handleAuthError(error);
      }
      
      return { error: undefined };
    } catch (error) {
      return handleAuthError(error);
    }
  };

  const signInWithGitHub = async () => {
    if (demoMode || !supabase) {
      // Demo mode - simulate successful OAuth login
      const demoUser = {
        id: 'demo-github-user-id',
        email: 'demo@github.com',
        user_metadata: { 
          name: 'Demo GitHub User',
          avatar_url: 'https://github.com/github.png'
        },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as User;
      
      setUser(demoUser);
      return { error: undefined };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        return handleAuthError(error);
      }
      
      return { error: undefined };
    } catch (error) {
      return handleAuthError(error);
    }
  };

  const signInWithGoogle = async () => {
    if (demoMode || !supabase) {
      // Demo mode - simulate successful OAuth login
      const demoUser = {
        id: 'demo-google-user-id',
        email: 'demo@google.com',
        user_metadata: { 
          name: 'Demo Google User',
          avatar_url: 'https://lh3.googleusercontent.com/a/default-user'
        },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as User;
      
      setUser(demoUser);
      return { error: undefined };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        return handleAuthError(error);
      }
      
      return { error: undefined };
    } catch (error) {
      return handleAuthError(error);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    isDemoMode: demoMode,
    signIn,
    signUp,
    signOut,
    resetPassword,
    signInWithGitHub,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, AuthSession, User } from '../../lib/auth';
import { supabase, isDemoMode } from '../../lib/supabase';

interface AuthContextType {
  session: AuthSession | null;
  user: User | null;
  loading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ user: User | null; error: string | null }>;
  signInWithGitHub: () => Promise<{ url?: string; error?: string }>;
  signInWithGoogle: () => Promise<{ url?: string; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      const currentSession = authService.getCurrentSession();
      setSession(currentSession);
      setLoading(false);
    };

    initializeAuth();

    // Listen for auth changes (only if Supabase is configured)
    if (supabase && !isDemoMode) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, supabaseSession) => {
          if (event === 'SIGNED_IN' && supabaseSession) {
            const authSession = await authService.createAuthSession(supabaseSession);
            setSession(authSession);
          } else if (event === 'SIGNED_OUT') {
            setSession(null);
          } else if (event === 'TOKEN_REFRESHED' && supabaseSession) {
            const authSession = await authService.createAuthSession(supabaseSession);
            setSession(authSession);
          }
          setLoading(false);
        }
      );

      return () => subscription.unsubscribe();
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await authService.signInWithEmail(email, password);
    if (result.user) {
      setSession(authService.getCurrentSession());
    }
    return result;
  };

  const signUp = async (email: string, password: string, name: string) => {
    const result = await authService.signUpWithEmail(email, password, name);
    if (result.user) {
      setSession(authService.getCurrentSession());
    }
    return result;
  };

  const signInWithGitHub = async () => {
    const result = await authService.signInWithGitHub();
    if (isDemoMode && !result.error) {
      // In demo mode, update session immediately
      setSession(authService.getCurrentSession());
    }
    return result;
  };

  const signInWithGoogle = async () => {
    const result = await authService.signInWithGoogle();
    if (isDemoMode && !result.error) {
      // In demo mode, update session immediately
      setSession(authService.getCurrentSession());
    }
    return result;
  };

  const signOut = async () => {
    await authService.signOut();
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    return await authService.resetPassword(email);
  };

  const updatePassword = async (newPassword: string) => {
    return await authService.updatePassword(newPassword);
  };

  const refreshSession = async () => {
    const { session: newSession } = await authService.refreshSession();
    setSession(newSession);
  };

  const value: AuthContextType = {
    session,
    user: session?.user || null,
    loading,
    isDemoMode,
    signIn,
    signUp,
    signInWithGitHub,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    refreshSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
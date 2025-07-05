import { createClient, User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase, isDemoMode } from './supabase';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'email' | 'github' | 'google';
  provider_token?: string;
  user_metadata?: any;
  app_metadata?: any;
  emailVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date;
  role?: 'admin' | 'developer' | 'viewer';
  organization?: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export class AuthService {
  private static instance: AuthService;
  private session: AuthSession | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  constructor() {
    this.initializeSession();
  }

  private async initializeSession() {
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        this.session = await this.createAuthSession(session);
      }
    } else if (isDemoMode()) {
      // Create a demo session if in demo mode
      this.createDemoSession();
    }
  }

  private createDemoSession() {
    this.session = {
      user: {
        id: 'demo-user-id',
        email: 'demo@example.com',
        name: 'Demo User',
        avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=random',
        provider: 'email',
        emailVerified: true,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        role: 'developer',
        user_metadata: {
          full_name: 'Demo User',
          avatar_url: 'https://ui-avatars.com/api/?name=Demo+User&background=random'
        },
        app_metadata: {
          provider: 'email'
        }
      },
      accessToken: 'demo-access-token',
      refreshToken: 'demo-refresh-token',
      expiresAt: new Date(Date.now() + 3600 * 1000)
    };
    console.log('🔄 Created demo session');
  }

  async createAuthSession(supabaseSession: Session): Promise<AuthSession> {
    const user = supabaseSession.user;
    return {
      user: {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email || '',
        avatar: user.user_metadata?.avatar_url,
        provider: user.app_metadata?.provider || 'email',
        provider_token: supabaseSession.provider_token,
        user_metadata: user.user_metadata,
        app_metadata: user.app_metadata,
        emailVerified: user.email_confirmed_at !== null,
        createdAt: new Date(user.created_at),
        lastLoginAt: new Date(user.last_sign_in_at || user.created_at),
        role: user.user_metadata?.role || 'developer'
      },
      accessToken: supabaseSession.access_token,
      refreshToken: supabaseSession.refresh_token,
      expiresAt: new Date(Date.now() + (supabaseSession.expires_in || 3600) * 1000)
    };
  }

  // Session Management
  async signOut(): Promise<void> {
    if (isDemoMode()) {
      console.log('🔄 Demo mode: Sign out simulated');
      this.session = null;
      return;
    }

    if (!supabase) {
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
  }

  async refreshSession(): Promise<{ session: AuthSession | null; error: string | null }> {
    if (isDemoMode()) {
      this.createDemoSession();
      return { session: this.session, error: null };
    }

    if (!supabase) {
      return { session: null, error: 'Authentication service not available' };
    }

    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        return { session: null, error: error.message };
      }

      if (data.session) {
        this.session = await this.createAuthSession(data.session);
        return { session: this.session, error: null };
      }

      return { session: null, error: 'No session found' };
    } catch (error) {
      return { session: null, error: 'Failed to refresh session' };
    }
  }

  getCurrentSession(): AuthSession | null {
    return this.session;
  }

  getCurrentUser(): User | null {
    return this.session?.user || null;
  }

  isAuthenticated(): boolean {
    return this.session !== null && new Date() < this.session.expiresAt;
  }

  // Demo mode check
  isDemoMode(): boolean {
    return isDemoMode();
  }

  // Authentication methods
  async signIn(email: string, password: string): Promise<{ error?: any }> {
    if (isDemoMode()) {
      // Simulate successful sign-in in demo mode
      this.createDemoSession();
      return { error: undefined };
    }

    if (!supabase) {
      return { error: { message: 'Authentication service not available' } };
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
      return { error: { message: 'An unexpected error occurred' } };
    }
  }

  async signUp(email: string, password: string): Promise<{ error?: any }> {
    if (isDemoMode()) {
      // Simulate successful sign-up in demo mode
      this.createDemoSession();
      return { error: undefined };
    }

    if (!supabase) {
      return { error: { message: 'Authentication service not available' } };
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
        return { error };
      }
      
      return { error: undefined };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: { message: 'An unexpected error occurred' } };
    }
  }

  async resetPassword(email: string): Promise<{ error?: any }> {
    if (isDemoMode()) {
      // Simulate successful password reset in demo mode
      return { error: undefined };
    }

    if (!supabase) {
      return { error: { message: 'Authentication service not available' } };
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
      return { error: { message: 'An unexpected error occurred' } };
    }
  }
}

export const authService = AuthService.getInstance();
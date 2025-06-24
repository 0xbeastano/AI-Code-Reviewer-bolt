import { createClient, User as SupabaseUser, Session } from '@supabase/supabase-js';
import { Octokit } from '@octokit/rest';
import { supabase, isDemoMode } from './supabase';

// GitHub OAuth configuration
export const githubOAuthConfig = {
  clientId: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
  redirectUri: `${import.meta.env.VITE_APP_URL || window.location.origin}/auth/callback`,
  scopes: ['repo', 'user:email', 'read:user']
};

// Google OAuth configuration
export const googleOAuthConfig = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  redirectUri: `${import.meta.env.VITE_APP_URL || window.location.origin}/auth/callback`,
  scopes: ['openid', 'email', 'profile']
};

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'email' | 'github' | 'google';
  githubToken?: string;
  githubUsername?: string;
  googleId?: string;
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
        role: 'developer'
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
        name: user.user_metadata?.full_name || user.email || '',
        avatar: user.user_metadata?.avatar_url,
        provider: user.app_metadata?.provider || 'email',
        githubToken: user.user_metadata?.provider_token,
        githubUsername: user.user_metadata?.user_name,
        googleId: user.user_metadata?.sub,
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
    if (supabase) {
      await supabase.auth.signOut();
    }
    this.session = null;
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

  // GitHub Integration
  async getGitHubRepositories(): Promise<{ repositories: any[]; error: string | null }> {
    if (isDemoMode()) {
      // Return mock repositories in demo mode
      return {
        repositories: [
          {
            id: 1,
            name: 'demo-repo-1',
            full_name: 'demo-user/demo-repo-1',
            description: 'A demo repository for testing',
            private: false,
            language: 'JavaScript',
            stargazers_count: 5,
            updated_at: new Date().toISOString(),
            html_url: 'https://github.com/demo-user/demo-repo-1'
          },
          {
            id: 2,
            name: 'demo-repo-2',
            full_name: 'demo-user/demo-repo-2',
            description: 'Another demo repository',
            private: true,
            language: 'TypeScript',
            stargazers_count: 10,
            updated_at: new Date().toISOString(),
            html_url: 'https://github.com/demo-user/demo-repo-2'
          }
        ],
        error: null
      };
    }

    if (!this.session?.user.githubToken) {
      return { repositories: [], error: 'GitHub token not available. Please reconnect your GitHub account.' };
    }

    try {
      const octokit = new Octokit({
        auth: this.session.user.githubToken
      });

      const { data } = await octokit.rest.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 100
      });

      return { repositories: data, error: null };
    } catch (error) {
      return { repositories: [], error: 'Failed to fetch GitHub repositories.' };
    }
  }

  async getRepositoryContent(owner: string, repo: string, path: string = ''): Promise<{ content: any; error: string | null }> {
    if (isDemoMode()) {
      // Return mock content in demo mode
      return {
        content: {
          type: 'file',
          content: 'console.log("Hello, World!");',
          name: 'index.js'
        },
        error: null
      };
    }

    if (!this.session?.user.githubToken) {
      return { content: null, error: 'GitHub token not available.' };
    }

    try {
      const octokit = new Octokit({
        auth: this.session.user.githubToken
      });

      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path
      });

      return { content: data, error: null };
    } catch (error) {
      return { content: null, error: 'Failed to fetch repository content.' };
    }
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

  async signInWithGitHub(): Promise<{ error?: any; url?: string }> {
    if (isDemoMode()) {
      // Simulate successful GitHub sign-in in demo mode
      this.createDemoSession();
      return { error: undefined };
    }

    if (!supabase) {
      return { error: { message: 'Authentication service not available' } };
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
      
      return { url: data.url, error: undefined };
    } catch (error) {
      console.error('GitHub sign in error:', error);
      return { error: { message: 'An unexpected error occurred' } };
    }
  }

  async signInWithGoogle(): Promise<{ error?: any; url?: string }> {
    if (isDemoMode()) {
      // Simulate successful Google sign-in in demo mode
      this.createDemoSession();
      return { error: undefined };
    }

    if (!supabase) {
      return { error: { message: 'Authentication service not available' } };
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
      
      return { url: data.url, error: undefined };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { error: { message: 'An unexpected error occurred' } };
    }
  }

  // Callback handlers
  async handleGitHubCallback(code: string, state: string): Promise<{ error?: any }> {
    if (isDemoMode()) {
      // Simulate successful callback in demo mode
      this.createDemoSession();
      return { error: undefined };
    }

    // In a real implementation, this would validate the state and exchange the code for a token
    return { error: { message: 'Direct OAuth flow not implemented' } };
  }

  async handleGoogleCallback(code: string, state: string): Promise<{ error?: any }> {
    if (isDemoMode()) {
      // Simulate successful callback in demo mode
      this.createDemoSession();
      return { error: undefined };
    }

    // In a real implementation, this would validate the state and exchange the code for a token
    return { error: { message: 'Direct OAuth flow not implemented' } };
  }
}

export const authService = AuthService.getInstance();
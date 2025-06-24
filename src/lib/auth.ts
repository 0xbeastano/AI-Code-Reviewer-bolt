import { createClient, User as SupabaseUser, Session } from '@supabase/supabase-js';
import { Octokit } from '@octokit/rest';
import { supabase } from './supabase';

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
    }
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
    if (!supabase) {
      return { session: null, error: 'Authentication service not configured' };
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

  // GitHub Integration
  async getGitHubRepositories(): Promise<{ repositories: any[]; error: string | null }> {
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
}

export const authService = AuthService.getInstance();
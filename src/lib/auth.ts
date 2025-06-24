import { createClient, User as SupabaseUser, Session } from '@supabase/supabase-js';
import { Octokit } from '@octokit/rest';
import { createOAuthAppAuth } from '@octokit/auth-oauth-app';
import { supabase, isDemoMode } from './supabase';

// GitHub OAuth configuration
export const githubOAuthConfig = {
  clientId: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
  clientSecret: import.meta.env.VITE_GITHUB_CLIENT_SECRET || '',
  redirectUri: `${window.location.origin}/auth/callback`,
  scopes: ['repo', 'user:email', 'read:user']
};

// Google OAuth configuration
export const googleOAuthConfig = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
  redirectUri: `${window.location.origin}/auth/callback`,
  scopes: ['openid', 'email', 'profile']
};

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'email' | 'github' | 'google' | 'demo';
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
    
    // Log configuration status
    if (isDemoMode) {
      console.log('🔗 GitHub OAuth configured:', !!githubOAuthConfig.clientId);
      console.log('🔗 Google OAuth configured:', !!googleOAuthConfig.clientId);
    }
  }

  private async initializeSession() {
    if (isDemoMode) {
      // In demo mode, check localStorage for demo session
      const demoSession = localStorage.getItem('demo_session');
      if (demoSession) {
        try {
          this.session = JSON.parse(demoSession);
        } catch (error) {
          localStorage.removeItem('demo_session');
        }
      }
      return;
    }

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

  private createDemoSession(email: string, name: string, provider: 'email' | 'github' | 'google' = 'email', additionalData?: any): AuthSession {
    const session: AuthSession = {
      user: {
        id: `demo-${Date.now()}`,
        email,
        name,
        provider,
        emailVerified: true,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        role: 'developer',
        ...additionalData
      },
      accessToken: `demo-token-${Date.now()}`,
      refreshToken: `demo-refresh-${Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    localStorage.setItem('demo_session', JSON.stringify(session));
    return session;
  }

  // Email/Password Authentication
  async signUpWithEmail(email: string, password: string, name: string): Promise<{ user: User | null; error: string | null }> {
    if (isDemoMode) {
      // Demo mode - simulate successful signup
      this.session = this.createDemoSession(email, name, 'email');
      return { user: this.session.user, error: null };
    }

    if (!supabase) {
      return { user: null, error: 'Authentication service not configured' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user && !data.user.email_confirmed_at) {
        return { 
          user: null, 
          error: 'Please check your email and click the verification link to complete registration.' 
        };
      }

      if (data.session) {
        this.session = await this.createAuthSession(data.session);
        return { user: this.session.user, error: null };
      }

      return { user: null, error: 'No session created' };
    } catch (error) {
      return { user: null, error: 'An unexpected error occurred during signup.' };
    }
  }

  async signInWithEmail(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    if (isDemoMode) {
      // Demo mode - simulate successful signin
      this.session = this.createDemoSession(email, email.split('@')[0], 'email');
      return { user: this.session.user, error: null };
    }

    if (!supabase) {
      return { user: null, error: 'Authentication service not configured' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { user: null, error: error.message };
      }

      this.session = await this.createAuthSession(data.session);
      return { user: this.session.user, error: null };
    } catch (error) {
      return { user: null, error: 'An unexpected error occurred during signin.' };
    }
  }

  // GitHub OAuth Authentication
  async signInWithGitHub(): Promise<{ url?: string; error?: string }> {
    if (isDemoMode) {
      // In demo mode, use GitHub OAuth directly
      if (!githubOAuthConfig.clientId) {
        return { error: 'GitHub OAuth not configured' };
      }

      const state = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('github_oauth_state', state);
      
      const params = new URLSearchParams({
        client_id: githubOAuthConfig.clientId,
        redirect_uri: githubOAuthConfig.redirectUri,
        scope: githubOAuthConfig.scopes.join(' '),
        state: state,
        allow_signup: 'true'
      });

      const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
      return { url: authUrl };
    }

    if (!supabase) {
      return { error: 'Authentication service not configured' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          scopes: githubOAuthConfig.scopes.join(' '),
          redirectTo: githubOAuthConfig.redirectUri
        }
      });

      if (error) {
        return { error: error.message };
      }

      return { url: data.url };
    } catch (error) {
      return { error: 'Failed to initiate GitHub authentication.' };
    }
  }

  // Google OAuth Authentication
  async signInWithGoogle(): Promise<{ url?: string; error?: string }> {
    if (isDemoMode) {
      // In demo mode, use Google OAuth directly
      if (!googleOAuthConfig.clientId) {
        return { error: 'Google OAuth not configured' };
      }

      const state = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('google_oauth_state', state);
      
      const params = new URLSearchParams({
        client_id: googleOAuthConfig.clientId,
        redirect_uri: googleOAuthConfig.redirectUri,
        scope: googleOAuthConfig.scopes.join(' '),
        state: state,
        response_type: 'code',
        access_type: 'offline',
        prompt: 'consent'
      });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      return { url: authUrl };
    }

    if (!supabase) {
      return { error: 'Authentication service not configured' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: googleOAuthConfig.scopes.join(' '),
          redirectTo: googleOAuthConfig.redirectUri
        }
      });

      if (error) {
        return { error: error.message };
      }

      return { url: data.url };
    } catch (error) {
      return { error: 'Failed to initiate Google authentication.' };
    }
  }

  // Handle GitHub OAuth callback (for demo mode)
  async handleGitHubCallback(code: string, state: string): Promise<{ user: User | null; error: string | null }> {
    if (!isDemoMode) {
      return { user: null, error: 'OAuth callback should be handled by Supabase in production mode' };
    }

    const savedState = localStorage.getItem('github_oauth_state');
    if (state !== savedState) {
      return { user: null, error: 'Invalid OAuth state parameter' };
    }

    localStorage.removeItem('github_oauth_state');

    try {
      // Exchange code for access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: githubOAuthConfig.clientId,
          client_secret: githubOAuthConfig.clientSecret,
          code: code,
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        return { user: null, error: tokenData.error_description || 'Failed to exchange code for token' };
      }

      // Get user info from GitHub
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      const userData = await userResponse.json();

      // Get user email
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      const emailData = await emailResponse.json();
      const primaryEmail = emailData.find((email: any) => email.primary)?.email || userData.email;

      // Create session with GitHub data
      this.session = {
        user: {
          id: `github-${userData.id}`,
          email: primaryEmail,
          name: userData.name || userData.login,
          avatar: userData.avatar_url,
          provider: 'github',
          githubToken: tokenData.access_token,
          githubUsername: userData.login,
          emailVerified: true,
          createdAt: new Date(),
          lastLoginAt: new Date(),
          role: 'developer'
        },
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || '',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };

      localStorage.setItem('demo_session', JSON.stringify(this.session));
      return { user: this.session.user, error: null };

    } catch (error) {
      return { user: null, error: 'Failed to complete GitHub authentication' };
    }
  }

  // Handle Google OAuth callback (for demo mode)
  async handleGoogleCallback(code: string, state: string): Promise<{ user: User | null; error: string | null }> {
    if (!isDemoMode) {
      return { user: null, error: 'OAuth callback should be handled by Supabase in production mode' };
    }

    const savedState = localStorage.getItem('google_oauth_state');
    if (state !== savedState) {
      return { user: null, error: 'Invalid OAuth state parameter' };
    }

    localStorage.removeItem('google_oauth_state');

    try {
      // Exchange code for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: googleOAuthConfig.clientId,
          client_secret: googleOAuthConfig.clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: googleOAuthConfig.redirectUri,
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        return { user: null, error: tokenData.error_description || 'Failed to exchange code for token' };
      }

      // Get user info from Google
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      const userData = await userResponse.json();

      if (userData.error) {
        return { user: null, error: 'Failed to fetch user information from Google' };
      }

      // Create session with Google data
      this.session = {
        user: {
          id: `google-${userData.id}`,
          email: userData.email,
          name: userData.name,
          avatar: userData.picture,
          provider: 'google',
          googleId: userData.id,
          emailVerified: userData.verified_email,
          createdAt: new Date(),
          lastLoginAt: new Date(),
          role: 'developer'
        },
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || '',
        expiresAt: new Date(Date.now() + (tokenData.expires_in * 1000))
      };

      localStorage.setItem('demo_session', JSON.stringify(this.session));
      return { user: this.session.user, error: null };

    } catch (error) {
      return { user: null, error: 'Failed to complete Google authentication' };
    }
  }

  // Session Management
  async signOut(): Promise<void> {
    if (isDemoMode) {
      localStorage.removeItem('demo_session');
      this.session = null;
      return;
    }

    if (supabase) {
      await supabase.auth.signOut();
    }
    this.session = null;
  }

  async refreshSession(): Promise<{ session: AuthSession | null; error: string | null }> {
    if (isDemoMode) {
      // In demo mode, just return current session
      return { session: this.session, error: null };
    }

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

  isDemoMode(): boolean {
    return isDemoMode;
  }

  // Password Reset
  async resetPassword(email: string): Promise<{ error: string | null }> {
    if (isDemoMode) {
      // Demo mode - simulate password reset
      return { error: null };
    }

    if (!supabase) {
      return { error: 'Authentication service not configured' };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      return { error: 'Failed to send password reset email.' };
    }
  }

  async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    if (isDemoMode) {
      // Demo mode - simulate password update
      return { error: null };
    }

    if (!supabase) {
      return { error: 'Authentication service not configured' };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      return { error: 'Failed to update password.' };
    }
  }

  // GitHub Integration
  async getGitHubRepositories(): Promise<{ repositories: any[]; error: string | null }> {
    if (isDemoMode) {
      // Return mock repositories for demo
      const mockRepos = [
        {
          id: 1,
          name: 'my-awesome-project',
          full_name: 'demo/my-awesome-project',
          description: 'A demo project for AI code review',
          private: false,
          language: 'TypeScript',
          stargazers_count: 42,
          updated_at: new Date().toISOString(),
          html_url: 'https://github.com/demo/my-awesome-project'
        },
        {
          id: 2,
          name: 'react-dashboard',
          full_name: 'demo/react-dashboard',
          description: 'Modern React dashboard with TypeScript',
          private: true,
          language: 'JavaScript',
          stargazers_count: 15,
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          html_url: 'https://github.com/demo/react-dashboard'
        }
      ];
      return { repositories: mockRepos, error: null };
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
    if (isDemoMode) {
      return { content: null, error: 'Demo mode - repository content not available' };
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
}

export const authService = AuthService.getInstance();
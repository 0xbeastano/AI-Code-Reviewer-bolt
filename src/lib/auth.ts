import { createClient } from '@supabase/supabase-js';
import { Octokit } from '@octokit/rest';
import { createOAuthAppAuth } from '@octokit/auth-oauth-app';

// Supabase configuration with fallback
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured
const isSupabaseConfigured = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key';

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// GitHub OAuth configuration
export const githubOAuthConfig = {
  clientId: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
  clientSecret: import.meta.env.VITE_GITHUB_CLIENT_SECRET || '',
  redirectUri: `${window.location.origin}/auth/callback/github`,
  scopes: ['repo', 'user:email', 'read:user']
};

// Google OAuth configuration
export const googleOAuthConfig = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  redirectUri: `${window.location.origin}/auth/callback/google`,
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
  emailVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date;
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
  private demoMode: boolean = false;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  constructor() {
    this.demoMode = !isSupabaseConfigured;
    this.initializeSession();
  }

  private async initializeSession() {
    if (this.demoMode) {
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

  private async createAuthSession(supabaseSession: any): Promise<AuthSession> {
    const user = supabaseSession.user;
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
        avatar: user.user_metadata?.avatar_url,
        provider: user.app_metadata?.provider || 'email',
        githubToken: user.user_metadata?.provider_token,
        githubUsername: user.user_metadata?.user_name,
        emailVerified: user.email_confirmed_at !== null,
        createdAt: new Date(user.created_at),
        lastLoginAt: new Date(user.last_sign_in_at)
      },
      accessToken: supabaseSession.access_token,
      refreshToken: supabaseSession.refresh_token,
      expiresAt: new Date(supabaseSession.expires_at * 1000)
    };
  }

  private createDemoSession(email: string, name: string, provider: 'email' | 'github' | 'google' = 'email'): AuthSession {
    const session: AuthSession = {
      user: {
        id: `demo-${Date.now()}`,
        email,
        name,
        provider,
        emailVerified: true,
        createdAt: new Date(),
        lastLoginAt: new Date()
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
    if (this.demoMode) {
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

      return { user: data.user as any, error: null };
    } catch (error) {
      return { user: null, error: 'An unexpected error occurred during signup.' };
    }
  }

  async signInWithEmail(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    if (this.demoMode) {
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

  // OAuth Authentication
  async signInWithGitHub(): Promise<{ url?: string; error?: string }> {
    if (this.demoMode) {
      // Demo mode - simulate GitHub OAuth
      this.session = this.createDemoSession('demo@github.com', 'GitHub Demo User', 'github');
      return { url: undefined }; // No redirect needed in demo mode
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

  async signInWithGoogle(): Promise<{ url?: string; error?: string }> {
    if (this.demoMode) {
      // Demo mode - simulate Google OAuth
      this.session = this.createDemoSession('demo@google.com', 'Google Demo User', 'google');
      return { url: undefined }; // No redirect needed in demo mode
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

  // Session Management
  async signOut(): Promise<void> {
    if (this.demoMode) {
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
    if (this.demoMode) {
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
    return this.demoMode;
  }

  // Password Reset
  async resetPassword(email: string): Promise<{ error: string | null }> {
    if (this.demoMode) {
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
    if (this.demoMode) {
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
    if (this.demoMode) {
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
    if (this.demoMode) {
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

  // Rate Limiting
  private rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const userLimit = this.rateLimitMap.get(identifier);

    if (!userLimit || now > userLimit.resetTime) {
      this.rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (userLimit.count >= maxRequests) {
      return false;
    }

    userLimit.count++;
    return true;
  }
}

export const authService = AuthService.getInstance();
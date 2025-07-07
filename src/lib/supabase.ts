import { createClient } from '@supabase/supabase-js';
import { log } from '../utils/logger';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Determine if we should run in demo/offline mode
export const isDemoMode = (): boolean => {
  return (
    !supabaseUrl ||
    !supabaseAnonKey ||
    import.meta.env.VITE_DEMO_MODE === 'true'
  );
};

// Lazily create the Supabase client only when we have the required env vars
export const supabase = !isDemoMode()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : ((): null => {
      // Log once to avoid noisy console output in components that re-import this file
      if (typeof window !== 'undefined') {
        log.warn(
          'Supabase environment variables are missing. Falling back to demo mode.'
        );
      }
      return null;
    })();

// Warn developers in development mode when demo mode is active
if (import.meta.env.DEV && isDemoMode()) {
  console.info(
    '\u26A0\uFE0F  Supabase is not configured. The application is running in demo mode.'
  );
}

// OAuth providers configuration
export const oauthProviders = {
  github: {
    redirectTo: `${window.location.origin}/auth/callback`,
    scopes: 'user:email repo'
  },
  google: {
    redirectTo: `${window.location.origin}/auth/callback`,
    scopes: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'
  }
};

// GitHub OAuth configuration
export const githubConfig = {
  clientId: import.meta.env.VITE_GITHUB_CLIENT_ID,
  scopes: ['user:email', 'repo', 'read:org'],
  redirectUri: `${window.location.origin}/auth/callback`
};

// Google OAuth configuration  
export const googleConfig = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  redirectUri: `${window.location.origin}/auth/callback`
};

// Database types
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  github_username?: string;
  github_access_token?: string;
  google_id?: string;
  provider: 'email' | 'github' | 'google';
  created_at: string;
  updated_at: string;
}

export interface Repository {
  id: string;
  user_id: string;
  github_id?: number;
  name: string;
  full_name: string;
  description?: string;
  url: string;
  clone_url: string;
  ssh_url: string;
  default_branch: string;
  language?: string;
  is_private: boolean;
  stars_count: number;
  forks_count: number;
  size: number;
  last_push_at?: string;
  created_at: string;
  updated_at: string;
  sync_status: 'pending' | 'syncing' | 'completed' | 'error';
  last_sync_at?: string;
}

export interface CodeReview {
  id: string;
  user_id: string;
  repository_id?: string;
  file_path: string;
  original_content: string;
  improved_content?: string;
  analysis_results?: any;
  status: 'pending' | 'running' | 'completed' | 'error';
  created_at: string;
  updated_at: string;
}

// Utility to safely retrieve the Supabase client after runtime checks
const getSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase client is not initialised. Ensure environment variables are set.');
  }
  return supabase;
};

// Authentication helpers
export const auth = {
  // Sign up with email
  signUp: async (email: string, password: string, metadata?: any) => {
    if (isDemoMode()) {
      log.info('🔄 Demo mode: Sign-up simulated');
      return { user: null, session: null } as any;
    }
    const client = getSupabase();
    log.info('Signing up user with email');
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    
    if (error) {
      log.error('Email signup error', error);
      throw error;
    }
    
    return data;
  },

  // Sign in with email
  signIn: async (email: string, password: string) => {
    if (isDemoMode()) {
      log.info('🔄 Demo mode: Sign-in simulated');
      return { user: null, session: null } as any;
    }
    const client = getSupabase();
    log.info('Signing in user with email');
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      log.error('Email signin error', error);
      throw error;
    }
    
    return data;
  },

  // Sign in with OAuth provider
  signInWithOAuth: async (provider: 'github' | 'google') => {
    if (isDemoMode()) {
      log.info('🔄 Demo mode: OAuth sign-in simulated');
      return { url: '#' } as any;
    }
    const client = getSupabase();
    log.info(`Signing in with ${provider}`);
    const { data, error } = await client.auth.signInWithOAuth({
      provider,
      options: oauthProviders[provider]
    });
    
    if (error) {
      log.error(`${provider} OAuth error`, error);
      throw error;
    }
    
    return data;
  },

  // Sign out
  signOut: async () => {
    if (isDemoMode()) return;
    const client = getSupabase();
    log.info('Signing out user');
    const { error } = await client.auth.signOut();
    
    if (error) {
      log.error('Signout error', error);
      throw error;
    }
  },

  // Get current session
  getSession: async () => {
    if (isDemoMode()) return null;
    const client = getSupabase();
    const { data, error } = await client.auth.getSession();
    
    if (error) {
      log.error('Get session error', error);
      throw error;
    }
    
    return data.session;
  },

  // Get current user
  getUser: async () => {
    if (isDemoMode()) return null;
    const client = getSupabase();
    const { data, error } = await client.auth.getUser();
    
    if (error) {
      log.error('Get user error', error);
      throw error;
    }
    
    return data.user;
  },

  // Reset password
  resetPassword: async (email: string) => {
    if (isDemoMode()) return { data: null } as any;
    const client = getSupabase();
    log.info('Sending password reset email');
    const { data, error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });
    
    if (error) {
      log.error('Password reset error', error);
      throw error;
    }
    
    return data;
  },

  // Update password
  updatePassword: async (password: string) => {
    if (isDemoMode()) return { data: null } as any;
    const client = getSupabase();
    log.info('Updating user password');
    const { data, error } = await client.auth.updateUser({
      password
    });
    
    if (error) {
      log.error('Password update error', error);
      throw error;
    }
    
    return data;
  }
};

// Repository management
export const repositories = {
  // Get user repositories
  getUserRepositories: async (userId: string) => {
    if (isDemoMode()) return [] as Repository[];
    const client = getSupabase();
    const { data, error } = await client
      .from('repositories')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) {
      log.error('Error fetching user repositories', error);
      throw error;
    }
    
    return data as Repository[];
  },

  // Create repository
  createRepository: async (repository: Omit<Repository, 'id' | 'created_at' | 'updated_at'>) => {
    if (isDemoMode()) return { ...repository, id: 'demo', created_at: '', updated_at: '' } as Repository;
    const client = getSupabase();
    const { data, error } = await client
      .from('repositories')
      .insert(repository)
      .select()
      .single();
    
    if (error) {
      log.error('Error creating repository', error);
      throw error;
    }
    
    return data as Repository;
  },

  // Update repository
  updateRepository: async (id: string, updates: Partial<Repository>) => {
    if (isDemoMode()) return { id, ...updates } as any;
    const client = getSupabase();
    const { data, error } = await client
      .from('repositories')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      log.error('Error updating repository', error);
      throw error;
    }
    
    return data as Repository;
  },

  // Delete repository
  deleteRepository: async (id: string) => {
    if (isDemoMode()) return;
    const client = getSupabase();
    const { error } = await client
      .from('repositories')
      .delete()
      .eq('id', id);
    
    if (error) {
      log.error('Error deleting repository', error);
      throw error;
    }
  }
};

// Profile management
export const profiles = {
  // Get user profile
  getProfile: async (userId: string) => {
    if (isDemoMode()) return null;
    const client = getSupabase();
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      log.error('Error fetching profile', error);
      throw error;
    }
    
    return data as Profile;
  },

  // Create or update profile
  upsertProfile: async (profile: Omit<Profile, 'created_at' | 'updated_at'>) => {
    if (isDemoMode()) return profile as any;
    const client = getSupabase();
    const { data, error } = await client
      .from('profiles')
      .upsert({
        ...profile,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      log.error('Error upserting profile', error);
      throw error;
    }
    
    return data as Profile;
  }
};

// Export helpers & types for use in other files
export { getSupabase };
export type { Repository as SupabaseRepository, CodeReview as SupabaseCodeReview };

export default supabase;
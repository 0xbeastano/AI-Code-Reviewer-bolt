import { createClient } from '@supabase/supabase-js';
import { log } from '../utils/logger';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  log.error('Missing Supabase configuration');
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with enhanced configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
});

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

// Authentication helpers
export const auth = {
  // Sign up with email
  signUp: async (email: string, password: string, metadata?: any) => {
    log.info('Signing up user with email');
    const { data, error } = await supabase.auth.signUp({
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
    log.info('Signing in user with email');
    const { data, error } = await supabase.auth.signInWithPassword({
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
    log.info(`Signing in with ${provider}`);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
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
    log.info('Signing out user');
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      log.error('Signout error', error);
      throw error;
    }
  },

  // Get current session
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      log.error('Get session error', error);
      throw error;
    }
    
    return data.session;
  },

  // Get current user
  getUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      log.error('Get user error', error);
      throw error;
    }
    
    return data.user;
  },

  // Reset password
  resetPassword: async (email: string) => {
    log.info('Sending password reset email');
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
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
    log.info('Updating user password');
    const { data, error } = await supabase.auth.updateUser({
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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

// Utility function to check if we're in demo mode
export const isDemoMode = () => {
  return !supabaseUrl || supabaseUrl.includes('demo') || 
         import.meta.env.VITE_DEMO_MODE === 'true';
};

// Export types for use in other files
export type { Repository as SupabaseRepository, CodeReview as SupabaseCodeReview };

export default supabase;
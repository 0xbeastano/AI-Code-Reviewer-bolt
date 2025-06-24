import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured
const isSupabaseConfigured = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key';

// Create Supabase client
let supabaseClient = null;

try {
  if (isSupabaseConfigured) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
    console.log('🚀 Supabase client initialized successfully');
  } else {
    console.error('⚠️ Supabase configuration missing or invalid');
  }
} catch (error) {
  console.error('⚠️ Failed to initialize Supabase client:', error);
}

// Export the client
export const supabase = supabaseClient;

// Database types
export type CodeReview = {
  id: string;
  user_id: string;
  file_path: string;
  original_content: string;
  analysis_results: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
};

export type Repository = {
  id: string;
  user_id: string;
  name: string;
  full_name: string;
  provider: 'github' | 'gitlab' | 'bitbucket';
  url: string;
  default_branch: string;
  language: string;
  is_private: boolean;
  last_sync: string;
  status: 'active' | 'syncing' | 'error' | 'disconnected';
  webhook_configured: boolean;
  created_at: string;
  updated_at: string;
};
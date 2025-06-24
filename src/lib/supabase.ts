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
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null;

// Log configuration status
console.log(isSupabaseConfigured 
  ? '🚀 Production Mode Enabled - Connected to Supabase' 
  : '⚠️ Supabase connection failed - Check your environment variables');

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
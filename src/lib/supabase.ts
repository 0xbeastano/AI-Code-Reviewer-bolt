import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Demo mode flag - set to false to disable demo mode
let demoMode = false;

// Check if Supabase is properly configured
const isSupabaseConfigured = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key';

// Create Supabase client
let supabaseClient = null;

try {
  if (isSupabaseConfigured) {
    console.log('🔍 Initializing Supabase with:', { 
      url: supabaseUrl?.substring(0, 15) + '...',
      keyLength: supabaseAnonKey?.length || 0
    });
    
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
    console.log('🚀 Supabase client initialized successfully');
  } else {
    console.warn('⚠️ Supabase configuration missing or invalid, enabling demo mode');
    demoMode = true;
  }
} catch (error) {
  console.error('⚠️ Failed to initialize Supabase client:', error);
  demoMode = true;
}

// Export the client
export const supabase = supabaseClient;

// Demo mode functions
export const isDemoMode = () => demoMode;
export const enableDemoMode = () => {
  demoMode = true;
  console.log('🔄 Demo mode enabled');
};
export const disableDemoMode = () => {
  demoMode = false;
  console.log('🔄 Demo mode disabled');
};

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
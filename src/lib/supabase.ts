import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured
const isSupabaseConfigured = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key';

// Create Supabase client with error handling
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Disable auto-refresh to prevent unnecessary requests in demo mode
        autoRefreshToken: false,
        // Set a longer timeout for auth requests
        detectSessionInUrl: false
      }
    })
  : null;

// Enhanced demo mode detection that also considers runtime errors
let runtimeDemoMode = !isSupabaseConfigured;

// Function to check if we should use demo mode
export const isDemoMode = () => runtimeDemoMode;

// Function to force demo mode (called when Supabase fails)
export const enableDemoMode = () => {
  runtimeDemoMode = true;
  console.log('🔧 Switched to Demo Mode due to Supabase configuration issues');
};

// Test Supabase connection and handle reCAPTCHA errors
if (isSupabaseConfigured && supabase) {
  // Test the connection by attempting to get the session
  supabase.auth.getSession().catch((error) => {
    console.warn('Supabase connection test failed:', error);
    // Don't force demo mode for session errors, as they're expected when not logged in
  });
}

// Log configuration status
console.log(isDemoMode() 
  ? '🔧 Running in Demo Mode - Supabase not configured or unavailable' 
  : '🚀 Production Mode Enabled - Connected to Supabase');

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
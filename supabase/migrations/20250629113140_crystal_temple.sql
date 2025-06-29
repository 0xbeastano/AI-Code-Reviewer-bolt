/*
  # GitHub Auth Setup

  1. New Tables
    - None (using existing profiles table)
  
  2. Changes
    - Update handle_new_user function to better handle GitHub authentication
    - Add specific handling for GitHub user metadata
  
  3. Security
    - Maintain existing RLS policies
*/

-- Update the handle_new_user function to better handle GitHub authentication
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  username_val text;
  avatar_url_val text;
BEGIN
  -- Extract username from various sources with GitHub-specific handling
  IF NEW.raw_user_meta_data->>'provider' = 'github' THEN
    -- For GitHub users, prefer the GitHub username
    username_val := COALESCE(
      NEW.raw_user_meta_data->>'user_name',
      NEW.raw_user_meta_data->>'preferred_username',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    );
    
    -- For GitHub users, use the avatar from GitHub
    avatar_url_val := NEW.raw_user_meta_data->>'avatar_url';
  ELSE
    -- For other providers, use the standard approach
    username_val := COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'preferred_username',
      split_part(NEW.email, '@', 1)
    );
    
    avatar_url_val := NEW.raw_user_meta_data->>'avatar_url';
  END IF;

  -- Insert into profiles table WITHOUT specifying the id (let it auto-increment)
  INSERT INTO public.profiles (user_id, username, avatar_url)
  VALUES (
    NEW.id, 
    username_val,
    avatar_url_val
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create repositories table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'repositories'
  ) THEN
    CREATE TABLE repositories (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users(id) NOT NULL,
      name text NOT NULL,
      full_name text NOT NULL,
      provider text NOT NULL,
      url text NOT NULL,
      default_branch text DEFAULT 'main',
      language text,
      is_private boolean DEFAULT false,
      last_sync timestamptz DEFAULT now(),
      status text DEFAULT 'active',
      webhook_configured boolean DEFAULT false,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Users can insert their own repositories"
      ON repositories
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can read their own repositories"
      ON repositories
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can update their own repositories"
      ON repositories
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;
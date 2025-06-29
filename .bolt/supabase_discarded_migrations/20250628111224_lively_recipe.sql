/*
  # Fix Authentication Database Error

  1. Authentication Setup
    - Ensure users table exists and is properly configured
    - Add authentication trigger for profile creation
    - Fix any missing authentication components

  2. Security
    - Enable RLS on users table (if needed)
    - Ensure proper policies are in place

  3. Profile Integration
    - Add trigger to create profile when user signs up
    - Ensure proper foreign key relationships
*/

-- Create users table if it doesn't exist (this should be handled by Supabase auth, but let's ensure it)
-- Note: Supabase manages the auth.users table, but we need to ensure our public.users table exists if referenced

-- Check if we need a public users table for foreign key references
DO $$
BEGIN
  -- Create a public users table that mirrors auth.users for foreign key purposes
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN
    CREATE TABLE public.users (
      id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
    
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can read own data"
      ON public.users
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
      
    CREATE POLICY "Users can update own data"
      ON public.users
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;

-- Create or replace function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert into public.users table
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW());
  
  -- Insert into profiles table
  INSERT INTO public.profiles (user_id, username, created_at)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), NOW());
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure profiles table has correct structure
DO $$
BEGIN
  -- Add missing columns to profiles if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'user_id' AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  
  -- Ensure username column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'username' AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN username text;
  END IF;
END $$;

-- Update profiles policies to work with auth.users
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.profiles;

CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Ensure all foreign key references point to the correct users table
-- Update existing tables to reference auth.users if they're currently referencing public.users incorrectly

-- Fix repositories table foreign key if needed
DO $$
BEGIN
  -- Check if foreign key exists and points to the right table
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'repositories' 
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'user_id'
    AND kcu.referenced_table_name = 'users'
    AND kcu.referenced_table_schema = 'public'
  ) THEN
    -- Drop and recreate the foreign key to point to auth.users
    ALTER TABLE public.repositories DROP CONSTRAINT repositories_user_id_fkey;
    ALTER TABLE public.repositories ADD CONSTRAINT repositories_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Fix other tables' foreign keys
DO $$
DECLARE
  table_name text;
  tables_to_fix text[] := ARRAY['code_analyses', 'code_explanations', 'code_tests', 'code_reviews'];
BEGIN
  FOREACH table_name IN ARRAY tables_to_fix
  LOOP
    -- Check and fix foreign key constraints
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = table_name
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'user_id'
      AND kcu.referenced_table_name = 'users'
      AND kcu.referenced_table_schema = 'public'
    ) THEN
      EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT %I_user_id_fkey', table_name, table_name);
      EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE', table_name, table_name);
    END IF;
  END LOOP;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
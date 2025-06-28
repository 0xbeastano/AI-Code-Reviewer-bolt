/*
# Add user profiles table

1. New Tables
  - `profiles`
    - `id` (bigint, primary key)
    - `user_id` (uuid, references auth.users)
    - `username` (text)
    - `avatar_url` (text)
    - `created_at` (timestamp)
    - `bio` (text)
    - `location` (text)
    - `role` (text)

2. Security
  - Enable RLS on `profiles` table
  - Add policies for users to view and update their own profiles
  - Create trigger to automatically create profile on user signup
*/

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id bigint PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  bio text,
  location text,
  role text DEFAULT 'user'::text
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$
BEGIN
  -- Drop policies if they exist to avoid errors
  IF EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Allow users to view their own profile' AND polrelid = 'profiles'::regclass
  ) THEN
    DROP POLICY "Allow users to view their own profile" ON profiles;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Allow users to update their own profile' AND polrelid = 'profiles'::regclass
  ) THEN
    DROP POLICY "Allow users to update their own profile" ON profiles;
  END IF;
END $$;

-- Create the policies
CREATE POLICY "Allow users to view their own profile"
  ON profiles
  FOR SELECT
  TO public
  USING (user_id = auth.uid());

CREATE POLICY "Allow users to update their own profile"
  ON profiles
  FOR UPDATE
  TO public
  USING (user_id = auth.uid());

-- Create trigger to create profile on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, username, avatar_url)
  VALUES (
    floor(random() * 1000000000)::bigint, 
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), 
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if the trigger already exists before creating it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created' AND tgrelid = 'auth.users'::regclass
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;
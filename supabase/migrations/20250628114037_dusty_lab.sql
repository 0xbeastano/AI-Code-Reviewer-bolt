-- First check if profiles table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    -- Drop the existing trigger first to avoid conflicts
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    
    -- Drop the existing function
    DROP FUNCTION IF EXISTS public.handle_new_user();
    
    -- Check if id is an identity column and drop identity if it is
    IF EXISTS (
      SELECT 1 FROM pg_attribute a
      JOIN pg_class c ON a.attrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      JOIN pg_attrdef d ON a.attrelid = d.adrelid AND a.attnum = d.adnum
      WHERE n.nspname = 'public'
      AND c.relname = 'profiles'
      AND a.attname = 'id'
      AND a.attidentity = 'd'
    ) THEN
      ALTER TABLE profiles ALTER COLUMN id DROP IDENTITY IF EXISTS;
    END IF;
    
    -- Set the column to BIGSERIAL type
    -- First, ensure it's a bigint
    ALTER TABLE profiles ALTER COLUMN id TYPE bigint;
    
    -- Then set up the sequence if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'profiles_id_seq'
    ) THEN
      CREATE SEQUENCE IF NOT EXISTS profiles_id_seq;
      ALTER TABLE profiles ALTER COLUMN id SET DEFAULT nextval('profiles_id_seq');
      ALTER SEQUENCE profiles_id_seq OWNED BY profiles.id;
    END IF;
  ELSE
    -- Create profiles table if it doesn't exist
    CREATE TABLE profiles (
      id BIGSERIAL PRIMARY KEY,
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      username text,
      avatar_url text,
      created_at timestamptz DEFAULT now(),
      bio text,
      location text,
      role text DEFAULT 'user'::text
    );
  END IF;
  
  -- Enable Row Level Security
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
END $$;

-- Create or replace the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert into profiles table WITHOUT specifying the id (let it auto-increment)
  INSERT INTO public.profiles (user_id, username, avatar_url)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), 
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure policies exist (drop first to avoid errors)
DROP POLICY IF EXISTS "Allow users to view their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create the policies with consistent naming
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE profiles_id_seq TO authenticated;
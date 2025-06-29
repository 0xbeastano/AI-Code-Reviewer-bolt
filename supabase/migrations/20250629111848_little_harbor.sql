/*
  # GitHub Authentication Setup

  1. New Tables
    - No new tables created
  
  2. Changes
    - Updates the handle_new_user function to better handle GitHub authentication
    - Ensures proper metadata extraction from GitHub OAuth
  
  3. Security
    - No changes to security policies
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
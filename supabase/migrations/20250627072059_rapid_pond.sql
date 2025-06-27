/*
  # Create profiles table

  1. New Tables
    - `profiles`
      - `id` (bigint, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `username` (text)
      - `avatar_url` (text)
      - `created_at` (timestamptz)
      - `bio` (text)
      - `location` (text)
      - `role` (text)
  2. Security
    - Enable RLS on `profiles` table
    - Add policy for users to view and update their own profile
*/

CREATE TABLE IF NOT EXISTS profiles (
  id bigint PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  username text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  bio text,
  location text,
  role text DEFAULT 'user'
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to view their own profile"
  ON profiles
  FOR SELECT
  TO public
  USING (user_id = (SELECT uid()));

CREATE POLICY "Allow users to update their own profile"
  ON profiles
  FOR UPDATE
  TO public
  USING (user_id = (SELECT uid()));
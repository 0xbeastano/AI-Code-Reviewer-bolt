/*
  # Create user activity table with RLS

  1. New Tables
    - `user_activity`
      - `id` (bigint, primary key)
      - `user_id` (uuid, references auth.users)
      - `action` (text)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on `user_activity` table
    - Add policy for users to read their own activity data
*/

CREATE TABLE IF NOT EXISTS user_activity (
  id bigint PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  action text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Drop the policy if it exists to avoid the error
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'select_own_activity' AND polrelid = 'user_activity'::regclass
  ) THEN
    DROP POLICY "select_own_activity" ON user_activity;
  END IF;
END $$;

-- Create the policy
CREATE POLICY "select_own_activity"
  ON user_activity
  FOR SELECT
  TO public
  USING (user_id = auth.uid());
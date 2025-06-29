/*
  # User Activity Table

  1. New Tables
    - `user_activity`
      - `id` (bigint, primary key)
      - `user_id` (uuid, references auth.users)
      - `action` (text)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on `user_activity` table
    - Add policy for users to read their own activity
*/

CREATE TABLE IF NOT EXISTS user_activity (
  id bigint PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  action text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_activity"
  ON user_activity
  FOR SELECT
  TO public
  USING (user_id = auth.uid());
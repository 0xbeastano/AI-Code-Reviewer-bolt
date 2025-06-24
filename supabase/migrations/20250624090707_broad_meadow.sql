/*
  # Create repositories table

  1. New Tables
    - `repositories`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `full_name` (text)
      - `provider` (text)
      - `url` (text)
      - `default_branch` (text)
      - `language` (text)
      - `is_private` (boolean)
      - `last_sync` (timestamptz)
      - `status` (text)
      - `webhook_configured` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `repositories` table
    - Add policy for authenticated users to read/write their own data
*/

CREATE TABLE IF NOT EXISTS repositories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  full_name text NOT NULL,
  provider text NOT NULL,
  url text NOT NULL,
  default_branch text NOT NULL DEFAULT 'main',
  language text,
  is_private boolean DEFAULT false,
  last_sync timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'active',
  webhook_configured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own repositories"
  ON repositories
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own repositories"
  ON repositories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own repositories"
  ON repositories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
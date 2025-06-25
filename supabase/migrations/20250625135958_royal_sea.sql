/*
  # Create code analysis related tables

  1. New Tables
    - `code_analyses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `file_path` (text)
      - `language` (text)
      - `model` (text)
      - `analysis_results` (jsonb)
      - `created_at` (timestamptz)
    - `code_explanations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `language` (text)
      - `model` (text)
      - `explanation_results` (jsonb)
      - `created_at` (timestamptz)
    - `code_tests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `file_path` (text)
      - `language` (text)
      - `model` (text)
      - `test_results` (jsonb)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on all tables
    - Add policy for authenticated users to read/write their own data
*/

-- Code Analyses Table
CREATE TABLE IF NOT EXISTS code_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  file_path text NOT NULL,
  language text NOT NULL,
  model text NOT NULL,
  analysis_results jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE code_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own code analyses"
  ON code_analyses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own code analyses"
  ON code_analyses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Code Explanations Table
CREATE TABLE IF NOT EXISTS code_explanations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  language text NOT NULL,
  model text NOT NULL,
  explanation_results jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE code_explanations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own code explanations"
  ON code_explanations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own code explanations"
  ON code_explanations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Code Tests Table
CREATE TABLE IF NOT EXISTS code_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  file_path text NOT NULL,
  language text NOT NULL,
  model text NOT NULL,
  test_results jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE code_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own code tests"
  ON code_tests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own code tests"
  ON code_tests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
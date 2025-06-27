/*
  # Fix user activity table migration

  1. Create user_activity table if it doesn't exist
  2. Enable RLS
  3. Create policy only if it doesn't already exist
*/

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_activity (
  id bigint PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  action text,
  created_at timestamptz DEFAULT now()
);

-- Enable row level security
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Create policy only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_activity' AND policyname = 'select_own_activity'
  ) THEN
    CREATE POLICY "select_own_activity"
      ON user_activity
      FOR SELECT
      TO public
      USING (user_id = auth.uid());
  END IF;
END
$$;
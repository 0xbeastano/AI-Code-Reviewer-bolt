-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  github_username TEXT,
  github_access_token TEXT,
  google_id TEXT,
  provider TEXT NOT NULL CHECK (provider IN ('email', 'github', 'google')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  PRIMARY KEY (id)
);

-- Create repositories table
CREATE TABLE repositories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  github_id INTEGER UNIQUE,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  clone_url TEXT NOT NULL,
  ssh_url TEXT NOT NULL,
  default_branch TEXT NOT NULL,
  language TEXT,
  is_private BOOLEAN DEFAULT false,
  stars_count INTEGER DEFAULT 0,
  forks_count INTEGER DEFAULT 0,
  size INTEGER DEFAULT 0,
  last_push_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'completed', 'error')),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create code_reviews table
CREATE TABLE code_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  original_content TEXT NOT NULL,
  improved_content TEXT,
  analysis_results JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_github_username ON profiles(github_username);
CREATE INDEX idx_repositories_user_id ON repositories(user_id);
CREATE INDEX idx_repositories_github_id ON repositories(github_id);
CREATE INDEX idx_repositories_sync_status ON repositories(sync_status);
CREATE INDEX idx_code_reviews_user_id ON code_reviews(user_id);
CREATE INDEX idx_code_reviews_repository_id ON code_reviews(repository_id);
CREATE INDEX idx_code_reviews_status ON code_reviews(status);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for repositories
CREATE POLICY "Users can view their own repositories" ON repositories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own repositories" ON repositories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own repositories" ON repositories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own repositories" ON repositories
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for code_reviews
CREATE POLICY "Users can view their own code reviews" ON code_reviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own code reviews" ON code_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own code reviews" ON code_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own code reviews" ON code_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for auto-updating updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repositories_updated_at
  BEFORE UPDATE ON repositories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_code_reviews_updated_at
  BEFORE UPDATE ON code_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url, provider, github_username, google_id)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    CASE 
      WHEN NEW.raw_app_meta_data->>'provider' = 'github' THEN 'github'
      WHEN NEW.raw_app_meta_data->>'provider' = 'google' THEN 'google'
      ELSE 'email'
    END,
    NEW.raw_user_meta_data->>'user_name',
    NEW.raw_user_meta_data->>'sub'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create storage bucket for repository files (if needed)
INSERT INTO storage.buckets (id, name, public) VALUES ('repository-files', 'repository-files', false);

-- Create storage policy for repository files
CREATE POLICY "Users can upload their own repository files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'repository-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own repository files" ON storage.objects
  FOR SELECT USING (bucket_id = 'repository-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own repository files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'repository-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own repository files" ON storage.objects
  FOR DELETE USING (bucket_id = 'repository-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create view for repository statistics
CREATE VIEW repository_stats AS
SELECT 
  r.user_id,
  COUNT(*) as total_repositories,
  COUNT(CASE WHEN r.sync_status = 'completed' THEN 1 END) as synced_repositories,
  COUNT(CASE WHEN r.sync_status = 'error' THEN 1 END) as failed_repositories,
  COUNT(CASE WHEN r.is_private = true THEN 1 END) as private_repositories,
  COUNT(CASE WHEN r.is_private = false THEN 1 END) as public_repositories,
  SUM(r.stars_count) as total_stars,
  SUM(r.forks_count) as total_forks,
  array_agg(DISTINCT r.language) FILTER (WHERE r.language IS NOT NULL) as languages,
  MAX(r.last_push_at) as last_activity
FROM repositories r
GROUP BY r.user_id;

-- Create view for user dashboard data
CREATE VIEW user_dashboard_stats AS
SELECT 
  u.id as user_id,
  u.email,
  p.full_name,
  p.avatar_url,
  p.github_username,
  p.provider,
  COALESCE(rs.total_repositories, 0) as total_repositories,
  COALESCE(rs.synced_repositories, 0) as synced_repositories,
  COALESCE(rs.total_stars, 0) as total_stars,
  COALESCE(rs.total_forks, 0) as total_forks,
  COALESCE(rs.languages, '{}') as languages,
  rs.last_activity,
  COUNT(cr.id) as total_code_reviews,
  COUNT(CASE WHEN cr.status = 'completed' THEN 1 END) as completed_reviews,
  COUNT(CASE WHEN cr.status = 'pending' THEN 1 END) as pending_reviews,
  COUNT(CASE WHEN cr.status = 'error' THEN 1 END) as failed_reviews
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN repository_stats rs ON u.id = rs.user_id
LEFT JOIN code_reviews cr ON u.id = cr.user_id
GROUP BY u.id, u.email, p.full_name, p.avatar_url, p.github_username, p.provider, 
         rs.total_repositories, rs.synced_repositories, rs.total_stars, rs.total_forks, 
         rs.languages, rs.last_activity;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Grant storage permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;
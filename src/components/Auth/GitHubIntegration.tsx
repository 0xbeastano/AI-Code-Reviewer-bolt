import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Github, GitBranch, Lock, Users, Star, ExternalLink, RefreshCw, CheckCircle, Play, AlertTriangle } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { authService } from '../../lib/auth';
import { codeReviewService } from '../../services/codeReviewService';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useCodebase } from '../../contexts/CodebaseContext';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  language: string;
  stargazers_count: number;
  updated_at: string;
  html_url: string;
}

export const GitHubIntegration: React.FC = () => {
  const { user } = useAuth();
  const { setCurrentCodebase, setIsAnalyzing } = useCodebase();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRepos, setSelectedRepos] = useState<Set<number>>(new Set());
  const [analyzingRepo, setAnalyzingRepo] = useState<number | null>(null);

  const isGitHubConnected = user?.app_metadata?.provider === 'github' || user?.user_metadata?.user_name;

  useEffect(() => {
    if (isGitHubConnected) {
      fetchRepositories();
    }
  }, [isGitHubConnected]);

  const fetchRepositories = async () => {
    setLoading(true);
    try {
      const { repositories: repos, error } = await authService.getGitHubRepositories();
      
      if (error) {
        toast.error(error);
      } else {
        setRepositories(repos);
        
        // Save repositories to Supabase
        if (supabase && user) {
          await saveRepositoriesToSupabase(repos);
        }
        
        toast.success(`✅ Loaded ${repos.length} repositories from GitHub`);
      }
    } catch (error) {
      toast.error('Failed to fetch repositories');
    } finally {
      setLoading(false);
    }
  };

  const saveRepositoriesToSupabase = async (repos: Repository[]) => {
    if (!supabase || !user) return;
    
    try {
      // For each repository, upsert to Supabase
      const promises = repos.map(async (repo) => {
        const { error } = await supabase
          .from('repositories')
          .upsert({
            user_id: user.id,
            name: repo.name,
            full_name: repo.full_name,
            provider: 'github',
            url: repo.html_url,
            language: repo.language,
            is_private: repo.private,
            last_sync: new Date().toISOString(),
            status: 'active',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id, full_name'
          });
          
        if (error) {
          console.error('Error saving repository:', error);
        }
      });
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Error saving repositories to Supabase:', error);
    }
  };

  const handleConnectGitHub = async () => {
    try {
      // Store current location for redirect after auth
      sessionStorage.setItem('auth_return_to', window.location.pathname);
      
      const { error } = await authService.signInWithGitHub();
      
      if (error) {
        toast.error(error.message);
      }
      // Redirect is handled in the signInWithGitHub function
    } catch (error) {
      toast.error('Failed to connect GitHub');
    }
  };

  const toggleRepository = (repoId: number) => {
    const newSelected = new Set(selectedRepos);
    if (newSelected.has(repoId)) {
      newSelected.delete(repoId);
    } else {
      newSelected.add(repoId);
    }
    setSelectedRepos(newSelected);
  };

  const handleAnalyzeSelected = () => {
    if (selectedRepos.size === 0) {
      toast.error('Please select at least one repository');
      return;
    }
    
    toast.success(`🚀 Starting analysis for ${selectedRepos.size} repositories`);
    // Navigate to analysis page with selected repositories
    window.location.href = '/review';
  };

  const simulatePRAnalysis = async (repo: Repository) => {
    setAnalyzingRepo(repo.id);
    
    try {
      toast.success(`Starting PR simulation for ${repo.name}...`);
      
      // Fetch repository content
      const { content, error } = await authService.getRepositoryContent(
        repo.full_name.split('/')[0], 
        repo.name
      );
      
      if (error) {
        toast.error(`Failed to fetch repository content: ${error}`);
        return;
      }
      
      // Create a mock codebase from the repository content
      const mockCodebase = {
        id: `repo-${repo.id}`,
        name: repo.name,
        files: Array.isArray(content) ? content.map((file: any) => ({
          path: file.path,
          content: file.content || 'Sample content',
          language: file.name?.split('.').pop() || 'text',
          size: file.size || 0,
          lastModified: new Date(file.updated_at || Date.now())
        })) : [{
          path: 'sample.js',
          content: 'console.log("Hello World");',
          language: 'javascript',
          size: 25,
          lastModified: new Date()
        }],
        totalSize: Array.isArray(content) ? content.reduce((acc: number, file: any) => acc + (file.size || 0), 0) : 100,
        uploadedAt: new Date(),
        status: 'uploaded'
      };
      
      // Set the current codebase
      setCurrentCodebase(mockCodebase);
      
      // Navigate to the review page
      window.location.href = '/review';
      
    } catch (error) {
      console.error('PR simulation error:', error);
      toast.error('Failed to simulate PR analysis');
    } finally {
      setAnalyzingRepo(null);
    }
  };

  if (!isGitHubConnected) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center">
          <motion.div 
            className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4"
            whileHover={{ scale: 1.1, rotate: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Github className="w-8 h-8 text-gray-600 dark:text-gray-400" />
          </motion.div>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Connect GitHub Account
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Connect your GitHub account to analyze private repositories and get AI-powered code reviews directly from your repos.
          </p>

          <motion.div 
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              What you'll get:
            </h4>
            <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
              <motion.li 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                • Access to private repositories
              </motion.li>
              <motion.li 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                • Automated code analysis on commits
              </motion.li>
              <motion.li 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                • Pull request integration
              </motion.li>
              <motion.li 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                • Team collaboration features
              </motion.li>
            </ul>
          </motion.div>

          <motion.button
            onClick={handleConnectGitHub}
            className="inline-flex items-center px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Github className="w-5 h-5 mr-2" />
            Connect GitHub Account
          </motion.button>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            We only request the minimum permissions needed for code analysis
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <motion.div 
        className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div 
              className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            </motion.div>
            <div>
              <h3 className="font-medium text-green-800 dark:text-green-200">
                GitHub Connected
              </h3>
              <p className="text-sm text-green-600 dark:text-green-300">
                @{user?.user_metadata?.user_name || user?.user_metadata?.name || 'github-user'} • {repositories.length} repositories available
              </p>
            </div>
          </div>
          
          <motion.button
            onClick={fetchRepositories}
            disabled={loading}
            className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800 rounded-lg transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </motion.div>

      {/* Repository Selection */}
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Select Repositories for Analysis
            </h3>
            
            {selectedRepos.size > 0 && (
              <motion.button
                onClick={handleAnalyzeSelected}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Analyze {selectedRepos.size} Repository{selectedRepos.size !== 1 ? 'ies' : ''}
              </motion.button>
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading repositories...</p>
            </div>
          ) : repositories.length === 0 ? (
            <div className="p-8 text-center">
              <GitBranch className="w-8 h-8 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No repositories found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {repositories.map((repo, index) => (
                <motion.div 
                  key={repo.id} 
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ 
                    backgroundColor: "rgba(243, 244, 246, 0.5)",
                    dark: { backgroundColor: "rgba(55, 65, 81, 0.3)" }
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedRepos.has(repo.id)}
                      onChange={() => toggleRepository(repo.id)}
                      className="mt-1 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {repo.name}
                        </h4>
                        
                        {repo.private && (
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: 10 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            <Lock className="w-4 h-4 text-gray-400" />
                          </motion.div>
                        )}
                        
                        {repo.language && (
                          <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                            {repo.language}
                          </span>
                        )}
                      </div>
                      
                      {repo.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {repo.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3" />
                          <span>{repo.stargazers_count}</span>
                        </div>
                        
                        <span>
                          Updated {new Date(repo.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <motion.button
                        onClick={() => simulatePRAnalysis(repo)}
                        disabled={analyzingRepo === repo.id}
                        className="px-3 py-1 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: analyzingRepo === repo.id ? 1 : 1.05 }}
                        whileTap={{ scale: analyzingRepo === repo.id ? 1 : 0.95 }}
                      >
                        {analyzingRepo === repo.id ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Analyzing...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3" />
                            <span>Simulate PR</span>
                          </>
                        )}
                      </motion.button>
                      
                      <motion.a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </motion.a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* PR Simulation Info */}
      <motion.div 
        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
              About PR Simulation
            </h4>
            <p className="text-sm text-blue-600 dark:text-blue-300">
              The "Simulate PR" button demonstrates how the AI reviewer would analyze code in a pull request workflow. 
              It fetches repository files and runs them through the AI analysis engine, just like it would in a real CI/CD pipeline.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
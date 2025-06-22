import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Github, GitBranch, Lock, Users, Star, ExternalLink, RefreshCw } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { authService } from '../../lib/auth';
import toast from 'react-hot-toast';

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
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRepos, setSelectedRepos] = useState<Set<number>>(new Set());

  const isGitHubConnected = user?.provider === 'github' || user?.githubToken;

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
      }
    } catch (error) {
      toast.error('Failed to fetch repositories');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGitHub = async () => {
    try {
      const { url, error } = await authService.signInWithGitHub();
      
      if (error) {
        toast.error(error);
      } else if (url) {
        window.location.href = url;
      }
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
    
    toast.success(`Starting analysis for ${selectedRepos.size} repositories`);
    // Navigate to analysis page with selected repositories
  };

  if (!isGitHubConnected) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Github className="w-8 h-8 text-gray-600 dark:text-gray-400" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Connect GitHub Account
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Connect your GitHub account to analyze private repositories and get AI-powered code reviews directly from your repos.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              What you'll get:
            </h4>
            <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
              <li>• Access to private repositories</li>
              <li>• Automated code analysis on commits</li>
              <li>• Pull request integration</li>
              <li>• Team collaboration features</li>
            </ul>
          </div>

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
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
              <Github className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-medium text-green-800 dark:text-green-200">
                GitHub Connected
              </h3>
              <p className="text-sm text-green-600 dark:text-green-300">
                @{user?.githubUsername} • {repositories.length} repositories available
              </p>
            </div>
          </div>
          
          <button
            onClick={fetchRepositories}
            disabled={loading}
            className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Repository Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
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
              {repositories.map((repo) => (
                <div key={repo.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedRepos.has(repo.id)}
                      onChange={() => toggleRepository(repo.id)}
                      className="mt-1 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                          {repo.name}
                        </h4>
                        
                        {repo.private && (
                          <Lock className="w-4 h-4 text-gray-400" />
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
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3" />
                          <span>{repo.stargazers_count}</span>
                        </div>
                        
                        <span>
                          Updated {new Date(repo.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
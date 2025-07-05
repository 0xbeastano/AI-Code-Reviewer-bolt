import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Github, 
  Search, 
  Star, 
  GitFork, 
  Calendar, 
  Lock, 
  Globe,
  Code,
  Download,
  CheckCircle,
  AlertCircle,
  Loader,
  RefreshCw,
  Filter,
  X
} from 'lucide-react';
import { createAuthenticatedGitHubService } from '../../services/githubService';
import { useAuth } from '../Auth/AuthProvider';
import { repositories } from '../../lib/supabase';
import { log } from '../../utils/logger';
import toast from 'react-hot-toast';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  default_branch: string;
  language: string | null;
  private: boolean;
  stargazers_count: number;
  forks_count: number;
  size: number;
  pushed_at: string;
  created_at: string;
  updated_at: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

interface GitHubRepositoryImporterProps {
  onImportComplete?: () => void;
  onClose?: () => void;
}

const GitHubRepositoryImporter: React.FC<GitHubRepositoryImporterProps> = ({ 
  onImportComplete, 
  onClose 
}) => {
  const { user, profile } = useAuth();
  const [repositories, setRepositories] = useState<GitHubRepo[]>([]);
  const [filteredRepositories, setFilteredRepositories] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState<Set<number>>(new Set());
  const [imported, setImported] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [selectedRepos, setSelectedRepos] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const githubService = React.useMemo(() => {
    if (profile?.github_access_token) {
      return createAuthenticatedGitHubService(profile.github_access_token);
    }
    return null;
  }, [profile?.github_access_token]);

  // Fetch repositories
  const fetchRepositories = async (page = 1) => {
    if (!githubService) return;

    setLoading(true);
    try {
      const repos = await githubService.getUserRepositories(undefined, page, 30);
      
      if (page === 1) {
        setRepositories(repos);
        setFilteredRepositories(repos);
      } else {
        setRepositories(prev => [...prev, ...repos]);
        setFilteredRepositories(prev => [...prev, ...repos]);
      }
      
      // Calculate total pages (GitHub API doesn't provide total count easily)
      setTotalPages(Math.ceil(repos.length / 30) + (repos.length === 30 ? 1 : 0));
      
      log.info('GitHub repositories fetched', { count: repos.length, page });
    } catch (error) {
      log.error('Failed to fetch GitHub repositories', error);
      toast.error('Failed to fetch repositories. Please check your GitHub connection.');
    } finally {
      setLoading(false);
    }
  };

  // Filter repositories
  useEffect(() => {
    let filtered = repositories;

    if (searchTerm) {
      filtered = filtered.filter(repo => 
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (languageFilter) {
      filtered = filtered.filter(repo => 
        repo.language?.toLowerCase() === languageFilter.toLowerCase()
      );
    }

    setFilteredRepositories(filtered);
  }, [repositories, searchTerm, languageFilter]);

  // Get unique languages
  const availableLanguages = React.useMemo(() => {
    const languages = new Set<string>();
    repositories.forEach(repo => {
      if (repo.language) {
        languages.add(repo.language);
      }
    });
    return Array.from(languages).sort();
  }, [repositories]);

  // Import single repository
  const importRepository = async (repo: GitHubRepo) => {
    if (!user || !githubService) return;

    setImporting(prev => new Set(prev).add(repo.id));
    
    try {
      await githubService.importRepository(repo, user.id);
      setImported(prev => new Set(prev).add(repo.id));
      toast.success(`Successfully imported ${repo.name}`);
      log.info('Repository imported successfully', { repoId: repo.id, name: repo.name });
    } catch (error) {
      log.error('Failed to import repository', error);
      toast.error(`Failed to import ${repo.name}`);
    } finally {
      setImporting(prev => {
        const newSet = new Set(prev);
        newSet.delete(repo.id);
        return newSet;
      });
    }
  };

  // Import selected repositories
  const importSelectedRepositories = async () => {
    if (!user || !githubService || selectedRepos.size === 0) return;

    const reposToImport = Array.from(selectedRepos);
    setImporting(new Set(reposToImport));
    
    try {
      await githubService.importRepositories(reposToImport, user.id);
      setImported(prev => new Set([...prev, ...reposToImport]));
      toast.success(`Successfully imported ${reposToImport.length} repositories`);
      setSelectedRepos(new Set());
      onImportComplete?.();
    } catch (error) {
      log.error('Failed to import selected repositories', error);
      toast.error('Failed to import some repositories');
    } finally {
      setImporting(new Set());
    }
  };

  // Toggle repository selection
  const toggleRepository = (repoId: number) => {
    setSelectedRepos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(repoId)) {
        newSet.delete(repoId);
      } else {
        newSet.add(repoId);
      }
      return newSet;
    });
  };

  // Load more repositories
  const loadMore = () => {
    if (loading || currentPage >= totalPages) return;
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchRepositories(nextPage);
  };

  // Initialize
  useEffect(() => {
    if (githubService) {
      fetchRepositories();
    }
  }, [githubService]);

  if (!githubService) {
    return (
      <div className="p-8 text-center">
        <Github className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          GitHub Not Connected
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Please sign in with GitHub to import your repositories.
        </p>
        <button
          onClick={() => window.location.href = '/auth'}
          className="bg-gradient-ai text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
        >
          Connect GitHub
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-2 bg-gradient-ai rounded-lg mr-4">
            <Github className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Import GitHub Repositories
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Select repositories to import for code review and analysis
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          <button
            onClick={() => fetchRepositories(1)}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-gradient-ai text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  <select
                    value={languageFilter}
                    onChange={(e) => setLanguageFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">All Languages</option>
                    {availableLanguages.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bulk Actions */}
      {selectedRepos.size > 0 && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-blue-900 dark:text-blue-100">
                {selectedRepos.size} repositories selected
              </span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedRepos(new Set())}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                Clear Selection
              </button>
              <button
                onClick={importSelectedRepositories}
                disabled={importing.size > 0}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Import Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Repository List */}
      <div className="space-y-4">
        {loading && currentPage === 1 ? (
          <div className="text-center py-8">
            <Loader className="w-8 h-8 animate-spin mx-auto text-primary-600 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading repositories...</p>
          </div>
        ) : filteredRepositories.length === 0 ? (
          <div className="text-center py-8">
            <Github className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No repositories found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || languageFilter ? 'Try adjusting your search or filters.' : 'No repositories available for import.'}
            </p>
          </div>
        ) : (
          filteredRepositories.map((repo) => (
            <motion.div
              key={repo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      checked={selectedRepos.has(repo.id)}
                      onChange={() => toggleRepository(repo.id)}
                      className="w-4 h-4 text-primary-600 rounded border-gray-300 mr-3"
                    />
                    <div className="flex items-center">
                      {repo.private ? (
                        <Lock className="w-4 h-4 text-gray-500 mr-2" />
                      ) : (
                        <Globe className="w-4 h-4 text-gray-500 mr-2" />
                      )}
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {repo.name}
                      </h3>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {repo.description || 'No description available'}
                  </p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                    {repo.language && (
                      <div className="flex items-center">
                        <Code className="w-4 h-4 mr-1" />
                        {repo.language}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      {repo.stargazers_count}
                    </div>
                    <div className="flex items-center">
                      <GitFork className="w-4 h-4 mr-1" />
                      {repo.forks_count}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(repo.pushed_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                  
                  {imported.has(repo.id) ? (
                    <div className="flex items-center text-green-600 dark:text-green-400">
                      <CheckCircle className="w-5 h-5 mr-1" />
                      Imported
                    </div>
                  ) : (
                    <button
                      onClick={() => importRepository(repo)}
                      disabled={importing.has(repo.id)}
                      className="bg-gradient-ai text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center"
                    >
                      {importing.has(repo.id) ? (
                        <Loader className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      {importing.has(repo.id) ? 'Importing...' : 'Import'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Load More */}
      {currentPage < totalPages && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center mx-auto"
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default GitHubRepositoryImporter;
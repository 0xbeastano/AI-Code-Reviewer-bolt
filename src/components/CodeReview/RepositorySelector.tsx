import React from 'react';
import { GitBranch, Plus, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { Repository } from '../../types/codeReview';

interface RepositorySelectorProps {
  repositories: Repository[];
  loading: boolean;
  onSelect: (repository: Repository) => void;
  selectedRepository: Repository | null;
}

const RepositorySelector: React.FC<RepositorySelectorProps> = ({
  repositories,
  loading,
  onSelect,
  selectedRepository
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Select Repository
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Choose a repository to start the AI code review process
          </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Connect Repository
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {repositories.map((repo, index) => (
          <motion.button
            key={repo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(repo)}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all text-left"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <GitBranch className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {repo.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {repo.provider}
                </p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {repo.language} • {repo.isPrivate ? 'Private' : 'Public'}
            </p>
            
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                repo.status === 'active' 
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
              }`}>
                {repo.status}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Last sync: {repo.lastSync.toLocaleDateString()}
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      {repositories.length === 0 && (
        <div className="text-center py-12">
          <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No repositories found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Connect your first repository to get started with AI code reviews
          </p>
          <button className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors mx-auto">
            <Plus className="w-4 h-4 mr-2" />
            Connect Repository
          </button>
        </div>
      )}
    </div>
  );
};

export default RepositorySelector;
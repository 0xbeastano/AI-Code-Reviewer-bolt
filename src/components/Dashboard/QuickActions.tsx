import React from 'react';
import { motion } from 'framer-motion';
import { Play, Plus, Settings, Download, GitBranch, Zap } from 'lucide-react';
import { Repository } from '../../types/codeReview';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
  repositories: Repository[];
}

const QuickActions: React.FC<QuickActionsProps> = ({ repositories }) => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'new-review',
      title: 'Start New Review',
      description: 'Begin AI-powered code analysis',
      icon: Play,
      color: 'bg-primary-600 hover:bg-primary-700',
      onClick: () => navigate('/review')
    },
    {
      id: 'connect-repo',
      title: 'Connect Repository',
      description: 'Add a new repository for analysis',
      icon: Plus,
      color: 'bg-green-600 hover:bg-green-700',
      onClick: () => navigate('/settings?tab=integrations')
    },
    {
      id: 'quick-scan',
      title: 'Quick Security Scan',
      description: 'Run security analysis on latest commits',
      icon: Zap,
      color: 'bg-orange-600 hover:bg-orange-700',
      onClick: () => {
        if (repositories.length > 0) {
          navigate(`/review?repository=${repositories[0].id}&type=security`);
        }
      }
    },
    {
      id: 'export-reports',
      title: 'Export Reports',
      description: 'Download analysis reports',
      icon: Download,
      color: 'bg-purple-600 hover:bg-purple-700',
      onClick: () => navigate('/analytics?tab=reports')
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Common tasks and shortcuts
        </p>
      </div>

      <div className="p-6 space-y-3">
        {actions.map((action, index) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={action.onClick}
            className={`w-full flex items-center space-x-4 p-4 rounded-lg text-white transition-colors ${action.color}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex-shrink-0">
              <action.icon className="w-6 h-6" />
            </div>
            
            <div className="flex-1 text-left">
              <h4 className="font-medium">{action.title}</h4>
              <p className="text-sm opacity-90">{action.description}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {repositories.length > 0 && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            Recent Repositories
          </h4>
          <div className="space-y-2">
            {repositories.slice(0, 3).map((repo) => (
              <button
                key={repo.id}
                onClick={() => navigate(`/review?repository=${repo.id}`)}
                className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <GitBranch className="w-4 h-4 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                    {repo.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {repo.language} • {repo.provider}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActions;
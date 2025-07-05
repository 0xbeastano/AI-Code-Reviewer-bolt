import React from 'react';
import { motion } from 'framer-motion';
import { Play, Plus, Settings, Download, GitBranch, Zap, ChevronRight, Cloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Repository } from '../../types/codeReview';

interface QuickActionsProps {
  repositories: Repository[];
}

const QuickActions: React.FC<QuickActionsProps> = ({ repositories = [] }) => {
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
      id: 'deploy-app',
      title: 'Deploy Application',
      description: 'Deploy your app to Netlify',
      icon: Cloud,
      color: 'bg-purple-600 hover:bg-purple-700',
      onClick: () => navigate('/deploy')
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center"
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Zap className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h3>
          </motion.div>
          <motion.button 
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center"
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            More
            <ChevronRight className="w-4 h-4 ml-1" />
          </motion.button>
        </div>
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
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div 
              className="flex-shrink-0"
              whileHover={{ rotate: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <action.icon className="w-6 h-6" />
            </motion.div>
            
            <div className="flex-1 text-left">
              <h4 className="font-medium">{action.title}</h4>
              <p className="text-sm opacity-90">{action.description}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {repositories.length > 0 && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <GitBranch className="w-4 h-4 text-primary-600 dark:text-primary-400 mr-2" />
            Recent Repositories
          </h4>
          <div className="space-y-2">
            {repositories.slice(0, 3).map((repo) => (
              <motion.button
                key={repo.id}
                onClick={() => navigate(`/review?repository=${repo.id}`)}
                className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                whileHover={{ x: 5, backgroundColor: "rgba(243, 244, 246, 0.8)" }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <GitBranch className="w-4 h-4 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                    {repo.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {repo.language} • {repo.provider} • {repo.status}
                  </p>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(repo.lastSync).toLocaleDateString()}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default QuickActions;
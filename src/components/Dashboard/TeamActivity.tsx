import React from 'react';
import { motion } from 'framer-motion';
import { User, GitCommit, GitPullRequest, CheckCircle } from 'lucide-react';

const TeamActivity: React.FC = () => {
  const activities = [
    {
      id: '1',
      user: 'Alice Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
      action: 'completed code review',
      target: 'user-auth-service',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      type: 'review'
    },
    {
      id: '2',
      user: 'Bob Smith',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      action: 'applied AI suggestions',
      target: 'payment-gateway',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      type: 'suggestion'
    },
    {
      id: '3',
      user: 'Carol Davis',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
      action: 'created pull request',
      target: 'mobile-app',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      type: 'pr'
    },
    {
      id: '4',
      user: 'David Wilson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
      action: 'fixed security issue',
      target: 'api-gateway',
      timestamp: new Date(Date.now() - 90 * 60 * 1000),
      type: 'security'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'review':
        return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'suggestion':
        return <GitCommit className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'pr':
        return <GitPullRequest className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'security':
        return <CheckCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      default:
        return <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Team Activity
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Recent team member activities
        </p>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <img
                src={activity.avatar}
                alt={activity.user}
                className="w-8 h-8 rounded-full"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {activity.user}
                  </span>
                  {getActivityIcon(activity.type)}
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activity.action} in{' '}
                  <span className="font-medium">{activity.target}</span>
                </p>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {activity.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full text-center text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
          View all activity
        </button>
      </div>
    </div>
  );
};

export default TeamActivity;
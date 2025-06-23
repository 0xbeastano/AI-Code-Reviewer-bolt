import React from 'react';
import { motion } from 'framer-motion';
import { User, GitCommit, GitPullRequest, CheckCircle, ChevronRight } from 'lucide-react';

interface TeamActivityItem {
  id: string;
  user: string;
  avatar?: string;
  action: string;
  target: string;
  timestamp: Date;
  type: 'review' | 'suggestion' | 'pr' | 'security';
}

interface TeamActivityProps {
  activities?: TeamActivityItem[];
}

const TeamActivity: React.FC<TeamActivityProps> = ({ activities = [] }) => {
  // If no activities are provided, use these default ones
  const defaultActivities = [
    {
      id: '1',
      user: 'Alice Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
      action: 'completed code review',
      target: 'user-auth-service',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      type: 'review' as const
    },
    {
      id: '2',
      user: 'Bob Smith',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      action: 'applied AI suggestions',
      target: 'payment-gateway',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      type: 'suggestion' as const
    },
    {
      id: '3',
      user: 'Carol Davis',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
      action: 'created pull request',
      target: 'mobile-app',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      type: 'pr' as const
    }
  ];

  const displayActivities = activities.length > 0 ? activities : defaultActivities;

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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <User className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
          Team Activity
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Recent team member activities
        </p>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {displayActivities.length === 0 ? (
          <div className="p-8 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No team activity found</p>
          </div>
        ) : (
          displayActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={activity.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activity.user)}&background=random`}
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
                    {activity.timestamp.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full text-center text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors flex items-center justify-center">
          View all activity
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default TeamActivity;
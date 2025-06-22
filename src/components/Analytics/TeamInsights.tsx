import React from 'react';
import { Users, GitCommit, Clock, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface TeamInsightsProps {
  data?: any;
}

const TeamInsights: React.FC<TeamInsightsProps> = ({ data }) => {
  const teamMetrics = [
    { label: 'Active Team Members', value: 8, color: 'blue', icon: Users },
    { label: 'Reviews Completed', value: 156, color: 'green', icon: GitCommit },
    { label: 'Average Review Time', value: '2.5h', color: 'orange', icon: Clock },
    { label: 'Quality Improvements', value: '+23%', color: 'purple', icon: Award }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {teamMetrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center space-x-3">
              <metric.icon className={`w-8 h-8 text-${metric.color}-600 dark:text-${metric.color}-400`} />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metric.value}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {metric.label}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Team Insights
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Detailed team performance analytics and collaboration insights will be displayed here.
        </p>
      </div>
    </div>
  );
};

export default TeamInsights;
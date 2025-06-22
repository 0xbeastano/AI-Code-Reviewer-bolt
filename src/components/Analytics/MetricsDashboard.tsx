import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Shield, Zap, Users, Clock } from 'lucide-react';

interface MetricsDashboardProps {
  data?: {
    overview: {
      totalReviews: number;
      averageQuality: number;
      securityIssues: number;
      performanceGains: number;
      timeRange: string;
    };
    trends: {
      quality: Array<{ date: Date; value: number }>;
      security: Array<{ date: Date; value: number }>;
      performance: Array<{ date: Date; value: number }>;
    };
    repositories: Array<{
      id: string;
      name: string;
      metrics: {
        quality: number;
        security: number;
        performance: number;
      };
    }>;
  };
}

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-300 dark:bg-gray-700 h-32 rounded-lg"></div>
          ))}
        </div>
        <div className="bg-gray-300 dark:bg-gray-700 h-64 rounded-lg"></div>
      </div>
    );
  }

  const metrics = [
    {
      title: 'Total Reviews',
      value: data.overview.totalReviews,
      icon: BarChart3,
      color: 'blue',
      change: '+12%'
    },
    {
      title: 'Average Quality',
      value: `${data.overview.averageQuality}%`,
      icon: TrendingUp,
      color: 'green',
      change: '+5%'
    },
    {
      title: 'Security Issues',
      value: data.overview.securityIssues,
      icon: Shield,
      color: 'red',
      change: '-8%'
    },
    {
      title: 'Performance Gains',
      value: `${data.overview.performanceGains}%`,
      icon: Zap,
      color: 'orange',
      change: '+15%'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
      red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
      orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg border ${getColorClasses(metric.color)}`}>
                <metric.icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {metric.change}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {metric.value}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {metric.title}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Repository Performance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Repository Performance
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Quality metrics across your repositories
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {data.repositories.slice(0, 5).map((repo) => (
              <div key={repo.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{repo.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Repository</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {repo.metrics.quality}%
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Quality</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {repo.metrics.security}%
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Security</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {repo.metrics.performance}%
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Performance</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Time Range Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Analysis Summary
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Data for the last {data.overview.timeRange}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;
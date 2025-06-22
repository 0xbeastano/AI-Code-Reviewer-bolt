import React from 'react';
import { Zap, Clock, TrendingUp, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface PerformanceMetricsProps {
  data?: any;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ data }) => {
  const performanceMetrics = [
    { label: 'Average Response Time', value: '245ms', color: 'blue', icon: Clock },
    { label: 'Performance Score', value: '87%', color: 'green', icon: TrendingUp },
    { label: 'Optimization Opportunities', value: 12, color: 'orange', icon: Zap },
    { label: 'Performance Improvements', value: '+15%', color: 'purple', icon: Activity }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => (
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
          Performance Metrics
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Detailed performance analytics and optimization recommendations will be displayed here.
        </p>
      </div>
    </div>
  );
};

export default PerformanceMetrics;
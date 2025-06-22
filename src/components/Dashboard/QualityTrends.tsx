import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface QualityTrendsProps {
  data?: {
    quality: number[];
    security: number[];
    performance: number[];
  };
}

const QualityTrends: React.FC<QualityTrendsProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  const chartData = data.quality.map((quality, index) => ({
    day: `Day ${index + 1}`,
    quality,
    security: data.security[index],
    performance: data.performance[index]
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Quality Trends
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Code quality metrics over time
        </p>
      </div>

      <div className="p-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="day" 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg)',
                  border: '1px solid var(--tooltip-border)',
                  borderRadius: '8px',
                  color: 'var(--tooltip-color)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="quality" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                name="Quality"
              />
              <Line 
                type="monotone" 
                dataKey="security" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                name="Security"
              />
              <Line 
                type="monotone" 
                dataKey="performance" 
                stroke="#F59E0B" 
                strokeWidth={2}
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                name="Performance"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default QualityTrends;
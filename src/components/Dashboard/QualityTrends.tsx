import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { BarChart3, ChevronRight } from 'lucide-react';

interface QualityTrendsProps {
  data?: {
    quality: number[];
    security: number[];
    performance: number[];
    // New expanded metrics
    maintainability?: number[];
    complexity?: number[];
    testCoverage?: number[];
    documentation?: number[];
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

  // Transform data for chart
  const chartData = data.quality.map((quality, index) => {
    const dataPoint: any = {
      day: `Day ${index + 1}`,
      quality,
      security: data.security[index],
      performance: data.performance[index],
    };
    
    // Add new metrics if available
    if (data.maintainability) dataPoint.maintainability = data.maintainability[index];
    if (data.complexity) dataPoint.complexity = data.complexity[index];
    if (data.testCoverage) dataPoint.testCoverage = data.testCoverage[index];
    if (data.documentation) dataPoint.documentation = data.documentation[index];
    
    return dataPoint;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center"
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <BarChart3 className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Quality Trends
            </h3>
          </motion.div>
          <motion.button 
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center"
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            View details
            <ChevronRight className="w-4 h-4 ml-1" />
          </motion.button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Code quality metrics over time
        </p>
      </div>

      <div className="p-6">
        <motion.div 
          className="h-64"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
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
                animationDuration={300}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="quality" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                name="Quality"
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
              <Line 
                type="monotone" 
                dataKey="security" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                name="Security"
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                animationDuration={1500}
                animationEasing="ease-in-out"
                animationBegin={300}
              />
              <Line 
                type="monotone" 
                dataKey="performance" 
                stroke="#F59E0B" 
                strokeWidth={2}
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                name="Performance"
                activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2 }}
                animationDuration={1500}
                animationEasing="ease-in-out"
                animationBegin={600}
              />
              {data.maintainability && (
                <Line 
                  type="monotone" 
                  dataKey="maintainability" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  name="Maintainability"
                  activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                  animationBegin={900}
                />
              )}
              {data.complexity && (
                <Line 
                  type="monotone" 
                  dataKey="complexity" 
                  stroke="#EC4899" 
                  strokeWidth={2}
                  dot={{ fill: '#EC4899', strokeWidth: 2, r: 4 }}
                  name="Complexity"
                  activeDot={{ r: 6, stroke: '#EC4899', strokeWidth: 2 }}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                  animationBegin={1200}
                />
              )}
              {data.testCoverage && (
                <Line 
                  type="monotone" 
                  dataKey="testCoverage" 
                  stroke="#06B6D4" 
                  strokeWidth={2}
                  dot={{ fill: '#06B6D4', strokeWidth: 2, r: 4 }}
                  name="Test Coverage"
                  activeDot={{ r: 6, stroke: '#06B6D4', strokeWidth: 2 }}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                  animationBegin={1500}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default QualityTrends;
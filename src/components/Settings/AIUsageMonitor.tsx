import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, AlertTriangle, TrendingUp, DollarSign, BarChart3, Calendar, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface AIUsageMonitorProps {
  userId?: string;
}

interface UsageData {
  totalTokens: number;
  totalCost: number;
  models: {
    [key: string]: {
      tokens: number;
      cost: number;
    }
  };
  dailyUsage: Array<{
    date: string;
    tokens: number;
    cost: number;
  }>;
  monthlyLimit: number;
  monthlyUsage: number;
}

const AIUsageMonitor: React.FC<AIUsageMonitorProps> = ({ userId }) => {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch usage data
  useEffect(() => {
    const fetchUsageData = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, this would call an API
        // For now, we'll use mock data
        setTimeout(() => {
          setUsageData(getMockUsageData(timeRange));
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Failed to fetch AI usage data:', error);
        setIsLoading(false);
      }
    };

    fetchUsageData();
  }, [timeRange, userId]);

  const getMockUsageData = (range: string): UsageData => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const dailyUsage = [];
    
    let totalTokens = 0;
    let totalCost = 0;
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate random usage with some patterns
      const baseTokens = 50000 + Math.random() * 100000;
      const tokens = Math.round(baseTokens * (1 + Math.sin(i / 5) * 0.3));
      const cost = +(tokens * 0.000002).toFixed(2);
      
      totalTokens += tokens;
      totalCost += cost;
      
      dailyUsage.push({
        date: date.toISOString().split('T')[0],
        tokens,
        cost
      });
    }
    
    // Reverse to get chronological order
    dailyUsage.reverse();
    
    return {
      totalTokens,
      totalCost,
      models: {
        'gpt-4o': {
          tokens: Math.round(totalTokens * 0.4),
          cost: +(totalTokens * 0.4 * 0.000005).toFixed(2)
        },
        'gpt-4-turbo': {
          tokens: Math.round(totalTokens * 0.3),
          cost: +(totalTokens * 0.3 * 0.000003).toFixed(2)
        },
        'claude-3-opus': {
          tokens: Math.round(totalTokens * 0.2),
          cost: +(totalTokens * 0.2 * 0.000004).toFixed(2)
        },
        'claude-3-sonnet': {
          tokens: Math.round(totalTokens * 0.1),
          cost: +(totalTokens * 0.1 * 0.000002).toFixed(2)
        }
      },
      dailyUsage,
      monthlyLimit: 10000000, // 10M tokens
      monthlyUsage: totalTokens
    };
  };

  const formatNumber = (num: number): string => {
    return num >= 1000000
      ? `${(num / 1000000).toFixed(1)}M`
      : num >= 1000
      ? `${(num / 1000).toFixed(1)}K`
      : num.toString();
  };

  const formatCost = (cost: number): string => {
    return `$${cost.toFixed(2)}`;
  };

  const getUsagePercentage = (): number => {
    if (!usageData) return 0;
    return (usageData.monthlyUsage / usageData.monthlyLimit) * 100;
  };

  const getUsageColor = (): string => {
    const percentage = getUsagePercentage();
    if (percentage >= 90) return 'text-red-600 dark:text-red-400';
    if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
        <div className="animate-pulse h-64 bg-gray-200 dark:bg-gray-700 rounded mt-6"></div>
      </div>
    );
  }

  if (!usageData) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Usage Data Unavailable
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          We couldn't retrieve your AI usage data. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <Brain className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
          AI Usage Monitoring
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Track your AI model usage, costs, and limits
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-end space-x-2">
        {['7d', '30d', '90d'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range as any)}
            className={`px-3 py-1 text-sm rounded-lg ${
              timeRange === range
                ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : 'Last 90 days'}
          </button>
        ))}
        <motion.button
          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg"
          whileHover={{ scale: 1.1, rotate: 10 }}
          whileTap={{ scale: 0.9 }}
        >
          <Download className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tokens</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(usageData.totalTokens)}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Monthly Limit</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatNumber(usageData.monthlyLimit)}
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full ${
                getUsagePercentage() >= 90 ? 'bg-red-500' :
                getUsagePercentage() >= 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(getUsagePercentage(), 100)}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <div className="mt-1 text-xs text-right">
            <span className={getUsageColor()}>
              {getUsagePercentage().toFixed(1)}% used
            </span>
          </div>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCost(usageData.totalCost)}
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between mb-1">
              <span>Average Daily Cost</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCost(usageData.totalCost / usageData.dailyUsage.length)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Projected Monthly</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCost((usageData.totalCost / usageData.dailyUsage.length) * 30)}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Usage Trend</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {usageData.dailyUsage.length >= 2 && 
                  usageData.dailyUsage[usageData.dailyUsage.length - 1].tokens > 
                  usageData.dailyUsage[usageData.dailyUsage.length - 2].tokens
                  ? '+' : '-'}
                {usageData.dailyUsage.length >= 2 
                  ? Math.abs(Math.round(
                      ((usageData.dailyUsage[usageData.dailyUsage.length - 1].tokens - 
                        usageData.dailyUsage[usageData.dailyUsage.length - 2].tokens) / 
                        usageData.dailyUsage[usageData.dailyUsage.length - 2].tokens) * 100
                    )) 
                  : 0}%
              </p>
            </div>
          </div>
          <div className="h-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageData.dailyUsage.slice(-7)}>
                <Line 
                  type="monotone" 
                  dataKey="tokens" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Usage Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <BarChart3 className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
              Token Usage by Model
            </h3>
          </div>
          <div className="p-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={Object.entries(usageData.models).map(([model, data]) => ({
                  model,
                  tokens: data.tokens
                }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis 
                  dataKey="model" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70}
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                />
                <YAxis tick={{ fill: 'currentColor' }} />
                <Tooltip 
                  formatter={(value: any) => [`${formatNumber(value)} tokens`, 'Usage']}
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg)',
                    borderColor: 'var(--tooltip-border)',
                    color: 'var(--tooltip-color)'
                  }}
                />
                <Bar dataKey="tokens" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
              Daily Usage Trend
            </h3>
          </div>
          <div className="p-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={usageData.dailyUsage}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis tick={{ fill: 'currentColor' }} />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    name === 'tokens' ? formatNumber(value) : formatCost(value),
                    name === 'tokens' ? 'Tokens' : 'Cost'
                  ]}
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg)',
                    borderColor: 'var(--tooltip-border)',
                    color: 'var(--tooltip-color)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="tokens" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                  name="tokens"
                />
                <Line 
                  type="monotone" 
                  dataKey="cost" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                  name="cost"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Cost Breakdown */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <DollarSign className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
            Cost Breakdown by Model
          </h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Model
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tokens
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cost
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {Object.entries(usageData.models).map(([model, data], index) => (
                  <motion.tr 
                    key={model}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.7 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {model}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatNumber(data.tokens)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatCost(data.cost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {((data.cost / usageData.totalCost) * 100).toFixed(1)}%
                    </td>
                  </motion.tr>
                ))}
                <motion.tr
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                  className="bg-gray-50 dark:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                    Total
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                    {formatNumber(usageData.totalTokens)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                    {formatCost(usageData.totalCost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                    100%
                  </td>
                </motion.tr>
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Alert for high usage */}
      {getUsagePercentage() >= 80 && (
        <motion.div
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                Approaching Monthly Limit
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                You've used {getUsagePercentage().toFixed(1)}% of your monthly token allowance. Consider upgrading your plan or optimizing your AI usage to avoid interruptions.
              </p>
              <div className="mt-3">
                <button className="text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:text-yellow-900 dark:hover:text-yellow-100">
                  Upgrade Plan
                </button>
                <span className="mx-2 text-yellow-700 dark:text-yellow-300">•</span>
                <button className="text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:text-yellow-900 dark:hover:text-yellow-100">
                  Optimization Tips
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AIUsageMonitor;
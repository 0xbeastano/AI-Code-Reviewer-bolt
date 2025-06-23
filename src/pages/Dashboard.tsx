import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Shield, 
  Zap, 
  Clock, 
  TrendingUp,
  Brain,
  Upload,
  ArrowRight,
  Star,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery } from 'react-query';

// Import components
import QualityTrends from '../components/Dashboard/QualityTrends';
import RecentReviews from '../components/Dashboard/RecentReviews';
import SecurityAlerts from '../components/Dashboard/SecurityAlerts';
import TeamActivity from '../components/Dashboard/TeamActivity';
import QuickActions from '../components/Dashboard/QuickActions';
import { codeReviewService } from '../services/codeReviewService';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'1d' | '7d' | '30d' | '90d'>('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch dashboard data
  const { data: dashboardData, isLoading, refetch } = useQuery(
    ['dashboardMetrics', timeRange],
    () => codeReviewService.getDashboardMetrics(timeRange),
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch repositories for QuickActions
  const { data: repositories } = useQuery(
    'repositories',
    codeReviewService.getRepositories,
    {
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const handleStartReview = () => {
    navigate('/review');
  };

  const handleRefreshMetrics = async () => {
    setIsRefreshing(true);
    toast.success('Refreshing metrics...');
    
    try {
      await refetch();
      toast.success('Metrics updated successfully!');
    } catch (error) {
      toast.error('Failed to refresh metrics');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Header with AI Branding */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 
            className="text-3xl font-bold text-gray-900 dark:text-white flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Brain className="w-8 h-8 text-primary-600 dark:text-primary-400 mr-3" />
            AI Code Review Dashboard
            <span className="ml-3 px-3 py-1 text-sm bg-gradient-ai text-white rounded-full flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              GPT-4 Powered
            </span>
          </motion.h1>
          <motion.p 
            className="text-gray-600 dark:text-gray-400 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Advanced AI analysis delivering 10x developer productivity
          </motion.p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 shadow-sm"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <motion.button
            onClick={handleRefreshMetrics}
            disabled={isLoading || isRefreshing}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className={`w-5 h-5 ${isLoading || isRefreshing ? 'animate-spin' : ''}`} />
          </motion.button>
          
          <motion.div
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">Pro Plan</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Hero CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-ai rounded-2xl p-8 text-white shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2 flex items-center">
              Automated AI Code Review for 10x Developer Productivity
            </h2>
            <p className="text-blue-100 mb-4 text-lg">
              Upload your codebase. Get intelligent, GPT-4 powered code analysis, refactoring suggestions, and quality insights.
            </p>
            <div className="flex items-center space-x-6 text-sm text-blue-100">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>{"< 30 seconds"}</span>
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-1" />
                <span>99.2% accuracy</span>
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-1" />
                <span>20+ languages</span>
              </div>
            </div>
          </div>
          <motion.button
            onClick={handleStartReview}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Upload className="w-5 h-5 mr-2" />
            Start Analysis
            <ArrowRight className="w-5 h-5 ml-2" />
          </motion.button>
        </div>
      </motion.div>

      {/* Live KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-500/10 rounded-full -ml-8 -mb-8"></div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Analysis Completed</h3>
                <motion.p 
                  key={isLoading ? 'loading' : 'loaded'}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                >
                  {isLoading ? (
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ) : (
                    dashboardData?.metrics?.repoCount || 0
                  )}
                </motion.p>
              </div>
            </div>
            <div className="text-green-500 dark:text-green-400 font-medium text-sm flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              +25%
            </div>
          </div>
          
          <div className="h-1 w-full bg-gray-100 dark:bg-gray-700 rounded-full mb-1">
            <div className="h-1 bg-blue-500 rounded-full" style={{ width: '75%' }}></div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            75% of monthly goal
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-500/10 rounded-full -ml-8 -mb-8"></div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Security Score</h3>
                <motion.div 
                  key={isLoading ? 'loading' : 'loaded'}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center"
                >
                  {isLoading ? (
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData?.metrics?.securityScore || 0}%</p>
                  )}
                </motion.div>
              </div>
            </div>
            <div className="text-green-500 dark:text-green-400 font-medium text-sm flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              +8%
            </div>
          </div>
          
          <div className="h-1 w-full bg-gray-100 dark:bg-gray-700 rounded-full mb-1">
            <div className="h-1 bg-green-500 rounded-full" style={{ width: `${dashboardData?.metrics?.securityScore || 0}%` }}></div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {(dashboardData?.metrics?.securityScore || 0) >= 90 ? 'Excellent' : (dashboardData?.metrics?.securityScore || 0) >= 80 ? 'Good' : 'Needs improvement'}
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-500/10 rounded-full -ml-8 -mb-8"></div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Quality Improvement</h3>
                <motion.div 
                  key={isLoading ? 'loading' : 'loaded'}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center"
                >
                  {isLoading ? (
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">+{dashboardData?.metrics?.qualityGain || 0}%</p>
                  )}
                </motion.div>
              </div>
            </div>
            <div className="text-green-500 dark:text-green-400 font-medium text-sm flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              +12%
            </div>
          </div>
          
          <div className="h-1 w-full bg-gray-100 dark:bg-gray-700 rounded-full mb-1">
            <div className="h-1 bg-purple-500 rounded-full" style={{ width: `${Math.min(100, (dashboardData?.metrics?.qualityGain || 0) * 2)}%` }}></div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {(dashboardData?.metrics?.qualityGain || 0) >= 30 ? 'Exceptional' : (dashboardData?.metrics?.qualityGain || 0) >= 20 ? 'Significant' : 'Moderate'} improvement
          </div>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quality Trends - Dynamic */}
          {isLoading ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ) : (
            <QualityTrends data={dashboardData?.trends} />
          )}
          
          {/* Recent Reviews */}
          <RecentReviews />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <QuickActions repositories={repositories || []} />
          <SecurityAlerts />
          <TeamActivity />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
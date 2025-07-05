import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Shield, 
  Clock, 
  TrendingUp,
  Brain,
  Upload,
  ArrowRight,
  Star,
  Sparkles,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Activity,
  Users,
  FileCode,
  Zap,
  Settings,
  Download,
  Eye,
  Plus
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
import MetricCard from '../components/Dashboard/MetricCard';
import { log } from '../utils/logger';
import responsiveConfig from '../config/responsive';

interface DashboardData {
  metrics: {
    repoCount: number;
    securityScore: number;
    qualityGain: number;
    performanceGain: number;
    bugsFixed: number;
    linesRefactored: number;
    activeUsers?: number;
    totalFiles?: number;
  };
  trends: {
    quality: number[];
    security: number[];
    performance: number[];
    maintainability?: number[];
    complexity?: number[];
    testCoverage?: number[];
  };
  recentReviews: any[];
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'1d' | '7d' | '30d' | '90d'>('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch dashboard data with better error handling
  const { 
    data: dashboardData, 
    isLoading, 
    error,
    refetch 
  } = useQuery<DashboardData>(
    ['dashboardMetrics', timeRange],
    async () => {
      log.info('Fetching dashboard metrics', { timeRange });
      const startTime = performance.now();
      
      try {
        const data = await codeReviewService.getDashboardMetrics(timeRange);
        log.performance('Dashboard metrics fetch', performance.now() - startTime);
        setLastUpdated(new Date());
        return data;
      } catch (error) {
        log.error('Failed to fetch dashboard metrics', error);
        throw error;
      }
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (error) => {
        log.error('Dashboard query error', error);
        toast.error('Failed to load dashboard data');
      }
    }
  );

  // Fetch repositories for QuickActions
  const { data: repositories, isLoading: repositoriesLoading } = useQuery(
    'repositories',
    async () => {
      log.info('Fetching repositories');
      const repos = await codeReviewService.getRepositories();
      log.info('Repositories fetched', { count: repos.length });
      return repos;
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000, // 10 minutes
      onError: (error) => {
        log.error('Repositories query error', error);
      }
    }
  );

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time data updates every 30 seconds
      if (!isLoading && !isRefreshing) {
        refetch();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isLoading, isRefreshing, refetch]);

  // Enhanced button handlers with proper logging and error handling
  const handleStartReview = () => {
    log.info('User starting new review');
    toast.success('Starting new code review...');
    navigate('/review');
  };

  const handleViewAnalytics = () => {
    log.info('User navigating to analytics');
    navigate('/analytics');
  };

  const handleConnectRepository = () => {
    log.info('User connecting repository');
    navigate('/settings?tab=integrations');
  };

  const handleQuickScan = () => {
    log.info('User starting quick scan');
    if (repositories && repositories.length > 0) {
      toast.success('Starting security scan...');
      navigate(`/review?repository=${repositories[0].id}&type=security`);
    } else {
      toast.error('Please connect a repository first');
      navigate('/settings?tab=integrations');
    }
  };

  const handleRefreshMetrics = async () => {
    log.info('User refreshing metrics');
    setIsRefreshing(true);
    toast.success('Refreshing metrics...');
    
    try {
      await refetch();
      toast.success('Metrics updated successfully!');
      log.info('Metrics refreshed successfully');
    } catch (error) {
      log.error('Failed to refresh metrics', error);
      toast.error('Failed to refresh metrics');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUpgrade = () => {
    log.info('User viewing upgrade options');
    navigate('/pricing');
  };

  // Enhanced responsive metrics calculation
  const getMetricTrend = (current: number, previous: number) => {
    if (!previous) return { value: 0, direction: 'stable' as const };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(Math.round(change)),
      direction: change > 0 ? 'up' as const : change < 0 ? 'down' as const : 'stable' as const
    };
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard Unavailable
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We're having trouble loading your dashboard. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Enhanced Header with Responsive Design */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
      >
        <div className="space-y-2">
          <motion.h1 
            className="text-fluid-3xl font-bold text-gray-900 dark:text-white flex items-center flex-wrap gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Brain className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            <span>AI Code Review Dashboard</span>
            <motion.span 
              className="px-3 py-1 text-fluid-sm bg-gradient-ai text-white rounded-full flex items-center"
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 2, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              GPT-4 Powered
            </motion.span>
          </motion.h1>
          <motion.p 
            className="text-fluid-base text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Advanced AI analysis delivering 10x developer productivity
          </motion.p>
          <motion.p 
            className="text-fluid-sm text-gray-500 dark:text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Last updated: {lastUpdated.toLocaleTimeString()}
          </motion.p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 shadow-sm min-w-[180px]"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <motion.button
            onClick={handleRefreshMetrics}
            disabled={isLoading || isRefreshing}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className={`w-5 h-5 ${isLoading || isRefreshing ? 'animate-spin' : ''}`} />
          </motion.button>
          
          <motion.button
            onClick={handleUpgrade}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
            whileHover={{ scale: 1.05 }}
            animate={{ 
              boxShadow: ["0px 0px 0px rgba(0,0,0,0.2)", "0px 5px 15px rgba(0,0,0,0.2)", "0px 0px 0px rgba(0,0,0,0.2)"]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">Pro Plan</span>
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Enhanced Hero CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-ai rounded-2xl p-6 md:p-8 text-white shadow-2xl"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center lg:justify-between gap-6">
          <div className="flex-1 space-y-4">
            <h2 className="text-fluid-2xl font-bold flex items-center flex-wrap gap-2">
              Automated AI Code Review for 10x Developer Productivity
            </h2>
            <p className="text-blue-100 text-fluid-lg">
              Upload your codebase. Get intelligent, GPT-4 powered code analysis, refactoring suggestions, and quality insights.
            </p>
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-fluid-sm text-blue-100">
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
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <motion.button
              onClick={handleStartReview}
              className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold text-fluid-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Upload className="w-5 h-5 mr-2" />
              Start Analysis
              <ArrowRight className="w-5 h-5 ml-2" />
            </motion.button>
            
            <motion.button
              onClick={handleViewAnalytics}
              className="bg-blue-600 bg-opacity-20 text-white px-6 py-3 rounded-xl font-semibold text-fluid-base border border-white border-opacity-30 hover:bg-opacity-30 transition-all flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Eye className="w-5 h-5 mr-2" />
              View Analytics
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Live KPI Metrics with Real-time Updates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        <MetricCard
          title="Projects Analyzed"
          value={isLoading ? "-" : dashboardData?.metrics?.repoCount || 0}
          icon={BarChart3}
          color="blue"
          trend={getMetricTrend(dashboardData?.metrics?.repoCount || 0, 15)}
          loading={isLoading}
          subtitle={`${Math.round(((dashboardData?.metrics?.repoCount || 0) / 20) * 100)}% of monthly goal`}
        />
        
        <MetricCard
          title="Security Score"
          value={isLoading ? "-" : `${dashboardData?.metrics?.securityScore || 0}%`}
          icon={Shield}
          color="green"
          trend={getMetricTrend(dashboardData?.metrics?.securityScore || 0, 85)}
          loading={isLoading}
          subtitle={(dashboardData?.metrics?.securityScore || 0) >= 90 ? 'Excellent' : (dashboardData?.metrics?.securityScore || 0) >= 80 ? 'Good' : 'Needs improvement'}
          badge={(dashboardData?.metrics?.securityScore || 0) >= 95 ? 'TOP 5%' : undefined}
        />
        
        <MetricCard
          title="Quality Improvement"
          value={isLoading ? "-" : `+${dashboardData?.metrics?.qualityGain || 0}%`}
          icon={TrendingUp}
          color="purple"
          trend={getMetricTrend(dashboardData?.metrics?.qualityGain || 0, 20)}
          loading={isLoading}
          subtitle={(dashboardData?.metrics?.qualityGain || 0) >= 30 ? 'Exceptional' : (dashboardData?.metrics?.qualityGain || 0) >= 20 ? 'Significant' : 'Moderate'}
        />
        
        <MetricCard
          title="Lines Refactored"
          value={isLoading ? "-" : `${(dashboardData?.metrics?.linesRefactored || 0).toLocaleString()}`}
          icon={FileCode}
          color="orange"
          trend={getMetricTrend(dashboardData?.metrics?.linesRefactored || 0, 5000)}
          loading={isLoading}
          subtitle="This month"
        />
      </div>

      {/* Quick Action Buttons Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.button
          onClick={handleStartReview}
          className="p-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all group"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-3">
            <Upload className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="font-semibold">Start Review</p>
              <p className="text-sm opacity-90">Upload & analyze code</p>
            </div>
          </div>
        </motion.button>

        <motion.button
          onClick={handleConnectRepository}
          className="p-4 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all group"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-3">
            <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="font-semibold">Connect Repo</p>
              <p className="text-sm opacity-90">Add GitHub repository</p>
            </div>
          </div>
        </motion.button>

        <motion.button
          onClick={handleQuickScan}
          className="p-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-all group"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-3">
            <Zap className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="font-semibold">Quick Scan</p>
              <p className="text-sm opacity-90">Security analysis</p>
            </div>
          </div>
        </motion.button>

        <motion.button
          onClick={handleViewAnalytics}
          className="p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all group"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-3">
            <Activity className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="font-semibold">Analytics</p>
              <p className="text-sm opacity-90">View detailed insights</p>
            </div>
          </div>
        </motion.button>
      </motion.div>

      {/* Main Content Grid - Responsive Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Takes 2/3 on large screens */}
        <div className="xl:col-span-2 space-y-6">
          {/* Quality Trends - Enhanced with Loading States */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                  <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="trends"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <QualityTrends data={dashboardData?.trends} />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Recent Reviews - Enhanced */}
                     <motion.div
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.1 }}
           >
             <RecentReviews reviews={dashboardData?.recentReviews || []} />
           </motion.div>
        </div>

        {/* Right Column - Enhanced Sidebar */}
        <div className="space-y-6">
                     <motion.div
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.2 }}
           >
             <QuickActions repositories={repositories || []} />
           </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <SecurityAlerts />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <TeamActivity />
          </motion.div>
        </div>
      </div>

      {/* Real-time Status Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              isLoading || isRefreshing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
            }`}></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {isLoading || isRefreshing ? 'Updating...' : 'Live'}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
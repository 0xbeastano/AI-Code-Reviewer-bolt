import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Shield, 
  Zap, 
  GitBranch, 
  Clock, 
  TrendingUp,
  CheckCircle,
  Users,
  Brain,
  Upload,
  ArrowRight,
  Star,
  Sparkles,
  RefreshCw,
  ChevronRight,
  AlertTriangle,
  FileCode
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery } from 'react-query';

// Import components
import MetricCard from '../components/Dashboard/MetricCard';
import RecentReviews from '../components/Dashboard/RecentReviews';
import QualityTrends from '../components/Dashboard/QualityTrends';
import SecurityAlerts from '../components/Dashboard/SecurityAlerts';
import TeamActivity from '../components/Dashboard/TeamActivity';
import QuickActions from '../components/Dashboard/QuickActions';

// Import services
import { codeReviewService } from '../services/codeReviewService';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'1d' | '7d' | '30d' | '90d'>('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch dashboard data
  const { data: dashboardData, isLoading, refetch } = useQuery(
    ['dashboardMetrics', timeRange],
    async () => {
      // In a real app, this would be an API call
      // For now, simulate API response with realistic data
      await new Promise(resolve => setTimeout(resolve, 1500));
      return {
        metrics: {
          repoCount: Math.floor(Math.random() * 5) + 3,
          securityScore: Math.floor(Math.random() * 10) + 90,
          qualityGain: Math.floor(Math.random() * 15) + 25,
          performanceGain: Math.floor(Math.random() * 10) + 20,
          bugsFixed: Math.floor(Math.random() * 500) + 1000,
          linesRefactored: Math.floor(Math.random() * 5000) + 5000
        },
        repositories: [
          {
            id: '1',
            name: 'e-commerce-platform',
            provider: 'github',
            language: 'TypeScript',
            isPrivate: false,
            lastScan: new Date(),
            status: 'active'
          },
          {
            id: '2', 
            name: 'payment-service',
            provider: 'github',
            language: 'Python',
            isPrivate: true,
            lastScan: new Date(),
            status: 'active'
          },
          {
            id: '3',
            name: 'mobile-app',
            provider: 'github', 
            language: 'React Native',
            isPrivate: true,
            lastScan: new Date(),
            status: 'active'
          }
        ],
        reviews: [
          {
            id: 'review-1',
            status: 'completed',
            startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            progress: 100,
            summary: {
              issuesFound: 23,
              qualityScore: 89
            }
          },
          {
            id: 'review-2', 
            status: 'running',
            startedAt: new Date(Date.now() - 30 * 60 * 1000),
            progress: 67,
            summary: {
              issuesFound: 0,
              qualityScore: 0
            }
          },
          {
            id: 'review-3',
            status: 'completed',
            startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            progress: 100,
            summary: {
              issuesFound: 15,
              qualityScore: 92
            }
          }
        ],
        securityAlerts: [
          {
            id: '1',
            type: 'critical',
            title: 'SQL Injection Vulnerability',
            description: 'Potential SQL injection found in user authentication',
            repository: 'web-app',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            id: '2',
            type: 'warning',
            title: 'Outdated Dependencies',
            description: '3 dependencies have known security vulnerabilities',
            repository: 'api-service',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
          },
          {
            id: '3',
            type: 'info',
            title: 'Security Scan Complete',
            description: 'No new vulnerabilities found in latest scan',
            repository: 'mobile-app',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
          }
        ],
        teamActivity: [
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
          }
        ],
        trends: {
          quality: [82, 84, 85, 87, 86, 89, 87],
          security: [88, 90, 92, 91, 93, 94, 95],
          performance: [75, 77, 79, 81, 80, 83, 85]
        },
        impact: {
          costSavings: 12400,
          timeSaved: 156,
          bugsFixed: 1247,
          autoFixRate: 89,
          teamRating: 4.9
        }
      };
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
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
                <GitBranch className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Repositories Reviewed</h3>
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={dashboardData?.metrics.repoCount || 'loading'}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="text-2xl font-bold text-gray-900 dark:text-white"
                  >
                    {isLoading ? (
                      <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    ) : (
                      dashboardData?.metrics.repoCount
                    )}
                  </motion.p>
                </AnimatePresence>
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
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={dashboardData?.metrics.securityScore || 'loading'}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center"
                  >
                    {isLoading ? (
                      <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData?.metrics.securityScore}%</p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            <div className="text-green-500 dark:text-green-400 font-medium text-sm flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              +8%
            </div>
          </div>
          
          <div className="h-1 w-full bg-gray-100 dark:bg-gray-700 rounded-full mb-1">
            <div className="h-1 bg-green-500 rounded-full" style={{ width: `${dashboardData?.metrics.securityScore || 0}%` }}></div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {(dashboardData?.metrics.securityScore || 0) >= 90 ? 'Excellent' : (dashboardData?.metrics.securityScore || 0) >= 80 ? 'Good' : 'Needs improvement'}
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
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={dashboardData?.metrics.qualityGain || 'loading'}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center"
                  >
                    {isLoading ? (
                      <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">+{dashboardData?.metrics.qualityGain}%</p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            <div className="text-green-500 dark:text-green-400 font-medium text-sm flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              +12%
            </div>
          </div>
          
          <div className="h-1 w-full bg-gray-100 dark:bg-gray-700 rounded-full mb-1">
            <div className="h-1 bg-purple-500 rounded-full" style={{ width: `${Math.min(100, (dashboardData?.metrics.qualityGain || 0) * 2)}%` }}></div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {(dashboardData?.metrics.qualityGain || 0) >= 30 ? 'Exceptional' : (dashboardData?.metrics.qualityGain || 0) >= 20 ? 'Significant' : 'Moderate'} improvement
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-orange-500/10 rounded-full -ml-8 -mb-8"></div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Performance Boost</h3>
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={dashboardData?.metrics.performanceGain || 'loading'}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center"
                  >
                    {isLoading ? (
                      <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">+{dashboardData?.metrics.performanceGain}%</p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            <div className="text-green-500 dark:text-green-400 font-medium text-sm flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              +15%
            </div>
          </div>
          
          <div className="h-1 w-full bg-gray-100 dark:bg-gray-700 rounded-full mb-1">
            <div className="h-1 bg-orange-500 rounded-full" style={{ width: `${Math.min(100, (dashboardData?.metrics.performanceGain || 0) * 2.5)}%` }}></div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {(dashboardData?.metrics.performanceGain || 0) >= 25 ? 'Major' : (dashboardData?.metrics.performanceGain || 0) >= 15 ? 'Significant' : 'Moderate'} optimization
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-red-500/10 rounded-full -ml-8 -mb-8"></div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <CheckCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Bugs Prevented</h3>
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={dashboardData?.metrics.bugsFixed || 'loading'}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center"
                  >
                    {isLoading ? (
                      <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData?.metrics.bugsFixed.toLocaleString()}</p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            <div className="text-green-500 dark:text-green-400 font-medium text-sm flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              +18%
            </div>
          </div>
          
          <div className="h-1 w-full bg-gray-100 dark:bg-gray-700 rounded-full mb-1">
            <div className="h-1 bg-red-500 rounded-full" style={{ width: '85%' }}></div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            85% of potential issues detected
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-indigo-500/10 rounded-full -ml-8 -mb-8"></div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <FileCode className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Lines Refactored</h3>
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={dashboardData?.metrics.linesRefactored || 'loading'}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center"
                  >
                    {isLoading ? (
                      <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData?.metrics.linesRefactored.toLocaleString()}</p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            <div className="text-green-500 dark:text-green-400 font-medium text-sm flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              +22%
            </div>
          </div>
          
          <div className="h-1 w-full bg-gray-100 dark:bg-gray-700 rounded-full mb-1">
            <div className="h-1 bg-indigo-500 rounded-full" style={{ width: '78%' }}></div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            78% code improvement rate
          </div>
        </motion.div>
      </div>

      {/* AI Impact Showcase - Fully Dynamic */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-premium rounded-xl p-6 text-white shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2 flex items-center">
              <Brain className="w-6 h-6 mr-2" />
              AI Impact This Month
            </h3>
            <p className="opacity-90">Transforming development workflows with intelligent automation</p>
          </div>
          <div className="text-right">
            <AnimatePresence mode="wait">
              <motion.div
                key={dashboardData?.impact.costSavings || 'loading'}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-3xl font-bold"
              >
                {isLoading ? (
                  <div className="h-8 w-24 bg-white/20 rounded animate-pulse"></div>
                ) : (
                  `$${dashboardData?.impact.costSavings.toLocaleString()}`
                )}
              </motion.div>
            </AnimatePresence>
            <div className="text-sm opacity-90">Cost Savings</div>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-6 mt-6">
          <div className="text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={dashboardData?.impact.timeSaved || 'loading'}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-2xl font-bold"
              >
                {isLoading ? (
                  <div className="h-8 w-12 bg-white/20 rounded animate-pulse mx-auto"></div>
                ) : (
                  `${dashboardData?.impact.timeSaved}h`
                )}
              </motion.div>
            </AnimatePresence>
            <div className="text-sm opacity-90">Time Saved</div>
          </div>
          <div className="text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={dashboardData?.impact.bugsFixed || 'loading'}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-2xl font-bold"
              >
                {isLoading ? (
                  <div className="h-8 w-16 bg-white/20 rounded animate-pulse mx-auto"></div>
                ) : (
                  dashboardData?.impact.bugsFixed.toLocaleString()
                )}
              </motion.div>
            </AnimatePresence>
            <div className="text-sm opacity-90">Bugs Prevented</div>
          </div>
          <div className="text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={dashboardData?.impact.autoFixRate || 'loading'}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-2xl font-bold"
              >
                {isLoading ? (
                  <div className="h-8 w-12 bg-white/20 rounded animate-pulse mx-auto"></div>
                ) : (
                  `${dashboardData?.impact.autoFixRate}%`
                )}
              </motion.div>
            </AnimatePresence>
            <div className="text-sm opacity-90">Auto-Fixed</div>
          </div>
          <div className="text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={dashboardData?.impact.teamRating || 'loading'}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-2xl font-bold"
              >
                {isLoading ? (
                  <div className="h-8 w-12 bg-white/20 rounded animate-pulse mx-auto"></div>
                ) : (
                  `${dashboardData?.impact.teamRating}★`
                )}
              </motion.div>
            </AnimatePresence>
            <div className="text-sm opacity-90">Team Rating</div>
          </div>
        </div>
      </motion.div>

      {/* Quick Start Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <Zap className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-2" />
          Quick Start - No Login Required
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            onClick={handleStartReview}
            className="p-4 border-2 border-dashed border-primary-300 dark:border-primary-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 transition-colors group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-center">
              <Upload className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-medium text-gray-900 dark:text-white">Upload & Analyze Code</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Drag & drop your files for instant AI analysis
              </p>
            </div>
          </motion.button>

          <motion.button
            onClick={() => navigate('/review?type=security')}
            className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:shadow-md transition-all group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-center">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-medium text-gray-900 dark:text-white">Security Scan</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Find vulnerabilities in seconds
              </p>
            </div>
          </motion.button>

          <motion.button
            onClick={() => navigate('/review?type=performance')}
            className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:shadow-md transition-all group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-center">
              <Zap className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-medium text-gray-900 dark:text-white">Performance Check</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Optimize for speed & efficiency
              </p>
            </div>
          </motion.button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Analysis Speed</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{"< 30 seconds"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Accuracy Rate</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">99.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Languages</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">20+</span>
            </div>
          </div>
        </div>
      </motion.div>

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
          
          {/* Recent Reviews - Dynamic */}
          {isLoading ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <RecentReviews reviews={dashboardData?.reviews || []} />
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions - Dynamic */}
          {isLoading ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <QuickActions repositories={dashboardData?.repositories || []} />
          )}
          
          {/* Security Alerts - Dynamic */}
          {isLoading ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <SecurityAlerts alerts={dashboardData?.securityAlerts || []} />
          )}
          
          {/* Team Activity - Dynamic */}
          {isLoading ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <TeamActivity activities={dashboardData?.teamActivity || []} />
          )}
        </div>
      </div>

      {/* Recent Projects - Dynamic */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <GitBranch className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
            Recent Projects
          </h3>
          <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center">
            View all
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dashboardData?.repositories.map((repo, index) => (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 transition-all cursor-pointer"
                whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <GitBranch className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{repo.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{repo.language}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Last scan: Today</span>
                  <span className={`px-2 py-1 rounded-full ${
                    repo.isPrivate 
                      ? 'bg-gray-100 dark:bg-gray-700' 
                      : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  }`}>
                    {repo.isPrivate ? 'Private' : 'Public'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
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
  Target,
  Rocket,
  Award,
  Upload,
  Play,
  ArrowRight,
  Star,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { codeReviewService } from '../services/codeReviewService';
import MetricCard from '../components/Dashboard/MetricCard';
import RecentReviews from '../components/Dashboard/RecentReviews';
import QualityTrends from '../components/Dashboard/QualityTrends';
import SecurityAlerts from '../components/Dashboard/SecurityAlerts';
import TeamActivity from '../components/Dashboard/TeamActivity';
import QuickActions from '../components/Dashboard/QuickActions';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'1d' | '7d' | '30d' | '90d'>('7d');

  // Mock impressive data for demo
  const mockRepositories = [
    {
      id: '1',
      name: 'e-commerce-platform',
      provider: 'github',
      language: 'TypeScript',
      isPrivate: false,
      lastSync: new Date(),
      status: 'active' as const
    },
    {
      id: '2', 
      name: 'payment-service',
      provider: 'github',
      language: 'Python',
      isPrivate: true,
      lastSync: new Date(),
      status: 'active' as const
    },
    {
      id: '3',
      name: 'mobile-app',
      provider: 'github', 
      language: 'React Native',
      isPrivate: true,
      lastSync: new Date(),
      status: 'active' as const
    }
  ];

  const mockRecentReviews = [
    {
      id: 'review-1',
      status: 'completed' as const,
      startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      progress: 100,
      summary: {
        issuesFound: 23,
        qualityScore: 89
      }
    },
    {
      id: 'review-2', 
      status: 'running' as const,
      startedAt: new Date(Date.now() - 30 * 60 * 1000),
      progress: 67,
      summary: {
        issuesFound: 0,
        qualityScore: 0
      }
    },
    {
      id: 'review-3',
      status: 'completed' as const,
      startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      progress: 100,
      summary: {
        issuesFound: 15,
        qualityScore: 92
      }
    }
  ];

  const getDashboardMetrics = () => {
    return {
      totalRepositories: mockRepositories.length,
      activeReviews: mockRecentReviews.filter(r => r.status === 'running').length,
      securityIssues: 8,
      qualityScore: 87,
      trendsData: {
        quality: [82, 84, 85, 87, 86, 89, 87],
        security: [88, 90, 92, 91, 93, 94, 95],
        performance: [75, 77, 79, 81, 80, 83, 85]
      }
    };
  };

  const dashboardMetrics = getDashboardMetrics();

  const handleStartReview = () => {
    navigate('/review');
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
          
          <motion.div
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4" />
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
              <Rocket className="w-7 h-7 mr-3" />
              Start Your AI Code Review
            </h2>
            <p className="text-blue-100 mb-4 text-lg">
              Upload your code and get instant AI-powered analysis with ChatGPT-4
            </p>
            <div className="flex items-center space-x-6 text-sm text-blue-100">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>{'< 30 seconds'}</span>
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

      {/* Enhanced Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Repositories Connected"
          value={dashboardMetrics.totalRepositories}
          icon={GitBranch}
          color="blue"
          trend={{ value: 25, direction: 'up' }}
        />
        
        <MetricCard
          title="Active AI Reviews"
          value={dashboardMetrics.activeReviews}
          icon={Brain}
          color="purple"
          trend={{ value: 15, direction: 'up' }}
        />
        
        <MetricCard
          title="Security Score"
          value={`${95}%`}
          icon={Shield}
          color="green"
          trend={{ value: 8, direction: 'up' }}
        />
        
        <MetricCard
          title="Quality Improvement"
          value={`+${34}%`}
          icon={TrendingUp}
          color="orange"
          trend={{ value: 12, direction: 'up' }}
        />
      </div>

      {/* AI Impact Showcase */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-premium rounded-xl p-6 text-white shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2 flex items-center">
              <Target className="w-6 h-6 mr-2" />
              AI Impact This Month
            </h3>
            <p className="opacity-90">Transforming development workflows with intelligent automation</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">$12,400</div>
            <div className="text-sm opacity-90">Cost Savings</div>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-6 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold">156h</div>
            <div className="text-sm opacity-90">Time Saved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">1,247</div>
            <div className="text-sm opacity-90">Bugs Prevented</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">89%</div>
            <div className="text-sm opacity-90">Auto-Fixed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">4.9★</div>
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
          <Play className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-2" />
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
              <span className="text-sm font-medium text-gray-900 dark:text-white">{'< 30 seconds'}</span>
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
          <QualityTrends data={dashboardMetrics.trendsData} />
          <RecentReviews reviews={mockRecentReviews} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <QuickActions repositories={mockRepositories} />
          <SecurityAlerts />
          <TeamActivity />
        </div>
      </div>

      {/* Revenue Potential Showcase */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Target className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
          Revenue Impact Projection
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">$600K</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Annual Revenue Potential</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Indie hacker dream 🚀</div>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">50M+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Developers Worldwide</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Total addressable market</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">$10B</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Market Opportunity</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Code review automation</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
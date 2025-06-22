import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Shield, 
  Zap, 
  Users, 
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { codeReviewService } from '../services/codeReviewService';
import MetricsDashboard from '../components/Analytics/MetricsDashboard';
import QualityTrends from '../components/Dashboard/QualityTrends';
import SecurityOverview from '../components/Analytics/SecurityOverview';
import PerformanceMetrics from '../components/Analytics/PerformanceMetrics';
import TeamInsights from '../components/Analytics/TeamInsights';
import ComplianceReport from '../components/Analytics/ComplianceReport';

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedRepository, setSelectedRepository] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'quality' | 'security' | 'performance' | 'team' | 'compliance'>('overview');

  const { data: repositories } = useQuery(
    'repositories',
    codeReviewService.getRepositories
  );

  const { data: analyticsData, isLoading } = useQuery(
    ['analytics', timeRange, selectedRepository],
    () => getAnalyticsData(timeRange, selectedRepository),
    { staleTime: 5 * 60 * 1000 }
  );

  const getAnalyticsData = async (range: string, repoId: string) => {
    // This would be implemented in the service
    return {
      overview: {
        totalReviews: 156,
        averageQuality: 87,
        securityIssues: 23,
        performanceGains: 15,
        timeRange: range
      },
      trends: {
        quality: generateTrendData(range),
        security: generateTrendData(range),
        performance: generateTrendData(range)
      },
      repositories: repositories?.map(repo => ({
        ...repo,
        metrics: {
          quality: Math.floor(Math.random() * 30) + 70,
          security: Math.floor(Math.random() * 20) + 80,
          performance: Math.floor(Math.random() * 25) + 75
        }
      })) || []
    };
  };

  const generateTrendData = (range: string) => {
    const points = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    return Array.from({ length: points }, (_, i) => ({
      date: new Date(Date.now() - (points - i) * 24 * 60 * 60 * 1000),
      value: Math.floor(Math.random() * 20) + 80
    }));
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'quality', label: 'Quality', icon: TrendingUp },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'performance', label: 'Performance', icon: Zap },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'compliance', label: 'Compliance', icon: Calendar }
  ] as const;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive insights into your code quality and team performance
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedRepository}
            onChange={(e) => setSelectedRepository(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Repositories</option>
            {repositories?.map(repo => (
              <option key={repo.id} value={repo.id}>{repo.name}</option>
            ))}
          </select>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>

          <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && (
          <MetricsDashboard data={analyticsData} />
        )}

        {activeTab === 'quality' && (
          <QualityTrends data={analyticsData?.trends} />
        )}

        {activeTab === 'security' && (
          <SecurityOverview data={analyticsData} />
        )}

        {activeTab === 'performance' && (
          <PerformanceMetrics data={analyticsData} />
        )}

        {activeTab === 'team' && (
          <TeamInsights data={analyticsData} />
        )}

        {activeTab === 'compliance' && (
          <ComplianceReport data={analyticsData} />
        )}
      </motion.div>
    </div>
  );
};

export default Analytics;
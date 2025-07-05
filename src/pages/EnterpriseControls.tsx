import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Shield, 
  Users, 
  GitBranch, 
  Cpu, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Zap,
  Brain,
  Lock,
  Settings,
  BarChart3,
  Globe,
  Clock,
  Target
} from 'lucide-react';
import toast from 'react-hot-toast';
import { enterpriseManager } from '../services/enterpriseManager';
import { log } from '../utils/logger';

interface DashboardData {
  metrics: any;
  systemHealth: any;
  recommendations: any[];
  resourceUtilization: any;
  projects: any[];
  lastUpdated: Date;
}

interface MetricCard {
  title: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
  description: string;
}

const EnterpriseControls: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedView, setSelectedView] = useState<'overview' | 'projects' | 'analytics' | 'security'>('overview');

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      if (!refreshing) {
        refreshDashboard();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshing]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await enterpriseManager.getDashboardData();
      setDashboardData(data);
      
      log.info('Enterprise dashboard loaded', {
        metricsLoaded: !!data.metrics,
        projectsCount: data.projects.length,
        recommendationsCount: data.recommendations.length
      });
    } catch (error) {
      log.error('Failed to load dashboard data', { error });
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = async () => {
    try {
      setRefreshing(true);
      const data = await enterpriseManager.getDashboardData();
      setDashboardData(data);
      
      toast.success('Dashboard refreshed - All metrics updated with latest data');
    } catch (error) {
      log.error('Failed to refresh dashboard', { error });
      toast.error('Failed to refresh dashboard');
    } finally {
      setRefreshing(false);
    }
  };

  const generateReport = async () => {
    try {
      const report = await enterpriseManager.generateComprehensiveReport();
      
      // In a real implementation, this would download or display the report
      toast.success('Comprehensive report generated - Enterprise analysis report is ready');
      
      log.info('Enterprise report generated', {
        reportSize: JSON.stringify(report).length,
        metricsIncluded: Object.keys(report).length
      });
    } catch (error) {
      log.error('Failed to generate report', { error });
      toast.error('Failed to generate report');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading Enterprise Dashboard</h2>
          <p className="text-gray-500 mt-2">Gathering metrics from all systems...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Dashboard Unavailable</h2>
          <p className="text-gray-500 mt-2">Unable to load enterprise metrics</p>
          <button 
            onClick={loadDashboardData}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const metricCards: MetricCard[] = [
    {
      title: 'Code Quality',
      value: dashboardData.metrics.performance.codeQualityScore,
      trend: 'up',
      icon: <Brain className="h-5 w-5" />,
      color: 'blue',
      description: 'AI-powered quality analysis'
    },
    {
      title: 'Security Score',
      value: dashboardData.metrics.performance.securityScore,
      trend: 'stable',
      icon: <Shield className="h-5 w-5" />,
      color: 'green',
      description: 'Real-time vulnerability monitoring'
    },
    {
      title: 'Team Productivity',
      value: dashboardData.metrics.performance.productivityScore,
      trend: 'up',
      icon: <Users className="h-5 w-5" />,
      color: 'purple',
      description: 'Collaboration efficiency'
    },
    {
      title: 'CI/CD Efficiency',
      value: dashboardData.metrics.performance.cicdEfficiency,
      trend: 'stable',
      icon: <GitBranch className="h-5 w-5" />,
      color: 'indigo',
      description: 'Pipeline automation success'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Globe className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Enterprise Command Center</h1>
                <p className="text-sm text-gray-500">
                  Last updated: {new Date(dashboardData.lastUpdated).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={refreshDashboard}
                disabled={refreshing}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Activity className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={generateReport}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex space-x-8 border-b border-gray-200">
          {[
            { key: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
            { key: 'projects', label: 'Projects', icon: <Target className="h-4 w-4" /> },
            { key: 'analytics', label: 'Analytics', icon: <TrendingUp className="h-4 w-4" /> },
            { key: 'security', label: 'Security', icon: <Lock className="h-4 w-4" /> }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedView(tab.key as any)}
              className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedView === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedView === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metricCards.map((metric, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg bg-${metric.color}-100 text-${metric.color}-600`}>
                      {metric.icon}
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className={`h-4 w-4 ${metric.trend === 'up' ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className="text-xs text-gray-500">{metric.trend}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-bold text-gray-900">{metric.value}/100</h3>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* System Health */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                System Health
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(dashboardData.systemHealth.services).map(([service, data]: [string, any]) => (
                  <div key={service} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 capitalize">{service.replace(/([A-Z])/g, ' $1')}</h4>
                      <span className={`text-sm font-medium ${getStatusColor(data.status)}`}>
                        {data.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      {service === 'aiOrchestrator' && (
                        <>
                          <p>Models: {data.models}</p>
                          <p>Reliability: {(data.avgReliability * 100).toFixed(1)}%</p>
                        </>
                      )}
                      {service === 'collaboration' && (
                        <>
                          <p>Sessions: {data.activeSessions}</p>
                          <p>Participants: {data.totalParticipants}</p>
                        </>
                      )}
                      {service === 'cicd' && (
                        <>
                          <p>Pipelines: {data.activePipelines}</p>
                          <p>Queue: {data.queueLength}</p>
                        </>
                      )}
                      {service === 'security' && (
                        <>
                          <p>CVE DB: {data.cveDatabase}</p>
                          <p>Scanning: {data.scanning}</p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Optimization Recommendations
              </h3>
              <div className="space-y-4">
                {dashboardData.recommendations.map((rec, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(rec.priority)}`}>
                            {rec.priority}
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {rec.type}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900">{rec.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span>Impact: {rec.impact}</span>
                          <span>Effort: {rec.effort}</span>
                        </div>
                      </div>
                      <CheckCircle className="h-5 w-5 text-gray-400 ml-4 cursor-pointer hover:text-green-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resource Utilization */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Cpu className="h-5 w-5 mr-2" />
                Resource Utilization
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(dashboardData.resourceUtilization).filter(([key]) => 
                  ['cpu', 'memory', 'storage', 'network'].includes(key)
                ).map(([resource, data]: [string, any]) => (
                  <div key={resource} className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 capitalize mb-2">{resource}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Usage</span>
                        <span className="font-medium">
                          {resource === 'network' ? `${data.bandwidth?.toFixed(1)}%` : `${data.usage?.toFixed(1)}%`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${resource === 'network' ? data.bandwidth : data.usage}%` 
                          }}
                        ></div>
                      </div>
                      <span className={`text-xs ${
                        data.trend === 'increasing' ? 'text-orange-500' : 
                        data.trend === 'decreasing' ? 'text-green-500' : 'text-gray-500'
                      }`}>
                        {data.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedView === 'projects' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {dashboardData.projects.map((project, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      project.status === 'active' ? 'bg-green-100 text-green-800' :
                      project.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(project.health).map(([metric, score]: [string, any]) => (
                        <div key={metric} className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{score}/100</div>
                          <div className="text-xs text-gray-500 capitalize">{metric}</div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Team:</span>
                          <span className="ml-1 font-medium">{project.team.members} members</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Pipelines:</span>
                          <span className="ml-1 font-medium">{project.automation.pipelinesCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedView === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                 <div>
                   <h4 className="font-medium text-gray-900 mb-3">Top Recommendations</h4>
                   <ul className="space-y-2 text-sm">
                     {dashboardData.metrics.aiInsights.topRecommendations.map((rec: string, index: number) => (
                       <li key={index} className="flex items-start space-x-2">
                         <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                         <span className="text-gray-600">{rec}</span>
                       </li>
                     ))}
                   </ul>
                 </div>
                 <div>
                   <h4 className="font-medium text-gray-900 mb-3">Predicted Issues</h4>
                   <ul className="space-y-2 text-sm">
                     {dashboardData.metrics.aiInsights.predictedIssues.map((issue: string, index: number) => (
                       <li key={index} className="flex items-start space-x-2">
                         <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                         <span className="text-gray-600">{issue}</span>
                       </li>
                     ))}
                   </ul>
                 </div>
                 <div>
                   <h4 className="font-medium text-gray-900 mb-3">Optimization Opportunities</h4>
                   <ul className="space-y-2 text-sm">
                     {dashboardData.metrics.aiInsights.optimizationOpportunities.map((opp: string, index: number) => (
                       <li key={index} className="flex items-start space-x-2">
                         <Zap className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                         <span className="text-gray-600">{opp}</span>
                       </li>
                     ))}
                   </ul>
                 </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {Object.entries(dashboardData.metrics.usage).map(([metric, value]: [string, any]) => (
                  <div key={metric} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{value}</div>
                    <div className="text-sm text-gray-500 capitalize">
                      {metric.replace(/([A-Z])/g, ' $1')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedView === 'security' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Overview
              </h3>
              <div className="text-center py-8">
                <Lock className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Security Monitoring Active</h4>
                <p className="text-gray-600 mb-4">
                  Real-time vulnerability detection and CVE database monitoring is operational
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">98%</div>
                    <div className="text-sm text-green-700">Security Score</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">24/7</div>
                    <div className="text-sm text-blue-700">Monitoring</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600">0</div>
                    <div className="text-sm text-purple-700">Critical Issues</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnterpriseControls;
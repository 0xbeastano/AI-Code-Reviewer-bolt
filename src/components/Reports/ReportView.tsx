import React, { useState } from 'react';
import { Download, FileText, TrendingUp, Shield, Zap, Eye, Wrench, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { ReviewReport, AnalysisResult, CodeFile } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ReportViewProps {
  report: ReviewReport;
  originalFiles: CodeFile[];
  improvedFiles: CodeFile[];
  analysisResults: AnalysisResult[];
  onExportReport: () => void;
  onDownloadImprovedCode: () => void;
}

const ReportView: React.FC<ReportViewProps> = ({
  report,
  originalFiles,
  improvedFiles,
  analysisResults,
  onExportReport,
  onDownloadImprovedCode,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'changes' | 'recommendations'>('overview');

  const metricsData = [
    { name: 'Security', before: report.metrics.before.security, after: report.metrics.after.security },
    { name: 'Performance', before: report.metrics.before.performance, after: report.metrics.after.performance },
    { name: 'Maintainability', before: report.metrics.before.maintainability, after: report.metrics.after.maintainability },
    { name: 'Complexity', before: 100 - report.metrics.before.complexity, after: 100 - report.metrics.after.complexity },
  ];

  const issueTypes = analysisResults.reduce((acc, result) => {
    result.issues.forEach(issue => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(issueTypes).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count,
  }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Code Review Report
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive analysis results and improvement summary
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Files Processed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{report.summary.analyzedFiles}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-warning-600 dark:text-warning-400" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Issues Fixed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {report.summary.issuesFixed}/{report.summary.issuesFound}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-success-600 dark:text-success-400" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Improvement</p>
              <p className="text-2xl font-bold text-success-600 dark:text-success-400">
                +{report.metrics.improvement}%
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Quality Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {report.summary.improvementScore}%
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'metrics', name: 'Metrics', icon: TrendingUp },
              { id: 'changes', name: 'Changes', icon: FileText },
              { id: 'recommendations', name: 'Recommendations', icon: Eye },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab(tab.id as any)}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Metrics Comparison Chart */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quality Metrics Comparison
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metricsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="before" fill="#94A3B8" name="Before" />
                      <Bar dataKey="after" fill="#3B82F6" name="After" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Issue Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Issue Distribution
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Key Improvements
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-success-50 dark:bg-success-900/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-success-600 dark:text-success-400" />
                        <span className="font-medium text-success-800 dark:text-success-200">Security</span>
                      </div>
                      <span className="text-success-600 dark:text-success-400 font-medium">
                        +{report.metrics.after.security - report.metrics.before.security}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Zap className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        <span className="font-medium text-primary-800 dark:text-primary-200">Performance</span>
                      </div>
                      <span className="text-primary-600 dark:text-primary-400 font-medium">
                        +{report.metrics.after.performance - report.metrics.before.performance}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-900/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Wrench className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                        <span className="font-medium text-secondary-800 dark:text-secondary-200">Maintainability</span>
                      </div>
                      <span className="text-secondary-600 dark:text-secondary-400 font-medium">
                        +{report.metrics.after.maintainability - report.metrics.before.maintainability}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'changes' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                File Changes Summary
              </h3>
              <div className="space-y-4">
                {report.changes.map((change) => (
                  <div
                    key={change.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`px-2 py-1 text-xs font-medium rounded ${
                          change.type === 'modified' 
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                            : change.type === 'added'
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                        }`}>
                          {change.type.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {change.filePath}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="text-green-600 dark:text-green-400">+{change.linesAdded}</span>
                        <span className="text-red-600 dark:text-red-400">-{change.linesRemoved}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {change.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recommendations for Future Development
              </h3>
              <div className="space-y-4">
                {report.recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                  >
                    <p className="text-gray-800 dark:text-gray-200">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 mt-8">
        <button
          onClick={onExportReport}
          className="flex items-center px-6 py-3 bg-secondary-600 hover:bg-secondary-700 text-white font-medium rounded-lg transition-colors duration-200"
        >
          <Download className="w-5 h-5 mr-2" />
          Export Report
        </button>
        <button
          onClick={onDownloadImprovedCode}
          className="flex items-center px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200"
        >
          <Download className="w-5 h-5 mr-2" />
          Download Improved Code
        </button>
      </div>
    </div>
  );
};

export default ReportView;
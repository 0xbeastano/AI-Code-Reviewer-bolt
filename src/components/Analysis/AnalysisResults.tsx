import React, { useState } from 'react';
import { FileText, AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown, Eye, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnalysisResult, Issue, QualityMetrics } from '../../types';
import CodeEditor from '../CodeEditor/CodeEditor';

interface AnalysisResultsProps {
  results: AnalysisResult[];
  onStartImprovement: () => void;
  onExportReport: () => void;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  results,
  onStartImprovement,
  onExportReport,
}) => {
  const [selectedFile, setSelectedFile] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'metrics' | 'suggestions'>('overview');

  const totalIssues = results.reduce((acc, result) => acc + result.issues.length, 0);
  const criticalIssues = results.reduce((acc, result) => 
    acc + result.issues.filter(issue => issue.severity === 'critical').length, 0
  );
  const highIssues = results.reduce((acc, result) => 
    acc + result.issues.filter(issue => issue.severity === 'high').length, 0
  );

  const averageMetrics = results.reduce((acc, result) => {
    Object.keys(result.metrics).forEach(key => {
      if (typeof result.metrics[key as keyof QualityMetrics] === 'number') {
        acc[key as keyof QualityMetrics] = (acc[key as keyof QualityMetrics] || 0) + 
          (result.metrics[key as keyof QualityMetrics] as number);
      }
    });
    return acc;
  }, {} as Partial<QualityMetrics>);

  Object.keys(averageMetrics).forEach(key => {
    if (typeof averageMetrics[key as keyof QualityMetrics] === 'number') {
      (averageMetrics[key as keyof QualityMetrics] as number) = 
        Math.round((averageMetrics[key as keyof QualityMetrics] as number) / results.length);
    }
  });

  const getMetricColor = (value: number, reverse = false) => {
    if (reverse) {
      if (value >= 80) return 'text-error-600 dark:text-error-400';
      if (value >= 60) return 'text-warning-600 dark:text-warning-400';
      return 'text-success-600 dark:text-success-400';
    }
    if (value >= 80) return 'text-success-600 dark:text-success-400';
    if (value >= 60) return 'text-warning-600 dark:text-warning-400';
    return 'text-error-600 dark:text-error-400';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-error-600 dark:text-error-400 bg-error-50 dark:bg-error-900/20';
      case 'high': return 'text-warning-600 dark:text-warning-400 bg-warning-50 dark:bg-warning-900/20';
      case 'medium': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Analysis Complete
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Review the analysis results and apply AI-powered improvements to your codebase
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Files Analyzed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{results.length}</p>
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
            <AlertTriangle className="w-8 h-8 text-warning-600 dark:text-warning-400" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Issues</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalIssues}</p>
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
            <TrendingUp className={`w-8 h-8 ${getMetricColor(averageMetrics.maintainability || 0)}`} />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Maintainability</p>
              <p className={`text-2xl font-bold ${getMetricColor(averageMetrics.maintainability || 0)}`}>
                {averageMetrics.maintainability || 0}%
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
            <CheckCircle className={`w-8 h-8 ${getMetricColor(averageMetrics.security || 0)}`} />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Security Score</p>
              <p className={`text-2xl font-bold ${getMetricColor(averageMetrics.security || 0)}`}>
                {averageMetrics.security || 0}%
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* File List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analyzed Files</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {results.map((result) => (
              <button
                key={result.fileId}
                className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 transition-colors ${
                  selectedFile?.fileId === result.fileId ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                }`}
                onClick={() => setSelectedFile(result)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {result.filePath.split('/').pop()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {result.issues.length > 0 && (
                      <span className="px-2 py-1 text-xs bg-warning-100 dark:bg-warning-900/20 text-warning-700 dark:text-warning-400 rounded">
                        {result.issues.length}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                  {result.filePath}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* File Details */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          {selectedFile ? (
            <>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedFile.filePath}
                  </h3>
                  <div className="flex space-x-2">
                    {['overview', 'issues', 'metrics', 'suggestions'].map((tab) => (
                      <button
                        key={tab}
                        className={`px-3 py-1 text-sm font-medium rounded ${
                          activeTab === tab
                            ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                        onClick={() => setActiveTab(tab as any)}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Issues Found</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {selectedFile.issues.length}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Suggestions</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {selectedFile.suggestions.length}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Quality Metrics</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(selectedFile.metrics).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className={`text-sm font-medium ${
                              typeof value === 'number' && key !== 'duplicateLines' && key !== 'linesOfCode'
                                ? getMetricColor(value, key === 'complexity')
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {typeof value === 'number' && key !== 'duplicateLines' && key !== 'linesOfCode' 
                                ? `${value}%` 
                                : value
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'issues' && (
                  <div className="space-y-4">
                    {selectedFile.issues.length > 0 ? (
                      selectedFile.issues.map((issue) => (
                        <div key={issue.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(issue.severity)}`}>
                                  {issue.severity.toUpperCase()}
                                </span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {issue.type}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                {issue.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Line {issue.line}, Column {issue.column} • Rule: {issue.rule}
                              </p>
                              {issue.suggestion && (
                                <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                                  💡 {issue.suggestion}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">No issues found in this file!</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'suggestions' && (
                  <div className="space-y-4">
                    {selectedFile.suggestions.map((suggestion) => (
                      <div key={suggestion.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {suggestion.description}
                            </h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-2 py-1 text-xs font-medium rounded ${
                                suggestion.priority === 'high' 
                                  ? 'bg-error-100 dark:bg-error-900/20 text-error-700 dark:text-error-400'
                                  : suggestion.priority === 'medium'
                                  ? 'bg-warning-100 dark:bg-warning-900/20 text-warning-700 dark:text-warning-400'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                              }`}>
                                {suggestion.priority.toUpperCase()}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {suggestion.type}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Before</p>
                            <CodeEditor
                              value={suggestion.before}
                              language="javascript"
                              height="80px"
                              readOnly
                            />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">After</p>
                            <CodeEditor
                              value={suggestion.after}
                              language="javascript"
                              height="80px"
                              readOnly
                            />
                          </div>
                        </div>
                        
                        <p className="text-sm text-green-600 dark:text-green-400 mt-3">
                          ✨ {suggestion.impact}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Select a file from the list to view detailed analysis results
              </p>
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
          onClick={onStartImprovement}
          className="flex items-center px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200"
        >
          <TrendingUp className="w-5 h-5 mr-2" />
          Improve Codebase
        </button>
      </div>
    </div>
  );
};

export default AnalysisResults;
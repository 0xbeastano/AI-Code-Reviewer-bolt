import React, { useState } from 'react';
import { FileText, AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown, Eye, Download, Code, Zap, Shield, FileCode } from 'lucide-react';
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
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-20 h-20 bg-gradient-ai rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </motion.div>
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
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-12 -mt-12"></div>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Files Analyzed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{results.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full -mr-12 -mt-12"></div>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Issues</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalIssues}</p>
                {criticalIssues > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full">
                    {criticalIssues} critical
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full -mr-12 -mt-12"></div>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className={`w-6 h-6 ${getMetricColor(averageMetrics.maintainability || 0)}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Maintainability</p>
              <p className={`text-2xl font-bold ${getMetricColor(averageMetrics.maintainability || 0)}`}>
                {averageMetrics.maintainability || 0}%
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full -mr-12 -mt-12"></div>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Shield className={`w-6 h-6 ${getMetricColor(averageMetrics.security || 0)}`} />
            </div>
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <FileCode className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
              Analyzed Files
            </h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {results.map((result) => (
              <motion.button
                key={result.fileId}
                className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 transition-colors ${
                  selectedFile?.fileId === result.fileId ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                }`}
                onClick={() => setSelectedFile(result)}
                whileHover={{ x: 4 }}
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
              </motion.button>
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
                      <motion.div 
                        className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <AlertTriangle className="w-5 h-5 text-warning-600 dark:text-warning-400" />
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Issues Found</p>
                        </div>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {selectedFile.issues.length}
                        </p>
                        <div className="mt-2 flex space-x-2">
                          {selectedFile.issues.filter(i => i.severity === 'critical').length > 0 && (
                            <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full">
                              {selectedFile.issues.filter(i => i.severity === 'critical').length} critical
                            </span>
                          )}
                          {selectedFile.issues.filter(i => i.severity === 'high').length > 0 && (
                            <span className="px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-full">
                              {selectedFile.issues.filter(i => i.severity === 'high').length} high
                            </span>
                          )}
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Suggestions</p>
                        </div>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {selectedFile.suggestions.length}
                        </p>
                        <div className="mt-2 flex space-x-2">
                          {selectedFile.suggestions.filter(s => s.priority === 'high').length > 0 && (
                            <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full">
                              {selectedFile.suggestions.filter(s => s.priority === 'high').length} high priority
                            </span>
                          )}
                        </div>
                      </motion.div>
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
                        <motion.div
                          key={issue.id}
                          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                        >
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
                        </motion.div>
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
                    {selectedFile.suggestions.length > 0 ? (
                      selectedFile.suggestions.map((suggestion) => (
                        <motion.div
                          key={suggestion.id}
                          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                        >
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
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">No suggestions available for this file</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'metrics' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <motion.div 
                        className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/10 dark:to-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Security</p>
                        </div>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {selectedFile.metrics.security}%
                        </p>
                      </motion.div>
                      
                      <motion.div 
                        className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Performance</p>
                        </div>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {selectedFile.metrics.performance}%
                        </p>
                      </motion.div>
                      
                      <motion.div 
                        className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/10 dark:to-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <Code className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Maintainability</p>
                        </div>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {selectedFile.metrics.maintainability}%
                        </p>
                      </motion.div>
                      
                      <motion.div 
                        className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/10 dark:to-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <Eye className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Complexity</p>
                        </div>
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                          {selectedFile.metrics.complexity}%
                        </p>
                      </motion.div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Detailed Metrics</h4>
                      <div className="space-y-3">
                        {Object.entries(selectedFile.metrics).map(([key, value]) => (
                          <div key={key} className="flex items-center">
                            <div className="w-1/3 text-sm text-gray-600 dark:text-gray-400 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                            <div className="w-2/3">
                              <div className="flex items-center">
                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                                  {typeof value === 'number' && key !== 'duplicateLines' && key !== 'linesOfCode' && (
                                    <div 
                                      className={`h-2 rounded-full ${
                                        key === 'complexity' 
                                          ? 'bg-yellow-500' 
                                          : key === 'security'
                                          ? 'bg-green-500'
                                          : key === 'performance'
                                          ? 'bg-blue-500'
                                          : 'bg-purple-500'
                                      }`}
                                      style={{ width: `${key === 'complexity' ? 100 - value : value}%` }}
                                    ></div>
                                  )}
                                </div>
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
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
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
        <motion.button
          onClick={onExportReport}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium rounded-lg transition-colors duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Download className="w-5 h-5 mr-2" />
          Export Report
        </motion.button>
        <motion.button
          onClick={onStartImprovement}
          className="flex items-center px-8 py-3 bg-gradient-ai hover:opacity-90 text-white font-medium rounded-lg transition-colors duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <TrendingUp className="w-5 h-5 mr-2" />
          Improve Codebase
        </motion.button>
      </div>
    </div>
  );
};

export default AnalysisResults;
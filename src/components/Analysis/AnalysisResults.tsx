import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  AlertTriangle, 
  CheckSquare, 
  TrendingUp, 
  Download, 
  Share2, 
  Code, 
  Eye, 
  Shield, 
  Zap, 
  ArrowLeft,
  FileCode,
  Sparkles,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Brain
} from 'lucide-react';
import { AnalysisResult } from '../../types';
import { VirtualizedFileList } from '../CodeReview/VirtualizedFileList';
import CodeReviewPanel from '../CodeReview/CodeReviewPanel';
import MonacoDiffViewer from '../CodeReview/MonacoDiffViewer';
import toast from 'react-hot-toast';

interface AnalysisResultsProps {
  results: AnalysisResult[];
  onStartImprovement?: () => void;
  onExportReport?: () => void;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  results,
  onStartImprovement,
  onExportReport
}) => {
  const [selectedFileId, setSelectedFileId] = useState<string | undefined>(
    results.length > 0 ? results[0].fileId : undefined
  );
  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'suggestions' | 'metrics'>('overview');
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());
  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);

  const selectedFile = results.find(result => result.fileId === selectedFileId);

  const totalIssues = results.reduce((acc, result) => acc + result.issues.length, 0);
  const totalSuggestions = results.reduce((acc, result) => acc + result.suggestions.length, 0);
  
  // Calculate average metrics
  const avgMetrics = results.reduce(
    (acc, result) => {
      acc.security += result.metrics.security || 0;
      acc.performance += result.metrics.performance || 0;
      acc.maintainability += result.metrics.maintainability || 0;
      acc.complexity += result.metrics.complexity || 0;
      return acc;
    },
    { security: 0, performance: 0, maintainability: 0, complexity: 0 }
  );
  
  const resultsCount = results.length;
  if (resultsCount > 0) {
    avgMetrics.security = Math.round(avgMetrics.security / resultsCount);
    avgMetrics.performance = Math.round(avgMetrics.performance / resultsCount);
    avgMetrics.maintainability = Math.round(avgMetrics.maintainability / resultsCount);
    avgMetrics.complexity = Math.round(avgMetrics.complexity / resultsCount);
  }

  const handleSelectFile = (file: AnalysisResult) => {
    setSelectedFileId(file.fileId);
  };

  const toggleIssue = (issueId: string) => {
    setExpandedIssues(prev => {
      const newSet = new Set(prev);
      if (newSet.has(issueId)) {
        newSet.delete(issueId);
      } else {
        newSet.add(issueId);
      }
      return newSet;
    });
  };

  const toggleSuggestion = (suggestionId: string) => {
    setExpandedSuggestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(suggestionId)) {
        newSet.delete(suggestionId);
      } else {
        newSet.add(suggestionId);
      }
      return newSet;
    });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(null), 2000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'high': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'security': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'performance': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'style': return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20';
      case 'bug': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
      case 'smell': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
          whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileCode className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Files Analyzed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{results.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
          whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Issues Found</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalIssues}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
          whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Quality Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgMetrics.maintainability}%</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
          whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Suggestions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSuggestions}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* File List */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
              Files
            </h3>
          </div>
          <div className="h-[600px]">
            <VirtualizedFileList
              files={results}
              selectedFileId={selectedFileId}
              onSelectFile={handleSelectFile}
            />
          </div>
        </div>

        {/* Analysis Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-4 px-6" aria-label="Tabs">
                {[
                  { id: 'overview', name: 'Overview', icon: Eye },
                  { id: 'issues', name: 'Issues', icon: AlertTriangle, count: selectedFile?.issues.length },
                  { id: 'suggestions', name: 'Suggestions', icon: Sparkles, count: selectedFile?.suggestions.length },
                  { id: 'metrics', name: 'Metrics', icon: TrendingUp }
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
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {selectedFile ? (
                <motion.div
                  key={`${selectedFileId}-${activeTab}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-6"
                >
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                          <FileCode className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
                          {selectedFile.filePath}
                        </h3>
                      </div>

                      {/* AI Summary */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-lg p-6 border border-blue-200 dark:border-blue-800"
                      >
                        <div className="flex items-start space-x-4">
                          <motion.div 
                            className="p-3 bg-gradient-ai rounded-lg"
                            animate={{ 
                              rotate: [0, 5, 0, -5, 0],
                              scale: [1, 1.05, 1]
                            }}
                            transition={{ 
                              duration: 3,
                              repeat: Infinity,
                              repeatType: "reverse"
                            }}
                          >
                            <Brain className="w-6 h-6 text-white" />
                          </motion.div>
                          <div>
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                              AI Analysis Summary
                            </h4>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300">
                              <p>
                                This file has {selectedFile.issues.length} issues and {selectedFile.suggestions.length} suggestions for improvement. 
                                The overall quality score is {selectedFile.metrics.maintainability}%.
                              </p>
                              
                              {selectedFile.issues.length > 0 && (
                                <div>
                                  <p className="font-medium">Key issues:</p>
                                  <ul className="list-disc pl-5 space-y-1">
                                    {selectedFile.issues.slice(0, 3).map((issue, index) => (
                                      <motion.li 
                                        key={issue.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                      >
                                        {issue.message} (line {issue.line})
                                      </motion.li>
                                    ))}
                                    {selectedFile.issues.length > 3 && (
                                      <li>
                                        <button 
                                          onClick={() => setActiveTab('issues')}
                                          className="text-primary-600 dark:text-primary-400 hover:underline"
                                        >
                                          View {selectedFile.issues.length - 3} more issues...
                                        </button>
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              )}
                              
                              {selectedFile.suggestions.length > 0 && (
                                <div>
                                  <p className="font-medium">Improvement suggestions:</p>
                                  <ul className="list-disc pl-5 space-y-1">
                                    {selectedFile.suggestions.slice(0, 2).map((suggestion, index) => (
                                      <motion.li 
                                        key={suggestion.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 + 0.3 }}
                                      >
                                        {suggestion.description}
                                      </motion.li>
                                    ))}
                                    {selectedFile.suggestions.length > 2 && (
                                      <li>
                                        <button 
                                          onClick={() => setActiveTab('suggestions')}
                                          className="text-primary-600 dark:text-primary-400 hover:underline"
                                        >
                                          View {selectedFile.suggestions.length - 2} more suggestions...
                                        </button>
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Metrics Overview */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <motion.div 
                          className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          whileHover={{ y: -2 }}
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Security</h4>
                          </div>
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${selectedFile.metrics.security || 0}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {selectedFile.metrics.security || 0}%
                            </span>
                          </div>
                        </motion.div>

                        <motion.div 
                          className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          whileHover={{ y: -2 }}
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Performance</h4>
                          </div>
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${selectedFile.metrics.performance || 0}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {selectedFile.metrics.performance || 0}%
                            </span>
                          </div>
                        </motion.div>

                        <motion.div 
                          className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                          whileHover={{ y: -2 }}
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Maintainability</h4>
                          </div>
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full" 
                                style={{ width: `${selectedFile.metrics.maintainability || 0}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {selectedFile.metrics.maintainability || 0}%
                            </span>
                          </div>
                        </motion.div>
                      </div>

                      {/* Code Preview */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                          <Code className="w-4 h-4 text-primary-600 dark:text-primary-400 mr-2" />
                          Code Preview
                        </h4>
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                          <CodeReviewPanel
                            filePath={selectedFile.filePath}
                            code={selectedFile.fileContent || '// File content not available'}
                            language={selectedFile.filePath.split('.').pop() || 'text'}
                            issues={selectedFile.issues}
                            suggestions={selectedFile.suggestions}
                            metrics={selectedFile.metrics}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'issues' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Issues ({selectedFile.issues.length})
                        </h3>
                        <div className="flex space-x-2">
                          <select className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm">
                            <option>All Severities</option>
                            <option>Critical</option>
                            <option>High</option>
                            <option>Medium</option>
                            <option>Low</option>
                          </select>
                          <select className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm">
                            <option>All Types</option>
                            <option>Security</option>
                            <option>Performance</option>
                            <option>Style</option>
                            <option>Bug</option>
                          </select>
                        </div>
                      </div>
                      
                      {selectedFile.issues.length === 0 ? (
                        <div className="text-center py-12">
                          <CheckSquare className="w-16 h-16 text-green-500 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No Issues Found
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            Great job! No issues were detected in this file.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {selectedFile.issues.map((issue, index) => (
                            <motion.div
                              key={issue.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden"
                            >
                              <div 
                                className="p-4 cursor-pointer"
                                onClick={() => toggleIssue(issue.id)}
                              >
                                <div className="flex items-start">
                                  <div className={`p-2 rounded-lg mr-4 ${getTypeColor(issue.type)}`}>
                                    <AlertTriangle className="w-5 h-5" />
                                  </div>
                                  
                                  <div className="flex-1">
                                    <div className="flex items-center mb-1">
                                      <h4 className="font-medium text-gray-900 dark:text-white">{issue.message}</h4>
                                      <motion.span 
                                        className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getSeverityColor(issue.severity)}`}
                                        whileHover={{ scale: 1.1 }}
                                      >
                                        {issue.severity.toUpperCase()}
                                      </motion.span>
                                      <motion.span 
                                        className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getTypeColor(issue.type)}`}
                                        whileHover={{ scale: 1.1 }}
                                      >
                                        {issue.type}
                                      </motion.span>
                                    </div>
                                    
                                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                      <FileText className="w-3 h-3 mr-1" />
                                      <span>{selectedFile.filePath}</span>
                                      <span className="mx-1">•</span>
                                      <span>Line {issue.line}, Column {issue.column}</span>
                                    </div>
                                  </div>
                                  
                                  {expandedIssues.has(issue.id) ? (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                  ) : (
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                  )}
                                </div>
                              </div>
                              
                              <AnimatePresence>
                                {expandedIssues.has(issue.id) && (
                                  <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="px-4 pb-4"
                                  >
                                    <div className="ml-11">
                                      <div className="mb-3">
                                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                          Suggestion
                                        </h5>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                          {issue.suggestion || 'No specific suggestion provided.'}
                                        </p>
                                      </div>
                                      
                                      <div>
                                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                          Rule
                                        </h5>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                          {issue.rule}
                                        </p>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'suggestions' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Suggestions ({selectedFile.suggestions.length})
                        </h3>
                        <div className="flex space-x-2">
                          <select className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm">
                            <option>All Types</option>
                            <option>Refactor</option>
                            <option>Optimize</option>
                            <option>Security</option>
                            <option>Style</option>
                          </select>
                          <select className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm">
                            <option>All Priorities</option>
                            <option>High</option>
                            <option>Medium</option>
                            <option>Low</option>
                          </select>
                        </div>
                      </div>
                      
                      {selectedFile.suggestions.length === 0 ? (
                        <div className="text-center py-12">
                          <CheckSquare className="w-16 h-16 text-green-500 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No Suggestions Available
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            There are no improvement suggestions for this file.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {selectedFile.suggestions.map((suggestion, index) => (
                            <motion.div
                              key={suggestion.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden"
                            >
                              <div 
                                className="p-4 cursor-pointer"
                                onClick={() => toggleSuggestion(suggestion.id)}
                              >
                                <div className="flex items-start">
                                  <div className={`p-2 rounded-lg mr-4 ${getTypeColor(suggestion.type)}`}>
                                    <Sparkles className="w-5 h-5" />
                                  </div>
                                  
                                  <div className="flex-1">
                                    <div className="flex items-center mb-1">
                                      <h4 className="font-medium text-gray-900 dark:text-white">{suggestion.description}</h4>
                                      <motion.span 
                                        className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getPriorityColor(suggestion.priority)}`}
                                        whileHover={{ scale: 1.1 }}
                                      >
                                        {suggestion.priority.toUpperCase()}
                                      </motion.span>
                                      <motion.span 
                                        className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getTypeColor(suggestion.type)}`}
                                        whileHover={{ scale: 1.1 }}
                                      >
                                        {suggestion.type}
                                      </motion.span>
                                    </div>
                                    
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {suggestion.impact}
                                    </p>
                                  </div>
                                  
                                  {expandedSuggestions.has(suggestion.id) ? (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                  ) : (
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                  )}
                                </div>
                              </div>
                              
                              <AnimatePresence>
                                {expandedSuggestions.has(suggestion.id) && (
                                  <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="px-4 pb-4"
                                  >
                                    <div className="ml-11">
                                      <div className="mb-4">
                                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                          Code Comparison
                                        </h5>
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                          <MonacoDiffViewer
                                            original={suggestion.before}
                                            modified={suggestion.after}
                                            language={selectedFile.filePath.split('.').pop() || 'text'}
                                            filename={selectedFile.filePath}
                                            readOnly
                                          />
                                        </div>
                                      </div>
                                      
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={() => handleCopy(suggestion.before, `before-${suggestion.id}`)}
                                          className="flex items-center px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                        >
                                          {copied === `before-${suggestion.id}` ? (
                                            <Check className="w-3 h-3 mr-1" />
                                          ) : (
                                            <Copy className="w-3 h-3 mr-1" />
                                          )}
                                          Copy Original
                                        </button>
                                        <button
                                          onClick={() => handleCopy(suggestion.after, `after-${suggestion.id}`)}
                                          className="flex items-center px-3 py-1 text-xs bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/30 transition-colors"
                                        >
                                          {copied === `after-${suggestion.id}` ? (
                                            <Check className="w-3 h-3 mr-1" />
                                          ) : (
                                            <Copy className="w-3 h-3 mr-1" />
                                          )}
                                          Copy Improved
                                        </button>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'metrics' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Quality Metrics
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          {[
                            { label: 'Complexity', value: selectedFile.metrics.complexity || 0, color: 'blue', isReversed: true },
                            { label: 'Maintainability', value: selectedFile.metrics.maintainability || 0, color: 'green' },
                            { label: 'Security', value: selectedFile.metrics.security || 0, color: 'red' },
                            { label: 'Performance', value: selectedFile.metrics.performance || 0, color: 'yellow' },
                            { label: 'Coverage', value: selectedFile.metrics.coverage || 0, color: 'purple' }
                          ].map((metric) => (
                            <div key={metric.label} className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">{metric.label}</h4>
                                <span className={`text-sm font-medium ${
                                  metric.isReversed
                                    ? metric.value > 80 ? 'text-red-600 dark:text-red-400' : 
                                      metric.value > 60 ? 'text-yellow-600 dark:text-yellow-400' : 
                                      'text-green-600 dark:text-green-400'
                                    : metric.value > 80 ? 'text-green-600 dark:text-green-400' : 
                                      metric.value > 60 ? 'text-yellow-600 dark:text-yellow-400' : 
                                      'text-red-600 dark:text-red-400'
                                }`}>
                                  {metric.value}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <motion.div 
                                  className={`h-2 rounded-full ${
                                    metric.color === 'blue' ? 'bg-blue-600' :
                                    metric.color === 'green' ? 'bg-green-600' :
                                    metric.color === 'red' ? 'bg-red-600' :
                                    metric.color === 'yellow' ? 'bg-yellow-600' :
                                    'bg-purple-600'
                                  }`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${metric.value}%` }}
                                  transition={{ duration: 1 }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="space-y-4">
                          {[
                            { label: 'Lines of Code', value: selectedFile.metrics.linesOfCode || 0, isNumber: true },
                            { label: 'Duplicate Lines', value: selectedFile.metrics.duplicateLines || 0, isNumber: true },
                            { label: 'Cyclomatic Complexity', value: selectedFile.metrics.cyclomaticComplexity || 0, isReversed: true },
                            { label: 'Cognitive Complexity', value: selectedFile.metrics.cognitiveComplexity || 0, isReversed: true },
                            { label: 'Documentation', value: selectedFile.metrics.documentation || 0 }
                          ].map((metric) => (
                            <div key={metric.label} className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">{metric.label}</h4>
                                <span className={`text-sm font-medium ${
                                  metric.isNumber ? 'text-gray-900 dark:text-white' :
                                  metric.isReversed
                                    ? metric.value > 80 ? 'text-red-600 dark:text-red-400' : 
                                      metric.value > 60 ? 'text-yellow-600 dark:text-yellow-400' : 
                                      'text-green-600 dark:text-green-400'
                                    : metric.value > 80 ? 'text-green-600 dark:text-green-400' : 
                                      metric.value > 60 ? 'text-yellow-600 dark:text-yellow-400' : 
                                      'text-red-600 dark:text-red-400'
                                }`}>
                                  {metric.isNumber ? metric.value : `${metric.value}%`}
                                </span>
                              </div>
                              {!metric.isNumber && (
                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                  <motion.div 
                                    className={`h-2 rounded-full ${
                                      metric.isReversed
                                        ? metric.value > 80 ? 'bg-red-600' : 
                                          metric.value > 60 ? 'bg-yellow-600' : 
                                          'bg-green-600'
                                        : metric.value > 80 ? 'bg-green-600' : 
                                          metric.value > 60 ? 'bg-yellow-600' : 
                                          'bg-red-600'
                                    }`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${metric.value}%` }}
                                    transition={{ duration: 1 }}
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                              Understanding Metrics
                            </h4>
                            <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
                              <li>• <strong>Complexity</strong>: Lower is better. Measures code structure complexity.</li>
                              <li>• <strong>Maintainability</strong>: Higher is better. Indicates how easy it is to modify the code.</li>
                              <li>• <strong>Security</strong>: Higher is better. Measures resistance to security vulnerabilities.</li>
                              <li>• <strong>Performance</strong>: Higher is better. Indicates code execution efficiency.</li>
                              <li>• <strong>Cyclomatic Complexity</strong>: Lower is better. Measures the number of independent paths through the code.</li>
                              <li>• <strong>Cognitive Complexity</strong>: Lower is better. Measures how difficult the code is to understand.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="p-6 text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No File Selected
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Select a file from the list to view its analysis results.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        {onExportReport && (
          <motion.button
            onClick={onExportReport}
            className="flex items-center px-6 py-3 bg-secondary-600 hover:bg-secondary-700 text-white font-medium rounded-lg transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-5 h-5 mr-2" />
            Export Report
          </motion.button>
        )}
        
        {onStartImprovement && (
          <motion.button
            onClick={onStartImprovement}
            className="flex items-center px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Apply Improvements
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default AnalysisResults;
import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Download, 
  Copy, 
  Check, 
  Play, 
  Code, 
  Eye, 
  AlertCircle, 
  CheckCircle as CheckCircleIcon, 
  Zap, 
  Shield,
  Wrench,
  BarChart3,
  Brain,
  Sparkles,
  Play as PlayIcon
} from 'lucide-react';
import { AnalysisResult, Issue, QualityMetrics } from '../../types';
import CodeEditor from '../CodeEditor/CodeEditor';
import { useCodebase } from '../../contexts/CodebaseContext';
import toast from 'react-hot-toast';
import CodeExplainer from '../CodeExplainer/CodeExplainer';
import TestGenerator from '../TestGenerator/TestGenerator';
import { formatPercentage, getMetricColor } from '../../utils/formatters';
import { VirtualizedFileList } from '../CodeReview/VirtualizedFileList';

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
  const { updateFileContent } = useCodebase();
  const [selectedFile, setSelectedFile] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'metrics' | 'suggestions'>('overview');
  const [copied, setCopied] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [showExplainer, setShowExplainer] = useState(false);
  const [showTestGenerator, setShowTestGenerator] = useState(false);

  // Memoize these calculations to prevent recalculation on every render
  const totalIssues = useMemo(() => 
    results.reduce((acc, result) => acc + result.issues.length, 0), 
    [results]
  );
  
  const criticalIssues = useMemo(() => 
    results.reduce((acc, result) => 
      acc + result.issues.filter(issue => issue.severity === 'critical').length, 0), 
    [results]
  );
  
  const highIssues = useMemo(() => 
    results.reduce((acc, result) => 
      acc + result.issues.filter(issue => issue.severity === 'high').length, 0), 
    [results]
  );

  const averageMetrics = useMemo(() => {
    const metrics = results.reduce((acc, result) => {
      Object.keys(result.metrics).forEach(key => {
        if (typeof result.metrics[key as keyof QualityMetrics] === 'number') {
          acc[key as keyof QualityMetrics] = (acc[key as keyof QualityMetrics] || 0) + 
            (result.metrics[key as keyof QualityMetrics] as number);
        }
      });
      return acc;
    }, {} as Partial<QualityMetrics>);

    Object.keys(metrics).forEach(key => {
      if (typeof metrics[key as keyof QualityMetrics] === 'number') {
        (metrics[key as keyof QualityMetrics] as number) = 
          Math.round((metrics[key as keyof QualityMetrics] as number) / results.length);
      }
    });
    
    return metrics;
  }, [results]);

  // Set the first file as selected when results change
  React.useEffect(() => {
    if (results.length > 0 && !selectedFile) {
      setSelectedFile(results[0]);
    }
  }, [results, selectedFile]);

  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy to clipboard');
    }
  }, []);

  const toggleSuggestion = useCallback((suggestionId: string) => {
    setSelectedSuggestion(prev => prev === suggestionId ? null : suggestionId);
  }, []);

  const handleApplySuggestion = useCallback((suggestion: any) => {
    if (!selectedFile) return;
    
    try {
      // Update the file content with the suggestion
      updateFileContent(selectedFile.filePath, suggestion.after);
      toast.success('Suggestion applied successfully!');
    } catch (error) {
      console.error('Failed to apply suggestion:', error);
      toast.error('Failed to apply suggestion');
    }
  }, [selectedFile, updateFileContent]);

  const handleFileSelect = useCallback((file: AnalysisResult) => {
    setSelectedFile(file);
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, 360] }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-20 h-20 bg-gradient-ai rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </motion.div>
        <motion.h2 
          className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Analysis Complete
        </motion.h2>
        <motion.p 
          className="text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Review the analysis results and apply AI-powered improvements to your codebase
        </motion.p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ 
            y: -5, 
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
          }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-12 -mt-12"></div>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Files Processed</p>
              <motion.p 
                className="text-2xl font-bold text-gray-900 dark:text-white"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {results.length}
              </motion.p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ 
            y: -5, 
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
          }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full -mr-12 -mt-12"></div>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Issues</p>
              <div className="flex items-baseline">
                <motion.p 
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.3 }}
                >
                  {totalIssues}
                </motion.p>
                {criticalIssues > 0 && (
                  <motion.span 
                    className="ml-2 px-2 py-1 text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {criticalIssues} critical
                  </motion.span>
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
          whileHover={{ 
            y: -5, 
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
          }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full -mr-12 -mt-12"></div>
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ rotate: [0, 10, 0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <TrendingUp className={`w-6 h-6 ${getMetricColor(averageMetrics.maintainability || 0)}`} />
            </motion.div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Maintainability</p>
              <motion.p 
                className={`text-2xl font-bold ${getMetricColor(averageMetrics.maintainability || 0)}`}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.4 }}
              >
                {formatPercentage(averageMetrics.maintainability || 0)}%
              </motion.p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ 
            y: -5, 
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
          }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full -mr-12 -mt-12"></div>
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ rotate: [0, 10, 0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              <Shield className={`w-6 h-6 ${getMetricColor(averageMetrics.security || 0)}`} />
            </motion.div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Security Score</p>
              <motion.p 
                className={`text-2xl font-bold ${getMetricColor(averageMetrics.security || 0)}`}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.5 }}
              >
                {formatPercentage(averageMetrics.security || 0)}%
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* File List */}
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
              Analyzed Files
            </h3>
          </div>
          <div className="h-96">
            <VirtualizedFileList 
              files={results}
              selectedFileId={selectedFile?.fileId}
              onSelectFile={handleFileSelect}
            />
          </div>
        </motion.div>

        {/* File Details */}
        <motion.div 
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          {selectedFile ? (
            <>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedFile.filePath}
                  </h3>
                  <div className="flex space-x-2">
                    {['overview', 'issues', 'metrics', 'suggestions'].map((tab) => (
                      <motion.button
                        key={tab}
                        className={`px-3 py-1 text-sm font-medium rounded ${
                          activeTab === tab
                            ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                        onClick={() => setActiveTab(tab as any)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'overview' && (
                    <motion.div 
                      className="space-y-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      key="overview"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <motion.div 
                          className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                          whileHover={{ y: -2 }}
                        >
                          <div className="flex items-center space-x-3 mb-2">
                            <AlertTriangle className="w-5 h-5 text-warning-600 dark:text-warning-400" />
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Issues Found</p>
                          </div>
                          <motion.p 
                            className="text-xl font-bold text-gray-900 dark:text-white"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            {selectedFile.issues.length}
                          </motion.p>
                          <div className="mt-2 flex space-x-2">
                            {selectedFile.issues.filter(i => i.severity === 'critical').length > 0 && (
                              <motion.span 
                                className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                {selectedFile.issues.filter(i => i.severity === 'critical').length} critical
                              </motion.span>
                            )}
                            {selectedFile.issues.filter(i => i.severity === 'high').length > 0 && (
                              <motion.span 
                                className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3 }}
                              >
                                {selectedFile.issues.filter(i => i.severity === 'high').length} high
                              </motion.span>
                            )}
                          </div>
                        </motion.div>
                        
                        <motion.div 
                          className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                          whileHover={{ y: -2 }}
                        >
                          <div className="flex items-center space-x-3 mb-2">
                            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Suggestions</p>
                          </div>
                          <motion.p 
                            className="text-xl font-bold text-gray-900 dark:text-white"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.1 }}
                          >
                            {selectedFile.suggestions.length}
                          </motion.p>
                          <div className="mt-2 flex space-x-2">
                            {selectedFile.suggestions.filter(s => s.priority === 'high').length > 0 && (
                              <motion.span 
                                className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.4 }}
                              >
                                {selectedFile.suggestions.filter(s => s.priority === 'high').length} high priority
                              </motion.span>
                            )}
                          </div>
                        </motion.div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Quality Metrics</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(selectedFile.metrics).map(([key, value], index) => (
                            <motion.div 
                              key={key} 
                              className="flex justify-between items-center"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 + 0.2 }}
                            >
                              <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              <motion.span 
                                className={`text-sm font-medium ${
                                  typeof value === 'number' && key !== 'duplicateLines' && key !== 'linesOfCode'
                                    ? getMetricColor(value, key === 'complexity' || key === 'cyclomaticComplexity' || key === 'cognitiveComplexity')
                                    : 'text-gray-900 dark:text-white'
                                }`}
                                whileHover={{ scale: 1.1 }}
                              >
                                {typeof value === 'number' && key !== 'duplicateLines' && key !== 'linesOfCode' 
                                  ? `${formatPercentage(value)}%` 
                                  : value
                                }
                              </motion.span>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <motion.button
                          onClick={() => setShowExplainer(true)}
                          className="flex items-center px-4 py-2 bg-gradient-ai hover:opacity-90 text-white rounded-lg text-sm font-medium"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Brain className="w-4 h-4 mr-2" />
                          Explain This Code
                        </motion.button>

                        <motion.button
                          onClick={() => setShowTestGenerator(true)}
                          className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Generate Tests
                        </motion.button>
                      </div>

                      {/* Code Explainer Modal */}
                      <AnimatePresence>
                        {showExplainer && selectedFile && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                            onClick={() => setShowExplainer(false)}
                          >
                            <motion.div
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.9, opacity: 0 }}
                              className="w-full max-w-4xl max-h-[90vh] overflow-auto"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <CodeExplainer
                                code={selectedFile.fileContent || '// File content not available'}
                                language={selectedFile.filePath.split('.').pop() || 'javascript'}
                                filePath={selectedFile.filePath}
                                onClose={() => setShowExplainer(false)}
                              />
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Test Generator Modal */}
                      <AnimatePresence>
                        {showTestGenerator && selectedFile && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                            onClick={() => setShowTestGenerator(false)}
                          >
                            <motion.div
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.9, opacity: 0 }}
                              className="w-full max-w-4xl max-h-[90vh] overflow-auto"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <TestGenerator
                                code={selectedFile.fileContent || '// File content not available'}
                                language={selectedFile.filePath.split('.').pop() || 'javascript'}
                                filePath={selectedFile.filePath}
                                onClose={() => setShowTestGenerator(false)}
                              />
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}

                  {activeTab === 'issues' && (
                    <motion.div 
                      className="space-y-4 max-h-[600px] overflow-y-auto pr-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      key="issues"
                    >
                      {selectedFile.issues.length > 0 ? (
                        selectedFile.issues.map((issue, index) => (
                          <motion.div
                            key={issue.id}
                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ 
                              y: -2, 
                              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" 
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <motion.span 
                                    className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(issue.severity)}`}
                                    whileHover={{ scale: 1.1 }}
                                  >
                                    {issue.severity.toUpperCase()}
                                  </motion.span>
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
                                  <motion.p 
                                    className="text-sm text-blue-600 dark:text-blue-400 mt-2"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                  >
                                    💡 {issue.suggestion}
                                  </motion.p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <motion.div 
                          className="text-center py-8"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                          <p className="text-gray-600 dark:text-gray-400">No issues found in this file!</p>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'suggestions' && (
                    <motion.div 
                      className="space-y-4 max-h-[600px] overflow-y-auto pr-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      key="suggestions"
                    >
                      {selectedFile.suggestions.length > 0 ? (
                        selectedFile.suggestions.map((suggestion, index) => (
                          <motion.div
                            key={suggestion.id}
                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ 
                              y: -2, 
                              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" 
                            }}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <motion.span 
                                  className={`px-2 py-1 text-xs font-medium rounded ${
                                    suggestion.priority === 'high' 
                                      ? 'bg-error-100 dark:bg-error-900/20 text-error-700 dark:text-error-400'
                                      : suggestion.priority === 'medium'
                                      ? 'bg-warning-100 dark:bg-warning-900/20 text-warning-700 dark:text-warning-400'
                                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                                  }`}
                                  whileHover={{ scale: 1.1 }}
                                >
                                  {suggestion.priority.toUpperCase()}
                                </motion.span>
                                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                                  {suggestion.type}
                                </span>
                              </div>
                              <motion.button
                                onClick={() => toggleSuggestion(suggestion.id)}
                                className="px-3 py-1 text-xs bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-lg"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {selectedSuggestion === suggestion.id ? 'Hide' : 'View'}
                              </motion.button>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {suggestion.description}
                                </h4>
                              </div>
                            </div>
                            
                            <AnimatePresence>
                              {selectedSuggestion === suggestion.id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
                                >
                                  <div>
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Before</p>
                                    <div className="relative">
                                      <CodeEditor
                                        value={suggestion.before}
                                        language={selectedFile.filePath.split('.').pop() || 'javascript'}
                                        height="80px"
                                        readOnly
                                        title="Original Code"
                                      />
                                      <motion.button
                                        onClick={() => handleCopy(suggestion.before)}
                                        className="absolute top-2 right-2 p-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                      >
                                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                      </motion.button>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">After</p>
                                    <div className="relative">
                                      <CodeEditor
                                        value={suggestion.after}
                                        language={selectedFile.filePath.split('.').pop() || 'javascript'}
                                        height="80px"
                                        readOnly
                                        title="Improved Code"
                                      />
                                      <motion.button
                                        onClick={() => handleCopy(suggestion.after)}
                                        className="absolute top-2 right-2 p-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                      >
                                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                      </motion.button>
                                    </div>
                                  </div>
                                  
                                  <motion.p 
                                    className="text-sm text-green-600 dark:text-green-400 mt-3 md:col-span-2"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                  >
                                    ✨ {suggestion.impact}
                                  </motion.p>

                                  <div className="md:col-span-2 mt-2">
                                    <motion.button
                                      onClick={() => handleApplySuggestion(suggestion)}
                                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium flex items-center"
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <PlayIcon className="w-4 h-4 mr-2" />
                                      Apply This Fix
                                    </motion.button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))
                      ) : (
                        <motion.div 
                          className="text-center py-8"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 dark:text-gray-400">No suggestions available for this file</p>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'metrics' && (
                    <motion.div 
                      className="space-y-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      key="metrics"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { name: 'Security', value: selectedFile.metrics.security, color: 'green', icon: Shield },
                          { name: 'Performance', value: selectedFile.metrics.performance, color: 'blue', icon: Zap },
                          { name: 'Maintainability', value: selectedFile.metrics.maintainability, color: 'purple', icon: CheckCircleIcon },
                          { name: 'Complexity', value: selectedFile.metrics.complexity, color: 'yellow', icon: AlertTriangle, reverse: true }
                        ].map((metric, index) => (
                          <motion.div 
                            key={metric.name}
                            className={`p-4 bg-gradient-to-r from-${metric.color}-50 to-${metric.color}-100 dark:from-${metric.color}-900/10 dark:to-${metric.color}-900/20 rounded-lg border border-${metric.color}-200 dark:border-${metric.color}-800`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -2 }}
                          >
                            <div className="flex items-center space-x-2 mb-1">
                              <metric.icon className={`w-4 h-4 text-${metric.color}-600 dark:text-${metric.color}-400`} />
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{metric.name}</p>
                            </div>
                            <motion.p 
                              className={`text-2xl font-bold text-${metric.color}-600 dark:text-${metric.color}-400`}
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 400, damping: 10, delay: index * 0.1 + 0.2 }}
                            >
                              {formatPercentage(metric.value)}%
                            </motion.p>
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* Complexity Metrics */}
                      <motion.div 
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Complexity Metrics</h4>
                        <div className="space-y-4">
                          {/* Cyclomatic Complexity */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center">
                                <Code className="w-4 h-4 text-orange-600 dark:text-orange-400 mr-2" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Cyclomatic Complexity
                                </span>
                              </div>
                              <span className={`text-sm font-medium ${
                                getMetricColor(selectedFile.metrics.cyclomaticComplexity || 0, true)
                              }`}>
                                {formatPercentage(selectedFile.metrics.cyclomaticComplexity || 0)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <motion.div 
                                className="bg-orange-500 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${selectedFile.metrics.cyclomaticComplexity || 0}%` }}
                                transition={{ duration: 1 }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Measures the number of independent paths through the code
                            </p>
                          </div>
                          
                          {/* Cognitive Complexity */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center">
                                <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Cognitive Complexity
                                </span>
                              </div>
                              <span className={`text-sm font-medium ${
                                getMetricColor(selectedFile.metrics.cognitiveComplexity || 0, true)
                              }`}>
                                {formatPercentage(selectedFile.metrics.cognitiveComplexity || 0)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <motion.div 
                                className="bg-purple-500 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${selectedFile.metrics.cognitiveComplexity || 0}%` }}
                                transition={{ duration: 1, delay: 0.3 }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Measures how difficult the code is to understand
                            </p>
                          </div>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Detailed Metrics</h4>
                        <div className="space-y-3">
                          {Object.entries(selectedFile.metrics).map(([key, value], index) => (
                            <motion.div 
                              key={key} 
                              className="flex items-center"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 + 0.6 }}
                            >
                              <div className="w-1/3 text-sm text-gray-600 dark:text-gray-400 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </div>
                              <div className="w-2/3">
                                <div className="flex items-center">
                                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                                    {typeof value === 'number' && key !== 'duplicateLines' && key !== 'linesOfCode' && (
                                      <motion.div 
                                        className={`h-2 rounded-full ${
                                          key === 'complexity' || key === 'cyclomaticComplexity' || key === 'cognitiveComplexity'
                                            ? 'bg-yellow-500' 
                                            : key === 'security'
                                            ? 'bg-green-500'
                                            : key === 'performance'
                                            ? 'bg-blue-500'
                                            : 'bg-purple-500'
                                        }`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${key === 'complexity' || key === 'cyclomaticComplexity' || key === 'cognitiveComplexity' ? 100 - value : value}%` }}
                                        transition={{ duration: 1, delay: index * 0.05 + 0.7 }}
                                      />
                                    )}
                                  </div>
                                  <motion.span 
                                    className={`text-sm font-medium ${
                                      typeof value === 'number' && key !== 'duplicateLines' && key !== 'linesOfCode'
                                        ? getMetricColor(value, key === 'complexity' || key === 'cyclomaticComplexity' || key === 'cognitiveComplexity')
                                        : 'text-gray-900 dark:text-white'
                                    }`}
                                    whileHover={{ scale: 1.1 }}
                                  >
                                    {typeof value === 'number' && key !== 'duplicateLines' && key !== 'linesOfCode' 
                                      ? `${formatPercentage(value)}%` 
                                      : value
                                    }
                                  </motion.span>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1, rotate: [0, 10, 0, -10, 0] }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  damping: 20,
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              >
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              </motion.div>
              <p className="text-gray-600 dark:text-gray-400">
                Select a file from the list to view detailed analysis results
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 mt-8">
        <motion.button
          onClick={onExportReport}
          className="flex items-center px-6 py-3 bg-secondary-600 hover:bg-secondary-700 text-white font-medium rounded-lg transition-colors duration-200"
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

export default React.memo(AnalysisResults);

// Helper function for severity colors
function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return 'text-error-600 dark:text-error-400 bg-error-50 dark:bg-error-900/20';
    case 'high': return 'text-warning-600 dark:text-warning-400 bg-warning-50 dark:bg-warning-900/20';
    case 'medium': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
    default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800';
  }
}
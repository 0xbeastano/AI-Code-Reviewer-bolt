import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2, GitBranch, CheckCircle, AlertTriangle, Zap, Shield,
  ThumbsUp, ThumbsDown, Copy, ArrowRight, FileText, Target,
  TrendingUp, Clock, Users, Eye, ChevronRight, ChevronDown
} from 'lucide-react';
import CodeEditor from '../CodeEditor/CodeEditor';
import { EnhancedAnalysisService, CodeSuggestion, EnhancedAnalysisResult } from '../../services/enhancedAnalysisService';
import toast from 'react-hot-toast';

interface EnhancedCodeReviewProps {
  code: string;
  language: string;
  filePath: string;
}

const EnhancedCodeReview: React.FC<EnhancedCodeReviewProps> = ({
  code,
  language,
  filePath
}) => {
  const [analysisResult, setAnalysisResult] = useState<EnhancedAnalysisResult | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<CodeSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());
  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<string>>(new Set());
  const [currentCode, setCurrentCode] = useState(code);

  const enhancedAnalysisService = EnhancedAnalysisService.getInstance();

  useEffect(() => {
    analyzeCode();
  }, [code, language, filePath]);

  const analyzeCode = async () => {
    setIsLoading(true);
    try {
      const result = await enhancedAnalysisService.analyzeCodeEnhanced(code, language, filePath);
      setAnalysisResult(result);
      if (result.suggestions.length > 0) {
        setSelectedSuggestion(result.suggestions[0]);
      }
    } catch (error) {
      console.error('Enhanced analysis failed:', error);
      toast.error('Failed to analyze code');
    } finally {
      setIsLoading(false);
    }
  };

  const applySuggestion = (suggestion: CodeSuggestion) => {
    // Apply the suggestion to the current code
    const lines = currentCode.split('\n');
    const startIndex = suggestion.lineStart - 1;
    const endIndex = suggestion.lineEnd - 1;
    
    // Replace the lines with the suggested code
    const newLines = [...lines];
    newLines.splice(startIndex, endIndex - startIndex + 1, suggestion.suggestedCode);
    const newCode = newLines.join('\n');
    
    setCurrentCode(newCode);
    setAppliedSuggestions(prev => new Set([...prev, suggestion.id]));
    toast.success('Suggestion applied successfully!');
  };

  const toggleSuggestionExpansion = (suggestionId: string) => {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'high': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'low': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'refactor': return <GitBranch className="w-4 h-4" />;
      case 'optimize': return <Zap className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'style': return <Code2 className="w-4 h-4" />;
      case 'documentation': return <FileText className="w-4 h-4" />;
      case 'bug-fix': return <AlertTriangle className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Code2 className="w-12 h-12 text-primary-600 dark:text-primary-400" />
        </motion.div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Analyzing code with AI-powered suggestions...
        </p>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No analysis results available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analysis Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <Target className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
            AI-Powered Code Analysis
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Quality Score:</span>
            <span className={`text-lg font-bold ${
              analysisResult.summary.codeQualityScore >= 80 ? 'text-green-600' :
              analysisResult.summary.codeQualityScore >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {analysisResult.summary.codeQualityScore}/100
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {analysisResult.summary.totalSuggestions}
              </span>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">Suggestions</p>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                {analysisResult.summary.criticalIssues}
              </span>
            </div>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">Critical</p>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {analysisResult.summary.securityIssues}
              </span>
            </div>
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">Security</p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {analysisResult.summary.performanceIssues}
              </span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">Performance</p>
          </div>
        </div>
      </div>

      {/* Main Content: Suggestions List + Code Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Suggestions Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <GitBranch className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
                Code Suggestions
              </h3>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {analysisResult.suggestions.map((suggestion) => (
                <motion.div
                  key={suggestion.id}
                  layout
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${
                    selectedSuggestion?.id === suggestion.id
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-l-primary-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedSuggestion(suggestion)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-1 rounded ${getPriorityColor(suggestion.priority)}`}>
                      {getTypeIcon(suggestion.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {suggestion.title}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(suggestion.priority)}`}>
                          {suggestion.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {suggestion.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Lines {suggestion.lineStart}-{suggestion.lineEnd}
                        </span>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {suggestion.confidence}% confidence
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Code Editor Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            {selectedSuggestion && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedSuggestion.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => applySuggestion(selectedSuggestion)}
                      disabled={appliedSuggestions.has(selectedSuggestion.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        appliedSuggestions.has(selectedSuggestion.id)
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      {appliedSuggestions.has(selectedSuggestion.id) ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1 inline" />
                          Applied
                        </>
                      ) : (
                        'Apply Suggestion'
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {selectedSuggestion.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                    <span>Impact: {selectedSuggestion.impact}</span>
                    <span>Confidence: {selectedSuggestion.confidence}%</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-4">
              {selectedSuggestion ? (
                <div className="space-y-4">
                  {/* Before/After Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1 text-red-500" />
                        Before (Original Code)
                      </h4>
                      <div className="border border-red-200 dark:border-red-800 rounded-lg overflow-hidden">
                        <CodeEditor
                          value={selectedSuggestion.originalCode}
                          language={language}
                          height="200px"
                          readOnly
                          title="Original Code"
                          lineNumbers={false}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                        After (Suggested Code)
                      </h4>
                      <div className="border border-green-200 dark:border-green-800 rounded-lg overflow-hidden">
                        <CodeEditor
                          value={selectedSuggestion.suggestedCode}
                          language={language}
                          height="200px"
                          readOnly
                          title="Suggested Code"
                          lineNumbers={false}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Reasoning and Tags */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                      Why this suggestion?
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                      {selectedSuggestion.reasoning}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSuggestion.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Code2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Select a suggestion to see detailed code comparison
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Updated Code Preview */}
      {currentCode !== code && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <GitBranch className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
              Updated Code
              <span className="ml-2 text-sm bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
                {appliedSuggestions.size} suggestion(s) applied
              </span>
            </h3>
          </div>
          <div className="p-4">
            <div className="h-96 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <CodeEditor
                value={currentCode}
                language={language}
                height="100%"
                readOnly={false}
                title="Updated Code"
                onChange={setCurrentCode}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedCodeReview;
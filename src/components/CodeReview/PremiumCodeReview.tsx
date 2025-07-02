import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2, GitBranch, CheckCircle, AlertTriangle, Zap, Shield,
  FileText, Target, Star, TrendingUp, Clock, Users, Eye, 
  ChevronRight, ChevronDown, Copy, Download, RefreshCw,
  Settings, Filter, Search, MoreVertical, Maximize2
} from 'lucide-react';
import CodeEditor from '../CodeEditor/CodeEditor';
import { EnhancedAnalysisService, CodeSuggestion, EnhancedAnalysisResult } from '../../services/enhancedAnalysisService';
import toast from 'react-hot-toast';

interface PremiumCodeReviewProps {
  code: string;
  language: string;
  filePath: string;
  onCodeChange?: (newCode: string) => void;
}

const PremiumCodeReview: React.FC<PremiumCodeReviewProps> = ({
  code,
  language,
  filePath,
  onCodeChange
}) => {
  // State Management
  const [analysisResult, setAnalysisResult] = useState<EnhancedAnalysisResult | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<CodeSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());
  const [currentCode, setCurrentCode] = useState(code);
  const [filterBy, setFilterBy] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enhancedAnalysisService = EnhancedAnalysisService.getInstance();

  // Memoized filtered suggestions to prevent duplication
  const filteredSuggestions = useMemo(() => {
    if (!analysisResult?.suggestions) return [];
    
    // Create a Set to track unique suggestion IDs and prevent duplicates
    const uniqueSuggestions = new Map<string, CodeSuggestion>();
    
    analysisResult.suggestions.forEach(suggestion => {
      // Create a unique key based on content rather than just ID
      const uniqueKey = `${suggestion.type}-${suggestion.lineStart}-${suggestion.lineEnd}-${suggestion.title}`;
      
      if (!uniqueSuggestions.has(uniqueKey)) {
        uniqueSuggestions.set(uniqueKey, {
          ...suggestion,
          id: uniqueKey // Ensure unique ID
        });
      }
    });
    
    let suggestions = Array.from(uniqueSuggestions.values());
    
    // Apply filters
    if (filterBy !== 'all') {
      suggestions = suggestions.filter(s => s.type === filterBy);
    }
    
    if (searchQuery) {
      suggestions = suggestions.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort by priority
    const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
    return suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [analysisResult, filterBy, searchQuery]);

  useEffect(() => {
    analyzeCode();
  }, [code, language, filePath]);

  useEffect(() => {
    if (onCodeChange) {
      onCodeChange(currentCode);
    }
  }, [currentCode, onCodeChange]);

  const analyzeCode = async () => {
    setIsLoading(true);
    try {
      const result = await enhancedAnalysisService.analyzeCodeEnhanced(code, language, filePath);
      setAnalysisResult(result);
      
      // Set first unique suggestion as selected
      if (result.suggestions.length > 0) {
        const uniqueSuggestions = new Map();
        result.suggestions.forEach(suggestion => {
          const uniqueKey = `${suggestion.type}-${suggestion.lineStart}-${suggestion.lineEnd}-${suggestion.title}`;
          if (!uniqueSuggestions.has(uniqueKey)) {
            uniqueSuggestions.set(uniqueKey, suggestion);
          }
        });
        const firstUnique = Array.from(uniqueSuggestions.values())[0];
        setSelectedSuggestion(firstUnique);
      }
    } catch (error) {
      console.error('Enhanced analysis failed:', error);
      toast.error('Failed to analyze code');
    } finally {
      setIsLoading(false);
    }
  };

  const applySuggestion = (suggestion: CodeSuggestion) => {
    try {
      const lines = currentCode.split('\n');
      const startIndex = Math.max(0, suggestion.lineStart - 1);
      const endIndex = Math.min(lines.length - 1, suggestion.lineEnd - 1);
      
      const newLines = [...lines];
      newLines.splice(startIndex, endIndex - startIndex + 1, suggestion.suggestedCode);
      const newCode = newLines.join('\n');
      
      setCurrentCode(newCode);
      setAppliedSuggestions(prev => new Set([...prev, suggestion.id]));
      toast.success(`✨ Suggestion applied: ${suggestion.title}`);
    } catch (error) {
      console.error('Failed to apply suggestion:', error);
      toast.error('Failed to apply suggestion');
    }
  };

  const copyCode = async (codeText: string) => {
    try {
      await navigator.clipboard.writeText(codeText);
      toast.success('Code copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'critical': return {
        bg: 'bg-gradient-to-r from-red-500/20 to-red-600/20',
        border: 'border-red-500/30',
        text: 'text-red-400',
        glow: 'premium-glow-red'
      };
      case 'high': return {
        bg: 'bg-gradient-to-r from-orange-500/20 to-orange-600/20',
        border: 'border-orange-500/30',
        text: 'text-orange-400',
        glow: 'premium-glow-red'
      };
      case 'medium': return {
        bg: 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20',
        border: 'border-yellow-500/30',
        text: 'text-yellow-400',
        glow: ''
      };
      case 'low': return {
        bg: 'bg-gradient-to-r from-blue-500/20 to-blue-600/20',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        glow: 'premium-glow-blue'
      };
      default: return {
        bg: 'bg-gradient-to-r from-gray-500/20 to-gray-600/20',
        border: 'border-gray-500/30',
        text: 'text-gray-400',
        glow: ''
      };
    }
  };

  const getTypeIcon = (type: string) => {
    const iconProps = { className: "w-4 h-4" };
    switch (type) {
      case 'refactor': return <GitBranch {...iconProps} />;
      case 'optimize': return <Zap {...iconProps} />;
      case 'security': return <Shield {...iconProps} />;
      case 'style': return <Code2 {...iconProps} />;
      case 'documentation': return <FileText {...iconProps} />;
      case 'bug-fix': return <AlertTriangle {...iconProps} />;
      default: return <Target {...iconProps} />;
    }
  };

  if (isLoading) {
    return (
      <div className="premium-panel h-96 flex-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mb-4"
          >
            <Code2 className="w-12 h-12 text-gradient-blue mx-auto" />
          </motion.div>
          <h3 className="premium-heading-3 mb-2">AI Analysis in Progress</h3>
          <p className="premium-text-sm">Analyzing code with advanced AI algorithms...</p>
        </div>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="premium-panel h-96 flex-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="premium-heading-3 mb-2">No Analysis Results</h3>
          <p className="premium-text-sm">Unable to analyze the provided code.</p>
          <button 
            onClick={analyzeCode}
            className="premium-btn premium-btn-primary mt-4"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Analysis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 premium-fade-in ${isFullscreen ? 'fixed inset-0 z-50 p-6 overflow-auto' : ''}`}>
      {/* Premium Header */}
      <div className="premium-header p-6 rounded-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="premium-glow-blue p-3 rounded-xl bg-blue-500/20">
              <Target className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="premium-heading-2 text-gradient-blue">AI Code Analysis</h1>
              <p className="premium-text-sm text-gray-400">{filePath}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="premium-text-sm">Quality Score:</span>
              <div className={`text-2xl font-bold ${
                analysisResult.summary.codeQualityScore >= 80 ? 'text-gradient-green' :
                analysisResult.summary.codeQualityScore >= 60 ? 'text-gradient-blue' : 'text-red-400'
              }`}>
                {analysisResult.summary.codeQualityScore}/100
              </div>
            </div>
            
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="premium-btn premium-btn-primary"
              data-tooltip="Toggle Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quality Metrics */}
        <div className="premium-grid premium-grid-4 mt-6">
          <motion.div 
            className="premium-card p-4 premium-glow-blue"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex-between">
              <FileText className="w-5 h-5 text-blue-400" />
              <span className="text-2xl font-bold text-gradient-blue">
                {filteredSuggestions.length}
              </span>
            </div>
            <p className="premium-text-sm mt-2">Active Suggestions</p>
          </motion.div>
          
          <motion.div 
            className="premium-card p-4 premium-glow-red"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex-between">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-2xl font-bold text-red-400">
                {analysisResult.summary.criticalIssues}
              </span>
            </div>
            <p className="premium-text-sm mt-2">Critical Issues</p>
          </motion.div>
          
          <motion.div 
            className="premium-card p-4"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex-between">
              <Shield className="w-5 h-5 text-orange-400" />
              <span className="text-2xl font-bold text-orange-400">
                {analysisResult.summary.securityIssues}
              </span>
            </div>
            <p className="premium-text-sm mt-2">Security</p>
          </motion.div>
          
          <motion.div 
            className="premium-card p-4 premium-glow-green"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex-between">
              <Zap className="w-5 h-5 text-green-400" />
              <span className="text-2xl font-bold text-gradient-green">
                {analysisResult.summary.performanceIssues}
              </span>
            </div>
            <p className="premium-text-sm mt-2">Performance</p>
          </motion.div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="premium-card p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {['all', 'refactor', 'optimize', 'security', 'style', 'documentation', 'bug-fix'].map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterBy(filter)}
                className={`premium-tab ${filterBy === filter ? 'active' : ''}`}
              >
                {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search suggestions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="premium-input pl-10 pr-4 py-2 w-64"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Suggestions Panel */}
        <div className="xl:col-span-4">
          <div className="premium-panel">
            <div className="p-4 border-b border-white/10">
              <h3 className="premium-heading-3 flex items-center">
                <GitBranch className="w-5 h-5 mr-2 text-blue-400" />
                Code Suggestions
                <span className="ml-2 text-sm bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                  {filteredSuggestions.length}
                </span>
              </h3>
            </div>
            
            <div className="max-h-96 overflow-y-auto premium-fade-in">
              <AnimatePresence>
                {filteredSuggestions.map((suggestion, index) => {
                  const styles = getPriorityStyles(suggestion.priority);
                  const isSelected = selectedSuggestion?.id === suggestion.id;
                  const isApplied = appliedSuggestions.has(suggestion.id);
                  
                  return (
                    <motion.div
                      key={suggestion.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`p-4 border-b border-white/5 cursor-pointer transition-all duration-300 ${
                        isSelected 
                          ? `${styles.bg} border-l-4 ${styles.border}` 
                          : 'hover:bg-white/5'
                      } ${isApplied ? 'opacity-60' : ''}`}
                      onClick={() => setSelectedSuggestion(suggestion)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${styles.bg} ${styles.glow}`}>
                          {getTypeIcon(suggestion.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="premium-text font-medium truncate pr-2">
                              {suggestion.title}
                            </h4>
                            <div className="flex items-center space-x-2">
                              {isApplied && (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              )}
                              <span className={`text-xs px-2 py-1 rounded-full ${styles.bg} ${styles.text}`}>
                                {suggestion.priority}
                              </span>
                            </div>
                          </div>
                          
                          <p className="premium-text-sm line-clamp-2 mb-2">
                            {suggestion.description}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Lines {suggestion.lineStart}-{suggestion.lineEnd}</span>
                            <div className="flex items-center space-x-1">
                              <div className="premium-status-dot premium-status-success"></div>
                              <span>{suggestion.confidence}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              
              {filteredSuggestions.length === 0 && (
                <div className="p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="premium-text-sm">No suggestions found matching your criteria</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Code Comparison Panel */}
        <div className="xl:col-span-8">
          <div className="premium-panel">
            {selectedSuggestion ? (
              <>
                <div className="p-4 border-b border-white/10">
                  <div className="flex-between mb-4">
                    <h3 className="premium-heading-3">{selectedSuggestion.title}</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyCode(selectedSuggestion.suggestedCode)}
                        className="premium-btn bg-white/10 hover:bg-white/20 text-white"
                        data-tooltip="Copy Suggested Code"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => applySuggestion(selectedSuggestion)}
                        disabled={appliedSuggestions.has(selectedSuggestion.id)}
                        className={`premium-btn ${
                          appliedSuggestions.has(selectedSuggestion.id)
                            ? 'premium-btn-success opacity-60 cursor-not-allowed'
                            : 'premium-btn-primary'
                        }`}
                      >
                        {appliedSuggestions.has(selectedSuggestion.id) ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Applied
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Apply Suggestion
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="premium-card p-3">
                    <p className="premium-text mb-2">{selectedSuggestion.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                      <span>Impact: {selectedSuggestion.impact}</span>
                      <span>Confidence: {selectedSuggestion.confidence}%</span>
                      <span>Type: {selectedSuggestion.type}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  {/* Before/After Comparison */}
                  <div className="premium-grid premium-grid-2 mb-6">
                    <div>
                      <h4 className="premium-text font-medium mb-3 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2 text-red-400" />
                        Before (Original)
                      </h4>
                      <div className="premium-code-editor border border-red-500/30 rounded-lg overflow-hidden">
                        <CodeEditor
                          value={selectedSuggestion.originalCode}
                          language={language}
                          height="250px"
                          readOnly
                          title="Original Code"
                          lineNumbers={false}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="premium-text font-medium mb-3 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                        After (Suggested)
                      </h4>
                      <div className="premium-code-editor border border-green-500/30 rounded-lg overflow-hidden">
                        <CodeEditor
                          value={selectedSuggestion.suggestedCode}
                          language={language}
                          height="250px"
                          readOnly
                          title="Suggested Code"
                          lineNumbers={false}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Reasoning */}
                  <div className="premium-card p-4 bg-blue-500/10 border-blue-500/30">
                    <h4 className="premium-text font-medium mb-3 flex items-center">
                      <Star className="w-4 h-4 mr-2 text-blue-400" />
                      Why this suggestion?
                    </h4>
                    <p className="premium-text mb-4">{selectedSuggestion.reasoning}</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSuggestion.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <Code2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="premium-heading-3 mb-2">Select a Suggestion</h3>
                <p className="premium-text-sm">Choose a suggestion from the left panel to see detailed analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Updated Code Preview */}
      {currentCode !== code && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-panel"
        >
          <div className="p-4 border-b border-white/10">
            <h3 className="premium-heading-3 flex items-center">
              <GitBranch className="w-5 h-5 mr-2 text-green-400" />
              Updated Code
              <span className="ml-3 text-sm bg-green-500/20 text-green-400 px-3 py-1 rounded-full flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                {appliedSuggestions.size} applied
              </span>
            </h3>
          </div>
          <div className="p-4">
            <div className="h-96 premium-code-editor border border-green-500/30 rounded-lg overflow-hidden">
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
        </motion.div>
      )}
    </div>
  );
};

export default PremiumCodeReview;
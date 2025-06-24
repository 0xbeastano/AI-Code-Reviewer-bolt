import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
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
  Check
} from 'lucide-react';
import { codeReviewService } from '../services/codeReviewService';
import MonacoDiffViewer from '../components/CodeReview/MonacoDiffViewer';
import toast from 'react-hot-toast';

const ReviewResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'improvements' | 'files'>('overview');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchReviewData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const reviewData = await codeReviewService.getReviewStatus(id);
        setReview(reviewData);
        
        // Set first file as selected if available
        if (reviewData.findings && reviewData.findings.length > 0) {
          setSelectedFile(reviewData.findings[0].file);
        }
      } catch (error) {
        console.error('Failed to fetch review data:', error);
        toast.error('Failed to load review results');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviewData();
  }, [id]);

  const handleExportReport = () => {
    toast.success('Exporting report...');
    // Implementation would go here
  };

  const handleShareResults = () => {
    navigator.clipboard.writeText(`${window.location.origin}/review/${id}/results`);
    toast.success('Results URL copied to clipboard!');
  };

  const handleApplySuggestion = (suggestionId: string) => {
    toast.success('Applying suggestion...');
    // Implementation would go here
  };

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Code copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div 
          className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="text-center py-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, 10, 0, -10, 0] }}
          transition={{ duration: 2 }}
        >
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Review Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We couldn't find the review you're looking for.
        </p>
        <motion.button
          onClick={handleGoBack}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Go Back
        </motion.button>
      </div>
    );
  }

  // Mock data for demonstration
  const mockOriginalCode = `function calculateTotal(items) {
  let total = 0;
  for (var i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}`;

  const mockImprovedCode = `function calculateTotal(items) {
  // Use reduce for cleaner implementation
  return items.reduce((total, item) => total + item.price, 0);
}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={handleGoBack}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <FileText className="w-7 h-7 text-primary-600 dark:text-primary-400 mr-3" />
              Review Results
              <motion.span 
                className="ml-3 px-3 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                Completed
              </motion.span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Review #{id} • Completed {new Date(review.completedAt).toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <motion.button
            onClick={handleShareResults}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Share Results"
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
          >
            <Share2 className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            onClick={handleExportReport}
            className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </motion.button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <FileCode className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Files Analyzed</p>
              <motion.p 
                className="text-2xl font-bold text-gray-900 dark:text-white"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {review.summary.analyzedFiles}
              </motion.p>
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
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full -mr-12 -mt-12"></div>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Issues Found</p>
              <motion.p 
                className="text-2xl font-bold text-gray-900 dark:text-white"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {review.summary.issuesFound}
              </motion.p>
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
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Quality Score</p>
              <motion.p 
                className="text-2xl font-bold text-gray-900 dark:text-white"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {review.summary.qualityScore}%
              </motion.p>
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
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Improvement</p>
              <motion.p 
                className="text-2xl font-bold text-gray-900 dark:text-white"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                +{review.summary.improvementScore}%
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: Eye },
              { id: 'issues', name: 'Issues', icon: AlertTriangle },
              { id: 'improvements', name: 'Improvements', icon: Sparkles },
              { id: 'files', name: 'Files', icon: FileCode }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab(tab.id as any)}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
                {tab.id === 'issues' && (
                  <motion.span 
                    className="ml-1 px-2 py-0.5 text-xs rounded-full bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {review.summary.issuesFound}
                  </motion.span>
                )}
              </motion.button>
            ))}
          </nav>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
                      Quality Metrics
                    </h3>
                    <div className="space-y-4">
                      {[
                        { name: 'Security', value: review.metrics.security, icon: Shield, color: 'green' },
                        { name: 'Performance', value: review.metrics.performance, icon: Zap, color: 'blue' },
                        { name: 'Maintainability', value: review.metrics.maintainability, icon: Code, color: 'purple' },
                        { name: 'Overall', value: review.metrics.overall, icon: CheckCircle, color: 'primary' }
                      ].map((metric, index) => (
                        <motion.div 
                          key={metric.name} 
                          className="flex items-center"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + 0.2 }}
                        >
                          <motion.div 
                            className={`p-2 rounded-lg bg-${metric.color}-100 dark:bg-${metric.color}-900/20 mr-3`}
                            whileHover={{ scale: 1.1, rotate: 10 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            <metric.icon className={`w-5 h-5 text-${metric.color}-600 dark:text-${metric.color}-400`} />
                          </motion.div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{metric.name}</span>
                              <motion.span 
                                className="text-sm font-medium text-gray-900 dark:text-white"
                                whileHover={{ scale: 1.1 }}
                              >
                                {metric.value}%
                              </motion.span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <motion.div 
                                className={`bg-${metric.color}-600 h-2 rounded-full`}
                                initial={{ width: 0 }}
                                animate={{ width: `${metric.value}%` }}
                                transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <AlertTriangle className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
                      Issues Summary
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <motion.div 
                          className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          whileHover={{ y: -2 }}
                        >
                          <div className="text-sm text-gray-500 dark:text-gray-400">Security Issues</div>
                          <div className="text-xl font-bold text-gray-900 dark:text-white">{review.summary.securityVulnerabilities}</div>
                        </motion.div>
                        <motion.div 
                          className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          whileHover={{ y: -2 }}
                        >
                          <div className="text-sm text-gray-500 dark:text-gray-400">Performance Issues</div>
                          <div className="text-xl font-bold text-gray-900 dark:text-white">{review.summary.performanceIssues}</div>
                        </motion.div>
                      </div>
                      
                      <motion.div 
                        className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Issues Fixed</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {review.summary.issuesFixed} / {review.summary.issuesFound}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <motion.div 
                            className="bg-green-600 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(review.summary.issuesFixed / review.summary.issuesFound) * 100}%` }}
                            transition={{ duration: 1, delay: 0.6 }}
                          />
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        whileHover={{ y: -2 }}
                      >
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estimated Savings</div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Time</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">{review.summary.estimatedSavings.time} hours</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Cost</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">${review.summary.estimatedSavings.cost}</div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
                    AI Recommendations
                  </h3>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
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
                          GPT-4 Analysis Summary
                        </h4>
                        <div className="space-y-3 text-gray-700 dark:text-gray-300">
                          <p>
                            Your codebase shows good overall quality with some areas for improvement. Here are the key recommendations:
                          </p>
                          <ul className="list-disc pl-5 space-y-1">
                            <motion.li 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.9 }}
                            >
                              Implement proper input validation in authentication flows to address security vulnerabilities
                            </motion.li>
                            <motion.li 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 1.0 }}
                            >
                              Optimize database queries in the payment processing module to improve performance
                            </motion.li>
                            <motion.li 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 1.1 }}
                            >
                              Refactor the user management code to follow the repository pattern for better maintainability
                            </motion.li>
                            <motion.li 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 1.2 }}
                            >
                              Add comprehensive error handling throughout the application
                            </motion.li>
                            <motion.li 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 1.3 }}
                            >
                              Improve test coverage, particularly for critical business logic
                            </motion.li>
                          </ul>
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.4 }}
                          >
                            Implementing these changes could improve your overall code quality score by approximately 15-20%.
                          </motion.p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {activeTab === 'issues' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Issues ({review.summary.issuesFound})
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
                      <option>Quality</option>
                      <option>Style</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Mock issues for demonstration */}
                  {[
                    {
                      id: '1',
                      severity: 'critical',
                      type: 'security',
                      title: 'SQL Injection Vulnerability',
                      description: 'User input is directly concatenated into SQL query without proper sanitization',
                      file: 'src/services/userService.js',
                      line: 42,
                      column: 15
                    },
                    {
                      id: '2',
                      severity: 'high',
                      type: 'performance',
                      title: 'Inefficient Database Query',
                      description: 'N+1 query pattern detected in user listing functionality',
                      file: 'src/repositories/userRepository.js',
                      line: 87,
                      column: 3
                    },
                    {
                      id: '3',
                      severity: 'medium',
                      type: 'quality',
                      title: 'Duplicate Code',
                      description: 'Similar code pattern repeated in multiple places',
                      file: 'src/utils/helpers.js',
                      line: 124,
                      column: 1
                    }
                  ].map((issue, index) => (
                    <motion.div
                      key={issue.id}
                      className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    >
                      <div className="flex items-start">
                        <motion.div 
                          className={`p-2 rounded-lg mr-4 ${
                            issue.severity === 'critical' 
                              ? 'bg-red-100 dark:bg-red-900/20' 
                              : issue.severity === 'high'
                              ? 'bg-orange-100 dark:bg-orange-900/20'
                              : 'bg-yellow-100 dark:bg-yellow-900/20'
                          }`}
                          whileHover={{ scale: 1.1, rotate: 10 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <AlertTriangle className={`w-5 h-5 ${
                            issue.severity === 'critical' 
                              ? 'text-red-600 dark:text-red-400' 
                              : issue.severity === 'high'
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-yellow-600 dark:text-yellow-400'
                          }`} />
                        </motion.div>
                        
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">{issue.title}</h4>
                            <motion.span 
                              className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                issue.severity === 'critical' 
                                  ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' 
                                  : issue.severity === 'high'
                                  ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
                                  : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                              }`}
                              whileHover={{ scale: 1.1 }}
                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                              {issue.severity.toUpperCase()}
                            </motion.span>
                            <motion.span 
                              className="ml-2 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                              whileHover={{ scale: 1.1 }}
                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                              {issue.type}
                            </motion.span>
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                            {issue.description}
                          </p>
                          
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <FileText className="w-3 h-3 mr-1" />
                            <span>{issue.file}</span>
                            <span className="mx-1">•</span>
                            <span>Line {issue.line}, Column {issue.column}</span>
                          </div>
                        </div>
                        
                        <motion.button 
                          className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          View
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'improvements' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Suggested Improvements
                  </h3>
                  <motion.button 
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Apply All
                  </motion.button>
                </div>
                
                <div className="space-y-6">
                  {/* Mock suggestions for demonstration */}
                  {[
                    {
                      id: '1',
                      title: 'Optimize Array Processing',
                      description: 'Replace for loop with array reduce method for better performance and readability',
                      file: 'src/utils/calculations.js',
                      type: 'performance',
                      originalCode: mockOriginalCode,
                      improvedCode: mockImprovedCode,
                      impact: 'Improves readability and reduces potential for off-by-one errors'
                    },
                    {
                      id: '2',
                      title: 'Add Input Validation',
                      description: 'Add proper input validation to prevent security vulnerabilities',
                      file: 'src/controllers/userController.js',
                      type: 'security',
                      originalCode: `function createUser(req, res) {
  const user = new User(req.body);
  user.save()
    .then(() => res.status(201).json(user))
    .catch(err => res.status(400).json(err));
}`,
                      improvedCode: `function createUser(req, res) {
  // Validate input
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const user = new User({ name, email, password });
  user.save()
    .then(() => res.status(201).json(user))
    .catch(err => res.status(400).json(err));
}`,
                      impact: 'Prevents potential security vulnerabilities and improves error handling'
                    }
                  ].map((suggestion, index) => (
                    <motion.div
                      key={suggestion.id}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <motion.div 
                              className={`p-2 rounded-lg mr-3 ${
                                suggestion.type === 'security' 
                                  ? 'bg-red-100 dark:bg-red-900/20' 
                                  : 'bg-blue-100 dark:bg-blue-900/20'
                              }`}
                              whileHover={{ scale: 1.1, rotate: 10 }}
                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                              {suggestion.type === 'security' ? (
                                <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                              ) : (
                                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              )}
                            </motion.div>
                            
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">{suggestion.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{suggestion.description}</p>
                              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <FileText className="w-3 h-3 mr-1" />
                                <span>{suggestion.file}</span>
                              </div>
                            </div>
                          </div>
                          
                          <motion.button
                            onClick={() => setSelectedSuggestion(selectedSuggestion?.id === suggestion.id ? null : suggestion)}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {selectedSuggestion?.id === suggestion.id ? 'Hide' : 'View'}
                          </motion.button>
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {selectedSuggestion?.id === suggestion.id && (
                          <motion.div 
                            className="p-4"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <MonacoDiffViewer
                              original={suggestion.originalCode}
                              modified={suggestion.improvedCode}
                              language="javascript"
                              filename={suggestion.file}
                              onAcceptChange={() => handleApplySuggestion(suggestion.id)}
                            />
                            
                            <motion.div 
                              className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                            >
                              <div className="flex items-center">
                                <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                                <span className="text-sm font-medium text-green-800 dark:text-green-200">Impact</span>
                              </div>
                              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                {suggestion.impact}
                              </p>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'files' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Analyzed Files
                  </h3>
                  <div className="flex space-x-2">
                    <select className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm">
                      <option>All Files</option>
                      <option>JavaScript</option>
                      <option>TypeScript</option>
                      <option>Python</option>
                    </select>
                    <select className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm">
                      <option>Sort by Path</option>
                      <option>Sort by Issues</option>
                      <option>Sort by Score</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Mock files for demonstration */}
                  {[
                    { path: 'src/utils/calculations.js', language: 'JavaScript', issues: 3, score: 78 },
                    { path: 'src/controllers/userController.js', language: 'JavaScript', issues: 5, score: 65 },
                    { path: 'src/models/user.js', language: 'JavaScript', issues: 1, score: 92 },
                    { path: 'src/services/authService.js', language: 'JavaScript', issues: 4, score: 71 },
                    { path: 'src/middleware/auth.js', language: 'JavaScript', issues: 0, score: 98 },
                    { path: 'src/config/database.js', language: 'JavaScript', issues: 2, score: 85 }
                  ].map((file, index) => (
                    <motion.div
                      key={index}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    >
                      <div className="flex items-center">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 10 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <FileCode className="w-5 h-5 text-gray-400 mr-3" />
                        </motion.div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{file.path.split('/').pop()}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{file.path}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {file.issues > 0 ? (
                          <motion.span 
                            className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full"
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            {file.issues} issues
                          </motion.span>
                        ) : (
                          <motion.span 
                            className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full"
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            No issues
                          </motion.span>
                        )}
                        
                        <motion.span 
                          className={`px-2 py-1 text-xs rounded-full ${
                            file.score >= 90 
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                              : file.score >= 70
                              ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                              : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          {file.score}%
                        </motion.span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReviewResults;
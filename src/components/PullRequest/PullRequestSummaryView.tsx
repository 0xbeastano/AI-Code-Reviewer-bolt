import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitPullRequest, 
  FileText, 
  Shield, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  Copy, 
  Check, 
  ExternalLink, 
  MessageSquare, 
  Brain,
  Sparkles
} from 'lucide-react';
import { PullRequest, PullRequestSummary } from '../../types/pullRequest';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface PullRequestSummaryViewProps {
  pullRequest: PullRequest;
  summary: PullRequestSummary;
  loading?: boolean;
}

const PullRequestSummaryView: React.FC<PullRequestSummaryViewProps> = ({
  pullRequest,
  summary,
  loading = false
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'issues' | 'feedback' | 'security' | 'testing'>('summary');

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
          <div className="h-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-ai rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                AI Pull Request Analysis
                <motion.div
                  className="ml-2"
                  animate={{ 
                    rotate: [0, 10, 0, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                </motion.div>
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Generated {formatDistanceToNow(summary.generatedAt, { addSuffix: true })} using {summary.model}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={() => handleCopy(summary.summary)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </motion.button>
            
            <motion.a
              href={pullRequest.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ExternalLink className="w-5 h-5" />
            </motion.a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-4 px-6" aria-label="Tabs">
          {[
            { id: 'summary', name: 'Summary', icon: GitPullRequest },
            { id: 'issues', name: 'Potential Issues', icon: AlertTriangle, count: summary.potentialIssues.length },
            { id: 'feedback', name: 'Feedback', icon: MessageSquare, count: summary.suggestedFeedback.length },
            { id: 'security', name: 'Security', icon: Shield, count: summary.securityConsiderations.length },
            { id: 'testing', name: 'Testing', icon: CheckCircle, count: summary.testingRecommendations.length }
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

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="p-6"
        >
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* PR Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Summary
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {summary.summary}
                </p>
              </div>

              {/* Key Changes */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
                  Key Changes
                </h4>
                <div className="space-y-2">
                  {summary.keyChanges.map((change, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{change}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* PR Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Files Changed</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{pullRequest.changedFiles}</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Commits</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{pullRequest.commits}</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Additions</div>
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">+{pullRequest.additions}</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Deletions</div>
                  <div className="text-xl font-bold text-red-600 dark:text-red-400">-{pullRequest.deletions}</div>
                </div>
              </div>

              {/* Confidence Score */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Confidence Score</div>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-3">
                    <motion.div 
                      className="bg-primary-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${summary.confidence * 100}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {Math.round(summary.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'issues' && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                Potential Issues
              </h4>
              
              {summary.potentialIssues.length === 0 ? (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                    <span className="text-green-700 dark:text-green-300">No potential issues detected</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {summary.potentialIssues.map((issue, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                    >
                      <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" />
                        <span className="text-yellow-700 dark:text-yellow-300">{issue}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                Suggested Feedback
              </h4>
              
              {summary.suggestedFeedback.length === 0 ? (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                    <span className="text-blue-700 dark:text-blue-300">No feedback suggestions available</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {summary.suggestedFeedback.map((feedback, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                    >
                      <div className="flex items-start">
                        <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
                        <span className="text-blue-700 dark:text-blue-300">{feedback}</span>
                      </div>
                      <div className="mt-2 ml-7">
                        <motion.button
                          onClick={() => handleCopy(feedback)}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Copy feedback
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <Shield className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                Security Considerations
              </h4>
              
              {summary.securityConsiderations.length === 0 ? (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                    <span className="text-green-700 dark:text-green-300">No security concerns detected</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {summary.securityConsiderations.map((security, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                    >
                      <div className="flex items-start">
                        <Shield className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 mt-0.5" />
                        <span className="text-red-700 dark:text-red-300">{security}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'testing' && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                Testing Recommendations
              </h4>
              
              {summary.testingRecommendations.length === 0 ? (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
                    <span className="text-gray-700 dark:text-gray-300">No testing recommendations available</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {summary.testingRecommendations.map((testing, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                    >
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 mt-0.5" />
                        <span className="text-green-700 dark:text-green-300">{testing}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PullRequestSummaryView;
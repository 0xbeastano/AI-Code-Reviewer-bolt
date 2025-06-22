import React from 'react';
import { CheckCircle, AlertTriangle, TrendingUp, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { CodeReviewResult } from '../../types/codeReview';

interface ReviewResultsProps {
  review: CodeReviewResult;
  onApplySuggestion: (suggestionId: string) => void;
  onExportReport: (format: 'pdf' | 'html' | 'markdown') => void;
  selectedSuggestion: string | null;
  onSelectSuggestion: (suggestionId: string | null) => void;
}

const ReviewResults: React.FC<ReviewResultsProps> = ({
  review,
  onApplySuggestion,
  onExportReport,
  selectedSuggestion,
  onSelectSuggestion
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Review Complete
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          AI analysis finished with actionable insights and improvements
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Files Analyzed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{review.summary.analyzedFiles}</p>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Issues Found</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{review.summary.issuesFound}</p>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Quality Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{review.summary.qualityScore}%</p>
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
            <TrendingUp className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Suggestions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{review.suggestions.length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Results Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Review Results
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Detailed analysis results and improvement suggestions will be displayed here.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => onExportReport('pdf')}
          className="flex items-center px-6 py-3 bg-secondary-600 hover:bg-secondary-700 text-white font-medium rounded-lg transition-colors"
        >
          <Download className="w-5 h-5 mr-2" />
          Export Report
        </button>
        <button
          onClick={() => onApplySuggestion('all')}
          className="flex items-center px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        >
          <TrendingUp className="w-5 h-5 mr-2" />
          Apply All Suggestions
        </button>
      </div>
    </div>
  );
};

export default ReviewResults;
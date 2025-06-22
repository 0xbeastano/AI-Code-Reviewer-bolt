import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { CodeReviewResult } from '../../types/codeReview';
import { formatDistanceToNow } from 'date-fns';

interface RecentReviewsProps {
  reviews: CodeReviewResult[];
}

const RecentReviews: React.FC<RecentReviewsProps> = ({ reviews }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'running':
        return <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200';
      case 'running':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200';
      default:
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Reviews
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Latest code review activities
        </p>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {reviews.length === 0 ? (
          <div className="p-6 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No recent reviews found
            </p>
          </div>
        ) : (
          reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(review.status)}
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Repository Review #{review.id.slice(-6)}
                    </h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(review.status)}`}>
                        {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDistanceToNow(review.startedAt, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {review.status === 'completed' && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {review.summary.issuesFound} issues found
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Quality: {review.summary.qualityScore}%
                      </p>
                    </div>
                  )}
                  
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {review.status === 'running' && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Progress</span>
                    <span>{review.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="bg-blue-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${review.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {reviews.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full text-center text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
            View all reviews
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentReviews;
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, AlertCircle, ExternalLink, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

interface CodeReviewResult {
  id: string;
  status: 'completed' | 'running' | 'failed';
  startedAt: Date;
  progress: number;
  summary?: {
    issuesFound?: number;
    qualityScore?: number;
  };
}

interface RecentReviewsProps {
  reviews?: CodeReviewResult[];
}

const RecentReviews: React.FC<RecentReviewsProps> = ({ reviews = [] }) => {
  // If no reviews are provided, use these default ones
  const defaultReviews = useMemo(() => [
    {
      id: 'review-1',
      status: 'completed' as const,
      startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      progress: 100,
      summary: {
        issuesFound: 23,
        qualityScore: 89
      }
    },
    {
      id: 'review-2', 
      status: 'running' as const,
      startedAt: new Date(Date.now() - 30 * 60 * 1000),
      progress: 67,
      summary: {
        issuesFound: 0,
        qualityScore: 0
      }
    },
    {
      id: 'review-3',
      status: 'completed' as const,
      startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      progress: 100,
      summary: {
        issuesFound: 15,
        qualityScore: 92
      }
    }
  ], []);

  const displayReviews = reviews.length > 0 ? reviews : defaultReviews;

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

  const getItemSize = (index: number) => {
    const review = displayReviews[index];
    return review.status === 'running' ? 140 : 100;
  };

  const ReviewRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const review = displayReviews[index];
    
    return (
      <motion.div
        key={review.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ 
          backgroundColor: "rgba(243, 244, 246, 0.5)",
          dark: { backgroundColor: "rgba(55, 65, 81, 0.3)" }
        }}
        className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        style={style}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.2, rotate: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {getStatusIcon(review.status)}
            </motion.div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Repository Review #{review.id.slice(-6)}
              </h4>
              <div className="flex items-center space-x-4 mt-1">
                <motion.span 
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    review.status === 'completed' 
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : review.status === 'running'
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                  }`}
                  whileHover={{ scale: 1.1 }}
                >
                  {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                </motion.span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDistanceToNow(review.startedAt, { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {review.status === 'completed' && review.summary && (
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {review.summary.issuesFound} issues found
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Quality: {review.summary.qualityScore}%
                </p>
              </div>
            )}
            
            <motion.div
              whileHover={{ scale: 1.2, rotate: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Link 
                to={`/review/${review.id}/results`}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </motion.div>
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
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center"
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <CheckCircle className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Reviews
            </h3>
          </motion.div>
          <motion.button 
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center"
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            View all
            <ChevronRight className="w-4 h-4 ml-1" />
          </motion.button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Latest code review activities
        </p>
      </div>

      <div className="h-96">
        {displayReviews.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No recent reviews found
            </p>
          </div>
        ) : (
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                width={width}
                itemCount={displayReviews.length}
                itemSize={getItemSize}
                itemData={displayReviews}
              >
                {ReviewRow}
              </List>
            )}
          </AutoSizer>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <motion.div
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Link 
            to="/review"
            className="w-full text-center text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors flex items-center justify-center"
          >
            View all reviews
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default React.memo(RecentReviews);
import React from 'react';
import { Clock, FileText, Shield, Zap, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { CodeReviewResult } from '../../types/codeReview';

interface ReviewProgressProps {
  review: CodeReviewResult;
  onCancel: () => void;
}

const ReviewProgress: React.FC<ReviewProgressProps> = ({ review, onCancel }) => {
  const steps = [
    { id: 'scanning', label: 'Scanning Files', icon: FileText, description: 'Analyzing codebase structure' },
    { id: 'security', label: 'Security Analysis', icon: Shield, description: 'Checking for vulnerabilities' },
    { id: 'performance', label: 'Performance Review', icon: Zap, description: 'Identifying optimizations' },
    { id: 'generating', label: 'Generating Report', icon: CheckCircle, description: 'Compiling results' }
  ];

  const currentStepIndex = Math.floor((review.progress / 100) * steps.length);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          AI Review in Progress
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Analyzing your codebase with advanced AI algorithms
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Overall Progress
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {Math.round(review.progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <motion.div
              className="bg-primary-600 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${review.progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;

            return (
              <motion.div
                key={step.id}
                className={`flex items-center space-x-4 p-4 rounded-lg ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                    : isCompleted
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-gray-50 dark:bg-gray-700'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`p-2 rounded-full ${
                  isActive
                    ? 'bg-primary-100 dark:bg-primary-800'
                    : isCompleted
                    ? 'bg-green-100 dark:bg-green-800'
                    : 'bg-gray-100 dark:bg-gray-600'
                }`}>
                  <step.icon className={`w-5 h-5 ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : isCompleted
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-400'
                  }`} />
                </div>
                
                <div className="flex-1">
                  <h3 className={`font-medium ${
                    isActive || isCompleted
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.label}
                  </h3>
                  <p className={`text-sm ${
                    isActive || isCompleted
                      ? 'text-gray-600 dark:text-gray-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {step.description}
                  </p>
                </div>

                {isActive && (
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                )}

                {isCompleted && (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Estimated time remaining: 2-3 minutes</span>
          </div>
          
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewProgress;
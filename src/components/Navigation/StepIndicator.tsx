import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface Step {
  id: string;
  label: string;
  description?: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface StepIndicatorProps {
  steps: Step[];
  onStepClick?: (stepId: string) => void;
  allowNavigation?: boolean;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  onStepClick,
  allowNavigation = false
}) => {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center justify-center space-x-4 md:space-x-8">
        {steps.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';
          const isClickable = allowNavigation && (isCompleted || isCurrent) && onStepClick;

          return (
            <li key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <motion.button
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    border-2 transition-all duration-200 relative
                    ${isCompleted
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : isCurrent
                      ? 'border-primary-600 bg-white dark:bg-gray-800 text-primary-600'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-400'
                    }
                    ${isClickable 
                      ? 'cursor-pointer hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900' 
                      : 'cursor-default'
                    }
                  `}
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  aria-current={isCurrent ? 'step' : undefined}
                  whileHover={isClickable ? { scale: 1.05 } : {}}
                  whileTap={isClickable ? { scale: 0.95 } : {}}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                  
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-primary-600"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.button>
                
                <div className="mt-2 text-center">
                  <p className={`text-sm font-medium ${
                    isCurrent 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : isCompleted
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-24">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`
                  w-12 h-0.5 mx-4 transition-colors duration-200
                  ${steps[index + 1].status !== 'upcoming' 
                    ? 'bg-primary-600' 
                    : 'bg-gray-300 dark:bg-gray-600'
                  }
                `} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default StepIndicator;
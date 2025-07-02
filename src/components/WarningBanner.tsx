import React from 'react';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface WarningBannerProps {
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  onDismiss?: () => void;
}

const WarningBanner: React.FC<WarningBannerProps> = ({ type, title, message, onDismiss }) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          text: 'text-yellow-800 dark:text-yellow-200',
          icon: <AlertTriangle className="w-5 h-5" />
        };
      case 'info':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-800 dark:text-blue-200',
          icon: <Info className="w-5 h-5" />
        };
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          text: 'text-green-800 dark:text-green-200',
          icon: <CheckCircle className="w-5 h-5" />
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={`p-4 rounded-lg border ${styles.bg} ${styles.border} mb-4`}>
      <div className="flex items-start space-x-3">
        <div className={styles.text}>
          {styles.icon}
        </div>
        <div className="flex-1">
          <h3 className={`text-sm font-medium ${styles.text}`}>
            {title}
          </h3>
          <p className={`text-sm mt-1 ${styles.text}`}>
            {message}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`text-sm ${styles.text} hover:opacity-75`}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default WarningBanner;
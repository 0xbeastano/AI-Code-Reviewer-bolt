import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Info, CheckCircle } from 'lucide-react';

const SecurityAlerts: React.FC = () => {
  const alerts = [
    {
      id: '1',
      type: 'critical',
      title: 'SQL Injection Vulnerability',
      description: 'Potential SQL injection found in user authentication',
      repository: 'web-app',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '2',
      type: 'warning',
      title: 'Outdated Dependencies',
      description: '3 dependencies have known security vulnerabilities',
      repository: 'api-service',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
    },
    {
      id: '3',
      type: 'info',
      title: 'Security Scan Complete',
      description: 'No new vulnerabilities found in latest scan',
      repository: 'mobile-app',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
    }
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'warning':
        return <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case 'info':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'info':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
      default:
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Security Alerts
          </h3>
          <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-full">
            2 Critical
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Recent security findings and alerts
        </p>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 border-l-4 ${getAlertColor(alert.type)}`}
          >
            <div className="flex items-start space-x-3">
              {getAlertIcon(alert.type)}
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {alert.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {alert.description}
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {alert.repository}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {alert.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full text-center text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
          View all alerts
        </button>
      </div>
    </div>
  );
};

export default SecurityAlerts;
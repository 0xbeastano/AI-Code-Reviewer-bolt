import React from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface SecurityOverviewProps {
  data?: any;
}

const SecurityOverview: React.FC<SecurityOverviewProps> = ({ data }) => {
  const securityMetrics = [
    { label: 'Critical Vulnerabilities', value: 2, color: 'red', icon: XCircle },
    { label: 'High Risk Issues', value: 8, color: 'orange', icon: AlertTriangle },
    { label: 'Medium Risk Issues', value: 15, color: 'yellow', icon: AlertTriangle },
    { label: 'Resolved Issues', value: 45, color: 'green', icon: CheckCircle }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {securityMetrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center space-x-3">
              <metric.icon className={`w-8 h-8 text-${metric.color}-600 dark:text-${metric.color}-400`} />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metric.value}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {metric.label}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Security Overview
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Detailed security analytics and vulnerability tracking will be displayed here.
        </p>
      </div>
    </div>
  );
};

export default SecurityOverview;
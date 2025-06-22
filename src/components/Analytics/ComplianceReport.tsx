import React from 'react';
import { Shield, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface ComplianceReportProps {
  data?: any;
}

const ComplianceReport: React.FC<ComplianceReportProps> = ({ data }) => {
  const complianceMetrics = [
    { label: 'SOC 2 Compliance', value: '98%', color: 'green', icon: Shield },
    { label: 'Security Standards', value: '95%', color: 'blue', icon: CheckCircle },
    { label: 'Policy Violations', value: 3, color: 'red', icon: AlertTriangle },
    { label: 'Audit Reports', value: 12, color: 'purple', icon: FileText }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {complianceMetrics.map((metric, index) => (
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
          Compliance Report
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Detailed compliance analytics and regulatory adherence reports will be displayed here.
        </p>
      </div>
    </div>
  );
};

export default ComplianceReport;
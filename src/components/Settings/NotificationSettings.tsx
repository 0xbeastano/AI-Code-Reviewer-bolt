import React, { useState } from 'react';
import { Bell, Mail, Smartphone, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface NotificationPreferences {
  email: {
    reviewComplete: boolean;
    securityAlerts: boolean;
    weeklyReport: boolean;
    teamActivity: boolean;
  };
  push: {
    reviewComplete: boolean;
    securityAlerts: boolean;
    mentions: boolean;
    systemUpdates: boolean;
  };
  inApp: {
    reviewComplete: boolean;
    securityAlerts: boolean;
    mentions: boolean;
    teamActivity: boolean;
  };
}

const NotificationSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: {
      reviewComplete: true,
      securityAlerts: true,
      weeklyReport: false,
      teamActivity: true,
    },
    push: {
      reviewComplete: true,
      securityAlerts: true,
      mentions: true,
      systemUpdates: false,
    },
    inApp: {
      reviewComplete: true,
      securityAlerts: true,
      mentions: true,
      teamActivity: true,
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const updatePreference = (category: keyof NotificationPreferences, key: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const savePreferences = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Notification preferences updated');
    } catch (error) {
      toast.error('Failed to update preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const Toggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ checked, onChange }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const NotificationSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    category: keyof NotificationPreferences;
    items: Array<{ key: string; label: string; description: string; icon?: React.ReactNode }>;
  }> = ({ title, icon, category, items }) => (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        {icon}
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
      </div>
      
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between">
            <div className="flex items-start space-x-3">
              {item.icon && <div className="mt-1">{item.icon}</div>}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
            </div>
            <Toggle
              checked={preferences[category][item.key as keyof typeof preferences[typeof category]]}
              onChange={(checked) => updatePreference(category, item.key, checked)}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Notification Settings
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Configure how and when you receive notifications
        </p>
      </div>

      {/* Email Notifications */}
      <NotificationSection
        title="Email Notifications"
        icon={<Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
        category="email"
        items={[
          {
            key: 'reviewComplete',
            label: 'Review Complete',
            description: 'Get notified when code reviews are finished',
            icon: <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
          },
          {
            key: 'securityAlerts',
            label: 'Security Alerts',
            description: 'Important security notifications and vulnerabilities',
            icon: <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />
          },
          {
            key: 'weeklyReport',
            label: 'Weekly Report',
            description: 'Summary of your team\'s code quality metrics',
            icon: <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          },
          {
            key: 'teamActivity',
            label: 'Team Activity',
            description: 'Updates about your team members\' activities',
            icon: <Bell className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          },
        ]}
      />

      {/* Push Notifications */}
      <NotificationSection
        title="Push Notifications"
        icon={<Smartphone className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
        category="push"
        items={[
          {
            key: 'reviewComplete',
            label: 'Review Complete',
            description: 'Instant notifications when reviews finish',
            icon: <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
          },
          {
            key: 'securityAlerts',
            label: 'Security Alerts',
            description: 'Critical security issues requiring immediate attention',
            icon: <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
          },
          {
            key: 'mentions',
            label: 'Mentions',
            description: 'When someone mentions you in comments or reviews',
            icon: <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          },
          {
            key: 'systemUpdates',
            label: 'System Updates',
            description: 'Platform updates and maintenance notifications',
            icon: <Bell className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          },
        ]}
      />

      {/* In-App Notifications */}
      <NotificationSection
        title="In-App Notifications"
        icon={<Bell className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
        category="inApp"
        items={[
          {
            key: 'reviewComplete',
            label: 'Review Complete',
            description: 'Show notifications within the application',
            icon: <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
          },
          {
            key: 'securityAlerts',
            label: 'Security Alerts',
            description: 'Display security warnings in the interface',
            icon: <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />
          },
          {
            key: 'mentions',
            label: 'Mentions',
            description: 'Highlight when you\'re mentioned in discussions',
            icon: <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          },
          {
            key: 'teamActivity',
            label: 'Team Activity',
            description: 'Show team member activities in the sidebar',
            icon: <Bell className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          },
        ]}
      />

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
        <motion.button
          onClick={savePreferences}
          disabled={isLoading}
          className="flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <Bell className="w-5 h-5 mr-2" />
          )}
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </motion.button>
      </div>
    </div>
  );
};

export default NotificationSettings;
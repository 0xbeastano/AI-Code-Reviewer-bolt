import React, { useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Key, 
  GitBranch,
  Zap,
  Users,
  Database,
  Brain
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Lazy load settings components
const ProfileSettings = lazy(() => import('../components/Settings/ProfileSettings'));
const SecuritySettings = lazy(() => import('../components/Settings/SecuritySettings'));
const NotificationSettings = lazy(() => import('../components/Settings/NotificationSettings'));
const ThemeSettings = lazy(() => import('../components/Settings/ThemeSettings'));
const APISettings = lazy(() => import('../components/Settings/APISettings'));
const IntegrationSettings = lazy(() => import('../components/Settings/IntegrationSettings'));
const TeamSettings = lazy(() => import('../components/Settings/TeamSettings'));
const BillingSettings = lazy(() => import('../components/Settings/BillingSettings'));
const AIUsageMonitor = lazy(() => import('../components/Settings/AIUsageMonitor'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-96">
    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'theme' | 'api' | 'integrations' | 'team' | 'billing' | 'ai-usage'>('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User, description: 'Manage your personal information' },
    { id: 'security', label: 'Security', icon: Shield, description: 'Password and authentication settings' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Configure notification preferences' },
    { id: 'theme', label: 'Appearance', icon: Palette, description: 'Customize the interface theme' },
    { id: 'api', label: 'API Keys', icon: Key, description: 'Manage API keys and tokens' },
    { id: 'integrations', label: 'Integrations', icon: GitBranch, description: 'Connect external services' },
    { id: 'ai-usage', label: 'AI Usage', icon: Brain, description: 'Monitor AI token usage and costs' },
    { id: 'team', label: 'Team', icon: Users, description: 'Manage team members and permissions', adminOnly: true },
    { id: 'billing', label: 'Billing', icon: Database, description: 'Subscription and usage information', adminOnly: true }
  ] as const;

  const visibleTabs = tabs.filter(tab => 
    !tab.adminOnly || user?.role === 'admin'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                className={`w-full flex items-start space-x-3 px-3 py-3 text-left rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className={`w-5 h-5 mt-0.5 ${
                  activeTab === tab.id 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-gray-400'
                }`} />
                <div>
                  <p className="font-medium">{tab.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {tab.description}
                  </p>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <Suspense fallback={<LoadingFallback />}>
              {activeTab === 'profile' && <ProfileSettings />}
              {activeTab === 'security' && <SecuritySettings />}
              {activeTab === 'notifications' && <NotificationSettings />}
              {activeTab === 'theme' && <ThemeSettings />}
              {activeTab === 'api' && <APISettings />}
              {activeTab === 'integrations' && <IntegrationSettings />}
              {activeTab === 'team' && <TeamSettings />}
              {activeTab === 'billing' && <BillingSettings />}
              {activeTab === 'ai-usage' && <AIUsageMonitor userId={user?.id} />}
            </Suspense>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
import React, { useState } from 'react';
import { CreditCard, Download, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const BillingSettings: React.FC = () => {
  const [currentPlan] = useState({
    name: 'Professional',
    price: 49,
    billing: 'monthly' as 'monthly' | 'yearly',
    features: [
      'Unlimited repositories',
      'Advanced security scanning',
      'Team collaboration',
      'Priority support',
      'Custom integrations'
    ]
  });

  const [usage] = useState({
    repositories: { used: 12, limit: 'unlimited' },
    reviews: { used: 156, limit: 1000 },
    storage: { used: 2.4, limit: 10 }, // GB
    teamMembers: { used: 5, limit: 10 }
  });

  const [invoices] = useState([
    {
      id: 'INV-2024-001',
      date: new Date('2024-01-01'),
      amount: 49,
      status: 'paid',
      downloadUrl: '#'
    },
    {
      id: 'INV-2023-012',
      date: new Date('2023-12-01'),
      amount: 49,
      status: 'paid',
      downloadUrl: '#'
    },
    {
      id: 'INV-2023-011',
      date: new Date('2023-11-01'),
      amount: 49,
      status: 'paid',
      downloadUrl: '#'
    }
  ]);

  const plans = [
    {
      name: 'Starter',
      price: 0,
      billing: 'monthly',
      features: ['5 repositories', 'Basic scanning', 'Community support'],
      current: false
    },
    {
      name: 'Professional',
      price: 49,
      billing: 'monthly',
      features: ['Unlimited repositories', 'Advanced scanning', 'Team collaboration', 'Priority support'],
      current: true
    },
    {
      name: 'Enterprise',
      price: 199,
      billing: 'monthly',
      features: ['Everything in Pro', 'SSO integration', 'Custom deployment', 'Dedicated support'],
      current: false
    }
  ];

  const getUsagePercentage = (used: number, limit: number | string) => {
    if (limit === 'unlimited') return 0;
    return Math.min((used / (limit as number)) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
    if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
    return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Billing & Usage
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage your subscription and view usage statistics
        </p>
      </div>

      {/* Current Plan */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Current Plan: {currentPlan.name}
            </h3>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-1">
              ${currentPlan.price}/{currentPlan.billing === 'monthly' ? 'month' : 'year'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Next billing date: February 1, 2024
            </p>
          </div>
          <div className="text-right">
            <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors">
              Manage Plan
            </button>
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Usage This Month
            </h3>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Repositories</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {usage.repositories.used} / {usage.repositories.limit}
                </span>
              </div>
              {usage.repositories.limit !== 'unlimited' && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${getUsagePercentage(usage.repositories.used, usage.repositories.limit)}%` }}
                  />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Code Reviews</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {usage.reviews.used} / {usage.reviews.limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${getUsagePercentage(usage.reviews.used, usage.reviews.limit)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Storage</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {usage.storage.used} GB / {usage.storage.limit} GB
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${getUsagePercentage(usage.storage.used, usage.storage.limit)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Team Members</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {usage.teamMembers.used} / {usage.teamMembers.limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${getUsagePercentage(usage.teamMembers.used, usage.teamMembers.limit)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Available Plans
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Choose the plan that best fits your needs
          </p>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              className={`p-6 border-2 rounded-lg transition-all ${
                plan.current
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
              }`}
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-center">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h4>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  ${plan.price}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  per {plan.billing === 'monthly' ? 'month' : 'year'}
                </p>
                
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    plan.current
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700 text-white'
                  }`}
                  disabled={plan.current}
                >
                  {plan.current ? 'Current Plan' : 'Upgrade'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CreditCard className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Payment Method
          </h3>
        </div>

        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                •••• •••• •••• 4242
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Expires 12/25
              </p>
            </div>
          </div>
          <button className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
            Update
          </button>
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Billing History
            </h3>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="p-6 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {invoice.id}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {invoice.date.toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="font-medium text-gray-900 dark:text-white">
                  ${invoice.amount}
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded">
                  {invoice.status}
                </span>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BillingSettings;
import React, { useState } from 'react';
import { Settings, Shield, Zap, Eye, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import { Repository, CodeReviewRequest } from '../../types/codeReview';

interface AnalysisConfigurationProps {
  repository: Repository;
  onComplete: (config: CodeReviewRequest) => void;
  loading: boolean;
}

const AnalysisConfiguration: React.FC<AnalysisConfigurationProps> = ({
  repository,
  onComplete,
  loading
}) => {
  const [config, setConfig] = useState<Partial<CodeReviewRequest>>({
    repositoryId: repository.id,
    priority: 'normal',
    scope: 'full',
    options: {
      generatePR: false,
      autoApply: false,
      notifyTeam: true,
      runTests: true
    }
  });

  const handleSubmit = () => {
    onComplete(config as CodeReviewRequest);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Configure Analysis
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Customize the AI review process for {repository.name}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-6">
          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Review Priority
            </label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {(['low', 'normal', 'high', 'urgent'] as const).map((priority) => (
                <button
                  key={priority}
                  onClick={() => setConfig(prev => ({ ...prev, priority }))}
                  className={`p-3 border-2 rounded-lg text-center transition-all ${
                    config.priority === priority
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  }`}
                >
                  <span className="font-medium capitalize">{priority}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Scope */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Analysis Scope
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(['full', 'incremental', 'files'] as const).map((scope) => (
                <button
                  key={scope}
                  onClick={() => setConfig(prev => ({ ...prev, scope }))}
                  className={`p-3 border-2 rounded-lg text-center transition-all ${
                    config.scope === scope
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  }`}
                >
                  <span className="font-medium capitalize">{scope}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Review Options
            </label>
            <div className="space-y-3">
              {[
                { key: 'generatePR', label: 'Generate Pull Request', description: 'Automatically create a PR with improvements' },
                { key: 'autoApply', label: 'Auto-apply Safe Changes', description: 'Apply low-risk improvements automatically' },
                { key: 'notifyTeam', label: 'Notify Team', description: 'Send notifications to team members' },
                { key: 'runTests', label: 'Run Tests', description: 'Execute test suite after improvements' }
              ].map((option) => (
                <div key={option.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{option.description}</p>
                  </div>
                  <button
                    onClick={() => setConfig(prev => ({
                      ...prev,
                      options: {
                        ...prev.options!,
                        [option.key]: !prev.options![option.key as keyof typeof prev.options]
                      }
                    }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.options?.[option.key as keyof typeof config.options]
                        ? 'bg-primary-600'
                        : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.options?.[option.key as keyof typeof config.options]
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <motion.button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Settings className="w-5 h-5 mr-2" />
            )}
            {loading ? 'Starting Review...' : 'Start Review'}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisConfiguration;
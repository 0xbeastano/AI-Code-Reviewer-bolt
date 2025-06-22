import React from 'react';
import { Settings, Shield, Zap, Eye, Wrench } from 'lucide-react';
import { ReviewConfig } from '../../types';
import Toggle from '../UI/Toggle';

interface ConfigurationPanelProps {
  config: ReviewConfig;
  onConfigChange: (config: ReviewConfig) => void;
  onStartAnalysis: () => void;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  config,
  onConfigChange,
  onStartAnalysis,
}) => {
  const updatePriorities = (key: keyof ReviewConfig['priorities'], value: boolean) => {
    onConfigChange({
      ...config,
      priorities: { ...config.priorities, [key]: value },
    });
  };

  const updateAggressiveness = (level: ReviewConfig['aggressiveness']) => {
    onConfigChange({ ...config, aggressiveness: level });
  };

  const updateExcludePatterns = (patterns: string) => {
    onConfigChange({
      ...config,
      excludePatterns: patterns.split('\n').filter(p => p.trim()),
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full mx-auto mb-4">
          <Settings className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Configure Analysis
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Customize the AI review process to match your specific requirements and priorities
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 space-y-8">
          {/* Review Priorities */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Review Priorities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Security</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Vulnerability detection and fixes
                    </p>
                  </div>
                </div>
                <Toggle
                  id="security-toggle"
                  checked={config.priorities.security}
                  onChange={(checked) => updatePriorities('security', checked)}
                  label="Security Priority"
                  description="Enable security vulnerability detection and fixes"
                  persistKey="security_priority"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Performance</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Optimization opportunities
                    </p>
                  </div>
                </div>
                <Toggle
                  id="performance-toggle"
                  checked={config.priorities.performance}
                  onChange={(checked) => updatePriorities('performance', checked)}
                  label="Performance Priority"
                  description="Enable performance optimization detection"
                  persistKey="performance_priority"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Readability</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Code clarity and style
                    </p>
                  </div>
                </div>
                <Toggle
                  id="readability-toggle"
                  checked={config.priorities.readability}
                  onChange={(checked) => updatePriorities('readability', checked)}
                  label="Readability Priority"
                  description="Enable code clarity and style improvements"
                  persistKey="readability_priority"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Wrench className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Maintainability</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Long-term code health
                    </p>
                  </div>
                </div>
                <Toggle
                  id="maintainability-toggle"
                  checked={config.priorities.maintainability}
                  onChange={(checked) => updatePriorities('maintainability', checked)}
                  label="Maintainability Priority"
                  description="Enable long-term code health improvements"
                  persistKey="maintainability_priority"
                />
              </div>
            </div>
          </div>

          {/* Aggressiveness Level */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Improvement Aggressiveness
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['conservative', 'moderate', 'aggressive'] as const).map((level) => (
                <label
                  key={level}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-900 ${
                    config.aggressiveness === level
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="aggressiveness"
                    value={level}
                    checked={config.aggressiveness === level}
                    onChange={() => updateAggressiveness(level)}
                    className="sr-only"
                    aria-describedby={`${level}-description`}
                  />
                  <div className="text-center">
                    <p className="font-medium text-gray-900 dark:text-white capitalize mb-2">
                      {level}
                    </p>
                    <p id={`${level}-description`} className="text-sm text-gray-600 dark:text-gray-400">
                      {level === 'conservative' && 'Minimal changes, focus on critical issues'}
                      {level === 'moderate' && 'Balanced approach with reasonable improvements'}
                      {level === 'aggressive' && 'Comprehensive refactoring and optimization'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Exclude Patterns */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Exclude Patterns
            </h3>
            <div className="space-y-2">
              <label htmlFor="exclude-patterns" className="sr-only">
                File patterns to exclude from analysis
              </label>
              <textarea
                id="exclude-patterns"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={4}
                placeholder="node_modules/**&#10;*.min.js&#10;dist/**&#10;build/**"
                value={config.excludePatterns.join('\n')}
                onChange={(e) => updateExcludePatterns(e.target.value)}
                aria-describedby="exclude-patterns-help"
              />
              <p id="exclude-patterns-help" className="text-sm text-gray-600 dark:text-gray-400">
                Enter file patterns to exclude from analysis, one per line
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-xl">
          <div className="flex justify-center">
            <button
              onClick={onStartAnalysis}
              className="px-8 py-3 bg-primary-600 hover:bg-primary-700 focus:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-describedby="start-analysis-help"
            >
              Start AI Analysis
            </button>
            <p id="start-analysis-help" className="sr-only">
              Begin the AI-powered code analysis with your selected configuration
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationPanel;
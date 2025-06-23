import React, { useState } from 'react';
import { Settings, Shield, Zap, Eye, Wrench, Code, FileCode, Database, Sparkles } from 'lucide-react';
import { ReviewConfig } from '../../types';
import Toggle from '../UI/Toggle';
import { motion } from 'framer-motion';

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
  const [isLoading, setIsLoading] = useState(false);
  
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
  
  const handleStartAnalysis = () => {
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
      onStartAnalysis();
    }, 1000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-ai rounded-full mx-auto mb-4">
          <Settings className="w-8 h-8 text-white" />
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
              Review Priorities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/10 dark:to-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              >
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
              </motion.div>

              <motion.div 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/10 dark:to-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              >
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
              </motion.div>

              <motion.div 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              >
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
              </motion.div>

              <motion.div 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/10 dark:to-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              >
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
              </motion.div>
            </div>
          </div>

          {/* Aggressiveness Level */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Code className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
              Improvement Aggressiveness
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['conservative', 'moderate', 'aggressive'] as const).map((level) => (
                <motion.label
                  key={level}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-900 ${
                    config.aggressiveness === level
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                  }`}
                  whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
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
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                      level === 'conservative' 
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                        : level === 'moderate'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    }`}>
                      {level === 'conservative' && <Shield className="w-6 h-6" />}
                      {level === 'moderate' && <Code className="w-6 h-6" />}
                      {level === 'aggressive' && <Zap className="w-6 h-6" />}
                    </div>
                    
                    <p className="font-medium text-gray-900 dark:text-white capitalize mb-2">
                      {level}
                    </p>
                    <p id={`${level}-description`} className="text-sm text-gray-600 dark:text-gray-400">
                      {level === 'conservative' && 'Minimal changes, focus on critical issues'}
                      {level === 'moderate' && 'Balanced approach with reasonable improvements'}
                      {level === 'aggressive' && 'Comprehensive refactoring and optimization'}
                    </p>
                  </div>
                </motion.label>
              ))}
            </div>
          </div>

          {/* Exclude Patterns */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FileCode className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
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
            <motion.button
              onClick={handleStartAnalysis}
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-ai hover:opacity-90 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              whileHover={{ scale: isLoading ? 1 : 1.05 }}
              whileTap={{ scale: isLoading ? 1 : 0.95 }}
              aria-describedby="start-analysis-help"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Starting Analysis...
                </>
              ) : (
                <>
                  <Database className="w-5 h-5 mr-2" />
                  Start AI Analysis
                </>
              )}
            </motion.button>
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
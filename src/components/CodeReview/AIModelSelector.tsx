import React, { useState } from 'react';
import { Brain, Zap, Shield, Clock, DollarSign, Info, ChevronDown, Star, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  tpm: number; // Tokens per minute
  contextWindow: number;
  costPer1kTokens: number;
  strengths: string[];
  bestFor: string[];
  speed: 'fast' | 'medium' | 'slow';
  accuracy: number; // 1-100
  recommended?: boolean;
}

interface AIModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  codebaseSize: number; // in KB
  fileCount: number;
}

const AIModelSelector: React.FC<AIModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  codebaseSize,
  fileCount
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const models: AIModel[] = [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'OpenAI',
      description: 'Latest GPT-4 with optimized performance and larger context window',
      tpm: 30000,
      contextWindow: 128000,
      costPer1kTokens: 0.005,
      strengths: ['Large context', 'Fast processing', 'Excellent reasoning'],
      bestFor: ['Large codebases', 'Complex analysis', 'Multi-file projects'],
      speed: 'fast',
      accuracy: 95,
      recommended: true
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'OpenAI',
      description: 'High-performance GPT-4 with enhanced speed and efficiency',
      tpm: 40000,
      contextWindow: 128000,
      costPer1kTokens: 0.01,
      strengths: ['Very fast', 'Large context', 'Cost effective'],
      bestFor: ['Quick analysis', 'Medium projects', 'Rapid prototyping'],
      speed: 'fast',
      accuracy: 93
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'OpenAI',
      description: 'Original GPT-4 with exceptional reasoning and code understanding',
      tpm: 10000,
      contextWindow: 8192,
      costPer1kTokens: 0.03,
      strengths: ['Deep reasoning', 'High accuracy', 'Proven reliability'],
      bestFor: ['Critical analysis', 'Security reviews', 'Small to medium files'],
      speed: 'medium',
      accuracy: 97
    },
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      provider: 'Anthropic',
      description: 'Most capable Claude model with superior reasoning and analysis',
      tpm: 20000,
      contextWindow: 200000,
      costPer1kTokens: 0.015,
      strengths: ['Largest context', 'Excellent reasoning', 'Detailed analysis'],
      bestFor: ['Very large codebases', 'Comprehensive reviews', 'Documentation'],
      speed: 'medium',
      accuracy: 96
    },
    {
      id: 'claude-3-sonnet',
      name: 'Claude 3 Sonnet',
      provider: 'Anthropic',
      description: 'Balanced Claude model offering good performance and cost efficiency',
      tpm: 40000,
      contextWindow: 200000,
      costPer1kTokens: 0.003,
      strengths: ['Fast processing', 'Large context', 'Cost efficient'],
      bestFor: ['Regular analysis', 'Batch processing', 'Continuous integration'],
      speed: 'fast',
      accuracy: 91
    },
    {
      id: 'claude-3-haiku',
      name: 'Claude 3 Haiku',
      provider: 'Anthropic',
      description: 'Fastest Claude model optimized for speed and efficiency',
      tpm: 100000,
      contextWindow: 200000,
      costPer1kTokens: 0.00025,
      strengths: ['Ultra fast', 'Very cost effective', 'High throughput'],
      bestFor: ['Quick scans', 'Style checks', 'Simple analysis'],
      speed: 'fast',
      accuracy: 85
    }
  ];

  const selectedModelData = models.find(m => m.id === selectedModel) || models[0];

  const getRecommendation = () => {
    if (codebaseSize > 10000 || fileCount > 50) {
      return models.find(m => m.id === 'claude-3-opus') || models[0];
    } else if (codebaseSize > 5000 || fileCount > 20) {
      return models.find(m => m.id === 'gpt-4o') || models[0];
    } else {
      return models.find(m => m.id === 'gpt-4-turbo') || models[0];
    }
  };

  const recommendedModel = getRecommendation();

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case 'fast': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'slow': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getSpeedIcon = (speed: string) => {
    switch (speed) {
      case 'fast': return <Zap className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'slow': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          AI Model Selection
        </label>
        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          <Info className="w-3 h-3" />
          <span>Choose based on your needs</span>
        </div>
      </div>

      {/* Recommendation Banner */}
      {recommendedModel.id !== selectedModel && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Recommended for your codebase: {recommendedModel.name}
            </span>
            <button
              onClick={() => onModelChange(recommendedModel.id)}
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Use This
            </button>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
            Based on {fileCount} files and {Math.round(codebaseSize)}KB size
          </p>
        </motion.div>
      )}

      {/* Model Selector */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-400 dark:hover:border-primary-500 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <span className="font-medium text-gray-900 dark:text-white">
                {selectedModelData.name}
              </span>
              {selectedModelData.recommended && (
                <Star className="w-4 h-4 text-yellow-500" />
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                {getSpeedIcon(selectedModelData.speed)}
                <span className={getSpeedColor(selectedModelData.speed)}>
                  {selectedModelData.speed}
                </span>
              </div>
              <span>{selectedModelData.tpm.toLocaleString()} TPM</span>
              <span>${selectedModelData.costPer1kTokens}/1K tokens</span>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
            >
              {models.map((model) => (
                <motion.button
                  key={model.id}
                  onClick={() => {
                    onModelChange(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors ${
                    selectedModel === model.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {model.name}
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                          {model.provider}
                        </span>
                        {model.recommended && (
                          <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded flex items-center">
                            <Star className="w-3 h-3 mr-1" />
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {model.description}
                      </p>
                      
                      {/* Model Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-xs">
                            <Zap className="w-3 h-3" />
                            <span className="text-gray-500 dark:text-gray-400">Speed:</span>
                            <span className={getSpeedColor(model.speed)}>{model.speed}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs">
                            <Clock className="w-3 h-3" />
                            <span className="text-gray-500 dark:text-gray-400">TPM:</span>
                            <span className="text-gray-900 dark:text-white">{model.tpm.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-xs">
                            <Shield className="w-3 h-3" />
                            <span className="text-gray-500 dark:text-gray-400">Accuracy:</span>
                            <span className="text-gray-900 dark:text-white">{model.accuracy}%</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs">
                            <DollarSign className="w-3 h-3" />
                            <span className="text-gray-500 dark:text-gray-400">Cost:</span>
                            <span className="text-gray-900 dark:text-white">${model.costPer1kTokens}/1K</span>
                          </div>
                        </div>
                      </div>

                      {/* Best For */}
                      <div className="mb-2">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Best for:</p>
                        <div className="flex flex-wrap gap-1">
                          {model.bestFor.map((use, index) => (
                            <span
                              key={index}
                              className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded"
                            >
                              {use}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Strengths */}
                      <div>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Strengths:</p>
                        <div className="flex flex-wrap gap-1">
                          {model.strengths.map((strength, index) => (
                            <span
                              key={index}
                              className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded"
                            >
                              {strength}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected Model Details */}
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {selectedModelData.tpm.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Tokens/Minute</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {(selectedModelData.contextWindow / 1000).toFixed(0)}K
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Context Window</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {selectedModelData.accuracy}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
          </div>
        </div>
      </div>

      {/* Usage Recommendations */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          💡 Model Selection Tips
        </h4>
        <ul className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
          <li>• <strong>Large codebases (&gt;10MB):</strong> Use Claude 3 Opus for maximum context</li>
          <li>• <strong>Quick analysis:</strong> GPT-4 Turbo or Claude 3 Haiku for speed</li>
          <li>• <strong>Security reviews:</strong> GPT-4 for highest accuracy</li>
          <li>• <strong>Cost optimization:</strong> Claude 3 Haiku for bulk processing</li>
          <li>• <strong>Balanced performance:</strong> GPT-4o for most use cases</li>
        </ul>
      </div>
    </div>
  );
};

export default AIModelSelector;
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Code, Sparkles, Copy, Check, FileCode, AlertCircle, Zap, Eye } from 'lucide-react';
import { AIService } from '../../services/aiService';
import CodeEditor from '../CodeEditor/CodeEditor';
import toast from 'react-hot-toast';

interface CodeExplainerProps {
  code: string;
  language: string;
  filePath: string;
  onClose?: () => void;
}

const CodeExplainer: React.FC<CodeExplainerProps> = ({
  code,
  language,
  filePath,
  onClose
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<{
    explanation: string;
    complexity: string;
    keyComponents: string[];
    potentialIssues: string[];
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const aiService = AIService.getInstance();

  const handleExplain = async () => {
    setIsLoading(true);
    try {
      const result = await aiService.explainCode(code, language);
      setExplanation(result);
    } catch (error) {
      console.error('Failed to explain code:', error);
      toast.error('Failed to generate code explanation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Explanation copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-ai rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Code Explainer
            </h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <FileCode className="w-4 h-4 mr-1 text-primary-600 dark:text-primary-400" />
              {filePath}
            </h4>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {language.charAt(0).toUpperCase() + language.slice(1)}
            </div>
          </div>
          <div className="h-48 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            <CodeEditor
              value={code}
              language={language}
              height="100%"
              readOnly
            />
          </div>
        </div>

        {!explanation && !isLoading && (
          <motion.button
            onClick={handleExplain}
            className="w-full flex items-center justify-center px-4 py-3 bg-gradient-ai hover:opacity-90 text-white font-medium rounded-lg transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Explain This Code
          </motion.button>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="w-12 h-12 text-primary-600 dark:text-primary-400" />
            </motion.div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Generating explanation...
            </p>
          </div>
        )}

        <AnimatePresence>
          {explanation && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <Brain className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
                    Explanation
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {explanation.explanation}
                  </p>
                  <motion.button
                    onClick={() => handleCopy(explanation.explanation)}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                    <Code className="w-4 h-4 text-primary-600 dark:text-primary-400 mr-2" />
                    Complexity
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {explanation.complexity}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                    <Eye className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                    Key Components
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    {explanation.keyComponents.map((component, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="list-disc list-inside"
                      >
                        {component}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                    <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mr-2" />
                    Potential Issues
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    {explanation.potentialIssues.map((issue, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        className="list-disc list-inside"
                      >
                        {issue}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-end">
                <motion.button
                  onClick={handleExplain}
                  className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Regenerate Explanation
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CodeExplainer;
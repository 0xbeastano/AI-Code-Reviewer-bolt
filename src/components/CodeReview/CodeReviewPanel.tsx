import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Brain, 
  Sparkles, 
  Play, 
  Code, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Zap 
} from 'lucide-react';
import CodeEditor from '../CodeEditor/CodeEditor';
import CodeExplainer from '../CodeExplainer/CodeExplainer';
import TestGenerator from '../TestGenerator/TestGenerator';
import { AIService } from '../../services/aiService';
import toast from 'react-hot-toast';

interface CodeReviewPanelProps {
  filePath: string;
  code: string;
  language: string;
  issues?: any[];
  suggestions?: any[];
  metrics?: any;
}

const CodeReviewPanel: React.FC<CodeReviewPanelProps> = ({
  filePath,
  code,
  language,
  issues = [],
  suggestions = [],
  metrics = {}
}) => {
  const [activeTab, setActiveTab] = useState<'code' | 'explain' | 'test'>('code');
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<any>(null);
  const [testData, setTestData] = useState<any>(null);

  const aiService = AIService.getInstance();

  const handleExplainCode = async () => {
    if (explanation) {
      setActiveTab('explain');
      return;
    }

    setIsLoading(true);
    setActiveTab('explain');
    
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

  const handleGenerateTests = async () => {
    if (testData) {
      setActiveTab('test');
      return;
    }

    setIsLoading(true);
    setActiveTab('test');
    
    try {
      const result = await aiService.generateTests(code, language, filePath);
      setTestData(result);
    } catch (error) {
      console.error('Failed to generate tests:', error);
      toast.error('Failed to generate test cases');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'code'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Code className="w-4 h-4 mr-2" />
            Code
          </button>
          <button
            onClick={handleExplainCode}
            className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'explain'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Brain className="w-4 h-4 mr-2" />
            Explain
          </button>
          <button
            onClick={handleGenerateTests}
            className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'test'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Play className="w-4 h-4 mr-2" />
            Test
          </button>
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'code' && (
            <motion.div
              key="code"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    <FileText className="w-4 h-4 mr-1 text-primary-600 dark:text-primary-400" />
                    {filePath}
                  </h3>
                  <div className="flex space-x-2">
                    {issues.length > 0 && (
                      <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {issues.length} issues
                      </span>
                    )}
                    {suggestions.length > 0 && (
                      <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full flex items-center">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {suggestions.length} suggestions
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-[500px] overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  <CodeEditor
                    value={code}
                    language={language}
                    height="100%"
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {metrics.security && (
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-2 mb-2">
                      <Eye className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Security</h4>
                    </div>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${metrics.security}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {metrics.security}%
                      </span>
                    </div>
                  </div>
                )}

                {metrics.performance && (
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Performance</h4>
                    </div>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${metrics.performance}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {metrics.performance}%
                      </span>
                    </div>
                  </div>
                )}

                {metrics.maintainability && (
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Maintainability</h4>
                    </div>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${metrics.maintainability}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {metrics.maintainability}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'explain' && (
            <motion.div
              key="explain"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
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
              ) : (
                <CodeExplainer
                  code={code}
                  language={language}
                  filePath={filePath}
                />
              )}
            </motion.div>
          )}

          {activeTab === 'test' && (
            <motion.div
              key="test"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Play className="w-12 h-12 text-primary-600 dark:text-primary-400" />
                  </motion.div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Generating test cases...
                  </p>
                </div>
              ) : (
                <TestGenerator
                  code={code}
                  language={language}
                  filePath={filePath}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CodeReviewPanel;
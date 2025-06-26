import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, FileCode, Code, Copy, Check, Download, RefreshCw, Sparkles } from 'lucide-react';
import { AIService } from '../../services/aiService';
import CodeEditor from '../CodeEditor/CodeEditor';
import toast from 'react-hot-toast';

interface TestGeneratorProps {
  code: string;
  language: string;
  filePath: string;
  onClose?: () => void;
}

const TestGenerator: React.FC<TestGeneratorProps> = ({
  code,
  language,
  filePath,
  onClose
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [testData, setTestData] = useState<{
    testCode: string;
    testCases: Array<{
      description: string;
      input: string;
      expectedOutput: string;
    }>;
    coverage: number;
    framework: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const aiService = AIService.getInstance();

  const handleGenerateTests = async () => {
    setIsLoading(true);
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

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Test code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleDownload = () => {
    if (!testData) return;
    
    const fileName = filePath.split('/').pop() || 'code';
    const extension = language === 'javascript' ? '.test.js' : 
                      language === 'typescript' ? '.test.ts' : 
                      language === 'python' ? '_test.py' : '.test.txt';
    
    const testFileName = fileName.replace(/\.[^/.]+$/, '') + extension;
    
    const blob = new Blob([testData.testCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = testFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`Downloaded ${testFileName}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-ai rounded-lg">
              <Play className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Test Generator
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
              title="Source Code"
            />
          </div>
        </div>

        {!testData && !isLoading && (
          <motion.button
            onClick={handleGenerateTests}
            className="w-full flex items-center justify-center px-4 py-3 bg-gradient-ai hover:opacity-90 text-white font-medium rounded-lg transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Play className="w-5 h-5 mr-2" />
            Generate Test Cases
          </motion.button>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="w-12 h-12 text-primary-600 dark:text-primary-400" />
            </motion.div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Generating test cases...
            </p>
          </div>
        )}

        <AnimatePresence>
          {testData && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                    <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                    Test Coverage: {testData.coverage}%
                  </h4>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Framework: {testData.framework}
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-green-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${testData.coverage}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                    <Code className="w-4 h-4 text-primary-600 dark:text-primary-400 mr-2" />
                    Generated Test Code
                  </h4>
                  <div className="flex space-x-2">
                    <motion.button
                      onClick={() => handleCopy(testData.testCode)}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Copy test code"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </motion.button>
                    <motion.button
                      onClick={handleDownload}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Download test file"
                    >
                      <Download className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <CodeEditor
                    value={testData.testCode}
                    language={language}
                    height="300px"
                    readOnly
                    title="Test Code"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <Play className="w-4 h-4 text-primary-600 dark:text-primary-400 mr-2" />
                  Test Cases
                </h4>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {testData.testCases.map((testCase, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                    >
                      <h5 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                        {testCase.description}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 mb-1">Input:</p>
                          <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                            {testCase.input}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 mb-1">Expected Output:</p>
                          <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                            {testCase.expectedOutput}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <motion.button
                  onClick={handleGenerateTests}
                  className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate Tests
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TestGenerator;
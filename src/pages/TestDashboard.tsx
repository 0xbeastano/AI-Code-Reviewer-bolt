import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Github,
  Chrome,
  Download,
  RefreshCw,
  Bug,
  Shield,
  Zap
} from 'lucide-react';
import { testRunner, TestSuite, TestResult } from '../utils/testRunner';
import { authService } from '../lib/auth';
import GitHubAuthTest from '../components/TestDashboard/GitHubAuthTest';

const TestDashboard: React.FC = () => {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    try {
      const suites = await testRunner.runAllTests();
      setTestSuites(suites);
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'failed':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const exportResults = () => {
    const results = {
      timestamp: new Date().toISOString(),
      testSuites,
      environment: {
        isDemoMode: authService.isDemoMode(),
        githubConfigured: !!import.meta.env.VITE_GITHUB_CLIENT_ID,
        googleConfigured: !!import.meta.env.VITE_GOOGLE_CLIENT_ID,
      }
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oauth-test-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            OAuth & GitHub Integration Test Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive testing suite for authentication and integration functionality
          </p>
        </div>

        {/* Test Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Test Execution
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Run comprehensive OAuth and GitHub integration tests
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={exportResults}
                disabled={testSuites.length === 0}
                className="flex items-center px-4 py-2 bg-secondary-600 hover:bg-secondary-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Results
              </button>
              
              <motion.button
                onClick={runTests}
                disabled={isRunning}
                className="flex items-center px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                whileHover={{ scale: isRunning ? 1 : 1.02 }}
                whileTap={{ scale: isRunning ? 1 : 0.98 }}
              >
                {isRunning ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {isRunning ? 'Running Tests...' : 'Run All Tests'}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Environment Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <Github className="w-8 h-8 text-gray-900 dark:text-white" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">GitHub OAuth</h3>
                <p className={`text-sm ${import.meta.env.VITE_GITHUB_CLIENT_ID ? 'text-green-600' : 'text-red-600'}`}>
                  {import.meta.env.VITE_GITHUB_CLIENT_ID ? 'Configured' : 'Not Configured'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <Chrome className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Google OAuth</h3>
                <p className={`text-sm ${import.meta.env.VITE_GOOGLE_CLIENT_ID ? 'text-green-600' : 'text-red-600'}`}>
                  {import.meta.env.VITE_GOOGLE_CLIENT_ID ? 'Configured' : 'Not Configured'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-purple-600" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Environment</h3>
                <p className="text-sm text-blue-600">
                  {authService.isDemoMode() ? 'Demo Mode' : 'Production Mode'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* GitHub Auth Test Component */}
        <div className="mb-8">
          <GitHubAuthTest />
        </div>

        {/* Test Results */}
        {testSuites.length > 0 && (
          <div className="space-y-6">
            {testSuites.map((suite, index) => (
              <motion.div
                key={suite.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {suite.name}
                    </h3>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {suite.summary.passed}/{suite.summary.total} passed
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        suite.summary.failed === 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {suite.summary.failed === 0 ? 'All Passed' : `${suite.summary.failed} Failed`}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-3">
                    {suite.tests.map((test) => (
                      <div
                        key={test.testId}
                        className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(test.status)}
                            <div>
                              <h4 className="font-medium">{test.testName}</h4>
                              <p className="text-sm opacity-75">ID: {test.testId}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{test.duration}ms</div>
                            {test.error && (
                              <div className="text-xs text-red-600 mt-1 max-w-xs truncate">
                                {test.error}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Manual Testing Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
            Manual Testing Instructions
          </h3>
          <div className="space-y-3 text-sm text-blue-700 dark:text-blue-300">
            <div>
              <strong>1. GitHub OAuth Flow:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Navigate to /auth and click "Continue with GitHub"</li>
                <li>• Verify redirect to GitHub authorization page</li>
                <li>• Complete authorization and verify successful return</li>
                <li>• Check that user session is created with GitHub data</li>
              </ul>
            </div>
            <div>
              <strong>2. Google OAuth Flow:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Navigate to /auth and click "Continue with Google"</li>
                <li>• Verify redirect to Google authorization page</li>
                <li>• Complete authorization and verify successful return</li>
                <li>• Check that user session is created with Google data</li>
              </ul>
            </div>
            <div>
              <strong>3. GitHub Integration:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• After GitHub OAuth, navigate to Settings → Integrations</li>
                <li>• Verify repository list loads correctly</li>
                <li>• Test repository selection and analysis features</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDashboard;
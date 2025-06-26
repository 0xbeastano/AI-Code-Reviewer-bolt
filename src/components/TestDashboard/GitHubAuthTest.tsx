import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Github, CheckCircle, XCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { useAuth } from '../Auth/AuthProvider';
import { authService } from '../../lib/auth';
import toast from 'react-hot-toast';

const GitHubAuthTest: React.FC = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [repositories, setRepositories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<{
    configTest: 'passed' | 'failed' | 'pending';
    authTest: 'passed' | 'failed' | 'pending';
    repoTest: 'passed' | 'failed' | 'pending';
    apiTest: 'passed' | 'failed' | 'pending';
  }>({
    configTest: 'pending',
    authTest: 'pending',
    repoTest: 'pending',
    apiTest: 'pending',
  });

  useEffect(() => {
    checkGitHubConnection();
    runConfigTest();
  }, [user]);

  const checkGitHubConnection = async () => {
    const isGitHubConnected = user?.app_metadata?.provider === 'github' || !!user?.user_metadata?.user_name;
    setIsConnected(isGitHubConnected);
    
    if (isGitHubConnected) {
      setTestResults(prev => ({ ...prev, authTest: 'passed' }));
      await fetchRepositories();
    } else {
      setTestResults(prev => ({ ...prev, authTest: 'failed' }));
    }
  };

  const runConfigTest = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    if (clientId && clientId !== 'your-github-client-id') {
      setTestResults(prev => ({ ...prev, configTest: 'passed' }));
    } else {
      setTestResults(prev => ({ ...prev, configTest: 'failed' }));
    }
  };

  const fetchRepositories = async () => {
    setIsLoading(true);
    try {
      const { repositories: repos, error } = await authService.getGitHubRepositories();
      
      if (error) {
        toast.error(error);
        setTestResults(prev => ({ ...prev, repoTest: 'failed' }));
      } else {
        setRepositories(repos);
        setTestResults(prev => ({ ...prev, repoTest: 'passed' }));
        
        // Test API access
        try {
          const response = await fetch('https://api.github.com/rate_limit', {
            headers: {
              Authorization: `token ${user?.provider_token}`
            }
          });
          if (response.ok) {
            setTestResults(prev => ({ ...prev, apiTest: 'passed' }));
          } else {
            setTestResults(prev => ({ ...prev, apiTest: 'failed' }));
          }
        } catch (error) {
          setTestResults(prev => ({ ...prev, apiTest: 'failed' }));
        }
      }
    } catch (error) {
      toast.error('Failed to fetch repositories');
      setTestResults(prev => ({ ...prev, repoTest: 'failed' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectGitHub = async () => {
    try {
      // Store current location for redirect after auth
      sessionStorage.setItem('auth_return_to', window.location.pathname);
      
      const { error } = await authService.signInWithGitHub();
      
      if (error) {
        toast.error(error.message);
      }
      // Redirect is handled in the signInWithGitHub function
    } catch (error) {
      toast.error('Failed to connect GitHub');
    }
  };

  const getStatusIcon = (status: 'passed' | 'failed' | 'pending') => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'pending':
        return <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Github className="w-6 h-6 text-gray-900 dark:text-white" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            GitHub Authentication Test
          </h3>
        </div>
        
        {!isConnected ? (
          <motion.button
            onClick={handleConnectGitHub}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Connect GitHub
          </motion.button>
        ) : (
          <motion.button
            onClick={fetchRepositories}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            whileHover={{ scale: isLoading ? 1 : 1.05 }}
            whileTap={{ scale: isLoading ? 1 : 0.95 }}
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              'Refresh'
            )}
          </motion.button>
        )}
      </div>

      {/* Test Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-white">Configuration Test</h4>
            {getStatusIcon(testResults.configTest)}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {testResults.configTest === 'passed' 
              ? 'GitHub OAuth credentials are properly configured'
              : testResults.configTest === 'failed'
              ? 'GitHub OAuth credentials are missing or invalid'
              : 'Checking GitHub OAuth configuration...'}
          </p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-white">Authentication Test</h4>
            {getStatusIcon(testResults.authTest)}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {testResults.authTest === 'passed' 
              ? 'Successfully authenticated with GitHub'
              : testResults.authTest === 'failed'
              ? 'Not authenticated with GitHub'
              : 'Checking GitHub authentication...'}
          </p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-white">Repository Access Test</h4>
            {getStatusIcon(testResults.repoTest)}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {testResults.repoTest === 'passed' 
              ? `Successfully accessed ${repositories.length} repositories`
              : testResults.repoTest === 'failed'
              ? 'Failed to access GitHub repositories'
              : 'Checking repository access...'}
          </p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-white">API Access Test</h4>
            {getStatusIcon(testResults.apiTest)}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {testResults.apiTest === 'passed' 
              ? 'Successfully accessed GitHub API'
              : testResults.apiTest === 'failed'
              ? 'Failed to access GitHub API'
              : 'Checking API access...'}
          </p>
        </div>
      </div>

      {/* GitHub User Info */}
      {isConnected && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">
                GitHub Connected
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Username: @{user?.user_metadata?.user_name || user?.user_metadata?.name || 'github-user'}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Repositories: {repositories.length}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Provider: {user?.app_metadata?.provider}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Repositories */}
      {isConnected && repositories.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            Available Repositories
          </h4>
          <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            {repositories.slice(0, 5).map((repo: any) => (
              <div key={repo.id} className="p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{repo.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{repo.full_name}</p>
                  </div>
                  <a 
                    href={repo.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
            {repositories.length > 5 && (
              <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
                + {repositories.length - 5} more repositories
              </div>
            )}
          </div>
        </div>
      )}

      {/* Debug Info */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Debug Information</h4>
        <div className="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto max-h-40">
          <p>GitHub Client ID: {import.meta.env.VITE_GITHUB_CLIENT_ID ? '✓ Configured' : '✗ Not Configured'}</p>
          <p>Auth Provider: {user?.app_metadata?.provider || 'None'}</p>
          <p>User Metadata: {JSON.stringify(user?.user_metadata || {}, null, 2)}</p>
          <p>App Metadata: {JSON.stringify(user?.app_metadata || {}, null, 2)}</p>
          <p>Demo Mode: {isDemoMode() ? 'Enabled' : 'Disabled'}</p>
        </div>
      </div>
    </div>
  );
};

export default GitHubAuthTest;

// Helper function to check if demo mode is enabled
function isDemoMode(): boolean {
  return typeof window !== 'undefined' && window.location.search.includes('demo=true');
}
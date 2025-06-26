import React, { useState, useEffect } from 'react';
import { Github, GitBranch, Code2, Link, Check, X, Settings, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../Auth/AuthProvider';
import { authService } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  lastSync?: Date;
  repositories?: number;
}

const IntegrationSettings: React.FC = () => {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'github',
      name: 'GitHub',
      description: 'Connect your GitHub repositories for automated code reviews',
      icon: <Github className="w-6 h-6" />,
      connected: false
    },
    {
      id: 'gitlab',
      name: 'GitLab',
      description: 'Integrate with GitLab for seamless CI/CD workflows',
      icon: <GitBranch className="w-6 h-6" />,
      connected: false
    },
    {
      id: 'bitbucket',
      name: 'Bitbucket',
      description: 'Connect Bitbucket repositories and pipelines',
      icon: <Code2 className="w-6 h-6" />,
      connected: false
    }
  ]);

  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if GitHub is connected
  useEffect(() => {
    const checkGitHubConnection = async () => {
      setIsLoading(true);
      try {
        // Check if user has GitHub provider or token
        const isGitHubConnected = user?.provider === 'github' || !!user?.githubToken;
        
        if (isGitHubConnected) {
          // Get repository count
          const { repositories, error } = await authService.getGitHubRepositories();
          
          if (!error) {
            // Update GitHub integration status
            setIntegrations(prev => prev.map(integration => 
              integration.id === 'github'
                ? { 
                    ...integration, 
                    connected: true,
                    lastSync: new Date(),
                    repositories: repositories.length
                  }
                : integration
            ));
          }
        }
      } catch (error) {
        console.error('Error checking GitHub connection:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      checkGitHubConnection();
    }
  }, [user]);

  const handleConnect = async (integrationId: string) => {
    setIsConnecting(integrationId);
    try {
      if (integrationId === 'github') {
        // Store current location for redirect after auth
        sessionStorage.setItem('auth_return_to', window.location.pathname);
        
        const { error } = await authService.signInWithGitHub();
        
        if (error) {
          toast.error(error.message);
        }
        // Redirect is handled in the signInWithGitHub function
      } else {
        // Simulate OAuth flow for other providers
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setIntegrations(prev => prev.map(integration => 
          integration.id === integrationId 
            ? { ...integration, connected: true, lastSync: new Date(), repositories: Math.floor(Math.random() * 20) + 1 }
            : integration
        ));
        
        toast.success(`Successfully connected to ${integrations.find(i => i.id === integrationId)?.name}`);
      }
    } catch (error) {
      toast.error('Failed to connect integration');
    } finally {
      setIsConnecting(null);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    try {
      if (integrationId === 'github' && supabase && user) {
        // In a real implementation, you would revoke the GitHub token
        // For now, we'll just update the UI
        toast.success('Disconnected from GitHub');
      }
      
      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, connected: false, lastSync: undefined, repositories: undefined }
          : integration
      ));
    } catch (error) {
      toast.error('Failed to disconnect integration');
    }
  };

  const handleSync = async (integrationId: string) => {
    try {
      if (integrationId === 'github') {
        setIsConnecting('github');
        const { repositories, error } = await authService.getGitHubRepositories();
        
        if (error) {
          toast.error(error);
        } else {
          setIntegrations(prev => prev.map(integration => 
            integration.id === 'github'
              ? { 
                  ...integration, 
                  connected: true,
                  lastSync: new Date(),
                  repositories: repositories.length
                }
              : integration
          ));
          
          // Save repositories to Supabase
          if (supabase && user) {
            try {
              // For each repository, upsert to Supabase
              const promises = repositories.map(async (repo) => {
                const { error } = await supabase
                  .from('repositories')
                  .upsert({
                    user_id: user.id,
                    name: repo.name,
                    full_name: repo.full_name,
                    provider: 'github',
                    url: repo.html_url,
                    language: repo.language,
                    is_private: repo.private,
                    last_sync: new Date().toISOString(),
                    status: 'active',
                    updated_at: new Date().toISOString()
                  }, {
                    onConflict: 'user_id, full_name'
                  });
                  
                if (error) {
                  console.error('Error saving repository:', error);
                }
              });
              
              await Promise.all(promises);
              toast.success('Repositories synced successfully');
            } catch (error) {
              console.error('Error saving repositories to Supabase:', error);
              toast.error('Failed to sync repositories');
            }
          }
        }
        setIsConnecting(null);
      } else {
        // Simulate sync for other providers
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setIntegrations(prev => prev.map(integration => 
          integration.id === integrationId 
            ? { ...integration, lastSync: new Date() }
            : integration
        ));
        
        toast.success('Repositories synced successfully');
      }
    } catch (error) {
      toast.error('Failed to sync repositories');
      setIsConnecting(null);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Integrations
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Connect external services to enhance your code review workflow
        </p>
      </div>

      {/* Version Control Integrations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Version Control Systems
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Connect your repositories for automated code reviews
          </p>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading integrations...</p>
            </div>
          ) : (
            integrations.map((integration) => (
              <div key={integration.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${
                      integration.connected 
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {integration.icon}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {integration.name}
                        </h4>
                        {integration.connected && (
                          <div className="flex items-center space-x-1">
                            <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="text-xs font-medium text-green-600 dark:text-green-400">
                              Connected
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {integration.description}
                      </p>
                      
                      {integration.connected && integration.lastSync && (
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>Last sync: {integration.lastSync.toLocaleString()}</span>
                          {integration.repositories && (
                            <span>{integration.repositories} repositories</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {integration.connected ? (
                      <>
                        <button
                          onClick={() => handleSync(integration.id)}
                          disabled={isConnecting === integration.id}
                          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                        >
                          {isConnecting === integration.id ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Settings className="w-4 h-4 mr-2" />
                          )}
                          {isConnecting === integration.id ? 'Syncing...' : 'Sync'}
                        </button>
                        <button
                          onClick={() => handleDisconnect(integration.id)}
                          className="flex items-center px-3 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <motion.button
                        onClick={() => handleConnect(integration.id)}
                        disabled={isConnecting === integration.id}
                        className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                        whileHover={{ scale: isConnecting === integration.id ? 1 : 1.02 }}
                        whileTap={{ scale: isConnecting === integration.id ? 1 : 0.98 }}
                      >
                        {isConnecting === integration.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Link className="w-4 h-4 mr-2" />
                        )}
                        {isConnecting === integration.id ? 'Connecting...' : 'Connect'}
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Webhook Configuration */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Webhook Configuration
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Webhook URL
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value="https://api.codereviewer.ai/webhooks/github"
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white font-mono text-sm"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText('https://api.codereviewer.ai/webhooks/github');
                  toast.success('Webhook URL copied to clipboard');
                }}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Events
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['push', 'pull_request', 'pull_request_review', 'release'].map((event) => (
                <label key={event} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    defaultChecked={event === 'push' || event === 'pull_request'}
                    className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{event}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Integration Status */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Link className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200">
              Integration Benefits
            </h3>
            <ul className="mt-2 text-sm text-blue-600 dark:text-blue-300 space-y-1">
              <li>• Automatic code review triggers on pull requests</li>
              <li>• Real-time synchronization with your repositories</li>
              <li>• Seamless CI/CD pipeline integration</li>
              <li>• Automated security scanning and reporting</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationSettings;
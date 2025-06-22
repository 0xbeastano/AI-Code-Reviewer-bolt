import React, { useState } from 'react';
import { Key, Copy, Plus, Trash2, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface APIKey {
  id: string;
  name: string;
  key: string;
  createdAt: Date;
  lastUsed?: Date;
  permissions: string[];
}

const APISettings: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Production API',
      key: 'sk-proj-abc123...def456',
      createdAt: new Date('2024-01-15'),
      lastUsed: new Date('2024-01-20'),
      permissions: ['read', 'write']
    },
    {
      id: '2',
      name: 'Development API',
      key: 'sk-proj-xyz789...uvw012',
      createdAt: new Date('2024-01-10'),
      permissions: ['read']
    }
  ]);

  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('API key copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy API key');
    }
  };

  const createNewKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }

    setIsCreating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newKey: APIKey = {
        id: Date.now().toString(),
        name: newKeyName,
        key: `sk-proj-${Math.random().toString(36).substr(2, 20)}...${Math.random().toString(36).substr(2, 6)}`,
        createdAt: new Date(),
        permissions: ['read']
      };

      setApiKeys(prev => [...prev, newKey]);
      setNewKeyName('');
      toast.success('API key created successfully');
    } catch (error) {
      toast.error('Failed to create API key');
    } finally {
      setIsCreating(false);
    }
  };

  const deleteKey = async (keyId: string) => {
    try {
      setApiKeys(prev => prev.filter(key => key.id !== keyId));
      toast.success('API key deleted');
    } catch (error) {
      toast.error('Failed to delete API key');
    }
  };

  const regenerateKey = async (keyId: string) => {
    try {
      setApiKeys(prev => prev.map(key => 
        key.id === keyId 
          ? { ...key, key: `sk-proj-${Math.random().toString(36).substr(2, 20)}...${Math.random().toString(36).substr(2, 6)}` }
          : key
      ));
      toast.success('API key regenerated');
    } catch (error) {
      toast.error('Failed to regenerate API key');
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          API Keys
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage your API keys for programmatic access
        </p>
      </div>

      {/* Create New Key */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Plus className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Create New API Key
          </h3>
        </div>

        <div className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Enter API key name (e.g., Production API)"
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <motion.button
            onClick={createNewKey}
            disabled={isCreating || !newKeyName.trim()}
            className="flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            whileHover={{ scale: isCreating ? 1 : 1.02 }}
            whileTap={{ scale: isCreating ? 1 : 0.98 }}
          >
            {isCreating ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Plus className="w-5 h-5 mr-2" />
            )}
            {isCreating ? 'Creating...' : 'Create Key'}
          </motion.button>
        </div>
      </div>

      {/* Existing API Keys */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Your API Keys
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {apiKeys.length} API key{apiKeys.length !== 1 ? 's' : ''} configured
          </p>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {apiKey.name}
                  </h4>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                    <span>Created: {apiKey.createdAt.toLocaleDateString()}</span>
                    {apiKey.lastUsed && (
                      <span>Last used: {apiKey.lastUsed.toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => regenerateKey(apiKey.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="Regenerate key"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteKey(apiKey.id)}
                    className="p-2 text-red-400 hover:text-red-600 transition-colors"
                    title="Delete key"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {/* API Key Display */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    API Key
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 relative">
                      <input
                        type={showKeys[apiKey.id] ? 'text' : 'password'}
                        value={apiKey.key}
                        readOnly
                        className="w-full px-3 py-2 pr-20 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                        <button
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          {showKeys[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(apiKey.key)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Permissions
                  </label>
                  <div className="flex space-x-2">
                    {apiKey.permissions.map((permission) => (
                      <span
                        key={permission}
                        className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {apiKeys.length === 0 && (
            <div className="p-12 text-center">
              <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No API keys found. Create your first API key to get started.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* API Documentation */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Key className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200">
              API Documentation
            </h3>
            <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
              Learn how to integrate with our API and authenticate your requests.
            </p>
            <div className="mt-3">
              <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                View API Documentation →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APISettings;
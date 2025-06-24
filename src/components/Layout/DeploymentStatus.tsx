import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, ExternalLink, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { getDeploymentStatus } from '../../lib/deployment';

interface DeploymentStatusProps {
  deployId?: string;
}

const DeploymentStatus: React.FC<DeploymentStatusProps> = ({ deployId }) => {
  const [status, setStatus] = useState<'pending' | 'building' | 'ready' | 'error'>('pending');
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [claimUrl, setClaimUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deployId) return;

    const checkStatus = async () => {
      try {
        const deploymentStatus = await getDeploymentStatus({ id: deployId });
        
        if (deploymentStatus.state === 'ready') {
          setStatus('ready');
          setDeployUrl(deploymentStatus.deploy_url);
          setClaimUrl(deploymentStatus.claim_url);
          setLoading(false);
        } else if (deploymentStatus.state === 'error') {
          setStatus('error');
          setLoading(false);
        } else {
          // Still building
          setStatus('building');
          
          // Check again in 3 seconds
          setTimeout(checkStatus, 3000);
        }
      } catch (error) {
        console.error('Error checking deployment status:', error);
        setStatus('error');
        setLoading(false);
      }
    };

    checkStatus();
  }, [deployId]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('URL copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  if (!deployId) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-md z-50"
    >
      <div className="flex items-start space-x-4">
        {loading || status === 'building' ? (
          <div className="flex-shrink-0 mt-1">
            <Loader2 className="w-5 h-5 text-primary-600 dark:text-primary-400 animate-spin" />
          </div>
        ) : status === 'ready' ? (
          <div className="flex-shrink-0 mt-1">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
        ) : (
          <div className="flex-shrink-0 mt-1">
            <CheckCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
        )}
        
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            {status === 'ready' 
              ? 'Deployment Successful!'
              : status === 'error'
              ? 'Deployment Failed'
              : 'Deploying to Netlify...'}
          </h3>
          
          {status === 'building' && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Your site is being built and deployed. This may take a few minutes.
            </p>
          )}
          
          {status === 'ready' && deployUrl && (
            <>
              <div className="mt-2 flex items-center space-x-2">
                <div className="flex-1 text-xs bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 truncate">
                  {deployUrl}
                </div>
                <button
                  onClick={() => handleCopy(deployUrl)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <a
                  href={deployUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              
              {claimUrl && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Want to own this deployment? 
                    <a 
                      href={claimUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      Claim this site
                    </a>
                  </p>
                </div>
              )}
            </>
          )}
          
          {status === 'error' && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              There was an error deploying your site. Please try again.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DeploymentStatus;
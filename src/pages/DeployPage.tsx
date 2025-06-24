import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Cloud, 
  Code, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  Github,
  Settings,
  Globe,
  Zap,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DeploymentStatus from '../components/Layout/DeploymentStatus';

const DeployPage: React.FC = () => {
  const navigate = useNavigate();
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployId, setDeployId] = useState<string | null>(null);
  const [deploymentStarted, setDeploymentStarted] = useState(false);

  const handleDeploy = () => {
    setIsDeploying(true);
    setDeploymentStarted(true);
    
    try {
      toast.success('Starting deployment to Netlify...');
      // The actual deployment will be handled by the deploy action in the artifact
    } catch (error) {
      console.error('Deployment error:', error);
      toast.error('Deployment failed. Please try again.');
      setIsDeploying(false);
    }
  };

  // This effect will run when the component mounts
  useEffect(() => {
    // Listen for deployment status updates from the deploy action
    const handleDeploymentMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'deployment-status') {
        setDeployId(event.data.deployId);
        if (event.data.status === 'complete') {
          setIsDeploying(false);
        }
      }
    };

    window.addEventListener('message', handleDeploymentMessage);

    return () => {
      window.removeEventListener('message', handleDeploymentMessage);
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <motion.div
          className="w-20 h-20 bg-gradient-ai rounded-full flex items-center justify-center mx-auto mb-6"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0, -5, 0]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <Cloud className="w-10 h-10 text-white" />
        </motion.div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Deploy Your AI Code Review Agent
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Deploy your application to Netlify with one click and share it with your team
        </p>
      </motion.div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <Settings className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
          Deployment Configuration
        </h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white">Deployment Target</h3>
              </div>
              <div className="ml-10">
                <div className="flex items-center space-x-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-gray-700 dark:text-gray-300">Netlify</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your app will be deployed to Netlify's global CDN
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Code className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white">Build Configuration</h3>
              </div>
              <div className="ml-10">
                <div className="flex items-center space-x-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-gray-700 dark:text-gray-300">Production Build</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Optimized for performance with code splitting
                </p>
              </div>
            </motion.div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Important Note</h4>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  This will deploy the frontend only. For full functionality, you'll need to configure your Supabase environment variables in the Netlify dashboard after deployment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <Zap className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
          Deployment Benefits
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Globe className="w-6 h-6 text-green-600 dark:text-green-400" />,
              title: "Global CDN",
              description: "Your app will be served from edge locations worldwide for fast loading"
            },
            {
              icon: <Github className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
              title: "Continuous Deployment",
              description: "Connect to GitHub for automatic deployments on code changes"
            },
            {
              icon: <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
              title: "HTTPS Included",
              description: "Automatic SSL certificates for secure connections"
            }
          ].map((benefit, index) => (
            <motion.div
              key={index}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="flex items-center space-x-3 mb-2">
                {benefit.icon}
                <h3 className="font-medium text-gray-900 dark:text-white">{benefit.title}</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        {!deploymentStarted ? (
          <motion.button
            onClick={handleDeploy}
            disabled={isDeploying}
            className="flex items-center px-8 py-4 bg-gradient-ai hover:opacity-90 disabled:opacity-70 text-white font-semibold rounded-xl transition-all shadow-lg"
            whileHover={{ scale: isDeploying ? 1 : 1.05 }}
            whileTap={{ scale: isDeploying ? 1 : 0.95 }}
          >
            {isDeploying ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Cloud className="w-5 h-5" />
                </motion.div>
                Deploying...
              </>
            ) : (
              <>
                <Cloud className="w-5 h-5 mr-2" />
                Deploy to Netlify
              </>
            )}
          </motion.button>
        ) : (
          <motion.button
            onClick={() => navigate('/dashboard')}
            className="flex items-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Return to Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </motion.button>
        )}
      </div>

      {deploymentStarted && (
        <DeploymentStatus deployId={deployId || undefined} />
      )}
    </div>
  );
};

export default DeployPage;
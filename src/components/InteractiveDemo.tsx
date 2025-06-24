import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Shield, Zap, Code2, Brain, CheckCircle, AlertTriangle } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const InteractiveDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'security' | 'performance' | 'quality'>('security');
  const [animationStep, setAnimationStep] = useState(0);
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.3,
  });

  // Reset animation when tab changes
  useEffect(() => {
    setAnimationStep(0);
    const timer = setTimeout(() => {
      setAnimationStep(1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Progress animation when in view
  useEffect(() => {
    if (inView && animationStep < 3) {
      const timer = setTimeout(() => {
        setAnimationStep(prev => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [inView, animationStep]);

  const codeExamples = {
    security: {
      before: `function authenticateUser(username, password) {
  // SECURITY ISSUE: Unsanitized SQL query
  const query = \`SELECT * FROM users 
    WHERE username = '\${username}' 
    AND password = '\${password}'\`;
  
  return database.execute(query);
}`,
      after: `function authenticateUser(username, password) {
  // FIXED: Using parameterized query
  const query = \`SELECT * FROM users 
    WHERE username = ? 
    AND password = ?\`;
  
  return database.execute(query, [username, password]);
}`
    },
    performance: {
      before: `function processItems(items) {
  // PERFORMANCE ISSUE: Inefficient array processing
  let results = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.status === 'active') {
      results.push({
        id: item.id,
        name: item.name,
        value: calculateValue(item)
      });
    }
  }
  return results;
}`,
      after: `function processItems(items) {
  // FIXED: Using array methods for better performance
  return items
    .filter(item => item.status === 'active')
    .map(item => ({
      id: item.id,
      name: item.name,
      value: calculateValue(item)
    }));
}`
    },
    quality: {
      before: `// QUALITY ISSUE: Poor error handling and variable naming
var x = fetchData();
if (x) {
  var y = processData(x);
  if (y) {
    return formatOutput(y);
  }
}
return null;`,
      after: `// FIXED: Improved error handling and naming
try {
  const userData = fetchData();
  if (!userData) {
    throw new Error('No user data available');
  }
  
  const processedData = processData(userData);
  if (!processedData) {
    throw new Error('Data processing failed');
  }
  
  return formatOutput(processedData);
} catch (error) {
  logger.error('Data processing error:', error);
  return null;
}`
    }
  };

  const tabIcons = {
    security: <Shield className="w-5 h-5" />,
    performance: <Zap className="w-5 h-5" />,
    quality: <Code2 className="w-5 h-5" />
  };

  const tabColors = {
    security: 'from-red-500 to-red-600',
    performance: 'from-yellow-500 to-yellow-600',
    quality: 'from-blue-500 to-blue-600'
  };

  const tabDescriptions = {
    security: 'Detect and fix security vulnerabilities before they reach production',
    performance: 'Identify and optimize performance bottlenecks in your code',
    quality: 'Improve code quality, readability, and maintainability'
  };

  const renderCodeEditor = () => (
    <div className="bg-dark-800 rounded-lg border border-dark-600 overflow-hidden shadow-xl">
      <div className="bg-dark-700 px-4 py-2 border-b border-dark-600 flex items-center justify-between">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-sm text-gray-400">main.js - AI Code Review</div>
        <div className="flex items-center">
          <div className={`px-2 py-1 rounded text-xs ${
            animationStep >= 3 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            {animationStep >= 3 ? 'Optimized' : 'Issues Detected'}
          </div>
        </div>
      </div>
      
      <div className="relative">
        <div className="transition-opacity duration-500 ease-in-out">
          <SyntaxHighlighter 
            language="javascript" 
            style={atomOneDark}
            customStyle={{ 
              background: 'transparent',
              padding: '1.5rem',
              margin: 0,
              borderRadius: 0
            }}
          >
            {animationStep >= 3 ? codeExamples[activeTab].after : codeExamples[activeTab].before}
          </SyntaxHighlighter>
        </div>
        
        {/* Analysis overlay */}
        {animationStep >= 1 && animationStep < 3 && (
          <motion.div 
            className="absolute inset-0 bg-dark-800/80 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center">
              <motion.div 
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-900/50 flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Brain className="w-8 h-8 text-primary-400" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2">AI Analysis in Progress</h3>
              <p className="text-gray-400 max-w-md">
                {animationStep === 1 
                  ? "Scanning code for issues and vulnerabilities..." 
                  : "Generating optimized code solutions..."}
              </p>
              
              <div className="w-64 h-2 bg-dark-600 rounded-full mt-6 mx-auto overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: animationStep === 1 ? "50%" : "90%" }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );

  return (
    <section id="demo" className="py-20 relative" ref={ref}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">See AI Code Review in Action</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Experience how our AI instantly identifies issues and generates optimized solutions
            </p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center mb-8 gap-4">
          {(['security', 'performance', 'quality'] as const).map((tab) => (
            <motion.button
              key={tab}
              className={`flex items-center px-5 py-2.5 rounded-lg ${
                activeTab === tab 
                  ? `bg-gradient-to-r ${tabColors[tab]} text-white shadow-lg` 
                  : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
              } transition-all duration-300`}
              onClick={() => setActiveTab(tab)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tabIcons[tab]}
              <span className="ml-2 font-medium">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Code Editor */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.7 }}
          >
            {renderCodeEditor()}
          </motion.div>

          {/* Analysis Results */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold mb-4">
              <span className="gradient-text">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span> Analysis
            </h3>
            
            <p className="text-gray-300">
              {tabDescriptions[activeTab]}
            </p>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                {activeTab === 'security' && (
                  <>
                    <div className="bg-dark-700 rounded-lg p-4 border border-dark-600">
                      <div className="flex items-start">
                        <div className="p-2 bg-red-900/30 rounded-lg mr-4">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">SQL Injection Vulnerability</h4>
                          <p className="text-sm text-gray-400 mt-1">
                            Unsanitized user input is directly concatenated into SQL query, allowing attackers to inject malicious SQL commands.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-dark-700 rounded-lg p-4 border border-dark-600">
                      <div className="flex items-start">
                        <div className="p-2 bg-green-900/30 rounded-lg mr-4">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Recommended Fix</h4>
                          <p className="text-sm text-gray-400 mt-1">
                            Use parameterized queries to separate SQL code from user-provided data, preventing injection attacks.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'performance' && (
                  <>
                    <div className="bg-dark-700 rounded-lg p-4 border border-dark-600">
                      <div className="flex items-start">
                        <div className="p-2 bg-yellow-900/30 rounded-lg mr-4">
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Inefficient Array Processing</h4>
                          <p className="text-sm text-gray-400 mt-1">
                            Using traditional for-loops with array manipulation creates unnecessary memory allocation and reduces readability.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-dark-700 rounded-lg p-4 border border-dark-600">
                      <div className="flex items-start">
                        <div className="p-2 bg-green-900/30 rounded-lg mr-4">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Recommended Fix</h4>
                          <p className="text-sm text-gray-400 mt-1">
                            Use functional array methods like filter() and map() for cleaner, more efficient data transformation.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'quality' && (
                  <>
                    <div className="bg-dark-700 rounded-lg p-4 border border-dark-600">
                      <div className="flex items-start">
                        <div className="p-2 bg-blue-900/30 rounded-lg mr-4">
                          <AlertTriangle className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Poor Error Handling & Naming</h4>
                          <p className="text-sm text-gray-400 mt-1">
                            Lack of proper error handling and unclear variable names reduce code maintainability and make debugging difficult.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-dark-700 rounded-lg p-4 border border-dark-600">
                      <div className="flex items-start">
                        <div className="p-2 bg-green-900/30 rounded-lg mr-4">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Recommended Fix</h4>
                          <p className="text-sm text-gray-400 mt-1">
                            Implement proper try/catch error handling, use descriptive variable names, and add appropriate logging.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Metrics */}
                {animationStep >= 3 && (
                  <motion.div 
                    className="bg-gradient-card rounded-lg p-4 border border-primary-700/50"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h4 className="font-medium text-white mb-3">Improvement Metrics</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary-400">98%</div>
                        <div className="text-xs text-gray-400">Security</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary-400">43%</div>
                        <div className="text-xs text-gray-400">Faster</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary-400">87%</div>
                        <div className="text-xs text-gray-400">Maintainable</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            <motion.a
              href="#trial"
              className="inline-flex items-center px-6 py-3 bg-gradient-primary rounded-lg font-medium mt-4 hover:shadow-glow transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try on Your Codebase
              <ArrowRight className="w-4 h-4 ml-2" />
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveDemo;
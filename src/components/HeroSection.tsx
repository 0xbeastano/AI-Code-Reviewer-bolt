import React from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowRight, CheckCircle, Shield, Zap, Code2, Brain } from 'lucide-react';
import { TypeAnimation } from 'react-type-animation';

const HeroSection: React.FC = () => {
  const valueProps = [
    { icon: <Shield className="w-5 h-5 text-primary-400" />, text: "Reduce security vulnerabilities by 87%" },
    { icon: <Zap className="w-5 h-5 text-primary-400" />, text: "Improve code quality by 42%" },
    { icon: <Code2 className="w-5 h-5 text-primary-400" />, text: "Accelerate development by 10x" }
  ];

  const trustBadges = [
    "SOC 2 Compliant", "GDPR Ready", "ISO 27001", "HIPAA Compliant"
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className="pt-32 pb-20 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center">
          {/* Left Column - Text Content */}
          <motion.div 
            className="lg:w-1/2 mb-12 lg:mb-0"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-900/50 border border-primary-700 mb-6">
              <Brain className="w-4 h-4 text-primary-400 mr-2" />
              <span className="text-sm font-medium text-primary-300">Powered by GPT-4 Technology</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Ship Secure Code <span className="gradient-text">10x Faster</span> with AI-Powered Reviews
            </h1>
            
            <div className="h-12 mb-6">
              <TypeAnimation
                sequence={[
                  'Detect security vulnerabilities before they reach production.',
                  2000,
                  'Optimize performance bottlenecks automatically.',
                  2000,
                  'Improve code quality with AI-powered suggestions.',
                  2000,
                  'Accelerate development with intelligent automation.',
                  2000,
                ]}
                wrapper="p"
                speed={50}
                className="text-lg text-gray-300"
                repeat={Infinity}
              />
            </div>

            {/* Value Propositions */}
            <motion.div 
              className="space-y-3 mb-8"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {valueProps.map((prop, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-center space-x-2"
                  variants={item}
                >
                  <div className="flex-shrink-0">{prop.icon}</div>
                  <span className="text-gray-300">{prop.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <motion.a
                href="#trial"
                className="px-8 py-3 bg-gradient-primary rounded-lg font-medium flex items-center justify-center shadow-glow hover:shadow-glow-lg transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Free 14-Day Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </motion.a>
              
              <motion.a
                href="#demo"
                className="px-8 py-3 bg-dark-700 border border-primary-700 rounded-lg font-medium flex items-center justify-center hover:bg-dark-600 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-4 h-4 mr-2" />
                Watch 3-Min Demo
              </motion.a>
            </div>

            {/* Trust Badges */}
            <div className="mt-8">
              <p className="text-xs text-gray-400 mb-3">Trusted by enterprise teams worldwide</p>
              <div className="flex flex-wrap gap-3">
                {trustBadges.map((badge, index) => (
                  <div 
                    key={index}
                    className="px-3 py-1 bg-dark-700 border border-dark-600 rounded-full text-xs text-gray-300 flex items-center"
                  >
                    <CheckCircle className="w-3 h-3 text-primary-400 mr-1" />
                    {badge}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Animated Code Snippets */}
          <motion.div 
            className="lg:w-1/2 relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="relative">
              {/* Main code window */}
              <motion.div 
                className="bg-dark-800 border border-dark-600 rounded-lg shadow-xl overflow-hidden"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="bg-dark-700 px-4 py-2 border-b border-dark-600 flex items-center">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="ml-4 text-sm text-gray-400">main.js - AI Code Review</div>
                </div>
                <div className="p-4 font-mono text-sm">
                  <pre className="language-javascript">
                    <code className="text-gray-300">
                      <span className="text-blue-400">function</span> <span className="text-green-400">processUserData</span>(userData) {'{'}
                      <br />
                      <span className="text-red-400">  // Security vulnerability detected</span>
                      <br />
                      <span className="text-yellow-400">  const query = `SELECT * FROM users WHERE id = ${'{'}userData.id{'}'}`;</span>
                      <br />
                      <br />
                      <span className="text-red-400">  // Performance issue detected</span>
                      <br />
                      <span className="text-yellow-400">  for (let i = 0; i < userData.items.length; i++) {'{'}</span>
                      <br />
                      <span className="text-yellow-400">    processItem(userData.items[i]);</span>
                      <br />
                      <span className="text-yellow-400">  {'}'}</span>
                      <br />
                      <br />
                      <span className="text-red-400">  // Code quality issue detected</span>
                      <br />
                      <span className="text-yellow-400">  var result = userData.process();</span>
                      <br />
                      <span className="text-yellow-400">  return result;</span>
                      <br />
                      {'}'};
                    </code>
                  </pre>
                </div>
              </motion.div>

              {/* AI Suggestion Popup */}
              <motion.div 
                className="absolute top-1/3 right-0 transform translate-x-0 bg-primary-900/90 backdrop-blur-sm border border-primary-700 rounded-lg p-4 shadow-glow max-w-xs"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                <div className="flex items-start space-x-3">
                  <div className="bg-primary-700 rounded-full p-1.5">
                    <Brain className="w-4 h-4 text-primary-300" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-primary-300">SQL Injection Vulnerability</h4>
                    <p className="text-xs text-gray-300 mt-1">Use parameterized queries to prevent SQL injection attacks.</p>
                    <pre className="mt-2 text-xs bg-dark-800 p-2 rounded">
                      <code className="text-green-400">
                        const query = 'SELECT * FROM users WHERE id = ?';<br />
                        db.execute(query, [userData.id]);
                      </code>
                    </pre>
                  </div>
                </div>
              </motion.div>

              {/* Floating metrics */}
              <motion.div 
                className="absolute -bottom-6 -left-6 bg-dark-800/90 backdrop-blur-sm border border-dark-600 rounded-lg p-3 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.5 }}
              >
                <div className="flex items-center space-x-4">
                  <div>
                    <div className="text-xs text-gray-400">Security Score</div>
                    <div className="text-lg font-bold text-red-500">65%</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Performance</div>
                    <div className="text-lg font-bold text-yellow-500">72%</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Quality</div>
                    <div className="text-lg font-bold text-orange-500">68%</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Client logos */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-400 mb-6">Trusted by engineering teams at</p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 opacity-70">
            {['Microsoft', 'Amazon', 'Shopify', 'Airbnb', 'Netflix'].map((company) => (
              <div key={company} className="text-gray-400 font-semibold text-xl">
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-600/10 rounded-full blur-3xl"></div>
    </section>
  );
};

export default HeroSection;
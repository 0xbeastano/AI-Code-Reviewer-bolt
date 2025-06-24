import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight, CheckCircle, Clock, Shield, Zap, Brain } from 'lucide-react';

const ConversionSection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const benefits = [
    "Free 14-day trial with full access to all features",
    "No credit card required to start",
    "Enterprise-grade security and compliance",
    "Dedicated onboarding support",
    "Cancel anytime"
  ];

  return (
    <section id="trial" className="py-20 bg-gradient-primary relative">
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-10 pointer-events-none"></div>
      
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10" ref={ref}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Code Review Process?</h2>
            <p className="text-blue-200 max-w-2xl mx-auto">
              Join thousands of enterprise teams shipping better code faster with AI-powered reviews
            </p>
          </motion.div>

          <div className="bg-dark-800/80 backdrop-blur-sm rounded-2xl p-8 border border-primary-700/50 shadow-glow">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Column - Trial Info */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-primary-900/50 rounded-lg mr-4">
                    <Brain className="w-6 h-6 text-primary-400" />
                  </div>
                  <h3 className="text-2xl font-bold">Start Your Free Trial</h3>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {benefits.map((benefit, index) => (
                    <motion.li 
                      key={index} 
                      className="flex items-start"
                      initial={{ opacity: 0, x: -20 }}
                      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, delay: 0.3 + (index * 0.1) }}
                    >
                      <CheckCircle className="w-5 h-5 text-primary-400 mr-3 flex-shrink-0" />
                      <span>{benefit}</span>
                    </motion.li>
                  ))}
                </ul>
                
                <div className="flex items-center space-x-4 text-sm text-blue-200">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>5-minute setup</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-1" />
                    <span>Enterprise security</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="w-4 h-4 mr-1" />
                    <span>Immediate results</span>
                  </div>
                </div>
              </motion.div>

              {/* Right Column - Form */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Work Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white"
                      placeholder="you@company.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1">Company Name</label>
                    <input 
                      type="text" 
                      id="company" 
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white"
                      placeholder="Your company"
                    />
                  </div>
                  
                  <div className="pt-4">
                    <motion.button
                      type="submit"
                      className="w-full px-6 py-4 bg-gradient-primary rounded-lg font-medium flex items-center justify-center shadow-glow hover:shadow-glow-lg transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Start Free 14-Day Trial
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </motion.button>
                    
                    <p className="text-xs text-center text-blue-200 mt-3">
                      By signing up, you agree to our <a href="/terms" className="underline">Terms of Service</a> and <a href="/privacy" className="underline">Privacy Policy</a>
                    </p>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>

          <motion.div 
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <p className="text-blue-200">
              Need a personalized demo for your enterprise team?
            </p>
            <a 
              href="/demo" 
              className="inline-flex items-center mt-2 text-white hover:text-blue-200 transition-colors"
            >
              Schedule a demo with our team
              <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ConversionSection;
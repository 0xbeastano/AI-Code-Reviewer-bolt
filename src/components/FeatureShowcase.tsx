import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Brain, Shield, Zap, Code2, Github, Users, ArrowRight, CheckCircle } from 'lucide-react';

interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
  techDetails: string[];
  color: string;
}

const FeatureShowcase: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const features: Feature[] = [
    {
      id: 'ai-analysis',
      icon: <Brain className="w-8 h-8" />,
      title: 'AI Analysis (GPT-4)',
      description: 'Leverage the power of GPT-4 to analyze your code for bugs, security issues, and performance bottlenecks.',
      benefits: [
        'Reduce code review time by 85%',
        'Catch issues human reviewers miss',
        'Continuous learning from your codebase'
      ],
      techDetails: [
        'Powered by OpenAI GPT-4 and Claude models',
        'Supports 20+ programming languages',
        'Custom fine-tuning for your coding standards'
      ],
      color: 'from-blue-600 to-indigo-600'
    },
    {
      id: 'security',
      icon: <Shield className="w-8 h-8" />,
      title: 'Security Scanning',
      description: 'Detect security vulnerabilities, including OWASP Top 10, before they reach production.',
      benefits: [
        'Prevent data breaches and security incidents',
        'Comply with security standards and regulations',
        'Reduce security-related downtime'
      ],
      techDetails: [
        'SAST, DAST, and SCA scanning capabilities',
        'Custom security rule creation',
        'Vulnerability database with 50,000+ CVEs'
      ],
      color: 'from-red-600 to-pink-600'
    },
    {
      id: 'performance',
      icon: <Zap className="w-8 h-8" />,
      title: 'Performance Optimization',
      description: 'Identify and fix performance bottlenecks with AI-generated optimization suggestions.',
      benefits: [
        'Improve application response times',
        'Reduce infrastructure costs',
        'Enhance user experience'
      ],
      techDetails: [
        'Runtime complexity analysis',
        'Memory usage optimization',
        'Database query performance tuning'
      ],
      color: 'from-yellow-500 to-orange-600'
    },
    {
      id: 'quality',
      icon: <Code2 className="w-8 h-8" />,
      title: 'Code Quality Metrics',
      description: 'Track and improve code quality with detailed metrics and actionable insights.',
      benefits: [
        'Maintain consistent coding standards',
        'Reduce technical debt',
        'Improve maintainability'
      ],
      techDetails: [
        'Cyclomatic complexity measurement',
        'Code duplication detection',
        'Custom quality gate configuration'
      ],
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'github',
      icon: <Github className="w-8 h-8" />,
      title: 'GitHub Integration',
      description: 'Seamlessly integrate with GitHub to automatically review pull requests and provide feedback.',
      benefits: [
        'Automated PR reviews and comments',
        'CI/CD pipeline integration',
        'Branch protection rules enforcement'
      ],
      techDetails: [
        'GitHub Actions integration',
        'PR status checks and annotations',
        'Inline code suggestions'
      ],
      color: 'from-gray-600 to-gray-700'
    },
    {
      id: 'collaboration',
      icon: <Users className="w-8 h-8" />,
      title: 'Team Collaboration',
      description: 'Collaborate with your team on code reviews, share findings, and track improvements.',
      benefits: [
        'Streamline team communication',
        'Knowledge sharing across teams',
        'Consistent review processes'
      ],
      techDetails: [
        'Role-based access control',
        'Review assignment and tracking',
        'Integration with Slack, MS Teams, etc.'
      ],
      color: 'from-purple-600 to-violet-600'
    }
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
    <section id="features" className="py-20 relative">
      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Enterprise-Grade Features</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our AI-powered platform provides comprehensive tools to improve code quality, security, and performance
            </p>
          </motion.div>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              variants={item}
              className={`bg-dark-800 rounded-xl border border-dark-600 overflow-hidden hover:border-primary-700 transition-all duration-300 ${
                activeFeature === feature.id ? 'ring-2 ring-primary-500 shadow-glow' : ''
              }`}
              onClick={() => setActiveFeature(activeFeature === feature.id ? null : feature.id)}
            >
              <div className={`h-2 bg-gradient-to-r ${feature.color}`}></div>
              <div className="p-6">
                <div className="flex items-start">
                  <div className={`p-3 rounded-lg bg-dark-700 mr-4`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </div>
                </div>

                {activeFeature === feature.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 pt-6 border-t border-dark-600"
                  >
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-semibold text-primary-400 mb-2">Business Benefits</h4>
                        <ul className="space-y-2">
                          {feature.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="w-4 h-4 text-primary-400 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-300">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-semibold text-primary-400 mb-2">Technical Details</h4>
                        <ul className="space-y-2">
                          {feature.techDetails.map((detail, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="w-4 h-4 text-primary-400 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-300">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <a 
                        href="#" 
                        className="inline-flex items-center text-sm text-primary-400 hover:text-primary-300 transition-colors"
                      >
                        Learn more about {feature.title}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </a>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <a 
            href="/features" 
            className="inline-flex items-center px-6 py-3 bg-dark-700 border border-primary-700 rounded-lg hover:bg-dark-600 transition-all duration-300"
          >
            View All Features
            <ArrowRight className="w-4 h-4 ml-2" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureShowcase;
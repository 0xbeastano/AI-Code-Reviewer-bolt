import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { GitBranch, Zap, CheckCircle, ArrowRight } from 'lucide-react';

const ImplementationProcess: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const steps = [
    {
      icon: <GitBranch className="w-8 h-8 text-primary-400" />,
      title: "Connect Your Repository",
      description: "Integrate with GitHub, GitLab, or Bitbucket in less than 5 minutes with our guided setup process.",
      timeframe: "5 minutes",
      details: [
        "OAuth authentication with your Git provider",
        "Select repositories to analyze",
        "Configure branch protection rules",
        "Set up webhook integration"
      ]
    },
    {
      icon: <Zap className="w-8 h-8 text-primary-400" />,
      title: "Configure AI Analysis",
      description: "Customize analysis rules, security checks, and quality standards to match your team's requirements.",
      timeframe: "10 minutes",
      details: [
        "Select programming languages",
        "Choose security scanning level",
        "Configure code quality thresholds",
        "Set up notification preferences"
      ]
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-primary-400" />,
      title: "Start Receiving Reviews",
      description: "Get immediate AI-powered code reviews on pull requests, with actionable suggestions and automated fixes.",
      timeframe: "Immediate",
      details: [
        "Automatic PR comments",
        "Inline code suggestions",
        "Security vulnerability alerts",
        "Performance optimization recommendations"
      ]
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="process" className="py-20 bg-dark-800 relative">
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-5 pointer-events-none"></div>
      
      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Implementation Process</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Get up and running with AI-powered code reviews in minutes, not weeks
            </p>
          </motion.div>
        </div>

        <motion.div 
          className="relative"
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
        >
          {/* Connection lines */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-dark-600 -translate-y-1/2 z-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={item}
                className="bg-dark-700 rounded-xl border border-dark-600 overflow-hidden hover:border-primary-700 transition-all duration-300"
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.1)" }}
              >
                <div className="p-6">
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center border-4 border-dark-600 relative">
                      {step.icon}
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-center mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-center mb-4">{step.description}</p>
                  
                  <div className="bg-dark-800 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-center">
                      <span className="text-xs text-gray-400">Implementation Time:</span>
                      <span className="ml-2 text-sm font-bold text-primary-400">{step.timeframe}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {step.details.map((detail, i) => (
                      <div key={i} className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-primary-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-300">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="inline-block bg-gradient-card rounded-lg p-6 border border-primary-700/30">
            <h3 className="text-xl font-bold mb-3">Enterprise Implementation Support</h3>
            <p className="text-gray-300 mb-4">
              Need help with custom integrations or enterprise-scale deployment?
              Our implementation team provides white-glove service to ensure success.
            </p>
            <a 
              href="/enterprise" 
              className="inline-flex items-center text-primary-400 hover:text-primary-300 transition-colors"
            >
              Learn about enterprise implementation
              <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ImplementationProcess;
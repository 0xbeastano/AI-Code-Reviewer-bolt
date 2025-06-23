import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Check, 
  X, 
  HelpCircle, 
  ArrowRight, 
  Users, 
  Building, 
  Zap,
  Sparkles
} from 'lucide-react';

const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [showEnterprise, setShowEnterprise] = useState(false);

  const plans = [
    {
      name: 'Starter',
      description: 'For individual developers and small projects',
      price: billingCycle === 'monthly' ? 29 : 24,
      features: [
        'Up to 5 repositories',
        '100 code reviews per month',
        'Basic security scanning',
        'Performance analysis',
        'Email support',
        'GitHub integration',
        'Single user'
      ],
      notIncluded: [
        'Team collaboration',
        'Custom AI models',
        'Advanced security scanning',
        'CI/CD integration',
        'API access'
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Professional',
      description: 'For professional developers and growing teams',
      price: billingCycle === 'monthly' ? 79 : 69,
      features: [
        'Unlimited repositories',
        '500 code reviews per month',
        'Advanced security scanning',
        'Performance analysis',
        'Priority support',
        'GitHub & GitLab integration',
        'Up to 10 team members',
        'Team collaboration',
        'CI/CD integration',
        'Basic API access'
      ],
      notIncluded: [
        'Custom AI models',
        'Enterprise SSO'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Business',
      description: 'For businesses with advanced security needs',
      price: billingCycle === 'monthly' ? 199 : 169,
      features: [
        'Unlimited repositories',
        '2000 code reviews per month',
        'Advanced security scanning',
        'Performance analysis',
        'Priority support',
        'All integrations',
        'Up to 25 team members',
        'Team collaboration',
        'CI/CD integration',
        'Full API access',
        'Custom AI models',
        'Compliance reporting'
      ],
      notIncluded: [
        'Enterprise SSO',
        'Dedicated support'
      ],
      cta: 'Start Free Trial',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-3 group">
                <motion.div 
                  className="flex items-center justify-center w-10 h-10 bg-gradient-ai rounded-lg shadow-lg"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Brain className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors flex items-center">
                    AI Code Review
                    <Sparkles className="w-4 h-4 text-yellow-500 ml-1" />
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Powered by GPT-4
                  </p>
                </div>
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <Link to="/features" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium">
                Features
              </Link>
              <Link to="/pricing" className="text-primary-600 dark:text-primary-400 px-3 py-2 text-sm font-medium">
                Pricing
              </Link>
              <Link to="/docs" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium">
                Documentation
              </Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Link to="/auth" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 px-3 py-2 text-sm font-medium">
                Sign In
              </Link>
              <Link to="/auth?signup=true" className="bg-gradient-ai hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Choose the plan that's right for your team
            </p>
            
            {/* Billing Toggle */}
            <div className="mt-8 flex items-center justify-center">
              <span className={`text-sm ${billingCycle === 'monthly' ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                Monthly
              </span>
              <button 
                className="mx-4 relative inline-flex h-6 w-12 items-center rounded-full bg-primary-600"
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              >
                <span 
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingCycle === 'annual' ? 'translate-x-7' : 'translate-x-1'
                  }`} 
                />
              </button>
              <span className={`text-sm ${billingCycle === 'annual' ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                Annual <span className="text-green-500 font-medium">Save 15%</span>
              </span>
            </div>
          </div>
          
          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 ${
                  plan.popular 
                    ? 'border-primary-500 dark:border-primary-400 relative' 
                    : 'border-gray-200 dark:border-gray-700'
                } overflow-hidden`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary-500 text-white px-4 py-1 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {plan.description}
                  </p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">${plan.price}</span>
                    <span className="text-gray-600 dark:text-gray-300 ml-2">/ month</span>
                    {billingCycle === 'annual' && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Billed annually (${plan.price * 12}/year)
                      </p>
                    )}
                  </div>
                  
                  <Link 
                    to="/auth?signup=true" 
                    className={`block w-full py-3 px-4 rounded-lg text-center font-medium ${
                      plan.popular 
                        ? 'bg-gradient-ai hover:opacity-90 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                    } transition-colors mb-6`}
                  >
                    {plan.cta}
                  </Link>
                  
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Includes:
                    </p>
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300 text-sm">
                          {feature}
                        </span>
                      </div>
                    ))}
                    
                    {plan.notIncluded && plan.notIncluded.length > 0 && (
                      <>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mt-4">
                          Not included:
                        </p>
                        {plan.notIncluded.map((feature, i) => (
                          <div key={i} className="flex items-start">
                            <X className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Enterprise Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl shadow-xl text-white p-8"
          >
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0">
                <div className="flex items-center mb-4">
                  <Building className="w-8 h-8 mr-3" />
                  <h3 className="text-2xl font-bold">Enterprise</h3>
                </div>
                <p className="text-gray-300 mb-4 max-w-xl">
                  Custom solutions for large teams with advanced security, compliance, and integration needs.
                </p>
                <button
                  onClick={() => setShowEnterprise(!showEnterprise)}
                  className="text-primary-400 hover:text-primary-300 flex items-center text-sm font-medium"
                >
                  {showEnterprise ? 'Hide details' : 'Show details'}
                  <ArrowRight className={`w-4 h-4 ml-1 transition-transform ${showEnterprise ? 'rotate-90' : ''}`} />
                </button>
              </div>
              <Link 
                to="/contact" 
                className="bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium flex items-center"
              >
                Contact Sales
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
            
            {showEnterprise && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-primary-400" />
                    Unlimited Team Size
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Support for organizations of any size with role-based access control.
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-primary-400" />
                    Advanced Security
                  </h4>
                  <p className="text-gray-300 text-sm">
                    SOC 2, HIPAA, and GDPR compliance with enterprise-grade security features.
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-primary-400" />
                    Custom Integrations
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Dedicated support for custom integrations with your existing tools and workflows.
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need to know about our AI Code Review platform
            </p>
          </div>
          
          <div className="space-y-6">
            {[
              {
                question: "How does the AI code review work?",
                answer: "Our platform uses advanced AI models like GPT-4 to analyze your code for security vulnerabilities, performance issues, and code quality problems. The AI provides specific, actionable suggestions to improve your code, which you can apply with a single click."
              },
              {
                question: "Which programming languages are supported?",
                answer: "We support over 20 programming languages including JavaScript, TypeScript, Python, Java, C#, Go, Ruby, PHP, Swift, Kotlin, and more. Our AI models are trained on a diverse range of codebases to provide accurate suggestions across all supported languages."
              },
              {
                question: "How secure is my code?",
                answer: "Your code's security is our top priority. All code is encrypted in transit and at rest. We do not store your code longer than necessary for analysis, and you can configure retention policies. We also offer on-premises deployment options for enterprise customers with strict security requirements."
              },
              {
                question: "Can I integrate with my existing workflow?",
                answer: "Yes! We offer integrations with GitHub, GitLab, Bitbucket, and other popular version control systems. You can also integrate with CI/CD pipelines like Jenkins, CircleCI, and GitHub Actions. Our API allows for custom integrations with your existing tools."
              },
              {
                question: "What's the difference between the AI models?",
                answer: "We offer multiple AI models with different strengths. GPT-4o provides the best overall analysis, while Claude models offer larger context windows for bigger codebases. You can select the model that best fits your specific needs and codebase size."
              },
              {
                question: "Do you offer a free trial?",
                answer: "Yes, we offer a 14-day free trial on all plans with no credit card required. You can try all features and see the value our platform provides before committing to a subscription."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-start">
                  <HelpCircle className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2 flex-shrink-0 mt-0.5" />
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 ml-7">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Still have questions?
            </p>
            <Link 
              to="/contact" 
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center justify-center"
            >
              Contact our support team
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-ai rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">AI Code Review</span>
              </div>
              <p className="text-gray-400 mb-6">
                Enterprise-grade code review powered by artificial intelligence.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link to="/features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/security" className="text-gray-400 hover:text-white transition-colors">Security</Link></li>
                <li><Link to="/enterprise" className="text-gray-400 hover:text-white transition-colors">Enterprise</Link></li>
                <li><Link to="/changelog" className="text-gray-400 hover:text-white transition-colors">Changelog</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link to="/docs" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
                <li><Link to="/api" className="text-gray-400 hover:text-white transition-colors">API Reference</Link></li>
                <li><Link to="/guides" className="text-gray-400 hover:text-white transition-colors">Guides</Link></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/support" className="text-gray-400 hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© {new Date().getFullYear()} AI Code Review. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;
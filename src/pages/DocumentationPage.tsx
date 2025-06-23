import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Book, 
  Code, 
  Terminal, 
  FileText, 
  Search, 
  ChevronRight, 
  ExternalLink,
  Github,
  Gitlab,
  Sparkles
} from 'lucide-react';

const DocumentationPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const docCategories = [
    {
      title: 'Getting Started',
      icon: <Book className="w-5 h-5" />,
      items: [
        { title: 'Introduction', path: '/docs/introduction' },
        { title: 'Quick Start Guide', path: '/docs/quick-start' },
        { title: 'Installation', path: '/docs/installation' },
        { title: 'Authentication', path: '/docs/authentication' }
      ]
    },
    {
      title: 'Core Features',
      icon: <Code className="w-5 h-5" />,
      items: [
        { title: 'Code Analysis', path: '/docs/code-analysis' },
        { title: 'Security Scanning', path: '/docs/security-scanning' },
        { title: 'Performance Analysis', path: '/docs/performance-analysis' },
        { title: 'AI Models', path: '/docs/ai-models' }
      ]
    },
    {
      title: 'Integrations',
      icon: <Github className="w-5 h-5" />,
      items: [
        { title: 'GitHub Integration', path: '/docs/github-integration' },
        { title: 'GitLab Integration', path: '/docs/gitlab-integration' },
        { title: 'CI/CD Integration', path: '/docs/cicd-integration' },
        { title: 'API Reference', path: '/docs/api-reference' }
      ]
    },
    {
      title: 'Advanced Usage',
      icon: <Terminal className="w-5 h-5" />,
      items: [
        { title: 'Custom Rules', path: '/docs/custom-rules' },
        { title: 'Team Management', path: '/docs/team-management' },
        { title: 'Webhooks', path: '/docs/webhooks' },
        { title: 'Advanced Configuration', path: '/docs/advanced-configuration' }
      ]
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
              <Link to="/pricing" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium">
                Pricing
              </Link>
              <Link to="/docs" className="text-primary-600 dark:text-primary-400 px-3 py-2 text-sm font-medium">
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

      {/* Documentation Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search documentation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              <nav className="space-y-8">
                {docCategories.map((category, index) => (
                  <div key={index}>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      <span className="text-primary-600 dark:text-primary-400 mr-2">
                        {category.icon}
                      </span>
                      {category.title}
                    </h3>
                    <ul className="space-y-2 pl-7">
                      {category.items.map((item, i) => (
                        <li key={i}>
                          <Link 
                            to={item.path} 
                            className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm"
                          >
                            {item.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <div className="prose prose-blue dark:prose-invert max-w-none">
                <h1>Documentation</h1>
                <p className="lead">
                  Welcome to the AI Code Review documentation. Here you'll find comprehensive guides and documentation to help you start working with our platform as quickly as possible.
                </p>
                
                <h2>Getting Started</h2>
                <p>
                  AI Code Review is an advanced code analysis platform that uses artificial intelligence to help you write better, more secure, and more efficient code. Our platform integrates with your existing workflow and provides actionable insights to improve your codebase.
                </p>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-6">
                  <h3 className="text-blue-800 dark:text-blue-300 flex items-center text-lg font-medium mb-2">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Quick Start
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300 mb-4">
                    Get up and running with AI Code Review in minutes:
                  </p>
                  <ol className="list-decimal pl-5 space-y-2 text-blue-700 dark:text-blue-300">
                    <li>Sign up for an account</li>
                    <li>Connect your GitHub repository or upload your code</li>
                    <li>Configure your analysis preferences</li>
                    <li>Start your first code review</li>
                  </ol>
                </div>
                
                <h2>Key Features</h2>
                
                <h3>AI-Powered Code Analysis</h3>
                <p>
                  Our platform uses advanced AI models like GPT-4 to analyze your code for:
                </p>
                <ul>
                  <li>Security vulnerabilities</li>
                  <li>Performance bottlenecks</li>
                  <li>Code quality issues</li>
                  <li>Maintainability concerns</li>
                  <li>Style and best practices</li>
                </ul>
                
                <h3>Multiple AI Models</h3>
                <p>
                  Choose from a variety of AI models to best suit your needs:
                </p>
                <ul>
                  <li><strong>GPT-4o</strong>: Best overall analysis with balanced performance</li>
                  <li><strong>Claude 3 Opus</strong>: Largest context window for big codebases</li>
                  <li><strong>GPT-4 Turbo</strong>: Fast analysis for quick feedback</li>
                </ul>
                
                <h3>GitHub Integration</h3>
                <p>
                  Seamlessly integrate with GitHub to:
                </p>
                <ul>
                  <li>Automatically review pull requests</li>
                  <li>Add comments directly to your code</li>
                  <li>Track code quality over time</li>
                  <li>Enforce quality gates in your CI/CD pipeline</li>
                </ul>
                
                <h2>Code Examples</h2>
                
                <h3>API Usage Example</h3>
                <pre><code className="language-javascript">{`
// Initialize the AI Code Review client
const codeReview = new AICodeReview({
  apiKey: 'your-api-key',
  model: 'gpt-4o'
});

// Start a code review
const review = await codeReview.analyze({
  repository: 'user/repo',
  branch: 'main',
  options: {
    security: true,
    performance: true,
    quality: true
  }
});

// Get the results
console.log(\`Found \${review.issues.length} issues\`);
console.log(\`Quality score: \${review.metrics.quality}%\`);
                `}</code></pre>
                
                <h2>Next Steps</h2>
                <p>
                  Explore our documentation to learn more about how to get the most out of AI Code Review:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {[
                    { title: 'Quick Start Guide', path: '/docs/quick-start', icon: <Zap className="w-5 h-5" /> },
                    { title: 'GitHub Integration', path: '/docs/github-integration', icon: <Github className="w-5 h-5" /> },
                    { title: 'GitLab Integration', path: '/docs/gitlab-integration', icon: <Gitlab className="w-5 h-5" /> },
                    { title: 'API Reference', path: '/docs/api-reference', icon: <Code className="w-5 h-5" /> }
                  ].map((item, index) => (
                    <Link 
                      key={index}
                      to={item.path}
                      className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400 transition-colors"
                    >
                      <span className="text-primary-600 dark:text-primary-400 mr-3">
                        {item.icon}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {item.title}
                      </span>
                      <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                    </Link>
                  ))}
                </div>
                
                <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <FileText className="w-4 h-4 mr-1" />
                      Last updated: April 15, 2025
                    </div>
                    <a 
                      href="#" 
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm flex items-center"
                    >
                      Edit this page on GitHub
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-12">
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

export default DocumentationPage;
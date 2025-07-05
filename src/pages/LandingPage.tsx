import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Code, 
  Shield, 
  Zap, 
  CheckCircle, 
  ArrowRight, 
  Github, 
  FileCode, 
  Database, 
  Upload,
  Laptop,
  Users,
  Star,
  Sparkles,
  TrendingUp,
  Lock,
  Smartphone,
  Globe
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "AI-Powered Security",
      description: "Advanced vulnerability detection with real-time CVE database integration and OWASP compliance checking."
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-600" />,
      title: "Lightning Fast Reviews",
      description: "Get comprehensive code reviews in seconds with our multi-model AI orchestration and smart caching."
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Team Collaboration",
      description: "Real-time collaborative code editing with advanced team analytics and workflow management."
    },
    {
      icon: <Code className="w-8 h-8 text-purple-600" />,
      title: "Smart Refactoring",
      description: "Intelligent code optimization with 50+ refactoring rules and AI-enhanced analysis."
    },
    {
      icon: <Github className="w-8 h-8 text-gray-800 dark:text-gray-200" />,
      title: "GitHub Integration",
      description: "Seamless integration with GitHub repositories, pull requests, and CI/CD pipelines."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-indigo-600" />,
      title: "Analytics & Insights",
      description: "Comprehensive code quality metrics, team performance tracking, and predictive analytics."
    }
  ];

  const stats = [
    { value: "10K+", label: "Code Reviews" },
    { value: "500+", label: "Vulnerabilities Found" },
    { value: "99.9%", label: "Uptime" },
    { value: "< 2s", label: "Average Response" }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Lead Developer",
      company: "TechCorp",
      content: "AI Code Review has transformed our development workflow. The security insights alone have prevented countless vulnerabilities.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face"
    },
    {
      name: "Michael Rodriguez",
      role: "Engineering Manager",
      company: "StartupXYZ",
      content: "The real-time collaboration features have made our remote team 3x more productive. Incredible tool!",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face"
    },
    {
      name: "Emily Johnson",
      role: "Security Engineer",
      company: "SecureFlow",
      content: "The AI-powered vulnerability detection is unmatched. It catches issues our traditional tools miss.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">AI Code Review</span>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Features
              </a>
              <a href="#testimonials" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Testimonials
              </a>
              <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Pricing
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              <Link
                to="/auth"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-800 dark:text-blue-200 text-sm font-medium mb-6">
              <Star className="w-4 h-4 mr-2" />
              Trusted by 10,000+ developers worldwide
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              AI-Powered
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                Code Reviews
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Transform your development workflow with intelligent code analysis, real-time collaboration, 
              and enterprise-grade security. Catch vulnerabilities before they reach production.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                to="/auth"
                className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 font-semibold text-lg flex items-center"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              
              <button className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-semibold text-lg">
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features for Modern Development
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to ship secure, high-quality code faster than ever before.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
              >
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Loved by Developers Worldwide
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              See what our users say about their experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Code Reviews?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of developers already using AI Code Review to ship better code faster.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth"
              className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg"
            >
              Start Your Free Trial
            </Link>
            <button className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-all font-semibold text-lg">
              Schedule Demo
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center space-x-6 text-blue-100">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              No credit card required
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              14-day free trial
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">AI Code Review</span>
              </div>
              <p className="text-gray-400">
                Intelligent code analysis for modern development teams.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © 2024 AI Code Review. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code2, Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-dark-800/90 backdrop-blur-md py-3 shadow-lg' : 'bg-transparent py-5'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold">CodeAI</span>
              <span className="text-xs text-primary-400 block -mt-1">Enterprise Review</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#process" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Process</a>
            <a href="#testimonials" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Testimonials</a>
            <a href="#pricing" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Pricing</a>
            <a href="/login" className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors">Login</a>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <a 
              href="#trial" 
              className="px-5 py-2.5 bg-gradient-primary rounded-lg text-white font-medium hover:shadow-glow transition-all duration-300"
            >
              Start Free Trial
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          className="md:hidden bg-dark-800 border-t border-dark-700 py-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="container mx-auto px-4 flex flex-col space-y-4">
            <a 
              href="#features" 
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="#process" 
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Process
            </a>
            <a 
              href="#testimonials" 
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Testimonials
            </a>
            <a 
              href="#pricing" 
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </a>
            <a 
              href="/login" 
              className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </a>
            <a 
              href="#trial" 
              className="px-5 py-2.5 bg-gradient-primary rounded-lg text-white font-medium hover:shadow-glow transition-all duration-300 text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Start Free Trial
            </a>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Navbar;
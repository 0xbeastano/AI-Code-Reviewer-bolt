import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Code2, Settings, Bell, User, Search, 
  Moon, Sun, Maximize2, Minimize2, HelpCircle,
  Github, Twitter, Linkedin, Mail, Star
} from 'lucide-react';

interface PremiumLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showSidebar?: boolean;
  onSidebarToggle?: (isOpen: boolean) => void;
}

const PremiumLayout: React.FC<PremiumLayoutProps> = ({
  children,
  title = "AI Code Review Agent Pro",
  subtitle = "Professional Code Analysis Platform",
  showSidebar = true,
  onSidebarToggle
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Responsive handling
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    if (onSidebarToggle) {
      onSidebarToggle(newState);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const navigationItems = [
    { label: 'Dashboard', icon: Code2, href: '#dashboard' },
    { label: 'Code Review', icon: Search, href: '#review', active: true },
    { label: 'Analytics', icon: Star, href: '#analytics' },
    { label: 'Settings', icon: Settings, href: '#settings' },
  ];

  return (
    <div className="min-h-screen w-full overflow-hidden">
      {/* Premium Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/30 via-blue-900/30 to-slate-800/30"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full filter blur-3xl"></div>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative flex h-screen">
        {/* Sidebar */}
        {showSidebar && (
          <AnimatePresence>
            {(isSidebarOpen || !isMobile) && (
              <motion.aside
                initial={{ x: isMobile ? -300 : 0, opacity: isMobile ? 0 : 1 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: isMobile ? -300 : 0, opacity: isMobile ? 0 : 1 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={`premium-sidebar h-full ${
                  isMobile 
                    ? 'fixed inset-y-0 left-0 z-50 w-80' 
                    : 'relative w-80'
                }`}
              >
                <div className="flex flex-col h-full">
                  {/* Sidebar Header */}
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="premium-glow-blue p-2 rounded-lg bg-blue-500/20">
                          <Code2 className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <h1 className="premium-heading-3 text-gradient-blue">AI Review</h1>
                          <p className="premium-text-sm text-gray-400">v2.0 Pro</p>
                        </div>
                      </div>
                      {isMobile && (
                        <button
                          onClick={toggleSidebar}
                          className="premium-btn bg-white/10 hover:bg-white/20 text-white p-2"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Navigation */}
                  <nav className="flex-1 p-4 space-y-2">
                    {navigationItems.map((item, index) => (
                      <motion.a
                        key={item.label}
                        href={item.href}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                          item.active
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                        whileHover={{ x: 4 }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="premium-text">{item.label}</span>
                      </motion.a>
                    ))}
                  </nav>

                  {/* Sidebar Footer */}
                  <div className="p-4 border-t border-white/10">
                    <div className="premium-card p-3">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="premium-text font-medium">Pro User</p>
                          <p className="premium-text-sm text-gray-400">Premium Plan</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="premium-btn bg-white/10 hover:bg-white/20 text-white flex-1 py-2">
                          <Settings className="w-4 h-4" />
                        </button>
                        <button className="premium-btn bg-white/10 hover:bg-white/20 text-white flex-1 py-2">
                          <HelpCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        )}

        {/* Mobile Sidebar Overlay */}
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={toggleSidebar}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Top Header */}
          <header className="premium-header px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {showSidebar && (
                  <button
                    onClick={toggleSidebar}
                    className="premium-btn bg-white/10 hover:bg-white/20 text-white lg:hidden"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                )}
                
                <div className="hidden sm:block">
                  <h1 className="premium-heading-2">{title}</h1>
                  <p className="premium-text-sm text-gray-400">{subtitle}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Search Bar */}
                <div className="hidden md:block relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search files..."
                    className="premium-input pl-10 pr-4 py-2 w-64"
                  />
                </div>

                {/* Action Buttons */}
                <button
                  onClick={toggleFullscreen}
                  className="premium-btn bg-white/10 hover:bg-white/20 text-white hidden sm:flex"
                  data-tooltip="Toggle Fullscreen"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                <button className="premium-btn bg-white/10 hover:bg-white/20 text-white relative">
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex-center">
                    <span className="sr-only">3 notifications</span>
                  </span>
                </button>

                <div className="premium-card p-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            <div className="p-4 sm:p-6 lg:p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full"
              >
                {children}
              </motion.div>
            </div>
          </div>

          {/* Footer */}
          <footer className="premium-header px-4 sm:px-6 lg:px-8 py-4 border-t border-white/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>&copy; 2024 AI Code Review Agent Pro</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">Built with AI Excellence</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Github className="w-4 h-4" />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Performance Indicator */}
      <div className="fixed bottom-4 right-4 z-50">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="premium-card p-3 bg-green-500/20 border-green-500/30"
        >
          <div className="flex items-center space-x-2">
            <div className="premium-status-dot premium-status-success"></div>
            <span className="premium-text-sm text-green-400">System Optimal</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PremiumLayout;
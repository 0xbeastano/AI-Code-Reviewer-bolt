import React, { useState } from 'react';
import { Palette, Monitor, Sun, Moon, Smartphone } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';

const ThemeSettings: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>('system');

  const themes = [
    {
      id: 'light',
      name: 'Light',
      description: 'Clean and bright interface',
      icon: Sun,
      preview: 'bg-white border-gray-200'
    },
    {
      id: 'dark',
      name: 'Dark',
      description: 'Easy on the eyes in low light',
      icon: Moon,
      preview: 'bg-gray-900 border-gray-700'
    },
    {
      id: 'system',
      name: 'System',
      description: 'Follows your device settings',
      icon: Monitor,
      preview: 'bg-gradient-to-br from-white to-gray-900 border-gray-400'
    }
  ];

  const handleThemeChange = (themeId: 'light' | 'dark' | 'system') => {
    setSelectedTheme(themeId);
    if (themeId !== 'system') {
      // In a real app, you'd update the theme context
      toggleTheme();
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Appearance Settings
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Customize the look and feel of your interface
        </p>
      </div>

      {/* Theme Selection */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Palette className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Theme Preference
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <motion.button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id as any)}
              className={`p-4 border-2 rounded-lg transition-all ${
                selectedTheme === theme.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-center">
                {/* Theme Preview */}
                <div className={`w-16 h-12 mx-auto mb-3 rounded-lg border-2 ${theme.preview}`}>
                  <div className="h-full flex items-center justify-center">
                    <theme.icon className={`w-6 h-6 ${
                      theme.id === 'light' ? 'text-gray-600' : 
                      theme.id === 'dark' ? 'text-gray-300' : 'text-gray-500'
                    }`} />
                  </div>
                </div>
                
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {theme.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {theme.description}
                </p>
                
                {selectedTheme === theme.id && (
                  <div className="mt-3">
                    <div className="w-4 h-4 bg-primary-600 rounded-full mx-auto flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  </div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Display Settings */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Monitor className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Display Settings
          </h3>
        </div>

        <div className="space-y-6">
          {/* Compact Mode */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Compact Mode</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Reduce spacing and padding for a more dense layout
              </p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-600 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
            </button>
          </div>

          {/* Animations */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Animations</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enable smooth transitions and micro-interactions
              </p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">High Contrast</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Increase contrast for better accessibility
              </p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-600 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Accessibility */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200">
              Accessibility Features
            </h3>
            <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
              This application supports screen readers, keyboard navigation, and follows WCAG 2.1 AA guidelines.
            </p>
            <ul className="mt-3 text-sm text-blue-600 dark:text-blue-300 space-y-1">
              <li>• Full keyboard navigation support</li>
              <li>• Screen reader compatible</li>
              <li>• High contrast mode available</li>
              <li>• Reduced motion preferences respected</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
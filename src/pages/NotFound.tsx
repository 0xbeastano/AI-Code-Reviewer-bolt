import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* 404 Animation */}
          <div className="relative">
            <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-700 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-6xl font-bold">
                404
              </div>
            </div>
          </div>

          {/* Error Message */}
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Page Not Found
          </h2>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Sorry, we couldn't find the page you're looking for.
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
            The page may have been moved, deleted, or you entered an incorrect URL.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              Go Home
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </button>
          </div>

          {/* Search Suggestion */}
          <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Looking for something specific?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try navigating to one of these popular sections:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Link
                to="/dashboard"
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
              >
                Dashboard
              </Link>
              <Link
                to="/analytics"
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
              >
                Analytics
              </Link>
              <Link
                to="/repositories"
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
              >
                Repositories
              </Link>
              <Link
                to="/settings"
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
              >
                Settings
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8">
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Error Code: 404 | Page Not Found
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ 
  items, 
  separator = <ChevronRight className="w-4 h-4" /> 
}) => {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center space-x-2 text-sm">
        <li>
          <button
            onClick={() => window.location.href = '/'}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            aria-label="Go to home"
          >
            <Home className="w-4 h-4" />
          </button>
        </li>
        
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <li className="text-gray-400 dark:text-gray-600">
              {separator}
            </li>
            <li>
              {item.current ? (
                <span 
                  className="text-gray-900 dark:text-white font-medium"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <button
                  onClick={item.onClick}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                >
                  {item.label}
                </button>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
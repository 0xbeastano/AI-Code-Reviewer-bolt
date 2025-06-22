import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
}

const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  label = 'Back',
  disabled = false,
  variant = 'ghost'
}) => {
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white border-primary-600',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white border-gray-600',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border-transparent'
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center px-4 py-2 border rounded-lg
        font-medium text-sm transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        dark:focus:ring-offset-gray-900
        ${variantClasses[variant]}
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'cursor-pointer'
        }
      `}
      whileHover={!disabled ? { x: -2 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      {label}
    </motion.button>
  );
};

export default BackButton;
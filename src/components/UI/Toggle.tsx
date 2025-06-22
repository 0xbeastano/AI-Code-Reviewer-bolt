import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ToggleProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  persistKey?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  id,
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  persistKey
}) => {
  const [isChanging, setIsChanging] = useState(false);
  const [localChecked, setLocalChecked] = useState(checked);

  // Persist state to localStorage
  useEffect(() => {
    if (persistKey) {
      const savedState = localStorage.getItem(`toggle_${persistKey}`);
      if (savedState !== null) {
        const parsedState = JSON.parse(savedState);
        setLocalChecked(parsedState);
        onChange(parsedState);
      }
    }
  }, [persistKey, onChange]);

  const handleToggle = useCallback(async () => {
    if (disabled || isChanging) return;

    setIsChanging(true);
    const newValue = !localChecked;
    
    try {
      // Simulate async state change (for API calls)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setLocalChecked(newValue);
      onChange(newValue);
      
      // Persist to localStorage
      if (persistKey) {
        localStorage.setItem(`toggle_${persistKey}`, JSON.stringify(newValue));
      }
    } catch (error) {
      console.error('Toggle state change failed:', error);
    } finally {
      setIsChanging(false);
    }
  }, [localChecked, onChange, disabled, isChanging, persistKey]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  }, [handleToggle]);

  const sizeClasses = {
    sm: { container: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
    md: { container: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' },
    lg: { container: 'w-14 h-8', thumb: 'w-7 h-7', translate: 'translate-x-6' }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <label 
          htmlFor={id}
          className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
        >
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </div>
      
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={localChecked}
        aria-label={`Toggle ${label}`}
        aria-describedby={description ? `${id}-description` : undefined}
        disabled={disabled || isChanging}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`
          relative inline-flex items-center ${currentSize.container} rounded-full
          transition-colors duration-200 ease-in-out focus:outline-none
          focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          dark:focus:ring-offset-gray-900
          ${localChecked 
            ? 'bg-primary-600 dark:bg-primary-500' 
            : 'bg-gray-200 dark:bg-gray-700'
          }
          ${disabled || isChanging 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer hover:bg-opacity-80'
          }
        `}
      >
        <motion.div
          className={`
            ${currentSize.thumb} bg-white rounded-full shadow-lg
            flex items-center justify-center
          `}
          animate={{
            x: localChecked ? currentSize.translate.replace('translate-x-', '') : '2px'
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        >
          {isChanging && (
            <div className="w-2 h-2 border border-gray-400 border-t-transparent rounded-full animate-spin" />
          )}
        </motion.div>
      </button>
      
      {description && (
        <div id={`${id}-description`} className="sr-only">
          {description}
        </div>
      )}
    </div>
  );
};

export default Toggle;
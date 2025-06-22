import React, { useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  name: string;
  value: string;
  options: RadioOption[];
  onChange: (value: string) => void;
  label: string;
  description?: string;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  persistKey?: string;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  value,
  options,
  onChange,
  label,
  description,
  orientation = 'horizontal',
  size = 'md',
  persistKey
}) => {
  const groupRef = useRef<HTMLFieldSetElement>(null);

  // Persist selection to localStorage
  useEffect(() => {
    if (persistKey) {
      const savedValue = localStorage.getItem(`radio_${persistKey}`);
      if (savedValue && options.some(opt => opt.value === savedValue)) {
        onChange(savedValue);
      }
    }
  }, [persistKey, onChange, options]);

  const handleChange = useCallback((newValue: string) => {
    onChange(newValue);
    
    // Persist to localStorage
    if (persistKey) {
      localStorage.setItem(`radio_${persistKey}`, newValue);
    }
  }, [onChange, persistKey]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const currentIndex = options.findIndex(opt => opt.value === value);
    let nextIndex = currentIndex;

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        nextIndex = (currentIndex + 1) % options.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        nextIndex = currentIndex === 0 ? options.length - 1 : currentIndex - 1;
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = options.length - 1;
        break;
      default:
        return;
    }

    const nextOption = options[nextIndex];
    if (nextOption && !nextOption.disabled) {
      handleChange(nextOption.value);
      
      // Focus the next radio button
      const radioElement = groupRef.current?.querySelector(
        `input[value="${nextOption.value}"]`
      ) as HTMLInputElement;
      radioElement?.focus();
    }
  }, [value, options, handleChange]);

  const sizeClasses = {
    sm: 'text-sm p-3',
    md: 'text-base p-4',
    lg: 'text-lg p-5'
  };

  return (
    <fieldset 
      ref={groupRef}
      className="space-y-4"
      onKeyDown={handleKeyDown}
    >
      <legend className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {label}
      </legend>
      
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {description}
        </p>
      )}

      <div className={`
        grid gap-4
        ${orientation === 'horizontal' 
          ? `grid-cols-1 md:grid-cols-${Math.min(options.length, 3)}` 
          : 'grid-cols-1'
        }
      `}>
        {options.map((option, index) => {
          const isSelected = value === option.value;
          const isDisabled = option.disabled;
          
          return (
            <motion.label
              key={option.value}
              className={`
                ${sizeClasses[size]} border-2 rounded-lg cursor-pointer 
                transition-all duration-200 relative overflow-hidden
                focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2
                dark:focus-within:ring-offset-gray-900
                ${isSelected
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                }
                ${isDisabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:shadow-md'
                }
              `}
              whileHover={!isDisabled ? { scale: 1.02 } : {}}
              whileTap={!isDisabled ? { scale: 0.98 } : {}}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={(e) => handleChange(e.target.value)}
                disabled={isDisabled}
                className="sr-only"
                aria-describedby={option.description ? `${name}-${option.value}-desc` : undefined}
              />
              
              <div className="text-center relative">
                {/* Selection indicator */}
                {isSelected && (
                  <motion.div
                    className="absolute top-2 right-2 w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}
                
                <p className="font-medium text-gray-900 dark:text-white capitalize mb-2">
                  {option.label}
                </p>
                
                {option.description && (
                  <p 
                    id={`${name}-${option.value}-desc`}
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    {option.description}
                  </p>
                )}
              </div>
            </motion.label>
          );
        })}
      </div>
    </fieldset>
  );
};

export default RadioGroup;
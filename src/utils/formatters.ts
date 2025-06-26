/**
 * Utility functions for formatting and display
 */

/**
 * Format a percentage value to always show as an integer
 * @param value - The percentage value to format
 * @returns Formatted percentage as an integer
 */
export const formatPercentage = (value: number): number => {
  return Math.round(value);
};

/**
 * Get the appropriate color class for a metric based on its value
 * @param value - The metric value (0-100)
 * @param reverse - Whether higher values are worse (e.g., for complexity)
 * @returns Tailwind CSS color class
 */
export const getMetricColor = (value: number, reverse = false): string => {
  if (reverse) {
    if (value >= 80) return 'text-error-600 dark:text-error-400';
    if (value >= 60) return 'text-warning-600 dark:text-warning-400';
    return 'text-success-600 dark:text-success-400';
  }
  if (value >= 80) return 'text-success-600 dark:text-success-400';
  if (value >= 60) return 'text-warning-600 dark:text-warning-400';
  return 'text-error-600 dark:text-error-400';
};

/**
 * Get the appropriate color class for a severity level
 * @param severity - The severity level (critical, high, medium, low)
 * @returns Tailwind CSS color class
 */
export const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'critical': return 'text-error-600 dark:text-error-400 bg-error-50 dark:bg-error-900/20';
    case 'high': return 'text-warning-600 dark:text-warning-400 bg-warning-50 dark:bg-warning-900/20';
    case 'medium': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
    default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800';
  }
};

/**
 * Get the appropriate icon for a status
 * @param status - The status string
 * @returns JSX element for the icon
 */
export const getStatusIcon = (status: string): React.ReactNode => {
  // This function will be implemented in the components that need it
  // as it requires importing specific icons from lucide-react
  return null;
};

/**
 * Format a file size in bytes to a human-readable string
 * @param bytes - The file size in bytes
 * @returns Formatted file size (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param content - The HTML content to sanitize
 * @returns Sanitized HTML content
 */
export const sanitizeHtml = (content: string): string => {
  // This is a placeholder - actual implementation will use DOMPurify
  // and will be imported where needed
  return content;
};
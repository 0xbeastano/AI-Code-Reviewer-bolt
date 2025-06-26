import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param content - The HTML content to sanitize
 * @returns Sanitized HTML content
 */
export const sanitizeHtml = (content: string): string => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'code', 'pre', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],
    FORCE_BODY: true,
    SANITIZE_DOM: true,
    USE_PROFILES: { html: true }
  });
};

/**
 * Sanitize a string for use in HTML attributes
 * @param str - The string to sanitize
 * @returns Sanitized string
 */
export const sanitizeAttribute = (str: string): string => {
  return str.replace(/[^\w\s-]/gi, '');
};

/**
 * Sanitize user input for use in code or commands
 * @param input - The user input to sanitize
 * @returns Sanitized input
 */
export const sanitizeUserInput = (input: string): string => {
  // Remove potentially dangerous characters
  return input.replace(/[;&|`$(){}[\]<>]/g, '');
};
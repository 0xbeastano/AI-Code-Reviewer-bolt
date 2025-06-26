import CryptoJS from 'crypto-js';

/**
 * Utility functions for security operations
 */

// Secret key for encryption (in a real app, this would be an environment variable)
const SECRET_KEY = 'ai-code-review-secure-key';

/**
 * Encrypt sensitive data
 * @param data - Data to encrypt
 * @returns Encrypted string
 */
export const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};

/**
 * Decrypt encrypted data
 * @param encryptedData - Encrypted string
 * @returns Decrypted data
 */
export const decryptData = (encryptedData: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

/**
 * Hash a password (for client-side operations only)
 * @param password - Password to hash
 * @returns Hashed password
 */
export const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password).toString();
};

/**
 * Generate a secure random token
 * @param length - Length of the token
 * @returns Random token
 */
export const generateToken = (length: number = 32): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  
  // Use crypto API if available for better randomness
  if (window.crypto && window.crypto.getRandomValues) {
    const values = new Uint32Array(length);
    window.crypto.getRandomValues(values);
    for (let i = 0; i < length; i++) {
      result += characters.charAt(values[i] % charactersLength);
    }
    return result;
  }
  
  // Fallback to Math.random
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
};

/**
 * Validate a CSRF token
 * @param token - Token to validate
 * @param storedToken - Stored token to compare against
 * @returns Whether the token is valid
 */
export const validateCsrfToken = (token: string, storedToken: string): boolean => {
  return token === storedToken;
};

/**
 * Generate a CSRF token and store it in session storage
 * @returns CSRF token
 */
export const generateCsrfToken = (): string => {
  const token = generateToken();
  sessionStorage.setItem('csrf_token', token);
  return token;
};

/**
 * Sanitize user input to prevent XSS attacks
 * @param input - User input to sanitize
 * @returns Sanitized input
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};
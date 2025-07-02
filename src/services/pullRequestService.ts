import { PullRequest, PullRequestFile, PullRequestSummary } from '../types/pullRequest';

class PullRequestService {
  private apiUrl = import.meta.env.VITE_API_URL || 'https://api.codereviewer.ai';

  async getPullRequests(owner: string, repo: string): Promise<PullRequest[]> {
    try {
      // In a real implementation, this would call the GitHub API
      // For now, we'll return mock data
      return this.getMockPullRequests(owner, repo);
    } catch (error) {
      console.error('Error fetching pull requests:', error);
      throw error;
    }
  }

  async getPullRequestFiles(owner: string, repo: string, prNumber: number): Promise<PullRequestFile[]> {
    try {
      // In a real implementation, this would call the GitHub API
      // For now, we'll return mock data
      return this.getMockPullRequestFiles(owner, repo, prNumber);
    } catch (error) {
      console.error('Error fetching pull request files:', error);
      throw error;
    }
  }

  async generatePullRequestSummary(
    owner: string,
    repo: string,
    prNumber: number,
    model: string = 'claude-3-haiku'
  ): Promise<PullRequestSummary> {
    try {
      // In a real implementation, this would call the OpenAI API via a Supabase Edge Function
      // For now, we'll return mock data
      return this.getMockPullRequestSummary(owner, repo, prNumber, model);
    } catch (error) {
      console.error('Error generating pull request summary:', error);
      throw error;
    }
  }

  private getMockPullRequests(owner: string, repo: string): PullRequest[] {
    return [
      {
        id: 'pr-1',
        number: 123,
        title: 'Add user authentication',
        description: 'This PR adds user authentication using JWT tokens and implements the login/signup flows.',
        author: {
          name: 'Jane Smith',
          avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          url: 'https://github.com/janesmith'
        },
        repository: {
          name: repo,
          fullName: `${owner}/${repo}`,
          url: `https://github.com/${owner}/${repo}`
        },
        baseBranch: 'main',
        headBranch: 'feature/auth',
        status: 'open',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        commits: 5,
        additions: 350,
        deletions: 20,
        changedFiles: 8,
        url: `https://github.com/${owner}/${repo}/pull/123`
      },
      {
        id: 'pr-2',
        number: 124,
        title: 'Refactor API client',
        description: 'Refactors the API client to use axios and adds better error handling.',
        author: {
          name: 'John Doe',
          avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          url: 'https://github.com/johndoe'
        },
        repository: {
          name: repo,
          fullName: `${owner}/${repo}`,
          url: `https://github.com/${owner}/${repo}`
        },
        baseBranch: 'main',
        headBranch: 'refactor/api-client',
        status: 'open',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        commits: 3,
        additions: 120,
        deletions: 95,
        changedFiles: 4,
        url: `https://github.com/${owner}/${repo}/pull/124`
      },
      {
        id: 'pr-3',
        number: 120,
        title: 'Fix pagination bug',
        description: 'Fixes a bug in the pagination component where the last page was not being displayed correctly.',
        author: {
          name: 'Alex Johnson',
          avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          url: 'https://github.com/alexjohnson'
        },
        repository: {
          name: repo,
          fullName: `${owner}/${repo}`,
          url: `https://github.com/${owner}/${repo}`
        },
        baseBranch: 'main',
        headBranch: 'fix/pagination',
        status: 'merged',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        mergedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        commits: 1,
        additions: 15,
        deletions: 5,
        changedFiles: 2,
        url: `https://github.com/${owner}/${repo}/pull/120`
      }
    ];
  }

  private getMockPullRequestFiles(owner: string, repo: string, prNumber: number): PullRequestFile[] {
    // Different files based on PR number for variety
    if (prNumber === 123) {
      return [
        {
          filename: 'src/services/authService.js',
          status: 'added',
          additions: 150,
          deletions: 0,
          changes: 150,
          content: `import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export const authService = {
  login: async (email, password) => {
    // In a real app, you would validate credentials against a database
    if (email === 'user@example.com' && password === 'password') {
      const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });
      return { success: true, token };
    }
    return { success: false, message: 'Invalid credentials' };
  },
  
  register: async (email, password) => {
    // In a real app, you would store the user in a database
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });
    return { success: true, token };
  },
  
  validateToken: (token) => {
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      return { valid: true, user: decoded };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
};`,
          language: 'javascript'
        },
        {
          filename: 'src/components/Auth/LoginForm.jsx',
          status: 'added',
          additions: 80,
          deletions: 0,
          changes: 80,
          content: `import React, { useState } from 'react';
import { authService } from '../../services/authService';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await authService.login(email, password);
      if (result.success) {
        localStorage.setItem('token', result.token);
        window.location.href = '/dashboard';
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
};

export default LoginForm;`,
          language: 'javascript'
        },
        {
          filename: 'src/components/Auth/SignupForm.jsx',
          status: 'added',
          additions: 100,
          deletions: 0,
          changes: 100,
          content: `import React, { useState } from 'react';
import { authService } from '../../services/authService';

const SignupForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      const result = await authService.register(email, password);
      if (result.success) {
        localStorage.setItem('token', result.token);
        window.location.href = '/dashboard';
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {loading ? 'Creating account...' : 'Sign up'}
      </button>
    </form>
  );
};

export default SignupForm;`,
          language: 'javascript'
        }
      ];
    } else if (prNumber === 124) {
      return [
        {
          filename: 'src/services/apiClient.js',
          status: 'modified',
          additions: 80,
          deletions: 60,
          changes: 140,
          content: `import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.example.com';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle different error statuses
    if (error.response) {
      // Server responded with non-2xx status
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden');
          break;
        case 404:
          // Not found
          console.error('Resource not found');
          break;
        case 500:
          // Server error
          console.error('Server error');
          break;
        default:
          console.error('API error:', error.response.data);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('No response received:', error.request);
    } else {
      // Error setting up request
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;`,
          language: 'javascript'
        },
        {
          filename: 'src/services/userService.js',
          status: 'modified',
          additions: 40,
          deletions: 35,
          changes: 75,
          content: `import apiClient from './apiClient';

export const userService = {
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },
  
  updateProfile: async (userData) => {
    try {
      const response = await apiClient.put('/users/me', userData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  
  getUsers: async (params = {}) => {
    try {
      const response = await apiClient.get('/users', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  getUserById: async (id) => {
    try {
      const response = await apiClient.get(\`/users/\${id}\`);
      return response.data;
    } catch (error) {
      console.error(\`Error fetching user \${id}:\`, error);
      throw error;
    }
  }
};`,
          language: 'javascript'
        }
      ];
    } else {
      return [
        {
          filename: 'src/components/Pagination.jsx',
          status: 'modified',
          additions: 15,
          deletions: 5,
          changes: 20,
          content: `import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max to show
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of page range
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if at the beginning
      if (currentPage <= 2) {
        end = Math.min(totalPages - 1, maxPagesToShow - 1);
      }
      
      // Adjust if at the end
      if (currentPage >= totalPages - 1) {
        start = Math.max(2, totalPages - maxPagesToShow + 2);
      }
      
      // Add ellipsis if needed at the beginning
      if (start > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed at the end
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-center space-x-2 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
      >
        Previous
      </button>
      
      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' ? onPageChange(page) : null}
          disabled={page === '...' || page === currentPage}
          className={\`px-3 py-1 rounded \${
            page === currentPage
              ? 'bg-blue-500 text-white'
              : page === '...'
              ? 'cursor-default'
              : 'border border-gray-300 hover:bg-gray-100'
          }\`}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;`,
          language: 'javascript'
        }
      ];
    }
  }

  private getMockPullRequestSummary(owner: string, repo: string, prNumber: number, model: string): PullRequestSummary {
    // Different summaries based on PR number
    if (prNumber === 123) {
      return {
        id: 'summary-123',
        pullRequestId: 'pr-1',
        summary: 'This PR adds user authentication functionality including login and signup forms, along with a JWT-based authentication service. The implementation is solid overall with good separation of concerns, but there are some security considerations that should be addressed.',
        keyChanges: [
          'Added authService.js with JWT token generation and validation',
          'Created LoginForm component with form validation',
          'Created SignupForm component with password confirmation',
          'Implemented token storage in localStorage'
        ],
        potentialIssues: [
          'Hard-coded secret key in authService.js should be moved to environment variables',
          'No password hashing is implemented before storing user credentials',
          'No rate limiting for login attempts which could lead to brute force attacks',
          'Token expiration is set to only 1 hour which might be too short for good UX'
        ],
        suggestedFeedback: [
          'Move the SECRET_KEY to environment variables and ensure it\'s not committed to version control',
          'Implement password hashing using bcrypt or a similar library before storing credentials',
          'Consider adding rate limiting for authentication endpoints to prevent brute force attacks',
          'Add refresh token functionality to improve user experience while maintaining security',
          'Consider implementing password strength requirements in the signup form'
        ],
        securityConsiderations: [
          'JWT tokens stored in localStorage are vulnerable to XSS attacks; consider using HttpOnly cookies instead',
          'No CSRF protection is implemented for the authentication endpoints',
          'Email verification should be added to prevent account enumeration'
        ],
        testingRecommendations: [
          'Add unit tests for the authService functions',
          'Implement integration tests for the authentication flow',
          'Add tests for form validation in both LoginForm and SignupForm components',
          'Test token expiration and refresh functionality'
        ],
        generatedAt: new Date(),
        model: model,
        confidence: 0.92
      };
    } else if (prNumber === 124) {
      return {
        id: 'summary-124',
        pullRequestId: 'pr-2',
        summary: 'This PR refactors the API client to use axios instead of fetch, adding better error handling, request/response interceptors, and a more consistent interface. The changes improve error handling significantly and add proper authentication token management.',
        keyChanges: [
          'Replaced fetch with axios for API requests',
          'Added request interceptor for authentication tokens',
          'Implemented response interceptor with comprehensive error handling',
          'Updated userService to use the new apiClient',
          'Added specific error handling for different HTTP status codes'
        ],
        potentialIssues: [
          'Automatic redirect to login on 401 might interrupt user flow if multiple requests fail simultaneously',
          'Error messages are only logged to console, not displayed to the user',
          'No retry mechanism for failed requests due to network issues',
          'Hard-coded API URL should be moved to environment variables'
        ],
        suggestedFeedback: [
          'Consider implementing a more sophisticated auth token refresh mechanism before redirecting on 401',
          'Add a global error handling system to display errors to users when appropriate',
          'Implement request retries for network failures with exponential backoff',
          'Move the API_URL to environment variables and ensure it\'s properly configured for different environments',
          'Add request cancellation support for components that unmount during pending requests'
        ],
        securityConsiderations: [
          'Ensure sensitive error details are not exposed to users in production',
          'Consider adding request/response logging in development mode only',
          'Implement proper HTTPS validation in production environments'
        ],
        testingRecommendations: [
          'Add unit tests for the interceptors',
          'Create mock adapters for testing API requests',
          'Test error handling for different status codes',
          'Implement integration tests for the complete request flow'
        ],
        generatedAt: new Date(),
        model: model,
        confidence: 0.89
      };
    } else {
      return {
        id: `summary-${prNumber}`,
        pullRequestId: 'pr-3',
        summary: 'This PR fixes a bug in the pagination component where the last page was not being displayed correctly. The implementation now properly handles edge cases and improves the overall user experience.',
        keyChanges: [
          'Fixed logic for displaying page numbers in pagination',
          'Added proper handling for ellipsis display',
          'Improved edge case handling for first and last pages',
          'Enhanced visual feedback for current page'
        ],
        potentialIssues: [
          'The maxPagesToShow is hardcoded and not configurable',
          'No accessibility improvements were made to the pagination component'
        ],
        suggestedFeedback: [
          'Consider making maxPagesToShow a prop to allow customization',
          'Add ARIA attributes for better accessibility',
          'Consider adding keyboard navigation support',
          'Add unit tests to verify the pagination logic works correctly for all edge cases'
        ],
        securityConsiderations: [],
        testingRecommendations: [
          'Add unit tests for the getPageNumbers function',
          'Test edge cases: 1 page, 2 pages, max pages, and current page at different positions',
          'Add integration tests to verify user interaction works correctly'
        ],
        generatedAt: new Date(),
        model: model,
        confidence: 0.95
      };
    }
  }
}

export const pullRequestService = new PullRequestService();
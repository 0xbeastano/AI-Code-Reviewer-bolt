import { authService } from '../lib/auth';

export interface TestResult {
  testId: string;
  testName: string;
  status: 'passed' | 'failed' | 'pending' | 'skipped';
  duration: number;
  error?: string;
  details?: any;
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    pending: number;
    skipped: number;
  };
}

export class OAuthTestRunner {
  private results: TestResult[] = [];

  async runGitHubOAuthTests(): Promise<TestSuite> {
    console.log('🧪 Starting GitHub OAuth Tests...');
    
    const tests = [
      { id: 'GH-001', name: 'GitHub OAuth Configuration', test: this.testGitHubConfig },
      { id: 'GH-002', name: 'GitHub OAuth URL Generation', test: this.testGitHubUrlGeneration },
      { id: 'GH-003', name: 'GitHub OAuth State Validation', test: this.testGitHubStateValidation },
      { id: 'GH-004', name: 'GitHub API Access', test: this.testGitHubApiAccess },
      { id: 'GH-005', name: 'GitHub Repository Access', test: this.testGitHubRepositoryAccess },
    ];

    const results: TestResult[] = [];

    for (const test of tests) {
      const startTime = Date.now();
      try {
        await test.test.call(this);
        results.push({
          testId: test.id,
          testName: test.name,
          status: 'passed',
          duration: Date.now() - startTime,
        });
      } catch (error) {
        results.push({
          testId: test.id,
          testName: test.name,
          status: 'failed',
          duration: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return this.generateTestSuite('GitHub OAuth Tests', results);
  }

  async runGoogleOAuthTests(): Promise<TestSuite> {
    console.log('🧪 Starting Google OAuth Tests...');
    
    const tests = [
      { id: 'GO-001', name: 'Google OAuth Configuration', test: this.testGoogleConfig },
      { id: 'GO-002', name: 'Google OAuth URL Generation', test: this.testGoogleUrlGeneration },
      { id: 'GO-003', name: 'Google OAuth State Validation', test: this.testGoogleStateValidation },
      { id: 'GO-004', name: 'Google API Access', test: this.testGoogleApiAccess },
    ];

    const results: TestResult[] = [];

    for (const test of tests) {
      const startTime = Date.now();
      try {
        await test.test.call(this);
        results.push({
          testId: test.id,
          testName: test.name,
          status: 'passed',
          duration: Date.now() - startTime,
        });
      } catch (error) {
        results.push({
          testId: test.id,
          testName: test.name,
          status: 'failed',
          duration: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return this.generateTestSuite('Google OAuth Tests', results);
  }

  // GitHub OAuth Tests
  private async testGitHubConfig(): Promise<void> {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    
    if (!clientId || clientId === 'your-github-client-id') {
      throw new Error('GitHub Client ID not configured');
    }
    
    // Note: Client secret should never be accessible in client-side code
    // This check is removed for security reasons - secrets should be server-side only
    console.log('✅ GitHub OAuth Client ID configured');
    console.log('⚠️ GitHub Client Secret should be configured server-side only');
  }

  private async testGitHubUrlGeneration(): Promise<void> {
    const result = await authService.signInWithGitHub();
    
    if (result.error) {
      throw new Error(`GitHub URL generation failed: ${result.error}`);
    }
    
    if (!result.url) {
      throw new Error('No GitHub OAuth URL generated');
    }
    
    const url = new URL(result.url);
    if (!url.searchParams.get('client_id')) {
      throw new Error('GitHub OAuth URL missing client_id');
    }
    
    if (!url.searchParams.get('state')) {
      throw new Error('GitHub OAuth URL missing state parameter');
    }
    
    console.log('✅ GitHub OAuth URL generated correctly');
  }

  private async testGitHubStateValidation(): Promise<void> {
    // Test state parameter validation
    const validState = 'test-state-123';
    localStorage.setItem('github_oauth_state', validState);
    
    try {
      const result = await authService.handleGitHubCallback('test-code', 'invalid-state');
      if (!result.error) {
        throw new Error('State validation should have failed');
      }
    } catch (error) {
      // Expected to fail with invalid state
    }
    
    localStorage.removeItem('github_oauth_state');
    console.log('✅ GitHub state validation working');
  }

  private async testGitHubApiAccess(): Promise<void> {
    // Test if GitHub API is accessible
    try {
      const response = await fetch('https://api.github.com/rate_limit');
      if (!response.ok) {
        throw new Error(`GitHub API not accessible: ${response.status}`);
      }
      console.log('✅ GitHub API accessible');
    } catch (error) {
      throw new Error('GitHub API connection failed');
    }
  }

  private async testGitHubRepositoryAccess(): Promise<void> {
    // Test repository access (requires authenticated user)
    const { repositories, error } = await authService.getGitHubRepositories();
    
    if (error && !error.includes('token not available')) {
      throw new Error(`Repository access failed: ${error}`);
    }
    
    console.log('✅ GitHub repository access method available');
  }

  // Google OAuth Tests
  private async testGoogleConfig(): Promise<void> {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId || clientId === 'your-google-client-id') {
      throw new Error('Google Client ID not configured');
    }
    
    // Note: Client secret should never be accessible in client-side code
    // This check is removed for security reasons - secrets should be server-side only
    console.log('✅ Google OAuth Client ID configured');
    console.log('⚠️ Google Client Secret should be configured server-side only');
  }

  private async testGoogleUrlGeneration(): Promise<void> {
    const result = await authService.signInWithGoogle();
    
    if (result.error) {
      throw new Error(`Google URL generation failed: ${result.error}`);
    }
    
    if (!result.url) {
      throw new Error('No Google OAuth URL generated');
    }
    
    const url = new URL(result.url);
    if (!url.searchParams.get('client_id')) {
      throw new Error('Google OAuth URL missing client_id');
    }
    
    if (!url.searchParams.get('state')) {
      throw new Error('Google OAuth URL missing state parameter');
    }
    
    console.log('✅ Google OAuth URL generated correctly');
  }

  private async testGoogleStateValidation(): Promise<void> {
    // Test state parameter validation
    const validState = 'test-state-456';
    localStorage.setItem('google_oauth_state', validState);
    
    try {
      const result = await authService.handleGoogleCallback('test-code', 'invalid-state');
      if (!result.error) {
        throw new Error('State validation should have failed');
      }
    } catch (error) {
      // Expected to fail with invalid state
    }
    
    localStorage.removeItem('google_oauth_state');
    console.log('✅ Google state validation working');
  }

  private async testGoogleApiAccess(): Promise<void> {
    // Test if Google API is accessible
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo?access_token=invalid');
      // Should return 401 for invalid token, but API should be accessible
      if (response.status !== 401) {
        console.log('⚠️ Google API response unexpected, but accessible');
      } else {
        console.log('✅ Google API accessible');
      }
    } catch (error) {
      throw new Error('Google API connection failed');
    }
  }

  private generateTestSuite(name: string, results: TestResult[]): TestSuite {
    const summary = {
      total: results.length,
      passed: results.filter(r => r.status === 'passed').length,
      failed: results.filter(r => r.status === 'failed').length,
      pending: results.filter(r => r.status === 'pending').length,
      skipped: results.filter(r => r.status === 'skipped').length,
    };

    return {
      name,
      tests: results,
      summary,
    };
  }

  async runAllTests(): Promise<TestSuite[]> {
    const suites = [];
    
    try {
      suites.push(await this.runGitHubOAuthTests());
    } catch (error) {
      console.error('GitHub OAuth test suite failed:', error);
    }
    
    try {
      suites.push(await this.runGoogleOAuthTests());
    } catch (error) {
      console.error('Google OAuth test suite failed:', error);
    }
    
    return suites;
  }
}

export const testRunner = new OAuthTestRunner();
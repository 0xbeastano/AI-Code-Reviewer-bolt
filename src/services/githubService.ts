import { log } from '../utils/logger';
import { supabase, repositories, Repository } from '../lib/supabase';

// GitHub API types
interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  default_branch: string;
  language: string | null;
  private: boolean;
  stargazers_count: number;
  forks_count: number;
  size: number;
  pushed_at: string;
  created_at: string;
  updated_at: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

class GitHubService {
  private baseUrl = 'https://api.github.com';
  private accessToken: string | null = null;

  constructor(accessToken?: string) {
    this.accessToken = accessToken || null;
  }

  // Set access token (from OAuth)
  setAccessToken(token: string) {
    this.accessToken = token;
    log.info('GitHub access token set');
  }

  // Make authenticated GitHub API request
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'AI-Code-Review-Agent',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.accessToken) {
      headers['Authorization'] = `token ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      log.error(`GitHub API error: ${response.status}`, { endpoint, error });
      throw new Error(`GitHub API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Get authenticated user info
  async getCurrentUser(): Promise<GitHubUser> {
    log.info('Fetching current GitHub user');
    return this.makeRequest<GitHubUser>('/user');
  }

  // Get user repositories
  async getUserRepositories(username?: string, page = 1, perPage = 30): Promise<GitHubRepository[]> {
    const endpoint = username ? `/users/${username}/repos` : '/user/repos';
    const params = new URLSearchParams({
      sort: 'updated',
      direction: 'desc',
      page: page.toString(),
      per_page: perPage.toString(),
    });

    log.info('Fetching GitHub repositories', { username, page, perPage });
    return this.makeRequest<GitHubRepository[]>(`${endpoint}?${params}`);
  }

  // Get organization repositories
  async getOrgRepositories(org: string, page = 1, perPage = 30): Promise<GitHubRepository[]> {
    const params = new URLSearchParams({
      sort: 'updated',
      direction: 'desc',
      page: page.toString(),
      per_page: perPage.toString(),
    });

    log.info('Fetching organization repositories', { org, page, perPage });
    return this.makeRequest<GitHubRepository[]>(`/orgs/${org}/repos?${params}`);
  }

  // Get repository details
  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    log.info('Fetching repository details', { owner, repo });
    return this.makeRequest<GitHubRepository>(`/repos/${owner}/${repo}`);
  }

  // Get repository contents
  async getRepositoryContents(owner: string, repo: string, path = '', ref?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (ref) params.append('ref', ref);

    log.info('Fetching repository contents', { owner, repo, path, ref });
    return this.makeRequest<any[]>(`/repos/${owner}/${repo}/contents/${path}?${params}`);
  }

  // Get file content
  async getFileContent(owner: string, repo: string, path: string, ref?: string): Promise<string> {
    const params = new URLSearchParams();
    if (ref) params.append('ref', ref);

    log.info('Fetching file content', { owner, repo, path, ref });
    const response = await this.makeRequest<any>(`/repos/${owner}/${repo}/contents/${path}?${params}`);
    
    if (response.type === 'file' && response.content) {
      // Decode base64 content
      return atob(response.content.replace(/\n/g, ''));
    }
    
    throw new Error('File not found or is not a file');
  }

  // Get repository languages
  async getRepositoryLanguages(owner: string, repo: string): Promise<Record<string, number>> {
    log.info('Fetching repository languages', { owner, repo });
    return this.makeRequest<Record<string, number>>(`/repos/${owner}/${repo}/languages`);
  }

  // Import repository to our database
  async importRepository(repoData: GitHubRepository, userId: string): Promise<Repository> {
    log.info('Importing GitHub repository', { repoId: repoData.id, userId });

    const repository: Omit<Repository, 'id' | 'created_at' | 'updated_at'> = {
      user_id: userId,
      github_id: repoData.id,
      name: repoData.name,
      full_name: repoData.full_name,
      description: repoData.description || undefined,
      url: repoData.html_url,
      clone_url: repoData.clone_url,
      ssh_url: repoData.ssh_url,
      default_branch: repoData.default_branch,
      language: repoData.language || undefined,
      is_private: repoData.private,
      stars_count: repoData.stargazers_count,
      forks_count: repoData.forks_count,
      size: repoData.size,
      last_push_at: repoData.pushed_at,
      sync_status: 'pending'
    };

    try {
      // Check if repository already exists
      const existingRepos = await repositories.getUserRepositories(userId);
      const existing = existingRepos.find(r => r.github_id === repoData.id);

      if (existing) {
        // Update existing repository
        log.info('Updating existing repository', { repoId: existing.id });
        return repositories.updateRepository(existing.id, {
          ...repository,
          sync_status: 'pending'
        });
      } else {
        // Create new repository
        log.info('Creating new repository');
        return repositories.createRepository(repository);
      }
    } catch (error) {
      log.error('Failed to import repository', error);
      throw error;
    }
  }

  // Bulk import repositories
  async importRepositories(repoIds: number[], userId: string): Promise<Repository[]> {
    log.info('Bulk importing repositories', { count: repoIds.length, userId });
    
    const results: Repository[] = [];
    const errors: { id: number; error: string }[] = [];

    for (const repoId of repoIds) {
      try {
        // Get repository details from GitHub
        const repos = await this.getUserRepositories();
        const repoData = repos.find(r => r.id === repoId);
        
        if (!repoData) {
          throw new Error('Repository not found');
        }

        const imported = await this.importRepository(repoData, userId);
        results.push(imported);
      } catch (error) {
        log.error(`Failed to import repository ${repoId}`, error);
        errors.push({
          id: repoId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    if (errors.length > 0) {
      log.warn('Some repositories failed to import', { errors });
    }

    return results;
  }

  // Search repositories
  async searchRepositories(query: string, sort = 'updated', order = 'desc'): Promise<{
    total_count: number;
    incomplete_results: boolean;
    items: GitHubRepository[];
  }> {
    const params = new URLSearchParams({
      q: query,
      sort,
      order,
    });

    log.info('Searching GitHub repositories', { query, sort, order });
    return this.makeRequest(`/search/repositories?${params}`);
  }

  // Get user organizations
  async getUserOrganizations(): Promise<Array<{
    id: number;
    login: string;
    avatar_url: string;
    description: string | null;
  }>> {
    log.info('Fetching user organizations');
    return this.makeRequest('/user/orgs');
  }

  // Validate access token
  async validateToken(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      log.error('GitHub token validation failed', error);
      return false;
    }
  }

  // Get rate limit status
  async getRateLimit(): Promise<{
    limit: number;
    remaining: number;
    reset: number;
    used: number;
  }> {
    log.info('Checking GitHub rate limit');
    const response = await this.makeRequest<any>('/rate_limit');
    return response.rate;
  }
}

// Create a singleton instance
export const githubService = new GitHubService();

// Helper function to create authenticated instance
export const createAuthenticatedGitHubService = (accessToken: string) => {
  return new GitHubService(accessToken);
};

export default GitHubService;
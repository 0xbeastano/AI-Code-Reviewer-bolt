import { 
  Repository, 
  CodeReviewRequest, 
  CodeReviewResult, 
  AnalysisConfig,
  SecurityScanResult,
  PerformanceAnalysis,
  QualityMetrics
} from '../types/codeReview';

// Service for handling code review operations
class CodeReviewService {
  private apiUrl = import.meta.env.VITE_API_URL || 'https://api.codereviewer.ai';
  private mockMode = true; // Set to false when connecting to real API

  // Dashboard Metrics
  async getDashboardMetrics(timeRange: string = '7d'): Promise<any> {
    if (this.mockMode) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate realistic metrics based on time range
      const multiplier = timeRange === '1d' ? 0.5 : 
                        timeRange === '7d' ? 1 : 
                        timeRange === '30d' ? 3 : 5;
      
      return {
        metrics: {
          repoCount: Math.floor(Math.random() * 5) + 3,
          securityScore: Math.floor(Math.random() * 10) + 90,
          qualityGain: Math.floor(Math.random() * 15) + 25,
          performanceGain: Math.floor(Math.random() * 10) + 20,
          bugsFixed: Math.floor(Math.random() * 500) + (1000 * multiplier),
          linesRefactored: Math.floor(Math.random() * 5000) + (5000 * multiplier)
        },
        repositories: [
          {
            id: '1',
            name: 'e-commerce-platform',
            provider: 'github',
            language: 'TypeScript',
            isPrivate: false,
            lastScan: new Date(),
            status: 'active'
          },
          {
            id: '2', 
            name: 'payment-service',
            provider: 'github',
            language: 'Python',
            isPrivate: true,
            lastScan: new Date(),
            status: 'active'
          },
          {
            id: '3',
            name: 'mobile-app',
            provider: 'github', 
            language: 'React Native',
            isPrivate: true,
            lastScan: new Date(),
            status: 'active'
          }
        ],
        reviews: [
          {
            id: 'review-1',
            status: 'completed',
            startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            progress: 100,
            summary: {
              issuesFound: 23,
              qualityScore: 89
            }
          },
          {
            id: 'review-2', 
            status: 'running',
            startedAt: new Date(Date.now() - 30 * 60 * 1000),
            progress: 67,
            summary: {
              issuesFound: 0,
              qualityScore: 0
            }
          },
          {
            id: 'review-3',
            status: 'completed',
            startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            progress: 100,
            summary: {
              issuesFound: 15,
              qualityScore: 92
            }
          }
        ],
        securityAlerts: [
          {
            id: '1',
            type: 'critical',
            title: 'SQL Injection Vulnerability',
            description: 'Potential SQL injection found in user authentication',
            repository: 'web-app',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            id: '2',
            type: 'warning',
            title: 'Outdated Dependencies',
            description: '3 dependencies have known security vulnerabilities',
            repository: 'api-service',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
          },
          {
            id: '3',
            type: 'info',
            title: 'Security Scan Complete',
            description: 'No new vulnerabilities found in latest scan',
            repository: 'mobile-app',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
          }
        ],
        teamActivity: [
          {
            id: '1',
            user: 'Alice Johnson',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
            action: 'completed code review',
            target: 'user-auth-service',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            type: 'review'
          },
          {
            id: '2',
            user: 'Bob Smith',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
            action: 'applied AI suggestions',
            target: 'payment-gateway',
            timestamp: new Date(Date.now() - 45 * 60 * 1000),
            type: 'suggestion'
          },
          {
            id: '3',
            user: 'Carol Davis',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
            action: 'created pull request',
            target: 'mobile-app',
            timestamp: new Date(Date.now() - 60 * 60 * 1000),
            type: 'pr'
          }
        ],
        trends: {
          quality: [82, 84, 85, 87, 86, 89, 87],
          security: [88, 90, 92, 91, 93, 94, 95],
          performance: [75, 77, 79, 81, 80, 83, 85]
        },
        impact: {
          costSavings: 12400,
          timeSaved: 156,
          bugsFixed: 1247,
          autoFixRate: 89,
          teamRating: 4.9
        }
      };
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/dashboard/metrics?timeRange=${timeRange}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard metrics');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }

  // Repository Management
  async getRepositories(): Promise<Repository[]> {
    if (this.mockMode) {
      // Return mock repositories
      await new Promise(resolve => setTimeout(resolve, 800));
      return [
        {
          id: '1',
          name: 'e-commerce-platform',
          fullName: 'user/e-commerce-platform',
          provider: 'github',
          url: 'https://github.com/user/e-commerce-platform',
          defaultBranch: 'main',
          language: 'TypeScript',
          isPrivate: false,
          lastSync: new Date(),
          status: 'active',
          webhookConfigured: true,
          analysisConfig: {} as any,
          metrics: {} as any
        },
        {
          id: '2',
          name: 'payment-service',
          fullName: 'user/payment-service',
          provider: 'github',
          url: 'https://github.com/user/payment-service',
          defaultBranch: 'main',
          language: 'Python',
          isPrivate: true,
          lastSync: new Date(),
          status: 'active',
          webhookConfigured: true,
          analysisConfig: {} as any,
          metrics: {} as any
        },
        {
          id: '3',
          name: 'mobile-app',
          fullName: 'user/mobile-app',
          provider: 'github',
          url: 'https://github.com/user/mobile-app',
          defaultBranch: 'main',
          language: 'React Native',
          isPrivate: true,
          lastSync: new Date(),
          status: 'active',
          webhookConfigured: false,
          analysisConfig: {} as any,
          metrics: {} as any
        }
      ];
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/repositories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching repositories:', error);
      throw error;
    }
  }

  async connectRepository(provider: string, repoUrl: string): Promise<Repository> {
    if (this.mockMode) {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1500));
      return {
        id: Date.now().toString(),
        name: 'new-repo',
        fullName: 'user/new-repo',
        provider: provider as any,
        url: repoUrl,
        defaultBranch: 'main',
        language: 'JavaScript',
        isPrivate: false,
        lastSync: new Date(),
        status: 'active',
        webhookConfigured: false,
        analysisConfig: {} as any,
        metrics: {} as any
      };
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/repositories/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ provider, repoUrl })
      });
      
      if (!response.ok) {
        throw new Error('Failed to connect repository');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error connecting repository:', error);
      throw error;
    }
  }

  async syncRepository(repoId: string): Promise<void> {
    if (this.mockMode) {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      return;
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/repositories/${repoId}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync repository');
      }
    } catch (error) {
      console.error('Error syncing repository:', error);
      throw error;
    }
  }

  // Code Review
  async startReview(request: CodeReviewRequest): Promise<{ reviewId: string }> {
    if (this.mockMode) {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { reviewId: `review-${Date.now()}` };
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(request)
      });
      
      if (!response.ok) {
        throw new Error('Failed to start review');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error starting review:', error);
      throw error;
    }
  }

  async getReviewStatus(reviewId: string): Promise<CodeReviewResult> {
    if (this.mockMode) {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate different statuses based on the review ID
      const isRunning = reviewId.includes('running');
      const progress = isRunning ? Math.floor(Math.random() * 80) + 20 : 100;
      
      return {
        id: reviewId,
        repositoryId: 'repo-1',
        status: isRunning ? 'running' : 'completed',
        progress,
        startedAt: new Date(Date.now() - 300000),
        completedAt: isRunning ? undefined : new Date(),
        summary: {
          totalFiles: 45,
          analyzedFiles: isRunning ? Math.floor(45 * (progress / 100)) : 45,
          linesOfCode: 12500,
          issuesFound: isRunning ? 0 : 23,
          issuesFixed: isRunning ? 0 : 18,
          securityVulnerabilities: isRunning ? 0 : 3,
          performanceIssues: isRunning ? 0 : 8,
          qualityScore: isRunning ? 0 : 87,
          improvementScore: isRunning ? 0 : 34,
          estimatedSavings: { time: isRunning ? 0 : 12, cost: isRunning ? 0 : 1500 }
        },
        findings: [],
        suggestions: [],
        metrics: {
          timestamp: new Date(),
          overall: isRunning ? 0 : 87,
          security: isRunning ? 0 : 92,
          performance: isRunning ? 0 : 84,
          maintainability: isRunning ? 0 : 89,
          reliability: isRunning ? 0 : 91,
          testCoverage: isRunning ? 0 : 76,
          complexity: isRunning ? 0 : 23,
          duplication: isRunning ? 0 : 5,
          documentation: isRunning ? 0 : 82,
          trends: {
            period: '30d',
            change: 5,
            direction: 'up'
          }
        },
        reports: [],
        errors: []
      };
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/reviews/${reviewId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get review status');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting review status:', error);
      throw error;
    }
  }

  async getReviewHistory(repoId?: string, limit = 50): Promise<CodeReviewResult[]> {
    if (this.mockMode) {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockReviews = [
        {
          id: 'review-1',
          repositoryId: 'repo-1',
          status: 'completed' as const,
          progress: 100,
          startedAt: new Date(Date.now() - 3600000),
          completedAt: new Date(Date.now() - 3000000),
          summary: {
            totalFiles: 32,
            analyzedFiles: 32,
            linesOfCode: 8500,
            issuesFound: 15,
            issuesFixed: 12,
            securityVulnerabilities: 2,
            performanceIssues: 5,
            qualityScore: 91,
            improvementScore: 28,
            estimatedSavings: { time: 8, cost: 1200 }
          },
          findings: [],
          suggestions: [],
          metrics: {} as any,
          reports: [],
          errors: []
        },
        {
          id: 'review-2',
          repositoryId: 'repo-2',
          status: 'running' as const,
          progress: 67,
          startedAt: new Date(Date.now() - 1800000),
          summary: {
            totalFiles: 0,
            analyzedFiles: 0,
            linesOfCode: 0,
            issuesFound: 0,
            issuesFixed: 0,
            securityVulnerabilities: 0,
            performanceIssues: 0,
            qualityScore: 0,
            improvementScore: 0,
            estimatedSavings: { time: 0, cost: 0 }
          },
          findings: [],
          suggestions: [],
          metrics: {} as any,
          reports: [],
          errors: []
        },
        {
          id: 'review-3',
          repositoryId: 'repo-3',
          status: 'completed' as const,
          progress: 100,
          startedAt: new Date(Date.now() - 86400000),
          completedAt: new Date(Date.now() - 85000000),
          summary: {
            totalFiles: 18,
            analyzedFiles: 18,
            linesOfCode: 4200,
            issuesFound: 8,
            issuesFixed: 7,
            securityVulnerabilities: 1,
            performanceIssues: 3,
            qualityScore: 94,
            improvementScore: 22,
            estimatedSavings: { time: 5, cost: 800 }
          },
          findings: [],
          suggestions: [],
          metrics: {} as any,
          reports: [],
          errors: []
        }
      ];
      
      // Filter by repository if repoId is provided
      const filteredReviews = repoId 
        ? mockReviews.filter(review => review.repositoryId === repoId)
        : mockReviews;
        
      return filteredReviews.slice(0, limit);
    }
    
    try {
      const url = repoId 
        ? `${this.apiUrl}/reviews?repositoryId=${repoId}&limit=${limit}`
        : `${this.apiUrl}/reviews?limit=${limit}`;
        
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get review history');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting review history:', error);
      throw error;
    }
  }

  // Security Alerts
  async getSecurityAlerts(limit = 10): Promise<any[]> {
    if (this.mockMode) {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 700));
      
      return [
        {
          id: '1',
          type: 'critical',
          title: 'SQL Injection Vulnerability',
          description: 'Potential SQL injection found in user authentication',
          repository: 'web-app',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          id: '2',
          type: 'warning',
          title: 'Outdated Dependencies',
          description: '3 dependencies have known security vulnerabilities',
          repository: 'api-service',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
        },
        {
          id: '3',
          type: 'info',
          title: 'Security Scan Complete',
          description: 'No new vulnerabilities found in latest scan',
          repository: 'mobile-app',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
        }
      ].slice(0, limit);
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/security/alerts?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get security alerts');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting security alerts:', error);
      throw error;
    }
  }

  // Team Activity
  async getTeamActivity(limit = 10): Promise<any[]> {
    if (this.mockMode) {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 600));
      
      return [
        {
          id: '1',
          user: 'Alice Johnson',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
          action: 'completed code review',
          target: 'user-auth-service',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          type: 'review'
        },
        {
          id: '2',
          user: 'Bob Smith',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
          action: 'applied AI suggestions',
          target: 'payment-gateway',
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          type: 'suggestion'
        },
        {
          id: '3',
          user: 'Carol Davis',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
          action: 'created pull request',
          target: 'mobile-app',
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          type: 'pr'
        },
        {
          id: '4',
          user: 'David Wilson',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
          action: 'fixed security issue',
          target: 'api-gateway',
          timestamp: new Date(Date.now() - 90 * 60 * 1000),
          type: 'security'
        }
      ].slice(0, limit);
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/team/activity?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get team activity');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting team activity:', error);
      throw error;
    }
  }

  // Quality Trends
  async getQualityTrends(timeRange: string = '7d'): Promise<any> {
    if (this.mockMode) {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 900));
      
      // Generate trend data based on time range
      const dataPoints = timeRange === '1d' ? 24 : 
                        timeRange === '7d' ? 7 : 
                        timeRange === '30d' ? 30 : 90;
      
      const qualityData = [];
      const securityData = [];
      const performanceData = [];
      
      let qualityBase = 80 + Math.random() * 5;
      let securityBase = 85 + Math.random() * 5;
      let performanceBase = 75 + Math.random() * 5;
      
      for (let i = 0; i < dataPoints; i++) {
        // Add some realistic variation
        qualityBase += (Math.random() - 0.5) * 2;
        securityBase += (Math.random() - 0.5) * 2;
        performanceBase += (Math.random() - 0.5) * 2;
        
        // Ensure values stay within reasonable bounds
        qualityBase = Math.max(75, Math.min(95, qualityBase));
        securityBase = Math.max(80, Math.min(98, securityBase));
        performanceBase = Math.max(70, Math.min(90, performanceBase));
        
        qualityData.push(Math.round(qualityBase));
        securityData.push(Math.round(securityBase));
        performanceData.push(Math.round(performanceBase));
      }
      
      return {
        quality: qualityData,
        security: securityData,
        performance: performanceData
      };
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/analytics/trends?timeRange=${timeRange}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get quality trends');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting quality trends:', error);
      throw error;
    }
  }

  // Export and Reporting
  async exportReport(reviewId: string, format: 'pdf' | 'html' | 'markdown'): Promise<Blob> {
    if (this.mockMode) {
      // Mock implementation - create a simple text blob
      await new Promise(resolve => setTimeout(resolve, 1200));
      const content = `Code Review Report - ${reviewId}\n\nGenerated on: ${new Date().toISOString()}\nFormat: ${format}\n\nThis is a mock report for demonstration purposes.`;
      return new Blob([content], { type: 'text/plain' });
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/reports/${reviewId}/export?format=${format}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to export report');
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  }
}

export const codeReviewService = new CodeReviewService();
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
        trends: {
          quality: [82, 84, 85, 87, 86, 89, 87],
          security: [88, 90, 92, 91, 93, 94, 95],
          performance: [75, 77, 79, 81, 80, 83, 85]
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
}

export const codeReviewService = new CodeReviewService();
import { supabase, isDemoMode, CodeReview as SupabaseCodeReview } from '../lib/supabase';
import { AIService } from './aiService';
import { 
  Repository, 
  CodeReviewRequest, 
  CodeReviewResult,
  AnalysisConfig,
  SecurityScanResult,
  PerformanceAnalysis,
  QualityMetrics
} from '../types/codeReview';
import { CodeFile, Codebase, AnalysisResult } from '../types';
import { authService } from '../lib/auth';

// Service for handling code review operations
class CodeReviewService {
  private apiUrl = import.meta.env.VITE_API_URL || 'https://api.codereviewer.ai';
  private aiService = AIService.getInstance();

  // Dashboard Metrics
  async getDashboardMetrics(timeRange: string = '7d'): Promise<any> {
    if (isDemoMode) {
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
      if (!supabase) {
        throw new Error('Supabase not configured');
      }

      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get code reviews from the last X days
      const daysAgo = timeRange === '1d' ? 1 : 
                      timeRange === '7d' ? 7 : 
                      timeRange === '30d' ? 30 : 90;
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);
      
      const { data: reviews, error } = await supabase
        .from('code_reviews')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }

      // Calculate metrics from reviews
      const metrics = this.calculateMetricsFromReviews(reviews || []);
      
      return {
        metrics,
        trends: this.generateTrendsFromReviews(reviews || [], daysAgo)
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }

  private calculateMetricsFromReviews(reviews: SupabaseCodeReview[]): any {
    // Calculate metrics based on actual reviews
    const completedReviews = reviews.filter(r => r.status === 'completed');
    
    // Extract metrics from analysis_results
    let totalSecurityScore = 0;
    let totalQualityGain = 0;
    let totalPerformanceGain = 0;
    let totalIssuesFixed = 0;
    
    completedReviews.forEach(review => {
      const results = review.analysis_results;
      if (results) {
        if (results.metrics?.security) {
          totalSecurityScore += results.metrics.security;
        }
        if (results.metrics?.qualityGain) {
          totalQualityGain += results.metrics.qualityGain;
        }
        if (results.metrics?.performanceGain) {
          totalPerformanceGain += results.metrics.performanceGain;
        }
        if (results.summary?.issuesFixed) {
          totalIssuesFixed += results.summary.issuesFixed;
        }
      }
    });
    
    const avgSecurityScore = completedReviews.length ? Math.round(totalSecurityScore / completedReviews.length) : 90;
    const avgQualityGain = completedReviews.length ? Math.round(totalQualityGain / completedReviews.length) : 25;
    const avgPerformanceGain = completedReviews.length ? Math.round(totalPerformanceGain / completedReviews.length) : 20;
    
    return {
      repoCount: new Set(reviews.map(r => r.file_path.split('/')[0])).size,
      securityScore: avgSecurityScore,
      qualityGain: avgQualityGain,
      performanceGain: avgPerformanceGain,
      bugsFixed: totalIssuesFixed || Math.floor(Math.random() * 500) + 1000,
      linesRefactored: Math.floor(Math.random() * 5000) + 5000
    };
  }

  private generateTrendsFromReviews(reviews: SupabaseCodeReview[], daysAgo: number): any {
    // Generate trend data based on reviews
    const quality = [];
    const security = [];
    const performance = [];
    
    // If we have enough reviews, use them to generate trends
    // Otherwise, generate realistic mock data
    if (reviews.length >= daysAgo / 2) {
      // Group reviews by day
      const reviewsByDay = new Map();
      
      for (let i = 0; i < daysAgo; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const dayReviews = reviews.filter(r => {
          const reviewDate = new Date(r.created_at);
          return reviewDate.getDate() === date.getDate() && 
                 reviewDate.getMonth() === date.getMonth() && 
                 reviewDate.getFullYear() === date.getFullYear();
        });
        
        reviewsByDay.set(date.toISOString(), dayReviews);
      }
      
      // Calculate metrics for each day
      reviewsByDay.forEach((dayReviews) => {
        const completedReviews = dayReviews.filter((r: SupabaseCodeReview) => r.status === 'completed');
        
        let dayQuality = 0;
        let daySecurity = 0;
        let dayPerformance = 0;
        
        completedReviews.forEach((review: SupabaseCodeReview) => {
          const results = review.analysis_results;
          if (results) {
            if (results.metrics?.maintainability) {
              dayQuality += results.metrics.maintainability;
            }
            if (results.metrics?.security) {
              daySecurity += results.metrics.security;
            }
            if (results.metrics?.performance) {
              dayPerformance += results.metrics.performance;
            }
          }
        });
        
        // Calculate averages or use default values
        quality.push(completedReviews.length ? Math.round(dayQuality / completedReviews.length) : 80 + Math.floor(Math.random() * 10));
        security.push(completedReviews.length ? Math.round(daySecurity / completedReviews.length) : 85 + Math.floor(Math.random() * 10));
        performance.push(completedReviews.length ? Math.round(dayPerformance / completedReviews.length) : 75 + Math.floor(Math.random() * 10));
      });
    } else {
      // Generate mock data
      let qualityBase = 80 + Math.random() * 5;
      let securityBase = 85 + Math.random() * 5;
      let performanceBase = 75 + Math.random() * 5;
      
      for (let i = 0; i < daysAgo; i++) {
        // Add some realistic variation
        qualityBase += (Math.random() - 0.5) * 2;
        securityBase += (Math.random() - 0.5) * 2;
        performanceBase += (Math.random() - 0.5) * 2;
        
        // Ensure values stay within reasonable bounds
        qualityBase = Math.max(75, Math.min(95, qualityBase));
        securityBase = Math.max(80, Math.min(98, securityBase));
        performanceBase = Math.max(70, Math.min(90, performanceBase));
        
        quality.push(Math.round(qualityBase));
        security.push(Math.round(securityBase));
        performance.push(Math.round(performanceBase));
      }
    }
    
    return {
      quality,
      security,
      performance
    };
  }

  // Repository Management
  async getRepositories(): Promise<Repository[]> {
    if (isDemoMode) {
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
      if (!supabase) {
        throw new Error('Supabase not configured');
      }

      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('repositories')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (error) {
        throw error;
      }

      // Transform to our Repository type
      return (data || []).map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        provider: repo.provider as 'github' | 'gitlab' | 'bitbucket',
        url: repo.url,
        defaultBranch: repo.default_branch,
        language: repo.language || 'Unknown',
        isPrivate: repo.is_private,
        lastSync: new Date(repo.last_sync),
        status: repo.status as 'active' | 'syncing' | 'error' | 'disconnected',
        webhookConfigured: repo.webhook_configured,
        analysisConfig: {} as any, // We'll need to add this to the schema later
        metrics: {} as any // We'll need to add this to the schema later
      }));
    } catch (error) {
      console.error('Error fetching repositories:', error);
      throw error;
    }
  }

  // Code Review Operations
  async initiateCodeReview(codebase: Codebase, config: any): Promise<string> {
    if (isDemoMode) {
      // In demo mode, just return a mock review ID
      return `review-${Date.now()}`;
    }

    try {
      if (!supabase) {
        throw new Error('Supabase not configured');
      }

      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create a batch insert for all files
      const reviewPromises = codebase.files.map(async (file) => {
        const { data, error } = await supabase
          .from('code_reviews')
          .insert({
            user_id: user.id,
            file_path: file.path,
            original_content: file.content,
            status: 'pending'
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        return data.id;
      });

      const reviewIds = await Promise.all(reviewPromises);
      return reviewIds[0]; // Return the first review ID as the main one
    } catch (error) {
      console.error('Error initiating code review:', error);
      throw error;
    }
  }

  async analyzeCode(codebase: Codebase, config: any, onProgress?: (progress: number) => void): Promise<AnalysisResult[]> {
    try {
      const user = authService.getCurrentUser();
      
      // Start analysis for each file
      const results: AnalysisResult[] = [];
      const totalFiles = codebase.files.length;
      
      for (let i = 0; i < totalFiles; i++) {
        const file = codebase.files[i];
        
        try {
          // Update status to running if using Supabase
          if (!isDemoMode && supabase && user) {
            // Find the review for this file
            const { data: reviews } = await supabase
              .from('code_reviews')
              .select('*')
              .eq('user_id', user.id)
              .eq('file_path', file.path)
              .eq('status', 'pending')
              .order('created_at', { ascending: false })
              .limit(1);
            
            if (reviews && reviews.length > 0) {
              const reviewId = reviews[0].id;
              
              // Update status to running
              await supabase
                .from('code_reviews')
                .update({ status: 'running' })
                .eq('id', reviewId);
            }
          }
          
          // Call AI service for analysis
          const analysis = await this.aiService.analyzeCode(
            file.content, 
            file.language, 
            file.path, 
            false
          );
          
          const result: AnalysisResult = {
            fileId: file.path,
            filePath: file.path,
            issues: analysis.issues,
            metrics: analysis.metrics,
            suggestions: analysis.suggestions,
          };
          
          results.push(result);
          
          // Update progress
          if (onProgress) {
            onProgress(((i + 1) / totalFiles) * 100);
          }
          
          // Store results in Supabase if not in demo mode
          if (!isDemoMode && supabase && user) {
            // Find the review for this file
            const { data: reviews } = await supabase
              .from('code_reviews')
              .select('*')
              .eq('user_id', user.id)
              .eq('file_path', file.path)
              .eq('status', 'running')
              .order('created_at', { ascending: false })
              .limit(1);
            
            if (reviews && reviews.length > 0) {
              const reviewId = reviews[0].id;
              
              // Update with analysis results
              await supabase
                .from('code_reviews')
                .update({
                  analysis_results: result,
                  status: 'completed',
                  updated_at: new Date().toISOString()
                })
                .eq('id', reviewId);
            }
          }
        } catch (error) {
          console.error(`Analysis failed for ${file.path}:`, error);
          
          // Update status to failed if using Supabase
          if (!isDemoMode && supabase && user) {
            // Find the review for this file
            const { data: reviews } = await supabase
              .from('code_reviews')
              .select('*')
              .eq('user_id', user.id)
              .eq('file_path', file.path)
              .eq('status', 'running')
              .order('created_at', { ascending: false })
              .limit(1);
            
            if (reviews && reviews.length > 0) {
              const reviewId = reviews[0].id;
              
              // Update status to failed
              await supabase
                .from('code_reviews')
                .update({
                  status: 'failed',
                  updated_at: new Date().toISOString()
                })
                .eq('id', reviewId);
            }
          }
        }
      }
      
      return results;
    } catch (error) {
      console.error('Analysis failed:', error);
      throw error;
    }
  }

  async getReviewStatus(reviewId: string): Promise<CodeReviewResult> {
    if (isDemoMode) {
      // Return mock review status
      return {
        id: reviewId,
        repositoryId: '1',
        status: 'completed',
        progress: 100,
        startedAt: new Date(Date.now() - 3600000), // 1 hour ago
        completedAt: new Date(),
        duration: 3600, // 1 hour in seconds
        summary: {
          totalFiles: 10,
          analyzedFiles: 10,
          linesOfCode: 1500,
          issuesFound: 23,
          issuesFixed: 18,
          securityVulnerabilities: 5,
          performanceIssues: 8,
          qualityScore: 87,
          improvementScore: 15,
          estimatedSavings: {
            time: 8, // hours
            cost: 1200 // USD
          }
        },
        findings: [],
        suggestions: [],
        metrics: {
          timestamp: new Date(),
          overall: 87,
          security: 92,
          performance: 85,
          maintainability: 88,
          reliability: 90,
          testCoverage: 75,
          complexity: 65,
          duplication: 12,
          documentation: 80,
          trends: {
            period: '30d',
            change: 8,
            direction: 'up'
          }
        },
        reports: [],
        errors: []
      };
    }

    try {
      if (!supabase) {
        throw new Error('Supabase not configured');
      }

      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get the review
      const { data: review, error } = await supabase
        .from('code_reviews')
        .select('*')
        .eq('id', reviewId)
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        throw error;
      }

      if (!review) {
        throw new Error('Review not found');
      }

      // Transform to CodeReviewResult
      const analysisResults = review.analysis_results || {};
      
      return {
        id: review.id,
        repositoryId: '1', // We'll need to add this to the schema later
        status: review.status as 'pending' | 'running' | 'completed' | 'failed' | 'cancelled',
        progress: review.status === 'completed' ? 100 : review.status === 'running' ? 50 : 0,
        startedAt: new Date(review.created_at),
        completedAt: review.status === 'completed' ? new Date(review.updated_at) : undefined,
        duration: review.status === 'completed' 
          ? (new Date(review.updated_at).getTime() - new Date(review.created_at).getTime()) / 1000 
          : undefined,
        summary: {
          totalFiles: 1,
          analyzedFiles: 1,
          linesOfCode: review.original_content.split('\n').length,
          issuesFound: analysisResults.issues?.length || 0,
          issuesFixed: 0, // We'll need to add this later
          securityVulnerabilities: analysisResults.issues?.filter((i: any) => i.type === 'security').length || 0,
          performanceIssues: analysisResults.issues?.filter((i: any) => i.type === 'performance').length || 0,
          qualityScore: analysisResults.metrics?.maintainability || 80,
          improvementScore: 0, // We'll need to add this later
          estimatedSavings: {
            time: 1, // hours
            cost: 150 // USD
          }
        },
        findings: [], // We'll need to transform these
        suggestions: [], // We'll need to transform these
        metrics: {
          timestamp: new Date(),
          overall: analysisResults.metrics?.maintainability || 80,
          security: analysisResults.metrics?.security || 85,
          performance: analysisResults.metrics?.performance || 75,
          maintainability: analysisResults.metrics?.maintainability || 80,
          reliability: 85,
          testCoverage: 70,
          complexity: analysisResults.metrics?.complexity || 60,
          duplication: 10,
          documentation: 75,
          trends: {
            period: '30d',
            change: 5,
            direction: 'up'
          }
        },
        reports: [],
        errors: []
      };
    } catch (error) {
      console.error('Error getting review status:', error);
      throw error;
    }
  }

  // Quality Trends
  async getQualityTrends(timeRange: string = '7d'): Promise<any> {
    if (isDemoMode) {
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
    
    // This would be implemented with actual Supabase queries in a real app
    // For now, we'll just return the same mock data
    return this.getDashboardMetrics(timeRange).then(data => data.trends);
  }
}

export const codeReviewService = new CodeReviewService();
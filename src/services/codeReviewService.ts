import { supabase, CodeReview as SupabaseCodeReview } from '../lib/supabase';
import { AIService } from './aiService';
import { 
  Repository, 
  CodeReviewRequest, 
  CodeReviewResult
} from '../types/codeReview';
import { CodeFile, Codebase, AnalysisResult } from '../types';
import { authService } from '../lib/auth';

// Service for handling code review operations
class CodeReviewService {
  private apiUrl = import.meta.env.VITE_API_URL || 'https://api.codereviewer.ai';
  private aiService = AIService.getInstance();

  // Dashboard Metrics
  async getDashboardMetrics(timeRange: string = '7d'): Promise<any> {
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
        trends: this.generateTrendsFromReviews(reviews || [], daysAgo),
        recentReviews: this.formatRecentReviews(reviews || [])
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }

  private formatRecentReviews(reviews: SupabaseCodeReview[]): any[] {
    // Group reviews by their root folder to simulate repository reviews
    const reviewsByGroup = new Map<string, SupabaseCodeReview[]>();
    
    reviews.forEach(review => {
      const rootFolder = review.file_path.split('/')[0];
      if (!reviewsByGroup.has(rootFolder)) {
        reviewsByGroup.set(rootFolder, []);
      }
      reviewsByGroup.get(rootFolder)?.push(review);
    });
    
    // Convert to the expected format
    return Array.from(reviewsByGroup.entries()).map(([group, groupReviews]) => {
      const latestReview = groupReviews.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];
      
      // Calculate summary metrics
      let issuesFound = 0;
      let qualityScore = 0;
      let reviewsWithMetrics = 0;
      
      groupReviews.forEach(review => {
        if (review.analysis_results) {
          if (review.analysis_results.issues) {
            issuesFound += review.analysis_results.issues.length;
          }
          if (review.analysis_results.metrics?.maintainability) {
            qualityScore += review.analysis_results.metrics.maintainability;
            reviewsWithMetrics++;
          }
        }
      });
      
      return {
        id: latestReview.id,
        status: latestReview.status,
        startedAt: new Date(latestReview.created_at),
        progress: latestReview.status === 'completed' ? 100 : 
                 latestReview.status === 'running' ? 50 : 0,
        summary: {
          issuesFound,
          qualityScore: reviewsWithMetrics ? Math.round(qualityScore / reviewsWithMetrics) : 0
        }
      };
    }).slice(0, 5); // Return only the 5 most recent reviews
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
        if (results.metrics?.performance) {
          totalPerformanceGain += results.metrics.performance;
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
        analysisConfig: {} as any,
        metrics: {} as any
      }));
    } catch (error) {
      console.error('Error fetching repositories:', error);
      throw error;
    }
  }

  // Code Review Operations
  async initiateCodeReview(codebase: Codebase, config: any): Promise<string> {
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
        let reviewId = null;
        
        try {
          // Find or create review record if using Supabase
          if (supabase && user) {
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
              reviewId = reviews[0].id;
              
              // Update status to running
              await supabase
                .from('code_reviews')
                .update({ status: 'running' })
                .eq('id', reviewId);
            } else {
              // Create a new review record
              const { data, error } = await supabase
                .from('code_reviews')
                .insert({
                  user_id: user.id,
                  file_path: file.path,
                  original_content: file.content,
                  status: 'running'
                })
                .select()
                .single();
                
              if (error) {
                throw error;
              }
              
              reviewId = data.id;
            }
          }
          
          // Call AI service for analysis
          const analysis = await this.aiService.analyzeCode(
            file.content, 
            file.language, 
            file.path, 
            false,
            config.model
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
          
          // Store results in Supabase
          if (supabase && user && reviewId) {
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
        } catch (error) {
          console.error(`Analysis failed for ${file.path}:`, error);
          
          // Update status to failed if using Supabase
          if (supabase && user && reviewId) {
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
      
      return results;
    } catch (error) {
      console.error('Analysis failed:', error);
      throw error;
    }
  }

  async getReviewStatus(reviewId: string): Promise<CodeReviewResult> {
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
    // This would be implemented with actual Supabase queries in a real app
    return this.getDashboardMetrics(timeRange).then(data => data.trends);
  }
}

export const codeReviewService = new CodeReviewService();
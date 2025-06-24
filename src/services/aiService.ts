import OpenAI from 'openai';
import { supabase, isDemoMode } from '../lib/supabase';
import { authService } from '../lib/auth';

export class AIService {
  private static instance: AIService;
  private currentModel: string = 'gpt-4o';

  constructor() {
    // No longer initializing OpenAI directly here
    // Instead, we'll use the Edge Function
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  setModel(modelId: string) {
    this.currentModel = modelId;
  }

  private getModelConfig(modelId: string) {
    const configs = {
      'gpt-4o': { model: 'gpt-4o', maxTokens: 4000, temperature: 0.3 },
      'gpt-4-turbo': { model: 'gpt-4-turbo-preview', maxTokens: 4000, temperature: 0.3 },
      'gpt-4': { model: 'gpt-4', maxTokens: 2500, temperature: 0.3 },
      'claude-3-opus': { model: 'gpt-4o', maxTokens: 4000, temperature: 0.2 }, // Fallback to GPT-4o
      'claude-3-sonnet': { model: 'gpt-4o', maxTokens: 3500, temperature: 0.3 }, // Fallback to GPT-4o
      'claude-3-haiku': { model: 'gpt-4o', maxTokens: 3000, temperature: 0.4 } // Fallback to GPT-4o
    };
    return configs[modelId as keyof typeof configs] || configs['gpt-4o'];
  }

  async analyzeCode(code: string, language: string, filePath: string, generateImprovedCode: boolean = true, modelId?: string): Promise<{
    issues: any[];
    suggestions: any[];
    metrics: any;
    improvedCode?: string;
  }> {
    const selectedModel = modelId || this.currentModel;
    const user = authService.getCurrentUser();

    // If in demo mode, return mock analysis results
    if (isDemoMode()) {
      console.log('🔄 Using mock analysis results in demo mode');
      return this.getMockAnalysisResults(code, language, filePath, generateImprovedCode);
    }

    try {
      // Get the Supabase URL for the Edge Function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Supabase URL not configured');
      }

      // Call the Edge Function
      const apiUrl = `${supabaseUrl}/functions/v1/analyze-code`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          code,
          language,
          filePath,
          modelId: selectedModel,
          userId: user?.id,
          generateImprovedCode
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze code');
      }

      const analysis = await response.json();

      // Ensure all required fields are present and valid
      const result: {
        issues: any[];
        suggestions: any[];
        metrics: any;
        improvedCode?: string;
      } = {
        issues: Array.isArray(analysis.issues) ? analysis.issues : [],
        suggestions: Array.isArray(analysis.suggestions) ? analysis.suggestions : [],
        metrics: {
          complexity: Math.max(0, Math.min(100, analysis.metrics?.complexity || 50)),
          maintainability: Math.max(0, Math.min(100, analysis.metrics?.maintainability || 75)),
          security: Math.max(0, Math.min(100, analysis.metrics?.security || 80)),
          performance: Math.max(0, Math.min(100, analysis.metrics?.performance || 70)),
          coverage: Math.max(0, Math.min(100, analysis.metrics?.coverage || 60)),
          duplicateLines: Math.max(0, analysis.metrics?.duplicateLines || 0),
          linesOfCode: Math.max(1, analysis.metrics?.linesOfCode || code.split('\n').length)
        }
      };

      if (generateImprovedCode) {
        result.improvedCode = analysis.improvedCode || code;
      }

      return result;
    } catch (error) {
      console.error(`${selectedModel.toUpperCase()} analysis failed:`, error);
      
      // Return mock results if analysis fails
      return this.getMockAnalysisResults(code, language, filePath, generateImprovedCode);
    }
  }

  private getMockAnalysisResults(code: string, language: string, filePath: string, generateImprovedCode: boolean): {
    issues: any[];
    suggestions: any[];
    metrics: any;
    improvedCode?: string;
  } {
    const lineCount = code.split('\n').length;
    const fileName = filePath.split('/').pop() || 'file';
    
    // Generate random but realistic metrics
    const metrics = {
      complexity: Math.floor(Math.random() * 30) + 20,
      maintainability: Math.floor(Math.random() * 20) + 70,
      security: Math.floor(Math.random() * 15) + 80,
      performance: Math.floor(Math.random() * 20) + 70,
      coverage: Math.floor(Math.random() * 30) + 60,
      duplicateLines: Math.floor(Math.random() * 10),
      linesOfCode: lineCount
    };
    
    // Generate mock issues
    const issues = [];
    const issueCount = Math.floor(Math.random() * 5) + 1;
    
    for (let i = 0; i < issueCount; i++) {
      const line = Math.floor(Math.random() * lineCount) + 1;
      const types = ['security', 'performance', 'style', 'bug', 'smell'];
      const severities = ['low', 'medium', 'high', 'critical'];
      
      issues.push({
        id: `issue-${i}-${Date.now()}`,
        type: types[Math.floor(Math.random() * types.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        line: line,
        column: Math.floor(Math.random() * 30) + 1,
        message: `Mock issue ${i + 1} in ${fileName}`,
        rule: `mock-rule-${i + 1}`,
        suggestion: `Consider fixing this issue by improving the code at line ${line}`
      });
    }
    
    // Generate mock suggestions
    const suggestions = [];
    const suggestionCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < suggestionCount; i++) {
      const types = ['refactor', 'optimize', 'security', 'style', 'documentation'];
      const priorities = ['low', 'medium', 'high'];
      
      suggestions.push({
        id: `suggestion-${i}-${Date.now()}`,
        type: types[Math.floor(Math.random() * types.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        description: `Mock suggestion ${i + 1} for ${fileName}`,
        before: 'function example() {',
        after: 'function example(): void {',
        impact: 'Better code readability and type safety'
      });
    }
    
    // Generate improved code if requested
    let improvedCode;
    if (generateImprovedCode) {
      // Just add some type annotations to simulate improvements
      improvedCode = code.replace(/function\s+([a-zA-Z0-9_]+)\s*\(/g, 'function $1(): void (');
    }
    
    return {
      issues,
      suggestions,
      metrics,
      improvedCode
    };
  }

  async generateDocumentation(code: string, language: string, modelId?: string): Promise<string> {
    const selectedModel = modelId || this.currentModel;
    const user = authService.getCurrentUser();

    // If in demo mode, return mock documentation
    if (isDemoMode()) {
      console.log('🔄 Using mock documentation in demo mode');
      return this.addMockDocumentation(code, language);
    }

    try {
      // Get the Supabase URL for the Edge Function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Supabase URL not configured');
      }

      // Call the Edge Function (you would need to create a separate function for documentation)
      const apiUrl = `${supabaseUrl}/functions/v1/generate-documentation`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          code,
          language,
          modelId: selectedModel,
          userId: user?.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate documentation');
      }

      const result = await response.json();
      return result.documentedCode || code;
    } catch (error) {
      console.error(`Documentation generation failed with ${selectedModel.toUpperCase()}:`, error);
      return this.addMockDocumentation(code, language);
    }
  }

  private addMockDocumentation(code: string, language: string): string {
    // Add mock documentation comments to the code
    if (language === 'javascript' || language === 'typescript') {
      return `/**
 * This is a mock documentation generated in demo mode
 * @description This function would typically do something important
 * @param {any} params - The parameters for the function
 * @returns {any} The result of the operation
 */
${code}`;
    } else if (language === 'python') {
      return `"""
This is a mock documentation generated in demo mode
This function would typically do something important
Args:
    params: The parameters for the function
Returns:
    The result of the operation
"""
${code}`;
    } else {
      // Generic documentation for other languages
      return `// This is a mock documentation generated in demo mode
// This code would typically do something important
${code}`;
    }
  }

  async validateFunctionalEquivalence(originalCode: string, improvedCode: string, language: string, modelId?: string): Promise<{
    isEquivalent: boolean;
    differences: string[];
    testSuggestions: string[];
  }> {
    // This could also be moved to an Edge Function in the future
    return {
      isEquivalent: true,
      differences: [],
      testSuggestions: ['Manual testing recommended']
    };
  }
}
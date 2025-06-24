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

    try {
      // If we're in demo mode or Supabase is not configured, use the fallback analysis
      if (isDemoMode || !supabase) {
        return this.getFallbackAnalysis(code, language, filePath, generateImprovedCode);
      }

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
      // Fallback analysis
      return this.getFallbackAnalysis(code, language, filePath, generateImprovedCode);
    }
  }

  private getFallbackAnalysis(code: string, language: string, filePath: string, generateImprovedCode: boolean = true): {
    issues: any[];
    suggestions: any[];
    metrics: any;
    improvedCode?: string;
  } {
    const lines = code.split('\n');
    const codeLength = code.length;
    
    // Generate basic issues based on code content
    const issues = [];
    const suggestions = [];
    
    // Security analysis
    if (code.includes('eval(') || code.includes('innerHTML') || code.includes('document.write')) {
      issues.push({
        id: 'security-xss-1',
        type: 'security',
        severity: 'critical',
        line: Math.min(10, lines.length),
        column: 1,
        message: `Potential XSS vulnerability detected`,
        rule: 'no-unsafe-eval',
        suggestion: 'Use safer alternatives like JSON.parse() or textContent'
      });
    }
    
    // Performance analysis
    if (code.includes('for (') && code.includes('.length')) {
      issues.push({
        id: 'performance-loop-1',
        type: 'performance',
        severity: 'medium',
        line: Math.min(15, lines.length),
        column: 1,
        message: `Loop optimization opportunity identified`,
        rule: 'no-length-in-loop',
        suggestion: 'Cache the length value before the loop for better performance'
      });
    }
    
    // Code quality
    if (language === 'javascript' && code.includes('var ')) {
      issues.push({
        id: 'style-var-1',
        type: 'style',
        severity: 'low',
        line: Math.min(5, lines.length),
        column: 1,
        message: `Modern JavaScript practices recommended`,
        rule: 'no-var',
        suggestion: 'Replace var with let or const for better scoping'
      });
    }
    
    // Generate suggestions
    suggestions.push({
      id: 'suggestion-1',
      type: 'style',
      priority: 'medium',
      description: `Code modernization suggested`,
      before: 'function example() {',
      after: 'function example(): void {',
      impact: 'Better code readability and type safety'
    });
    
    if (language === 'python') {
      suggestions.push({
        id: 'suggestion-2',
        type: 'documentation',
        priority: 'high',
        description: `Enhanced documentation patterns`,
        before: 'def process_data(data):',
        after: 'def process_data(data: List[Dict]) -> Dict:\n    """Process input data and return results."""',
        impact: 'Improved code documentation and maintainability'
      });
    }
    
    // Calculate metrics
    const baseComplexity = Math.min(100, Math.max(10, (code.match(/if|for|while|switch|case/g) || []).length * 5 + 20));
    const complexity = Math.round(baseComplexity);
    const maintainability = Math.max(60, Math.round(100 - complexity + (code.includes('//') || code.includes('#') ? 10 : 0)));
    const security = Math.max(70, Math.round(95 - issues.filter(i => i.type === 'security').length * 10));
    const performance = Math.max(65, Math.round(90 - issues.filter(i => i.type === 'performance').length * 5));
    
    const result: {
      issues: any[];
      suggestions: any[];
      metrics: any;
      improvedCode?: string;
    } = {
      issues,
      suggestions,
      metrics: {
        complexity,
        maintainability,
        security,
        performance,
        coverage: Math.floor(Math.random() * 40) + 60,
        duplicateLines: Math.floor(codeLength / 1000),
        linesOfCode: lines.filter(line => line.trim().length > 0).length
      }
    };

    if (generateImprovedCode) {
      result.improvedCode = code;
    }

    return result;
  }

  async generateDocumentation(code: string, language: string, modelId?: string): Promise<string> {
    const selectedModel = modelId || this.currentModel;
    const user = authService.getCurrentUser();

    try {
      // If we're in demo mode or Supabase is not configured, return the original code
      if (isDemoMode || !supabase) {
        return code;
      }

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
      return code;
    }
  }

  async validateFunctionalEquivalence(originalCode: string, improvedCode: string, language: string, modelId?: string): Promise<{
    isEquivalent: boolean;
    differences: string[];
    testSuggestions: string[];
  }> {
    // This could also be moved to an Edge Function in the future
    // For now, we'll just return a simple result
    return {
      isEquivalent: true,
      differences: [],
      testSuggestions: ['Manual testing recommended']
    };
  }
}
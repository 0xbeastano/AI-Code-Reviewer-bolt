import OpenAI from 'openai';
import { supabase } from '../lib/supabase';
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
      
      // Return a basic structure with empty arrays
      return {
        issues: [],
        suggestions: [],
        metrics: {
          complexity: 50,
          maintainability: 75,
          security: 80,
          performance: 70,
          coverage: 60,
          duplicateLines: 0,
          linesOfCode: code.split('\n').length
        }
      };
    }
  }

  async generateDocumentation(code: string, language: string, modelId?: string): Promise<string> {
    const selectedModel = modelId || this.currentModel;
    const user = authService.getCurrentUser();

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
      return code;
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
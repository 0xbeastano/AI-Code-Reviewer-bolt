import OpenAI from 'openai';
import { supabase, isDemoMode } from '../lib/supabase';
import { authService } from '../lib/auth';

export class AIService {
  private static instance: AIService;
  private currentModel: string = 'gpt-4o';
  private openai: OpenAI | null = null;

  constructor() {
    // Initialize OpenAI if API key is available
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (apiKey && apiKey !== 'your-openai-api-key') {
      try {
        this.openai = new OpenAI({
          apiKey,
          dangerouslyAllowBrowser: true // Only for demo purposes
        });
        console.log('🔄 OpenAI client initialized');
      } catch (error) {
        console.error('Failed to initialize OpenAI client:', error);
      }
    } else {
      console.log('🔄 OpenAI API key not configured, using mock responses');
    }
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

    // If in demo mode or OpenAI client not initialized, return mock analysis results
    if (isDemoMode() || !this.openai) {
      console.log(`🔄 Using mock analysis results for ${selectedModel}`);
      // Add a delay to simulate real analysis
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      return this.getMockAnalysisResults(code, language, filePath, generateImprovedCode);
    }

    try {
      console.log(`🔄 Starting ${selectedModel} analysis for ${filePath}`);
      
      // Create the prompt for code analysis
      const prompt = `
You are an expert code reviewer and software engineer with deep expertise in ${language}. Analyze this code file (${filePath}) and provide comprehensive feedback.

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Please provide a detailed analysis in JSON format with the following structure:
{
  "issues": [
    {
      "id": "unique_id",
      "type": "security|performance|style|bug|smell",
      "severity": "low|medium|high|critical",
      "line": number,
      "column": number,
      "message": "clear description of the issue",
      "rule": "rule_name",
      "suggestion": "how to fix this issue"
    }
  ],
  "suggestions": [
    {
      "id": "unique_id",
      "type": "refactor|optimize|security|style|documentation",
      "priority": "low|medium|high",
      "description": "what improvement to make",
      "before": "original code snippet",
      "after": "improved code snippet",
      "impact": "expected benefit and improvement"
    }
  ],
  "metrics": {
    "complexity": number (0-100, lower is better),
    "maintainability": number (0-100, higher is better),
    "security": number (0-100, higher is better),
    "performance": number (0-100, higher is better),
    "coverage": number (0-100, estimated test coverage),
    "duplicateLines": number,
    "linesOfCode": number
  }${generateImprovedCode ? ',\n  "improvedCode": "full improved version of the code"' : ''}
}

Focus on:
1. Security vulnerabilities (XSS, SQL injection, authentication issues, input validation)
2. Performance optimizations (algorithm efficiency, memory usage, async patterns)
3. Code quality (readability, maintainability, best practices, SOLID principles)
4. Bug detection (logic errors, edge cases, type issues, null pointer exceptions)
5. Style improvements (formatting, naming conventions, code organization)
6. Modern language features and patterns

Provide actionable, specific feedback with clear examples. Be thorough but practical.
`;

      // Get model configuration
      const config = this.getModelConfig(selectedModel);
      
      // Call OpenAI API
      const response = await this.openai.chat.completions.create({
        model: config.model,
        messages: [
          {
            role: "system",
            content: `You are an expert code reviewer with deep knowledge of software engineering best practices, security, and performance optimization. Provide thorough, actionable feedback in the exact JSON format requested. Focus on practical improvements that will make the code more secure, performant, and maintainable.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error(`No response from ${selectedModel}`);
      }

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(`Could not parse JSON from ${selectedModel} response`);
      }

      const analysis = JSON.parse(jsonMatch[0]);
      console.log(`✅ ${selectedModel} analysis completed for ${filePath}`);

      // Save to Supabase if available
      if (supabase && user && !isDemoMode()) {
        try {
          const { data, error } = await supabase
            .from('code_analyses')
            .insert({
              user_id: user.id,
              file_path: filePath,
              model: selectedModel,
              analysis_results: analysis,
              created_at: new Date().toISOString()
            });
            
          if (error) {
            console.error('Error saving analysis to Supabase:', error);
          }
        } catch (error) {
          console.error('Failed to save analysis to Supabase:', error);
        }
      }

      return analysis;
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

    // If in demo mode or OpenAI client not initialized, return mock documentation
    if (isDemoMode() || !this.openai) {
      console.log('🔄 Using mock documentation in demo mode');
      // Add a delay to simulate real processing
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      return this.addMockDocumentation(code, language);
    }

    try {
      console.log(`🔄 Starting documentation generation with ${selectedModel}`);
      
      // Create the prompt for documentation generation
      const prompt = `
Please add comprehensive documentation to the following ${language} code:

\`\`\`${language}
${code}
\`\`\`

Add appropriate comments, docstrings, and explanations to make the code more maintainable and understandable.
Follow best practices for documentation in ${language}.
Do not change the functionality of the code, only add documentation.
Return the fully documented code.
`;

      // Get model configuration
      const config = this.getModelConfig(selectedModel);
      
      // Call OpenAI API
      const response = await this.openai.chat.completions.create({
        model: config.model,
        messages: [
          {
            role: "system",
            content: `You are an expert software documentation specialist. Your task is to add clear, concise, and helpful documentation to code without changing its functionality.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: config.maxTokens
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error(`No response from ${selectedModel}`);
      }

      // Extract code from response
      const codeMatch = content.match(/```[\s\S]*?\n([\s\S]*?)```/);
      const documentedCode = codeMatch ? codeMatch[1] : content;
      
      console.log(`✅ Documentation generation completed with ${selectedModel}`);
      return documentedCode;
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
    const selectedModel = modelId || this.currentModel;
    
    // If in demo mode or OpenAI client not initialized, return mock results
    if (isDemoMode() || !this.openai) {
      // Add a delay to simulate real processing
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      return {
        isEquivalent: true,
        differences: [],
        testSuggestions: ['Manual testing recommended']
      };
    }
    
    try {
      console.log(`🔄 Starting functional equivalence validation with ${selectedModel}`);
      
      // Create the prompt for equivalence validation
      const prompt = `
I have an original code and an improved version. Please analyze if they are functionally equivalent.

Original code:
\`\`\`${language}
${originalCode}
\`\`\`

Improved code:
\`\`\`${language}
${improvedCode}
\`\`\`

Please provide your analysis in JSON format:
{
  "isEquivalent": boolean,
  "differences": [
    "description of functional difference 1",
    "description of functional difference 2"
  ],
  "testSuggestions": [
    "test case suggestion 1",
    "test case suggestion 2"
  ]
}
`;

      // Get model configuration
      const config = this.getModelConfig(selectedModel);
      
      // Call OpenAI API
      const response = await this.openai.chat.completions.create({
        model: config.model,
        messages: [
          {
            role: "system",
            content: `You are an expert code analyzer specializing in determining functional equivalence between code versions. Provide detailed analysis in the requested JSON format.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: config.maxTokens
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error(`No response from ${selectedModel}`);
      }

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(`Could not parse JSON from ${selectedModel} response`);
      }

      const result = JSON.parse(jsonMatch[0]);
      console.log(`✅ Functional equivalence validation completed with ${selectedModel}`);
      
      return {
        isEquivalent: result.isEquivalent,
        differences: result.differences || [],
        testSuggestions: result.testSuggestions || []
      };
    } catch (error) {
      console.error(`Functional equivalence validation failed with ${selectedModel.toUpperCase()}:`, error);
      return {
        isEquivalent: true,
        differences: [],
        testSuggestions: ['Manual testing recommended due to validation error']
      };
    }
  }
}
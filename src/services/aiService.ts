import { CodeExplanation, TestGenerationResult } from '../types';
import { supabase, isDemoMode } from "../lib/supabase";
import { authService } from "../lib/auth";
import { Configuration, OpenAIApi } from 'openai';

export class AIService {
  static instance: AIService;
  private apiUrl: string;
  private defaultModel: string = 'gpt-4o';
  private openai: OpenAIApi | null = null;

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  constructor() {
    this.apiUrl = import.meta.env.VITE_SUPABASE_URL || '';
    this.initializeOpenAI();
  }

  private initializeOpenAI() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (apiKey) {
      const configuration = new Configuration({ apiKey });
      this.openai = new OpenAIApi(configuration);
    }
  }

  async analyzeCode(
    code: string, 
    language: string, 
    filePath: string, 
    generateImprovedCode: boolean = false,
    modelId: string = this.defaultModel
  ): Promise<any> {
    try {
      // If OpenAI API key is available, use direct API call
      if (this.openai) {
        return this.analyzeCodeWithOpenAI(code, language, filePath, generateImprovedCode, modelId);
      }

      // Otherwise, use Supabase Edge Function
      if (isDemoMode()) {
        // For demo mode, we'll still try to use the Edge Function if available
        try {
          const response = await fetch(`${this.apiUrl}/functions/v1/analyze-code`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
              code,
              language,
              filePath,
              modelId,
              userId: 'demo-user',
              generateImprovedCode
            })
          });

          if (response.ok) {
            return await response.json();
          }
        } catch (error) {
          console.error('Edge function call failed, falling back to mock data:', error);
        }
        
        // If edge function fails or is not available, use mock data
        return this.getMockAnalysisResult(code, language, filePath, generateImprovedCode);
      }

      const user = authService.getCurrentUser();
      const userId = user?.id || 'anonymous';

      // Call Supabase Edge Function
      const response = await fetch(`${this.apiUrl}/functions/v1/analyze-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          code,
          language,
          filePath,
          modelId,
          userId,
          generateImprovedCode
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Code analysis failed:', error);
      return this.getMockAnalysisResult(code, language, filePath, generateImprovedCode);
    }
  }

  private async analyzeCodeWithOpenAI(
    code: string,
    language: string,
    filePath: string,
    generateImprovedCode: boolean = false,
    modelId: string = this.defaultModel
  ): Promise<any> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

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
    "linesOfCode": number,
    "cyclomaticComplexity": number (0-100, lower is better),
    "cognitiveComplexity": number (0-100, lower is better)
  }${generateImprovedCode ? ',\n  "improvedCode": "full improved version of the code"' : ''}
}

Focus on:
1. Security vulnerabilities (XSS, SQL injection, authentication issues, input validation)
2. Performance optimizations (algorithm efficiency, memory usage, async patterns)
3. Code quality (readability, maintainability, best practices, SOLID principles)
4. Bug detection (logic errors, edge cases, type issues, null pointer exceptions)
5. Style improvements (formatting, naming conventions, code organization)
6. Modern language features and patterns
7. Complexity analysis (both cyclomatic and cognitive complexity)

For complexity metrics:
- Cyclomatic complexity measures the number of linearly independent paths through the code
- Cognitive complexity measures how difficult the code is to understand based on nesting, control flow, and logical operations

Provide actionable, specific feedback with clear examples. Be thorough but practical.
For suggestions, make sure to include actual code snippets from the file in the "before" field and realistic improvements in the "after" field.
`;

    try {
      const response = await this.openai.createChatCompletion({
        model: modelId === "gpt-4o" ? "gpt-4" : modelId,
        messages: [
          {
            role: "system",
            content: `You are an expert code reviewer with deep knowledge of software engineering best practices, security, and performance optimization. Provide thorough, actionable feedback in the exact JSON format requested. Focus on practical improvements that will make the code more secure, performant, and maintainable. Always include actual code snippets from the provided code in your suggestions. Pay special attention to complexity metrics, both cyclomatic and cognitive.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      });

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error(`No response from OpenAI`);
      }

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(`Could not parse JSON from OpenAI response`);
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      throw error;
    }
  }

  async explainCode(
    code: string, 
    language: string, 
    filePath?: string,
    modelId: string = this.defaultModel
  ): Promise<CodeExplanation> {
    try {
      // If OpenAI API key is available, use direct API call
      if (this.openai) {
        return this.explainCodeWithOpenAI(code, language, modelId);
      }

      // Otherwise, use Supabase Edge Function
      if (isDemoMode()) {
        // For demo mode, we'll still try to use the Edge Function if available
        try {
          const response = await fetch(`${this.apiUrl}/functions/v1/explain-code`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
              code,
              language,
              modelId,
              userId: 'demo-user'
            })
          });

          if (response.ok) {
            return await response.json();
          }
        } catch (error) {
          console.error('Edge function call failed, falling back to mock data:', error);
        }
        
        return this.getMockExplanation(code, language);
      }

      const user = authService.getCurrentUser();
      const userId = user?.id || 'anonymous';

      // Call Supabase Edge Function
      const response = await fetch(`${this.apiUrl}/functions/v1/explain-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          code,
          language,
          modelId,
          userId
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Code explanation failed:', error);
      return this.getMockExplanation(code, language);
    }
  }

  private async explainCodeWithOpenAI(
    code: string,
    language: string,
    modelId: string = this.defaultModel
  ): Promise<CodeExplanation> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    const prompt = `
Please explain the following ${language} code in detail:

\`\`\`${language}
${code}
\`\`\`

Provide your response in JSON format with the following structure:
{
  "explanation": "A clear, detailed explanation of what the code does, how it works, and its purpose",
  "complexity": "An assessment of the code's complexity and readability",
  "keyComponents": ["List of key functions, classes, or components in the code", "With brief descriptions"],
  "potentialIssues": ["List of potential issues, edge cases, or improvements", "That could be addressed"]
}

Be thorough but concise. Focus on helping a developer understand the code's purpose, structure, and potential issues.
`;

    try {
      const response = await this.openai.createChatCompletion({
        model: modelId === "gpt-4o" ? "gpt-4" : modelId,
        messages: [
          {
            role: "system",
            content: `You are an expert code explainer who helps developers understand complex code. Provide clear, accurate explanations in the exact JSON format requested.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2500
      });

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error(`No response from OpenAI`);
      }

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(`Could not parse JSON from OpenAI response`);
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      throw error;
    }
  }

  async generateTests(
    code: string, 
    language: string, 
    filePath: string,
    modelId: string = this.defaultModel
  ): Promise<TestGenerationResult> {
    try {
      // If OpenAI API key is available, use direct API call
      if (this.openai) {
        return this.generateTestsWithOpenAI(code, language, filePath, modelId);
      }

      // Otherwise, use Supabase Edge Function
      if (isDemoMode()) {
        // For demo mode, we'll still try to use the Edge Function if available
        try {
          const response = await fetch(`${this.apiUrl}/functions/v1/generate-tests`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
              code,
              language,
              filePath,
              modelId,
              userId: 'demo-user'
            })
          });

          if (response.ok) {
            return await response.json();
          }
        } catch (error) {
          console.error('Edge function call failed, falling back to mock data:', error);
        }
        
        return this.getMockTestGeneration(code, language);
      }

      const user = authService.getCurrentUser();
      const userId = user?.id || 'anonymous';

      // Call Supabase Edge Function
      const response = await fetch(`${this.apiUrl}/functions/v1/generate-tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          code,
          language,
          filePath,
          modelId,
          userId
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Test generation failed:', error);
      return this.getMockTestGeneration(code, language);
    }
  }

  private async generateTestsWithOpenAI(
    code: string,
    language: string,
    filePath: string,
    modelId: string = this.defaultModel
  ): Promise<TestGenerationResult> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    const prompt = `
Generate comprehensive test cases for the following ${language} code:

\`\`\`${language}
${code}
\`\`\`

Provide your response in JSON format with the following structure:
{
  "testCode": "Complete test code that can be directly used to test the provided code",
  "testCases": [
    {
      "description": "Description of what this test case verifies",
      "input": "Sample input or parameters",
      "expectedOutput": "Expected result or behavior"
    }
  ],
  "coverage": 85, // Estimated test coverage percentage
  "framework": "Name of the testing framework used (e.g., Jest, pytest)"
}

The test code should:
1. Use the appropriate testing framework for ${language}
2. Include all necessary imports and setup
3. Cover edge cases and main functionality
4. Be well-documented and follow best practices
5. Be ready to run with minimal modifications

For JavaScript/TypeScript, use Jest or Mocha.
For Python, use pytest or unittest.
For other languages, use the most appropriate testing framework.
`;

    try {
      const response = await this.openai.createChatCompletion({
        model: modelId === "gpt-4o" ? "gpt-4" : modelId,
        messages: [
          {
            role: "system",
            content: `You are an expert test engineer who specializes in writing comprehensive, effective test suites. Generate practical, runnable test code in the exact JSON format requested.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 3000
      });

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error(`No response from OpenAI`);
      }

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(`Could not parse JSON from OpenAI response`);
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      throw error;
    }
  }

  async generateDocumentation(
    code: string, 
    language: string,
    modelId: string = this.defaultModel
  ): Promise<string> {
    try {
      // If OpenAI API key is available, use direct API call
      if (this.openai) {
        return this.generateDocumentationWithOpenAI(code, language, modelId);
      }

      // Otherwise, use mock data
      return this.getMockDocumentation(code, language);
    } catch (error) {
      console.error('Documentation generation failed:', error);
      return this.getMockDocumentation(code, language);
    }
  }

  private async generateDocumentationWithOpenAI(
    code: string,
    language: string,
    modelId: string = this.defaultModel
  ): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    const prompt = `
Generate comprehensive documentation for the following ${language} code:

\`\`\`${language}
${code}
\`\`\`

Please provide:
1. A clear overview of what this code does
2. Documentation for each function, class, and method
3. Parameter descriptions and return value explanations
4. Usage examples where appropriate
5. Any important notes or caveats

Use the appropriate documentation format for ${language} (JSDoc for JavaScript, docstrings for Python, etc.).
`;

    try {
      const response = await this.openai.createChatCompletion({
        model: modelId === "gpt-4o" ? "gpt-4" : modelId,
        messages: [
          {
            role: "system",
            content: `You are an expert technical writer who specializes in creating clear, comprehensive code documentation. Generate documentation that follows best practices for the given programming language.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2500
      });

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error(`No response from OpenAI`);
      }

      return content;
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      throw error;
    }
  }

  // Mock implementations for demo mode
  private getMockAnalysisResult(code: string, language: string, filePath: string, generateImprovedCode: boolean): any {
    console.log('🔄 Using mock analysis in demo mode');
    
    // Generate some realistic issues based on the code
    const issues = this.generateMockIssues(code, language);
    
    // Generate suggestions with different before/after code
    const suggestions = this.generateMockSuggestions(code, language);
    
    // Calculate metrics based on code characteristics
    const metrics = this.calculateMockMetrics(code, language);
    
    const result: any = {
      issues,
      suggestions,
      metrics
    };
    
    if (generateImprovedCode) {
      result.improvedCode = this.generateMockImprovedCode(code, language);
    }
    
    return result;
  }

  private generateMockIssues(code: string, language: string): any[] {
    const lines = code.split('\n');
    const issues = [];
    
    // Add some realistic issues based on code content and language
    if (code.includes('var ')) {
      issues.push({
        id: `var-usage-${Date.now()}`,
        type: 'style',
        severity: 'medium',
        line: code.split('\n').findIndex(line => line.includes('var ')) + 1,
        column: code.split('\n').find(line => line.includes('var '))?.indexOf('var ') || 1,
        message: 'Use of var is discouraged, prefer const or let',
        rule: 'no-var',
        suggestion: 'Replace var with const if the variable is not reassigned, or let if it is'
      });
    }
    
    if (code.includes('console.log')) {
      issues.push({
        id: `console-log-${Date.now()}`,
        type: 'performance',
        severity: 'low',
        line: code.split('\n').findIndex(line => line.includes('console.log')) + 1,
        column: code.split('\n').find(line => line.includes('console.log'))?.indexOf('console.log') || 1,
        message: 'Avoid console.log statements in production code',
        rule: 'no-console',
        suggestion: 'Remove console.log or replace with a proper logging mechanism'
      });
    }
    
    if (code.includes('innerHTML')) {
      issues.push({
        id: `innerhtml-${Date.now()}`,
        type: 'security',
        severity: 'high',
        line: code.split('\n').findIndex(line => line.includes('innerHTML')) + 1,
        column: code.split('\n').find(line => line.includes('innerHTML'))?.indexOf('innerHTML') || 1,
        message: 'Use of innerHTML can lead to XSS vulnerabilities',
        rule: 'no-innerhtml',
        suggestion: 'Use textContent or DOM methods instead of innerHTML'
      });
    }
    
    // Add a few more generic issues
    if (lines.length > 5) {
      issues.push({
        id: `long-line-${Date.now()}`,
        type: 'style',
        severity: 'low',
        line: Math.floor(Math.random() * lines.length) + 1,
        column: 1,
        message: 'Line exceeds 100 characters',
        rule: 'max-len',
        suggestion: 'Break long lines into multiple lines for better readability'
      });
    }
    
    if (language === 'javascript' || language === 'typescript') {
      issues.push({
        id: `unused-var-${Date.now()}`,
        type: 'bug',
        severity: 'medium',
        line: Math.floor(Math.random() * lines.length) + 1,
        column: 5,
        message: 'Variable is declared but never used',
        rule: 'no-unused-vars',
        suggestion: 'Remove unused variable or use it'
      });
    }
    
    return issues;
  }

  private generateMockSuggestions(code: string, language: string): any[] {
    const suggestions = [];
    
    // Generate different suggestions based on code content
    if (code.includes('for (')) {
      suggestions.push({
        id: `for-loop-${Date.now()}`,
        type: 'refactor',
        priority: 'medium',
        description: 'Replace for loop with array method',
        before: 'for (let i = 0; i < items.length; i++) {\n  console.log(items[i]);\n}',
        after: 'items.forEach(item => {\n  console.log(item);\n});',
        impact: 'Improves code readability and reduces potential off-by-one errors'
      });
    }
    
    if (code.includes('function ')) {
      suggestions.push({
        id: `arrow-func-${Date.now()}`,
        type: 'style',
        priority: 'low',
        description: 'Use arrow function for better conciseness',
        before: 'function add(a, b) {\n  return a + b;\n}',
        after: 'const add = (a, b) => a + b;',
        impact: 'Makes code more concise and modern'
      });
    }
    
    if (code.includes('if (') && code.includes('else ')) {
      suggestions.push({
        id: `ternary-${Date.now()}`,
        type: 'refactor',
        priority: 'low',
        description: 'Use ternary operator for simple conditionals',
        before: 'let result;\nif (condition) {\n  result = "yes";\n} else {\n  result = "no";\n}',
        after: 'const result = condition ? "yes" : "no";',
        impact: 'Reduces code verbosity for simple conditional assignments'
      });
    }
    
    // Add security suggestion
    if (language === 'javascript' || language === 'typescript') {
      suggestions.push({
        id: `security-${Date.now()}`,
        type: 'security',
        priority: 'high',
        description: 'Add input validation to prevent security vulnerabilities',
        before: 'function processUserInput(input) {\n  document.getElementById("output").innerHTML = input;\n}',
        after: 'function processUserInput(input) {\n  if (!input || typeof input !== "string") {\n    return;\n  }\n  const sanitized = input.replace(/[<>&"\']/g, "");\n  document.getElementById("output").textContent = sanitized;\n}',
        impact: 'Prevents XSS attacks by validating and sanitizing user input'
      });
    }
    
    return suggestions;
  }

  private calculateMockMetrics(code: string, language: string): any {
    const lines = code.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    
    // Calculate complexity based on control structures
    const complexityKeywords = ['if', 'else', 'for', 'while', 'switch', 'case', 'try', 'catch'];
    let complexity = 1; // Base complexity
    
    lines.forEach(line => {
      complexityKeywords.forEach(keyword => {
        if (line.includes(keyword)) complexity++;
      });
    });
    
    const maxComplexity = Math.max(nonEmptyLines.length / 5, 10);
    const normalizedComplexity = Math.min(100, (complexity / maxComplexity) * 100);
    
    // Calculate maintainability based on various factors
    const commentLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.startsWith('//') || trimmed.startsWith('#') || 
             trimmed.startsWith('/*') || trimmed.startsWith('*');
    });
    
    const commentRatio = commentLines.length / Math.max(nonEmptyLines.length, 1);
    const maintainability = Math.min(100, Math.max(0, 90 - normalizedComplexity + (commentRatio * 20)));
    
    // Calculate cyclomatic complexity
    const cyclomaticComplexity = this.calculateMockCyclomaticComplexity(code, language);
    
    // Calculate cognitive complexity
    const cognitiveComplexity = this.calculateMockCognitiveComplexity(code, language);
    
    // Generate other metrics
    return {
      complexity: Math.round(normalizedComplexity),
      maintainability: Math.round(maintainability),
      security: Math.round(Math.random() * 30 + 70), // Random between 70-100
      performance: Math.round(Math.random() * 20 + 80), // Random between 80-100
      coverage: Math.round(Math.random() * 40 + 60), // Random between 60-100
      duplicateLines: Math.floor(Math.random() * 20),
      linesOfCode: nonEmptyLines.length,
      cohesion: Math.round(Math.random() * 30 + 70),
      coupling: Math.round(Math.random() * 30),
      cognitive: Math.round(Math.random() * 50),
      documentation: Math.round(Math.random() * 20 + 80),
      testability: Math.round(Math.random() * 20 + 70),
      reusability: Math.round(Math.random() * 20 + 70),
      cyclomaticComplexity: cyclomaticComplexity,
      cognitiveComplexity: cognitiveComplexity
    };
  }

  private calculateMockCyclomaticComplexity(code: string, language: string): number {
    // Count control flow statements to estimate cyclomatic complexity
    const controlFlowKeywords = [
      'if', 'else if', 'else', 'for', 'while', 'do', 'switch', 'case', 'catch', 'try', '&&', '\\|\\|'
    ];
    
    let complexity = 1; // Base complexity
    
    // Count occurrences of control flow keywords
    for (const keyword of controlFlowKeywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = code.match(regex);
      if (matches) {
        complexity += matches.length;
      }
    }
    
    // Normalize to a 0-100 scale (higher is worse)
    // A value of 1-10 is considered good, 11-20 is moderate, 21+ is complex
    return Math.min(100, Math.round((complexity / 30) * 100));
  }

  private calculateMockCognitiveComplexity(code: string, language: string): number {
    // Cognitive complexity is more about nesting and logical flow
    // This is a simplified mock calculation
    
    // Count nesting levels
    const lines = code.split('\n');
    let maxNestingLevel = 0;
    let currentNestingLevel = 0;
    
    for (const line of lines) {
      // Increase nesting level for opening braces or indentation
      if (line.includes('{') || line.trim().endsWith(':')) {
        currentNestingLevel++;
        maxNestingLevel = Math.max(maxNestingLevel, currentNestingLevel);
      }
      
      // Decrease nesting level for closing braces
      if (line.includes('}')) {
        currentNestingLevel = Math.max(0, currentNestingLevel - 1);
      }
    }
    
    // Count logical operators
    const logicalOperators = code.match(/&&|\|\||and|or/g) || [];
    
    // Count control flow statements
    const controlFlowKeywords = [
      'if', 'else if', 'else', 'for', 'while', 'do', 'switch', 'case', 'catch', 'try'
    ];
    
    let controlFlowCount = 0;
    for (const keyword of controlFlowKeywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = code.match(regex);
      if (matches) {
        controlFlowCount += matches.length;
      }
    }
    
    // Calculate cognitive complexity based on nesting, logical operators, and control flow
    const cognitiveComplexity = maxNestingLevel * 2 + logicalOperators.length + controlFlowCount;
    
    // Normalize to a 0-100 scale (higher is worse)
    return Math.min(100, Math.round((cognitiveComplexity / 50) * 100));
  }

  private generateMockImprovedCode(code: string, language: string): string {
    // Make some simple improvements to the code
    let improvedCode = code;
    
    // Replace var with const/let
    improvedCode = improvedCode.replace(/var\s+([a-zA-Z_][a-zA-Z0-9_]*)/g, 'const $1');
    
    // Add some comments
    const lines = improvedCode.split('\n');
    if (lines.length > 5) {
      const randomLine = Math.floor(Math.random() * (lines.length - 2)) + 1;
      lines.splice(randomLine, 0, '// This is an important section that handles core functionality');
      improvedCode = lines.join('\n');
    }
    
    return improvedCode;
  }

  private getMockExplanation(code: string, language: string): CodeExplanation {
    return {
      explanation: `This code appears to be a ${language} implementation that handles data processing and UI rendering. It defines several functions and uses modern patterns for efficient execution. The main functionality revolves around processing input data, transforming it through several steps, and then rendering the results to the user interface.`,
      complexity: `The code has moderate complexity with several nested control structures and function calls. There are some areas where refactoring could improve readability, particularly in the data transformation logic.`,
      keyComponents: [
        "Data processing functions that transform input",
        "UI rendering logic for displaying results",
        "Event handlers for user interactions",
        "Utility functions for common operations"
      ],
      potentialIssues: [
        "Some functions lack proper error handling",
        "Performance could be improved by memoizing expensive calculations",
        "Variable naming could be more descriptive in some places",
        "Missing type checking for function parameters"
      ]
    };
  }

  private getMockTestGeneration(code: string, language: string): TestGenerationResult {
    const framework = language === 'javascript' || language === 'typescript' 
      ? 'Jest' 
      : language === 'python' 
      ? 'pytest' 
      : 'JUnit';
    
    let testCode = '';
    
    if (language === 'javascript' || language === 'typescript') {
      testCode = `
import { expect, test, describe } from 'jest';

describe('Code functionality tests', () => {
  test('should process input correctly', () => {
    // Arrange
    const input = 'test input';
    
    // Act
    const result = processInput(input);
    
    // Assert
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });
  
  test('should handle empty input', () => {
    // Arrange
    const input = '';
    
    // Act
    const result = processInput(input);
    
    // Assert
    expect(result).toBe('');
  });
  
  test('should handle special characters', () => {
    // Arrange
    const input = '<script>alert("XSS")</script>';
    
    // Act
    const result = processInput(input);
    
    // Assert
    expect(result).not.toContain('<script>');
  });
});
      `;
    } else if (language === 'python') {
      testCode = `
import pytest
from module import process_input

def test_process_input_normal():
    # Arrange
    input_data = "test input"
    
    # Act
    result = process_input(input_data)
    
    # Assert
    assert result is not None
    assert isinstance(result, str)

def test_process_input_empty():
    # Arrange
    input_data = ""
    
    # Act
    result = process_input(input_data)
    
    # Assert
    assert result == ""

def test_process_input_special_chars():
    # Arrange
    input_data = "<script>alert('XSS')</script>"
    
    # Act
    result = process_input(input_data)
    
    # Assert
    assert "<script>" not in result
      `;
    }
    
    return {
      testCode,
      testCases: [
        {
          description: "Process normal input string",
          input: "Regular text input",
          expectedOutput: "Processed text with expected transformations"
        },
        {
          description: "Handle empty input",
          input: "",
          expectedOutput: "Empty string or appropriate default value"
        },
        {
          description: "Sanitize malicious input",
          input: "<script>alert('XSS')</script>",
          expectedOutput: "Sanitized string with scripts removed"
        }
      ],
      coverage: 85,
      framework
    };
  }

  private getMockDocumentation(code: string, language: string): string {
    // Generate mock documentation based on the code
    const lines = code.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    
    // Extract function names
    const functionRegex = language === 'javascript' || language === 'typescript'
      ? /function\s+([a-zA-Z_][a-zA-Z0-9_]*)/g
      : /def\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
    
    const functionMatches = code.match(functionRegex) || [];
    const functionNames = functionMatches.map(match => {
      const parts = match.split(/\s+/);
      return parts[1];
    });
    
    // Generate documentation
    let documentation = `/**
 * Module Documentation
 * 
 * This module contains functionality for processing and handling data.
 * It includes ${functionNames.length} main functions and is written in ${language}.
 * 
 * @module ${language === 'javascript' ? 'DataProcessor' : 'data_processor'}
 */\n\n`;
    
    // Add documentation for each function
    functionNames.forEach(name => {
      documentation += `/**
 * ${name} - Processes data and returns a result
 * 
 * @param {any} input - The input data to process
 * @returns {any} The processed result
 * 
 * @example
 * // Example usage
 * const result = ${name}(inputData);
 */\n`;
    });
    
    return documentation + code;
  }
}
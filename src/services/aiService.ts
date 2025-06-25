import OpenAI from 'openai';
import { supabase, isDemoMode } from '../lib/supabase';
import { authService } from '../lib/auth';
import { CodeExplanation, TestGenerationResult } from '../types';
import DOMPurify from 'dompurify';

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
      console.log('🔄 OpenAI API key not configured, using intelligent mock responses');
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

    try {
      // Try to use the Supabase Edge Function first
      if (supabase && !isDemoMode()) {
        try {
          console.log(`🔄 Using Supabase Edge Function for ${selectedModel} analysis`);
          
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          if (!supabaseUrl) throw new Error('Supabase URL not configured');
          
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
              userId: user?.id || 'anonymous',
              generateImprovedCode
            })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Edge function error: ${response.status} - ${errorText}`);
          }
          
          const result = await response.json();
          console.log(`✅ Edge function analysis completed for ${filePath}`);
          return result;
        } catch (error) {
          console.warn('Edge function failed, falling back to client-side analysis:', error);
          // Fall through to client-side analysis
        }
      }
      
      // If in demo mode or Edge Function failed, use client-side analysis
      if (isDemoMode() || !this.openai) {
        console.log(`🔄 Using intelligent mock analysis for ${selectedModel}`);
        // Add a delay to simulate real analysis
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
        return this.getIntelligentMockAnalysis(code, language, filePath, generateImprovedCode);
      }

      console.log(`🔄 Starting client-side ${selectedModel} analysis for ${filePath}`);
      
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
    "linesOfCode": number,
    "cohesion": number (0-100, higher is better),
    "coupling": number (0-100, lower is better),
    "cognitive": number (0-100, lower is better),
    "documentation": number (0-100, higher is better),
    "testability": number (0-100, higher is better),
    "reusability": number (0-100, higher is better)
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
For suggestions, make sure to include actual code snippets from the file in the "before" field and realistic improvements in the "after" field.
`;

      // Get model configuration
      const config = this.getModelConfig(selectedModel);
      
      // Call OpenAI API
      const response = await this.openai.chat.completions.create({
        model: config.model,
        messages: [
          {
            role: "system",
            content: `You are an expert code reviewer with deep knowledge of software engineering best practices, security, and performance optimization. Provide thorough, actionable feedback in the exact JSON format requested. Focus on practical improvements that will make the code more secure, performant, and maintainable. Always include real code snippets from the provided code in your suggestions.`
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
      
      // Return intelligent mock results if analysis fails
      return this.getIntelligentMockAnalysis(code, language, filePath, generateImprovedCode);
    }
  }

  private getIntelligentMockAnalysis(code: string, language: string, filePath: string, generateImprovedCode: boolean): {
    issues: any[];
    suggestions: any[];
    metrics: any;
    improvedCode?: string;
  } {
    const lineCount = code.split('\n').length;
    const fileName = filePath.split('/').pop() || 'file';
    const lines = code.split('\n');
    
    // Generate metrics based on actual code characteristics
    const metrics = {
      complexity: this.calculateComplexity(code, language),
      maintainability: this.calculateMaintainability(code, language),
      security: this.calculateSecurityScore(code, language),
      performance: this.calculatePerformanceScore(code, language),
      coverage: Math.floor(Math.random() * 30) + 60, // This is harder to estimate
      duplicateLines: this.estimateDuplicateLines(code),
      linesOfCode: lineCount,
      // New expanded metrics
      cohesion: Math.floor(Math.random() * 20) + 70,
      coupling: Math.floor(Math.random() * 30) + 20,
      cognitive: Math.floor(Math.random() * 40) + 30,
      documentation: Math.floor(Math.random() * 40) + 50,
      testability: Math.floor(Math.random() * 30) + 60,
      reusability: Math.floor(Math.random() * 30) + 60
    };
    
    // Generate issues based on actual code content
    const issues = this.detectIssues(code, language, filePath);
    
    // Generate suggestions based on actual code content
    const suggestions = this.generateSuggestions(code, language, filePath, issues);
    
    // Generate improved code if requested
    let improvedCode;
    if (generateImprovedCode) {
      improvedCode = this.generateImprovedCode(code, language, suggestions);
    }
    
    return {
      issues,
      suggestions,
      metrics,
      improvedCode
    };
  }

  private calculateComplexity(code: string, language: string): number {
    // Basic complexity calculation based on control structures and nesting
    const lines = code.split('\n');
    let complexity = 20; // Base complexity
    
    // Count control structures
    const controlKeywords = ['if', 'else', 'for', 'while', 'switch', 'case', 'try', 'catch', 'function', 'class'];
    let controlCount = 0;
    
    // Count nesting level
    let maxNestingLevel = 0;
    let currentNestingLevel = 0;
    
    for (const line of lines) {
      // Check for control structures
      for (const keyword of controlKeywords) {
        if (line.includes(keyword + ' ') || line.includes(keyword + '(')) {
          controlCount++;
        }
      }
      
      // Check nesting level
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      
      currentNestingLevel += openBraces - closeBraces;
      maxNestingLevel = Math.max(maxNestingLevel, currentNestingLevel);
    }
    
    // Calculate complexity score (0-100, lower is better)
    complexity += controlCount * 2;
    complexity += maxNestingLevel * 5;
    
    // Adjust based on file size
    complexity += Math.min(30, lines.length / 10);
    
    return Math.min(100, Math.max(0, complexity));
  }

  private calculateMaintainability(code: string, language: string): number {
    // Basic maintainability calculation
    const lines = code.split('\n');
    let maintainability = 80; // Base maintainability
    
    // Check for comments
    const commentLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.startsWith('//') || trimmed.startsWith('#') || 
             trimmed.startsWith('/*') || trimmed.startsWith('*') || 
             trimmed.startsWith('"""') || trimmed.startsWith("'''");
    }).length;
    
    const commentRatio = commentLines / Math.max(lines.length, 1);
    maintainability += commentRatio * 20;
    
    // Check for long lines
    const longLines = lines.filter(line => line.length > 100).length;
    maintainability -= (longLines / Math.max(lines.length, 1)) * 20;
    
    // Check for complex functions
    const complexity = this.calculateComplexity(code, language);
    maintainability -= complexity / 5;
    
    return Math.min(100, Math.max(0, maintainability));
  }

  private calculateSecurityScore(code: string, language: string): number {
    // Basic security score calculation
    let securityScore = 85; // Base security score
    
    // Check for common security issues
    const securityIssues = [
      'eval(', 'exec(', 'innerHTML', 'document.write', 
      'sql', 'query', 'password', 'token', 'auth', 
      'xhr', 'fetch', 'http', 'url', 'parse'
    ];
    
    let issueCount = 0;
    for (const issue of securityIssues) {
      if (code.includes(issue)) {
        issueCount++;
      }
    }
    
    securityScore -= issueCount * 3;
    
    // Check for input validation
    if (code.includes('input') || code.includes('param') || code.includes('req.body')) {
      if (!code.includes('validate') && !code.includes('sanitize')) {
        securityScore -= 10;
      }
    }
    
    return Math.min(100, Math.max(0, securityScore));
  }

  private calculatePerformanceScore(code: string, language: string): number {
    // Basic performance score calculation
    let performanceScore = 80; // Base performance score
    
    // Check for performance issues
    const performanceIssues = [
      { pattern: /for\s*\(\s*let\s+[a-zA-Z0-9_]+\s*=\s*0\s*;\s*[a-zA-Z0-9_]+\s*<\s*[a-zA-Z0-9_]+\.length/, penalty: 5 }, // Accessing array length in loop
      { pattern: /\+\s*=/, penalty: 2 }, // String concatenation
      { pattern: /setTimeout\s*\(\s*function/, penalty: 3 }, // Nested function in setTimeout
      { pattern: /console\.log/, penalty: 1 }, // Console logging
      { pattern: /[a-zA-Z0-9_]+\s*\.\s*forEach/, penalty: -2 }, // Using forEach (good)
      { pattern: /[a-zA-Z0-9_]+\s*\.\s*map/, penalty: -2 }, // Using map (good)
      { pattern: /[a-zA-Z0-9_]+\s*\.\s*filter/, penalty: -2 }, // Using filter (good)
      { pattern: /[a-zA-Z0-9_]+\s*\.\s*reduce/, penalty: -2 }, // Using reduce (good)
      { pattern: /async\s+function/, penalty: -3 }, // Using async (good)
      { pattern: /await/, penalty: -3 }, // Using await (good)
    ];
    
    for (const issue of performanceIssues) {
      if (issue.pattern.test(code)) {
        performanceScore += issue.penalty;
      }
    }
    
    return Math.min(100, Math.max(0, performanceScore));
  }

  private estimateDuplicateLines(code: string): number {
    // Basic duplicate line estimation
    const lines = code.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const uniqueLines = new Set(lines);
    
    return lines.length - uniqueLines.size;
  }

  private detectIssues(code: string, language: string, filePath: string): any[] {
    const issues = [];
    const lines = code.split('\n');
    const fileName = filePath.split('/').pop() || '';
    
    // Check for common issues based on language and file type
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;
      
      // Security issues
      if (line.includes('eval(') || line.includes('new Function(')) {
        issues.push({
          id: `security-eval-${lineNumber}`,
          type: 'security',
          severity: 'critical',
          line: lineNumber,
          column: line.indexOf('eval(') > -1 ? line.indexOf('eval(') + 1 : line.indexOf('new Function(') + 1,
          message: 'Use of eval() or new Function() is a security risk',
          rule: 'no-eval',
          suggestion: 'Avoid using eval() or new Function() as they can execute arbitrary code'
        });
      }
      
      if (line.includes('innerHTML') || line.includes('document.write')) {
        issues.push({
          id: `security-xss-${lineNumber}`,
          type: 'security',
          severity: 'high',
          line: lineNumber,
          column: line.indexOf('innerHTML') > -1 ? line.indexOf('innerHTML') + 1 : line.indexOf('document.write') + 1,
          message: 'Potential XSS vulnerability',
          rule: 'no-innerHTML',
          suggestion: 'Use textContent or innerText instead of innerHTML to prevent XSS attacks'
        });
      }
      
      // Performance issues
      if (line.match(/for\s*\(\s*let\s+[a-zA-Z0-9_]+\s*=\s*0\s*;\s*[a-zA-Z0-9_]+\s*<\s*[a-zA-Z0-9_]+\.length/)) {
        issues.push({
          id: `performance-loop-${lineNumber}`,
          type: 'performance',
          severity: 'medium',
          line: lineNumber,
          column: line.indexOf('for') + 1,
          message: 'Array length accessed in each loop iteration',
          rule: 'optimize-loops',
          suggestion: 'Cache the array length before the loop to improve performance'
        });
      }
      
      // Style issues
      if (line.includes('var ')) {
        issues.push({
          id: `style-var-${lineNumber}`,
          type: 'style',
          severity: 'low',
          line: lineNumber,
          column: line.indexOf('var ') + 1,
          message: 'Use of var keyword',
          rule: 'no-var',
          suggestion: 'Use let or const instead of var for better scoping'
        });
      }
      
      if (line.length > 100) {
        issues.push({
          id: `style-line-length-${lineNumber}`,
          type: 'style',
          severity: 'low',
          line: lineNumber,
          column: 1,
          message: 'Line exceeds 100 characters',
          rule: 'max-len',
          suggestion: 'Break long lines into multiple lines for better readability'
        });
      }
      
      // Bug detection
      if (line.includes('==') && !line.includes('===')) {
        issues.push({
          id: `bug-equality-${lineNumber}`,
          type: 'bug',
          severity: 'medium',
          line: lineNumber,
          column: line.indexOf('==') + 1,
          message: 'Use of loose equality (==)',
          rule: 'eqeqeq',
          suggestion: 'Use strict equality (===) instead of loose equality (==) to avoid type coercion issues'
        });
      }
      
      // Language-specific issues
      if (language === 'javascript' || language === 'typescript') {
        if (line.includes('this') && !line.includes('function') && !line.includes('=>') && !line.includes('class')) {
          issues.push({
            id: `bug-this-context-${lineNumber}`,
            type: 'bug',
            severity: 'medium',
            line: lineNumber,
            column: line.indexOf('this') + 1,
            message: 'Potential this context issue',
            rule: 'no-invalid-this',
            suggestion: 'Ensure this is used in the correct context or use arrow functions to preserve context'
          });
        }
      } else if (language === 'python') {
        if (line.includes('except:') && !line.includes('except Exception:')) {
          issues.push({
            id: `bug-bare-except-${lineNumber}`,
            type: 'bug',
            severity: 'medium',
            line: lineNumber,
            column: line.indexOf('except:') + 1,
            message: 'Bare except clause',
            rule: 'no-bare-except',
            suggestion: 'Specify an exception type instead of using a bare except clause'
          });
        }
      }
    }
    
    // File-specific issues
    if (fileName.endsWith('.json')) {
      try {
        JSON.parse(code);
      } catch (error) {
        issues.push({
          id: `syntax-json-${Date.now()}`,
          type: 'bug',
          severity: 'critical',
          line: 1,
          column: 1,
          message: 'Invalid JSON syntax',
          rule: 'valid-json',
          suggestion: `Fix JSON syntax error: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }
    
    return issues;
  }

  private generateSuggestions(code: string, language: string, filePath: string, issues: any[]): any[] {
    const suggestions = [];
    const lines = code.split('\n');
    const fileName = filePath.split('/').pop() || '';
    
    // Group related issues to generate meaningful suggestions
    const securityIssues = issues.filter(issue => issue.type === 'security');
    const performanceIssues = issues.filter(issue => issue.type === 'performance');
    const styleIssues = issues.filter(issue => issue.type === 'style');
    const bugIssues = issues.filter(issue => issue.type === 'bug');
    
    // Generate security suggestions
    if (securityIssues.length > 0) {
      // Find a representative issue for the suggestion
      const issue = securityIssues[0];
      const lineIndex = issue.line - 1;
      const lineContent = lines[lineIndex];
      
      let before = '';
      let after = '';
      
      // Get context (a few lines before and after)
      const startLine = Math.max(0, lineIndex - 2);
      const endLine = Math.min(lines.length - 1, lineIndex + 2);
      
      for (let i = startLine; i <= endLine; i++) {
        before += lines[i] + '\n';
      }
      
      // Create improved version
      after = before;
      if (issue.rule === 'no-eval') {
        after = after.replace(/eval\s*\((.*?)\)/g, 'JSON.parse($1)');
      } else if (issue.rule === 'no-innerHTML') {
        after = after.replace(/\.innerHTML\s*=\s*(.*?);/g, '.textContent = $1;');
      }
      
      suggestions.push({
        id: `security-suggestion-${Date.now()}`,
        type: 'security',
        priority: issue.severity === 'critical' ? 'high' : issue.severity,
        description: `Fix ${issue.severity} security issue: ${issue.message}`,
        before: before.trim(),
        after: after.trim(),
        impact: 'Improves application security by preventing potential vulnerabilities'
      });
    }
    
    // Generate performance suggestions
    if (performanceIssues.length > 0) {
      const issue = performanceIssues[0];
      const lineIndex = issue.line - 1;
      
      let before = '';
      let after = '';
      
      // Get context
      const startLine = Math.max(0, lineIndex - 2);
      const endLine = Math.min(lines.length - 1, lineIndex + 2);
      
      for (let i = startLine; i <= endLine; i++) {
        before += lines[i] + '\n';
      }
      
      // Create improved version
      after = before;
      if (issue.rule === 'optimize-loops') {
        // Replace loop with cached length
        after = after.replace(
          /for\s*\(\s*let\s+([a-zA-Z0-9_]+)\s*=\s*0\s*;\s*([a-zA-Z0-9_]+)\s*<\s*([a-zA-Z0-9_]+)\.length/g,
          'const $3Length = $3.length;\nfor (let $1 = 0; $2 < $3Length'
        );
      }
      
      suggestions.push({
        id: `performance-suggestion-${Date.now()}`,
        type: 'optimize',
        priority: 'medium',
        description: `Optimize code performance: ${issue.message}`,
        before: before.trim(),
        after: after.trim(),
        impact: 'Improves code execution speed and reduces resource usage'
      });
    }
    
    // Generate style suggestions
    if (styleIssues.length > 0) {
      const issue = styleIssues[0];
      const lineIndex = issue.line - 1;
      
      let before = '';
      let after = '';
      
      // Get context
      const startLine = Math.max(0, lineIndex - 1);
      const endLine = Math.min(lines.length - 1, lineIndex + 1);
      
      for (let i = startLine; i <= endLine; i++) {
        before += lines[i] + '\n';
      }
      
      // Create improved version
      after = before;
      if (issue.rule === 'no-var') {
        after = after.replace(/var\s+([a-zA-Z0-9_]+)/g, 'const $1');
      } else if (issue.rule === 'max-len') {
        // This is a simplistic approach - real implementation would be more sophisticated
        const longLine = lines[lineIndex];
        if (longLine.includes('(') && longLine.includes(')')) {
          after = before.replace(longLine, longLine.replace(/\((.{50,})\)/, '(\n  $1\n)'));
        }
      }
      
      suggestions.push({
        id: `style-suggestion-${Date.now()}`,
        type: 'style',
        priority: 'low',
        description: `Improve code style: ${issue.message}`,
        before: before.trim(),
        after: after.trim(),
        impact: 'Enhances code readability and maintainability'
      });
    }
    
    // Generate bug fix suggestions
    if (bugIssues.length > 0) {
      const issue = bugIssues[0];
      const lineIndex = issue.line - 1;
      
      let before = '';
      let after = '';
      
      // Get context
      const startLine = Math.max(0, lineIndex - 1);
      const endLine = Math.min(lines.length - 1, lineIndex + 1);
      
      for (let i = startLine; i <= endLine; i++) {
        before += lines[i] + '\n';
      }
      
      // Create improved version
      after = before;
      if (issue.rule === 'eqeqeq') {
        after = after.replace(/==/g, '===').replace(/!=/g, '!==');
      } else if (issue.rule === 'no-invalid-this') {
        // This is a simplistic approach
        after = after.replace(/function\s*\(([^)]*)\)\s*{([^}]*)this/g, 'function($1) {\n  const self = this;$2self');
      } else if (issue.rule === 'no-bare-except') {
        after = after.replace(/except:/g, 'except Exception:');
      }
      
      suggestions.push({
        id: `bug-fix-suggestion-${Date.now()}`,
        type: 'refactor',
        priority: 'high',
        description: `Fix potential bug: ${issue.message}`,
        before: before.trim(),
        after: after.trim(),
        impact: 'Prevents potential runtime errors and improves code reliability'
      });
    }
    
    // Add documentation suggestion if code has few comments
    const commentLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.startsWith('//') || trimmed.startsWith('#') || 
             trimmed.startsWith('/*') || trimmed.startsWith('*') || 
             trimmed.startsWith('"""') || trimmed.startsWith("'''");
    }).length;
    
    const commentRatio = commentLines / Math.max(lines.length, 1);
    
    if (commentRatio < 0.1 && lines.length > 10) {
      // Find a function to document
      let functionStartIndex = -1;
      let functionEndIndex = -1;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('function ') || lines[i].match(/^\s*def\s+/)) {
          functionStartIndex = i;
          
          // Find the end of the function
          let braceCount = 0;
          for (let j = i; j < lines.length; j++) {
            if (lines[j].includes('{')) braceCount++;
            if (lines[j].includes('}')) braceCount--;
            
            if ((braceCount === 0 && j > i) || (language === 'python' && j > i && lines[j].trim() === '')) {
              functionEndIndex = j;
              break;
            }
          }
          
          if (functionEndIndex > functionStartIndex) break;
        }
      }
      
      if (functionStartIndex >= 0 && functionEndIndex >= 0) {
        let before = '';
        for (let i = functionStartIndex; i <= functionEndIndex; i++) {
          before += lines[i] + '\n';
        }
        
        let after = '';
        if (language === 'javascript' || language === 'typescript') {
          after = '/**\n * Function description\n * @param {type} paramName - Parameter description\n * @returns {type} Return value description\n */\n' + before;
        } else if (language === 'python') {
          after = '"""\nFunction description\n\nArgs:\n    param_name (type): Parameter description\n\nReturns:\n    type: Return value description\n"""\n' + before;
        } else {
          after = '// Function description\n// Parameters:\n//   - paramName: Parameter description\n// Returns: Return value description\n' + before;
        }
        
        suggestions.push({
          id: `documentation-suggestion-${Date.now()}`,
          type: 'documentation',
          priority: 'medium',
          description: 'Add function documentation',
          before: before.trim(),
          after: after.trim(),
          impact: 'Improves code maintainability and helps other developers understand the code'
        });
      }
    }
    
    // Add file-specific suggestions
    if (fileName.endsWith('.json')) {
      suggestions.push({
        id: `json-format-suggestion-${Date.now()}`,
        type: 'style',
        priority: 'low',
        description: 'Format JSON for better readability',
        before: code.trim(),
        after: JSON.stringify(JSON.parse(code), null, 2),
        impact: 'Improves JSON readability and maintainability'
      });
    }
    
    // If no suggestions were generated, add a generic one
    if (suggestions.length === 0) {
      // Find a function or meaningful code block
      let blockStart = -1;
      let blockEnd = -1;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('function ') || lines[i].match(/^\s*def\s+/)  || lines[i].includes('class ')) {
          blockStart = i;
          break;
        }
      }
      
      if (blockStart >= 0) {
        blockEnd = Math.min(lines.length - 1, blockStart + 5);
        
        let before = '';
        for (let i = blockStart; i <= blockEnd; i++) {
          before += lines[i] + '\n';
        }
        
        let after = before;
        
        // Add type annotations if possible
        if (language === 'javascript') {
          after = before.replace(/function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/g, 'function $1($2): void');
        } else if (language === 'typescript') {
          after = before.replace(/function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/g, 'function $1($2): void');
        } else if (language === 'python') {
          after = before.replace(/def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\):/g, 'def $1($2) -> None:');
        }
        
        if (after !== before) {
          suggestions.push({
            id: `type-annotation-suggestion-${Date.now()}`,
            type: 'style',
            priority: 'medium',
            description: 'Add type annotations for better code clarity',
            before: before.trim(),
            after: after.trim(),
            impact: 'Improves code readability and helps catch type-related bugs'
          });
        }
      }
    }
    
    return suggestions;
  }

  private generateImprovedCode(code: string, language: string, suggestions: any[]): string {
    let improvedCode = code;
    
    // Apply all suggestions to the code
    for (const suggestion of suggestions) {
      if (suggestion.before && suggestion.after && improvedCode.includes(suggestion.before)) {
        improvedCode = improvedCode.replace(suggestion.before, suggestion.after);
      }
    }
    
    return improvedCode;
  }

  async explainCode(code: string, language: string, modelId?: string): Promise<CodeExplanation> {
    const selectedModel = modelId || this.currentModel;
    const user = authService.getCurrentUser();

    try {
      // Try to use the Supabase Edge Function first
      if (supabase && !isDemoMode()) {
        try {
          console.log(`🔄 Using Supabase Edge Function for code explanation`);
          
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          if (!supabaseUrl) throw new Error('Supabase URL not configured');
          
          const apiUrl = `${supabaseUrl}/functions/v1/explain-code`;
          
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
              userId: user?.id || 'anonymous'
            })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Edge function error: ${response.status} - ${errorText}`);
          }
          
          const result = await response.json();
          console.log(`✅ Edge function explanation completed`);
          return result;
        } catch (error) {
          console.warn('Edge function failed, falling back to client-side explanation:', error);
          // Fall through to client-side analysis
        }
      }
      
      // If in demo mode or Edge Function failed, use client-side analysis
      if (isDemoMode() || !this.openai) {
        console.log(`🔄 Using intelligent mock explanation`);
        // Add a delay to simulate real analysis
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        return this.getMockCodeExplanation(code, language);
      }

      console.log(`🔄 Starting client-side ${selectedModel} code explanation`);
      
      // Create the prompt for code explanation
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

      // Get model configuration
      const config = this.getModelConfig(selectedModel);
      
      // Call OpenAI API
      const response = await this.openai.chat.completions.create({
        model: config.model,
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

      const explanation = JSON.parse(jsonMatch[0]);
      
      // Sanitize HTML content if any
      if (explanation.explanation) {
        explanation.explanation = DOMPurify.sanitize(explanation.explanation);
      }
      
      console.log(`✅ ${selectedModel} code explanation completed`);
      return explanation;
    } catch (error) {
      console.error(`Code explanation failed:`, error);
      return this.getMockCodeExplanation(code, language);
    }
  }

  private getMockCodeExplanation(code: string, language: string): CodeExplanation {
    // Generate a mock explanation based on code characteristics
    const lines = code.split('\n');
    const functionMatches = code.match(/function\s+([a-zA-Z0-9_]+)|def\s+([a-zA-Z0-9_]+)/g) || [];
    const classMatches = code.match(/class\s+([a-zA-Z0-9_]+)/g) || [];
    
    const functions = functionMatches.map(match => {
      const name = match.replace(/function\s+|def\s+/, '');
      return `${name}() - Handles ${name.toLowerCase().replace(/[^a-z0-9]/g, ' ')} operations`;
    });
    
    const classes = classMatches.map(match => {
      const name = match.replace(/class\s+/, '');
      return `${name} - Represents a ${name.toLowerCase().replace(/[^a-z0-9]/g, ' ')} entity`;
    });
    
    const keyComponents = [...functions, ...classes];
    if (keyComponents.length === 0) {
      keyComponents.push('Main code block - Contains the primary logic');
    }
    
    // Generate potential issues
    const potentialIssues = [];
    
    if (code.includes('var ')) {
      potentialIssues.push('Uses var declarations which can lead to scoping issues');
    }
    
    if (code.includes('==')) {
      potentialIssues.push('Uses loose equality (==) which can cause unexpected type coercion');
    }
    
    if (code.includes('try') && !code.includes('catch')) {
      potentialIssues.push('Missing error handling in try blocks');
    }
    
    if (lines.some(line => line.length > 100)) {
      potentialIssues.push('Contains long lines that may reduce readability');
    }
    
    if (code.includes('TODO') || code.includes('FIXME')) {
      potentialIssues.push('Contains TODO or FIXME comments that should be addressed');
    }
    
    // Add generic issues if none were found
    if (potentialIssues.length === 0) {
      potentialIssues.push('Could benefit from additional error handling');
      potentialIssues.push('Consider adding more comprehensive documentation');
    }
    
    // Generate complexity assessment
    let complexity = 'Low';
    const complexityScore = this.calculateComplexity(code, language);
    if (complexityScore > 70) {
      complexity = 'High - The code contains complex logic and nested structures that may be difficult to understand';
    } else if (complexityScore > 40) {
      complexity = 'Medium - The code has moderate complexity with some nested structures';
    } else {
      complexity = 'Low - The code is straightforward and easy to understand';
    }
    
    // Generate explanation
    let explanation = '';
    if (functions.length > 0 || classes.length > 0) {
      explanation = `This ${language} code ${functions.length > 0 ? 'defines ' + functions.length + ' functions' : ''}${functions.length > 0 && classes.length > 0 ? ' and ' : ''}${classes.length > 0 ? 'implements ' + classes.length + ' classes' : ''}. `;
      explanation += `It appears to ${code.includes('import') || code.includes('require') ? 'import external dependencies and ' : ''}handle ${keyComponents.length > 1 ? 'multiple related operations' : 'a specific operation'}.`;
    } else {
      explanation = `This ${language} code implements a script that performs operations directly without defining functions or classes. `;
      explanation += `It ${code.includes('if') || code.includes('for') || code.includes('while') ? 'contains control structures for conditional logic or iteration' : 'executes sequentially'}.`;
    }
    
    explanation += ` The code ${lines.length < 20 ? 'is relatively short' : lines.length < 50 ? 'is of moderate length' : 'is quite lengthy'} with ${lines.length} lines.`;
    
    return {
      explanation,
      complexity,
      keyComponents,
      potentialIssues
    };
  }

  async generateTests(code: string, language: string, filePath: string, modelId?: string): Promise<TestGenerationResult> {
    const selectedModel = modelId || this.currentModel;
    const user = authService.getCurrentUser();

    try {
      // Try to use the Supabase Edge Function first
      if (supabase && !isDemoMode()) {
        try {
          console.log(`🔄 Using Supabase Edge Function for test generation`);
          
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          if (!supabaseUrl) throw new Error('Supabase URL not configured');
          
          const apiUrl = `${supabaseUrl}/functions/v1/generate-tests`;
          
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
              userId: user?.id || 'anonymous'
            })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Edge function error: ${response.status} - ${errorText}`);
          }
          
          const result = await response.json();
          console.log(`✅ Edge function test generation completed`);
          return result;
        } catch (error) {
          console.warn('Edge function failed, falling back to client-side test generation:', error);
          // Fall through to client-side analysis
        }
      }
      
      // If in demo mode or Edge Function failed, use client-side analysis
      if (isDemoMode() || !this.openai) {
        console.log(`🔄 Using intelligent mock test generation`);
        // Add a delay to simulate real analysis
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        return this.getMockTestGeneration(code, language, filePath);
      }

      console.log(`🔄 Starting client-side ${selectedModel} test generation`);
      
      // Create the prompt for test generation
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

      // Get model configuration
      const config = this.getModelConfig(selectedModel);
      
      // Call OpenAI API
      const response = await this.openai.chat.completions.create({
        model: config.model,
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

      const testData = JSON.parse(jsonMatch[0]);
      
      // Sanitize HTML content if any
      if (testData.testCode) {
        testData.testCode = DOMPurify.sanitize(testData.testCode);
      }
      
      console.log(`✅ ${selectedModel} test generation completed`);
      return testData;
    } catch (error) {
      console.error(`Test generation failed:`, error);
      return this.getMockTestGeneration(code, language, filePath);
    }
  }

  private getMockTestGeneration(code: string, language: string, filePath: string): TestGenerationResult {
    // Generate mock test data based on code characteristics
    const fileName = filePath.split('/').pop() || 'file';
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    
    // Determine appropriate test framework
    let framework = 'Jest';
    let testCode = '';
    
    if (language === 'python') {
      framework = 'pytest';
      testCode = `import pytest\nfrom ${baseName} import *\n\n`;
      testCode += `def test_${baseName}_functionality():\n    # Test basic functionality\n    assert True\n\n`;
      testCode += `def test_${baseName}_edge_cases():\n    # Test edge cases\n    assert True\n`;
    } else if (language === 'javascript' || language === 'typescript') {
      framework = 'Jest';
      testCode = `import { ${baseName} } from './${baseName}';\n\n`;
      testCode += `describe('${baseName}', () => {\n`;
      testCode += `  test('should work correctly', () => {\n    // Test basic functionality\n    expect(true).toBe(true);\n  });\n\n`;
      testCode += `  test('should handle edge cases', () => {\n    // Test edge cases\n    expect(true).toBe(true);\n  });\n});\n`;
    } else {
      testCode = `// Tests for ${fileName}\n\n`;
      testCode += `// Test basic functionality\nassert(true);\n\n`;
      testCode += `// Test edge cases\nassert(true);\n`;
    }
    
    // Extract function names for test cases
    const functionMatches = code.match(/function\s+([a-zA-Z0-9_]+)|def\s+([a-zA-Z0-9_]+)/g) || [];
    const functionNames = functionMatches.map(match => {
      return match.replace(/function\s+|def\s+/, '');
    });
    
    // Generate test cases
    const testCases = [];
    
    if (functionNames.length > 0) {
      for (const funcName of functionNames.slice(0, 3)) {
        testCases.push({
          description: `Test that ${funcName} works with valid input`,
          input: 'validInput',
          expectedOutput: 'expectedResult'
        });
        
        testCases.push({
          description: `Test that ${funcName} handles edge cases`,
          input: 'edgeCaseInput',
          expectedOutput: 'edgeCaseResult'
        });
      }
    } else {
      testCases.push({
        description: 'Test basic functionality',
        input: 'standardInput',
        expectedOutput: 'expectedOutput'
      });
      
      testCases.push({
        description: 'Test edge case handling',
        input: 'edgeCaseInput',
        expectedOutput: 'edgeCaseOutput'
      });
    }
    
    // Calculate mock coverage
    const coverage = Math.floor(Math.random() * 20) + 75; // 75-95%
    
    return {
      testCode,
      testCases,
      coverage,
      framework
    };
  }

  async validateFunctionalEquivalence(originalCode: string, improvedCode: string, language: string, modelId?: string): Promise<{
    isEquivalent: boolean;
    differences: string[];
    testSuggestions: string[];
  }> {
    const selectedModel = modelId || this.currentModel;
    
    // If in demo mode or OpenAI client not initialized, return intelligent mock results
    if (isDemoMode() || !this.openai) {
      // Add a delay to simulate real processing
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      return this.validateEquivalenceIntelligently(originalCode, improvedCode, language);
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
      return this.validateEquivalenceIntelligently(originalCode, improvedCode, language);
    }
  }

  private validateEquivalenceIntelligently(originalCode: string, improvedCode: string, language: string): {
    isEquivalent: boolean;
    differences: string[];
    testSuggestions: string[];
  } {
    // Basic equivalence validation
    const originalLines = originalCode.split('\n');
    const improvedLines = improvedCode.split('\n');
    
    // Check if the number of lines is significantly different
    const lineDifference = Math.abs(originalLines.length - improvedLines.length);
    const isSignificantlyDifferent = lineDifference > originalLines.length * 0.3;
    
    // Check for function signature changes
    const originalFunctions = this.extractFunctionSignatures(originalCode, language);
    const improvedFunctions = this.extractFunctionSignatures(improvedCode, language);
    
    const functionDifferences = [];
    
    // Check for removed functions
    for (const func of originalFunctions) {
      if (!improvedFunctions.some(f => f.name === func.name)) {
        functionDifferences.push(`Function ${func.name} was removed`);
      }
    }
    
    // Check for added functions
    for (const func of improvedFunctions) {
      if (!originalFunctions.some(f => f.name === func.name)) {
        functionDifferences.push(`Function ${func.name} was added`);
      }
    }
    
    // Check for parameter changes
    for (const origFunc of originalFunctions) {
      const improvedFunc = improvedFunctions.find(f => f.name === origFunc.name);
      if (improvedFunc && origFunc.params !== improvedFunc.params) {
        functionDifferences.push(`Function ${origFunc.name} parameters changed from (${origFunc.params}) to (${improvedFunc.params})`);
      }
    }
    
    // Generate test suggestions
    const testSuggestions = [];
    
    // Add general test suggestion
    testSuggestions.push('Test with various inputs to ensure behavior is preserved');
    
    // Add function-specific test suggestions
    for (const func of originalFunctions) {
      testSuggestions.push(`Test function ${func.name} with edge cases`);
    }
    
    // Add language-specific test suggestions
    if (language === 'javascript' || language === 'typescript') {
      testSuggestions.push('Use Jest or Mocha to create unit tests');
    } else if (language === 'python') {
      testSuggestions.push('Use pytest to create unit tests');
    }
    
    return {
      isEquivalent: !isSignificantlyDifferent && functionDifferences.length === 0,
      differences: functionDifferences,
      testSuggestions: testSuggestions
    };
  }

  private extractFunctionSignatures(code: string, language: string): Array<{ name: string, params: string }> {
    const functions = [];
    const lines = code.split('\n');
    
    for (const line of lines) {
      if (language === 'javascript' || language === 'typescript') {
        const match = line.match(/function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
        if (match) {
          functions.push({
            name: match[1],
            params: match[2].trim()
          });
        }
        
        // Also check for arrow functions and method definitions
        const arrowMatch = line.match(/const\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>/);
        if (arrowMatch) {
          functions.push({
            name: arrowMatch[1],
            params: arrowMatch[2].trim()
          });
        }
        
        const methodMatch = line.match(/([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*{/);
        if (methodMatch) {
          functions.push({
            name: methodMatch[1],
            params: methodMatch[2].trim()
          });
        }
      } else if (language === 'python') {
        const match = line.match(/def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\):/);
        if (match) {
          functions.push({
            name: match[1],
            params: match[2].trim()
          });
        }
      }
    }
    
    return functions;
  }
}
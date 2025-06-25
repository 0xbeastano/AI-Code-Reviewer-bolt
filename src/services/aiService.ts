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

    // If in demo mode or OpenAI client not initialized, return intelligent mock analysis results
    if (isDemoMode() || !this.openai) {
      console.log(`🔄 Using intelligent mock analysis for ${selectedModel}`);
      // Add a delay to simulate real analysis
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      return this.getIntelligentMockAnalysis(code, language, filePath, generateImprovedCode);
    }

    try {
      console.log(`🔄 Starting ${selectedModel} analysis for ${filePath}`);
      
      // Create the prompt for code analysis with enhanced security focus
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
   - For security issues, provide DETAILED remediation steps with specific code examples
   - Include complete, production-ready code in the "after" field that directly fixes the vulnerability
   - Explain the security impact and potential exploitation scenarios
   - Reference relevant security standards (OWASP, CWE) when applicable

2. Performance optimizations (algorithm efficiency, memory usage, async patterns)
   - Identify specific performance bottlenecks with measurable impact
   - Provide optimized implementations that maintain the same functionality

3. Code quality (readability, maintainability, best practices, SOLID principles)
   - Suggest refactorings that improve maintainability without changing behavior
   - Identify code smells and technical debt with practical solutions

4. Bug detection (logic errors, edge cases, type issues, null pointer exceptions)
   - Highlight potential runtime errors and edge cases
   - Provide robust error handling suggestions

5. Style improvements (formatting, naming conventions, code organization)
   - Suggest modern language features and patterns
   - Improve code organization and structure

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
            content: `You are an expert code reviewer with deep knowledge of software engineering best practices, security, and performance optimization. Provide thorough, actionable feedback in the exact JSON format requested. Focus on practical improvements that will make the code more secure, performant, and maintainable. Always include real code snippets from the provided code in your suggestions. For security vulnerabilities, provide detailed, production-ready fixes that completely address the issue.`
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
      linesOfCode: lineCount
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
    // Enhanced security score calculation with more detailed checks
    let securityScore = 85; // Base security score
    
    // Check for common security issues with more detailed patterns
    const securityIssues = [
      { pattern: /eval\s*\(/, penalty: 20, critical: true },
      { pattern: /exec\s*\(/, penalty: 20, critical: true },
      { pattern: /innerHTML\s*=/, penalty: 15, critical: false },
      { pattern: /document\.write\s*\(/, penalty: 15, critical: false },
      { pattern: /sql.*\+.*(?:req|request|input|param)/, penalty: 20, critical: true }, // SQL injection
      { pattern: /password.*=.*['"]/, penalty: 10, critical: false }, // Hardcoded passwords
      { pattern: /token.*=.*['"]/, penalty: 10, critical: false }, // Hardcoded tokens
      { pattern: /auth.*=.*['"]/, penalty: 10, critical: false }, // Hardcoded auth
      { pattern: /\.createServer\s*\(\s*http\s*\)/, penalty: 10, critical: false }, // Insecure HTTP
      { pattern: /\.parse\s*\(\s*(?:req|request|input|param)/, penalty: 5, critical: false }, // Potential JSON parsing issues
      { pattern: /\.exec\s*\(\s*(?:req|request|input|param)/, penalty: 15, critical: true }, // Command injection
      { pattern: /\.load\s*\(\s*(?:req|request|input|param)/, penalty: 10, critical: false }, // Unsafe loading
      { pattern: /\.include\s*\(\s*(?:req|request|input|param)/, penalty: 10, critical: false }, // Unsafe inclusion
    ];
    
    let criticalIssuesFound = 0;
    
    for (const issue of securityIssues) {
      if (issue.pattern.test(code)) {
        securityScore -= issue.penalty;
        if (issue.critical) criticalIssuesFound++;
      }
    }
    
    // Check for input validation
    if ((code.includes('input') || code.includes('param') || code.includes('req.body')) && 
        !(code.includes('validate') || code.includes('sanitize') || code.includes('escape'))) {
      securityScore -= 10;
    }
    
    // Severe penalty for critical issues
    if (criticalIssuesFound > 0) {
      securityScore -= criticalIssuesFound * 10;
    }
    
    // Bonus for security best practices
    if (code.includes('https') && !code.includes('http:')) securityScore += 5;
    if (code.includes('Content-Security-Policy')) securityScore += 5;
    if (code.includes('X-XSS-Protection')) securityScore += 3;
    if (code.includes('helmet') || code.includes('Helmet')) securityScore += 5;
    
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
      
      // Security issues - Enhanced with more detailed suggestions
      if (line.includes('eval(') || line.includes('new Function(')) {
        issues.push({
          id: `security-eval-${lineNumber}`,
          type: 'security',
          severity: 'critical',
          line: lineNumber,
          column: line.indexOf('eval(') > -1 ? line.indexOf('eval(') + 1 : line.indexOf('new Function(') + 1,
          message: 'Use of eval() or new Function() is a security risk',
          rule: 'no-eval',
          suggestion: 'Replace eval() with safer alternatives like JSON.parse() for data parsing or a proper template system for dynamic content generation. This prevents code injection attacks.'
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
          suggestion: 'Use textContent or innerText instead of innerHTML, or implement proper HTML sanitization using a library like DOMPurify. This prevents cross-site scripting (XSS) attacks by ensuring user input cannot execute as code.'
        });
      }
      
      // SQL Injection checks
      if (line.match(/(?:query|sql|db\.execute|connection\.query).*\+.*(?:req|request|input|param)/i)) {
        issues.push({
          id: `security-sqli-${lineNumber}`,
          type: 'security',
          severity: 'critical',
          line: lineNumber,
          column: 1,
          message: 'Potential SQL Injection vulnerability',
          rule: 'no-sql-injection',
          suggestion: 'Use parameterized queries or prepared statements instead of string concatenation. This ensures user input is properly escaped and cannot alter the structure of your SQL query.'
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
          suggestion: 'Cache the array length before the loop to improve performance: const length = array.length; for (let i = 0; i < length; i++)'
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
          suggestion: 'Use let or const instead of var for better scoping and to avoid hoisting-related bugs'
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
    
    // Generate security suggestions with enhanced detail
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
      
      // Create improved version with detailed security fixes
      after = before;
      if (issue.rule === 'no-eval') {
        // More comprehensive fix for eval
        if (before.includes('eval(')) {
          after = after.replace(/eval\s*\((.*?)\)/g, (match, p1) => {
            if (p1.includes('JSON')) {
              return `JSON.parse(${p1})`;
            } else {
              return `// SECURITY: eval() replaced with safer alternative
// If you need to parse JSON:
JSON.parse(${p1})
// If you need to execute a function by name:
// const functionName = ${p1};
// const safeFunction = allowedFunctions[functionName];
// if (safeFunction) safeFunction();`;
            }
          });
        }
      } else if (issue.rule === 'no-innerHTML') {
        // More comprehensive fix for innerHTML
        after = after.replace(/\.innerHTML\s*=\s*(.*?);/g, (match, p1) => {
          return `// SECURITY: innerHTML replaced with safer textContent
// For plain text:
.textContent = ${p1};
// If you need to sanitize HTML:
// import DOMPurify from 'dompurify';
// element.innerHTML = DOMPurify.sanitize(${p1});`;
        });
      } else if (issue.rule === 'no-sql-injection') {
        // Comprehensive fix for SQL injection
        after = after.replace(/(query|sql|db\.execute|connection\.query).*\+.*(?:req|request|input|param)/i, (match) => {
          if (language === 'javascript' || language === 'typescript') {
            return `// SECURITY: SQL query rewritten to use parameterized query
const query = 'SELECT * FROM users WHERE username = ?';
db.query(query, [req.body.username]);`;
          } else if (language === 'python') {
            return `# SECURITY: SQL query rewritten to use parameterized query
query = "SELECT * FROM users WHERE username = %s"
cursor.execute(query, (username,))`;
          } else {
            return `// SECURITY: Replace string concatenation with parameterized queries
// Example: 
// const query = 'SELECT * FROM users WHERE username = ?';
// db.query(query, [username]);`;
          }
        });
      }
      
      suggestions.push({
        id: `security-suggestion-${Date.now()}`,
        type: 'security',
        priority: issue.severity === 'critical' ? 'high' : issue.severity,
        description: `Fix ${issue.severity} security issue: ${issue.message}`,
        before: before.trim(),
        after: after.trim(),
        impact: 'Improves application security by preventing potential vulnerabilities that could lead to data breaches or system compromise'
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
        impact: 'Improves code execution speed and reduces resource usage, especially important for loops that run many times'
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
        impact: 'Enhances code readability and maintainability, making it easier for team members to understand and modify'
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
        impact: 'Prevents potential runtime errors and improves code reliability by fixing issues that could cause unexpected behavior'
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
          impact: 'Improves code maintainability and helps other developers understand the code purpose and usage'
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

  async generateDocumentation(code: string, language: string, modelId?: string): Promise<string> {
    const selectedModel = modelId || this.currentModel;
    const user = authService.getCurrentUser();

    // If in demo mode or OpenAI client not initialized, return intelligent mock documentation
    if (isDemoMode() || !this.openai) {
      console.log('🔄 Using intelligent mock documentation');
      // Add a delay to simulate real processing
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      return this.generateIntelligentDocumentation(code, language);
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
      return this.generateIntelligentDocumentation(code, language);
    }
  }

  private generateIntelligentDocumentation(code: string, language: string): string {
    const lines = code.split('\n');
    let documentedCode = '';
    const fileName = '';
    
    // Identify functions and classes
    const functionRegex = language === 'python' 
      ? /^\s*def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\):/
      : /^\s*(?:function|const|let|var)?\s*([a-zA-Z0-9_]+)\s*(?:=\s*(?:function|async function)?\s*\(([^)]*)\)|=\s*\(([^)]*)\)\s*=>|=>\s*{|=>\s*\(|=>\s*[^{]|=\s*{|=\s*\(|=\s*\[|=\s*"|=\s*'|=\s*`|=\s*\d|=\s*true|=\s*false|=\s*null|=\s*undefined|=\s*new|=\s*\[\]|=\s*\{\}|=\s*\/|=\s*\+|=\s*\-|=\s*\*|=\s*\/|=\s*%|=\s*&|=\s*\|)/;
    
    const classRegex = language === 'python'
      ? /^\s*class\s+([a-zA-Z0-9_]+)(?:\s*\(([^)]*)\))?:/
      : /^\s*class\s+([a-zA-Z0-9_]+)(?:\s+extends\s+([a-zA-Z0-9_]+))?/;
    
    let inFunction = false;
    let inClass = false;
    let functionName = '';
    let className = '';
    let params = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for function definition
      const functionMatch = line.match(functionRegex);
      if (functionMatch) {
        inFunction = true;
        functionName = functionMatch[1];
        params = functionMatch[2] || '';
        
        // Add function documentation
        if (language === 'javascript' || language === 'typescript') {
          documentedCode += '/**\n';
          documentedCode += ` * ${functionName} - Function description\n`;
          
          // Add param documentation
          if (params) {
            const paramList = params.split(',').map(p => p.trim());
            for (const param of paramList) {
              if (param) {
                const paramName = param.split('=')[0].trim().replace(/^[a-zA-Z0-9_]+: /, '');
                documentedCode += ` * @param {any} ${paramName} - Parameter description\n`;
              }
            }
          }
          
          documentedCode += ` * @returns {any} - Return value description\n`;
          documentedCode += ' */\n';
        } else if (language === 'python') {
          documentedCode += '"""\n';
          documentedCode += `${functionName} - Function description\n\n`;
          
          // Add param documentation
          if (params) {
            documentedCode += 'Args:\n';
            const paramList = params.split(',').map(p => p.trim());
            for (const param of paramList) {
              if (param) {
                const paramName = param.split('=')[0].trim();
                documentedCode += `    ${paramName} (any): Parameter description\n`;
              }
            }
            documentedCode += '\n';
          }
          
          documentedCode += 'Returns:\n';
          documentedCode += '    any: Return value description\n';
          documentedCode += '"""\n';
        }
      }
      
      // Check for class definition
      const classMatch = line.match(classRegex);
      if (classMatch) {
        inClass = true;
        className = classMatch[1];
        
        // Add class documentation
        if (language === 'javascript' || language === 'typescript') {
          documentedCode += '/**\n';
          documentedCode += ` * ${className} - Class description\n`;
          documentedCode += ' */\n';
        } else if (language === 'python') {
          documentedCode += '"""\n';
          documentedCode += `${className} - Class description\n\n`;
          documentedCode += 'Attributes:\n';
          documentedCode += '    attribute_name (type): Attribute description\n\n';
          documentedCode += 'Methods:\n';
          documentedCode += '    method_name(params): Method description\n';
          documentedCode += '"""\n';
        }
      }
      
      // Add the original line
      documentedCode += line + '\n';
      
      // Reset flags if we're at the end of a block
      if (inFunction && line.includes('}')) {
        inFunction = false;
      }
      
      if (inClass && line.includes('}')) {
        inClass = false;
      }
    }
    
    // If no functions or classes were found, add file-level documentation
    if (!documentedCode.includes('/**') && !documentedCode.includes('"""')) {
      let fileDoc = '';
      
      if (language === 'javascript' || language === 'typescript') {
        fileDoc = '/**\n';
        fileDoc += ` * ${fileName} - File description\n`;
        fileDoc += ' * \n';
        fileDoc += ' * This file contains functionality for...\n';
        fileDoc += ' */\n\n';
      } else if (language === 'python') {
        fileDoc = '"""\n';
        fileDoc += 'File description\n\n';
        fileDoc += 'This file contains functionality for...\n';
        fileDoc += '"""\n\n';
      } else {
        fileDoc = '// File description\n';
        fileDoc += '// This file contains functionality for...\n\n';
      }
      
      documentedCode = fileDoc + code;
    }
    
    return documentedCode;
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
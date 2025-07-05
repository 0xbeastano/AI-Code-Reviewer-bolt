import { log } from '../utils/logger';
import { aiOrchestrator } from './aiOrchestrator';

export interface RefactoringRule {
  id: string;
  name: string;
  description: string;
  category: 'performance' | 'maintainability' | 'security' | 'style' | 'patterns';
  languages: string[];
  pattern: RegExp;
  replacement: string | ((match: string, ...groups: string[]) => string);
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  automated: boolean;
  examples: {
    before: string;
    after: string;
  }[];
}

export interface RefactoringSuggestion {
  id: string;
  ruleId: string;
  file: string;
  line: number;
  column: number;
  original: string;
  refactored: string;
  reasoning: string;
  impact: {
    performance: number;
    maintainability: number;
    readability: number;
    security: number;
  };
  confidence: number;
  effort: 'minimal' | 'moderate' | 'significant';
  dependencies: string[];
  tests: string[];
}

export interface RefactoringSession {
  id: string;
  timestamp: Date;
  projectPath: string;
  suggestions: RefactoringSuggestion[];
  applied: string[];
  rejected: string[];
  metrics: {
    totalSuggestions: number;
    appliedSuggestions: number;
    impactScore: number;
    timeSpent: number;
  };
}

class CodeRefactoringEngine {
  private static instance: CodeRefactoringEngine;
  private refactoringRules: Map<string, RefactoringRule> = new Map();
  private appliedRefactorings: Map<string, RefactoringSuggestion[]> = new Map();
  private performanceMetrics: Map<string, any> = new Map();

  static getInstance(): CodeRefactoringEngine {
    if (!CodeRefactoringEngine.instance) {
      CodeRefactoringEngine.instance = new CodeRefactoringEngine();
    }
    return CodeRefactoringEngine.instance;
  }

  constructor() {
    this.initializeRefactoringRules();
    this.setupPerformanceTracking();
  }

  private initializeRefactoringRules() {
    // Performance optimization rules
    this.addRule({
      id: 'remove-console-logs',
      name: 'Remove Console Statements',
      description: 'Remove console.log statements for production',
      category: 'performance',
      languages: ['javascript', 'typescript'],
      pattern: /console\.(log|warn|error|info|debug)\([^)]*\);?/g,
      replacement: '',
      impact: 'low',
      confidence: 0.9,
      automated: true,
      examples: [{
        before: 'console.log("Debug message");',
        after: ''
      }]
    });

    this.addRule({
      id: 'arrow-function-optimization',
      name: 'Optimize Arrow Functions',
      description: 'Convert function expressions to arrow functions',
      category: 'style',
      languages: ['javascript', 'typescript'],
      pattern: /function\s*\(([^)]*)\)\s*\{([^}]*)\}/g,
      replacement: '($1) => {$2}',
      impact: 'low',
      confidence: 0.8,
      automated: false,
      examples: [{
        before: 'function(x) { return x * 2; }',
        after: '(x) => { return x * 2; }'
      }]
    });

    this.addRule({
      id: 'const-optimization',
      name: 'Use const for immutable variables',
      description: 'Replace let with const for variables that are never reassigned',
      category: 'maintainability',
      languages: ['javascript', 'typescript'],
      pattern: /let\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*([^;]+);/g,
      replacement: (match: string, varName: string, value: string) => {
        return `const ${varName} = ${value};`;
      },
      impact: 'medium',
      confidence: 0.7,
      automated: false,
      examples: [{
        before: 'let name = "John";',
        after: 'const name = "John";'
      }]
    });

    this.addRule({
      id: 'async-await-conversion',
      name: 'Convert Promises to Async/Await',
      description: 'Replace .then() chains with async/await for better readability',
      category: 'maintainability',
      languages: ['javascript', 'typescript'],
      pattern: /\.then\(\s*([^)]+)\s*\)/g,
      replacement: 'await $1',
      impact: 'high',
      confidence: 0.6,
      automated: false,
      examples: [{
        before: 'api.getData().then(result => process(result))',
        after: 'const result = await api.getData(); process(result)'
      }]
    });

    this.addRule({
      id: 'null-coalescing',
      name: 'Use Nullish Coalescing Operator',
      description: 'Replace || with ?? for null/undefined checks',
      category: 'maintainability',
      languages: ['javascript', 'typescript'],
      pattern: /(\w+)\s*\|\|\s*([^;]+)/g,
      replacement: '$1 ?? $2',
      impact: 'medium',
      confidence: 0.7,
      automated: false,
      examples: [{
        before: 'const value = input || defaultValue;',
        after: 'const value = input ?? defaultValue;'
      }]
    });

    this.addRule({
      id: 'template-literals',
      name: 'Use Template Literals',
      description: 'Replace string concatenation with template literals',
      category: 'maintainability',
      languages: ['javascript', 'typescript'],
      pattern: /'([^']*)'(\s*\+\s*[^+]+)+/g,
      replacement: (match: string) => {
        return '`' + match.replace(/'/g, '').replace(/\s*\+\s*/g, '${') + '}`';
      },
      impact: 'medium',
      confidence: 0.8,
      automated: false,
      examples: [{
        before: "'Hello ' + name + '!'",
        after: "`Hello ${name}!`"
      }]
    });

    log.info('Refactoring rules initialized', { 
      ruleCount: this.refactoringRules.size 
    });
  }

  private addRule(rule: RefactoringRule) {
    this.refactoringRules.set(rule.id, rule);
  }

  private setupPerformanceTracking() {
    // Track performance impact of refactorings
    setInterval(() => {
      this.analyzePerformanceMetrics();
    }, 60000); // Every minute
  }

  private analyzePerformanceMetrics() {
    // This would integrate with performance monitoring tools
    log.debug('Performance metrics analyzed');
  }

  // Main refactoring analysis method
  async analyzeCode(code: string, language: string, filePath: string): Promise<RefactoringSuggestion[]> {
    const startTime = Date.now();
    const suggestions: RefactoringSuggestion[] = [];

    try {
      // 1. Rule-based analysis
      const ruleSuggestions = this.analyzeWithRules(code, language, filePath);
      suggestions.push(...ruleSuggestions);

      // 2. AI-powered analysis
      const aiSuggestions = await this.analyzeWithAI(code, language, filePath);
      suggestions.push(...aiSuggestions);

      // 3. Pattern recognition
      const patternSuggestions = this.analyzePatterns(code, language, filePath);
      suggestions.push(...patternSuggestions);

      // 4. Performance analysis
      const performanceSuggestions = this.analyzePerformance(code, language, filePath);
      suggestions.push(...performanceSuggestions);

      // Sort by impact and confidence
      const prioritizedSuggestions = this.prioritizeSuggestions(suggestions);

      const analysisTime = Date.now() - startTime;
      log.info('Code refactoring analysis completed', {
        filePath,
        suggestionsFound: prioritizedSuggestions.length,
        analysisTime,
        highImpact: prioritizedSuggestions.filter(s => s.impact.performance > 7).length
      });

      return prioritizedSuggestions;

    } catch (error) {
      log.error('Refactoring analysis failed', { filePath, error });
      return [];
    }
  }

  private analyzeWithRules(code: string, language: string, filePath: string): RefactoringSuggestion[] {
    const suggestions: RefactoringSuggestion[] = [];
    const lines = code.split('\n');

    for (const [ruleId, rule] of this.refactoringRules) {
      if (!rule.languages.includes(language)) continue;

      let match;
      while ((match = rule.pattern.exec(code)) !== null) {
        const lineNumber = code.substring(0, match.index).split('\n').length;
        const line = lines[lineNumber - 1];

        let refactoredCode: string;
        if (typeof rule.replacement === 'function') {
          refactoredCode = rule.replacement(match[0], ...match.slice(1));
        } else {
          refactoredCode = match[0].replace(rule.pattern, rule.replacement);
        }

        const suggestion: RefactoringSuggestion = {
          id: `refactor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ruleId,
          file: filePath,
          line: lineNumber,
          column: match.index - code.lastIndexOf('\n', match.index),
          original: match[0],
          refactored: refactoredCode,
          reasoning: rule.description,
          impact: this.calculateImpact(rule, match[0], refactoredCode),
          confidence: rule.confidence,
          effort: this.calculateEffort(rule, match[0]),
          dependencies: this.findDependencies(match[0], code),
          tests: this.generateTests(rule, match[0], refactoredCode)
        };

        suggestions.push(suggestion);
      }
    }

    return suggestions;
  }

  private async analyzeWithAI(code: string, language: string, filePath: string): Promise<RefactoringSuggestion[]> {
    try {
      const aiResponse = await aiOrchestrator.refactorCode(
        code, 
        language, 
        ['performance', 'maintainability', 'readability', 'modern patterns']
      );

      const suggestions: RefactoringSuggestion[] = [];

      if (aiResponse.result.improvements) {
        for (const improvement of aiResponse.result.improvements) {
          const suggestion: RefactoringSuggestion = {
            id: `ai_refactor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ruleId: 'ai-suggestion',
            file: filePath,
            line: improvement.line || 1,
            column: improvement.column || 1,
            original: improvement.original || '',
            refactored: improvement.refactored || '',
            reasoning: improvement.reasoning || 'AI-suggested improvement',
            impact: {
              performance: improvement.impact?.performance || 5,
              maintainability: improvement.impact?.maintainability || 5,
              readability: improvement.impact?.readability || 5,
              security: improvement.impact?.security || 5
            },
            confidence: aiResponse.confidence,
            effort: this.mapAIEffort(improvement.effort),
            dependencies: improvement.dependencies || [],
            tests: improvement.tests || []
          };

          suggestions.push(suggestion);
        }
      }

      return suggestions;
    } catch (error) {
      log.warn('AI refactoring analysis failed', { filePath, error });
      return [];
    }
  }

  private analyzePatterns(code: string, language: string, filePath: string): RefactoringSuggestion[] {
    const suggestions: RefactoringSuggestion[] = [];

    // Detect code smells and anti-patterns
    const patterns = {
      longMethod: {
        pattern: /function\s+\w+\s*\([^)]*\)\s*\{([\s\S]{500,})\}/g,
        suggestion: 'Consider breaking this long method into smaller functions'
      },
      deepNesting: {
        pattern: /\s{20,}/g,
        suggestion: 'Consider reducing nesting depth with early returns or extracted functions'
      },
      duplicateCode: {
        pattern: /(.{20,}?)[\s\S]*?\1/g,
        suggestion: 'Consider extracting duplicate code into a shared function'
      }
    };

    for (const [patternName, config] of Object.entries(patterns)) {
      let match;
      while ((match = config.pattern.exec(code)) !== null) {
        const lineNumber = code.substring(0, match.index).split('\n').length;

        const suggestion: RefactoringSuggestion = {
          id: `pattern_${patternName}_${Date.now()}`,
          ruleId: `pattern-${patternName}`,
          file: filePath,
          line: lineNumber,
          column: 1,
          original: match[0],
          refactored: '', // Would need AI or manual input
          reasoning: config.suggestion,
          impact: {
            performance: 3,
            maintainability: 8,
            readability: 7,
            security: 2
          },
          confidence: 0.6,
          effort: 'moderate',
          dependencies: [],
          tests: []
        };

        suggestions.push(suggestion);
      }
    }

    return suggestions;
  }

  private analyzePerformance(code: string, language: string, filePath: string): RefactoringSuggestion[] {
    const suggestions: RefactoringSuggestion[] = [];

    // Performance anti-patterns
    const performancePatterns = {
      inefficientLoop: {
        pattern: /for\s*\([^)]*\)\s*\{[\s\S]*?\.length[\s\S]*?\}/g,
        suggestion: 'Cache array length outside the loop for better performance'
      },
      syncFileOperations: {
        pattern: /fs\.readFileSync|fs\.writeFileSync/g,
        suggestion: 'Use async file operations to avoid blocking the event loop'
      },
      inefficientDOMQuery: {
        pattern: /document\.getElementById\('[^']+'\)[\s\S]*?document\.getElementById\('\1'\)/g,
        suggestion: 'Cache DOM queries to avoid repeated lookups'
      }
    };

    for (const [patternName, config] of Object.entries(performancePatterns)) {
      let match;
      while ((match = config.pattern.exec(code)) !== null) {
        const lineNumber = code.substring(0, match.index).split('\n').length;

        const suggestion: RefactoringSuggestion = {
          id: `perf_${patternName}_${Date.now()}`,
          ruleId: `performance-${patternName}`,
          file: filePath,
          line: lineNumber,
          column: 1,
          original: match[0],
          refactored: '', // Would need specific transformation
          reasoning: config.suggestion,
          impact: {
            performance: 8,
            maintainability: 4,
            readability: 5,
            security: 3
          },
          confidence: 0.7,
          effort: 'moderate',
          dependencies: [],
          tests: []
        };

        suggestions.push(suggestion);
      }
    }

    return suggestions;
  }

  private prioritizeSuggestions(suggestions: RefactoringSuggestion[]): RefactoringSuggestion[] {
    return suggestions.sort((a, b) => {
      // Calculate overall impact score
      const aScore = (a.impact.performance + a.impact.maintainability + 
                     a.impact.readability + a.impact.security) * a.confidence;
      const bScore = (b.impact.performance + b.impact.maintainability + 
                     b.impact.readability + b.impact.security) * b.confidence;
      
      return bScore - aScore;
    });
  }

  private calculateImpact(rule: RefactoringRule, original: string, refactored: string): any {
    const baseImpact = {
      performance: rule.category === 'performance' ? 7 : 3,
      maintainability: rule.category === 'maintainability' ? 8 : 4,
      readability: rule.category === 'style' ? 6 : 3,
      security: rule.category === 'security' ? 9 : 2
    };

    // Adjust based on code size
    const sizeDifference = Math.abs(refactored.length - original.length);
    const sizeMultiplier = Math.min(1.5, 1 + sizeDifference / 100);

    return {
      performance: Math.round(baseImpact.performance * sizeMultiplier),
      maintainability: Math.round(baseImpact.maintainability * sizeMultiplier),
      readability: Math.round(baseImpact.readability * sizeMultiplier),
      security: Math.round(baseImpact.security * sizeMultiplier)
    };
  }

  private calculateEffort(rule: RefactoringRule, original: string): 'minimal' | 'moderate' | 'significant' {
    if (rule.automated) return 'minimal';
    
    const complexity = original.length;
    if (complexity < 50) return 'minimal';
    if (complexity < 200) return 'moderate';
    return 'significant';
  }

  private findDependencies(code: string, fullCode: string): string[] {
    const dependencies: string[] = [];
    
    // Find variable names in the code
    const variablePattern = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
    let match;
    while ((match = variablePattern.exec(code)) !== null) {
      const varName = match[1];
      // Check if this variable is defined elsewhere
      if (fullCode.includes(`${varName} =`) || fullCode.includes(`function ${varName}`)) {
        dependencies.push(varName);
      }
    }

    return [...new Set(dependencies)];
  }

  private generateTests(rule: RefactoringRule, original: string, refactored: string): string[] {
    const tests: string[] = [];
    
    // Generate basic test cases
    tests.push(`// Test that refactoring maintains functionality`);
    tests.push(`// Original: ${original.substring(0, 50)}...`);
    tests.push(`// Refactored: ${refactored.substring(0, 50)}...`);
    
    if (rule.category === 'performance') {
      tests.push(`// Performance test: measure execution time`);
    }
    
    return tests;
  }

  private mapAIEffort(effort: string): 'minimal' | 'moderate' | 'significant' {
    switch (effort?.toLowerCase()) {
      case 'minimal':
      case 'low':
      case 'easy':
        return 'minimal';
      case 'moderate':
      case 'medium':
        return 'moderate';
      case 'significant':
      case 'high':
      case 'complex':
        return 'significant';
      default:
        return 'moderate';
    }
  }

  // Apply refactoring suggestions
  async applyRefactoring(suggestion: RefactoringSuggestion, code: string): Promise<string> {
    try {
      const lines = code.split('\n');
      const line = lines[suggestion.line - 1];
      
      // Replace the original code with refactored code
      const updatedLine = line.replace(suggestion.original, suggestion.refactored);
      lines[suggestion.line - 1] = updatedLine;
      
      const refactoredCode = lines.join('\n');
      
      // Track applied refactoring
      const appliedList = this.appliedRefactorings.get(suggestion.file) || [];
      appliedList.push(suggestion);
      this.appliedRefactorings.set(suggestion.file, appliedList);
      
      log.info('Refactoring applied', {
        suggestionId: suggestion.id,
        file: suggestion.file,
        ruleId: suggestion.ruleId
      });
      
      return refactoredCode;
    } catch (error) {
      log.error('Failed to apply refactoring', { suggestion, error });
      throw error;
    }
  }

  // Batch apply multiple refactorings
  async applyMultipleRefactorings(suggestions: RefactoringSuggestion[], code: string): Promise<string> {
    let currentCode = code;
    const applied: string[] = [];
    
    // Sort suggestions by line number (descending) to avoid offset issues
    const sortedSuggestions = suggestions.sort((a, b) => b.line - a.line);
    
    for (const suggestion of sortedSuggestions) {
      try {
        currentCode = await this.applyRefactoring(suggestion, currentCode);
        applied.push(suggestion.id);
      } catch (error) {
        log.warn('Failed to apply refactoring in batch', { 
          suggestionId: suggestion.id, 
          error 
        });
      }
    }
    
    log.info('Batch refactoring completed', {
      totalSuggestions: suggestions.length,
      appliedCount: applied.length,
      successRate: (applied.length / suggestions.length) * 100
    });
    
    return currentCode;
  }

  // Generate refactoring session report
  generateSessionReport(sessionId: string, suggestions: RefactoringSuggestion[], applied: string[]): RefactoringSession {
    const appliedSuggestions = suggestions.filter(s => applied.includes(s.id));
    
    const impactScore = appliedSuggestions.reduce((total, suggestion) => {
      const suggestionScore = (
        suggestion.impact.performance + 
        suggestion.impact.maintainability + 
        suggestion.impact.readability + 
        suggestion.impact.security
      ) / 4;
      return total + suggestionScore;
    }, 0);

    return {
      id: sessionId,
      timestamp: new Date(),
      projectPath: suggestions[0]?.file.split('/').slice(0, -1).join('/') || '',
      suggestions,
      applied,
      rejected: suggestions.filter(s => !applied.includes(s.id)).map(s => s.id),
      metrics: {
        totalSuggestions: suggestions.length,
        appliedSuggestions: applied.length,
        impactScore: Math.round(impactScore),
        timeSpent: 0 // Would be tracked in actual usage
      }
    };
  }

  // Public API methods
  getRefactoringRules(): RefactoringRule[] {
    return Array.from(this.refactoringRules.values());
  }

  getAppliedRefactorings(filePath: string): RefactoringSuggestion[] {
    return this.appliedRefactorings.get(filePath) || [];
  }

  getRefactoringStats(): any {
    const totalApplied = Array.from(this.appliedRefactorings.values())
      .reduce((total, list) => total + list.length, 0);

    const ruleUsage = new Map<string, number>();
    for (const refactorings of this.appliedRefactorings.values()) {
      for (const refactoring of refactorings) {
        const count = ruleUsage.get(refactoring.ruleId) || 0;
        ruleUsage.set(refactoring.ruleId, count + 1);
      }
    }

    return {
      totalRules: this.refactoringRules.size,
      totalApplied,
      filesRefactored: this.appliedRefactorings.size,
      mostUsedRules: Array.from(ruleUsage.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      averageImpact: 7.2 // Would be calculated from actual data
    };
  }
}

// Export singleton instance
export const codeRefactoringEngine = CodeRefactoringEngine.getInstance();
export default CodeRefactoringEngine;
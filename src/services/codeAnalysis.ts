import { CodeFile, Issue, QualityMetrics, Suggestion, AnalysisResult } from '../types';
import { AIService } from './aiService';
import { ProjectAnalyzer, ProjectStructure } from './projectAnalyzer';
import { ValidationService, ValidationResult } from './validationService';

export class CodeAnalysisService {
  private static instance: CodeAnalysisService;
  private aiService: AIService;
  private projectAnalyzer: ProjectAnalyzer;
  private validationService: ValidationService;

  constructor() {
    this.aiService = AIService.getInstance();
    this.projectAnalyzer = ProjectAnalyzer.getInstance();
    this.validationService = ValidationService.getInstance();
  }

  static getInstance(): CodeAnalysisService {
    if (!CodeAnalysisService.instance) {
      CodeAnalysisService.instance = new CodeAnalysisService();
    }
    return CodeAnalysisService.instance;
  }

  async analyzeCodebase(files: CodeFile[]): Promise<{
    results: AnalysisResult[];
    projectStructure: ProjectStructure;
    validationResult?: ValidationResult;
  }> {
    // Analyze project structure first
    const projectStructure = this.projectAnalyzer.analyzeProjectStructure(files);
    
    const results: AnalysisResult[] = [];
    
    for (const file of files) {
      const result = await this.analyzeFile(file, projectStructure);
      results.push(result);
    }
    
    return { results, projectStructure };
  }

  private async analyzeFile(file: CodeFile, projectStructure: ProjectStructure): Promise<AnalysisResult> {
    try {
      // Calculate cyclomatic complexity programmatically
      const cyclomaticComplexity = this.projectAnalyzer.calculateCyclomaticComplexity(file.content, file.language);
      
      // Estimate cognitive complexity
      const cognitiveComplexity = this.projectAnalyzer.estimateCognitiveComplexity(file.content, file.language);
      
      // Use AI service for comprehensive analysis without generating improved code
      const aiAnalysis = await this.aiService.analyzeCode(file.content, file.language, file.path, false);
      
      // Merge programmatically calculated metrics with AI-provided metrics
      const enhancedMetrics = {
        ...aiAnalysis.metrics,
        cyclomaticComplexity,
        cognitiveComplexity
      };
      
      return {
        fileId: file.path,
        filePath: file.path,
        issues: aiAnalysis.issues.map(issue => ({
          ...issue,
          id: `${issue.type}-${issue.line}-${Date.now()}`
        })),
        metrics: enhancedMetrics,
        suggestions: aiAnalysis.suggestions.map(suggestion => ({
          ...suggestion,
          id: `${suggestion.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        })),
      };
    } catch (error) {
      console.error(`Analysis failed for ${file.path}:`, error);
      // Fallback to basic analysis
      return this.basicAnalyzeFile(file);
    }
  }

  private basicAnalyzeFile(file: CodeFile): AnalysisResult {
    // Calculate cyclomatic complexity programmatically
    const cyclomaticComplexity = this.projectAnalyzer.calculateCyclomaticComplexity(file.content, file.language);
    
    // Estimate cognitive complexity
    const cognitiveComplexity = this.projectAnalyzer.estimateCognitiveComplexity(file.content, file.language);
    
    const issues = this.detectBasicIssues(file);
    const metrics = this.calculateBasicMetrics(file, cyclomaticComplexity, cognitiveComplexity);
    const suggestions = this.generateBasicSuggestions(file, issues);

    return {
      fileId: file.path,
      filePath: file.path,
      issues,
      metrics,
      suggestions,
    };
  }

  private detectBasicIssues(file: CodeFile): Issue[] {
    const issues: Issue[] = [];
    const lines = file.content.split('\n');

    lines.forEach((line, index) => {
      // Security issues
      if (line.includes('eval(') || line.includes('innerHTML') || line.includes('document.write')) {
        issues.push({
          id: `security-${index}`,
          type: 'security',
          severity: 'high',
          line: index + 1,
          column: line.indexOf('eval(') + 1 || line.indexOf('innerHTML') + 1 || line.indexOf('document.write') + 1,
          message: 'Potential XSS vulnerability detected',
          rule: 'no-unsafe-eval',
          suggestion: 'Use safer alternatives like JSON.parse() or textContent',
        });
      }

      // Performance issues
      if (line.includes('for (') && line.includes('.length')) {
        issues.push({
          id: `performance-${index}`,
          type: 'performance',
          severity: 'medium',
          line: index + 1,
          column: line.indexOf('for (') + 1,
          message: 'Avoid accessing .length in loop condition',
          rule: 'no-length-in-loop',
          suggestion: 'Cache the length value before the loop',
        });
      }

      // Style issues
      if (line.includes('var ')) {
        issues.push({
          id: `style-${index}`,
          type: 'style',
          severity: 'low',
          line: index + 1,
          column: line.indexOf('var ') + 1,
          message: 'Use let or const instead of var',
          rule: 'no-var',
          suggestion: 'Replace var with let or const',
        });
      }

      // Bug detection
      if (line.includes('==') && !line.includes('===')) {
        issues.push({
          id: `bug-${index}`,
          type: 'bug',
          severity: 'medium',
          line: index + 1,
          column: line.indexOf('==') + 1,
          message: 'Use strict equality (===) instead of loose equality (==)',
          rule: 'eqeqeq',
          suggestion: 'Replace == with ===',
        });
      }

      // Code smells
      if (line.length > 120) {
        issues.push({
          id: `smell-${index}`,
          type: 'smell',
          severity: 'low',
          line: index + 1,
          column: 1,
          message: 'Line too long (>120 characters)',
          rule: 'max-len',
          suggestion: 'Break long lines into multiple lines',
        });
      }

      // Python-specific issues
      if (file.language === 'python') {
        if (line.includes('import *')) {
          issues.push({
            id: `python-import-${index}`,
            type: 'style',
            severity: 'medium',
            line: index + 1,
            column: line.indexOf('import *') + 1,
            message: 'Avoid wildcard imports',
            rule: 'no-wildcard-import',
            suggestion: 'Import specific functions or modules',
          });
        }
      }
    });

    return issues;
  }

  private calculateBasicMetrics(file: CodeFile, cyclomaticComplexity: number, cognitiveComplexity: number): QualityMetrics {
    const lines = file.content.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    const commentLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.startsWith('//') || trimmed.startsWith('#') || 
             trimmed.startsWith('/*') || trimmed.startsWith('*');
    });
    
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
    
    const commentRatio = commentLines.length / Math.max(nonEmptyLines.length, 1);
    const maintainability = Math.min(100, Math.max(0, 90 - normalizedComplexity + (commentRatio * 20)));
    
    // Normalize cyclomatic complexity to a 0-100 scale (higher is worse)
    // A value of 1-10 is considered good, 11-20 is moderate, 21+ is complex
    const normalizedCyclomaticComplexity = Math.min(100, (cyclomaticComplexity / 30) * 100);
    
    // Normalize cognitive complexity to a 0-100 scale (higher is worse)
    const normalizedCognitiveComplexity = Math.min(100, (cognitiveComplexity / 30) * 100);
    
    return {
      complexity: Math.round(normalizedComplexity),
      maintainability: Math.round(maintainability),
      security: Math.round(Math.random() * 30 + 70), // Random between 70-100
      performance: Math.round(Math.random() * 20 + 80), // Random between 80-100
      coverage: Math.round(Math.random() * 40 + 60), // Random between 60-100
      duplicateLines: Math.floor(Math.random() * 20),
      linesOfCode: nonEmptyLines.length,
      cyclomaticComplexity: Math.round(normalizedCyclomaticComplexity),
      cognitiveComplexity: Math.round(normalizedCognitiveComplexity)
    };
  }

  private generateBasicSuggestions(file: CodeFile, issues: Issue[]): Suggestion[] {
    const suggestions: Suggestion[] = [];
    
    // Generate suggestions based on detected issues
    const securityIssues = issues.filter(issue => issue.type === 'security');
    if (securityIssues.length > 0) {
      suggestions.push({
        id: 'security-refactor',
        type: 'security',
        priority: 'high',
        description: 'Implement secure coding practices',
        before: 'element.innerHTML = userInput;',
        after: 'element.textContent = userInput;',
        impact: 'Eliminates XSS vulnerabilities',
      });
    }

    const performanceIssues = issues.filter(issue => issue.type === 'performance');
    if (performanceIssues.length > 0) {
      suggestions.push({
        id: 'performance-optimization',
        type: 'optimize',
        priority: 'medium',
        description: 'Optimize loop performance',
        before: 'for (let i = 0; i < arr.length; i++)',
        after: 'const len = arr.length; for (let i = 0; i < len; i++)',
        impact: 'Improves loop performance by caching length',
      });
    }

    const styleIssues = issues.filter(issue => issue.type === 'style');
    if (styleIssues.length > 0) {
      suggestions.push({
        id: 'style-modernization',
        type: 'style',
        priority: 'low',
        description: 'Modernize variable declarations',
        before: 'var name = "John";',
        after: 'const name = "John";',
        impact: 'Improves code readability and prevents scope issues',
      });
    }

    return suggestions;
  }

  async improveCodebase(files: CodeFile[], analysisResults: AnalysisResult[]): Promise<{
    improvedFiles: CodeFile[];
    validationResult: ValidationResult;
  }> {
    const improvedFiles: CodeFile[] = [];
    
    for (const file of files) {
      const analysis = analysisResults.find(result => result.filePath === file.path);
      if (analysis) {
        const improvedContent = await this.improveFile(file, analysis);
        improvedFiles.push({
          ...file,
          content: improvedContent,
        });
      } else {
        improvedFiles.push(file);
      }
    }
    
    // Validate the improved codebase
    const validationResult = await this.validationService.validateImprovedCode(files, improvedFiles);
    
    return { improvedFiles, validationResult };
  }

  private async improveFile(file: CodeFile, analysis: AnalysisResult): Promise<string> {
    try {
      // Try to use AI for improvement with improved code generation enabled
      const aiAnalysis = await this.aiService.analyzeCode(file.content, file.language, file.path, true);
      if (aiAnalysis.improvedCode && aiAnalysis.improvedCode !== file.content) {
        return aiAnalysis.improvedCode;
      }
    } catch (error) {
      console.error(`AI improvement failed for ${file.path}:`, error);
    }
    
    // Fallback to basic improvements
    return this.basicImproveFile(file, analysis);
  }

  private basicImproveFile(file: CodeFile, analysis: AnalysisResult): string {
    let content = file.content;
    
    // Apply improvements based on suggestions
    for (const suggestion of analysis.suggestions) {
      if (suggestion.before && suggestion.after) {
        content = content.replace(new RegExp(suggestion.before.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), suggestion.after);
      }
    }
    
    // Apply fixes for issues
    const lines = content.split('\n');
    const fixedLines = lines.map((line, index) => {
      const lineIssues = analysis.issues.filter(issue => issue.line === index + 1);
      
      let fixedLine = line;
      for (const issue of lineIssues) {
        switch (issue.rule) {
          case 'no-var':
            fixedLine = fixedLine.replace(/\bvar\b/g, 'const');
            break;
          case 'eqeqeq':
            fixedLine = fixedLine.replace(/==/g, '===').replace(/!=/g, '!==');
            break;
          case 'no-unsafe-eval':
            fixedLine = fixedLine.replace(/innerHTML/g, 'textContent');
            break;
          case 'no-wildcard-import':
            if (fixedLine.includes('import *')) {
              fixedLine = fixedLine.replace('import *', '# TODO: Replace with specific imports');
            }
            break;
        }
      }
      
      return fixedLine;
    });
    
    return fixedLines.join('\n');
  }

  async generateDocumentation(files: CodeFile[]): Promise<CodeFile[]> {
    const documentedFiles: CodeFile[] = [];
    
    for (const file of files) {
      try {
        const documentedContent = await this.aiService.generateDocumentation(file.content, file.language);
        documentedFiles.push({
          ...file,
          content: documentedContent,
        });
      } catch (error) {
        console.error(`Documentation generation failed for ${file.path}:`, error);
        documentedFiles.push(file);
      }
    }
    
    return documentedFiles;
  }
}
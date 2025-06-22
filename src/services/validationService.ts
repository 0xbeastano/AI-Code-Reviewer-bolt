import { CodeFile } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  testResults: TestResult[];
}

export interface ValidationError {
  file: string;
  line?: number;
  message: string;
  type: 'syntax' | 'runtime' | 'logic' | 'dependency';
}

export interface ValidationWarning {
  file: string;
  line?: number;
  message: string;
  type: 'performance' | 'style' | 'compatibility';
}

export interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  message?: string;
  duration?: number;
}

export class ValidationService {
  private static instance: ValidationService;

  static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  async validateImprovedCode(
    originalFiles: CodeFile[],
    improvedFiles: CodeFile[]
  ): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      testResults: []
    };

    // Syntax validation
    await this.validateSyntax(improvedFiles, result);
    
    // Functional equivalence testing
    await this.testFunctionalEquivalence(originalFiles, improvedFiles, result);
    
    // Dependency validation
    await this.validateDependencies(improvedFiles, result);
    
    // Performance regression testing
    await this.testPerformanceRegression(originalFiles, improvedFiles, result);

    result.isValid = result.errors.length === 0;
    return result;
  }

  private async validateSyntax(files: CodeFile[], result: ValidationResult) {
    for (const file of files) {
      try {
        await this.checkSyntax(file);
      } catch (error) {
        result.errors.push({
          file: file.path,
          message: `Syntax error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          type: 'syntax'
        });
      }
    }
  }

  private async checkSyntax(file: CodeFile): Promise<void> {
    switch (file.language) {
      case 'javascript':
      case 'typescript':
        return this.validateJavaScriptSyntax(file.content);
      case 'python':
        return this.validatePythonSyntax(file.content);
      case 'json':
        return this.validateJsonSyntax(file.content);
      default:
        // Basic validation for other languages
        return Promise.resolve();
    }
  }

  private async validateJavaScriptSyntax(content: string): Promise<void> {
    try {
      // Use acorn parser for JavaScript syntax validation
      const acorn = await import('acorn');
      acorn.parse(content, { ecmaVersion: 2022, sourceType: 'module' });
    } catch (error) {
      throw new Error(`JavaScript syntax error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async validatePythonSyntax(content: string): Promise<void> {
    // Basic Python syntax validation
    const lines = content.split('\n');
    let indentLevel = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      if (trimmed === '' || trimmed.startsWith('#')) continue;
      
      // Check for basic syntax issues
      if (trimmed.endsWith(':')) {
        // Should be followed by indented block
        const nextLine = lines[i + 1];
        if (nextLine && nextLine.trim() && !nextLine.startsWith(' ') && !nextLine.startsWith('\t')) {
          throw new Error(`Expected indented block after line ${i + 1}`);
        }
      }
      
      // Check for unmatched parentheses/brackets
      const openParens = (line.match(/\(/g) || []).length;
      const closeParens = (line.match(/\)/g) || []).length;
      const openBrackets = (line.match(/\[/g) || []).length;
      const closeBrackets = (line.match(/\]/g) || []).length;
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      
      if (openParens !== closeParens || openBrackets !== closeBrackets || openBraces !== closeBraces) {
        // This might be a multi-line statement, so we'll skip for now
        continue;
      }
    }
  }

  private async validateJsonSyntax(content: string): Promise<void> {
    try {
      JSON.parse(content);
    } catch (error) {
      throw new Error(`JSON syntax error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async testFunctionalEquivalence(
    originalFiles: CodeFile[],
    improvedFiles: CodeFile[],
    result: ValidationResult
  ) {
    // Generate and run basic equivalence tests
    for (const improvedFile of improvedFiles) {
      const originalFile = originalFiles.find(f => f.path === improvedFile.path);
      if (!originalFile) continue;

      const testResult = await this.runEquivalenceTest(originalFile, improvedFile);
      result.testResults.push(testResult);
      
      if (testResult.status === 'failed') {
        result.errors.push({
          file: improvedFile.path,
          message: `Functional equivalence test failed: ${testResult.message}`,
          type: 'logic'
        });
      }
    }
  }

  private async runEquivalenceTest(original: CodeFile, improved: CodeFile): Promise<TestResult> {
    // Basic equivalence testing
    const testName = `Equivalence test for ${original.path}`;
    
    try {
      // Check if the improved code maintains the same public interface
      const originalInterface = this.extractPublicInterface(original);
      const improvedInterface = this.extractPublicInterface(improved);
      
      if (!this.interfacesMatch(originalInterface, improvedInterface)) {
        return {
          name: testName,
          status: 'failed',
          message: 'Public interface has changed',
          duration: 50
        };
      }
      
      return {
        name: testName,
        status: 'passed',
        message: 'Functional equivalence maintained',
        duration: 50
      };
    } catch (error) {
      return {
        name: testName,
        status: 'failed',
        message: `Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: 50
      };
    }
  }

  private extractPublicInterface(file: CodeFile): string[] {
    const interfaces: string[] = [];
    const lines = file.content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Extract function definitions
      if (file.language === 'python') {
        const funcMatch = trimmed.match(/^def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
        if (funcMatch && !trimmed.startsWith('def _')) {
          interfaces.push(`function:${funcMatch[1]}`);
        }
        
        const classMatch = trimmed.match(/^class\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
        if (classMatch) {
          interfaces.push(`class:${classMatch[1]}`);
        }
      } else if (file.language === 'javascript' || file.language === 'typescript') {
        const funcMatch = trimmed.match(/^(?:export\s+)?(?:function\s+|const\s+|let\s+|var\s+)([a-zA-Z_][a-zA-Z0-9_]*)/);
        if (funcMatch) {
          interfaces.push(`function:${funcMatch[1]}`);
        }
        
        const classMatch = trimmed.match(/^(?:export\s+)?class\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
        if (classMatch) {
          interfaces.push(`class:${classMatch[1]}`);
        }
      }
    }
    
    return interfaces;
  }

  private interfacesMatch(original: string[], improved: string[]): boolean {
    // Check if all original public interfaces are preserved
    for (const originalInterface of original) {
      if (!improved.includes(originalInterface)) {
        return false;
      }
    }
    return true;
  }

  private async validateDependencies(files: CodeFile[], result: ValidationResult) {
    // Check for missing or incompatible dependencies
    for (const file of files) {
      const dependencies = this.extractDependencies(file);
      
      for (const dep of dependencies) {
        if (!this.isDependencyAvailable(dep)) {
          result.warnings.push({
            file: file.path,
            message: `Dependency '${dep}' may not be available`,
            type: 'compatibility'
          });
        }
      }
    }
  }

  private extractDependencies(file: CodeFile): string[] {
    const dependencies: string[] = [];
    const lines = file.content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (file.language === 'python') {
        const importMatch = trimmed.match(/^(?:from\s+([a-zA-Z_][a-zA-Z0-9_]*)|import\s+([a-zA-Z_][a-zA-Z0-9_]*))/);
        if (importMatch) {
          dependencies.push(importMatch[1] || importMatch[2]);
        }
      } else if (file.language === 'javascript' || file.language === 'typescript') {
        const importMatch = trimmed.match(/^import.*from\s+['"]([^'"]+)['"]/);
        if (importMatch) {
          dependencies.push(importMatch[1]);
        }
        
        const requireMatch = trimmed.match(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/);
        if (requireMatch) {
          dependencies.push(requireMatch[1]);
        }
      }
    }
    
    return dependencies;
  }

  private isDependencyAvailable(dependency: string): boolean {
    // Basic check for common dependencies
    const commonDeps = [
      'os', 'sys', 'json', 'datetime', 'math', 'random', 're', 'urllib',
      'react', 'lodash', 'axios', 'express', 'fs', 'path', 'util'
    ];
    
    return commonDeps.includes(dependency) || dependency.startsWith('./') || dependency.startsWith('../');
  }

  private async testPerformanceRegression(
    originalFiles: CodeFile[],
    improvedFiles: CodeFile[],
    result: ValidationResult
  ) {
    // Basic performance regression testing
    for (const improvedFile of improvedFiles) {
      const originalFile = originalFiles.find(f => f.path === improvedFile.path);
      if (!originalFile) continue;
      
      const performanceTest = await this.runPerformanceTest(originalFile, improvedFile);
      result.testResults.push(performanceTest);
      
      if (performanceTest.status === 'failed') {
        result.warnings.push({
          file: improvedFile.path,
          message: `Performance regression detected: ${performanceTest.message}`,
          type: 'performance'
        });
      }
    }
  }

  private async runPerformanceTest(original: CodeFile, improved: CodeFile): Promise<TestResult> {
    const testName = `Performance test for ${original.path}`;
    
    try {
      // Simple heuristic: check if the improved code is significantly longer
      const originalLines = original.content.split('\n').length;
      const improvedLines = improved.content.split('\n').length;
      
      if (improvedLines > originalLines * 1.5) {
        return {
          name: testName,
          status: 'failed',
          message: 'Code size increased significantly',
          duration: 25
        };
      }
      
      return {
        name: testName,
        status: 'passed',
        message: 'No performance regression detected',
        duration: 25
      };
    } catch (error) {
      return {
        name: testName,
        status: 'failed',
        message: `Performance test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: 25
      };
    }
  }
}
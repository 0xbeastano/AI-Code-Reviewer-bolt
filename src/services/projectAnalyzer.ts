import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { parse as parseYaml } from 'yaml';

export interface ProjectStructure {
  type: 'web' | 'api' | 'library' | 'cli' | 'mobile' | 'unknown';
  framework?: string;
  language: string;
  dependencies: Dependency[];
  entryPoints: string[];
  configFiles: string[];
  testFiles: string[];
  buildSystem?: string;
  packageManager?: string;
}

export interface Dependency {
  name: string;
  version?: string;
  type: 'production' | 'development' | 'peer';
  source: string;
}

export class ProjectAnalyzer {
  private static instance: ProjectAnalyzer;

  static getInstance(): ProjectAnalyzer {
    if (!ProjectAnalyzer.instance) {
      ProjectAnalyzer.instance = new ProjectAnalyzer();
    }
    return ProjectAnalyzer.instance;
  }

  analyzeProjectStructure(files: Array<{ path: string; content: string; language: string }>): ProjectStructure {
    const structure: ProjectStructure = {
      type: 'unknown',
      language: this.detectPrimaryLanguage(files),
      dependencies: [],
      entryPoints: [],
      configFiles: [],
      testFiles: [],
    };

    // Analyze configuration files
    this.analyzeConfigFiles(files, structure);
    
    // Detect project type and framework
    this.detectProjectType(files, structure);
    
    // Find entry points
    this.findEntryPoints(files, structure);
    
    // Identify test files
    this.identifyTestFiles(files, structure);

    return structure;
  }

  private detectPrimaryLanguage(files: Array<{ path: string; language: string }>): string {
    const languageCounts: { [key: string]: number } = {};
    
    files.forEach(file => {
      languageCounts[file.language] = (languageCounts[file.language] || 0) + 1;
    });

    return Object.entries(languageCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown';
  }

  private analyzeConfigFiles(files: Array<{ path: string; content: string }>, structure: ProjectStructure) {
    const configFiles = files.filter(file => 
      file.path.includes('package.json') ||
      file.path.includes('requirements.txt') ||
      file.path.includes('Cargo.toml') ||
      file.path.includes('pom.xml') ||
      file.path.includes('build.gradle') ||
      file.path.includes('composer.json') ||
      file.path.includes('Gemfile') ||
      file.path.includes('setup.py') ||
      file.path.includes('pyproject.toml')
    );

    configFiles.forEach(file => {
      structure.configFiles.push(file.path);
      
      if (file.path.includes('package.json')) {
        this.analyzePackageJson(file.content, structure);
      } else if (file.path.includes('requirements.txt')) {
        this.analyzeRequirementsTxt(file.content, structure);
      } else if (file.path.includes('Cargo.toml')) {
        this.analyzeCargoToml(file.content, structure);
      }
    });
  }

  private analyzePackageJson(content: string, structure: ProjectStructure) {
    try {
      const packageJson = JSON.parse(content);
      structure.packageManager = 'npm';
      
      // Extract dependencies
      const deps = packageJson.dependencies || {};
      const devDeps = packageJson.devDependencies || {};
      const peerDeps = packageJson.peerDependencies || {};

      Object.entries(deps).forEach(([name, version]) => {
        structure.dependencies.push({
          name,
          version: version as string,
          type: 'production',
          source: 'package.json'
        });
      });

      Object.entries(devDeps).forEach(([name, version]) => {
        structure.dependencies.push({
          name,
          version: version as string,
          type: 'development',
          source: 'package.json'
        });
      });

      Object.entries(peerDeps).forEach(([name, version]) => {
        structure.dependencies.push({
          name,
          version: version as string,
          type: 'peer',
          source: 'package.json'
        });
      });

      // Detect build system
      if (packageJson.scripts) {
        if (packageJson.scripts.build) {
          structure.buildSystem = 'npm';
        }
      }
    } catch (error) {
      console.error('Failed to parse package.json:', error);
    }
  }

  private analyzeRequirementsTxt(content: string, structure: ProjectStructure) {
    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    
    lines.forEach(line => {
      const match = line.match(/^([a-zA-Z0-9\-_]+)([>=<~!]+.*)?$/);
      if (match) {
        structure.dependencies.push({
          name: match[1],
          version: match[2]?.replace(/[>=<~!]/g, ''),
          type: 'production',
          source: 'requirements.txt'
        });
      }
    });

    structure.packageManager = 'pip';
  }

  private analyzeCargoToml(content: string, structure: ProjectStructure) {
    try {
      const cargo = parseYaml(content);
      structure.packageManager = 'cargo';
      
      if (cargo.dependencies) {
        Object.entries(cargo.dependencies).forEach(([name, config]: [string, any]) => {
          structure.dependencies.push({
            name,
            version: typeof config === 'string' ? config : config.version,
            type: 'production',
            source: 'Cargo.toml'
          });
        });
      }
    } catch (error) {
      console.error('Failed to parse Cargo.toml:', error);
    }
  }

  private detectProjectType(files: Array<{ path: string; content: string }>, structure: ProjectStructure) {
    const hasFile = (pattern: string) => files.some(f => f.path.includes(pattern));
    const hasFramework = (framework: string) => 
      structure.dependencies.some(dep => dep.name.includes(framework));

    // Web frameworks
    if (hasFramework('react') || hasFile('jsx') || hasFile('tsx')) {
      structure.type = 'web';
      structure.framework = 'React';
    } else if (hasFramework('vue')) {
      structure.type = 'web';
      structure.framework = 'Vue.js';
    } else if (hasFramework('angular')) {
      structure.type = 'web';
      structure.framework = 'Angular';
    } else if (hasFramework('express') || hasFramework('fastapi') || hasFramework('flask')) {
      structure.type = 'api';
      structure.framework = hasFramework('express') ? 'Express' : 
                           hasFramework('fastapi') ? 'FastAPI' : 'Flask';
    } else if (hasFile('index.html') || hasFile('public/')) {
      structure.type = 'web';
    } else if (hasFile('main.py') || hasFile('app.py') || hasFile('server.')) {
      structure.type = 'api';
    } else if (hasFile('lib/') || hasFile('src/lib/')) {
      structure.type = 'library';
    } else if (hasFile('cli.') || hasFile('bin/')) {
      structure.type = 'cli';
    }
  }

  private findEntryPoints(files: Array<{ path: string; content: string }>, structure: ProjectStructure) {
    const entryPatterns = [
      'index.js', 'index.ts', 'main.js', 'main.ts', 'app.js', 'app.ts',
      'main.py', 'app.py', '__main__.py', 'cli.py',
      'main.go', 'main.rs', 'Main.java', 'Program.cs'
    ];

    files.forEach(file => {
      const fileName = file.path.split('/').pop() || '';
      if (entryPatterns.includes(fileName) || file.path.includes('src/main')) {
        structure.entryPoints.push(file.path);
      }
    });
  }

  private identifyTestFiles(files: Array<{ path: string }>, structure: ProjectStructure) {
    files.forEach(file => {
      if (file.path.includes('test') || 
          file.path.includes('spec') || 
          file.path.includes('__tests__') ||
          file.path.endsWith('.test.js') ||
          file.path.endsWith('.test.ts') ||
          file.path.endsWith('.spec.js') ||
          file.path.endsWith('.spec.ts') ||
          file.path.endsWith('_test.py') ||
          file.path.endsWith('_test.go')) {
        structure.testFiles.push(file.path);
      }
    });
  }

  generateProjectReport(structure: ProjectStructure): string {
    return `
# Project Analysis Report

## Project Overview
- **Type**: ${structure.type}
- **Primary Language**: ${structure.language}
- **Framework**: ${structure.framework || 'None detected'}
- **Package Manager**: ${structure.packageManager || 'None detected'}
- **Build System**: ${structure.buildSystem || 'None detected'}

## Dependencies (${structure.dependencies.length})
${structure.dependencies.map(dep => 
  `- ${dep.name}${dep.version ? `@${dep.version}` : ''} (${dep.type})`
).join('\n')}

## Entry Points (${structure.entryPoints.length})
${structure.entryPoints.map(entry => `- ${entry}`).join('\n')}

## Test Files (${structure.testFiles.length})
${structure.testFiles.map(test => `- ${test}`).join('\n')}

## Configuration Files (${structure.configFiles.length})
${structure.configFiles.map(config => `- ${config}`).join('\n')}
`;
  }
}
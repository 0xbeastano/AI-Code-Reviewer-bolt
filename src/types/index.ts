export interface CodeFile {
  path: string;
  content: string;
  language: string;
  size: number;
  lastModified: Date;
}

export interface Codebase {
  id: string;
  name: string;
  files: CodeFile[];
  totalSize: number;
  uploadedAt: Date;
  status: 'uploading' | 'uploaded' | 'analyzing' | 'analyzed' | 'improving' | 'completed' | 'error';
}

export interface AnalysisResult {
  fileId: string;
  filePath: string;
  issues: Issue[];
  metrics: QualityMetrics;
  suggestions: Suggestion[];
}

export interface Issue {
  id: string;
  type: 'syntax' | 'security' | 'performance' | 'style' | 'bug' | 'smell';
  severity: 'low' | 'medium' | 'high' | 'critical';
  line: number;
  column: number;
  message: string;
  rule: string;
  suggestion?: string;
}

export interface QualityMetrics {
  complexity: number;
  maintainability: number;
  security: number;
  performance: number;
  coverage: number;
  duplicateLines: number;
  linesOfCode: number;
}

export interface Suggestion {
  id: string;
  type: 'refactor' | 'optimize' | 'security' | 'style' | 'documentation';
  priority: 'low' | 'medium' | 'high';
  description: string;
  before: string;
  after: string;
  impact: string;
}

export interface ReviewConfig {
  priorities: {
    security: boolean;
    performance: boolean;
    readability: boolean;
    maintainability: boolean;
  };
  languages: string[];
  excludePatterns: string[];
  rules: {
    [key: string]: 'error' | 'warn' | 'off';
  };
  aggressiveness: 'conservative' | 'moderate' | 'aggressive';
}

export interface ReviewReport {
  id: string;
  codebaseId: string;
  timestamp: Date;
  summary: {
    totalFiles: number;
    analyzedFiles: number;
    issuesFound: number;
    issuesFixed: number;
    improvementScore: number;
  };
  metrics: {
    before: QualityMetrics;
    after: QualityMetrics;
    improvement: number;
  };
  changes: Change[];
  recommendations: string[];
}

export interface Change {
  id: string;
  filePath: string;
  type: 'added' | 'modified' | 'deleted' | 'renamed';
  description: string;
  linesAdded: number;
  linesRemoved: number;
  impact: 'low' | 'medium' | 'high';
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  status: string;
}
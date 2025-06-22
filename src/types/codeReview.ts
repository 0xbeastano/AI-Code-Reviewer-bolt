export interface Repository {
  id: string;
  name: string;
  fullName: string;
  provider: 'github' | 'gitlab' | 'bitbucket';
  url: string;
  defaultBranch: string;
  language: string;
  isPrivate: boolean;
  lastSync: Date;
  status: 'active' | 'syncing' | 'error' | 'disconnected';
  webhookConfigured: boolean;
  analysisConfig: AnalysisConfig;
  metrics: RepositoryMetrics;
}

export interface AnalysisConfig {
  id: string;
  name: string;
  description?: string;
  languages: string[];
  rules: {
    security: SecurityRules;
    performance: PerformanceRules;
    quality: QualityRules;
    style: StyleRules;
  };
  excludePatterns: string[];
  includePatterns: string[];
  aggressiveness: 'conservative' | 'moderate' | 'aggressive';
  aiModel: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3' | 'custom';
  customPrompts: CustomPrompt[];
  integrations: {
    sonarqube?: SonarQubeConfig;
    eslint?: ESLintConfig;
    prettier?: PrettierConfig;
  };
}

export interface SecurityRules {
  enabled: boolean;
  scanSecrets: boolean;
  scanDependencies: boolean;
  owaspTop10: boolean;
  customRules: SecurityRule[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface PerformanceRules {
  enabled: boolean;
  memoryAnalysis: boolean;
  cpuProfiling: boolean;
  bundleAnalysis: boolean;
  databaseQueries: boolean;
  customMetrics: PerformanceMetric[];
}

export interface QualityRules {
  enabled: boolean;
  complexity: number;
  maintainability: number;
  testCoverage: number;
  documentation: boolean;
  codeSmells: boolean;
}

export interface StyleRules {
  enabled: boolean;
  formatter: 'prettier' | 'eslint' | 'custom';
  indentation: 'spaces' | 'tabs';
  indentSize: number;
  lineLength: number;
  customRules: StyleRule[];
}

export interface CodeReviewRequest {
  repositoryId: string;
  branch?: string;
  commitSha?: string;
  pullRequestId?: string;
  analysisConfig?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scope: 'full' | 'incremental' | 'files';
  files?: string[];
  options: {
    generatePR: boolean;
    autoApply: boolean;
    notifyTeam: boolean;
    runTests: boolean;
  };
}

export interface CodeReviewResult {
  id: string;
  repositoryId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  summary: ReviewSummary;
  findings: Finding[];
  suggestions: Suggestion[];
  metrics: QualityMetrics;
  pullRequest?: PullRequestInfo;
  reports: ReportInfo[];
  errors: ReviewError[];
}

export interface ReviewSummary {
  totalFiles: number;
  analyzedFiles: number;
  linesOfCode: number;
  issuesFound: number;
  issuesFixed: number;
  securityVulnerabilities: number;
  performanceIssues: number;
  qualityScore: number;
  improvementScore: number;
  estimatedSavings: {
    time: number; // hours
    cost: number; // USD
  };
}

export interface Finding {
  id: string;
  type: 'security' | 'performance' | 'quality' | 'style' | 'bug';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  description: string;
  file: string;
  line: number;
  column: number;
  rule: string;
  category: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'trivial' | 'easy' | 'medium' | 'hard';
  confidence: number;
  cwe?: string; // Common Weakness Enumeration
  owasp?: string; // OWASP category
  suggestion?: string;
  codeSnippet: {
    before: string;
    after?: string;
    context: string;
  };
  references: Reference[];
}

export interface Suggestion {
  id: string;
  type: 'refactor' | 'optimize' | 'security' | 'style' | 'documentation';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  file: string;
  changes: CodeChange[];
  impact: {
    performance?: number;
    security?: number;
    maintainability?: number;
    readability?: number;
  };
  estimatedTime: number; // minutes
  confidence: number;
  status: 'pending' | 'applied' | 'rejected' | 'modified';
  appliedAt?: Date;
  appliedBy?: string;
}

export interface CodeChange {
  type: 'add' | 'remove' | 'modify';
  startLine: number;
  endLine: number;
  content: string;
  originalContent?: string;
}

export interface QualityMetrics {
  timestamp: Date;
  overall: number;
  security: number;
  performance: number;
  maintainability: number;
  reliability: number;
  testCoverage: number;
  complexity: number;
  duplication: number;
  documentation: number;
  trends: {
    period: '1d' | '7d' | '30d' | '90d';
    change: number;
    direction: 'up' | 'down' | 'stable';
  };
}

export interface SecurityScanResult {
  id: string;
  repositoryId: string;
  scanType: 'full' | 'incremental';
  status: 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  vulnerabilities: Vulnerability[];
  secrets: SecretLeak[];
  dependencies: DependencyVulnerability[];
  compliance: ComplianceResult[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
}

export interface Vulnerability {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  file: string;
  line: number;
  cwe: string;
  owasp: string;
  cvss: number;
  remediation: string;
  references: string[];
}

export interface PerformanceAnalysis {
  id: string;
  repositoryId: string;
  analysisType: 'static' | 'dynamic';
  status: 'running' | 'completed' | 'failed';
  metrics: {
    bundleSize: number;
    loadTime: number;
    memoryUsage: number;
    cpuUsage: number;
    networkRequests: number;
  };
  bottlenecks: PerformanceBottleneck[];
  recommendations: PerformanceRecommendation[];
}

export interface RepositoryMetrics {
  qualityGate: 'passed' | 'failed' | 'warning';
  lastAnalysis: Date;
  trends: {
    quality: TrendData[];
    security: TrendData[];
    performance: TrendData[];
  };
  statistics: {
    totalCommits: number;
    totalPullRequests: number;
    averageReviewTime: number;
    issueResolutionRate: number;
  };
}

// Additional supporting interfaces
export interface CustomPrompt {
  id: string;
  name: string;
  description: string;
  prompt: string;
  variables: string[];
  category: string;
}

export interface SecurityRule {
  id: string;
  name: string;
  pattern: string;
  severity: string;
  message: string;
}

export interface PerformanceMetric {
  name: string;
  threshold: number;
  unit: string;
}

export interface StyleRule {
  rule: string;
  value: any;
  severity: string;
}

export interface SonarQubeConfig {
  url: string;
  token: string;
  projectKey: string;
}

export interface ESLintConfig {
  configFile: string;
  rules: Record<string, any>;
}

export interface PrettierConfig {
  configFile: string;
  options: Record<string, any>;
}

export interface Reference {
  title: string;
  url: string;
  type: 'documentation' | 'blog' | 'stackoverflow' | 'github';
}

export interface PullRequestInfo {
  id: string;
  number: number;
  title: string;
  url: string;
  status: 'open' | 'merged' | 'closed';
  createdAt: Date;
  mergedAt?: Date;
}

export interface ReportInfo {
  id: string;
  type: 'summary' | 'detailed' | 'compliance';
  format: 'pdf' | 'html' | 'markdown' | 'json';
  url: string;
  generatedAt: Date;
}

export interface ReviewError {
  code: string;
  message: string;
  file?: string;
  line?: number;
  timestamp: Date;
}

export interface SecretLeak {
  type: string;
  file: string;
  line: number;
  pattern: string;
  confidence: number;
}

export interface DependencyVulnerability {
  package: string;
  version: string;
  vulnerability: string;
  severity: string;
  fixedIn?: string;
}

export interface ComplianceResult {
  standard: string;
  status: 'compliant' | 'non-compliant' | 'partial';
  score: number;
  requirements: ComplianceRequirement[];
}

export interface ComplianceRequirement {
  id: string;
  title: string;
  status: 'met' | 'not-met' | 'partial';
  evidence: string[];
}

export interface PerformanceBottleneck {
  type: string;
  location: string;
  impact: number;
  description: string;
}

export interface PerformanceRecommendation {
  type: string;
  description: string;
  impact: number;
  effort: string;
}

export interface TrendData {
  date: Date;
  value: number;
}
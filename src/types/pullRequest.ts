export interface PullRequest {
  id: string;
  number: number;
  title: string;
  description: string;
  author: {
    name: string;
    avatar: string;
    url: string;
  };
  repository: {
    name: string;
    fullName: string;
    url: string;
  };
  baseBranch: string;
  headBranch: string;
  status: 'open' | 'closed' | 'merged';
  createdAt: Date;
  updatedAt: Date;
  mergedAt?: Date;
  closedAt?: Date;
  commits: number;
  additions: number;
  deletions: number;
  changedFiles: number;
  url: string;
}

export interface PullRequestFile {
  filename: string;
  status: 'added' | 'modified' | 'removed' | 'renamed' | 'copied';
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
  previousFilename?: string;
  content?: string;
  language?: string;
}

export interface PullRequestSummary {
  id: string;
  pullRequestId: string;
  summary: string;
  keyChanges: string[];
  potentialIssues: string[];
  suggestedFeedback: string[];
  securityConsiderations: string[];
  testingRecommendations: string[];
  generatedAt: Date;
  model: string;
  confidence: number;
}

export interface PullRequestComment {
  id: string;
  pullRequestId: string;
  fileId?: string;
  line?: number;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  createdAt: Date;
  updatedAt?: Date;
  isAI: boolean;
}
export interface WebSocketEvent {
  type: string;
  data: any;
  timestamp: Date;
}

export interface AnalysisProgress {
  reviewId: string;
  stage: 'initializing' | 'scanning' | 'analyzing' | 'generating' | 'finalizing';
  progress: number;
  currentFile?: string;
  filesProcessed: number;
  totalFiles: number;
  estimatedTimeRemaining?: number;
  message?: string;
}

export interface ReviewUpdate {
  reviewId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  findings?: number;
  suggestions?: number;
  qualityScore?: number;
  message?: string;
}

export interface SecurityAlert {
  type: 'vulnerability' | 'secret' | 'dependency';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  repositoryId: string;
  file?: string;
  line?: number;
}

export interface TeamNotification {
  type: 'review_complete' | 'security_alert' | 'quality_gate_failed' | 'pr_ready';
  title: string;
  message: string;
  repositoryId: string;
  reviewId?: string;
  userId?: string;
  timestamp: Date;
}
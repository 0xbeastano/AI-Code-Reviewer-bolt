// API Response Types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
}

// Form and Event Types
export interface FormSubmissionEvent extends Event {
  target: HTMLFormElement;
  preventDefault(): void;
}

export interface SelectChangeEvent {
  target: {
    value: string;
    name?: string;
  };
}

export interface InputChangeEvent {
  target: {
    value: string;
    name: string;
    type?: string;
  };
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  id?: string;
}

export interface DataTableProps<T = Record<string, unknown>> {
  data: T[];
  columns: TableColumn<T>[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T;
  title: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

// Chart and Analytics Types
export interface ChartDataPoint {
  name: string;
  value: number;
  label?: string;
  color?: string;
}

export interface MetricData {
  current: number;
  previous: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  unit?: string;
  format?: 'number' | 'percentage' | 'currency' | 'bytes';
}

// User and Authentication Types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user' | 'viewer';
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  language: string;
  timezone: string;
}

// File and Code Types
export interface FileMetadata {
  path: string;
  name: string;
  extension: string;
  size: number;
  lastModified: string;
  language?: string;
  encoding?: string;
}

export interface CodePosition {
  line: number;
  column: number;
  offset?: number;
}

export interface CodeRange {
  start: CodePosition;
  end: CodePosition;
}

// Analysis and Review Types
export interface AnalysisConfig {
  language: string;
  rules: string[];
  severity: 'error' | 'warning' | 'info';
  includeTests: boolean;
  excludePatterns: string[];
}

export interface ReviewSettings {
  autoFix: boolean;
  showSuggestions: boolean;
  includePerformance: boolean;
  includeSecurity: boolean;
  maxSuggestions: number;
}

// Network and WebSocket Types
export interface WebSocketMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp: number;
  id: string;
}

export interface ConnectionStatus {
  connected: boolean;
  reconnecting: boolean;
  lastConnected?: string;
  error?: string;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Environment and Configuration Types
export interface EnvironmentConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  apiBaseUrl: string;
  wsUrl: string;
  version: string;
  features: FeatureFlags;
}

export interface FeatureFlags {
  [key: string]: boolean;
}

// Error Handling Types
export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
}

export interface ErrorReport {
  error: Error;
  errorInfo: ErrorInfo;
  timestamp: string;
  url: string;
  userAgent: string;
  userId?: string;
}

// Loading and State Types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
  lastUpdated?: string;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// Generic Callback Types
export type VoidCallback = () => void;
export type ValueCallback<T> = (value: T) => void;
export type AsyncCallback<T = void> = () => Promise<T>;
export type EventHandler<T = Event> = (event: T) => void;
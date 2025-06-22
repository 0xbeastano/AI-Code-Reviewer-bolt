export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  organization?: string;
  role: 'admin' | 'developer' | 'viewer';
  permissions: string[];
  createdAt: Date;
  lastLoginAt?: Date;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: {
      email: boolean;
      push: boolean;
      reviewComplete: boolean;
      securityAlerts: boolean;
    };
    defaultAnalysisConfig: string;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface OAuthProvider {
  id: 'github' | 'gitlab' | 'bitbucket';
  name: string;
  icon: string;
  color: string;
}
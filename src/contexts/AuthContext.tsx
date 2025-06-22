import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
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

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (data: any) => Promise<void>;
  signIn: (data: any) => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendEmailVerification: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Mock user for direct access (no authentication required)
  const [user] = useState<User>({
    id: 'mock-user-id',
    email: 'user@example.com',
    name: 'Demo User',
    role: 'developer',
    permissions: ['read', 'write'],
    createdAt: new Date(),
    preferences: {
      theme: 'system',
      notifications: {
        email: true,
        push: true,
        reviewComplete: true,
        securityAlerts: true,
      },
      defaultAnalysisConfig: 'standard'
    }
  });

  const [isLoading] = useState(false);

  const signUp = useCallback(async (data: any) => {
    // Mock implementation
    console.log('Mock signUp:', data);
  }, []);

  const signIn = useCallback(async (data: any) => {
    // Mock implementation
    console.log('Mock signIn:', data);
  }, []);

  const signInWithOAuth = useCallback(async (provider: 'google' | 'github') => {
    // Mock implementation
    console.log('Mock OAuth signIn:', provider);
  }, []);

  const signOut = useCallback(async () => {
    // Mock implementation
    console.log('Mock signOut');
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    // Mock implementation
    console.log('Mock resetPassword:', email);
  }, []);

  const updatePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    // Mock implementation
    console.log('Mock updatePassword');
  }, []);

  const updateProfile = useCallback(async (updates: any) => {
    // Mock implementation
    console.log('Mock updateProfile:', updates);
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    // Mock implementation
    console.log('Mock verifyEmail:', token);
  }, []);

  const resendEmailVerification = useCallback(async () => {
    // Mock implementation
    console.log('Mock resendEmailVerification');
  }, []);

  const hasRole = useCallback((role: string) => {
    return user?.role === role;
  }, [user]);

  const hasPermission = useCallback((permission: string) => {
    return user?.permissions.includes(permission) || false;
  }, [user]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: true, // Always authenticated for direct access
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    verifyEmail,
    resendEmailVerification,
    hasRole,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
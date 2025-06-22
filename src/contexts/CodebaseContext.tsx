import React, { createContext, useContext, useState, useCallback } from 'react';
import { Codebase, AnalysisResult, ReviewConfig, ReviewReport } from '../types';

interface CodebaseContextType {
  currentCodebase: Codebase | null;
  analysisResults: AnalysisResult[];
  reviewConfig: ReviewConfig;
  reviewReport: ReviewReport | null;
  isAnalyzing: boolean;
  setCurrentCodebase: (codebase: Codebase | null) => void;
  setAnalysisResults: (results: AnalysisResult[]) => void;
  setReviewConfig: (config: ReviewConfig) => void;
  setReviewReport: (report: ReviewReport | null) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  resetAnalysis: () => void;
}

const CodebaseContext = createContext<CodebaseContextType | undefined>(undefined);

export const useCodebase = () => {
  const context = useContext(CodebaseContext);
  if (!context) {
    throw new Error('useCodebase must be used within a CodebaseProvider');
  }
  return context;
};

const defaultReviewConfig: ReviewConfig = {
  priorities: {
    security: true,
    performance: true,
    readability: true,
    maintainability: true,
  },
  languages: ['javascript', 'typescript', 'python', 'java', 'csharp', 'go', 'rust'],
  excludePatterns: ['node_modules/**', '*.min.js', '*.bundle.js', 'dist/**', 'build/**'],
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
  },
  aggressiveness: 'moderate',
};

interface CodebaseProviderProps {
  children: React.ReactNode;
}

export const CodebaseProvider: React.FC<CodebaseProviderProps> = ({ children }) => {
  const [currentCodebase, setCurrentCodebase] = useState<Codebase | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [reviewConfig, setReviewConfig] = useState<ReviewConfig>(defaultReviewConfig);
  const [reviewReport, setReviewReport] = useState<ReviewReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const resetAnalysis = useCallback(() => {
    setAnalysisResults([]);
    setReviewReport(null);
    setIsAnalyzing(false);
  }, []);

  return (
    <CodebaseContext.Provider
      value={{
        currentCodebase,
        analysisResults,
        reviewConfig,
        reviewReport,
        isAnalyzing,
        setCurrentCodebase,
        setAnalysisResults,
        setReviewConfig,
        setReviewReport,
        setIsAnalyzing,
        resetAnalysis,
      }}
    >
      {children}
    </CodebaseContext.Provider>
  );
};
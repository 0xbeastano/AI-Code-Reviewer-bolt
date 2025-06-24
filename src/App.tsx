import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { CodebaseProvider } from './contexts/CodebaseContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { AuthProvider } from './components/Auth/AuthProvider';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import CodeReview from './pages/CodeReview';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import TestDashboard from './pages/TestDashboard';
import { AuthPage } from './components/Auth/AuthPage';
import { AuthCallback } from './pages/AuthCallback';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import DocumentationPage from './pages/DocumentationPage';
import ReviewResults from './pages/ReviewResults';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <CodebaseProvider>
              <WebSocketProvider>
                <Router>
                  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/pricing" element={<PricingPage />} />
                      <Route path="/docs" element={<DocumentationPage />} />
                      <Route 
                        path="/auth" 
                        element={
                          <ProtectedRoute requireAuth={false}>
                            <AuthPage />
                          </ProtectedRoute>
                        } 
                      />
                      <Route path="/auth/callback" element={<AuthCallback />} />
                      
                      {/* Test Dashboard - Public for testing */}
                      <Route path="/test" element={<TestDashboard />} />
                      
                      {/* Protected Routes */}
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <Layout>
                            <Dashboard />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      <Route path="/review" element={
                        <ProtectedRoute>
                          <Layout>
                            <CodeReview />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      <Route path="/review/:id/results" element={
                        <ProtectedRoute>
                          <Layout>
                            <ReviewResults />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      <Route path="/analytics" element={
                        <ProtectedRoute>
                          <Layout>
                            <Analytics />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      <Route path="/settings" element={
                        <ProtectedRoute>
                          <Layout>
                            <Settings />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      
                      {/* Fallback - Redirect to landing page */}
                      <Route path="*" element={<LandingPage />} />
                    </Routes>
                    <Toaster 
                      position="top-right"
                      toastOptions={{
                        duration: 4000,
                        style: {
                          background: 'var(--toast-bg)',
                          color: 'var(--toast-color)',
                        },
                      }}
                    />
                  </div>
                </Router>
              </WebSocketProvider>
            </CodebaseProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
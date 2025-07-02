import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { CodebaseProvider } from './contexts/CodebaseContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { CollaborationProvider } from './contexts/CollaborationContext';
import { AuthProvider } from './components/Auth/AuthProvider';
import Layout from './components/Layout/Layout';
import PremiumLayout from './components/Layout/PremiumLayout';
import Dashboard from './pages/Dashboard';
import CodeReview from './pages/CodeReview';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import TestDashboard from './pages/TestDashboard';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import DocumentationPage from './pages/DocumentationPage';
import ReviewResults from './pages/ReviewResults';
import DeployPage from './pages/DeployPage';
import PullRequestReview from './pages/PullRequestReview';
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
                <CollaborationProvider>
                  <Router>
                    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/pricing" element={<PricingPage />} />
                        <Route path="/docs" element={<DocumentationPage />} />
                        
                        {/* Test Dashboard - Public for testing */}
                        <Route path="/test" element={<TestDashboard />} />
                        
                        {/* Main Application Routes - Premium Design */}
                        <Route path="/dashboard" element={
                          <PremiumLayout>
                            <Dashboard />
                          </PremiumLayout>
                        } />
                        <Route path="/review" element={
                          <PremiumLayout>
                            <CodeReview />
                          </PremiumLayout>
                        } />
                        <Route path="/review/:id/results" element={
                          <PremiumLayout>
                            <ReviewResults />
                          </PremiumLayout>
                        } />
                        <Route path="/analytics" element={
                          <PremiumLayout>
                            <Analytics />
                          </PremiumLayout>
                        } />
                        <Route path="/settings" element={
                          <PremiumLayout>
                            <Settings />
                          </PremiumLayout>
                        } />
                        <Route path="/deploy" element={
                          <PremiumLayout>
                            <DeployPage />
                          </PremiumLayout>
                        } />
                        {/* Pull Request Review Route */}
                        <Route path="/pull-request/:owner/:repo" element={
                          <PremiumLayout>
                            <PullRequestReview />
                          </PremiumLayout>
                        } />
                        
                        {/* Fallback - Redirect to dashboard */}
                        <Route path="*" element={<Dashboard />} />
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
                </CollaborationProvider>
              </WebSocketProvider>
            </CodebaseProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { CodebaseProvider } from './contexts/CodebaseContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import CodeReview from './pages/CodeReview';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
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
          <CodebaseProvider>
            <WebSocketProvider>
              <Router>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                  <Routes>
                    <Route path="/" element={
                      <Layout>
                        <Dashboard />
                      </Layout>
                    } />
                    <Route path="/review" element={
                      <Layout>
                        <CodeReview />
                      </Layout>
                    } />
                    <Route path="/analytics" element={
                      <Layout>
                        <Analytics />
                      </Layout>
                    } />
                    <Route path="/settings" element={
                      <Layout>
                        <Settings />
                      </Layout>
                    } />
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
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
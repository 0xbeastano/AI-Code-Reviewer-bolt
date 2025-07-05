import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

// Lazy load components for better performance
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const AuthPage = React.lazy(() => import('./pages/AuthPage'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Settings = React.lazy(() => import('./pages/Settings'));
const CodeReview = React.lazy(() => import('./pages/CodeReview'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const Repositories = React.lazy(() => import('./pages/Repositories'));
const Onboarding = React.lazy(() => import('./pages/Onboarding'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireOnboarding?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  requireOnboarding = false 
}) => {
  const { isAuthenticated, isLoading, hasCompletedOnboarding } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAuth && !requireOnboarding && !hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  if (requireAuth && requireOnboarding && hasCompletedOnboarding) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirects authenticated users)
interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Loading Fallback Component
const PageLoadingFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

// Main App Component
const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            }
          />
          
          <Route
            path="/auth"
            element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            }
          />

          {/* Onboarding Route */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute requireOnboarding={true}>
                <Onboarding />
              </ProtectedRoute>
            }
          />

          {/* Protected App Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/repositories"
            element={
              <ProtectedRoute>
                <Repositories />
              </ProtectedRoute>
            }
          />

          <Route
            path="/repositories/:id/review"
            element={
              <ProtectedRoute>
                <CodeReview />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Catch-all route for 404s */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
};

export default App;
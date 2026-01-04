import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import { useTheme } from './hooks/useTheme';
import { CategoriesProvider } from './contexts/CategoriesContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Monthly from './pages/Monthly';
import Yearly from './pages/Yearly';
import Analytics from './pages/Analytics';
import Todos from './pages/Todos';
import ProfileDropdown from './components/ProfileDropdown';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-gray">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Navigation component (responsive)
const Navigation = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  return (
    <nav className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle menu"
            onClick={() => setOpen(!open)}
          >
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <a href="/dashboard" className="font-semibold text-primary text-lg">Habit</a>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <a href="/dashboard" className={`font-medium transition ${isActive('/dashboard') ? 'text-primary' : 'text-text-gray dark:text-dark-gray hover:text-text-dark dark:hover:text-dark-text'}`}>Dashboard</a>
          <a href="/monthly" className={`font-medium transition ${isActive('/monthly') ? 'text-primary' : 'text-text-gray dark:text-dark-gray hover:text-text-dark dark:hover:text-dark-text'}`}>Habits</a>
          <a href="/analytics" className={`font-medium transition ${isActive('/analytics') ? 'text-primary' : 'text-text-gray dark:text-dark-gray hover:text-text-dark dark:hover:text-dark-text'}`}>Analytics</a>
          <a href="/todos" className={`font-medium transition ${isActive('/todos') ? 'text-primary' : 'text-text-gray dark:text-dark-gray hover:text-text-dark dark:hover:text-dark-text'}`}>To Do</a>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <ProfileDropdown />
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white dark:bg-dark-surface dark:border-gray-700">
          <div className="px-4 py-3 space-y-2">
            <a href="/dashboard" className={`block font-medium ${isActive('/dashboard') ? 'text-primary' : 'text-text-gray dark:text-dark-gray'}`}>Dashboard</a>
            <a href="/monthly" className={`block font-medium ${isActive('/monthly') ? 'text-primary' : 'text-text-gray dark:text-dark-gray'}`}>Habits</a>
            <a href="/analytics" className={`block font-medium ${isActive('/analytics') ? 'text-primary' : 'text-text-gray dark:text-dark-gray'}`}>Analytics</a>
            <a href="/todos" className={`block font-medium ${isActive('/todos') ? 'text-primary' : 'text-text-gray dark:text-dark-gray'}`}>To Do</a>
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
              <ProfileDropdown />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const AppContent = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Navigation />
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/monthly"
        element={
          <ProtectedRoute>
            <Navigation />
            <Monthly />
          </ProtectedRoute>
        }
      />
      <Route
        path="/yearly"
        element={
          <ProtectedRoute>
            <Navigation />
            <Yearly />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Navigation />
            <Analytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/todos"
        element={
          <ProtectedRoute>
            <Navigation />
            <Todos />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <CategoriesProvider>
          <AppContent />
        </CategoriesProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;

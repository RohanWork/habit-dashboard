import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import { useTheme } from './hooks/useTheme';
import { CategoriesProvider } from './contexts/CategoriesContext';
import { resendVerificationEmail } from './firebase/auth';
import { auth } from './firebase/config';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Monthly from './pages/Monthly';
import Yearly from './pages/Yearly';
import Analytics from './pages/Analytics';
import Todos from './pages/Todos';
import Guide from './pages/Guide';
import ProfileDropdown from './components/ProfileDropdown';

// Email Verification Component
const EmailVerificationNotice = () => {
  const { user, refreshUser } = useAuth();
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');
  const [checking, setChecking] = useState(false);
  
  // Watch for email verification status changes
  useEffect(() => {
    if (user?.emailVerified) {
      // Email is verified, the ProtectedRoute will automatically show the dashboard
      // No need to do anything here, just let the component re-render
    }
  }, [user?.emailVerified]);

  const handleResendVerification = async () => {
    setResending(true);
    setResendError('');
    setResendSuccess(false);
    
    try {
      await resendVerificationEmail();
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (error) {
      // Handle Firebase errors with user-friendly messages
      let errorMessage = 'Failed to resend verification email. Please try again.';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/too-many-requests':
            errorMessage = 'Too many requests. Please wait a few minutes before requesting another email.';
            break;
          case 'auth/user-not-found':
          case 'auth/invalid-credential':
            errorMessage = 'User not found. Please sign out and sign in again.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection and try again.';
            break;
          case 'auth/requires-recent-login':
            errorMessage = 'For security, please sign out and sign in again.';
            break;
          default:
            if (error.message) {
              errorMessage = error.message;
            }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setResendError(errorMessage);
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerification = async () => {
    setChecking(true);
    setResendError('');
    setResendSuccess(false);
    
    try {
      // Refresh user to get latest verification status
      await refreshUser();
      
      // Wait for state to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check the current user from auth directly (most up-to-date)
      const currentUser = auth.currentUser;
      
      if (currentUser?.emailVerified) {
        setResendSuccess(true);
        // Refresh one more time to ensure React state is updated
        await refreshUser();
        // Wait a moment for the state to propagate
        await new Promise(resolve => setTimeout(resolve, 300));
        // The ProtectedRoute will automatically re-render when user.emailVerified becomes true
      } else {
        setResendError('Email not verified yet. Please check your inbox and click the verification link in the email.');
      }
    } catch (error) {
      setResendError('Failed to check verification status. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-dark-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">📧</div>
          <h1 className="text-2xl font-bold text-text-dark dark:text-dark-text mb-2">
            Verify Your Email
          </h1>
          <p className="text-text-gray dark:text-dark-gray">
            We've sent a verification email to
          </p>
          <p className="text-primary font-semibold mt-1">{user?.email}</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg mb-6">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Please check your inbox</strong> and click the verification link to activate your account. 
            You won't be able to access the app until your email is verified.
          </p>
        </div>

        {resendSuccess && (
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-lg mb-4">
            <p className="text-sm text-green-800 dark:text-green-300">
              ✓ Verification email sent! Please check your inbox.
            </p>
          </div>
        )}

        {resendError && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg mb-4">
            <p className="text-sm text-red-800 dark:text-red-300">
              {resendError}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleResendVerification}
            disabled={resending}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? 'Sending...' : 'Resend Verification Email'}
          </button>
          
          <button
            onClick={handleCheckVerification}
            disabled={checking}
            className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-text-dark dark:text-dark-text font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checking ? 'Checking...' : "I've Verified My Email"}
          </button>
        </div>

        <p className="text-xs text-text-gray dark:text-dark-gray text-center mt-6">
          Didn't receive the email? Check your spam folder or try resending.
        </p>
      </div>
    </div>
  );
};

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-light dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-gray dark:text-dark-gray">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if email is verified
  // Use key prop to force re-render when user changes
  if (!user.emailVerified) {
    return <EmailVerificationNotice key={`verify-${user.uid}-${user.emailVerified}`} />;
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
          <a href="/guide" className={`font-medium transition ${isActive('/guide') ? 'text-primary' : 'text-text-gray dark:text-dark-gray hover:text-text-dark dark:hover:text-dark-text'}`}>Guide</a>
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
            <a href="/guide" className={`block font-medium ${isActive('/guide') ? 'text-primary' : 'text-text-gray dark:text-dark-gray'}`}>Guide</a>
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
      <Route
        path="/guide"
        element={
          <ProtectedRoute>
            <Navigation />
            <Guide />
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

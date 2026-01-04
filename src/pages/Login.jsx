import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser, signIn } from '../firebase/auth';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Validation functions
  const validateEmail = (email) => {
    if (!email.trim()) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (password, isSignup = false) => {
    if (!password) {
      return 'Password is required';
    }
    if (isSignup) {
      if (password.length < 6) {
        return 'Password must be at least 6 characters';
      }
      if (password.length > 128) {
        return 'Password must be less than 128 characters';
      }
    }
    return '';
  };

  const validateName = (name) => {
    if (!name.trim()) {
      return 'Name is required';
    }
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    if (name.trim().length > 50) {
      return 'Name must be less than 50 characters';
    }
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(name.trim())) {
      return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }
    return '';
  };

  const validateForm = () => {
    const errors = {};
    
    if (isSignup) {
      const nameError = validateName(name);
      if (nameError) errors.name = nameError;
    }
    
    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;
    
    const passwordError = validatePassword(password, isSignup);
    if (passwordError) errors.password = passwordError;
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Validate form before submitting
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        await createUser(email, password, name.trim());
      } else {
        await signIn(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      // Handle Firebase errors with user-friendly messages
      let errorMessage = 'Authentication failed';
      
      if (err.code) {
        switch (err.code) {
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address';
            setFieldErrors({ email: 'Please enter a valid email address' });
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email address';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password';
            setFieldErrors({ password: 'Incorrect password' });
            break;
          case 'auth/email-already-in-use':
            errorMessage = 'An account with this email already exists';
            setFieldErrors({ email: 'This email is already registered' });
            break;
          case 'auth/weak-password':
            errorMessage = 'Password is too weak. Please use a stronger password';
            setFieldErrors({ password: 'Password is too weak. Please use at least 6 characters' });
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed attempts. Please try again later';
            break;
          default:
            errorMessage = err.message || 'Authentication failed';
        }
      } else {
        errorMessage = err.message || 'Authentication failed';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors({ ...fieldErrors, [field]: '' });
    }
    setError('');

    // Update the field value
    switch (field) {
      case 'name':
        setName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-light to-white dark:from-dark-bg dark:to-dark-surface flex">
      {/* Left Sidebar - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary to-primary/90 flex-col items-center justify-center p-12 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 text-center space-y-6">
          <div className="text-6xl font-bold">✓</div>
          <h2 className="text-4xl font-bold">Build Better Habits</h2>
          <p className="text-lg opacity-90 leading-relaxed max-w-sm">
            Track your daily progress, visualize your achievements, and transform your life one day at a time.
          </p>

          <div className="pt-8 space-y-4">
            <div className="flex items-start gap-4">
              <div className="text-2xl">📊</div>
              <div className="text-left">
                <h3 className="font-semibold">Smart Analytics</h3>
                <p className="text-sm opacity-80">Track daily, weekly, and yearly progress</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="text-2xl">✨</div>
              <div className="text-left">
                <h3 className="font-semibold">Mood Tracking</h3>
                <p className="text-sm opacity-80">Monitor your mood, energy, and focus daily</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="text-2xl">🎯</div>
              <div className="text-left">
                <h3 className="font-semibold">Goal Tracking</h3>
                <p className="text-sm opacity-80">Create and manage unlimited habits</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-12 dark:bg-dark-bg">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="mb-10 lg:hidden text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h1 className="text-3xl font-bold text-primary mb-2">Habit</h1>
            <p className="text-text-gray dark:text-dark-gray text-sm">Build better habits, transform your life</p>
          </div>

          {/* White Card Container */}
          <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl p-8 sm:p-10">
            {/* Form Title */}
            <div className="mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-text-dark dark:text-dark-text">
                {isSignup ? 'Create your account' : 'Welcome back'}
              </h3>
              <p className="text-text-gray dark:text-dark-gray text-sm mt-2">
                {isSignup ? 'Start building better habits today' : 'Sign in to continue your journey'}
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 rounded-lg">
                <p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAuth} className="space-y-5">
              {isSignup && (
                <div>
                  <label className="block text-sm font-semibold text-text-dark dark:text-dark-text mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    onBlur={() => {
                      const error = validateName(name);
                      if (error) setFieldErrors({ ...fieldErrors, name: error });
                    }}
                    placeholder="John Doe"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                      fieldErrors.name
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary/20'
                    } dark:bg-gray-800 dark:text-dark-text`}
                  />
                  {fieldErrors.name && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.name}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-text-dark dark:text-dark-text mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  onBlur={() => {
                    const error = validateEmail(email);
                    if (error) setFieldErrors({ ...fieldErrors, email: error });
                  }}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    fieldErrors.email
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary/20'
                  } dark:bg-gray-800 dark:text-dark-text`}
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-dark dark:text-dark-text mb-2">
                  Password
                  {isSignup && (
                    <span className="text-xs font-normal text-text-gray dark:text-dark-gray ml-2">
                      (min. 6 characters)
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  onBlur={() => {
                    const error = validatePassword(password, isSignup);
                    if (error) setFieldErrors({ ...fieldErrors, password: error });
                  }}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    fieldErrors.password
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary/20'
                  } dark:bg-gray-800 dark:text-dark-text`}
                />
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-8 shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    {isSignup ? 'Creating account...' : 'Signing in...'}
                  </span>
                ) : isSignup ? (
                  'Create Account'
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
              <span className="text-text-gray dark:text-dark-gray text-xs font-medium">OR</span>
              <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
            </div>

            {/* Toggle signup/signin */}
            <div className="text-center space-y-2">
              <p className="text-text-gray dark:text-dark-gray text-sm">
                {isSignup ? 'Already have an account?' : "Don't have an account?"}
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError('');
                  setFieldErrors({});
                  setEmail('');
                  setPassword('');
                  setName('');
                }}
                className="text-primary hover:text-primary/80 font-semibold transition text-sm"
              >
                {isSignup ? 'Sign in instead' : 'Create an account'}
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-text-gray dark:text-dark-gray mt-8">
            By signing up, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

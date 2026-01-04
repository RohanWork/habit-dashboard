import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useCategories } from '../contexts/CategoriesContext';
import { getUserData } from '../firebase/db';
import { logout, sendPasswordResetEmail, deleteAccount } from '../firebase/auth';
import { CATEGORY_LIST } from '../utils/habitCategories';
import NotificationSettings from './NotificationSettings';

const ProfileDropdown = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { hiddenPredefinedCategories, restoreCategory } = useCategories();
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCategorySettings, setShowCategorySettings] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const data = await getUserData(user.uid);
          setUserData(data);
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Format date to "DEC 2025" format
  const formatMemberSince = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Format last login
  const formatLastLogin = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(user.email);
      alert('Password reset email sent! Check your inbox.');
      setIsOpen(false);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      await deleteAccount(user.uid);
      alert('Account deleted successfully. You will be logged out.');
      await logout();
    } catch (error) {
      alert(`Error deleting account: ${error.message}`);
      setShowDeleteConfirm(false);
    }
  };

  if (!user) return null;

  const userName = userData?.name || 'User';
  const memberSince = userData?.createdAt ? formatMemberSince(userData.createdAt) : 'N/A';
  const lastLogin = userData?.lastLogin ? formatLastLogin(userData.lastLogin) : 'Never';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition w-full md:w-auto"
        aria-label="Profile menu"
      >
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
          {userName.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm text-text-gray dark:text-dark-gray truncate max-w-[150px]">
          {userName}
        </span>
        <svg
          className={`w-4 h-4 text-text-gray dark:text-dark-gray transition-transform ${isOpen ? 'rotate-180' : ''} ml-auto md:ml-0`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute md:right-0 mt-2 w-full md:w-72 bg-white dark:bg-dark-surface rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-[80vh] overflow-y-auto">
          {/* User Info Section */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-lg">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text-dark dark:text-dark-text truncate">{userName}</p>
                <p className="text-xs text-text-gray dark:text-dark-gray truncate">{user.email}</p>
              </div>
            </div>
            <div className="space-y-1 text-xs text-text-gray dark:text-dark-gray">
              <div className="flex justify-between">
                <span>Member since:</span>
                <span className="font-medium">{memberSince}</span>
              </div>
              <div className="flex justify-between">
                <span>Last login:</span>
                <span className="font-medium">{lastLogin}</span>
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="p-2">
            <button
              onClick={toggleTheme}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm text-text-dark dark:text-dark-text transition"
            >
              <span>{isDark ? '☀️' : '🌙'}</span>
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <button
              onClick={handlePasswordReset}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm text-text-dark dark:text-dark-text transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <span>Reset Password</span>
            </button>

            <button
              onClick={() => {
                setShowNotificationSettings(!showNotificationSettings);
                setShowCategorySettings(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm text-text-dark dark:text-dark-text transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span>Notification Settings</span>
            </button>

            {/* Notification Settings Panel */}
            {showNotificationSettings && (
              <div className="mt-2 p-3">
                <NotificationSettings onClose={() => setShowNotificationSettings(false)} />
              </div>
            )}

            <button
              onClick={() => {
                setShowCategorySettings(!showCategorySettings);
                setShowNotificationSettings(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm text-text-dark dark:text-dark-text transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>Category Settings</span>
              {hiddenPredefinedCategories.length > 0 && (
                <span className="ml-auto bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                  {hiddenPredefinedCategories.length}
                </span>
              )}
            </button>

            {/* Category Settings Panel */}
            {showCategorySettings && (
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                <h4 className="text-xs font-semibold text-text-dark dark:text-dark-text mb-2">
                  Hidden Categories
                </h4>
                {hiddenPredefinedCategories.length === 0 ? (
                  <p className="text-xs text-text-gray dark:text-dark-gray">
                    No hidden categories
                  </p>
                ) : (
                  <div className="space-y-2">
                    {hiddenPredefinedCategories.map((categoryId) => {
                      const category = CATEGORY_LIST.find(c => c.id === categoryId);
                      if (!category) return null;
                      
                      return (
                        <div
                          key={categoryId}
                          className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
                        >
                          <span className="text-xs text-text-dark dark:text-dark-text">
                            {category.label}
                          </span>
                          <button
                            onClick={async () => {
                              try {
                                await restoreCategory(categoryId);
                                // State will update automatically via useEffect
                              } catch (error) {
                                alert(`Error restoring category: ${error.message}`);
                              }
                            }}
                            className="px-2 py-1 text-xs bg-primary hover:bg-primary/90 text-white rounded transition"
                          >
                            Restore
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

            {!showDeleteConfirm ? (
              <button
                onClick={handleDeleteAccount}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete Account</span>
              </button>
            ) : (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
                <p className="text-xs text-red-800 dark:text-red-300 mb-2 font-medium">
                  This will permanently delete your account and all data. This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteAccount}
                    className="flex-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md transition"
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-text-dark dark:text-dark-text text-xs rounded-md transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

            <button
              onClick={async () => {
                await logout();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm text-text-dark dark:text-dark-text transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;


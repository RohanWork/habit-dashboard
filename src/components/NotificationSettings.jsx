import React, { useState, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';

const NotificationSettings = ({ onClose }) => {
  const { user } = useAuth();
  const {
    notificationPermission,
    notificationSettings,
    requestPermission,
    updateNotificationSettings,
    sendBrowserNotification,
  } = useNotifications();

  const [localSettings, setLocalSettings] = useState(notificationSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    setLocalSettings(notificationSettings);
  }, [notificationSettings]);

  const handleToggle = async (key) => {
    const newSettings = { ...localSettings, [key]: !localSettings[key] };
    setLocalSettings(newSettings);
    
    // If enabling browser notifications, request permission
    if (key === 'browserEnabled' && newSettings.browserEnabled && notificationPermission !== 'granted') {
      const result = await requestPermission();
      if (!result.success) {
        setMessage({ type: 'error', text: result.error });
        setLocalSettings({ ...newSettings, browserEnabled: false });
        return;
      }
    }

    await saveSettings(newSettings);
  };

  const handleChange = async (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    await saveSettings(newSettings);
  };

  const saveSettings = async (settings) => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const result = await updateNotificationSettings(settings);
      if (result.success) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-dark dark:text-dark-text">
          Notification Settings
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Message */}
      {message.text && (
        <div className={`mb-4 px-4 py-2 rounded-lg text-sm ${
          message.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Browser Notifications */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <label className="text-sm font-medium text-text-dark dark:text-dark-text">
              Browser Notifications
            </label>
            <p className="text-xs text-text-gray dark:text-dark-gray mt-1">
              Get reminders directly in your browser
            </p>
          </div>
          <button
            onClick={() => handleToggle('browserEnabled')}
            disabled={saving || notificationPermission === 'denied'}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              localSettings.browserEnabled
                ? 'bg-primary'
                : 'bg-gray-300 dark:bg-gray-600'
            } ${notificationPermission === 'denied' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                localSettings.browserEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        {notificationPermission === 'default' && !localSettings.browserEnabled && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            Click the toggle to enable browser notifications. You'll be asked for permission.
          </p>
        )}
        
        {notificationPermission === 'denied' && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">
            Notifications are blocked. Please enable them in your browser settings.
          </p>
        )}
      </div>

      {/* Email Notifications */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <label className="text-sm font-medium text-text-dark dark:text-dark-text">
              Email Notifications
            </label>
            <p className="text-xs text-text-gray dark:text-dark-gray mt-1">
              Receive reminders via email ({user?.email})
            </p>
          </div>
          <button
            onClick={() => handleToggle('emailEnabled')}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              localSettings.emailEnabled
                ? 'bg-primary'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                localSettings.emailEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Reminder Time */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-text-dark dark:text-dark-text mb-2">
          Default Reminder Time
        </label>
        <p className="text-xs text-text-gray dark:text-dark-gray mb-2">
          This time will be used as the default when creating new habits with reminders enabled
        </p>
        <input
          type="time"
          value={localSettings.reminderTime}
          onChange={(e) => handleChange('reminderTime', e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-xs text-text-gray dark:text-dark-gray mt-1">
          Default time for habit reminders
        </p>
      </div>

      {/* Weekly Summary */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <label className="text-sm font-medium text-text-dark dark:text-dark-text">
              Weekly Summary Email
            </label>
            <p className="text-xs text-text-gray dark:text-dark-gray mt-1">
              Receive a weekly progress report every Sunday
            </p>
          </div>
          <button
            onClick={() => handleToggle('weeklySummary')}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              localSettings.weeklySummary
                ? 'bg-primary'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                localSettings.weeklySummary ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Streak Warnings */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <label className="text-sm font-medium text-text-dark dark:text-dark-text">
              Streak Break Warnings
            </label>
            <p className="text-xs text-text-gray dark:text-dark-gray mt-1">
              Get notified when you're about to break a streak
            </p>
          </div>
          <button
            onClick={() => handleToggle('streakWarnings')}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              localSettings.streakWarnings
                ? 'bg-primary'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                localSettings.streakWarnings ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Important Note */}
      <div className="mt-6 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <p className="text-xs text-amber-800 dark:text-amber-300">
          <strong>Note:</strong> Browser reminders only work when the page/tab is open. Keep the browser tab open for reminders to fire.
        </p>
      </div>
    </div>
  );
};

export default NotificationSettings;


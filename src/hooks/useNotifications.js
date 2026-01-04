import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { getUserData, updateUserData } from '../firebase/db';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [notificationSettings, setNotificationSettings] = useState({
    browserEnabled: false,
    emailEnabled: false,
    reminderTime: '09:00', // Default 9 AM
    weeklySummary: false,
    streakWarnings: true,
  });

  // Check notification permission status
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Load notification settings from user data
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      try {
        const userData = await getUserData(user.uid);
        if (userData?.notificationSettings) {
          setNotificationSettings(userData.notificationSettings);
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    };

    loadSettings();
  }, [user]);

  // Request browser notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return { success: false, error: 'Browser does not support notifications' };
    }

    if (Notification.permission === 'granted') {
      setNotificationPermission('granted');
      return { success: true };
    }

    if (Notification.permission === 'denied') {
      return { success: false, error: 'Notifications are blocked. Please enable them in browser settings.' };
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        return { success: true };
      } else {
        return { success: false, error: 'Notification permission denied' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Send browser notification
  const sendBrowserNotification = useCallback((title, options = {}) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return false;
    }

    if (!notificationSettings.browserEnabled) {
      return false;
    }

    try {
      const notification = new Notification(title, {
        tag: 'habit-reminder',
        requireInteraction: false,
        ...options,
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }, [notificationSettings.browserEnabled]);

  // Update notification settings
  const updateNotificationSettings = useCallback(async (newSettings) => {
    if (!user) return;

    try {
      const updatedSettings = { ...notificationSettings, ...newSettings };
      setNotificationSettings(updatedSettings);
      await updateUserData(user.uid, { notificationSettings: updatedSettings });
      return { success: true };
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return { success: false, error: error.message };
    }
  }, [user, notificationSettings]);

  // Schedule habit reminder (can be called with habitId or habitName)
  const scheduleHabitReminder = useCallback((habitIdOrName, habitName, reminderTime) => {
    if (!notificationSettings.browserEnabled) return null;

    // Handle both formats: (habitId, habitName, time) or (habitName, time)
    let actualHabitName, actualReminderTime;
    if (arguments.length === 3) {
      actualHabitName = habitName;
      actualReminderTime = reminderTime;
    } else {
      actualHabitName = habitIdOrName;
      actualReminderTime = habitName;
    }

    const [hours, minutes] = actualReminderTime.split(':').map(Number);
    const now = new Date();
    const reminderDate = new Date();
    reminderDate.setHours(hours, minutes, 0, 0);

    // If reminder time has passed today, schedule for tomorrow
    if (reminderDate <= now) {
      reminderDate.setDate(reminderDate.getDate() + 1);
    }

    const timeUntilReminder = reminderDate.getTime() - now.getTime();

    // Schedule the reminder
    const timeoutId = setTimeout(() => {
      sendBrowserNotification(`Time for: ${actualHabitName}`, {
        body: `Don't forget to complete "${actualHabitName}" today!`,
        data: { habitId: typeof habitIdOrName === 'string' && arguments.length === 3 ? habitIdOrName : null, habitName: actualHabitName, type: 'reminder' },
      });
      
      // Reschedule for next day (recurring reminder)
      scheduleHabitReminder(habitIdOrName, actualHabitName, actualReminderTime);
    }, timeUntilReminder);

    return { reminderDate, timeoutId };
  }, [notificationSettings.browserEnabled, sendBrowserNotification]);

  return {
    notificationPermission,
    notificationSettings,
    requestPermission,
    sendBrowserNotification,
    updateNotificationSettings,
    scheduleHabitReminder,
  };
};


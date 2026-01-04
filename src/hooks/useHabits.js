import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  getUserHabits,
  getDailyLog,
  saveDailyLog,
  saveHabit,
  deleteHabit,
  getDailyLogsByDateRange,
} from '../firebase/db';
import { calculateStreaks } from '../utils/streakCalculator';

export const useHabits = (dateString) => {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [dailyLog, setDailyLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch habits on mount or when user changes
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchHabits = async () => {
      try {
        setLoading(true);
        const userHabits = await getUserHabits(user.uid);

        // Fetch all daily logs for the past year to calculate streaks
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const dateStringStart = oneYearAgo.toISOString().split('T')[0];
        const today = new Date();
        const dateStringEnd = today.toISOString().split('T')[0];

        const dailyLogsData = await getDailyLogsByDateRange(
          user.uid,
          dateStringStart,
          dateStringEnd
        );

        // Convert array of logs to an object keyed by date for the streak calculator
        const dailyLogsMap = {};
        (dailyLogsData || []).forEach((log) => {
          if (log && log.date) dailyLogsMap[log.date] = log;
        });

        // Calculate streaks for each habit
        const habitsWithStreaks = userHabits.map((habit) => {
          const streakData = calculateStreaks(habit.id, dailyLogsMap);
          return {
            ...habit,
            currentStreak: streakData.currentStreak,
            bestStreak: streakData.bestStreak,
          };
        });

        setHabits(habitsWithStreaks);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHabits();
  }, [user]);

  // Fetch daily log when date changes
  useEffect(() => {
    if (!user || !dateString) return;

    const fetchDailyLog = async () => {
      try {
        const log = await getDailyLog(user.uid, dateString);
        setDailyLog(log || {
          date: dateString,
          habits: {},
          mood: 3,
          energy: 3,
          focus: 3,
        });
      } catch (err) {
        setError(err.message);
      }
    };

    fetchDailyLog();
  }, [user, dateString]);

  // Toggle a habit completion (supports extended data for quantity/time tracking)
  const toggleHabit = useCallback(async (habitId, completionData = null) => {
    if (!user || !dailyLog) return;

    try {
      const currentCompletion = dailyLog.habits[habitId];
      const isCurrentlyCompleted = currentCompletion === true || (typeof currentCompletion === 'object' && currentCompletion?.completed === true);
      
      let newCompletionValue;
      if (isCurrentlyCompleted) {
        // Uncomplete: set to false
        newCompletionValue = false;
      } else {
        // Complete: use provided data or default to true
        if (completionData) {
          newCompletionValue = completionData;
        } else {
          newCompletionValue = true;
        }
      }

      const updatedLog = {
        ...dailyLog,
        habits: {
          ...dailyLog.habits,
          [habitId]: newCompletionValue,
        },
      };
      await saveDailyLog(user.uid, dateString, updatedLog);
      setDailyLog(updatedLog);
    } catch (err) {
      setError(err.message);
    }
  }, [user, dailyLog, dateString]);

  // Update mood, energy, or focus
  const updateDailyMetric = useCallback(async (metric, value) => {
    if (!user || !dailyLog) return;

    try {
      const updatedLog = {
        ...dailyLog,
        [metric]: value,
      };
      await saveDailyLog(user.uid, dateString, updatedLog);
      setDailyLog(updatedLog);
    } catch (err) {
      setError(err.message);
    }
  }, [user, dailyLog, dateString]);

  // Create a new habit
  const createHabit = useCallback(async (habitName, category = 'other', emoji = '', notes = '', advancedOptions = {}) => {
    if (!user) return;

    try {
      const habitId = Date.now().toString();
      
      const habitData = {
        name: habitName,
        category,
        emoji: emoji || '',
        notes: notes || '',
        active: true,
        archived: false,
        createdAt: new Date().toISOString(),
        // Advanced options
        frequency: advancedOptions.frequency || 'daily',
        schedule: advancedOptions.schedule || { daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
        reminderEnabled: advancedOptions.reminderEnabled || false,
        reminderTime: advancedOptions.reminderTime || null,
        quantityTracking: advancedOptions.quantityTracking || null,
        timeTracking: advancedOptions.timeTracking || null,
        difficulty: advancedOptions.difficulty || 'medium',
        goal: advancedOptions.goal || null,
      };
      
      // Use functional update to ensure we always have the latest habits state
      // and calculate order from current state
      setHabits(prevHabits => {
        const order = prevHabits.length;
        const newHabit = { 
          id: habitId, 
          ...habitData,
          order: order
        };
        
        // Save to Firebase with order included
        saveHabit(user.uid, habitId, { ...habitData, order: order }).catch(err => {
          console.error('Error saving habit:', err);
        });
        
        return [...prevHabits, newHabit];
      });
      
      // Return habitId so parent can track it
      return habitId;
    } catch (err) {
      setError(err.message);
    }
  }, [user]);

  // Update habit (for notes, emoji, etc.)
  const updateHabit = useCallback(async (habitId, updates) => {
    if (!user) return;

    try {
      await saveHabit(user.uid, habitId, updates);
      setHabits(habits.map(h => h.id === habitId ? { ...h, ...updates } : h));
    } catch (err) {
      setError(err.message);
    }
  }, [user, habits]);

  // Archive a habit
  const archiveHabit = useCallback(async (habitId) => {
    if (!user) return;

    try {
      await saveHabit(user.uid, habitId, { archived: true, active: false });
      setHabits(habits.map(h => h.id === habitId ? { ...h, archived: true, active: false } : h));
    } catch (err) {
      setError(err.message);
    }
  }, [user, habits]);

  // Unarchive a habit
  const unarchiveHabit = useCallback(async (habitId) => {
    if (!user) return;

    try {
      await saveHabit(user.uid, habitId, { archived: false, active: true });
      setHabits(habits.map(h => h.id === habitId ? { ...h, archived: false, active: true } : h));
    } catch (err) {
      setError(err.message);
    }
  }, [user, habits]);

  // Delete a habit
  const removeHabit = useCallback(async (habitId) => {
    if (!user) return;

    try {
      await deleteHabit(user.uid, habitId);
      setHabits(habits.filter(h => h.id !== habitId));
    } catch (err) {
      setError(err.message);
    }
  }, [user, habits]);

  return {
    habits,
    dailyLog,
    loading,
    error,
    toggleHabit,
    updateDailyMetric,
    createHabit,
    removeHabit,
    updateHabit,
    archiveHabit,
    unarchiveHabit,
  };
};

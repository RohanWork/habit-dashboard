import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const GoalsTracker = ({ habits, logs }) => {
  const { user } = useAuth();
  const [goals, setGoals] = useState({
    weekly: { target: 0, current: 0 },
    monthly: { target: 0, current: 0 },
  });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  useEffect(() => {
    if (user && logs) {
      calculateProgress();
    }
  }, [user, logs, habits]);

  const loadGoals = async () => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists() && userDoc.data().goals) {
        setGoals(userDoc.data().goals);
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const saveGoals = async (newGoals) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { goals: newGoals }, { merge: true });
      setGoals(newGoals);
    } catch (error) {
      console.error('Error saving goals:', error);
    }
  };

  const calculateProgress = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    // Calculate start of week (Sunday = 0)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Calculate start of month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    let weeklyCompletions = 0;
    let monthlyCompletions = 0;

    // Get active habit IDs (exclude archived habits)
    const activeHabitIds = new Set(
      (habits || [])
        .filter(h => h.active && !h.archived)
        .map(h => h.id)
    );

    Object.entries(logs || {}).forEach(([dateString, log]) => {
      // Parse date string (YYYY-MM-DD) properly
      const [year, month, day] = dateString.split('-').map(Number);
      const logDate = new Date(year, month - 1, day);
      logDate.setHours(0, 0, 0, 0);

      // Count completions for active habits only
      let completions = 0;
      if (log.habits) {
        Object.entries(log.habits).forEach(([habitId, completion]) => {
          // Only count if habit is active and completion is true
          if (activeHabitIds.has(habitId)) {
            const isCompleted = completion === true || 
              (typeof completion === 'object' && completion?.completed === true);
            if (isCompleted) {
              completions++;
            }
          }
        });
      }

      // Check if date is within current week (including today)
      if (logDate >= startOfWeek && logDate <= now) {
        weeklyCompletions += completions;
      }
      
      // Check if date is within current month (including today)
      if (logDate >= startOfMonth && logDate <= now) {
        monthlyCompletions += completions;
      }
    });

    setGoals(prev => ({
      ...prev,
      weekly: { ...prev.weekly, current: weeklyCompletions },
      monthly: { ...prev.monthly, current: monthlyCompletions },
    }));
  };

  const handleGoalChange = (period, value) => {
    const newGoals = {
      ...goals,
      [period]: { ...goals[period], target: parseInt(value) || 0 },
    };
    saveGoals(newGoals);
  };

  const getProgressPercentage = (current, target) => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
      <h3 className="text-lg font-semibold text-text-dark dark:text-dark-text mb-4 flex items-center gap-2">
        <span className="text-2xl">🎯</span>
        Goals
      </h3>
      <div className="space-y-4">
        {/* Weekly Goal */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-text-dark dark:text-dark-text">
              Weekly Target
            </label>
            <div className="flex items-center gap-2">
              {editing === 'weekly' ? (
                <>
                  <input
                    type="number"
                    value={goals.weekly.target}
                    onChange={(e) => handleGoalChange('weekly', e.target.value)}
                    onBlur={() => setEditing(null)}
                    className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded"
                    autoFocus
                  />
                  <span className="text-xs text-text-gray dark:text-dark-gray">completions</span>
                </>
              ) : (
                <>
                  <span className="text-sm font-semibold text-text-dark dark:text-dark-text">
                    {goals.weekly.target}
                  </span>
                  <button
                    onClick={() => setEditing('weekly')}
                    className="text-xs text-primary hover:text-primary/80"
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${getProgressPercentage(goals.weekly.current, goals.weekly.target)}%` }}
              />
            </div>
            <span className="text-xs font-medium text-text-dark dark:text-dark-text min-w-[60px] text-right">
              {goals.weekly.current}/{goals.weekly.target}
            </span>
          </div>
        </div>

        {/* Monthly Goal */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-text-dark dark:text-dark-text">
              Monthly Target
            </label>
            <div className="flex items-center gap-2">
              {editing === 'monthly' ? (
                <>
                  <input
                    type="number"
                    value={goals.monthly.target}
                    onChange={(e) => handleGoalChange('monthly', e.target.value)}
                    onBlur={() => setEditing(null)}
                    className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded"
                    autoFocus
                  />
                  <span className="text-xs text-text-gray dark:text-dark-gray">completions</span>
                </>
              ) : (
                <>
                  <span className="text-sm font-semibold text-text-dark dark:text-dark-text">
                    {goals.monthly.target}
                  </span>
                  <button
                    onClick={() => setEditing('monthly')}
                    className="text-xs text-primary hover:text-primary/80"
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${getProgressPercentage(goals.monthly.current, goals.monthly.target)}%` }}
              />
            </div>
            <span className="text-xs font-medium text-text-dark dark:text-dark-text min-w-[60px] text-right">
              {goals.monthly.current}/{goals.monthly.target}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalsTracker;


/**
 * Streak Calculator Utility
 * Calculates current streak and best streak for habits
 */

/**
 * Calculate current and best streaks for a habit
 * @param {string} habitId - The habit ID
 * @param {Object} dailyLogs - Object with dateString keys containing habit data
 * @returns {Object} { currentStreak: number, bestStreak: number, streakDates: array }
 */
export const calculateStreaks = (habitId, dailyLogs) => {
  if (!dailyLogs || Object.keys(dailyLogs).length === 0) {
    return { currentStreak: 0, bestStreak: 0, streakDates: [] };
  }

  // Get all dates with this habit completed, sorted
  const completedDates = Object.entries(dailyLogs)
    .filter(([_, log]) => log.habits && log.habits[habitId] === true)
    .map(([date, _]) => date)
    .sort();

  if (completedDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0, streakDates: [] };
  }

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 1;
  let streakStartDate = completedDates[0];

  // Calculate streaks
  for (let i = 0; i < completedDates.length; i++) {
    if (i === 0) continue;

    const prevDate = new Date(completedDates[i - 1]);
    const currDate = new Date(completedDates[i]);
    const diffTime = currDate - prevDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      tempStreak++;
    } else {
      // Streak broken
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
      tempStreak = 1;
      streakStartDate = completedDates[i];
    }
  }

  // Check final streak
  if (tempStreak > bestStreak) {
    bestStreak = tempStreak;
  }

  // Calculate current streak (consecutive days up to today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastCompletedDate = new Date(completedDates[completedDates.length - 1]);
  lastCompletedDate.setHours(0, 0, 0, 0);
  
  const diffTime = today - lastCompletedDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // If completed today or yesterday, calculate backward streak
  if (diffDays <= 1) {
    currentStreak = 1;
    for (let i = completedDates.length - 2; i >= 0; i--) {
      const checkDate = new Date(completedDates[i]);
      const nextDate = new Date(completedDates[i + 1]);
      
      checkDate.setHours(0, 0, 0, 0);
      nextDate.setHours(0, 0, 0, 0);
      
      const daysApart = Math.floor((nextDate - checkDate) / (1000 * 60 * 60 * 24));
      
      if (daysApart === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  } else {
    currentStreak = 0;
  }

  return {
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak),
    streakDates: completedDates.slice(-currentStreak),
  };
};

/**
 * Get milestone badge based on streak
 * @param {number} streak - Current streak count
 * @returns {Object|null} { emoji, label, color } or null
 */
export const getMilestoneBadge = (streak) => {
  if (streak >= 100) {
    return { emoji: '🔥', label: '100-day Streak!', color: 'text-red-500' };
  }
  if (streak >= 30) {
    return { emoji: '⭐', label: '30-day Streak!', color: 'text-yellow-500' };
  }
  if (streak >= 7) {
    return { emoji: '🎯', label: '7-day Streak!', color: 'text-orange-500' };
  }
  return null;
};

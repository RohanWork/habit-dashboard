// Goal and Milestone Tracking Utilities

/**
 * Calculate progress towards a habit's goal
 * @param {Object} habit - Habit object with goal settings
 * @param {Object} dailyLogs - Object keyed by date string with daily log data
 * @param {Date} periodStart - Start of the goal period
 * @param {Date} periodEnd - End of the goal period
 * @returns {Object} Progress data
 */
export const calculateGoalProgress = (habit, dailyLogs, periodStart, periodEnd) => {
  if (!habit.goal || !habit.goal.enabled) {
    return null;
  }

  const target = habit.goal.target;
  const period = habit.goal.period || 'week';
  
  // Count completions in the period
  let completions = 0;
  const currentDate = new Date(periodStart);
  
  while (currentDate <= periodEnd) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const log = dailyLogs[dateStr];
    
    if (log && log.habits && log.habits[habit.id]) {
      const completion = log.habits[habit.id];
      // Check if habit is completed (supports both boolean and object format)
      if (completion === true || (typeof completion === 'object' && completion.completed === true)) {
        completions++;
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const progress = Math.min(100, (completions / target) * 100);
  const remaining = Math.max(0, target - completions);
  const isAchieved = completions >= target;

  return {
    target,
    completions,
    remaining,
    progress,
    isAchieved,
    period,
  };
};

/**
 * Calculate milestones for a habit
 * @param {Object} habit - Habit object
 * @param {Object} dailyLogs - Object keyed by date string
 * @returns {Array} Array of milestone achievements
 */
export const calculateMilestones = (habit, dailyLogs) => {
  const milestones = [];
  
  // Count total completions
  let totalCompletions = 0;
  let currentStreak = 0;
  let bestStreak = 0;
  let lastDate = null;
  
  // Sort dates
  const dates = Object.keys(dailyLogs).sort();
  
  dates.forEach(dateStr => {
    const log = dailyLogs[dateStr];
    if (log && log.habits && log.habits[habit.id]) {
      const completion = log.habits[habit.id];
      if (completion === true || (typeof completion === 'object' && completion.completed === true)) {
        totalCompletions++;
        
        const date = new Date(dateStr);
        if (lastDate) {
          const daysDiff = Math.floor((date - lastDate) / (1000 * 60 * 60 * 24));
          if (daysDiff === 1) {
            currentStreak++;
          } else {
            bestStreak = Math.max(bestStreak, currentStreak);
            currentStreak = 1;
          }
        } else {
          currentStreak = 1;
        }
        lastDate = date;
      }
    }
  });
  
  bestStreak = Math.max(bestStreak, currentStreak);

  // Define milestone thresholds
  const milestoneThresholds = [
    { count: 1, label: 'First Step', icon: '🎯' },
    { count: 7, label: 'Week Warrior', icon: '🔥' },
    { count: 30, label: 'Monthly Master', icon: '⭐' },
    { count: 50, label: 'Half Century', icon: '💪' },
    { count: 100, label: 'Century Club', icon: '🏆' },
    { count: 200, label: 'Double Century', icon: '👑' },
    { count: 365, label: 'Year Champion', icon: '🌟' },
  ];

  const streakMilestones = [
    { streak: 3, label: '3-Day Streak', icon: '🔥' },
    { streak: 7, label: 'Week Streak', icon: '💪' },
    { streak: 14, label: '2-Week Streak', icon: '⭐' },
    { streak: 30, label: 'Monthly Streak', icon: '🏆' },
    { streak: 60, label: '2-Month Streak', icon: '👑' },
    { streak: 100, label: '100-Day Streak', icon: '🌟' },
  ];

  // Check completion milestones
  milestoneThresholds.forEach(threshold => {
    if (totalCompletions >= threshold.count) {
      milestones.push({
        type: 'completion',
        ...threshold,
        achieved: true,
        achievedAt: totalCompletions === threshold.count ? new Date() : null,
      });
    }
  });

  // Check streak milestones
  streakMilestones.forEach(threshold => {
    if (bestStreak >= threshold.streak) {
      milestones.push({
        type: 'streak',
        ...threshold,
        achieved: true,
        achievedAt: null, // Could track when achieved
      });
    }
  });

  return milestones.sort((a, b) => {
    // Sort by type (completion first), then by count/streak
    if (a.type !== b.type) {
      return a.type === 'completion' ? -1 : 1;
    }
    return (a.count || a.streak) - (b.count || b.streak);
  });
};

/**
 * Get next milestone for a habit
 * @param {Object} habit - Habit object
 * @param {Object} dailyLogs - Object keyed by date string
 * @returns {Object|null} Next milestone to achieve
 */
export const getNextMilestone = (habit, dailyLogs) => {
  const milestones = calculateMilestones(habit, dailyLogs);
  const achieved = milestones.filter(m => m.achieved);
  
  // Count total completions and best streak
  let totalCompletions = 0;
  let bestStreak = 0;
  let currentStreak = 0;
  let lastDate = null;
  
  const dates = Object.keys(dailyLogs).sort();
  dates.forEach(dateStr => {
    const log = dailyLogs[dateStr];
    if (log && log.habits && log.habits[habit.id]) {
      const completion = log.habits[habit.id];
      if (completion === true || (typeof completion === 'object' && completion.completed === true)) {
        totalCompletions++;
        const date = new Date(dateStr);
        if (lastDate) {
          const daysDiff = Math.floor((date - lastDate) / (1000 * 60 * 60 * 24));
          if (daysDiff === 1) {
            currentStreak++;
          } else {
            bestStreak = Math.max(bestStreak, currentStreak);
            currentStreak = 1;
          }
        } else {
          currentStreak = 1;
        }
        lastDate = date;
      }
    }
  });
  bestStreak = Math.max(bestStreak, currentStreak);

  // Find next completion milestone
  const completionMilestones = [1, 7, 30, 50, 100, 200, 365];
  const nextCompletion = completionMilestones.find(count => totalCompletions < count);
  
  // Find next streak milestone
  const streakMilestones = [3, 7, 14, 30, 60, 100];
  const nextStreak = streakMilestones.find(streak => bestStreak < streak);

  if (nextCompletion && nextStreak) {
    const completionProgress = nextCompletion - totalCompletions;
    const streakProgress = nextStreak - bestStreak;
    
    // Return the closer milestone
    if (completionProgress <= streakProgress) {
      return {
        type: 'completion',
        count: nextCompletion,
        label: `Complete ${nextCompletion} times`,
        progress: totalCompletions,
        remaining: completionProgress,
      };
    } else {
      return {
        type: 'streak',
        streak: nextStreak,
        label: `${nextStreak}-day streak`,
        progress: bestStreak,
        remaining: streakProgress,
      };
    }
  } else if (nextCompletion) {
    return {
      type: 'completion',
      count: nextCompletion,
      label: `Complete ${nextCompletion} times`,
      progress: totalCompletions,
      remaining: nextCompletion - totalCompletions,
    };
  } else if (nextStreak) {
    return {
      type: 'streak',
      streak: nextStreak,
      label: `${nextStreak}-day streak`,
      progress: bestStreak,
      remaining: nextStreak - bestStreak,
    };
  }

  return null;
};


/**
 * Achievement System
 * Badge definitions and calculation logic
 */

export const ACHIEVEMENTS = [
  {
    id: 'first_habit',
    name: 'Getting Started',
    description: 'Created your first habit',
    emoji: '🎯',
    condition: (stats) => stats.totalHabits >= 1,
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: '7-day streak on any habit',
    emoji: '🔥',
    condition: (stats) => stats.maxStreak >= 7,
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: '30-day streak on any habit',
    emoji: '⭐',
    condition: (stats) => stats.maxStreak >= 30,
  },
  {
    id: 'streak_100',
    name: 'Centurion',
    description: '100-day streak on any habit',
    emoji: '🏆',
    condition: (stats) => stats.maxStreak >= 100,
  },
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: '100% completion for a week',
    emoji: '✨',
    condition: (stats) => stats.perfectWeeks >= 1,
  },
  {
    id: 'perfect_month',
    name: 'Perfect Month',
    description: '100% completion for a month',
    emoji: '💎',
    condition: (stats) => stats.perfectMonths >= 1,
  },
  {
    id: 'habit_master',
    name: 'Habit Master',
    description: '10 active habits',
    emoji: '👑',
    condition: (stats) => stats.totalHabits >= 10,
  },
  {
    id: 'consistency_king',
    name: 'Consistency King',
    description: '80%+ consistency for 30 days',
    emoji: '🎖️',
    condition: (stats) => stats.consistency30Days >= 80,
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete habits before 8 AM for 7 days',
    emoji: '🌅',
    condition: (stats) => stats.earlyCompletions >= 7,
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete habits after 10 PM for 7 days',
    emoji: '🦉',
    condition: (stats) => stats.lateCompletions >= 7,
  },
];

/**
 * Calculate user statistics for achievements
 */
export const calculateAchievementStats = (habits, logs) => {
  const stats = {
    totalHabits: habits.length,
    maxStreak: 0,
    perfectWeeks: 0,
    perfectMonths: 0,
    consistency30Days: 0,
    earlyCompletions: 0,
    lateCompletions: 0,
  };

  // Find max streak
  habits.forEach(habit => {
    if (habit.currentStreak > stats.maxStreak) {
      stats.maxStreak = habit.currentStreak;
    }
  });

  // Calculate perfect weeks/months (simplified - would need more detailed log analysis)
  // This is a placeholder - you'd need to analyze logs by week/month
  
  return stats;
};

/**
 * Get unlocked achievements
 */
export const getUnlockedAchievements = (habits, logs) => {
  const stats = calculateAchievementStats(habits, logs);
  
  return ACHIEVEMENTS.filter(achievement => achievement.condition(stats));
};



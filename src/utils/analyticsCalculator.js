/**
 * Analytics Calculator Utility
 * Computes completion rates, habit rankings, and correlations
 */

/**
 * Calculate completion rate trends over time
 * @param {Array} dailyLogs - Array of daily log objects with date and habits
 * @param {string} period - 'daily', 'weekly', or 'monthly'
 * @param {number} habits - Total number of habits
 * @returns {Array} Trend data with dates and completion percentages
 */
export const calculateCompletionTrends = (dailyLogs, period = 'daily', totalHabits = 1) => {
  if (!dailyLogs || dailyLogs.length === 0 || totalHabits === 0) {
    return [];
  }

  const trends = {};

  dailyLogs.forEach((log) => {
    if (!log.date) return;

    const date = new Date(log.date);
    let key;

    if (period === 'weekly') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else if (period === 'monthly') {
      key = log.date.substring(0, 7); // YYYY-MM
    } else {
      key = log.date;
    }

    if (!trends[key]) {
      trends[key] = { completed: 0, total: 0, date: key };
    }

    const completedCount = log.habits
      ? Object.values(log.habits).filter((v) => v === true).length
      : 0;
    trends[key].completed += completedCount;
    trends[key].total += totalHabits; // Count total possible completions for this day
  });

  return Object.values(trends)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((item) => ({
      date: item.date,
      completion: item.total > 0 ? Math.min(100, Math.round((item.completed / item.total) * 100)) : 0,
    }));
};

/**
 * Calculate best and worst performing habits
 * @param {Array} habits - Array of habit objects
 * @param {Array} dailyLogs - Array of daily log objects
 * @returns {Object} { bestHabits: [], worstHabits: [] }
 */
export const calculateHabitRankings = (habits, dailyLogs) => {
  if (!habits || habits.length === 0 || !dailyLogs || dailyLogs.length === 0) {
    return { bestHabits: [], worstHabits: [] };
  }

  const habitStats = {};

  habits.forEach((habit) => {
    habitStats[habit.id] = {
      id: habit.id,
      name: habit.name,
      category: habit.category,
      completed: 0,
      total: 0,
      currentStreak: habit.currentStreak || 0,
      bestStreak: habit.bestStreak || 0,
    };
  });

  dailyLogs.forEach((log) => {
    habits.forEach((habit) => {
      habitStats[habit.id].total++;
      if (log.habits && log.habits[habit.id] === true) {
        habitStats[habit.id].completed++;
      }
    });
  });

  const rankings = Object.values(habitStats)
    .map((stat) => ({
      ...stat,
      completionRate: stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0,
    }))
    .sort((a, b) => b.completionRate - a.completionRate);

  return {
    bestHabits: rankings.slice(0, 5),
    worstHabits: rankings.slice(-5).reverse(),
    allHabits: rankings,
  };
};

/**
 * Calculate habit correlations (which habits are done together)
 * @param {Array} habits - Array of habit objects
 * @param {Array} dailyLogs - Array of daily log objects
 * @returns {Array} Correlation data with pairs and support percentage
 */
export const calculateHabitCorrelations = (habits, dailyLogs) => {
  if (!habits || habits.length < 2 || !dailyLogs || dailyLogs.length === 0) {
    return [];
  }

  const correlations = {};
  const habitCompletions = {};

  // Count individual completions
  habits.forEach((habit) => {
    habitCompletions[habit.id] = 0;
  });

  dailyLogs.forEach((log) => {
    if (!log.habits) return;

    const completedHabits = habits
      .filter((h) => log.habits[h.id] === true)
      .map((h) => h.id);

    // Count individual completions
    completedHabits.forEach((habitId) => {
      habitCompletions[habitId]++;
    });

    // Count co-occurrences
    for (let i = 0; i < completedHabits.length; i++) {
      for (let j = i + 1; j < completedHabits.length; j++) {
        const pair = [completedHabits[i], completedHabits[j]].sort().join('-');
        correlations[pair] = (correlations[pair] || 0) + 1;
      }
    }
  });

  // Calculate support (% of days both habits were done together)
  const correlationList = Object.entries(correlations)
    .map(([pair, coOccurrences]) => {
      const [habit1Id, habit2Id] = pair.split('-');
      const habit1 = habits.find((h) => h.id === habit1Id);
      const habit2 = habits.find((h) => h.id === habit2Id);
      const support = Math.round((coOccurrences / dailyLogs.length) * 100);

      return {
        habit1: habit1?.name || habit1Id,
        habit2: habit2?.name || habit2Id,
        coOccurrences,
        support,
        displayText: `${habit1?.name || habit1Id} ↔ ${habit2?.name || habit2Id}`,
      };
    })
    .sort((a, b) => b.support - a.support);

  return correlationList.slice(0, 10); // Top 10 correlations
};

/**
 * Predict when a habit will be completed based on historical patterns
 * @param {Object} habit - Habit object with currentStreak
 * @param {Array} dailyLogs - Array of daily log objects
 * @param {number} daysAhead - How many days to predict ahead
 * @returns {Object} Prediction with probability and likely dates
 */
export const predictHabitCompletion = (habit, dailyLogs, daysAhead = 7) => {
  if (!dailyLogs || dailyLogs.length === 0) {
    return { probability: 50, prediction: 'Not enough data' };
  }

  // Filter logs for this specific habit
  const habitLogs = dailyLogs
    .filter((log) => log.habits && log.habits[habit.id] !== undefined)
    .map((log) => ({
      date: log.date,
      completed: log.habits[habit.id] === true,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (habitLogs.length < 7) {
    return { probability: 50, prediction: 'Insufficient history' };
  }

  // Calculate completion rate from last 30 days
  const last30Days = habitLogs.slice(-30);
  const completedIn30 = last30Days.filter((log) => log.completed).length;
  const completionRate = Math.round((completedIn30 / last30Days.length) * 100);

  // Predict based on current streak
  let probability = completionRate;
  let prediction = 'Will likely continue';

  if (habit.currentStreak >= 7) {
    probability = Math.min(95, completionRate + 20);
    prediction = 'Strong momentum - very likely to continue';
  } else if (habit.currentStreak === 0) {
    probability = Math.max(30, completionRate - 15);
    prediction = 'Broke streak - needs restart';
  } else if (habit.currentStreak > 0 && habit.currentStreak < 3) {
    probability = Math.max(50, completionRate - 10);
    prediction = 'Building momentum';
  }

  return {
    habitId: habit.id,
    habitName: habit.name,
    completionRate,
    currentStreak: habit.currentStreak,
    probability: Math.min(100, Math.max(0, probability)),
    prediction,
  };
};

/**
 * Calculate completion consistency (std deviation of weekly completion)
 * @param {Array} dailyLogs - Array of daily log objects
 * @param {number} totalHabits - Total number of habits
 * @returns {Object} Consistency metrics
 */
export const calculateConsistency = (dailyLogs, totalHabits = 1) => {
  if (!dailyLogs || dailyLogs.length === 0 || totalHabits === 0) {
    return { consistency: 0, variation: 'No data' };
  }

  const trends = calculateCompletionTrends(dailyLogs, 'weekly', totalHabits);
  if (trends.length < 2) {
    return { consistency: 50, variation: 'Insufficient weeks' };
  }

  const completions = trends.map((t) => t.completion);
  const mean = completions.reduce((a, b) => a + b) / completions.length;
  const variance =
    completions.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    completions.length;
  const stdDev = Math.sqrt(variance);

  // Lower std dev = higher consistency
  const consistency = Math.max(0, 100 - stdDev);

  let variation = 'Highly consistent';
  if (stdDev > 30) variation = 'Variable';
  if (stdDev > 20) variation = 'Somewhat variable';

  return {
    consistency: Math.round(consistency),
    variation,
    stdDev: Math.round(stdDev * 10) / 10,
  };
};

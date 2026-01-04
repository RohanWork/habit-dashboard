import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { getDailyLogsByDateRange } from '../firebase/db';
import {
  calculateCompletionTrends,
  calculateHabitRankings,
  calculateHabitCorrelations,
  predictHabitCompletion,
  calculateConsistency,
} from '../utils/analyticsCalculator';

export const useAnalytics = (habits) => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !habits || habits.length === 0) {
      setLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        // Fetch last 90 days of data
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);

        const startDateString = startDate.toISOString().split('T')[0];
        const endDateString = endDate.toISOString().split('T')[0];

        const dailyLogs = await getDailyLogsByDateRange(user.uid, startDateString, endDateString);

        // Calculate all analytics
        const trends = calculateCompletionTrends(dailyLogs, 'daily', habits.length);
        const weeklyTrends = calculateCompletionTrends(dailyLogs, 'weekly', habits.length);
        const monthlyTrends = calculateCompletionTrends(dailyLogs, 'monthly', habits.length);
        const rankings = calculateHabitRankings(habits, dailyLogs);
        const correlations = calculateHabitCorrelations(habits, dailyLogs);
        const consistency = calculateConsistency(dailyLogs, habits.length);
        const predictions = habits.map((habit) =>
          predictHabitCompletion(habit, dailyLogs)
        );

        setAnalyticsData({
          dailyTrends: trends,
          weeklyTrends,
          monthlyTrends,
          bestHabits: rankings.bestHabits,
          worstHabits: rankings.worstHabits,
          allHabitStats: rankings.allHabits,
          correlations,
          consistency,
          predictions,
          period: '90 days',
        });

        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, habits]);

  return {
    analyticsData,
    loading,
    error,
  };
};

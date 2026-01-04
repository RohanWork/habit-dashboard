import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useHabits } from '../hooks/useHabits';
import { useAnalytics } from '../hooks/useAnalytics';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const Analytics = () => {
  const { user } = useAuth();
  const { habits } = useHabits(new Date().toISOString().split('T')[0]);
  const { analyticsData, loading } = useAnalytics(habits);
  const [selectedMetric, setSelectedMetric] = useState('daily'); // daily, weekly, monthly

  if (!user) {
    return (
      <div className="min-h-screen bg-bg-light dark:bg-dark-bg flex items-center justify-center">
        <p className="text-text-gray dark:text-dark-gray">Please log in to view analytics</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-light dark:bg-dark-bg flex items-center justify-center">
        <p className="text-text-gray dark:text-dark-gray">Loading analytics...</p>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-bg-light dark:bg-dark-bg flex items-center justify-center">
        <p className="text-text-gray dark:text-dark-gray">No analytics data available. Start tracking habits to see insights.</p>
      </div>
    );
  }

  const getTrendData = () => {
    switch (selectedMetric) {
      case 'weekly':
        return analyticsData.weeklyTrends;
      case 'monthly':
        return analyticsData.monthlyTrends;
      default:
        return analyticsData.dailyTrends;
    }
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-dark-bg">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-text-dark dark:text-dark-text">Analytics</h1>
          <p className="text-sm text-text-gray dark:text-dark-gray">Last 90 days of habit data</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Consistency Score */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-dark-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-text-gray dark:text-dark-gray mb-2">Consistency Score</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">{analyticsData.consistency.consistency}%</span>
            </div>
            <p className="text-xs text-text-gray dark:text-dark-gray mt-2">{analyticsData.consistency.variation}</p>
          </div>

          <div className="bg-white dark:bg-dark-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-text-gray dark:text-dark-gray mb-2">Total Habits</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">{habits.length}</span>
            </div>
            <p className="text-xs text-text-gray dark:text-dark-gray mt-2">Active habits</p>
          </div>

          <div className="bg-white dark:bg-dark-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-text-gray dark:text-dark-gray mb-2">Data Period</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-primary">{analyticsData.period}</span>
            </div>
            <p className="text-xs text-text-gray dark:text-dark-gray mt-2">Historical analysis</p>
          </div>
        </div>

        {/* Completion Trends */}
        <div className="bg-white dark:bg-dark-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-dark dark:text-dark-text">Completion Trends</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedMetric('daily')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  selectedMetric === 'daily'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-text-dark dark:text-dark-text hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setSelectedMetric('weekly')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  selectedMetric === 'weekly'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-text-dark dark:text-dark-text hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setSelectedMetric('monthly')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  selectedMetric === 'monthly'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-text-dark dark:text-dark-text hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getTrendData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke="#9CA3AF"
                tickFormatter={(date) => {
                  const d = new Date(date);
                  if (selectedMetric === 'daily') return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  if (selectedMetric === 'weekly') return `Week of ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                }}
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fontSize: 12 }} 
                stroke="#9CA3AF"
                allowDataOverflow={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFF',
                }}
                formatter={(value) => `${value}%`}
              />
              <Line
                type="monotone"
                dataKey="completion"
                stroke="#6AA84F"
                strokeWidth={2}
                dot={{ fill: '#6AA84F', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Best and Worst Habits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Best Habits */}
          <div className="bg-white dark:bg-dark-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-text-dark dark:text-dark-text mb-4">Top Performing Habits</h2>
            <div className="space-y-3">
              {analyticsData.bestHabits.map((habit, index) => (
                <div key={habit.id || `best-habit-${index}`} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div>
                    <p className="font-medium text-text-dark dark:text-dark-text">#{index + 1} {habit.name}</p>
                    <p className="text-xs text-text-gray dark:text-dark-gray">{habit.completedCount || 0} completions</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{habit.completionRate}%</p>
                    <p className="text-xs text-primary">Completion</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Worst Habits */}
          <div className="bg-white dark:bg-dark-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-text-dark dark:text-dark-text mb-4">Habits Needing Focus</h2>
            <div className="space-y-3">
              {analyticsData.worstHabits.map((habit, index) => (
                <div key={habit.id || `worst-habit-${index}`} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div>
                    <p className="font-medium text-text-dark dark:text-dark-text">{habit.name}</p>
                    <p className="text-xs text-text-gray dark:text-dark-gray">{habit.completed || 0} / {habit.total} days</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">{habit.completionRate}%</p>
                    <p className="text-xs text-red-600 dark:text-red-400">Completion</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Habit Correlations */}
        {analyticsData.correlations && analyticsData.correlations.length > 0 && (
          <div className="bg-white dark:bg-dark-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-text-dark dark:text-dark-text mb-4">Habit Correlations</h2>
            <p className="text-sm text-text-gray dark:text-dark-gray mb-4">
              Habits that are often completed together (synergistic pairs)
            </p>
            <div className="space-y-2">
              {analyticsData.correlations.map((corr, index) => (
                <div key={corr.habitPair || `correlation-${index}`} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm font-medium text-text-dark dark:text-dark-text">{corr.displayText}</p>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{corr.support}%</p>
                      <p className="text-xs text-text-gray dark:text-dark-gray">co-occur</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Predictions */}
        <div className="bg-white dark:bg-dark-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-text-dark dark:text-dark-text mb-4">Completion Predictions</h2>
          <p className="text-sm text-text-gray dark:text-dark-gray mb-4">
            Based on your historical patterns and current streaks
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analyticsData.predictions.map((pred, index) => (
              <div key={pred.habitId || `prediction-${index}`} className="p-4 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-text-dark dark:text-dark-text">{pred.habitName}</p>
                  <span className="text-sm font-semibold text-primary">{pred.probability}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${pred.probability}%` }}
                  ></div>
                </div>
                <p className="text-xs text-text-gray dark:text-dark-gray">{pred.prediction}</p>
                <p className="text-xs text-text-gray dark:text-dark-gray mt-1">
                  Completion rate: {pred.completionRate}% | Streak: {pred.currentStreak} days
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

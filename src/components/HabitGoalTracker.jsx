import React from 'react';
import { calculateGoalProgress, getNextMilestone } from '../utils/goalTracker';
import { useTheme } from '../hooks/useTheme';

const HabitGoalTracker = ({ habit, dailyLogs }) => {
  const { isDark } = useTheme();

  if (!habit) return null;

  // Calculate goal progress if goal is enabled
  const now = new Date();
  let periodStart, periodEnd;
  
  if (habit.goal?.enabled) {
    const period = habit.goal.period || 'week';
    
    if (period === 'week') {
      periodStart = new Date(now);
      periodStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      periodEnd = new Date(periodStart);
      periodEnd.setDate(periodStart.getDate() + 6);
    } else if (period === 'month') {
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (period === 'year') {
      periodStart = new Date(now.getFullYear(), 0, 1);
      periodEnd = new Date(now.getFullYear(), 11, 31);
    }
    
    const goalProgress = calculateGoalProgress(habit, dailyLogs, periodStart, periodEnd);
    const nextMilestone = getNextMilestone(habit, dailyLogs);

    return (
      <div className="mt-3 space-y-3">
        {/* Goal Progress */}
        {goalProgress && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-dark dark:text-dark-text">
                Goal: {habit.goal.target} times per {habit.goal.period}
              </span>
              <span className={`text-xs font-bold ${
                goalProgress.isAchieved ? 'text-green-600 dark:text-green-400' : 'text-primary'
              }`}>
                {goalProgress.completions}/{goalProgress.target}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
              <div
                className={`h-2 rounded-full transition-all ${
                  goalProgress.isAchieved
                    ? 'bg-green-500 dark:bg-green-400'
                    : 'bg-primary'
                }`}
                style={{ width: `${Math.min(100, goalProgress.progress)}%` }}
              />
            </div>
            {goalProgress.isAchieved ? (
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                🎉 Goal achieved!
              </p>
            ) : (
              <p className="text-xs text-text-gray dark:text-dark-gray">
                {goalProgress.remaining} more to go
              </p>
            )}
          </div>
        )}

        {/* Next Milestone */}
        {nextMilestone && (
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-lg p-3 border border-primary/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-text-dark dark:text-dark-text flex items-center gap-1">
                <span>🎯</span>
                Next Milestone
              </span>
            </div>
            <p className="text-xs text-text-dark dark:text-dark-text font-semibold mb-1">
              {nextMilestone.label}
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (nextMilestone.progress / (nextMilestone.progress + nextMilestone.remaining)) * 100)}%`,
                }}
              />
            </div>
            <p className="text-xs text-text-gray dark:text-dark-gray mt-1">
              {nextMilestone.remaining} more {nextMilestone.type === 'completion' ? 'completions' : 'days'} needed
            </p>
          </div>
        )}

        {/* Quantity/Time Stats */}
        {(habit.quantityTracking?.enabled || habit.timeTracking?.enabled) && (() => {
          // Calculate averages for the current period
          let totalQuantity = 0;
          let totalDuration = 0;
          let count = 0;
          
          const currentDate = new Date(periodStart || now);
          const endDate = new Date(periodEnd || now);
          
          while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const log = dailyLogs[dateStr];
            if (log && log.habits && log.habits[habit.id]) {
              const completion = log.habits[habit.id];
              if (typeof completion === 'object' && completion.completed) {
                if (completion.quantity) totalQuantity += completion.quantity;
                if (completion.duration) totalDuration += completion.duration;
                count++;
              }
            }
            currentDate.setDate(currentDate.getDate() + 1);
          }

          return (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-text-dark dark:text-dark-text mb-2">
                This {habit.goal?.period || 'period'} Stats
              </p>
              {habit.quantityTracking?.enabled && count > 0 && (
                <p className="text-xs text-text-gray dark:text-dark-gray">
                  Avg {habit.quantityTracking.unit}: {(totalQuantity / count).toFixed(1)}
                </p>
              )}
              {habit.timeTracking?.enabled && count > 0 && (
                <p className="text-xs text-text-gray dark:text-dark-gray">
                  Avg Duration: {Math.round(totalDuration / count)} min
                </p>
              )}
            </div>
          );
        })()}
      </div>
    );
  }

  return null;
};

export default HabitGoalTracker;


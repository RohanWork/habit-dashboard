import React from 'react';
import CircularProgress from './CircularProgress';

// Daily card component showing day, date, and habit completion progress
const DailyCard = ({ day, date, completedHabits, totalHabits, onClick, isToday = false, isSelected = false, currentStreak = 0, bestStreak = 0 }) => {
  const percentage = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

  // Determine milestone emoji (inline)
  const milestoneEmoji = currentStreak >= 100 ? '🏆' : currentStreak >= 30 ? '⭐' : currentStreak >= 7 ? '🔥' : null;

  // Use selected state if provided, otherwise fall back to isToday
  const isHighlighted = isSelected || isToday;

  return (
    <div
      onClick={onClick}
      className={`rounded-lg overflow-hidden cursor-pointer transition-all duration-150 ${
        isHighlighted ? 'shadow-lg ring-2 ring-primary' : 'shadow-sm hover:shadow-md'
      }`}
    >
      <div className={`${isHighlighted ? 'bg-primary text-white' : 'bg-white dark:bg-dark-surface'} p-3 text-center relative border-b border-gray-200 dark:border-gray-700 rounded-t-lg`}> 
        <div className={`text-sm font-semibold ${!isHighlighted && 'dark:text-dark-text'}`}>{day}</div>
        <div className={`text-xs ${isHighlighted ? 'opacity-90' : 'text-text-gray dark:text-dark-gray'}`}>{date}</div>
      </div>

      <div className="bg-white dark:bg-dark-surface p-4 flex flex-col items-center gap-3 border border-t-0 border-gray-100 dark:border-gray-700">
        <CircularProgress
          percentage={percentage}
          radius={44}
          color="#6AA84F"
          strokeWidth={8}
        />

        <p className="text-xs text-text-gray dark:text-dark-gray text-center">
          {completedHabits} of {totalHabits} habits
        </p>

        {/* Streak + Milestone Display */}
        <div className="w-full pt-2 border-t border-gray-100 dark:border-gray-700 flex flex-col items-center gap-2">

          {currentStreak > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-lg">{milestoneEmoji || '🔥'}</span>
              <span className="text-sm font-semibold text-primary">{currentStreak} day{currentStreak > 1 ? 's' : ''}</span>
            </div>
          ) : (
            <div className="text-xs text-text-gray dark:text-dark-gray">No streak yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyCard;

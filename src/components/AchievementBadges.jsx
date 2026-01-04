import React from 'react';
import { getUnlockedAchievements } from '../utils/achievements';

const AchievementBadges = ({ habits, logs }) => {
  const unlockedAchievements = getUnlockedAchievements(habits, logs);

  if (unlockedAchievements.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="text-lg font-semibold text-text-dark dark:text-dark-text mb-3 flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          Achievements
        </h3>
        <p className="text-sm text-text-gray dark:text-dark-gray">
          Complete habits to unlock achievements!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
      <h3 className="text-lg font-semibold text-text-dark dark:text-dark-text mb-4 flex items-center gap-2">
        <span className="text-2xl">🏆</span>
        Achievements ({unlockedAchievements.length})
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {unlockedAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-lg p-3 border border-primary/20 text-center"
          >
            <div className="text-3xl mb-2">{achievement.emoji}</div>
            <div className="text-xs font-semibold text-text-dark dark:text-dark-text mb-1">
              {achievement.name}
            </div>
            <div className="text-[10px] text-text-gray dark:text-dark-gray">
              {achievement.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementBadges;


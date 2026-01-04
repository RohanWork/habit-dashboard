import React, { useState } from 'react';

// Mood/Energy/Focus tracker component with sliders
const MoodTracker = ({ mood = 3, energy = 3, focus = 3, onUpdate, disabled = false }) => {
  const [localMood, setLocalMood] = useState(mood);
  const [localEnergy, setLocalEnergy] = useState(energy);
  const [localFocus, setLocalFocus] = useState(focus);

  // Sync local state when parent props change (e.g., when selecting a different date)
  React.useEffect(() => {
    setLocalMood(mood);
  }, [mood]);

  React.useEffect(() => {
    setLocalEnergy(energy);
  }, [energy]);

  React.useEffect(() => {
    setLocalFocus(focus);
  }, [focus]);

  const handleMoodChange = (value) => {
    setLocalMood(value);
    onUpdate('mood', parseInt(value));
  };

  const handleEnergyChange = (value) => {
    setLocalEnergy(value);
    onUpdate('energy', parseInt(value));
  };

  const handleFocusChange = (value) => {
    setLocalFocus(value);
    onUpdate('focus', parseInt(value));
  };

  const getMoodLabel = (value) => {
    const labels = ['', '😢', '😕', '😐', '🙂', '😄'];
    return labels[value] || '😐';
  };

  const getColor = (value) => {
    if (value <= 2) return 'text-red-500';
    if (value <= 3) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="bg-white dark:bg-dark-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700 space-y-6">
      <h3 className="text-lg font-semibold text-text-dark dark:text-dark-text">Daily Metrics</h3>

      {/* Mood */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-text-dark dark:text-dark-text">Mood</label>
          <span className={`text-2xl ${getColor(localMood)}`}>{getMoodLabel(localMood)}</span>
        </div>
        <input
          type="range"
          min="1"
          max="5"
          value={localMood}
          onChange={(e) => handleMoodChange(e.target.value)}
          disabled={disabled}
          className={`w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none accent-primary ${
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          }`}
        />
        <div className="flex justify-between text-xs text-text-gray dark:text-dark-gray">
          <span>Poor</span>
          <span>Excellent</span>
        </div>
      </div>

      {/* Energy */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-text-dark dark:text-dark-text">Energy</label>
          <span className={`text-xl font-bold ${getColor(localEnergy)}`}>{localEnergy}/5</span>
        </div>
        <input
          type="range"
          min="1"
          max="5"
          value={localEnergy}
          onChange={(e) => handleEnergyChange(e.target.value)}
          disabled={disabled}
          className={`w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none accent-primary ${
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          }`}
        />
        <div className="flex justify-between text-xs text-text-gray dark:text-dark-gray">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      {/* Focus */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-text-dark dark:text-dark-text">Focus</label>
          <span className={`text-xl font-bold ${getColor(localFocus)}`}>{localFocus}/5</span>
        </div>
        <input
          type="range"
          min="1"
          max="5"
          value={localFocus}
          onChange={(e) => handleFocusChange(e.target.value)}
          disabled={disabled}
          className={`w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none accent-primary ${
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          }`}
        />
        <div className="flex justify-between text-xs text-text-gray dark:text-dark-gray">
          <span>Scattered</span>
          <span>Laser-focused</span>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;

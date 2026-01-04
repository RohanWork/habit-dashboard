import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

/**
 * CalendarHeatmap Component
 * Displays a monthly calendar with color-coded cells based on habit completion intensity
 */
const CalendarHeatmap = ({ month, year, logs, habits }) => {
  const { isDark } = useTheme();
  const [hoveredDate, setHoveredDate] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const getCompletionPercentage = (dateString) => {
    const log = logs[dateString];
    if (!log || !habits.length) return 0;

    const completedCount = habits.filter(h => log.habits && log.habits[h.id]).length;
    return Math.round((completedCount / habits.length) * 100);
  };

  const getHeatmapColor = (percentage) => {
    if (isDark) {
      // Dark mode colors - darker backgrounds with better contrast
      if (percentage === 0) return '#374151'; // Dark gray
      if (percentage <= 25) return '#7F1D1D'; // Dark red
      if (percentage <= 50) return '#991B1B'; // Medium dark red
      if (percentage <= 75) return '#B91C1C'; // Lighter dark red
      return '#6AA84F'; // Full green (primary color - same in both modes)
    } else {
      // Light mode colors
      if (percentage === 0) return '#F3F4F6'; // Very light gray
      if (percentage <= 25) return '#FEE2E2'; // Light red
      if (percentage <= 50) return '#FECACA'; // Medium red
      if (percentage <= 75) return '#FCA5A5'; // Darker red
      return '#6AA84F'; // Full green (primary color)
    }
  };

  const getCompletedHabits = (dateString) => {
    const log = logs[dateString];
    if (!log) return [];
    return habits.filter(h => log.habits && log.habits[h.id] === true);
  };

  const handleHover = (e, dateString) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: rect.left,
      y: rect.top,
    });
    setHoveredDate(dateString);
  };

  const getDaysInMonth = (m, y) => {
    return new Date(y, m + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (m, y) => {
    return new Date(y, m, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Create grid
  const gridCells = [];
  for (let i = 0; i < firstDay; i++) {
    gridCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    gridCells.push(day);
  }

  const getDateString = (day) => {
    const date = new Date(year, month, day);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-3 text-xs font-medium">
        <span className="text-text-gray dark:text-dark-gray">Completion:</span>
        <div className="flex gap-1">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: getHeatmapColor(0) }}></div>
            <span className="text-text-gray dark:text-dark-gray">0%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: getHeatmapColor(25) }}></div>
            <span className="text-text-gray dark:text-dark-gray">25%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: getHeatmapColor(50) }}></div>
            <span className="text-text-gray dark:text-dark-gray">50%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: getHeatmapColor(75) }}></div>
            <span className="text-text-gray dark:text-dark-gray">75%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: getHeatmapColor(100) }}></div>
            <span className="text-text-gray dark:text-dark-gray">100%</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-gray-700 p-4 overflow-x-auto">
        <div className="grid grid-cols-7 gap-2 min-w-80">
          {/* Day names */}
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-bold text-text-gray dark:text-dark-gray py-2"
            >
              {day}
            </div>
          ))}

          {/* Calendar cells */}
          {gridCells.map((day, index) => {
            const dateString = day ? getDateString(day) : null;
            const percentage = day ? getCompletionPercentage(dateString) : 0;
            const completedHabits = day ? getCompletedHabits(dateString) : [];
            const isCurrentDay = day && isToday(day);

            return (
              <div
                key={index}
                onMouseEnter={(e) => day && handleHover(e, dateString)}
                onMouseLeave={() => setHoveredDate(null)}
                className={`aspect-square rounded-lg p-2 text-center relative transition-all cursor-default ${
                  day
                    ? 'hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/30 border border-gray-200 dark:border-gray-700'
                    : 'bg-gray-50 dark:bg-gray-800'
                } ${isCurrentDay ? 'border-2 border-primary' : ''}`}
                style={{
                  backgroundColor: day ? getHeatmapColor(percentage) : undefined,
                }}
              >
                {day && (
                  <>
                    {/* Day number */}
                    <div className={`text-xs font-bold mb-1 ${
                      percentage === 0 
                        ? 'text-text-gray dark:text-dark-gray' 
                        : isDark 
                          ? 'text-dark-text' 
                          : 'text-text-dark'
                    }`}>
                      {day}
                    </div>

                    {/* Completion percentage */}
                    <div className={`text-[10px] font-semibold ${
                      percentage === 0 
                        ? 'text-text-gray dark:text-dark-gray' 
                        : percentage === 100
                          ? 'text-white dark:text-white'
                          : isDark
                            ? 'text-dark-text'
                            : 'text-primary'
                    }`}>
                      {percentage}%
                    </div>

                    {/* Habit dots */}
                    {completedHabits.length > 0 && (
                      <div className="flex justify-center gap-0.5 mt-1 flex-wrap">
                        {completedHabits.slice(0, 3).map((habit) => (
                          <div
                            key={habit.id}
                            className="w-1.5 h-1.5 bg-primary rounded-full"
                            title={habit.name}
                          ></div>
                        ))}
                        {completedHabits.length > 3 && (
                          <span className="text-[8px] text-text-dark dark:text-dark-text font-bold">
                            +{completedHabits.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredDate && (
        <div
          className="fixed bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-xs max-w-48 z-50 pointer-events-none"
          style={{
            left: `${tooltipPos.x + 20}px`,
            top: `${tooltipPos.y - 40}px`,
          }}
        >
          <div className="font-semibold mb-1">
            {new Date(hoveredDate).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </div>
          <div className="text-gray-300 mb-1">
            Completion: {getCompletionPercentage(hoveredDate)}%
          </div>
          {getCompletedHabits(hoveredDate).length > 0 ? (
            <div>
              <div className="text-gray-300 mb-1">Completed:</div>
              <ul className="list-disc list-inside">
                {getCompletedHabits(hoveredDate).map((habit) => (
                  <li key={habit.id} className="text-green-300">
                    {habit.name}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-gray-400">No habits completed</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarHeatmap;

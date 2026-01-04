import React from 'react';

// Custom SVG circular progress component
// Configurable radius, percentage, and color
const CircularProgress = ({ percentage = 0, radius = 60, color = '#6AA84F', strokeWidth = 8 }) => {
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const size = radius * 2 + strokeWidth * 2;

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle (track) */}
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          fill="none"
          stroke="#EEF2E9"
          className="dark:stroke-gray-700"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress circle */}
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s',
          }}
        />
      </svg>

      {/* Percentage text in center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-lg sm:text-2xl font-semibold text-text-dark dark:text-dark-text">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};

export default CircularProgress;

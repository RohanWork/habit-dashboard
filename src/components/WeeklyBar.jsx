import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../hooks/useTheme';

// Weekly bar chart showing habit completion by day
const WeeklyBar = ({ data }) => {
  // data format: [{ day: 'Mon', completion: 80 }, ...]
  const { isDark } = useTheme();

  const COLORS = ['#6AA84F', '#81C784', '#A5D6A7', '#C8E6C9', '#E8F5E9'];

  return (
    <div className="w-full h-64 bg-white dark:bg-dark-surface p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: isDark ? '#D1D5DB' : '#6B7280' }} stroke={isDark ? '#9CA3AF' : '#6B7280'} />
          <YAxis tick={{ fontSize: 12, fill: isDark ? '#D1D5DB' : '#6B7280' }} stroke={isDark ? '#9CA3AF' : '#6B7280'} domain={[0, 100]} />
          <Tooltip
            formatter={(value) => `${value}%`}
            contentStyle={{
              backgroundColor: isDark ? '#111827' : '#F3F7F1',
              border: `1px solid ${isDark ? '#374151' : '#6AA84F'}`,
              borderRadius: '8px',
              color: isDark ? '#F3F4F6' : '#1F2937',
            }}
          />
          <Bar dataKey="completion" fill="#6AA84F" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyBar;

/**
 * Export Utilities
 * Functions to export habit data to CSV format
 */

/**
 * Convert array of objects to CSV string
 */
const arrayToCSV = (data, headers) => {
  if (!data || data.length === 0) return '';

  // Create header row
  const headerRow = headers.map(h => `"${h}"`).join(',');
  
  // Create data rows
  const dataRows = data.map(row => {
    return headers.map(header => {
      const value = row[header] || '';
      // Escape quotes and wrap in quotes
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
};

/**
 * Export habits to CSV
 */
export const exportHabitsToCSV = (habits) => {
  const headers = ['Name', 'Category', 'Icon', 'Current Streak', 'Best Streak', 'Created Date', 'Status'];
  
  const data = habits.map(habit => ({
    Name: habit.name || '',
    Category: habit.category || '',
    Icon: habit.emoji || '',
    'Current Streak': habit.currentStreak || 0,
    'Best Streak': habit.bestStreak || 0,
    'Created Date': habit.createdAt || '',
    Status: habit.archived ? 'Archived' : (habit.active ? 'Active' : 'Inactive'),
  }));

  return arrayToCSV(data, headers);
};

/**
 * Export daily logs to CSV
 */
export const exportLogsToCSV = (logs, habits) => {
  const headers = ['Date', 'Mood', 'Energy', 'Focus', ...habits.map(h => h.name)];
  
  const data = logs.map(log => {
    const row = {
      Date: log.date || '',
      Mood: log.mood || '',
      Energy: log.energy || '',
      Focus: log.focus || '',
    };
    
    // Add completion status for each habit
    habits.forEach(habit => {
      row[habit.name] = log.habits && log.habits[habit.id] ? 'Yes' : 'No';
    });
    
    return row;
  });

  return arrayToCSV(data, headers);
};

/**
 * Download CSV file
 */
export const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export all data to CSV
 */
export const exportAllDataToCSV = (habits, logs) => {
  const timestamp = new Date().toISOString().split('T')[0];
  
  // Export habits
  const habitsCSV = exportHabitsToCSV(habits);
  downloadCSV(habitsCSV, `habits_export_${timestamp}.csv`);
  
  // Export logs
  const logsCSV = exportLogsToCSV(logs, habits);
  downloadCSV(logsCSV, `daily_logs_export_${timestamp}.csv`);
};



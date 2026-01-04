import React from 'react';
import { getCategoryById } from '../utils/habitCategories';

const PrintReport = ({ habits, logs, month, year, allCategories = null }) => {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = `${monthNames[month]} ${year}`;
  
  // Practical date formatting: "January 4, 2026" (no zero padding on day)
  const formatDate = (date) => {
    const d = new Date(date);
    return `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };
  
  // Format month range: "January 1 - 31, 2026"
  const formatMonthRange = () => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return `${monthNames[month]} ${firstDay.getDate()} - ${lastDay.getDate()}, ${year}`;
  };
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Calculate statistics
  const totalHabits = habits.length;
  const activeHabits = habits.filter(h => !h.archived && h.active).length;
  
  let totalCompletions = 0;
  let daysWithCompletions = 0;
  
  Object.values(logs || {}).forEach(log => {
    const completions = Object.values(log.habits || {}).filter(Boolean).length;
    if (completions > 0) {
      totalCompletions += completions;
      daysWithCompletions++;
    }
  });
  
  const averageDailyCompletions = daysWithCompletions > 0 
    ? (totalCompletions / daysWithCompletions).toFixed(1)
    : 0;
  
  const completionRate = totalHabits > 0 && daysWithCompletions > 0
    ? ((totalCompletions / (activeHabits * daysWithCompletions)) * 100).toFixed(1)
    : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-dark dark:text-dark-text flex items-center gap-2">
          <span className="text-2xl">📄</span>
          Monthly Report
        </h3>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium text-sm transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Report
        </button>
      </div>

      <div className="print:block hidden print:absolute print:inset-0 print:p-4 print:bg-white">
        <style>{`
          @media print {
            @page {
              margin: 0.8cm;
              size: A4;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-content {
              page-break-after: avoid;
            }
            table {
              page-break-inside: avoid;
            }
            tr {
              page-break-inside: avoid;
            }
          }
        `}</style>
        <div className="print-content">
          {/* Header */}
          <div className="mb-3 pb-2 border-b-2 border-gray-400">
            <h1 className="text-2xl font-bold mb-1 text-gray-900">Habit Tracker Report</h1>
            <div className="flex items-center justify-between text-sm">
              <p className="text-gray-700 font-semibold">{formatMonthRange()}</p>
              <p className="text-gray-500">Generated on {formatDate(new Date())}</p>
            </div>
          </div>
          
          {/* Summary Section */}
          <div className="mb-4">
            <h2 className="text-lg font-bold mb-2 text-gray-900 border-b border-gray-400 pb-1">Summary</h2>
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-gray-100 p-2 rounded border border-gray-300">
                <p className="text-xs text-gray-700 mb-1 font-medium">Total Habits</p>
                <p className="text-xl font-bold text-gray-900">{totalHabits}</p>
              </div>
              <div className="bg-gray-100 p-2 rounded border border-gray-300">
                <p className="text-xs text-gray-700 mb-1 font-medium">Active Habits</p>
                <p className="text-xl font-bold text-gray-900">{activeHabits}</p>
              </div>
              <div className="bg-gray-100 p-2 rounded border border-gray-300">
                <p className="text-xs text-gray-700 mb-1 font-medium">Total Completions</p>
                <p className="text-xl font-bold text-gray-900">{totalCompletions}</p>
              </div>
              <div className="bg-gray-100 p-2 rounded border border-gray-300">
                <p className="text-xs text-gray-700 mb-1 font-medium">Completion Rate</p>
                <p className="text-xl font-bold text-gray-900">{completionRate}%</p>
              </div>
            </div>
          </div>

          {/* Habits Table */}
          <div className="mb-3">
            <h2 className="text-lg font-bold mb-2 text-gray-900 border-b border-gray-400 pb-1">Habits Overview</h2>
            <table className="w-full border-collapse border border-gray-400 text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-400 text-left p-1.5 font-bold text-gray-900">Habit</th>
                  <th className="border border-gray-400 text-left p-1.5 font-bold text-gray-900">Category</th>
                  <th className="border border-gray-400 text-center p-1.5 font-bold text-gray-900">Completions</th>
                  <th className="border border-gray-400 text-center p-1.5 font-bold text-gray-900">Current Streak</th>
                  <th className="border border-gray-400 text-center p-1.5 font-bold text-gray-900">Best Streak</th>
                </tr>
              </thead>
              <tbody>
                {habits.filter(h => !h.archived).map((habit, index) => {
                  const completions = Object.values(logs || {}).reduce((count, log) => {
                    return count + (log.habits?.[habit.id] ? 1 : 0);
                  }, 0);
                  
                  const categoryLabel = habit.category ? (getCategoryById(habit.category, allCategories)?.label || habit.category) : 'N/A';
                  
                  return (
                    <tr key={habit.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-400 p-1.5 text-gray-900">
                        <span className="flex items-center gap-1">
                          {habit.emoji && <span className="text-sm">{habit.emoji}</span>}
                          <span className="font-medium text-xs">{habit.name}</span>
                        </span>
                      </td>
                      <td className="border border-gray-400 p-1.5 text-gray-700 text-xs">{categoryLabel}</td>
                      <td className="border border-gray-400 p-1.5 text-center text-gray-900 font-semibold text-xs">{completions}</td>
                      <td className="border border-gray-400 p-1.5 text-center text-gray-900 font-semibold text-xs">{habit.currentStreak || 0}</td>
                      <td className="border border-gray-400 p-1.5 text-center text-gray-900 font-semibold text-xs">{habit.bestStreak || 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="mt-3 pt-2 border-t border-gray-400 text-xs text-gray-500 text-center">
            <p>This report was generated automatically by Habit Tracker</p>
          </div>

        </div>
      </div>

      <div className="print:hidden">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-text-gray dark:text-dark-gray mb-1">Total Habits</p>
            <p className="text-2xl font-bold text-text-dark dark:text-dark-text">{totalHabits}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-text-gray dark:text-dark-gray mb-1">Active Habits</p>
            <p className="text-2xl font-bold text-text-dark dark:text-dark-text">{activeHabits}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-text-gray dark:text-dark-gray mb-1">Total Completions</p>
            <p className="text-2xl font-bold text-text-dark dark:text-dark-text">{totalCompletions}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-text-gray dark:text-dark-gray mb-1">Completion Rate</p>
            <p className="text-2xl font-bold text-text-dark dark:text-dark-text">{completionRate}%</p>
          </div>
        </div>
        <p className="text-xs text-text-gray dark:text-dark-gray">
          Click "Print Report" to generate a printable version
        </p>
      </div>
    </div>
  );
};

export default PrintReport;


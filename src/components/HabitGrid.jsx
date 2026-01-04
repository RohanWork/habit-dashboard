import React, { useState } from 'react';
import { getCategoryColor, getCategoryById } from '../utils/habitCategories';
import { useTheme } from '../hooks/useTheme';
import HabitCompletionModal from './HabitCompletionModal';
import HabitGoalTracker from './HabitGoalTracker';

// Habit grid component for monthly view with checkboxes
const HabitGrid = ({ habits, logs, currentMonth, onToggleHabit, allCategories = null, onDeleteHabit = null, onArchiveHabit = null, onUnarchiveHabit = null, onUpdateHabit = null, onEditHabit = null, newlyCreatedHabits = new Set() }) => {
  const { isDark } = useTheme();
  const [expandedHabits, setExpandedHabits] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [editingNotes, setEditingNotes] = useState(null);
  const [notesValue, setNotesValue] = useState('');
  const [completionModal, setCompletionModal] = useState({ isOpen: false, habit: null, date: null });

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const toggleHabitExpand = (habitId) => {
    setExpandedHabits(prev => ({
      ...prev,
      [habitId]: !prev[habitId],
    }));
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  // Create grid: prefix empty cells for days before month starts
  const gridDays = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  
  // Group into weeks (7 days per row) and pad last week with empty cells
  const weeks = [];
  for (let i = 0; i < gridDays.length; i += 7) {
    const week = gridDays.slice(i, i + 7);
    // Pad week to 7 days
    while (week.length < 7) {
      week.push(null);
    }
    weeks.push(week);
  }

  const getDateString = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayStr = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const isHabitCompleted = (habitId, day) => {
    if (!day) return false;
    const completion = logs[getDateString(day)]?.habits?.[habitId];
    return completion === true || (typeof completion === 'object' && completion?.completed === true);
  };

  const getCompletionData = (habitId, day) => {
    if (!day) return null;
    const completion = logs[getDateString(day)]?.habits?.[habitId];
    return typeof completion === 'object' ? completion : null;
  };

  const isFutureDate = (day) => {
    if (!day) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    selectedDate.setHours(0, 0, 0, 0);
    return selectedDate > today;
  };

  const handleHabitClick = (habit, day) => {
    if (!day) return;
    const dateStr = getDateString(day);
    const isCompleted = isHabitCompleted(habit.id, day);
    
    // Check if date is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(dateStr);
    selectedDate.setHours(0, 0, 0, 0);
    
    // Allow uncompleting future dates, but prevent completing them
    if (!isCompleted && selectedDate > today) {
      alert('Cannot mark future dates as completed. Please select today or a past date.');
      return;
    }
    
    // If habit has quantity/time tracking and is not completed, show modal
    if (!isCompleted && (habit.quantityTracking?.enabled || habit.timeTracking?.enabled)) {
      setCompletionModal({
        isOpen: true,
        habit: habit,
        date: dateStr,
      });
    } else {
      // Simple toggle
      onToggleHabit(habit.id, dateStr);
    }
  };

  const handleCompletionSubmit = (completionData) => {
    if (completionModal.habit && completionModal.date) {
      onToggleHabit(completionModal.habit.id, completionModal.date, completionData);
    }
    setCompletionModal({ isOpen: false, habit: null, date: null });
  };

  return (
    <div className="space-y-3">
      {habits.length === 0 ? (
        <div className="text-center py-8 text-text-gray dark:text-dark-gray">
          <p>No habits yet. Create one to get started!</p>
        </div>
      ) : (
        <>
          {habits.map((habit) => {
            const completedCount = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(
              day => isHabitCompleted(habit.id, day)
            ).length;

            return (
              <div 
                key={habit.id} 
                className={`border rounded-lg overflow-hidden transition-all duration-500 ${
                  newlyCreatedHabits.has(habit.id)
                    ? 'border-primary shadow-lg ring-2 ring-primary/20 bg-primary/5 dark:bg-primary/10'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {/* Habit header */}
                <div
                onClick={() => toggleHabitExpand(habit.id)}
                className={`bg-white dark:bg-dark-surface p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 transition-colors ${
                  newlyCreatedHabits.has(habit.id) ? 'bg-primary/5 dark:bg-primary/10' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {habit.emoji && <span className="text-xl">{habit.emoji}</span>}
                    <h3 className="font-semibold text-text-dark dark:text-dark-text">
                      {habit.name}
                    </h3>
                    {habit.archived && (
                      <span className="text-xs bg-gray-200 dark:bg-gray-700 text-text-gray dark:text-dark-gray px-2 py-0.5 rounded">
                        Archived
                      </span>
                    )}
                  </div>
                  {habit.category && (
                    <div className="mt-1">
                      <span
                        className="text-xs font-medium px-2 py-1 rounded inline-block"
                        style={{
                          backgroundColor: getCategoryColor(habit.category, allCategories, isDark).bg,
                          color: getCategoryColor(habit.category, allCategories, isDark).text,
                          borderLeft: `3px solid ${getCategoryColor(habit.category, allCategories, isDark).border}`,
                        }}
                      >
                        {getCategoryById(habit.category, allCategories).label}
                      </span>
                    </div>
                  )}
                  {habit.notes && editingNotes !== habit.id && (
                    <p 
                      className="text-xs text-text-gray dark:text-dark-gray mt-1 line-clamp-1 cursor-pointer hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingNotes(habit.id);
                        setNotesValue(habit.notes || '');
                      }}
                    >
                      {habit.notes}
                    </p>
                  )}
                  {editingNotes === habit.id && (
                    <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                      <textarea
                        value={notesValue}
                        onChange={(e) => setNotesValue(e.target.value)}
                        onBlur={() => {
                          if (onUpdateHabit) {
                            onUpdateHabit(habit.id, { notes: notesValue });
                          }
                          setEditingNotes(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey) {
                            if (onUpdateHabit) {
                              onUpdateHabit(habit.id, { notes: notesValue });
                            }
                            setEditingNotes(null);
                          }
                          if (e.key === 'Escape') {
                            setEditingNotes(null);
                            setNotesValue(habit.notes || '');
                          }
                        }}
                        className="w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded resize-none"
                        rows={2}
                        autoFocus
                      />
                      <p className="text-[10px] text-text-gray dark:text-dark-gray mt-0.5">Press Ctrl+Enter to save, Esc to cancel</p>
                    </div>
                  )}
                  {!habit.notes && editingNotes !== habit.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingNotes(habit.id);
                        setNotesValue('');
                      }}
                      className="text-xs text-text-gray dark:text-dark-gray mt-1 hover:text-primary transition"
                    >
                      + Add notes
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-text-gray dark:text-dark-gray text-sm">{completedCount}/{daysInMonth}</span>
                  {habit.currentStreak > 0 && (
                    <span className="text-sm text-primary flex items-center gap-1" title={`Current streak: ${habit.currentStreak}`}>
                      <span>🔥</span>
                      <span className="font-semibold">{habit.currentStreak}</span>
                    </span>
                  )}
                  {habit.bestStreak > 0 && (
                    <span className="text-xs text-gray-400 dark:text-gray-500" title={`Best streak: ${habit.bestStreak}`}>best: {habit.bestStreak}</span>
                  )}
                  <div className="flex items-center gap-1">
                    {onArchiveHabit && !habit.archived && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onArchiveHabit) onArchiveHabit(habit.id);
                        }}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition rounded"
                        title="Archive habit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      </button>
                    )}
                    {onUnarchiveHabit && habit.archived && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onUnarchiveHabit) onUnarchiveHabit(habit.id);
                        }}
                        className="p-1 text-primary hover:text-primary/80 transition rounded"
                        title="Unarchive habit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    )}
                    {onEditHabit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onEditHabit) onEditHabit(habit);
                        }}
                        className="p-1 text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition rounded"
                        title="Edit habit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                    {onDeleteHabit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(habit.id);
                        }}
                        className="ml-2 p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition rounded"
                        title="Delete habit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Delete Confirmation */}
              {showDeleteConfirm === habit.id && (
                <div className="bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800 p-3">
                  <p className="text-sm text-red-800 dark:text-red-300 mb-2">
                    Are you sure you want to delete "{habit.name}"? This action cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onDeleteHabit) {
                          onDeleteHabit(habit.id);
                          setShowDeleteConfirm(null);
                        }
                      }}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition"
                    >
                      Delete
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(null);
                      }}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-text-dark dark:text-dark-text text-xs rounded transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Calendar grid */}
              {expandedHabits[habit.id] && (
                <div className="bg-gray-50 dark:bg-gray-800 p-3 overflow-x-auto">
                  {/* Goal and Milestone Tracker */}
                  <HabitGoalTracker habit={habit} dailyLogs={logs} />
                  
                  {/* Day header inside calendar */}
                  <div className="flex mb-3">
                    <div className="w-16 md:w-32 flex-shrink-0"></div>
                    <div className="flex flex-1 min-w-0">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                        <div key={i} className="flex-1 text-center text-[11px] md:text-xs font-semibold text-text-gray dark:text-dark-gray min-w-0">{day}</div>
                      ))}
                    </div>
                  </div>

                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex mb-2">
                      <div className="w-16 md:w-32 flex-shrink-0"></div>
                      <div className="flex flex-1 min-w-0">
                        {week.map((day, dayIndex) => (
                          <div key={dayIndex} className="flex-1 aspect-square flex items-center justify-center min-w-[34px] flex-shrink-0">
                            {day ? (
                              <label className={`w-full h-full flex flex-col items-center justify-center rounded transition relative ${
                                isFutureDate(day) && !isHabitCompleted(habit.id, day)
                                  ? 'cursor-not-allowed opacity-50'
                                  : 'cursor-pointer hover:bg-white dark:hover:bg-gray-700'
                              }`}>
                                <input
                                  type="checkbox"
                                  checked={isHabitCompleted(habit.id, day) || false}
                                  onChange={() => handleHabitClick(habit, day)}
                                  disabled={isFutureDate(day) && !isHabitCompleted(habit.id, day)}
                                  className="w-3 h-3 sm:w-4 sm:h-4 text-primary rounded cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50 mb-0.5"
                                  title={isFutureDate(day) && !isHabitCompleted(habit.id, day) ? 'Cannot mark future dates as completed' : ''}
                                />
                                <span className={`text-[10px] md:text-xs ${
                                  isFutureDate(day) && !isHabitCompleted(habit.id, day)
                                    ? 'text-text-gray/50 dark:text-dark-gray/50'
                                    : 'text-text-gray dark:text-dark-gray'
                                }`}>{day}</span>
                                {/* Show quantity/time indicators */}
                                {isHabitCompleted(habit.id, day) && (() => {
                                  const data = getCompletionData(habit.id, day);
                                  if (data?.quantity || data?.duration) {
                                    return (
                                      <span className="absolute top-0 right-0 text-[8px] bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center">
                                        {data.quantity ? 'Q' : 'T'}
                                      </span>
                                    );
                                  }
                                  return null;
                                })()}
                              </label>
                            ) : (
                              <div className="bg-gray-100 dark:bg-gray-700 rounded w-full h-full"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        </>
      )}

      {/* Completion Modal */}
      {completionModal.habit && (
        <HabitCompletionModal
          habit={completionModal.habit}
          isOpen={completionModal.isOpen}
          onClose={() => setCompletionModal({ isOpen: false, habit: null, date: null })}
          onComplete={handleCompletionSubmit}
          existingData={completionModal.date ? (() => {
            const dateStr = completionModal.date;
            const completion = logs[dateStr]?.habits?.[completionModal.habit.id];
            return typeof completion === 'object' ? completion : null;
          })() : null}
          date={completionModal.date}
        />
      )}
    </div>
  );
};

export default HabitGrid;

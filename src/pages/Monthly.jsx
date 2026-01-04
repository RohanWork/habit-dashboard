import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useHabits } from '../hooks/useHabits';
import { useCategories } from '../contexts/CategoriesContext';
import { useTheme } from '../hooks/useTheme';
import { getDailyLogsByDateRange, saveDailyLog } from '../firebase/db';
import HabitGrid from '../components/HabitGrid';
import CalendarHeatmap from '../components/CalendarHeatmap';
import MoodTracker from '../components/MoodTracker';
import CreateHabitModal from '../components/CreateHabitModal';
import CreateCategoryModal from '../components/CreateCategoryModal';
import AchievementBadges from '../components/AchievementBadges';
import GoalsTracker from '../components/GoalsTracker';
import PrintReport from '../components/PrintReport';
import { CATEGORY_LIST, getCategoryColor } from '../utils/habitCategories';
import { exportAllDataToCSV, exportHabitsToCSV, downloadCSV } from '../utils/exportUtils';
import { useNotifications } from '../hooks/useNotifications';
import { reminderScheduler } from '../services/reminderScheduler';

const Monthly = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthLogs, setMonthLogs] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'heatmap'
  const [newlyCreatedHabits, setNewlyCreatedHabits] = useState(new Set());
  
  const { categories: allCategories, customCategories, createCategory, removeCategory, hiddenPredefinedCategories, restoreCategory } = useCategories();
  const { notificationSettings, sendBrowserNotification } = useNotifications();
  
  // Initialize selectedCategories with all categories (including custom ones)
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const prevCategoryIdsRef = useRef('');
  
  // Update selectedCategories when allCategories changes (to include custom categories)
  // Use a memoized string of category IDs to avoid infinite loops
  const categoryIdsString = useMemo(
    () => allCategories.map(c => c.id).sort().join(','),
    [allCategories]
  );
  
  useEffect(() => {
    if (allCategories.length > 0) {
      // Only update if category list actually changed
      if (categoryIdsString !== prevCategoryIdsRef.current) {
        prevCategoryIdsRef.current = categoryIdsString;
        
        setSelectedCategories(prev => {
          // Create a Set of valid category IDs
          const validCategoryIds = new Set(allCategories.map(cat => cat.id));
          
          // Start with a new Set that only contains valid categories
          const newSet = new Set();
          let hasChanges = false;
          
          // Add valid categories from previous selection
          prev.forEach(categoryId => {
            if (validCategoryIds.has(categoryId)) {
              newSet.add(categoryId);
            } else {
              // Category was deleted, mark as changed
              hasChanges = true;
            }
          });
          
          // Add any new categories that weren't in the previous selection
          allCategories.forEach(cat => {
            if (!newSet.has(cat.id)) {
              newSet.add(cat.id);
              hasChanges = true;
            }
          });
          
          // Only return new Set if there were changes, otherwise return previous to avoid re-render
          return hasChanges ? newSet : prev;
        });
      }
    } else {
      // If no categories, clear selectedCategories
      if (selectedCategories.size > 0) {
        setSelectedCategories(new Set());
      }
    }
  }, [categoryIdsString, allCategories.length]);
  
  // Helper function to convert date to local YYYY-MM-DD format
  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [selectedDate, setSelectedDate] = useState(getLocalDateString(new Date()));
  const [newHabitName, setNewHabitName] = useState('');

  const { habits, createHabit, removeHabit, updateHabit, archiveHabit, unarchiveHabit, toggleHabit } = useHabits(selectedDate);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  // Initialize reminder scheduler when habits or settings change
  useEffect(() => {
    if (habits.length > 0 && notificationSettings?.browserEnabled) {
      console.log('[Reminder] Initializing reminder scheduler...');
      console.log('[Reminder] Habits with reminders:', habits.filter(h => h.reminderEnabled && h.reminderTime && h.active && !h.archived).map(h => ({ name: h.name, time: h.reminderTime, frequency: h.frequency })));
      reminderScheduler.startDailyCheck(habits, notificationSettings, sendBrowserNotification);
      
      // Log scheduled reminders after a short delay
      setTimeout(() => {
        reminderScheduler.logScheduledReminders(habits);
      }, 1000);
    } else {
      console.log('[Reminder] Not initializing scheduler:', {
        hasHabits: habits.length > 0,
        browserEnabled: notificationSettings?.browserEnabled
      });
    }
    
    return () => {
      reminderScheduler.stopDailyCheck();
    };
  }, [habits, notificationSettings?.browserEnabled, sendBrowserNotification]);

  // Create a Set of valid category IDs for efficient lookup
  const validCategoryIds = useMemo(() => {
    return new Set(allCategories.map(cat => cat.id));
  }, [allCategories]);

  // Filter habits by selected categories, search, and archived status
  const filteredHabits = habits.filter(habit => {
    // Get the habit's category, defaulting to 'other'
    const habitCategory = habit.category || 'other';
    
    // Only filter by category if it's a valid category and is selected
    // This ensures deleted categories don't affect filtering
    if (!validCategoryIds.has(habitCategory) || !selectedCategories.has(habitCategory)) {
      return false;
    }
    
    // Filter by archived status
    if (!showArchived && habit.archived) return false;
    if (showArchived && !habit.archived) return false;
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const nameMatch = habit.name?.toLowerCase().includes(query);
      const notesMatch = habit.notes?.toLowerCase().includes(query);
      if (!nameMatch && !notesMatch) return false;
    }
    
    return true;
  });

  const toggleCategoryFilter = (categoryId) => {
    // Only allow toggling if the category exists in allCategories
    if (!validCategoryIds.has(categoryId)) {
      return;
    }
    
    const newCategories = new Set(selectedCategories);
    if (newCategories.has(categoryId)) {
      newCategories.delete(categoryId);
    } else {
      newCategories.add(categoryId);
    }
    setSelectedCategories(newCategories);
  };

  // Fetch month logs
  useEffect(() => {
    if (!user) return;

    const fetchMonthLogs = async () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const startDate = getLocalDateString(new Date(year, month, 1));
      const endDate = getLocalDateString(new Date(year, month + 1, 0));

      try {
        const logs = await getDailyLogsByDateRange(user.uid, startDate, endDate);
        const logsMap = {};
        logs.forEach(log => {
          logsMap[log.date] = log;
        });
        setMonthLogs(logsMap);
        // fetched month logs
      } catch (error) {
        console.error('Error fetching month logs:', error);
      }
    };

    fetchMonthLogs();
  }, [user, currentMonth]);

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (newHabitName.trim()) {
      await createHabit(newHabitName, 'other');
      setNewHabitName('');
    }
  };

  const handleToggleHabit = async (habitId, dateString, completionData = null) => {
    if (!user) return;

    try {
      // Check if date is in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(dateString);
      selectedDate.setHours(0, 0, 0, 0);
      
      const log = monthLogs[dateString] || {
        date: dateString,
        habits: {},
        mood: 3,
        energy: 3,
        focus: 3,
      };

      const currentCompletion = log.habits[habitId];
      const isCurrentlyCompleted = currentCompletion === true || (typeof currentCompletion === 'object' && currentCompletion?.completed === true);
      
      let newCompletionValue;
      if (isCurrentlyCompleted) {
        // Uncomplete: set to false (allow uncompleting even for future dates)
        newCompletionValue = false;
      } else {
        // Prevent completing future dates
        if (selectedDate > today) {
          alert('Cannot mark future dates as completed. Please select today or a past date.');
          return;
        }
        
        // Complete: use provided data or default to true
        if (completionData) {
          newCompletionValue = completionData;
        } else {
          newCompletionValue = true;
        }
      }

      const updatedLog = {
        ...log,
        habits: {
          ...log.habits,
          [habitId]: newCompletionValue,
        },
      };

      await saveDailyLog(user.uid, dateString, updatedLog);
      setMonthLogs({
        ...monthLogs,
        [dateString]: updatedLog,
      });
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  };

  const handleUpdateMetric = async (dateString, metric, value) => {
    // Prevent updating metrics for future dates
    const today = getLocalDateString(new Date());
    if (dateString > today) {
      alert("Cannot update metrics for future dates. Please select today or a past date.");
      return;
    }
    if (!user) return;

    try {
      const log = monthLogs[dateString] || {
        date: dateString,
        habits: {},
        mood: 3,
        energy: 3,
        focus: 3,
      };

      const updatedLog = {
        ...log,
        [metric]: value,
      };

      await saveDailyLog(user.uid, dateString, updatedLog);
      setMonthLogs({
        ...monthLogs,
        [dateString]: updatedLog,
      });
    } catch (error) {
      console.error('Error updating metric:', error);
    }
  };

  // Format month name in a practical way: "January 2026"
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  // Format date range for the month: "January 1 - 31, 2026"
  const getMonthDateRange = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const monthName = firstDay.toLocaleDateString('en-US', { month: 'long' });
    return `${monthName} ${firstDay.getDate()} - ${lastDay.getDate()}, ${year}`;
  };
  
  const monthDateRange = getMonthDateRange();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-dark-bg">
      {/* Modern Header */}
      <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-gray-700 sticky top-[57px] z-10 shadow-sm overflow-visible">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 py-4 lg:py-5">
            {/* Left Section: Title and Month Navigation */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                {/* Desktop Month Navigation */}
                <div className="hidden sm:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5">
                <button
                  onClick={handlePrevMonth}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition text-text-gray dark:text-dark-gray"
                    aria-label="Previous month"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                  <span className="text-base font-semibold text-text-dark dark:text-dark-text px-2 min-w-[140px] text-center">
                    {monthName}
                  </span>
                <button
                  onClick={handleNextMonth}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition text-text-gray dark:text-dark-gray"
                    aria-label="Next month"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
              </div>
                {/* Mobile Month Navigation */}
                <div className="flex sm:hidden items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 w-full">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition text-text-gray dark:text-dark-gray"
                    aria-label="Previous month"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-sm font-semibold text-text-dark dark:text-dark-text flex-1 text-center">
                    {monthName}
                  </span>
                  <button
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition text-text-gray dark:text-dark-gray"
                    aria-label="Next month"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
            </div>
          </div>

              {/* View Toggle - More Prominent */}
              <div className="inline-flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                      : 'text-text-gray dark:text-dark-gray hover:text-text-dark dark:hover:text-dark-text'
              }`}
            >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
              Grid View
                  </span>
            </button>
            <button
              onClick={() => setViewMode('heatmap')}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                viewMode === 'heatmap'
                      ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                      : 'text-text-gray dark:text-dark-gray hover:text-text-dark dark:hover:text-dark-text'
              }`}
            >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
              Heat Map
                  </span>
                </button>
              </div>
            </div>

            {/* Right Section: Create Habit Button */}
            <button
              onClick={() => {
                setEditingHabit(null);
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 whitespace-nowrap w-full sm:w-auto justify-center relative z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm sm:text-base">Create Habit</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Actions Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 w-full sm:max-w-md">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-gray dark:text-dark-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search habits..."
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                showArchived
                  ? 'bg-gray-200 dark:bg-gray-700 text-text-dark dark:text-dark-text'
                  : 'bg-gray-100 dark:bg-gray-800 text-text-gray dark:text-dark-gray hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {showArchived ? 'Show Active' : 'Show Archived'}
            </button>
          <button
              onClick={() => {
                const logs = Object.values(monthLogs);
                exportAllDataToCSV(habits, logs);
              }}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium text-sm transition flex items-center gap-2"
          >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
          </button>
          </div>
        </div>

        {/* Category Filters - Redesigned */}
        <div className="mb-6">
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <h3 className="text-base font-semibold text-text-dark dark:text-dark-text">Filter by Category</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCreateCategoryModal(true)}
                  className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 px-2 py-1 rounded hover:bg-primary/5 dark:hover:bg-primary/10 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Category
                </button>
                <span className="text-xs text-text-gray dark:text-dark-gray">
                  {selectedCategories.size === allCategories.length ? 'All selected' : `${selectedCategories.size} of ${allCategories.length} selected`}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {allCategories.map((category) => {
              const isSelected = selectedCategories.has(category.id);
                const colors = getCategoryColor(category.id, allCategories, isDark);
                const isCustom = category.isCustom;
                const isCategoryInUse = habits.some(h => h.category === category.id);
                
              return (
                  <div key={category.id} className="relative group">
                <button
                  onClick={() => toggleCategoryFilter(category.id)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    isSelected
                          ? 'border-2 shadow-md scale-105'
                          : 'border border-gray-300 dark:border-gray-600 opacity-60 hover:opacity-100'
                  }`}
                  style={{
                        backgroundColor: isSelected ? colors.bg : 'transparent',
                        borderColor: isSelected ? colors.border : undefined,
                    color: colors.text,
                  }}
                >
                  {category.label}
                </button>
                    {(isCustom || !isCategoryInUse) && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (isCategoryInUse) {
                            const habitCount = habits.filter(h => h.category === category.id).length;
                            alert(`Cannot delete category "${category.label}" because it is being used by ${habitCount} habit(s). Please change or delete those habits first.`);
                            return;
                          }
                          const actionText = isCustom ? 'delete' : 'hide';
                          if (window.confirm(`Are you sure you want to ${actionText} the category "${category.label}"? ${isCustom ? 'This action cannot be undone.' : 'You can restore it later from your profile settings.'}`)) {
                            try {
                              await removeCategory(category.id);
                              setSelectedCategories(prev => {
                                const newSet = new Set(prev);
                                newSet.delete(category.id);
                                return newSet;
                              });
                            } catch (error) {
                              alert(`Error ${actionText === 'delete' ? 'deleting' : 'hiding'} category: ${error.message}`);
                            }
                          }
                        }}
                        className="absolute -top-1 -right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-md"
                        title={isCustom ? 'Delete category' : 'Hide category'}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
              );
            })}
            </div>
          </div>
        </div>

        {/* Habit View - Grid or Heatmap */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Habit Tracker - Takes 8 columns on large screens */}
            <div className="lg:col-span-8">
              <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-text-dark dark:text-dark-text mb-1">Habit Tracker</h2>
                      <p className="text-xs text-text-gray dark:text-dark-gray">Tap a habit to expand weeks. Grid is scrollable on small screens.</p>
                    </div>
                    <div className="text-sm font-medium text-primary bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                      {monthName}
                    </div>
                  </div>
              </div>
                
                {/* Habit Grid Content */}
                <div className="p-6">
                  <HabitGrid
                    habits={filteredHabits}
                    logs={monthLogs}
                    currentMonth={currentMonth}
                    onToggleHabit={handleToggleHabit}
                    allCategories={allCategories}
                    newlyCreatedHabits={newlyCreatedHabits}
                    onDeleteHabit={async (habitId) => {
                      try {
                        await removeHabit(habitId);
                      } catch (error) {
                        alert(`Error deleting habit: ${error.message}`);
                      }
                    }}
                    onArchiveHabit={async (habitId) => {
                      try {
                        await archiveHabit(habitId);
                      } catch (error) {
                        alert(`Error archiving habit: ${error.message}`);
                      }
                    }}
                    onUnarchiveHabit={async (habitId) => {
                      try {
                        await unarchiveHabit(habitId);
                      } catch (error) {
                        alert(`Error unarchiving habit: ${error.message}`);
                      }
                    }}
                    onUpdateHabit={async (habitId, updates) => {
                      try {
                        await updateHabit(habitId, updates);
                      } catch (error) {
                        alert(`Error updating habit: ${error.message}`);
                      }
                    }}
                    onEditHabit={(habit) => {
                      setEditingHabit(habit);
                      setShowCreateModal(true);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Sidebar - Daily metrics - Takes 4 columns on large screens */}
            <div className="lg:col-span-4 space-y-4">
              {/* Date Selector Card */}
              <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-base font-semibold text-text-dark dark:text-dark-text">Select Date</h3>
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>

              {/* Mood Tracker Card */}
              <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <MoodTracker
                  mood={monthLogs[selectedDate]?.mood || 3}
                  energy={monthLogs[selectedDate]?.energy || 3}
                  focus={monthLogs[selectedDate]?.focus || 3}
                  onUpdate={(metric, value) => handleUpdateMetric(selectedDate, metric, value)}
                  disabled={selectedDate > getLocalDateString(new Date())}
                />
              </div>

              {/* Goals Tracker */}
              <GoalsTracker habits={habits} logs={monthLogs} />

              {/* Achievement Badges */}
              <AchievementBadges habits={habits} logs={monthLogs} />

              {/* Print Report */}
              <PrintReport
                habits={habits}
                logs={monthLogs}
                month={currentMonth.getMonth()}
                year={currentMonth.getFullYear()}
                allCategories={allCategories}
              />
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-text-dark dark:text-dark-text mb-2">Completion Heat Map</h2>
              <p className="text-sm text-text-gray dark:text-dark-gray">Intensity shows overall habit completion for the day</p>
            </div>
            <CalendarHeatmap
              month={currentMonth.getMonth()}
              year={currentMonth.getFullYear()}
              logs={monthLogs}
              habits={filteredHabits}
            />
          </div>
        )}

        {/* Create Habit Modal */}
        {showCreateModal && (
          <CreateHabitModal
            onClose={() => {
              setShowCreateModal(false);
              setEditingHabit(null);
            }}
            editingHabit={editingHabit}
            onUpdate={async (habitId, habitData) => {
              await updateHabit(habitId, habitData);
              setEditingHabit(null);
              setShowCreateModal(false);
            }}
            onCreate={async (habitData) => {
              // Handle both old format (backward compatibility) and new format
              const isOldFormat = typeof habitData === 'string' || (habitData && !habitData.name);
              let name, category, emoji, notes, frequency, schedule, reminderEnabled, reminderTime, quantityTracking, timeTracking, difficulty, goal;
              
              if (isOldFormat) {
                // Old format: (name, category, emoji, notes)
                name = habitData;
                category = arguments[1] || 'other';
                emoji = arguments[2] || '';
                notes = arguments[3] || '';
                frequency = 'daily';
                schedule = { daysOfWeek: [0, 1, 2, 3, 4, 5, 6] };
                reminderEnabled = false;
                reminderTime = null;
                quantityTracking = null;
                timeTracking = null;
                difficulty = 'medium';
                goal = null;
              } else {
                // New format: habitData object
                name = habitData.name;
                category = habitData.category;
                emoji = habitData.emoji || '';
                notes = habitData.notes || '';
                frequency = habitData.frequency || 'daily';
                schedule = habitData.schedule || { daysOfWeek: [0, 1, 2, 3, 4, 5, 6] };
                reminderEnabled = habitData.reminderEnabled || false;
                reminderTime = habitData.reminderTime || null;
                quantityTracking = habitData.quantityTracking || null;
                timeTracking = habitData.timeTracking || null;
                difficulty = habitData.difficulty || 'medium';
                goal = habitData.goal || null;
              }
              
              // Step 1: Add category to selected filters FIRST (before any async operations)
              setSelectedCategories(prev => {
                if (prev.has(category)) {
                  return prev;
                }
                const newSet = new Set(prev);
                newSet.add(category);
                return newSet;
              });
              
              // Step 2: Restore category if hidden
              if (hiddenPredefinedCategories.includes(category)) {
                try {
                  await restoreCategory(category);
                  let attempts = 0;
                  while (attempts < 20) {
                    await new Promise(resolve => setTimeout(resolve, 50));
                    if (allCategories.some(cat => cat.id === category)) {
                      break;
                    }
                    attempts++;
                  }
                } catch (error) {
                  console.error('Error restoring category:', error);
                }
              }
              
              // Step 3: Check for duplicate habits
              const isDuplicate = habits.some(
                h => h.name.toLowerCase().trim() === name.toLowerCase().trim() && 
                     h.category === category &&
                     !h.archived
              );
              
              if (isDuplicate) {
                return;
              }
              
              // Step 4: Create the habit with extended data
              const habitId = await createHabit(name, category, emoji, notes, {
                frequency,
                schedule,
                reminderEnabled,
                reminderTime,
                quantityTracking,
                timeTracking,
                difficulty,
                goal,
              });
              
              // Step 5: Schedule reminder if enabled (handled by reminderScheduler service)
              // The reminder scheduler will pick it up automatically via useEffect
              
              // Track newly created habit for visual highlighting
              if (habitId) {
                setNewlyCreatedHabits(prev => new Set([...prev, habitId]));
                setTimeout(() => {
                  setNewlyCreatedHabits(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(habitId);
                    return newSet;
                  });
                }, 3000);
              }
            }}
            categories={allCategories}
            onOpenCreateCategory={() => {
              setShowCreateCategoryModal(true);
            }}
            hiddenPredefinedCategories={hiddenPredefinedCategories}
            restoreCategory={restoreCategory}
            onCategoryRestored={(categoryId) => {
              // Add restored category to selected filters immediately
              // This ensures the category is selected before habits are created
              setSelectedCategories(prev => {
                const newSet = new Set(prev);
                newSet.add(categoryId);
                return newSet;
              });
            }}
            existingHabits={habits}
          />
        )}

        {/* Create Category Modal */}
        {showCreateCategoryModal && (
          <CreateCategoryModal
            onClose={() => {
              setShowCreateCategoryModal(false);
            }}
            onCreateCategory={async (categoryData) => {
              const newCategory = await createCategory(categoryData);
              // Automatically add new category to selected filters
              setSelectedCategories(prev => new Set([...prev, newCategory.id]));
              setShowCreateCategoryModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Monthly;

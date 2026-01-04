import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useHabits } from '../hooks/useHabits';
import { useNotifications } from '../hooks/useNotifications';
import { reminderScheduler } from '../services/reminderScheduler';
import { getDailyLogsByDateRange, saveDailyLog } from '../firebase/db';
import CircularProgress from '../components/CircularProgress';
import DailyCard from '../components/DailyCard';
import WeeklyBar from '../components/WeeklyBar';
import MoodTracker from '../components/MoodTracker';

const Dashboard = () => {
  const { user } = useAuth();
  const today = new Date();
  
  // Helper function to convert date to local YYYY-MM-DD format
  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const todayString = getLocalDateString(today);

  const [weekLogs, setWeekLogs] = useState({});
  const [historicalLogs, setHistoricalLogs] = useState({}); // For streak calculation
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => {
    // Start of current week (Sunday)
    const start = new Date(today);
    start.setDate(start.getDate() - start.getDay());
    return start;
  });
  const [showMoodTracker, setShowMoodTracker] = useState(false);

  // Get habits for the week and current date
  const { habits, dailyLog, updateDailyMetric, toggleHabit: originalToggleHabit } = useHabits(selectedDate);
  const { notificationSettings, sendBrowserNotification } = useNotifications();

  // Initialize reminder scheduler when habits or settings change
  useEffect(() => {
    if (habits.length > 0 && notificationSettings?.browserEnabled) {
      console.log('[Reminder] Initializing reminder scheduler on Dashboard...');
      console.log('[Reminder] Habits with reminders:', habits.filter(h => h.reminderEnabled && h.reminderTime && h.active && !h.archived).map(h => ({ name: h.name, time: h.reminderTime, frequency: h.frequency })));
      reminderScheduler.startDailyCheck(habits, notificationSettings, sendBrowserNotification);
      
      // Log scheduled reminders after a short delay
      setTimeout(() => {
        reminderScheduler.logScheduledReminders(habits);
      }, 1000);
    } else {
      console.log('[Reminder] Not initializing scheduler on Dashboard:', {
        hasHabits: habits.length > 0,
        browserEnabled: notificationSettings?.browserEnabled
      });
    }
    
    return () => {
      reminderScheduler.stopDailyCheck();
    };
  }, [habits, notificationSettings?.browserEnabled, sendBrowserNotification]);

  // Custom handler for toggling habits that updates local state
  const handleToggleHabit = async (habitId) => {
    if (!user) return;

    // Check if date is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateObj = new Date(selectedDate);
    selectedDateObj.setHours(0, 0, 0, 0);

    // Get current completion status
    const currentLog = weekLogs[selectedDate] || dailyLog;
    const isCurrentlyCompleted = currentLog?.habits?.[habitId] === true || 
      (typeof currentLog?.habits?.[habitId] === 'object' && currentLog?.habits?.[habitId]?.completed === true);

    // Prevent completing future dates (allow uncompleting)
    if (!isCurrentlyCompleted && selectedDateObj > today) {
      alert('Cannot mark future dates as completed. Please select today or a past date.');
      return;
    }

    try {
      const log = weekLogs[selectedDate] || dailyLog || {
        date: selectedDate,
        habits: {},
        mood: 3,
        energy: 3,
        focus: 3,
      };

      const updatedLog = {
        ...log,
        habits: {
          ...log.habits,
          [habitId]: isCurrentlyCompleted ? false : true,
        },
      };

      // Update local state immediately for instant UI feedback
      setWeekLogs(prev => ({
        ...prev,
        [selectedDate]: updatedLog,
      }));

      // Also update historical logs if needed for streak calculation
      setHistoricalLogs(prev => ({
        ...prev,
        [selectedDate]: updatedLog,
      }));

      // Save to Firebase
      await saveDailyLog(user.uid, selectedDate, updatedLog);
    } catch (error) {
      console.error('Error updating habit:', error);
      // Revert state on error
      setWeekLogs(prev => ({
        ...prev,
        [selectedDate]: currentLog,
      }));
    }
  };

  // Fetch week logs on mount
    // Handle updating daily metrics (mood, energy, focus)
    const handleUpdateMetric = async (metric, value) => {
      if (!user) return;

      // Prevent updating metrics for future dates
      const today = getLocalDateString(new Date());
      if (selectedDate > today) {
        alert("Cannot update metrics for future dates. Please select today or a past date.");
        return;
      }

      try {
          const log = weekLogs[selectedDate] || dailyLog || {
          date: selectedDate,
          habits: {},
          mood: 3,
          energy: 3,
          focus: 3,
        };

        const updatedLog = {
          ...log,
          [metric]: value,
        };

          await saveDailyLog(user.uid, selectedDate, updatedLog);
          setWeekLogs({
            ...weekLogs,
            [selectedDate]: updatedLog,
          });
          // saved and updated locally
      } catch (error) {
        console.error('Error updating metric:', error);
      }
    };

    // Fetch week logs based on selected week
  useEffect(() => {
    if (!user) return;

    const fetchWeekLogs = async () => {
      const startDate = new Date(selectedWeekStart);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6); // End of week (Saturday)

      const start = getLocalDateString(startDate);
      const end = getLocalDateString(endDate);

      try {
        const logs = await getDailyLogsByDateRange(user.uid, start, end);
        const logsMap = {};
        logs.forEach(log => {
          logsMap[log.date] = log;
        });
        setWeekLogs(logsMap);
        // fetched week logs
      } catch (error) {
        console.error('Error fetching week logs:', error);
      }
    };

    fetchWeekLogs();
  }, [user, selectedWeekStart]);

  // Fetch historical logs for streak calculation (30 days back)
  useEffect(() => {
    if (!user) return;

    const fetchHistoricalLogs = async () => {
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 30); // 30 days back
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 6); // Include future week days

      const start = getLocalDateString(startDate);
      const end = getLocalDateString(endDate);

      try {
        const logs = await getDailyLogsByDateRange(user.uid, start, end);
        const logsMap = {};
        logs.forEach(log => {
          logsMap[log.date] = log;
        });
        setHistoricalLogs(logsMap);
      } catch (error) {
        console.error('Error fetching historical logs:', error);
      }
    };

    fetchHistoricalLogs();
  }, [user, today]);

  // Calculate overall week completion percentage for selected week
  const calculateWeekCompletion = () => {
    if (habits.length === 0) return 0;

    let totalCompleted = 0;
    let totalHabits = 0;

    for (let day = 0; day < 7; day++) {
      const date = new Date(selectedWeekStart);
      date.setDate(date.getDate() + day);
      const dateString = getLocalDateString(date);
      const log = weekLogs[dateString];

      if (log) {
        habits.forEach(habit => {
          totalHabits++;
          const completion = log.habits?.[habit.id];
          if (completion === true || (typeof completion === 'object' && completion?.completed === true)) {
            totalCompleted++;
          }
        });
      } else {
        totalHabits += habits.length;
      }
    }

    return totalHabits > 0 ? Math.round((totalCompleted / totalHabits) * 100) : 0;
  };

  // Calculate streak up to a specific date
  const calculateStreakUpToDate = (targetDateString) => {
    if (habits.length === 0) return 0;
    
    const targetDate = new Date(targetDateString);
    targetDate.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let checkDate = new Date(targetDate);
    
    // Check backwards from target date to find consecutive completed days
    // Use historicalLogs which contains more data than just the current week
    while (true) {
      const checkDateString = getLocalDateString(checkDate);
      const log = historicalLogs[checkDateString] || weekLogs[checkDateString];
      
      // Check if all habits were completed on this day
      let allCompleted = true;
      if (!log || !log.habits) {
        allCompleted = false;
      } else {
        for (const habit of habits) {
          if (!log.habits[habit.id]) {
            allCompleted = false;
            break;
          }
        }
      }
      
      if (allCompleted) {
        streak++;
        // Go back one day
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Get daily card data for the selected week
  const getDailyCardData = () => {
    const cards = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let day = 0; day < 7; day++) {
      const date = new Date(selectedWeekStart);
      date.setDate(date.getDate() + day);
      const dateString = getLocalDateString(date);
      const dayName = dayNames[date.getDay()];
      const dateNum = date.getDate();
      const log = weekLogs[dateString];

      let completed = 0;
      if (log) {
        habits.forEach(habit => {
          const completion = log.habits?.[habit.id];
          if (completion === true || (typeof completion === 'object' && completion?.completed === true)) {
            completed++;
          }
        });
      }

      // Calculate streak up to this specific date
      const dayStreak = calculateStreakUpToDate(dateString);

      cards.push({
        day: dayName,
        date: dateNum,
        dateString,
        completed,
        total: habits.length,
        isToday: dateString === todayString,
        currentStreak: dayStreak,
        bestStreak: 0, // Don't show best streak on daily cards
      });
    }

    return cards;
  };

  // Get weekly bar data for the selected week
  const getWeeklyBarData = () => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];

    for (let day = 0; day < 7; day++) {
      const date = new Date(selectedWeekStart);
      date.setDate(date.getDate() + day);
      const dateString = getLocalDateString(date);
      const log = weekLogs[dateString];

      let completed = 0;
      if (log && habits.length > 0) {
        habits.forEach(habit => {
          if (log.habits && log.habits[habit.id]) {
            completed++;
          }
        });
      }

      const percentage = habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0;
      data.push({
        day: dayNames[date.getDay()],
        completion: percentage,
      });
    }

    return data;
  };

  // Recalculate data when weekLogs or selectedDate changes
  const dailyCards = useMemo(() => getDailyCardData(), [weekLogs, habits, selectedWeekStart, todayString]);
  const weeklyData = useMemo(() => getWeeklyBarData(), [weekLogs, habits, selectedWeekStart]);
  const weekCompletion = useMemo(() => calculateWeekCompletion(), [weekLogs, habits, selectedWeekStart]);

  const selectedDayCard = dailyCards.find(c => c.dateString === selectedDate);
  const selectedLog = weekLogs[selectedDate] || dailyLog;

  return (
    <div className="min-h-screen bg-bg-light dark:bg-dark-bg">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left: Title and Week Range */}
            <div>
              <h1 className="text-2xl font-bold text-text-dark dark:text-dark-text mb-1">Dashboard</h1>
              <p className="text-sm text-text-gray dark:text-dark-gray">
                Week of {selectedWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(selectedWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            {/* Right: Week Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const prevWeek = new Date(selectedWeekStart);
                  prevWeek.setDate(prevWeek.getDate() - 7);
                  setSelectedWeekStart(prevWeek);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                title="Previous week"
              >
                <svg className="w-5 h-5 text-text-gray dark:text-dark-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <input
                type="date"
                value={getLocalDateString(selectedWeekStart)}
                onChange={(e) => {
                  const selectedDate = new Date(e.target.value);
                  selectedDate.setDate(selectedDate.getDate() - selectedDate.getDay()); // Set to Sunday of that week
                  setSelectedWeekStart(selectedDate);
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
                title="Select week"
              />
              
              <button
                onClick={() => {
                  const nextWeek = new Date(selectedWeekStart);
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  setSelectedWeekStart(nextWeek);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                title="Next week"
              >
                <svg className="w-5 h-5 text-text-gray dark:text-dark-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button
                onClick={() => {
                  const currentWeekStart = new Date(today);
                  currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
                  setSelectedWeekStart(currentWeekStart);
                  setSelectedDate(todayString);
                }}
                className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary/90 text-white rounded-lg transition"
                title="Go to current week"
              >
                Today
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Top area: overall progress + weekly chart */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          <div className="bg-white dark:bg-dark-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <CircularProgress
                percentage={weekCompletion}
                radius={68}
                color="#6AA84F"
                strokeWidth={10}
              />
              <div className="text-center">
                <p className="text-text-gray dark:text-dark-gray text-sm">This Week</p>
                <p className="text-text-dark dark:text-dark-text text-xs font-medium">{Math.round(weekCompletion)}% Complete</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-white dark:bg-dark-surface p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-text-dark dark:text-dark-text mb-2">Weekly Overview</h3>
            <WeeklyBar data={weeklyData} />
          </div>
        </div>

        {/* Daily Cards Grid */}
        <div>
          <h2 className="text-lg font-semibold text-text-dark dark:text-dark-text mb-4">Week Overview</h2>
            {/* Desktop: 7-column grid, Mobile: horizontal scroll */}
            <div className="hidden md:grid grid-cols-7 gap-2">
              {dailyCards.map((card) => (
                <div key={card.dateString} onClick={() => setSelectedDate(card.dateString)}>
                  <DailyCard
                    day={card.day}
                    date={card.date}
                    completedHabits={card.completed}
                    totalHabits={card.total}
                    isToday={card.isToday}
                    isSelected={card.dateString === selectedDate}
                    currentStreak={card.currentStreak}
                    bestStreak={card.bestStreak}
                  />
                </div>
              ))}
            </div>

            <div className="md:hidden">
              <div className="overflow-x-auto py-2">
                <div className="flex gap-3 px-2">
                  {dailyCards.map((card) => (
                    <div key={card.dateString} className="min-w-[120px]" onClick={() => setSelectedDate(card.dateString)}>
                      <DailyCard
                        day={card.day}
                        date={card.date}
                        completedHabits={card.completed}
                        totalHabits={card.total}
                        isToday={card.isToday}
                        isSelected={card.dateString === selectedDate}
                        currentStreak={card.currentStreak}
                        bestStreak={card.bestStreak}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
        </div>

        {/* Today's Habits and Mood Tracker */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Habits for selected day */}
          <div className="lg:col-span-2 bg-white dark:bg-dark-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-text-dark dark:text-dark-text mb-4">
              Habits - {selectedDayCard?.day} {selectedDayCard?.date}
            </h2>

            {habits.length === 0 ? (
              <div className="text-center py-8 text-text-gray dark:text-dark-gray">
                <p>No habits created yet. Go to Habits view to add habits!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {habits.map((habit) => (
                  <label
                    key={habit.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border border-gray-100 dark:border-gray-700 dark:bg-gray-800"
                  >
                    <input
                      type="checkbox"
                      checked={selectedLog && selectedLog.habits && (selectedLog.habits[habit.id] === true || (typeof selectedLog.habits[habit.id] === 'object' && selectedLog.habits[habit.id]?.completed === true)) || false}
                      onChange={() => handleToggleHabit(habit.id)}
                      disabled={(() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const selectedDateObj = new Date(selectedDate);
                        selectedDateObj.setHours(0, 0, 0, 0);
                        const isCompleted = selectedLog && selectedLog.habits && (selectedLog.habits[habit.id] === true || (typeof selectedLog.habits[habit.id] === 'object' && selectedLog.habits[habit.id]?.completed === true));
                        return selectedDateObj > today && !isCompleted;
                      })()}
                      className="w-5 h-5 text-primary rounded cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50"
                      title={(() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const selectedDateObj = new Date(selectedDate);
                        selectedDateObj.setHours(0, 0, 0, 0);
                        const isCompleted = selectedLog && selectedLog.habits && (selectedLog.habits[habit.id] === true || (typeof selectedLog.habits[habit.id] === 'object' && selectedLog.habits[habit.id]?.completed === true));
                        if (selectedDateObj > today && !isCompleted) {
                          return 'Cannot mark future dates as completed';
                        }
                        return '';
                      })()}
                    />
                    <span className="text-text-dark dark:text-dark-text font-medium flex-grow">{habit.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Mood Tracker */}
          <div>
            <MoodTracker
              mood={selectedLog?.mood || 3}
              energy={selectedLog?.energy || 3}
              focus={selectedLog?.focus || 3}
              onUpdate={handleUpdateMetric}
              disabled={selectedDate > getLocalDateString(new Date())}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

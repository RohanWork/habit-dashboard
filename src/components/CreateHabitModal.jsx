import React, { useState, useMemo, useEffect } from 'react';
import { getCategoryColor } from '../utils/habitCategories';
import { useTheme } from '../hooks/useTheme';
import { useNotifications } from '../hooks/useNotifications';
import { HABIT_TEMPLATES } from '../utils/habitTemplates';

const CreateHabitModal = ({ onClose, onCreate, categories = [], onOpenCreateCategory, hiddenPredefinedCategories = [], restoreCategory, onCategoryRestored, existingHabits = [], editingHabit = null, onUpdate = null }) => {
  const { isDark } = useTheme();
  const { notificationSettings } = useNotifications();
  const isEditing = !!editingHabit;
  
  // Initialize form with editing habit data or defaults
  const defaultReminderTime = notificationSettings?.reminderTime || '09:00';
  const [habitName, setHabitName] = useState(editingHabit?.name || '');
  const [selectedCategory, setSelectedCategory] = useState(editingHabit?.category || 'health');
  const [selectedEmoji, setSelectedEmoji] = useState(editingHabit?.emoji || '');
  const [notes, setNotes] = useState(editingHabit?.notes || '');
  const [error, setError] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [templateProgress, setTemplateProgress] = useState({ current: 0, total: 0 });
  
  // Advanced options - initialize from editing habit or defaults
  const [frequency, setFrequency] = useState(editingHabit?.frequency || 'daily');
  const [selectedDays, setSelectedDays] = useState(editingHabit?.schedule?.daysOfWeek || [0, 1, 2, 3, 4, 5, 6]);
  const [reminderEnabled, setReminderEnabled] = useState(editingHabit?.reminderEnabled || false);
  const [reminderTime, setReminderTime] = useState(editingHabit?.reminderTime || defaultReminderTime);
  const [quantityTracking, setQuantityTracking] = useState(editingHabit?.quantityTracking || { enabled: false, unit: '', target: 1 });
  const [timeTracking, setTimeTracking] = useState(editingHabit?.timeTracking || { enabled: false });
  const [difficulty, setDifficulty] = useState(editingHabit?.difficulty || 'medium');
  const [goal, setGoal] = useState(editingHabit?.goal || { enabled: false, target: 7, period: 'week' });

  // Update form fields when editingHabit changes
  useEffect(() => {
    if (editingHabit) {
      setHabitName(editingHabit.name || '');
      setSelectedCategory(editingHabit.category || 'health');
      setSelectedEmoji(editingHabit.emoji || '');
      setNotes(editingHabit.notes || '');
      setFrequency(editingHabit.frequency || 'daily');
      setSelectedDays(editingHabit.schedule?.daysOfWeek || [0, 1, 2, 3, 4, 5, 6]);
      setReminderEnabled(editingHabit.reminderEnabled || false);
      setReminderTime(editingHabit.reminderTime || defaultReminderTime);
      setQuantityTracking(editingHabit.quantityTracking || { enabled: false, unit: '', target: 1 });
      setTimeTracking(editingHabit.timeTracking || { enabled: false });
      setDifficulty(editingHabit.difficulty || 'medium');
      setGoal(editingHabit.goal || { enabled: false, target: 7, period: 'week' });
      setShowTemplates(false); // Hide templates when editing
    } else {
      // Reset to defaults when not editing
      setHabitName('');
      setSelectedCategory('health');
      setSelectedEmoji('');
      setNotes('');
      setFrequency('daily');
      setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
      setReminderEnabled(false);
      setReminderTime(defaultReminderTime);
      setQuantityTracking({ enabled: false, unit: '', target: 1 });
      setTimeTracking({ enabled: false });
      setDifficulty('medium');
      setGoal({ enabled: false, target: 7, period: 'week' });
    }
  }, [editingHabit, defaultReminderTime]);

  // Use only the categories prop (which already has all categories merged properly)
  // Use useMemo to prevent duplicates and ensure uniqueness by ID
  const allCategories = useMemo(() => {
    const categoryMap = new Map();
    categories.forEach(cat => {
      if (cat && cat.id) {
        categoryMap.set(cat.id, cat);
      }
    });
    return Array.from(categoryMap.values());
  }, [categories]);

  const handleCreate = async () => {
    if (!habitName.trim()) {
      setError('Habit name is required');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const habitData = {
        name: habitName.trim(),
        category: selectedCategory,
        emoji: selectedEmoji,
        notes: notes,
        frequency,
        schedule: {
          daysOfWeek: frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : frequency === 'weekly' ? selectedDays : [],
        },
        reminderEnabled,
        reminderTime: reminderEnabled ? reminderTime : null,
        quantityTracking: quantityTracking.enabled ? quantityTracking : null,
        timeTracking: timeTracking.enabled ? timeTracking : null,
        difficulty,
        goal: goal.enabled ? goal : null,
      };
      
      if (isEditing && onUpdate) {
        // Update existing habit
        await onUpdate(editingHabit.id, habitData);
      } else {
        // Create new habit
        await onCreate(habitData);
      }
      
      // Reset form only if not editing
      if (!isEditing) {
        setHabitName('');
        setSelectedCategory('health');
        setSelectedEmoji('');
        setNotes('');
        setFrequency('daily');
        setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
        setReminderEnabled(false);
        setReminderTime(defaultReminderTime);
        setQuantityTracking({ enabled: false, unit: '', target: 1 });
        setTimeTracking({ enabled: false });
        setDifficulty('medium');
        setGoal({ enabled: false, target: 7, period: 'week' });
        setError('');
      }
      
      // Small delay to show success state
      await new Promise(resolve => setTimeout(resolve, 100));
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleTemplateSelect = async (template) => {
    setIsCreating(true);
    setError('');
    
    try {
      // Filter out duplicates first
      const habitsToCreate = template.habits.filter(habit => {
        return !existingHabits.some(
          h => h.name.toLowerCase().trim() === habit.name.toLowerCase().trim() && 
               h.category === template.category &&
               !h.archived
        );
      });
      
      if (habitsToCreate.length === 0) {
        setError('All habits from this template already exist');
        setIsCreating(false);
        return;
      }
      
      setTemplateProgress({ current: 0, total: habitsToCreate.length });
      
      // Step 1: Restore category if hidden
      if (hiddenPredefinedCategories.includes(template.category) && restoreCategory) {
        try {
          await restoreCategory(template.category);
          // Notify parent that category was restored (this adds it to selectedCategories)
          if (onCategoryRestored) {
            onCategoryRestored(template.category);
          }
          // Wait for the category to appear in categories prop
          let attempts = 0;
          while (attempts < 20) {
            await new Promise(resolve => setTimeout(resolve, 50));
            const categoryExists = categories.some(cat => cat.id === template.category);
            if (categoryExists) {
              break;
            }
            attempts++;
          }
        } catch (error) {
          console.error('Error restoring category:', error);
          setError(`Error restoring category: ${error.message}`);
          setIsCreating(false);
          return;
        }
      } else {
        // Even if category is not hidden, ensure it's added to selected filters
        if (onCategoryRestored) {
          onCategoryRestored(template.category);
        }
      }
      
      // Step 2: Create all habits from template sequentially with progress tracking
      let createdCount = 0;
      let failedCount = 0;
      
      for (let i = 0; i < habitsToCreate.length; i++) {
        const habit = habitsToCreate[i];
        try {
          await onCreate({
            name: habit.name,
            category: template.category,
            emoji: habit.emoji,
            notes: '',
            frequency: 'daily',
            schedule: { daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
            reminderEnabled: false,
            reminderTime: null,
            quantityTracking: null,
            timeTracking: null,
            difficulty: 'medium',
            goal: null,
          });
          createdCount++;
          setTemplateProgress({ current: i + 1, total: habitsToCreate.length });
          // Small delay between creations to ensure state updates
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (err) {
          failedCount++;
          console.error(`Failed to create habit "${habit.name}":`, err);
        }
      }
      
      // Step 3: Show result and close
      if (failedCount > 0) {
        setError(`Created ${createdCount} habits, but ${failedCount} failed. Please try again.`);
        setIsCreating(false);
      } else {
        // Small delay before closing to ensure all state updates complete
        await new Promise(resolve => setTimeout(resolve, 200));
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to create habits from template');
      setIsCreating(false);
    }
  };

  const popularEmojis = ['🎯', '💪', '📚', '🧘', '🏃', '💧', '😴', '📝', '🎨', '🎵', '🍎', '🚶', '📖', '🧹', '🎮', '☕'];

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCreate();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-dark dark:text-dark-text">
            {isEditing ? 'Edit Habit' : (showTemplates ? 'Browse Templates' : 'Create New Habit')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-text-gray dark:text-dark-gray"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!showTemplates ? (
          <>
            {/* Templates Button - Only show when not editing */}
            {!isEditing && (
              <div className="mb-4">
                <button
                  onClick={() => setShowTemplates(true)}
                  className="w-full px-4 py-3 border-2 border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 dark:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <span className="text-2xl">📋</span>
                  <span className="text-primary font-semibold text-sm">Browse Templates</span>
                </button>
              </div>
            )}

            {/* Habit Name Input */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-text-dark dark:text-dark-text mb-2">
                Habit Name
              </label>
              <div className="flex gap-2">
                {selectedEmoji && (
                  <div className="text-3xl flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    {selectedEmoji}
                  </div>
                )}
                <input
                  type="text"
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., Morning Workout"
                  className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                  autoFocus
                />
              </div>
            </div>

            {/* Emoji Selection */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-text-dark dark:text-dark-text mb-2">
                Icon (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {popularEmojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedEmoji(selectedEmoji === emoji ? '' : emoji)}
                    className={`text-2xl p-2 rounded-lg transition-all ${
                      selectedEmoji === emoji
                        ? 'bg-primary/20 border-2 border-primary scale-110'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border-2 border-transparent'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
                <input
                  type="text"
                  value={selectedEmoji}
                  onChange={(e) => setSelectedEmoji(e.target.value)}
                  placeholder="Or type emoji"
                  className="flex-1 min-w-[100px] px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded-lg text-center"
                  maxLength={2}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-text-dark dark:text-dark-text mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes or reminders about this habit..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition resize-none"
              />
            </div>

            {/* Advanced Options - Collapsible */}
            <div className="mb-5">
              <details className="group">
                <summary className="cursor-pointer text-sm font-semibold text-text-dark dark:text-dark-text mb-3 flex items-center gap-2 list-none">
                  <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Advanced Options
                </summary>
                
                <div className="mt-4 space-y-4 pl-6 border-l-2 border-gray-200 dark:border-gray-700">
                  {/* Frequency */}
                  <div>
                    <label className="block text-sm font-medium text-text-dark dark:text-dark-text mb-2">
                      Frequency
                    </label>
                    <div className="flex gap-2">
                      {['daily', 'weekly', 'custom'].map((freq) => (
                        <button
                          key={freq}
                          onClick={() => {
                            setFrequency(freq);
                            if (freq === 'daily') {
                              setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
                            }
                          }}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                            frequency === freq
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-text-dark dark:text-dark-text hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {freq.charAt(0).toUpperCase() + freq.slice(1)}
                        </button>
                      ))}
                    </div>
                    
                    {/* Day Selection for Weekly/Custom */}
                    {(frequency === 'weekly' || frequency === 'custom') && (
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-text-gray dark:text-dark-gray mb-2">
                          Select Days
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                if (selectedDays.includes(idx)) {
                                  setSelectedDays(selectedDays.filter(d => d !== idx));
                                } else {
                                  setSelectedDays([...selectedDays, idx].sort());
                                }
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                selectedDays.includes(idx)
                                  ? 'bg-primary text-white'
                                  : 'bg-gray-100 dark:bg-gray-800 text-text-dark dark:text-dark-text hover:bg-gray-200 dark:hover:bg-gray-700'
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Reminder Settings */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-text-dark dark:text-dark-text">
                        Reminder
                      </label>
                      <button
                        onClick={() => setReminderEnabled(!reminderEnabled)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          reminderEnabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            reminderEnabled ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    {reminderEnabled && (
                      <input
                        type="time"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        className="mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    )}
                  </div>

                  {/* Quantity Tracking */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-text-dark dark:text-dark-text">
                        Quantity Tracking
                      </label>
                      <button
                        onClick={() => setQuantityTracking({ ...quantityTracking, enabled: !quantityTracking.enabled })}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          quantityTracking.enabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            quantityTracking.enabled ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    {quantityTracking.enabled && (
                      <div className="mt-2 space-y-2">
                        <input
                          type="text"
                          placeholder="Unit (e.g., glasses, minutes, miles)"
                          value={quantityTracking.unit}
                          onChange={(e) => setQuantityTracking({ ...quantityTracking, unit: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded-lg text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Target quantity"
                          value={quantityTracking.target}
                          onChange={(e) => setQuantityTracking({ ...quantityTracking, target: parseFloat(e.target.value) || 1 })}
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded-lg text-sm"
                        />
                      </div>
                    )}
                  </div>

                  {/* Time Tracking */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-text-dark dark:text-dark-text">
                        Time Tracking
                      </label>
                      <button
                        onClick={() => setTimeTracking({ enabled: !timeTracking.enabled })}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          timeTracking.enabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            timeTracking.enabled ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    {timeTracking.enabled && (
                      <p className="text-xs text-text-gray dark:text-dark-gray mt-1">
                        Track how long you spend on this habit each day
                      </p>
                    )}
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="block text-sm font-medium text-text-dark dark:text-dark-text mb-2">
                      Difficulty
                    </label>
                    <div className="flex gap-2">
                      {['easy', 'medium', 'hard'].map((diff) => (
                        <button
                          key={diff}
                          onClick={() => setDifficulty(diff)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                            difficulty === diff
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-text-dark dark:text-dark-text hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Goal Setting */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-text-dark dark:text-dark-text">
                        Set Goal
                      </label>
                      <button
                        onClick={() => setGoal({ ...goal, enabled: !goal.enabled })}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          goal.enabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            goal.enabled ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    {goal.enabled && (
                      <div className="mt-2 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Target"
                            value={goal.target}
                            onChange={(e) => setGoal({ ...goal, target: parseInt(e.target.value) || 7 })}
                            min="1"
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded-lg text-sm"
                          />
                          <select
                            value={goal.period}
                            onChange={(e) => setGoal({ ...goal, period: e.target.value })}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded-lg text-sm"
                          >
                            <option value="week">Week</option>
                            <option value="month">Month</option>
                            <option value="year">Year</option>
                          </select>
                        </div>
                        <p className="text-xs text-text-gray dark:text-dark-gray">
                          Complete this habit {goal.target} times per {goal.period}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </details>
            </div>

            {/* Category Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-text-dark dark:text-dark-text">
                  Category
                </label>
                {onOpenCreateCategory && (
                  <button
                    onClick={onOpenCreateCategory}
                    className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Category
                  </button>
                )}
              </div>
              
              {/* Category Grid */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-text-gray dark:text-dark-gray mb-2">Select a category:</p>
                <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto overflow-x-hidden px-1">
                  {allCategories.map((category) => {
                    const colors = getCategoryColor(category.id, allCategories, isDark);
                    const isSelected = selectedCategory === category.id;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                          isSelected
                            ? `border-2 shadow-md`
                            : `border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm`
                        }`}
                        style={{
                          backgroundColor: isSelected ? colors.bg : 'transparent',
                          borderColor: isSelected ? colors.border : undefined,
                          color: colors.text,
                        }}
                      >
                        {category.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 px-3 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded-lg font-semibold text-text-dark hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={isCreating}
                className={`flex-1 px-4 py-3 bg-primary text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 ${
                  isCreating ? 'opacity-75 cursor-not-allowed' : 'hover:bg-primary/90'
                }`}
              >
                {isCreating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  isEditing ? 'Update Habit' : 'Create Habit'
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <button
                onClick={() => setShowTemplates(false)}
                className="flex items-center gap-2 text-text-gray dark:text-dark-gray hover:text-text-dark dark:hover:text-dark-text mb-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {HABIT_TEMPLATES.map(template => {
                const duplicateCount = template.habits.filter(habit => 
                  existingHabits.some(
                    h => h.name.toLowerCase().trim() === habit.name.toLowerCase().trim() && 
                         h.category === template.category &&
                         !h.archived
                  )
                ).length;
                const newHabitsCount = template.habits.length - duplicateCount;
                const isCreatingThisTemplate = isCreating && templateProgress.total > 0;
                const progress = templateProgress.total > 0 
                  ? Math.round((templateProgress.current / templateProgress.total) * 100) 
                  : 0;
                
                return (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  disabled={isCreating}
                  className={`w-full p-4 border-2 rounded-lg transition text-left relative ${
                    isCreating 
                      ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700' 
                      : 'hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{template.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-text-dark dark:text-dark-text">{template.name}</h3>
                        {isCreatingThisTemplate && (
                          <span className="text-xs text-primary font-medium">
                            {templateProgress.current}/{templateProgress.total}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-gray dark:text-dark-gray mb-2">{template.description}</p>
                      
                      {/* Progress Bar */}
                      {isCreatingThisTemplate && (
                        <div className="mb-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div 
                            className="bg-primary h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                      
                      {/* Duplicate Warning */}
                      {duplicateCount > 0 && !isCreating && (
                        <div className="mb-2 text-xs text-amber-600 dark:text-amber-400">
                          {duplicateCount} habit{duplicateCount > 1 ? 's' : ''} already exist{duplicateCount > 1 ? '' : 's'}. {newHabitsCount} new habit{newHabitsCount !== 1 ? 's' : ''} will be created.
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-1">
                        {template.habits.slice(0, 4).map((habit, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {habit.emoji} {habit.name}
                          </span>
                        ))}
                        {template.habits.length > 4 && (
                          <span className="text-xs text-text-gray dark:text-dark-gray">+{template.habits.length - 4} more</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              )})}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateHabitModal;

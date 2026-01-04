import React, { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';

const HabitCompletionModal = ({ habit, isOpen, onClose, onComplete, existingData = null, date = null }) => {
  const { isDark } = useTheme();
  const [quantity, setQuantity] = useState(existingData?.quantity || (habit?.quantityTracking?.target || 1));
  const [duration, setDuration] = useState(existingData?.duration || 0);
  const [notes, setNotes] = useState(existingData?.notes || '');

  useEffect(() => {
    if (isOpen) {
      setQuantity(existingData?.quantity || (habit?.quantityTracking?.target || 1));
      setDuration(existingData?.duration || 0);
      setNotes(existingData?.notes || '');
    }
  }, [isOpen, existingData, habit]);

  if (!isOpen || !habit) return null;

  const handleSubmit = () => {
    // Check if date is in the future (if date is provided)
    if (date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate > today) {
        alert('Cannot mark future dates as completed. Please select today or a past date.');
        return;
      }
    }
    
    const completionData = {
      completed: true,
      quantity: habit.quantityTracking?.enabled ? parseFloat(quantity) : null,
      duration: habit.timeTracking?.enabled ? parseInt(duration) : null,
      notes: notes.trim() || null,
      completedAt: new Date().toISOString(),
    };
    onComplete(completionData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-text-dark dark:text-dark-text">
            Complete: {habit.emoji} {habit.name}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Quantity Tracking */}
          {habit.quantityTracking?.enabled && (
            <div>
              <label className="block text-sm font-medium text-text-dark dark:text-dark-text mb-2">
                Quantity ({habit.quantityTracking.unit || 'units'})
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="0"
                  step="0.1"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-text-gray dark:text-dark-gray">
                  Target: {habit.quantityTracking.target}
                </span>
              </div>
              {parseFloat(quantity) >= habit.quantityTracking.target && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  ✓ Target reached!
                </p>
              )}
            </div>
          )}

          {/* Time Tracking */}
          {habit.timeTracking?.enabled && (
            <div>
              <label className="block text-sm font-medium text-text-dark dark:text-dark-text mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-text-dark dark:text-dark-text mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this completion..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition font-medium"
            >
              Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitCompletionModal;


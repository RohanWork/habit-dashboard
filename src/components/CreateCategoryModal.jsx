import React, { useState } from 'react';
import { getReadableTextColor, addOpacity, darkenColor } from '../utils/colorUtils';
import { useTheme } from '../hooks/useTheme';
import { useCategories } from '../contexts/CategoriesContext';
import { CATEGORY_LIST } from '../utils/habitCategories';

const CreateCategoryModal = ({ onClose, onCreateCategory }) => {
  const { isDark } = useTheme();
  const { hiddenPredefinedCategories, restoreCategory } = useCategories();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#6AA84F');
  const [error, setError] = useState('');

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      if (onCreateCategory) {
        // Calculate readable colors based on the selected color and current theme
        const textColor = getReadableTextColor(newCategoryColor, isDark);
        const bgColor = addOpacity(newCategoryColor, 0.15); // Light background with opacity
        const borderColor = darkenColor(newCategoryColor, 0.2); // Slightly darker for border
        
        await onCreateCategory({
          label: newCategoryName.trim(),
          bgColor: bgColor,
          textColor: textColor,
          borderColor: borderColor,
        });
        setNewCategoryName('');
        setNewCategoryColor('#6AA84F');
        setError('');
        onClose();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCreateCategory();
    }
  };

  const colorPresets = [
    '#6AA84F', // Green
    '#DC2626', // Red
    '#1D4ED8', // Blue
    '#B45309', // Yellow
    '#0D9488', // Teal
    '#6B21A8', // Purple
    '#BE185D', // Pink
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-dark dark:text-dark-text">
            Create New Category
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

        {/* Category Name Input */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-text-dark dark:text-dark-text mb-2">
            Category Name
          </label>
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., Gaming"
            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            autoFocus
          />
        </div>

        {/* Color Picker */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-text-dark dark:text-dark-text mb-3">
            Category Color
          </label>
          
          {/* Color Presets */}
          <div className="mb-4">
            <p className="text-xs text-text-gray dark:text-dark-gray mb-2">Quick select:</p>
            <div className="flex gap-3 flex-wrap">
              {colorPresets.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewCategoryColor(color)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all transform ${
                    newCategoryColor === color
                      ? 'border-gray-900 dark:border-gray-100 shadow-lg scale-110'
                      : 'border-gray-300 dark:border-gray-600 hover:scale-105 hover:shadow-md'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
          
          {/* Custom Color Picker */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <label className="text-xs font-medium text-text-dark dark:text-dark-text">Custom color:</label>
            <input
              type="color"
              value={newCategoryColor}
              onChange={(e) => setNewCategoryColor(e.target.value)}
              className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <span className="text-sm font-mono text-text-gray dark:text-dark-gray bg-white dark:bg-gray-700 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
              {newCategoryColor}
            </span>
          </div>
        </div>

        {/* Hidden Categories Section */}
        {hiddenPredefinedCategories.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-text-dark dark:text-dark-text mb-3">
              Restore Hidden Categories
            </label>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 max-h-40 overflow-y-auto">
              <div className="space-y-2">
                {hiddenPredefinedCategories.map((categoryId) => {
                  const category = CATEGORY_LIST.find(c => c.id === categoryId);
                  if (!category) return null;
                  
                  return (
                    <div
                      key={categoryId}
                      className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
                    >
                      <span className="text-xs text-text-dark dark:text-dark-text">
                        {category.label}
                      </span>
                      <button
                        onClick={async () => {
                          try {
                            await restoreCategory(categoryId);
                            setError(''); // Clear any previous errors
                          } catch (error) {
                            setError(`Error restoring category: ${error.message}`);
                          }
                        }}
                        className="px-2 py-1 text-xs bg-primary hover:bg-primary/90 text-white rounded transition"
                      >
                        Restore
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

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
            onClick={handleCreateCategory}
            className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 shadow-md hover:shadow-lg transition"
          >
            Create Category
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCategoryModal;


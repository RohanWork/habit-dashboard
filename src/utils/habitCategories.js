/**
 * Habit Categories Configuration
 * Defines available categories with colors and labels
 */

import { getLuminance, getReadableTextColor } from './colorUtils';

export const HABIT_CATEGORIES = {
  health: {
    id: 'health',
    label: 'Health',
    bgColor: '#FEE2E2', // Light red
    textColor: '#DC2626', // Dark red
    borderColor: '#EF4444',
  },
  productivity: {
    id: 'productivity',
    label: 'Productivity',
    bgColor: '#DBEAFE', // Light blue
    textColor: '#1D4ED8', // Dark blue
    borderColor: '#3B82F6',
  },
  learning: {
    id: 'learning',
    label: 'Learning',
    bgColor: '#FCD34D', // Light yellow
    textColor: '#B45309', // Dark yellow
    borderColor: '#FBBF24',
  },
  fitness: {
    id: 'fitness',
    label: 'Fitness',
    bgColor: '#BBFBEE', // Light teal
    textColor: '#0D9488', // Dark teal
    borderColor: '#14B8A6',
  },
  mindfulness: {
    id: 'mindfulness',
    label: 'Mindfulness',
    bgColor: '#F3E8FF', // Light purple
    textColor: '#6B21A8', // Dark purple
    borderColor: '#A855F7',
  },
  social: {
    id: 'social',
    label: 'Social',
    bgColor: '#FCE7F3', // Light pink
    textColor: '#BE185D', // Dark pink
    borderColor: '#EC4899',
  },
  other: {
    id: 'other',
    label: 'Other',
    bgColor: '#E5E7EB', // Light gray
    textColor: '#4B5563', // Dark gray
    borderColor: '#9CA3AF',
  },
};

export const CATEGORY_LIST = Object.values(HABIT_CATEGORIES);

export const getCategoryById = (categoryId, allCategories = null) => {
  // If allCategories provided, search there first (for custom categories)
  if (allCategories) {
    const found = allCategories.find(c => c.id === categoryId);
    if (found) return found;
  }
  
  // Fall back to predefined categories
  return HABIT_CATEGORIES[categoryId] || HABIT_CATEGORIES.other;
};

export const getCategoryColor = (categoryId, allCategories = null, isDarkMode = null) => {
  const category = getCategoryById(categoryId, allCategories);
  
  // Auto-detect dark mode if not provided
  if (isDarkMode === null && typeof window !== 'undefined') {
    isDarkMode = document.documentElement.classList.contains('dark');
  }
  
  // For custom categories, always recalculate text color based on current theme
  // This ensures text is always readable when theme changes
  // Predefined categories already have good contrast, so we keep their original colors
  let textColor = category.textColor;
  
  if (category.isCustom) {
    // Get the base color (remove alpha channel if present)
    // The bgColor might be like "#FFFFFF26" (with alpha), we need "#FFFFFF"
    let baseColor = category.bgColor;
    if (baseColor.length === 9) {
      // Has alpha channel, remove last 2 characters
      baseColor = baseColor.substring(0, 7);
    }
    
    // Always recalculate text color for custom categories based on current theme
    // This ensures proper contrast in both light and dark modes
    textColor = getReadableTextColor(baseColor, isDarkMode);
  }
  
  return {
    bg: category.bgColor,
    text: textColor,
    border: category.borderColor,
  };
};

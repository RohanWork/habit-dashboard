import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { getCustomCategories, saveCustomCategory, deleteCustomCategory, getUserData, updateUserData } from '../firebase/db';
import { HABIT_CATEGORIES, CATEGORY_LIST } from '../utils/habitCategories';

export const useCategories = () => {
  const { user } = useAuth();
  const [customCategories, setCustomCategories] = useState([]);
  const [hiddenPredefinedCategories, setHiddenPredefinedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch custom categories and hidden predefined categories on mount or when user changes
  useEffect(() => {
    if (!user) {
      setCustomCategories([]);
      setHiddenPredefinedCategories([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [categories, userData] = await Promise.all([
          getCustomCategories(user.uid),
          getUserData(user.uid)
        ]);
        setCustomCategories(categories || []);
        setHiddenPredefinedCategories(userData?.hiddenCategories || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Create a new custom category
  const createCategory = useCallback(async (categoryData) => {
    if (!user) return;

    try {
      const categoryId = `custom_${Date.now()}`;
      const newCategory = {
        ...categoryData,
        id: categoryId,
        isCustom: true,
      };
      await saveCustomCategory(user.uid, categoryId, newCategory);
      setCustomCategories([...customCategories, newCategory]);
      return newCategory;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [user, customCategories]);

  // Delete/hide category (custom categories are deleted, predefined are hidden)
  const removeCategory = useCallback(async (categoryId) => {
    if (!user) return;

    try {
      // Check if it's a custom category
      const isCustom = customCategories.some(c => c.id === categoryId);
      
      if (isCustom) {
        // Delete custom category from database
        await deleteCustomCategory(user.uid, categoryId);
        setCustomCategories(customCategories.filter(c => c.id !== categoryId));
      } else {
        // Hide predefined category by adding to hidden list
        const updatedHidden = [...hiddenPredefinedCategories, categoryId];
        await updateUserData(user.uid, { hiddenCategories: updatedHidden });
        setHiddenPredefinedCategories(updatedHidden);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [user, customCategories, hiddenPredefinedCategories]);

  // Restore hidden predefined category
  const restoreCategory = useCallback(async (categoryId) => {
    if (!user) return;

    try {
      const updatedHidden = hiddenPredefinedCategories.filter(id => id !== categoryId);
      await updateUserData(user.uid, { hiddenCategories: updatedHidden });
      setHiddenPredefinedCategories(updatedHidden);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [user, hiddenPredefinedCategories]);

  // Merge predefined and custom categories, filtering out hidden predefined categories
  // Use useMemo to prevent creating a new array on every render
  // Also ensure no duplicates by using a Map to track unique IDs
  const allCategories = useMemo(() => {
    const visiblePredefined = CATEGORY_LIST.filter(
      cat => !hiddenPredefinedCategories.includes(cat.id)
    );
    
    // Use a Map to ensure uniqueness by category ID
    const categoryMap = new Map();
    
    // Add predefined categories first (they take precedence)
    visiblePredefined.forEach(cat => {
      categoryMap.set(cat.id, cat);
    });
    
    // Add custom categories, but skip if a predefined category with same ID exists
    customCategories.forEach(cat => {
      // Only add if not already present (avoid duplicates)
      if (!categoryMap.has(cat.id)) {
        categoryMap.set(cat.id, cat);
      }
    });
    
    // Convert Map values back to array
    return Array.from(categoryMap.values());
  }, [customCategories, hiddenPredefinedCategories]);

  return {
    categories: allCategories,
    customCategories,
    hiddenPredefinedCategories,
    loading,
    error,
    createCategory,
    removeCategory,
    restoreCategory,
  };
};

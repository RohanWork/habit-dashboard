import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { db } from './config';

// ============ HABITS ============

// Create or update a habit
export const saveHabit = async (userId, habitId, habitData) => {
  try {
    const habitRef = doc(db, `habits/${userId}/items`, habitId);
    await setDoc(habitRef, habitData, { merge: true });
  } catch (error) {
    throw error;
  }
};

// Get a single habit
export const getHabit = async (userId, habitId) => {
  try {
    const habitRef = doc(db, `habits/${userId}/items`, habitId);
    const habitSnap = await getDoc(habitRef);
    if (habitSnap.exists()) {
      return { id: habitSnap.id, ...habitSnap.data() };
    }
    return null;
  } catch (error) {
    throw error;
  }
};

// Get all habits for a user
export const getUserHabits = async (userId) => {
  try {
    const habitsRef = collection(db, `habits/${userId}/items`);
    let snapshot;
    
    // Try to get habits ordered by 'order' field
    try {
      const q = query(habitsRef, orderBy('order', 'asc'));
      snapshot = await getDocs(q);
    } catch (error) {
      // If orderBy fails (e.g., missing index or missing order field), get all habits without ordering
      console.warn('Could not order habits by order field, fetching all habits:', error);
      snapshot = await getDocs(habitsRef);
    }
    
    const habits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Ensure all habits have an order field (for backward compatibility)
    habits.forEach((habit, index) => {
      if (habit.order === undefined) {
        habit.order = index;
      }
    });
    
    // Sort by order to ensure consistency
    habits.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    return habits;
  } catch (error) {
    throw error;
  }
};

// Delete a habit
export const deleteHabit = async (userId, habitId) => {
  try {
    await deleteDoc(doc(db, `habits/${userId}/items`, habitId));
  } catch (error) {
    throw error;
  }
};

// ============ DAILY LOGS ============

// Save or update daily log
export const saveDailyLog = async (userId, dateString, logData) => {
  try {
    const logRef = doc(db, `dailyLogs/${userId}/logs`, dateString);
    // Ensure the stored doc always has the date field matching the doc id
    const payload = { ...logData, date: dateString };
    await setDoc(logRef, payload, { merge: true });
    // write complete
  } catch (error) {
    throw error;
  }
};

// Get daily log for a specific date
export const getDailyLog = async (userId, dateString) => {
  try {
    const logRef = doc(db, `dailyLogs/${userId}/logs`, dateString);
    const snapshot = await getDoc(logRef);
    const data = snapshot.exists() ? snapshot.data() : null;
    return data;
  } catch (error) {
    throw error;
  }
};

// Get all daily logs for a date range
export const getDailyLogsByDateRange = async (userId, startDate, endDate) => {
  try {
    const logsRef = collection(db, `dailyLogs/${userId}/logs`);
    const q = query(
      logsRef,
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'asc')
    );
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map(d => ({ ...d.data() }));
    return results;
  } catch (error) {
    throw error;
  }
};

// ============ USERS ============

// Get user data
export const getUserData = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const snapshot = await getDoc(userRef);
    return snapshot.exists() ? snapshot.data() : null;
  } catch (error) {
    throw error;
  }
};

// Update user data
export const updateUserData = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, userData);
  } catch (error) {
    throw error;
  }
};

// ============ TODOS ============

// Create or update a todo
export const saveTodo = async (userId, todoId, todoData) => {
  try {
    if (!userId || !todoId) {
      throw new Error('User ID and Todo ID are required');
    }
    const todoRef = doc(db, `todos/${userId}/items`, todoId);
    await setDoc(todoRef, todoData, { merge: true });
  } catch (error) {
    throw error;
  }
};

// Get all todos for a user
export const getUserTodos = async (userId) => {
  try {
    const todosRef = collection(db, `todos/${userId}/items`);
    const q = query(todosRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    // If orderBy fails, try without ordering
    try {
      const todosRef = collection(db, `todos/${userId}/items`);
      const snapshot = await getDocs(todosRef);
      const todos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by createdAt if available
      return todos.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
    } catch (err) {
      throw error;
    }
  }
};

// Delete a todo
export const deleteTodo = async (userId, todoId) => {
  try {
    await deleteDoc(doc(db, `todos/${userId}/items`, todoId));
  } catch (error) {
    throw error;
  }
};
// ============ CUSTOM CATEGORIES ============

// Save custom category
export const saveCustomCategory = async (userId, categoryId, categoryData) => {
  try {
    const categoryRef = doc(db, `customCategories/${userId}/categories`, categoryId);
    await setDoc(categoryRef, categoryData, { merge: true });
  } catch (error) {
    throw error;
  }
};

// Get all custom categories for a user
export const getCustomCategories = async (userId) => {
  try {
    const categoriesRef = collection(db, `customCategories/${userId}/categories`);
    const snapshot = await getDocs(categoriesRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
};

// Delete custom category
export const deleteCustomCategory = async (userId, categoryId) => {
  try {
    await deleteDoc(doc(db, `customCategories/${userId}/categories`, categoryId));
  } catch (error) {
    throw error;
  }
};

// ============ DELETE ALL USER DATA ============

// Delete all user data (habits, daily logs, categories, user document)
export const deleteAllUserData = async (userId) => {
  try {
    // Delete all habits (if any exist)
    try {
      const habitsRef = collection(db, `habits/${userId}/items`);
      const habitsSnapshot = await getDocs(habitsRef);
      if (!habitsSnapshot.empty) {
        const habitDeletePromises = habitsSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(habitDeletePromises);
      }
    } catch (error) {
      console.error('Error deleting habits:', error);
    }

    // Delete all daily logs (if any exist)
    try {
      const logsRef = collection(db, `dailyLogs/${userId}/logs`);
      const logsSnapshot = await getDocs(logsRef);
      if (!logsSnapshot.empty) {
        const logDeletePromises = logsSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(logDeletePromises);
      }
    } catch (error) {
      console.error('Error deleting daily logs:', error);
    }

    // Delete all custom categories (if any exist)
    try {
      const categoriesRef = collection(db, `customCategories/${userId}/categories`);
      const categoriesSnapshot = await getDocs(categoriesRef);
      if (!categoriesSnapshot.empty) {
        const categoryDeletePromises = categoriesSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(categoryDeletePromises);
      }
    } catch (error) {
      console.error('Error deleting categories:', error);
    }

    // Delete user document
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (error) {
      console.error('Error deleting user document:', error);
    }
  } catch (error) {
    throw error;
  }
};
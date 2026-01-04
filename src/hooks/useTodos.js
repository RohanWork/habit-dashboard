import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { getUserTodos, saveTodo, deleteTodo } from '../firebase/db';

export const useTodos = () => {
  const { user } = useAuth();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchTodos = async () => {
      try {
        setLoading(true);
        const userTodos = await getUserTodos(user.uid);
        // Ensure all todos have an id
        const todosWithIds = userTodos.map(todo => ({
          ...todo,
          id: todo.id || todo.createdAt || Date.now().toString()
        }));
        setTodos(todosWithIds);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, [user]);

  // Create a new todo
  const createTodo = useCallback(async (title, description = '', priority = 'medium', dueDate = null) => {
    if (!user) return;

    try {
      const todoId = Date.now().toString();
      const todoData = {
        id: todoId,
        title: title.trim(),
        description: description.trim() || '',
        completed: false,
        pinned: false,
        priority: priority || 'medium', // 'low', 'medium', 'high'
        dueDate: dueDate || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setTodos(prevTodos => [todoData, ...prevTodos]);
      await saveTodo(user.uid, todoId, todoData);
      return todoId;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [user]);

  // Update a todo
  const updateTodo = useCallback(async (todoId, updates) => {
    if (!user || !todoId) return;

    try {
      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === todoId ? { ...todo, ...updatedData } : todo
        )
      );

      await saveTodo(user.uid, todoId, updatedData);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [user]);

  // Toggle todo completion
  const toggleTodo = useCallback(async (todoId) => {
    if (!user || !todoId) return;

    try {
      const todo = todos.find(t => t.id === todoId);
      if (!todo) {
        console.error('Todo not found:', todoId);
        return;
      }

      const updatedData = {
        completed: !todo.completed,
        updatedAt: new Date().toISOString(),
      };

      setTodos(prevTodos =>
        prevTodos.map(t =>
          t.id === todoId ? { ...t, ...updatedData } : t
        )
      );

      await saveTodo(user.uid, todoId, updatedData);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [user, todos]);

  // Delete a todo
  const removeTodo = useCallback(async (todoId) => {
    if (!user) return;

    try {
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== todoId));
      await deleteTodo(user.uid, todoId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [user]);

  return {
    todos,
    loading,
    error,
    createTodo,
    updateTodo,
    toggleTodo,
    removeTodo,
  };
};


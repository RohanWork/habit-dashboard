import React, { useState } from 'react';
import { useTodos } from '../hooks/useTodos';
import { useTheme } from '../hooks/useTheme';

const Todos = () => {
  const { isDark } = useTheme();
  const { todos, loading, error, createTodo, updateTodo, toggleTodo, removeTodo } = useTodos();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'
  const [sortBy, setSortBy] = useState('created'); // 'created', 'priority', 'dueDate'
  const [editingTodo, setEditingTodo] = useState(null);
  const [quickAddText, setQuickAddText] = useState('');
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  // Filter todos by status and search query
  const filteredTodos = todos.filter(todo => {
    // Filter by status (all/active/completed)
    let matchesStatus = true;
    if (filter === 'active') matchesStatus = !todo.completed;
    if (filter === 'completed') matchesStatus = todo.completed;
    
    // Filter by search query
    let matchesSearch = true;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const titleMatch = todo.title?.toLowerCase().includes(query);
      const descriptionMatch = todo.description?.toLowerCase().includes(query);
      matchesSearch = titleMatch || descriptionMatch;
    }
    
    return matchesStatus && matchesSearch;
  });

  // Sort todos (pinned tasks always appear first)
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    // Pinned tasks always come first
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    
    // If both pinned or both not pinned, use the selected sort
    if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    }
    if (sortBy === 'dueDate') {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    // Sort by created date (newest first)
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  const activeCount = todos.filter(t => !t.completed).length;
  const completedCount = todos.filter(t => t.completed).length;

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    const title = quickAddText.trim();
    if (!title || isQuickAdding) return;

    setIsQuickAdding(true);
    try {
      await createTodo(title, '', 'medium', null);
      setQuickAddText('');
    } catch (err) {
      console.error('Error creating todo:', err);
    } finally {
      setIsQuickAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-light dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-gray dark:text-dark-gray">Loading todos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light dark:bg-dark-bg py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div>
              <h1 className="text-3xl font-bold text-text-dark dark:text-dark-text mb-1">
                To Do
              </h1>
              <p className="text-sm text-text-gray dark:text-dark-gray">
                {activeCount} active, {completedCount} completed
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 self-start sm:self-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Task
            </button>
          </div>

          {/* Quick Add and Search - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <form onSubmit={handleQuickAdd} className="relative">
              <input
                type="text"
                value={quickAddText}
                onChange={(e) => setQuickAddText(e.target.value)}
                placeholder="Quick add task..."
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                disabled={isQuickAdding}
              />
              <button
                type="submit"
                disabled={!quickAddText.trim() || isQuickAdding}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-primary hover:text-primary/80 disabled:text-gray-400 disabled:cursor-not-allowed transition"
                title="Add task (Enter)"
              >
                {isQuickAdding ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </button>
            </form>

            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-gray dark:text-dark-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-text-dark dark:text-dark-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-gray dark:text-dark-gray hover:text-text-dark dark:hover:text-dark-text transition"
                  title="Clear search"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Filters, Sort, and View Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {['all', 'active', 'completed'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm transition ${
                    filter === f
                      ? 'bg-primary text-white'
                      : 'bg-white dark:bg-dark-surface text-text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-600 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition ${
                    viewMode === 'list'
                      ? 'bg-primary text-white'
                      : 'text-text-gray dark:text-dark-gray hover:text-primary'
                  }`}
                  title="List view"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition ${
                    viewMode === 'grid'
                      ? 'bg-primary text-white'
                      : 'text-text-gray dark:text-dark-gray hover:text-primary'
                  }`}
                  title="Grid view"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-600 rounded-lg text-xs sm:text-sm text-text-dark dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="created">Sort by Created</option>
                <option value="priority">Sort by Priority</option>
                <option value="dueDate">Sort by Due Date</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
            {error}
            {error.includes('permission') && (
              <div className="mt-2 text-xs">
                <p className="font-semibold mb-1">To fix this:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Go to Firebase Console → Firestore Database → Rules</li>
                  <li>Add this rule for todos:</li>
                  <li className="font-mono text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1">
                    match /todos/{"{userId}"}/items/{"{todoId}"} {"{"}<br/>
                    &nbsp;&nbsp;allow read, write: if request.auth.uid == userId;<br/>
                    {"}"}
                  </li>
                  <li>Click "Publish" to save the rules</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Todos List */}
        {sortedTodos.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-text-gray dark:text-dark-gray text-lg">
              {searchQuery ? (
                <>No tasks found matching "{searchQuery}"</>
              ) : filter === 'completed' ? (
                'No completed tasks yet'
              ) : filter === 'active' ? (
                'No active tasks. Great job!'
              ) : (
                'No tasks yet. Create one to get started!'
              )}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 text-sm text-primary hover:text-primary/80 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedTodos.map((todo, index) => (
              <TodoCard
                key={todo.id || `todo-${index}-${todo.createdAt}`}
                todo={todo}
                onToggle={() => toggleTodo(todo.id)}
                onUpdate={(updates) => updateTodo(todo.id, updates)}
                onDelete={() => removeTodo(todo.id)}
                onPin={() => updateTodo(todo.id, { pinned: !todo.pinned })}
                isEditing={editingTodo === todo.id}
                onEdit={() => setEditingTodo(todo.id)}
                onCancelEdit={() => setEditingTodo(null)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTodos.map((todo, index) => (
              <TodoItem
                key={todo.id || `todo-${index}-${todo.createdAt}`}
                todo={todo}
                onToggle={() => toggleTodo(todo.id)}
                onUpdate={(updates) => updateTodo(todo.id, updates)}
                onDelete={() => removeTodo(todo.id)}
                onPin={() => updateTodo(todo.id, { pinned: !todo.pinned })}
                isEditing={editingTodo === todo.id}
                onEdit={() => setEditingTodo(todo.id)}
                onCancelEdit={() => setEditingTodo(null)}
              />
            ))}
          </div>
        )}

        {/* Create Todo Modal */}
        {showCreateModal && (
          <CreateTodoModal
            onClose={() => setShowCreateModal(false)}
            onCreate={async (title, description, priority, dueDate) => {
              await createTodo(title, description, priority, dueDate);
              setShowCreateModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Todo Item Component
const TodoItem = ({ todo, onToggle, onUpdate, onDelete, onPin, isEditing, onEdit, onCancelEdit }) => {
  const { isDark } = useTheme();
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || '');
  const [priority, setPriority] = useState(todo.priority || 'medium');
  const [dueDate, setDueDate] = useState(todo.dueDate || '');

  const priorityColors = {
    high: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700',
    medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700',
    low: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700',
  };

  const handleSave = () => {
    onUpdate({
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate || null,
    });
    onCancelEdit();
  };

  const isOverdue = todo.dueDate && !todo.completed && new Date(todo.dueDate) < new Date();

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border-2 border-primary dark:border-primary p-4 ring-2 ring-primary/20">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Task title"
          autoFocus
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="Description (optional)"
          rows={3}
        />
        <div className="flex gap-3 mb-3">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition"
          >
            Save
          </button>
          <button
            onClick={onCancelEdit}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-text-dark dark:text-dark-text rounded-lg font-medium transition"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-dark-surface rounded-xl shadow-sm border-2 ${
      todo.pinned ? 'border-primary dark:border-primary' : 'border-gray-300 dark:border-gray-600'
    } p-4 transition ${
      todo.completed ? 'opacity-60' : ''
    }`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={todo.completed || false}
          onChange={onToggle}
          className="mt-1 w-5 h-5 text-primary rounded cursor-pointer accent-primary flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
              {todo.pinned && (
                <svg className="w-4 h-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              )}
                <h3 className={`font-semibold text-text-dark dark:text-dark-text flex-1 ${
                  todo.completed ? 'line-through' : ''
                }`}>
                  {todo.title}
                </h3>
              </div>
              {todo.description && (
                <p className={`text-sm text-text-gray dark:text-dark-gray mt-1 ${
                  todo.completed ? 'line-through' : ''
                }`}>
                  {todo.description}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                {todo.dueDate && (
                  <span className={`text-xs px-2 py-1 rounded ${
                    isOverdue ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-700 text-text-gray dark:text-dark-gray'
                  }`}>
                    {new Date(todo.dueDate).toLocaleDateString()}
                    {isOverdue && ' ⚠️'}
                  </span>
                )}
                <span className={`text-xs px-2 py-1 rounded border ${priorityColors[todo.priority] || priorityColors.medium}`}>
                  {todo.priority}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onPin}
                  className={`p-1.5 rounded transition ${
                    todo.pinned
                      ? 'text-primary hover:text-primary/80 hover:bg-primary/10'
                      : 'text-text-gray dark:text-dark-gray hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title={todo.pinned ? 'Unpin task' : 'Pin task'}
                  aria-label={todo.pinned ? 'Unpin task' : 'Pin task'}
                >
                  <svg className="w-4 h-4" fill={todo.pinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    {todo.pinned ? (
                      <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    )}
                  </svg>
                </button>
                <button
                  onClick={onEdit}
                  className="p-1.5 text-primary hover:text-primary/80 hover:bg-primary/10 rounded transition"
                  title="Edit task"
                  aria-label="Edit task"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={onDelete}
                  className="p-1.5 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                  title="Delete task"
                  aria-label="Delete task"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Todo Card Component (for Grid View)
const TodoCard = ({ todo, onToggle, onUpdate, onDelete, onPin, isEditing, onEdit, onCancelEdit }) => {
  const { isDark } = useTheme();
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || '');
  const [priority, setPriority] = useState(todo.priority || 'medium');
  const [dueDate, setDueDate] = useState(todo.dueDate || '');

  const priorityColors = {
    high: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700',
    medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700',
    low: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700',
  };

  const handleSave = () => {
    onUpdate({
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate || null,
    });
    onCancelEdit();
  };

  const isOverdue = todo.dueDate && !todo.completed && new Date(todo.dueDate) < new Date();

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border-2 border-primary dark:border-primary p-4 ring-2 ring-primary/20 h-full">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          placeholder="Task title"
          autoFocus
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
          placeholder="Description (optional)"
          rows={3}
        />
        <div className="flex gap-2 mb-3">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="flex-1 px-2 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="flex-1 px-2 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition text-sm"
          >
            Save
          </button>
          <button
            onClick={onCancelEdit}
            className="flex-1 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-text-dark dark:text-dark-text rounded-lg font-medium transition text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-dark-surface rounded-xl shadow-sm border-2 ${
      todo.pinned ? 'border-primary dark:border-primary' : 'border-gray-300 dark:border-gray-600'
    } p-4 transition h-full flex flex-col ${
      todo.completed ? 'opacity-60' : ''
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={todo.completed || false}
            onChange={onToggle}
            className="w-4 h-4 text-primary rounded cursor-pointer accent-primary flex-shrink-0"
          />
          {todo.pinned && (
            <svg className="w-3.5 h-3.5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          )}
        </div>
        <button
          onClick={onPin}
          className={`p-1 rounded transition ${
            todo.pinned
              ? 'text-primary hover:text-primary/80 hover:bg-primary/10'
              : 'text-text-gray dark:text-dark-gray hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title={todo.pinned ? 'Unpin task' : 'Pin task'}
        >
          <svg className="w-3.5 h-3.5" fill={todo.pinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            {todo.pinned ? (
              <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            )}
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 mb-3">
        <h3 className={`font-semibold text-text-dark dark:text-dark-text mb-1.5 text-sm ${
          todo.completed ? 'line-through' : ''
        }`}>
          {todo.title}
        </h3>
        {todo.description && (
          <p className={`text-xs text-text-gray dark:text-dark-gray line-clamp-3 ${
            todo.completed ? 'line-through' : ''
          }`}>
            {todo.description}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 flex-wrap">
          {todo.dueDate && (
            <span className={`text-xs px-2 py-0.5 rounded ${
              isOverdue ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-700 text-text-gray dark:text-dark-gray'
            }`}>
              {new Date(todo.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded border ${priorityColors[todo.priority] || priorityColors.medium}`}>
            {todo.priority}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1 text-primary hover:text-primary/80 hover:bg-primary/10 rounded transition"
            title="Edit"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
            title="Delete"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Create Todo Modal
const CreateTodoModal = ({ onClose, onCreate }) => {
  const { isDark } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      await onCreate(title.trim(), description.trim(), priority, dueDate || null);
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-text-dark dark:text-dark-text">New Task</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text-dark dark:text-dark-text mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Buy groceries"
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-dark dark:text-dark-text mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this task..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-dark dark:text-dark-text mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-dark dark:text-dark-text mb-2">
                Due Date (Optional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded-lg font-semibold text-text-dark hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition"
            >
              Create Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Todos;


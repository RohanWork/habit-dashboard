/**
 * Habit Templates
 * Pre-built habit templates that users can quickly add
 */

export const HABIT_TEMPLATES = [
  {
    id: 'morning_routine',
    name: 'Morning Routine',
    emoji: '🌅',
    category: 'productivity',
    description: 'Start your day right',
    habits: [
      { name: 'Wake up early', emoji: '⏰' },
      { name: 'Drink water', emoji: '💧' },
      { name: 'Meditation', emoji: '🧘' },
      { name: 'Exercise', emoji: '🏃' },
      { name: 'Healthy breakfast', emoji: '🥗' },
    ],
  },
  {
    id: 'fitness',
    name: 'Fitness Goals',
    emoji: '💪',
    category: 'fitness',
    description: 'Build a stronger you',
    habits: [
      { name: 'Morning workout', emoji: '🏋️' },
      { name: 'Evening walk', emoji: '🚶' },
      { name: 'Stretching', emoji: '🤸' },
      { name: '10k steps', emoji: '👣' },
    ],
  },
  {
    id: 'health',
    name: 'Health & Wellness',
    emoji: '❤️',
    category: 'health',
    description: 'Take care of yourself',
    habits: [
      { name: '8 hours sleep', emoji: '😴' },
      { name: 'Drink 8 glasses water', emoji: '💧' },
      { name: 'Take vitamins', emoji: '💊' },
      { name: 'No junk food', emoji: '🥗' },
    ],
  },
  {
    id: 'learning',
    name: 'Learning & Growth',
    emoji: '📚',
    category: 'learning',
    description: 'Never stop learning',
    habits: [
      { name: 'Read 30 minutes', emoji: '📖' },
      { name: 'Practice coding', emoji: '💻' },
      { name: 'Learn new language', emoji: '🗣️' },
      { name: 'Watch educational video', emoji: '🎓' },
    ],
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness',
    emoji: '🧘',
    category: 'mindfulness',
    description: 'Find your inner peace',
    habits: [
      { name: 'Meditation', emoji: '🧘' },
      { name: 'Journaling', emoji: '📝' },
      { name: 'Gratitude practice', emoji: '🙏' },
      { name: 'Deep breathing', emoji: '🌬️' },
    ],
  },
  {
    id: 'productivity',
    name: 'Productivity Boost',
    emoji: '⚡',
    category: 'productivity',
    description: 'Get things done',
    habits: [
      { name: 'Plan your day', emoji: '📋' },
      { name: 'Focus time (Pomodoro)', emoji: '🍅' },
      { name: 'Review goals', emoji: '🎯' },
      { name: 'Declutter workspace', emoji: '🧹' },
    ],
  },
  {
    id: 'social',
    name: 'Social Connection',
    emoji: '👥',
    category: 'social',
    description: 'Stay connected',
    habits: [
      { name: 'Call family', emoji: '📞' },
      { name: 'Meet a friend', emoji: '👫' },
      { name: 'Help someone', emoji: '🤝' },
      { name: 'Social media break', emoji: '📱' },
    ],
  },
];

export const getTemplateById = (templateId) => {
  return HABIT_TEMPLATES.find(t => t.id === templateId);
};



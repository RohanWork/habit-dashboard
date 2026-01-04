import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../hooks/useTheme';

// Animated Icon Components
const AnimatedIcon = ({ children, delay = 0 }) => (
  <span className="inline-block animate-bounce" style={{ animationDelay: `${delay}s`, animationDuration: '2s' }}>
    {children}
  </span>
);

const PulsingIcon = ({ children }) => (
  <span className="inline-block animate-pulse">{children}</span>
);

// Visual Diagram Components
const HabitFlowDiagram = () => (
  <div className="my-6 p-6 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-xl border border-primary/20">
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
      <div className="flex flex-col items-center animate-fade-in">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg transform hover:scale-110 transition-transform">
          1
        </div>
        <p className="mt-2 text-sm font-medium text-text-dark dark:text-dark-text">Create</p>
      </div>
      <div className="hidden md:block text-primary text-2xl animate-pulse">→</div>
      <div className="flex flex-col items-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg transform hover:scale-110 transition-transform">
          2
        </div>
        <p className="mt-2 text-sm font-medium text-text-dark dark:text-dark-text">Track</p>
      </div>
      <div className="hidden md:block text-primary text-2xl animate-pulse">→</div>
      <div className="flex flex-col items-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg transform hover:scale-110 transition-transform">
          3
        </div>
        <p className="mt-2 text-sm font-medium text-text-dark dark:text-dark-text">Analyze</p>
      </div>
    </div>
  </div>
);

const ProgressRingVisual = () => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setProgress(75), 300);
    return () => clearTimeout(timer);
  }, []);

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="my-4 flex justify-center">
      <div className="relative w-32 h-32">
        <svg className="transform -rotate-90" width="128" height="128">
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="8"
            className="dark:stroke-gray-700"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="#6AA84F"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-primary">{progress}%</span>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, delay = 0 }) => (
  <div
    className="bg-white dark:bg-dark-surface rounded-lg p-4 border border-gray-200 dark:border-gray-700 transform hover:scale-105 hover:shadow-lg transition-all duration-300 animate-fade-in"
    style={{ animationDelay: `${delay}s` }}
  >
    <div className="text-3xl mb-2">{icon}</div>
    <h4 className="font-semibold text-text-dark dark:text-dark-text mb-1">{title}</h4>
    <p className="text-sm text-text-gray dark:text-dark-gray">{description}</p>
  </div>
);

const FeedbackWidget = ({ guideId, onFeedback }) => {
  const [feedback, setFeedback] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleFeedback = (value) => {
    setFeedback(value);
    setSubmitted(true);
    if (onFeedback) onFeedback(guideId, value);
    setTimeout(() => setSubmitted(false), 3000);
  };

  if (submitted) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
        <p className="text-sm text-green-700 dark:text-green-300">Thank you for your feedback!</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <p className="text-sm font-medium text-text-dark dark:text-dark-text mb-3">Was this guide helpful?</p>
      <div className="flex gap-2">
        <button
          onClick={() => handleFeedback('yes')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition ${
            feedback === 'yes'
              ? 'bg-green-500 text-white'
              : 'bg-white dark:bg-gray-700 text-text-dark dark:text-dark-text hover:bg-green-50 dark:hover:bg-green-900/20'
          }`}
        >
          ✓ Yes
        </button>
        <button
          onClick={() => handleFeedback('no')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition ${
            feedback === 'no'
              ? 'bg-red-500 text-white'
              : 'bg-white dark:bg-gray-700 text-text-dark dark:text-dark-text hover:bg-red-50 dark:hover:bg-red-900/20'
          }`}
        >
          ✗ No
        </button>
      </div>
    </div>
  );
};

const Guide = () => {
  const { isDark } = useTheme();
  const [expandedSection, setExpandedSection] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Guide content structure with improved wording
  const guideContent = {
    'getting-started': {
      id: 'getting-started',
      title: 'Getting Started',
      icon: '🚀',
      category: 'basics',
      description: 'Learn the fundamentals of using the Habit Dashboard',
      content: {
        intro: 'Welcome to the Habit Dashboard! This guide will help you get started with tracking your habits and building a better lifestyle.',
        steps: [
          {
            title: 'Create Your Account',
            description: 'Sign up with your email address and create a secure password. Your data is automatically synced across all devices using Firebase.',
            action: 'Navigate to the login page and click "Create an account"',
            visual: 'account'
          },
          {
            title: 'Understand the Navigation',
            description: 'The dashboard has five main sections accessible from the top navigation bar.',
            action: 'Familiarize yourself with each section',
            items: [
              { name: 'Dashboard', desc: 'View your weekly progress and daily habit completion', icon: '📊' },
              { name: 'Habits', desc: 'Manage all your habits in a monthly grid view', icon: '✅' },
              { name: 'Analytics', desc: 'Analyze your performance and identify patterns', icon: '📈' },
              { name: 'To Do', desc: 'Manage tasks with priorities and due dates', icon: '📝' },
              { name: 'Guide', desc: 'Access this comprehensive help documentation', icon: '📖' }
            ]
          },
          {
            title: 'Create Your First Habit',
            description: 'Start by creating a simple habit to understand how the system works.',
            action: 'Follow these steps to create a habit',
            steps: [
              'Click the "Create Habit" button on the Habits page',
              'Enter a clear, descriptive name (e.g., "Drink 8 glasses of water")',
              'Select an appropriate category or create a custom one',
              'Click "Create" to add the habit to your list'
            ]
          }
        ],
        tip: 'Start with 3-5 simple habits to build momentum. You can always add more complex habits later as you become familiar with the system.'
      },
      related: ['basic-tracking', 'categories']
    },
    'basic-tracking': {
      id: 'basic-tracking',
      title: 'How to Track Your Habits',
      icon: '✅',
      category: 'basics',
      description: 'Master the essential habit tracking features',
      content: {
        intro: 'Tracking habits is the core functionality of this dashboard. Learn how to mark habits complete and track your daily metrics.',
        steps: [
          {
            title: 'Mark Habits as Complete',
            description: 'You can mark habits complete from either the Dashboard or Habits page.',
            action: 'Choose your preferred method',
            methods: [
              {
                name: 'Dashboard Method',
                steps: [
                  'Select a day from the weekly overview cards',
                  'Check the checkbox next to each habit you completed',
                  'Uncheck to mark as incomplete if needed'
                ]
              },
              {
                name: 'Habits Page Method',
                steps: [
                  'Navigate to the Habits page',
                  'Click any checkbox in the monthly grid',
                  'Each row represents a habit, each column represents a day'
                ]
              }
            ]
          },
          {
            title: 'Track Daily Metrics',
            description: 'Monitor your mood, energy, and focus levels daily to identify patterns and correlations.',
            action: 'Use the sliders to rate each metric',
            metrics: [
              { name: 'Mood', scale: '1 (Very Poor) to 5 (Excellent)', icon: '😊' },
              { name: 'Energy', scale: '1 (Very Low) to 5 (Very High)', icon: '⚡' },
              { name: 'Focus', scale: '1 (Very Poor) to 5 (Excellent)', icon: '🎯' }
            ],
            note: 'You cannot update metrics for future dates. This ensures accurate historical tracking.'
          },
          {
            title: 'View Your Progress',
            description: 'Multiple visualizations help you understand your progress at a glance.',
            action: 'Explore different progress views',
            views: [
              { name: 'Weekly Progress Ring', desc: 'Circular visualization showing overall completion percentage', visual: 'ring' },
              { name: 'Daily Cards', desc: 'Individual day cards with completion counts and streaks', visual: 'cards' },
              { name: 'Monthly Grid', desc: 'Complete overview of all habits for the entire month', visual: 'grid' }
            ]
          }
        ]
      },
      related: ['categories', 'intermediate']
    },
    'categories': {
      id: 'categories',
      title: 'Organizing Habits with Categories',
      icon: '📁',
      category: 'organization',
      description: 'Create and manage categories to organize your habits',
      content: {
        intro: 'Categories help you organize and filter your habits effectively. Use predefined categories or create custom ones that match your lifestyle.',
        steps: [
          {
            title: 'Understanding Predefined Categories',
            description: 'The dashboard comes with several built-in categories to get you started.',
            action: 'Familiarize yourself with available categories',
            categories: ['Health', 'Fitness', 'Learning', 'Productivity', 'Social', 'Mindfulness', 'Finance', 'Other']
          },
          {
            title: 'Create a Custom Category',
            description: 'Create categories that match your specific needs and preferences.',
            action: 'Follow these steps',
            steps: [
              'Navigate to the Habits page',
              'In the category filter section, click "New Category"',
              'Enter a descriptive category name',
              'Choose a color that helps you identify it quickly',
              'Click "Create" to add your custom category'
            ]
          },
          {
            title: 'Filter Habits by Category',
            description: 'Use category filters to focus on specific areas of your life.',
            action: 'Toggle categories on and off',
            steps: [
              'Click category buttons in the filter section to toggle them',
              'Selected categories are highlighted with a border',
              'Only habits from selected categories are displayed',
              'Select all categories to view all habits'
            ]
          },
          {
            title: 'Manage Categories',
            description: 'Keep your category list organized by hiding unused categories or deleting custom ones.',
            action: 'Use these management options',
            options: [
              'Hover over a category to see the delete/hide button',
              'Hide predefined categories you don\'t use (can be restored later)',
              'Delete custom categories that are no longer needed',
              'Note: You cannot delete categories that are in use by habits'
            ]
          }
        ]
      },
      related: ['basic-tracking', 'intermediate']
    },
    'intermediate': {
      id: 'intermediate',
      title: 'Intermediate Features',
      icon: '📊',
      category: 'features',
      description: 'Explore advanced habit management features',
      content: {
        intro: 'Once you\'re comfortable with basic tracking, explore these intermediate features to enhance your habit management experience.',
        steps: [
          {
            title: 'Edit Existing Habits',
            description: 'Modify habit properties as your needs change.',
            action: 'Click the pencil icon next to any habit',
            editable: ['Habit name', 'Category', 'Emoji', 'Notes', 'All advanced options']
          },
          {
            title: 'Archive and Unarchive Habits',
            description: 'Temporarily hide habits without deleting them permanently.',
            action: 'Use the archive feature',
            steps: [
              'Click the archive icon on a habit row',
              'Archived habits are hidden by default',
              'Toggle "Show Archived" to view archived habits',
              'Click "Unarchive" to restore a habit'
            ]
          },
          {
            title: 'Search Your Habits',
            description: 'Quickly find specific habits using the search functionality.',
            action: 'Use the search bar',
            steps: [
              'Type in the search bar on the Habits page',
              'Search matches both habit names and notes',
              'Search is case-insensitive'
            ]
          },
          {
            title: 'Set Habit Frequency',
            description: 'Configure how often each habit should be tracked.',
            action: 'Choose the appropriate frequency',
            frequencies: [
              { name: 'Daily', desc: 'Track every day', use: 'For habits you want to do consistently' },
              { name: 'Weekly', desc: 'Track once per week', use: 'For habits with weekly goals' },
              { name: 'Custom', desc: 'Select specific days', use: 'For habits like gym workouts on specific days' }
            ]
          },
          {
            title: 'Set Up Reminders',
            description: 'Get browser notifications to remind you about your habits.',
            action: 'Configure reminders',
            steps: [
              'Enable reminders in the habit\'s Advanced Options',
              'Set a reminder time (e.g., "09:00" for 9 AM)',
              'Enable browser notifications in Profile → Notification Settings',
              'Note: Reminders only work when the browser tab is open'
            ]
          },
          {
            title: 'Set Completion Goals',
            description: 'Define targets for how often you want to complete each habit.',
            action: 'Set goals in Advanced Options',
            goalTypes: [
              { period: 'Weekly', desc: 'Complete X times per week' },
              { period: 'Monthly', desc: 'Complete X times per month' },
              { period: 'Yearly', desc: 'Complete X times per year' }
            ],
            note: 'Goals are tracked automatically and displayed in the Goals Tracker sidebar'
          }
        ]
      },
      related: ['advanced', 'analytics']
    },
    'advanced': {
      id: 'advanced',
      title: 'Advanced Features',
      icon: '⚙️',
      category: 'advanced',
      description: 'Master powerful tracking capabilities',
      content: {
        intro: 'Unlock the full potential of the Habit Dashboard with these advanced features designed for detailed tracking and analysis.',
        steps: [
          {
            title: 'Quantity Tracking',
            description: 'Track specific amounts for habits like water intake or distance walked.',
            action: 'Enable quantity tracking',
            steps: [
              'When creating or editing a habit, enable "Quantity Tracking"',
              'Set a unit (e.g., "glasses", "miles", "pages")',
              'Define your target amount (e.g., 8 glasses, 5 miles)',
              'When marking complete, enter the actual quantity achieved',
              'The system indicates if you reached your target'
            ],
            example: { habit: 'Drink Water', target: '8 glasses', unit: 'glasses' }
          },
          {
            title: 'Time Tracking',
            description: 'Track duration for time-based habits like meditation or exercise.',
            action: 'Enable time tracking',
            steps: [
              'Enable "Time Tracking" in Advanced Options',
              'When marking a habit complete, enter the duration in minutes',
              'The system calculates average duration over time',
              'Use this for habits where duration matters more than just completion'
            ],
            example: { habit: 'Meditation', duration: '20 minutes' }
          },
          {
            title: 'Custom Schedules',
            description: 'Set habits to only appear on specific days of the week.',
            action: 'Configure custom schedules',
            steps: [
              'Set frequency to "Custom" in Advanced Options',
              'Select the days of the week when the habit applies',
              'The habit will only appear on selected days',
              'Perfect for habits like gym workouts on specific days'
            ],
            example: { habit: 'Gym Workout', days: ['Monday', 'Wednesday', 'Friday'] }
          },
          {
            title: 'Habit Notes',
            description: 'Add contextual information, tips, or reminders to your habits.',
            action: 'Add notes to habits',
            steps: [
              'Notes are searchable and help you remember important details',
              'View notes when you expand a habit row',
              'Use notes for tips, variations, or reflections'
            ]
          },
          {
            title: 'Difficulty Levels',
            description: 'Categorize habits by difficulty to better understand your progress.',
            action: 'Set difficulty levels',
            levels: [
              { level: 'Easy', desc: 'Simple habits requiring minimal effort' },
              { level: 'Medium', desc: 'Moderate habits requiring some commitment' },
              { level: 'Hard', desc: 'Challenging habits requiring significant effort' }
            ]
          },
          {
            title: 'Completion Notes',
            description: 'Add notes specific to individual habit completions.',
            action: 'Add notes when marking complete',
            steps: [
              'When marking a habit complete, you can add a note',
              'Track variations, reflections, or specific details for that day',
              'Useful for understanding what worked or didn\'t work'
            ]
          }
        ]
      },
      related: ['intermediate', 'analytics']
    },
    'analytics': {
      id: 'analytics',
      title: 'Analytics & Insights',
      icon: '📈',
      category: 'analytics',
      description: 'Understand your habits through data and insights',
      content: {
        intro: 'Use analytics to understand your habits, identify patterns, and make data-driven decisions about your lifestyle.',
        steps: [
          {
            title: 'Dashboard Analytics',
            description: 'Get a quick overview of your weekly performance.',
            action: 'Review these dashboard elements',
            elements: [
              { name: 'Weekly Progress Ring', desc: 'Overall completion percentage for the week' },
              { name: 'Weekly Bar Chart', desc: 'Day-by-day completion breakdown' },
              { name: 'Daily Cards', desc: 'Individual day progress with streak information' },
              { name: 'Current Streaks', desc: 'Consecutive days of completing all habits' }
            ]
          },
          {
            title: 'Yearly View',
            description: 'Analyze long-term trends and patterns.',
            action: 'Navigate to the Yearly view',
            features: [
              'Monthly completion bar charts',
              'Best and worst performing months',
              'Mood, energy, and focus trend lines',
              'Average metrics per month'
            ]
          },
          {
            title: 'Analytics Page',
            description: 'Deep dive into your habit performance.',
            action: 'Explore the Analytics page',
            insights: [
              'Habit performance analysis',
              'Completion rate trends',
              'Best and worst performing habits',
              'Correlation insights between habits and metrics',
              'Predictive analytics'
            ]
          },
          {
            title: 'Monthly Reports',
            description: 'Generate printable reports for offline review.',
            action: 'Create monthly reports',
            steps: [
              'Navigate to the Habits page',
              'Click "Print Report" in the sidebar',
              'Reports include summary statistics, completion overview, streaks, and category breakdown'
            ]
          },
          {
            title: 'Heat Map View',
            description: 'Visualize completion patterns with a calendar heat map.',
            action: 'Switch to Heat Map view',
            steps: [
              'On the Habits page, click "Heat Map" view toggle',
              'See a visual calendar showing completion intensity',
              'Darker colors indicate higher completion rates',
              'Quickly identify patterns and gaps'
            ]
          }
        ]
      },
      related: ['intermediate', 'tips']
    },
    'tips': {
      id: 'tips',
      title: 'Tips & Best Practices',
      icon: '💡',
      category: 'tips',
      description: 'Maximize your success with proven strategies',
      content: {
        intro: 'Learn from best practices and proven strategies to make the most of your habit tracking journey.',
        steps: [
          {
            title: 'Starting Your Journey',
            description: 'Set yourself up for success from the beginning.',
            tips: [
              'Start with 3-5 simple habits to build momentum',
              'Focus on consistency over perfection',
              'Review your progress weekly',
              'Don\'t be discouraged by missed days - streaks can be rebuilt'
            ]
          },
          {
            title: 'Designing Effective Habits',
            description: 'Create habits that are easy to track and maintain.',
            tips: [
              'Make habits specific and measurable',
              'Use quantity tracking for habits with targets',
              'Use time tracking for duration-based habits',
              'Set realistic goals that challenge but don\'t overwhelm',
              'Group related habits in the same category'
            ]
          },
          {
            title: 'Maintaining Consistency',
            description: 'Stay on track with these consistency strategies.',
            tips: [
              'Check in daily, even if you didn\'t complete all habits',
              'Use reminders for habits you tend to forget',
              'Track your mood, energy, and focus to identify patterns',
              'Review analytics monthly to see what\'s working',
              'Archive habits that no longer serve you'
            ]
          },
          {
            title: 'Using Categories Effectively',
            description: 'Organize your habits for better management.',
            tips: [
              'Create categories that make sense for your lifestyle',
              'Use category filters to focus on specific areas',
              'Balance habits across different categories',
              'Hide unused categories to keep your interface clean'
            ]
          },
          {
            title: 'Advanced Tips',
            description: 'Pro tips for power users.',
            tips: [
              'Use custom schedules for habits that only apply on certain days',
              'Set per-habit goals to track progress toward specific targets',
              'Add completion notes to reflect on what worked',
              'Export data regularly for backup or analysis',
              'Use the heat map to quickly identify patterns'
            ]
          },
          {
            title: 'Troubleshooting Common Issues',
            description: 'Solutions to common problems.',
            solutions: [
              { problem: 'Data not syncing', solution: 'Check your internet connection and refresh the page' },
              { problem: 'Reminders not working', solution: 'Ensure browser notifications are enabled and the tab is open' },
              { problem: 'Can\'t mark future dates', solution: 'This is intentional - you can only log past or current dates' },
              { problem: 'Habit not showing', solution: 'Check category filters and archived status' }
            ]
          }
        ]
      },
      related: ['getting-started', 'analytics']
    }
  };

  const categories = [
    { id: 'all', name: 'All Guides', icon: '📚' },
    { id: 'basics', name: 'Basics', icon: '🎯' },
    { id: 'organization', name: 'Organization', icon: '📁' },
    { id: 'features', name: 'Features', icon: '⚙️' },
    { id: 'advanced', name: 'Advanced', icon: '🚀' },
    { id: 'analytics', name: 'Analytics', icon: '📈' },
    { id: 'tips', name: 'Tips', icon: '💡' }
  ];

  // Filter guides based on search and category
  const filteredGuides = useMemo(() => {
    return Object.values(guideContent).filter(guide => {
      const matchesCategory = selectedCategory === 'all' || guide.category === selectedCategory;
      const matchesSearch = !searchQuery.trim() || 
        guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        JSON.stringify(guide.content).toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const handleFeedback = (guideId, feedback) => {
    // In a real app, you'd send this to a backend
    // console.log(`Feedback for ${guideId}: ${feedback}`);
  };

  const renderGuideContent = (guide) => {
    if (expandedSection !== guide.id) return null;

    return (
      <div className="px-6 pb-6 space-y-6 animate-fade-in">
        {/* Introduction */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-lg p-4 border-l-4 border-primary">
          <p className="text-text-dark dark:text-dark-text">{guide.content.intro}</p>
        </div>

        {/* Steps */}
        {guide.content.steps.map((step, stepIdx) => (
          <div key={stepIdx} className="space-y-3">
            <h3 className="text-lg font-semibold text-text-dark dark:text-dark-text flex items-center gap-2">
              <span className="text-primary font-bold">{stepIdx + 1}.</span>
              {step.title}
            </h3>
            <p className="text-text-gray dark:text-dark-gray">{step.description}</p>
            
            {step.action && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border-l-4 border-blue-500">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  <strong>Action:</strong> {step.action}
                </p>
              </div>
            )}

            {/* Render different content types */}
            {step.steps && (
              <ol className="list-decimal list-inside space-y-2 text-text-gray dark:text-dark-gray ml-4">
                {step.steps.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">{item}</li>
                ))}
              </ol>
            )}

            {step.items && (
              <div className="grid sm:grid-cols-2 gap-3">
                {step.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-lg p-3 transform hover:scale-105 transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-semibold text-text-dark dark:text-dark-text">{item.name}</span>
                    </div>
                    <p className="text-sm text-text-gray dark:text-dark-gray">{item.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {step.methods && (
              <div className="space-y-4">
                {step.methods.map((method, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-semibold text-text-dark dark:text-dark-text mb-2">{method.name}</h4>
                    <ol className="list-decimal list-inside space-y-1 text-text-gray dark:text-dark-gray ml-2">
                      {method.steps.map((s, sIdx) => (
                        <li key={sIdx}>{s}</li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            )}

            {step.metrics && (
              <div className="grid sm:grid-cols-3 gap-4">
                {step.metrics.map((metric, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-lg p-4 text-center transform hover:scale-105 transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="text-3xl mb-2">{metric.icon}</div>
                    <div className="font-semibold text-text-dark dark:text-dark-text mb-1">{metric.name}</div>
                    <div className="text-xs text-text-gray dark:text-dark-gray">{metric.scale}</div>
                  </div>
                ))}
              </div>
            )}

            {step.views && step.views.some(v => v.visual === 'ring') && <ProgressRingVisual />}

            {step.example && (
              <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border-l-4 border-green-500">
                <p className="text-sm text-green-800 dark:text-green-300">
                  <strong>Example:</strong> {step.example.habit} - {step.example.target || step.example.duration}
                </p>
              </div>
            )}

            {step.tips && (
              <ul className="list-disc list-inside space-y-2 text-text-gray dark:text-dark-gray ml-4">
                {step.tips.map((tip, idx) => (
                  <li key={idx} className="leading-relaxed">{tip}</li>
                ))}
              </ul>
            )}

            {step.solutions && (
              <div className="space-y-3">
                {step.solutions.map((sol, idx) => (
                  <div key={idx} className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border-l-4 border-yellow-500">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                      <strong>Problem:</strong> {sol.problem}
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      <strong>Solution:</strong> {sol.solution}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Tip Box */}
        {guide.content.tip && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-l-4 border-blue-500 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2">
              <PulsingIcon>💡</PulsingIcon>
              <span><strong>Pro Tip:</strong> {guide.content.tip}</span>
            </p>
          </div>
        )}

        {/* Related Guides */}
        {guide.related && guide.related.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-text-dark dark:text-dark-text mb-3">Related Guides</h4>
            <div className="flex flex-wrap gap-2">
              {guide.related.map((relatedId) => {
                const related = guideContent[relatedId];
                if (!related) return null;
                return (
                  <button
                    key={relatedId}
                    onClick={() => {
                      toggleSection(relatedId);
                      setTimeout(() => {
                        document.getElementById(relatedId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 100);
                    }}
                    className="px-3 py-1.5 bg-white dark:bg-gray-700 text-text-dark dark:text-dark-text rounded-lg text-sm font-medium hover:bg-primary hover:text-white transition-all duration-200"
                  >
                    {related.icon} {related.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Feedback Widget */}
        <FeedbackWidget guideId={guide.id} onFeedback={handleFeedback} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-dark-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-5xl animate-bounce" style={{ animationDuration: '2s' }}>📖</div>
            <div>
              <h1 className="text-4xl font-bold text-text-dark dark:text-dark-text">
                User Guide
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-primary to-primary/50 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
          <p className="text-lg text-text-gray dark:text-dark-gray animate-slide-up">
            Comprehensive documentation to help you master the Habit Dashboard
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6 animate-fade-in">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-gray dark:text-dark-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guides... (e.g., 'create habit', 'categories', 'analytics')"
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-dark-text rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-gray dark:text-dark-gray hover:text-text-dark dark:hover:text-dark-text transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Category Filters */}
            <div>
              <p className="text-sm font-medium text-text-dark dark:text-dark-text mb-2">Filter by Category:</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedCategory === cat.id
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-text-dark dark:text-dark-text hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="mr-2">{cat.icon}</span>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Count */}
            {searchQuery && (
              <p className="text-sm text-text-gray dark:text-dark-gray">
                Found {filteredGuides.length} guide{filteredGuides.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {/* Quick Navigation */}
        {!searchQuery && (
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl animate-pulse">🧭</span>
              <h2 className="text-lg font-semibold text-text-dark dark:text-dark-text">Quick Navigation</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Object.values(guideContent).map((guide, idx) => (
                <button
                  key={guide.id}
                  onClick={() => {
                    toggleSection(guide.id);
                    setTimeout(() => {
                      document.getElementById(guide.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }}
                  className={`p-4 rounded-xl text-left transition-all duration-300 transform hover:scale-105 hover:shadow-md ${
                    expandedSection === guide.id
                      ? 'bg-primary text-white shadow-lg scale-105'
                      : 'bg-gray-100 dark:bg-gray-800 text-text-dark dark:text-dark-text hover:bg-gray-200 dark:hover:bg-gray-700'
                  } animate-fade-in`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="text-3xl mb-2 transform hover:rotate-12 transition-transform">{guide.icon}</div>
                  <div className="text-sm font-medium">{guide.title}</div>
                  <div className="text-xs opacity-75 mt-1">{guide.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Guide Sections */}
        <div className="space-y-6">
          {filteredGuides.map((guide) => (
            <section key={guide.id} id={guide.id} className="mb-8">
              <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transform hover:shadow-xl transition-shadow duration-300">
                <button
                  onClick={() => toggleSection(guide.id)}
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-3xl">{guide.icon}</span>
                    <div className="text-left flex-1">
                      <h2 className="text-xl font-bold text-text-dark dark:text-dark-text">{guide.title}</h2>
                      <p className="text-sm text-text-gray dark:text-dark-gray mt-1">{guide.description}</p>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-text-gray dark:text-dark-gray transition-transform duration-300 flex-shrink-0 ${
                      expandedSection === guide.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {renderGuideContent(guide)}
              </div>
            </section>
          ))}
        </div>

        {/* No Results */}
        {filteredGuides.length === 0 && (
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center animate-fade-in">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-text-dark dark:text-dark-text mb-2">No guides found</h3>
            <p className="text-text-gray dark:text-dark-gray mb-4">
              Try adjusting your search query or category filter
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-12 bg-gradient-to-r from-primary to-primary/80 rounded-xl shadow-lg p-8 text-center text-white animate-fade-in">
          <h3 className="text-2xl font-bold mb-2">Still Need Help?</h3>
          <p className="mb-4 opacity-90">
            If you can't find what you're looking for, check the code comments or Firebase documentation.
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl animate-bounce" style={{ animationDuration: '2s' }}>🎯</span>
            <p className="font-medium">Happy habit tracking!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Guide;

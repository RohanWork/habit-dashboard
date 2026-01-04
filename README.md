# Habit Dashboard

A beautiful, pixel-perfect habit tracking and life analytics dashboard built with React, Vite, Tailwind CSS, and Firebase.

## Features

### Core Habit Tracking
- ✅ **Daily Habit Tracking** - Track habits with daily progress rings and checkbox grids
- 📊 **Weekly Overview** - Bar charts showing weekly completion rates with day-by-day breakdown
- 📅 **Monthly View** - Comprehensive checkbox grid for habit tracking with expandable details
- 📈 **Yearly Analytics** - Trends, best/worst months, and mood/energy/focus analysis
- 📋 **To-Do List** - Full task management with priorities, due dates, search, and pinning
- 🎯 **Goals Tracker** - Set and track weekly/monthly completion targets

### Advanced Habit Features
- 🔄 **Edit Habits** - Edit any habit's properties including name, category, reminders, and advanced options
- ⏰ **Reminder System** - Browser notifications for habit reminders (requires tab to be open)
- 📅 **Habit Frequency** - Daily, weekly, or custom day scheduling
- 📊 **Quantity Tracking** - Track amounts (e.g., "8 glasses of water", "5 miles")
- ⏱️ **Time Tracking** - Track duration for time-based habits
- 🎯 **Per-Habit Goals** - Individual targets with weekly/monthly periods
- 🏆 **Milestones** - Progress milestones and streak tracking
- 📝 **Habit Templates** - Quick creation from predefined habit templates

### Daily Metrics & Analytics
- 😊 **Daily Metrics** - Track mood, energy, and focus levels (1-5 scale) with validation
- 📊 **Advanced Analytics** - Habit correlations, completion trends, and predictive insights
- 📈 **Visual Reports** - Print-friendly monthly reports with statistics

### Category Management
- 🏷️ **Custom Categories** - Create and manage custom habit categories
- 🔄 **Category Restoration** - Restore hidden predefined categories
- 🎨 **Category Filtering** - Filter habits by category with multi-select

### User Experience
- 🔐 **Firebase Authentication** - Secure email/password login with password reset
- ☁️ **Real-time Sync** - All data synced to Firebase Firestore
- 📱 **Responsive Design** - Mobile-first, works on all devices
- 🌙 **Dark Mode** - Full dark theme support
- 🎨 **Beautiful UI** - Custom SVG circular progress, modern design with Tailwind CSS
- 🔔 **Notification Settings** - Configure browser notifications and default reminder times

## Tech Stack

**Frontend:**
- React 18 with Hooks
- Vite (fast build tool)
- Tailwind CSS (utility-first styling)
- Recharts (data visualization)
- React Router v6 (routing)

**Backend:**
- Firebase Authentication (email/password)
- Firebase Firestore (real-time database)
- Firebase Hosting (deployment)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── CircularProgress.jsx
│   ├── DailyCard.jsx
│   ├── WeeklyBar.jsx
│   ├── HabitGrid.jsx
│   ├── MoodTracker.jsx
│   ├── GoalsTracker.jsx
│   ├── HabitGoalTracker.jsx
│   ├── HabitCompletionModal.jsx
│   ├── CreateHabitModal.jsx
│   ├── CreateCategoryModal.jsx
│   ├── NotificationSettings.jsx
│   ├── ProfileDropdown.jsx
│   ├── PrintReport.jsx
│   └── AchievementBadges.jsx
├── pages/              # Page components
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Monthly.jsx
│   ├── Yearly.jsx
│   ├── Analytics.jsx
│   └── Todos.jsx
├── firebase/           # Firebase configuration
│   ├── config.js
│   ├── auth.js
│   └── db.js
├── hooks/              # Custom React hooks
│   ├── useAuth.jsx
│   ├── useHabits.js
│   ├── useCategories.js
│   ├── useNotifications.js
│   ├── useTodos.js
│   ├── useAnalytics.js
│   └── useTheme.js
├── contexts/           # React contexts
│   ├── CategoriesContext.jsx
│   └── ThemeContext.jsx
├── services/           # Business logic services
│   ├── reminderScheduler.js
│   └── emailService.js
├── utils/              # Utility functions
│   ├── habitCategories.js
│   ├── habitTemplates.js
│   ├── goalTracker.js
│   ├── streakCalculator.js
│   ├── analyticsCalculator.js
│   └── achievements.js
├── App.jsx            # Main app with routing
├── main.jsx           # Entry point
└── index.css          # Tailwind + custom styles
```

## Setup Instructions

### Prerequisites

- Node.js 16+ and npm
- Firebase project (free tier available)
- Git

### 1. Clone or Create Project

```bash
cd d:\personal_projects\habit-dashboard
npm install
```

### 2. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (name: "Habit Dashboard")
3. Enable Authentication:
   - Click "Authentication" → "Get Started"
   - Enable "Email/Password" provider
4. Create Firestore Database:
   - Click "Firestore Database" → "Create Database"
   - Start in "Production" mode
   - Choose your region (closest to you)

### 3. Configure Environment Variables

Create `.env.local` in the project root:

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Get these values from Firebase Console:
- Project Settings → General → Your apps → Firebase SDK snippet

### 4. Install Dependencies and Run

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Firestore Data Model

### Users Collection
```
users/{userId}
{
  name: string,
  email: string,
  createdAt: timestamp
}
```

### Habits Collection
```
habits/{userId}/items/{habitId}
{
  name: string,
  category: string,
  emoji: string,
  notes: string,
  order: number,
  active: boolean,
  archived: boolean,
  createdAt: timestamp,
  // Advanced options
  frequency: 'daily' | 'weekly' | 'custom',
  schedule: {
    daysOfWeek: number[]  // 0=Sunday, 6=Saturday
  },
  reminderEnabled: boolean,
  reminderTime: string,  // "HH:MM" format
  quantityTracking: {
    enabled: boolean,
    unit: string,
    target: number
  } | null,
  timeTracking: {
    enabled: boolean
  } | null,
  difficulty: 'easy' | 'medium' | 'hard',
  goal: {
    enabled: boolean,
    target: number,
    period: 'week' | 'month' | 'year'
  } | null
}
```

### Daily Logs Collection
```
dailyLogs/{userId}/logs/{yyyy-mm-dd}
{
  date: string (YYYY-MM-DD format),
  habits: {
    habitId1: boolean | {
      completed: boolean,
      quantity?: number,
      duration?: number,  // in minutes
      notes?: string
    },
    habitId2: boolean | {...},
    ...
  },
  mood: number (1-5),
  energy: number (1-5),
  focus: number (1-5)
}
```

### Todos Collection
```
todos/{userId}/items/{todoId}
{
  id: string,
  title: string,
  description: string,
  completed: boolean,
  priority: 'low' | 'medium' | 'high',
  dueDate: string | null,  // YYYY-MM-DD format
  pinned: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Custom Categories Collection
```
customCategories/{userId}/categories/{categoryId}
{
  id: string,
  label: string,
  color: string,
  hidden: boolean
}
```

## Usage

### Dashboard Page
- View overall weekly progress as a circular ring
- See daily completion for each day (Sun-Sat) with week navigation
- Toggle habits for today or any selected day in the week
- Track mood, energy, and focus with sliders (prevents future date updates)
- View goals progress (weekly/monthly targets)
- Navigate between weeks with date picker

### Monthly View
- Create new habits with advanced options (frequency, reminders, tracking)
- Edit existing habits (click the pencil icon)
- Checkbox grid showing each habit for each day
- Filter habits by category
- Search habits by name or notes
- Expand habits to see notes, goals, and milestones
- Archive/unarchive habits
- Update daily metrics for selected date
- Print monthly reports
- View habit templates for quick creation

### Yearly View
- Monthly habit completion bar chart
- Best/worst performing months
- Mood, energy, and focus trend lines
- Average metrics per month

### Analytics Page
- Habit performance analysis
- Completion rate trends
- Best and worst performing habits
- Correlation insights
- Predictive analytics

### To-Do Page
- Create, edit, and delete tasks
- Set priorities (low, medium, high)
- Add due dates
- Pin important tasks
- Search and filter tasks
- Toggle between grid and list views
- Mark tasks as completed

## Building for Production

```bash
npm run build
```

Creates optimized build in `dist/` folder.

## Firebase Hosting Deployment

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login and Initialize

```bash
firebase login
firebase init hosting
```

Choose your Firebase project when prompted.

### 3. Configure firebase.json

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### 4. Build and Deploy

```bash
npm run build
firebase deploy
```

Your app will be live at: `https://your-project-id.web.app`

## Key Features Explained

### Circular Progress Component
- Custom SVG implementation (not a chart library)
- Smooth stroke with rounded caps
- Configurable color, size, and percentage
- Centered percentage text display

### Daily Cards
- Visual progress for each day
- Shows completed vs total habits
- Highlight today with special styling
- Clickable to view/edit specific day

### Habit Grid
- Expandable habit rows
- Week separators for easier scanning
- Real-time Firestore sync
- Checkbox persistence

### Mood/Energy/Focus Tracking
- Interactive sliders (1-5 scale)
- Emoji feedback for mood
- Auto-saves to Firestore
- Used for yearly analytics

## Development Tips

### Adding New Habits
1. Go to Monthly view
2. Enter habit name in "Add a new habit" input
3. Click "Add Habit"
4. Habit appears in the grid immediately

### Viewing Past Data
- Navigate to previous months/years using the date selectors
- All data is synced from Firestore in real-time
- Offline-first architecture (cached data)

### Testing
Create a test account with email/password and explore all features.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations

- Code splitting with React Router
- Lazy loading of pages
- Optimized Recharts visualizations
- Efficient Firestore queries
- CSS minification with Tailwind

## Troubleshooting

### "Firebase not initialized" error
- Check `.env.local` has all Firebase credentials
- Ensure Firebase project is active in console

### "Permission denied" errors in Firestore
- Verify Firestore security rules are correctly set (check `firestore.rules`)
- Make sure user is logged in
- Ensure all collections have proper security rules (habits, dailyLogs, todos, customCategories)

### Data not syncing
- Check browser console for errors
- Verify Firestore rules allow your user's UID
- Check network tab for failed requests

## Key Features Explained

### Habit Management
- **Create Habits**: Use templates or create custom habits with advanced options
- **Edit Habits**: Click the pencil icon to edit any habit's properties
- **Advanced Options**: Set frequency, reminders, quantity/time tracking, goals, and difficulty
- **Category System**: Organize habits with predefined or custom categories
- **Archive/Delete**: Archive habits to hide them or permanently delete them

### Reminder System
- **Browser Notifications**: Get reminders when the browser tab is open
- **Per-Habit Reminders**: Set individual reminder times for each habit
- **Default Reminder Time**: Configure default time in Notification Settings
- **Frequency-Based**: Reminders respect habit frequency (daily/weekly/custom)

### Goals & Tracking
- **Weekly/Monthly Targets**: Set completion goals and track progress
- **Per-Habit Goals**: Individual targets with weekly/monthly/yearly periods
- **Quantity Tracking**: Track amounts (e.g., "8 glasses", "5 miles")
- **Time Tracking**: Track duration for time-based habits
- **Milestones**: Automatic milestone detection and celebration

### Data Validation
- **Future Date Protection**: Cannot mark future dates as completed
- **Metrics Validation**: Cannot update mood/energy/focus for future dates
- **Duplicate Prevention**: Prevents creating duplicate habits

### Print Reports
- Generate printable monthly reports with:
  - Summary statistics
  - Habit completion overview
  - Current and best streaks
  - Category breakdown

## Future Enhancements

- Email reminders (requires backend service)
- Export data to CSV/PDF
- Social sharing
- Mobile app (React Native)
- Data backup and import
- Habit sharing and collaboration
- Advanced analytics with machine learning

## License

MIT - Feel free to use for personal and commercial projects.

## Support

For issues or questions, check the code comments and Firebase documentation:
- [Firebase Docs](https://firebase.google.com/docs)
- [React Docs](https://react.dev)
- [Tailwind Docs](https://tailwindcss.com/docs)

---

**Happy habit tracking! 🎯**

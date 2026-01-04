# Habit Dashboard

A beautiful, pixel-perfect habit tracking and life analytics dashboard built with React, Vite, Tailwind CSS, and Firebase.

## Features

- ✅ **Daily Habit Tracking** - Track habits with daily progress rings
- 📊 **Weekly Overview** - Bar charts showing weekly completion rates
- 📅 **Monthly View** - Checkbox grid for comprehensive habit tracking
- 📈 **Yearly Analytics** - Trends, best/worst months, and mood/energy/focus analysis
- 😊 **Daily Metrics** - Track mood, energy, and focus levels (1-5 scale)
- 🔐 **Firebase Authentication** - Secure email/password login
- ☁️ **Real-time Sync** - All data synced to Firebase Firestore
- 📱 **Responsive Design** - Mobile-first, works on all devices
- 🎨 **Beautiful UI** - Custom SVG circular progress, modern design with Tailwind CSS

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
│   └── MoodTracker.jsx
├── pages/              # Page components
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Monthly.jsx
│   └── Yearly.jsx
├── firebase/           # Firebase configuration
│   ├── config.js
│   ├── auth.js
│   └── db.js
├── hooks/              # Custom React hooks
│   ├── useAuth.js
│   └── useHabits.js
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

### 4. Set Firestore Security Rules

In Firestore Console, go to Rules and replace with:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    match /habits/{userId}/items/{habitId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    match /dailyLogs/{userId}/{date} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

### 5. Install Dependencies and Run

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
  order: number,
  active: boolean
}
```

### Daily Logs Collection
```
dailyLogs/{userId}/{yyyy-mm-dd}
{
  date: string (ISO format),
  habits: {
    habitId1: boolean,
    habitId2: boolean,
    ...
  },
  mood: number (1-5),
  energy: number (1-5),
  focus: number (1-5)
}
```

## Usage

### Dashboard Page
- View overall weekly progress as a circular ring
- See daily completion for each day (Sun-Sat)
- Toggle habits for today or any day in the week
- Track mood, energy, and focus with sliders

### Monthly View
- Create new habits
- Checkbox grid showing each habit for each day
- Easy-to-scan habit history
- Update daily metrics

### Yearly View
- Monthly habit completion bar chart
- Best/worst performing months
- Mood, energy, and focus trend lines
- Average metrics per month

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
- Verify Firestore security rules are correctly set
- Make sure user is logged in

### Data not syncing
- Check browser console for errors
- Verify Firestore rules allow your user's UID
- Check network tab for failed requests

## Future Enhancements

- Export data to CSV
- Dark mode theme
- Habit streaks and badges
- Social sharing
- Mobile app (React Native)
- Habit reminders via email
- Data backup and import

## License

MIT - Feel free to use for personal and commercial projects.

## Support

For issues or questions, check the code comments and Firebase documentation:
- [Firebase Docs](https://firebase.google.com/docs)
- [React Docs](https://react.dev)
- [Tailwind Docs](https://tailwindcss.com/docs)

---

**Happy habit tracking! 🎯**

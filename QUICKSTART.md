# Quick Start Guide

Get your Habit Dashboard running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Firebase

### Create a Firebase Project
1. Visit https://console.firebase.google.com
2. Click "Add Project" → Name it "Habit Dashboard"
3. Continue through the setup (standard settings are fine)
4. Wait for project creation to complete

### Get Your Firebase Config

1. In Firebase Console, click the gear icon (Settings) → Project Settings
2. Scroll to "Your apps" section
3. Click "Web" (or copy existing config)
4. Copy the config object

### Enable Authentication

1. Click "Authentication" in the left menu
2. Click "Get Started"
3. Click "Email/Password" and toggle "Enabled"
4. Click "Save"

### Create Firestore Database

1. Click "Firestore Database" in the left menu
2. Click "Create Database"
3. Choose your location and click "Create"
4. Go to "Rules" tab and paste these rules:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
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

5. Click "Publish"

## Step 3: Configure Environment Variables

Create `.env.local` in the project root with:

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**How to find these values:**
- Go to Firebase Console → Project Settings → General
- Scroll to "Your apps" → Click Web app → Firebase SDK snippet
- Copy the `firebaseConfig` object values

## Step 4: Run the App

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Step 5: Create Your Account

1. Click "Sign Up"
2. Enter your name, email, and password
3. Click "Sign Up"
4. You're in! Start creating habits in the Monthly view

## Features to Explore

- **Dashboard**: Overall progress, weekly bars, daily cards
- **Monthly**: Create habits, checkbox grid, mood tracking
- **Yearly**: Analytics, trends, best/worst months

## Next: Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
npm run build
firebase deploy
```

Your app will be live at: `https://your-project-id.web.app`

## Troubleshooting

**"Cannot GET /dashboard"**
- Make sure Firebase rules are set correctly
- Check `.env.local` has all values filled

**Login not working**
- Verify Authentication is enabled in Firebase Console
- Check email/password is correct

**Data not saving**
- Check browser console for errors
- Verify Firestore rules are published
- Ensure you're logged in

---

You're all set! Happy habit tracking! 🎯

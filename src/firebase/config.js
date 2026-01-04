import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBpNAS-1SX5twhOrRsEIiMOJ8IHCbHb1To",
  authDomain: "habit-tracker-38191.firebaseapp.com",
  projectId: "habit-tracker-38191",
  storageBucket: "habit-tracker-38191.firebasestorage.app",
  messagingSenderId: "1063271198740",
  appId: "1:1063271198740:web:b7b4aa4085ee57974bb701",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

export default app;

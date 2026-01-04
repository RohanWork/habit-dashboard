import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  deleteUser,
} from 'firebase/auth';
import { auth, db } from './config';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

// Create a new user account
export const createUser = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      createdAt: new Date().toISOString(),
    });

    return user;
  } catch (error) {
    throw error;
  }
};

// Sign in with email and password
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Sign out
export const logout = async () => {
  try {
    const user = auth.currentUser;
    
    // Store last login (logout) timestamp before signing out
    if (user) {
      try {
        const lastLoginTimestamp = new Date().toISOString();
        const userRef = doc(db, 'users', user.uid);
        
        // Store the logout time as lastLogin (so it shows when they log back in)
        await setDoc(userRef, {
          lastLogin: lastLoginTimestamp,
        }, { merge: true });
      } catch (error) {
        // Log error but don't fail the logout process
        console.error('Error updating last login timestamp:', error);
      }
    }
    
    // Sign out the user
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Send password reset email
export const sendPasswordResetEmail = async (email) => {
  try {
    await firebaseSendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
};

// Delete user account and all associated data
export const deleteAccount = async (userId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    // Delete all user data from Firestore
    const { deleteAllUserData } = await import('./db');
    await deleteAllUserData(userId);

    // Delete the user account from Firebase Auth
    await deleteUser(user);
  } catch (error) {
    throw error;
  }
};

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  sendEmailVerification,
  deleteUser,
  reload,
} from 'firebase/auth';
import { auth, db } from './config';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

// Create a new user account
export const createUser = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Send email verification
    await sendEmailVerification(user);

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      emailVerified: false,
      createdAt: new Date().toISOString(),
    });

    return user;
  } catch (error) {
    throw error;
  }
};

// Resend email verification
export const resendVerificationEmail = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    
    if (user.emailVerified) {
      throw new Error('Email is already verified');
    }
    
    await sendEmailVerification(user);
    return true;
  } catch (error) {
    throw error;
  }
};

// Reload user to get latest verification status
export const reloadUser = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      await reload(user);
      // Return the updated user from auth.currentUser after reload
      return auth.currentUser;
    }
    return null;
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
        // console.error('Error updating last login timestamp:', error);
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

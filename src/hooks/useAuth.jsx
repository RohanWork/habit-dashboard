import { useState, useEffect, useContext, createContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { reloadUser } from '../firebase/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // Reload user to get latest email verification status
      if (currentUser) {
        try {
          await reloadUser();
          // Get the updated user after reload
          setUser(auth.currentUser);
        } catch (err) {
          // If reload fails, still set the user
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    }, (err) => {
      setError(err);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshUser = async () => {
    try {
      setLoading(true);
      // Reload the user to get latest verification status from Firebase
      await reloadUser();
      
      // Get the updated user after reload
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Update state with the current user
        // This will trigger a re-render in components that use this user
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (err) {
      // console.error('Error refreshing user:', err);
      // Fallback: get current user directly even if reload fails
      const currentUser = auth.currentUser;
      setUser(currentUser);
    } finally {
      // Small delay to ensure state updates propagate
      setTimeout(() => {
        setLoading(false);
      }, 100);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

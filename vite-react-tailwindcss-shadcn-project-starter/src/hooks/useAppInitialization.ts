import { useEffect, useState } from 'react';
import { useAppDispatch } from '../stores/hooks';
import { initializeFromStorage } from '../stores/slices/authSlice';
import { initializeAppFromStorage } from '../stores/middleware/persistenceMiddleware';

/**
 * Custom hook to initialize the application state from localStorage
 * This should be called once when the app starts
 */
export const useAppInitialization = () => {
  const dispatch = useAppDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize auth state from localStorage
        dispatch(initializeFromStorage());
        
        // You can add other initialization logic here
        // For example, initializing theme, user preferences, etc.
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize app from storage:', error);
        setInitializationError('Failed to initialize application');
        setIsInitialized(true); // Still mark as initialized to prevent infinite loading
      }
    };

    initializeApp();
  }, [dispatch]);

  return {
    isInitialized,
    initializationError,
  };
};

/**
 * Hook to get stored app data without dispatching to Redux
 * Useful for getting initial values before Redux is ready
 */
export const useStoredAppData = () => {
  const [storedData, setStoredData] = useState<ReturnType<typeof initializeAppFromStorage> | null>(null);

  useEffect(() => {
    try {
      const data = initializeAppFromStorage();
      setStoredData(data);
    } catch (error) {
      console.error('Failed to load stored app data:', error);
      setStoredData(null);
    }
  }, []);

  return storedData;
};
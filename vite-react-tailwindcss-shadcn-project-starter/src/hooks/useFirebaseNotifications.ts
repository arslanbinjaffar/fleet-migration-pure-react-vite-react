import { useState, useEffect } from 'react';
import { requestNotificationPermission, onMessageListener } from '../utils/firebase';

interface NotificationPayload {
  notification?: {
    title?: string;
    body?: string;
    image?: string;
  };
  data?: Record<string, string>;
}

interface UseFirebaseNotificationsReturn {
  token: string | null;
  notification: NotificationPayload | null;
  isSupported: boolean;
  requestPermission: () => Promise<void>;
  clearNotification: () => void;
}

export const useFirebaseNotifications = (): UseFirebaseNotificationsReturn => {
  const [token, setToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationPayload | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(false);

  useEffect(() => {
    // Check if Firebase messaging is supported
    if ('serviceWorker' in navigator && 'Notification' in window) {
      setIsSupported(true);
    }
  }, []);

  useEffect(() => {
    if (isSupported) {
      // Listen for foreground messages
      const unsubscribe = onMessageListener()
        .then((payload: any) => {
          console.log('Received foreground message:', payload);
          setNotification(payload);
          
          // Show browser notification if permission is granted
          if (Notification.permission === 'granted') {
            new Notification(payload.notification?.title || 'New Message', {
              body: payload.notification?.body || 'You have a new message',
              icon: payload.notification?.image || '/favicon.png',
              tag: 'firebase-notification',
            });
          }
        })
        .catch((err) => console.log('Failed to receive message:', err));

      return () => {
        // Cleanup if needed
      };
    }
  }, [isSupported]);

  const requestPermission = async (): Promise<void> => {
    try {
      const fcmToken = await requestNotificationPermission();
      if (fcmToken) {
        setToken(fcmToken);
        // You can send this token to your backend to store it
        console.log('FCM Token:', fcmToken);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const clearNotification = (): void => {
    setNotification(null);
  };

  return {
    token,
    notification,
    isSupported,
    requestPermission,
    clearNotification,
  };
};

// Hook for managing notification preferences
export const useNotificationPreferences = () => {
  const [preferences, setPreferences] = useState({
    enabled: localStorage.getItem('notifications-enabled') === 'true',
    sound: localStorage.getItem('notifications-sound') !== 'false',
    desktop: localStorage.getItem('notifications-desktop') !== 'false',
  });

  const updatePreference = (key: keyof typeof preferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    localStorage.setItem(`notifications-${key}`, value.toString());
  };

  return {
    preferences,
    updatePreference,
  };
};
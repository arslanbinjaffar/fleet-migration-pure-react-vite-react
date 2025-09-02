import { useCallback, useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  useGetUnreadNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useRegisterFCMTokenMutation,
} from '../../../stores/api/notifications/notificationApiSlice';
import firebaseService from '../utils/firebaseService';
import {
  formatNotificationMessage,
  getNotificationNavigationUrl,
  sanitizeNotification,
  debounce,
} from '../utils';
import {
  NOTIFICATION_SETTINGS,
  NOTIFICATION_ERRORS,
  NOTIFICATION_SUCCESS,
} from '../constants';
import type {
  Notification,
  UseNotificationReturn,
  NotificationPermission,
  FirebaseMessage,
} from '../types';
import { selectCurrentUser } from '../../../stores/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

/**
 * Custom hook for managing notifications with Firebase integration
 */
export const useNotification = (): UseNotificationReturn => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const seenNotificationsRef = useRef(new Set<string>());
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  // API hooks
  const {
    data: notificationsResponse,
    isLoading,
    error,
    refetch,
  } = useGetUnreadNotificationsQuery(undefined, {
    pollingInterval: NOTIFICATION_SETTINGS.FETCH_INTERVAL,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const [markAsReadMutation] = useMarkNotificationAsReadMutation();
  const [markAllAsReadMutation] = useMarkAllNotificationsAsReadMutation();
  const [registerFCMToken] = useRegisterFCMTokenMutation();

  // Extract data from response
  const notifications = notificationsResponse?.data || [];
  const unreadCount = notificationsResponse?.unseenCount || 0;

  /**
   * Request notification permission
   */
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    try {
      return await firebaseService.requestPermission();
    } catch (error) {
      console.error('Error requesting permission:', error);
      throw error;
    }
  }, []);

  /**
   * Subscribe to Firebase notifications with retry logic
   */
  const subscribeToFirebase = useCallback(async (retryCount = 3): Promise<string | null> => {
    try {
      // Wait for Firebase to initialize if not ready
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!firebaseService.isInitialized() && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }
      
      if (!firebaseService.isInitialized()) {
        throw new Error(NOTIFICATION_ERRORS.FIREBASE_INIT_FAILED);
      }

      const token = await firebaseService.getRegistrationToken();
      if (token) {
        setFcmToken(token);
        
        // Register token with backend
        try {
          await registerFCMToken({
            token,
            userId: user?.id,
          }).unwrap();
          
          toast({
            title: 'Success',
            description: NOTIFICATION_SUCCESS.TOKEN_REGISTERED,
          });
        } catch (error) {
          console.error('Failed to register FCM token with backend:', error);
          // Don't throw here as the token is still valid for Firebase
        }
      }
      
      return token;
    } catch (error) {
      console.error('Error subscribing to Firebase:', error);
      
      // Retry logic for specific errors
      if (retryCount > 0 && (
        error.message.includes('messaging/registration-token-not-available-in-sw') ||
        error.message.includes('Firebase initialization')
      )) {
        console.log(`Retrying Firebase subscription... (${retryCount} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        return subscribeToFirebase(retryCount - 1);
      }
      
      toast({
        title: 'Error',
        description: NOTIFICATION_ERRORS.TOKEN_REGISTRATION_FAILED,
        variant: 'destructive',
      });
      throw error;
    }
  }, [registerFCMToken, user?.id]);

  /**
   * Fetch notifications
   */
  const fetchNotifications = useCallback(async (): Promise<void> => {
    try {
      await refetch();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
          title: 'Error',
          description: NOTIFICATION_ERRORS.FETCH_FAILED,
          variant: 'destructive',
        });
    }
  }, [refetch]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(
    async (notificationId: string): Promise<void> => {
      try {
        await markAsReadMutation({
          notificationId,
          payload: {},
        }).unwrap();
      } catch (error) {
        console.error('Error marking notification as read:', error);
        toast({
          title: 'Error',
          description: NOTIFICATION_ERRORS.MARK_READ_FAILED,
          variant: 'destructive',
        });
      }
    },
    [markAsReadMutation]
  );

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async (): Promise<void> => {
    try {
      const unreadIds = notifications
        .filter((n) => !n.read)
        .map((n) => n.notificationId);

      if (unreadIds.length > 0) {
        await markAllAsReadMutation({ notificationIds: unreadIds }).unwrap();
        
        toast({
          title: 'Success',
          description: NOTIFICATION_SUCCESS.ALL_MARKED_AS_READ,
        });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: 'Error',
        description: NOTIFICATION_ERRORS.MARK_READ_FAILED,
        variant: 'destructive',
      });
    }
  }, [notifications, markAllAsReadMutation]);

  /**
   * Handle notification click
   */
  const handleNotificationClick = useCallback(
    async (notification: Notification): Promise<void> => {
      try {
        if (!notification || !notification.details || !notification.modelType) {
          console.warn(NOTIFICATION_ERRORS.INVALID_NOTIFICATION, notification);
          navigate(`/${user?.Role?.roleName?.toLowerCase() || 'admin'}/notifications`);
          return;
        }

        if (!user?.Role?.roleName) {
          navigate('/admin/notifications');
          return;
        }

        // Mark as read if not already read
        if (!notification.read) {
          await markAsRead(notification.notificationId);
        }

        // Navigate to the appropriate page
        const navigationUrl = getNotificationNavigationUrl(
          notification,
          user.Role.roleName.toLowerCase()
        );
        
        navigate(navigationUrl);
      } catch (error) {
        console.error('Error handling notification click:', error);
        toast({
          title: 'Error',
          description: NOTIFICATION_ERRORS.NAVIGATION_FAILED,
          variant: 'destructive',
        });
        navigate(`/${user?.Role?.roleName?.toLowerCase() || 'admin'}/notifications`);
      }
    },
    [user, navigate, markAsRead]
  );

  /**
   * Handle Firebase foreground messages
   */
  const handleFirebaseMessage = useCallback(
    (event: CustomEvent<FirebaseMessage>) => {
      const message = event.detail;
      console.log('Firebase message received:', message);

      // Refetch notifications to get updated data
      fetchNotifications();

      // Show toast notification
      if (message.notification) {
        toast({
          title: message.notification.title || 'New Notification',
          description: message.notification.body || '',
        });
      }
    },
    [fetchNotifications]
  );

  /**
   * Handle notification click from Firebase
   */
  const handleFirebaseNotificationClick = useCallback(
    (event: CustomEvent) => {
      const data = event.detail;
      console.log('Firebase notification clicked:', data);
      
      // Handle navigation based on data
      if (data && data.notificationId) {
        const notification = notifications.find(
          (n) => n.notificationId === data.notificationId
        );
        if (notification) {
          handleNotificationClick(notification);
        }
      }
    },
    [notifications, handleNotificationClick]
  );

  // Debounced fetch function
  const debouncedFetch = useCallback(
    debounce(fetchNotifications, 300),
    [fetchNotifications]
  );

  // Initialize Firebase and set up listeners
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        await subscribeToFirebase();
      } catch (error) {
        console.error('Failed to initialize Firebase:', error);
      }
    };

    initializeFirebase();

    // Set up Firebase message listeners
    window.addEventListener('firebaseNotification', handleFirebaseMessage as EventListener);
    window.addEventListener('notificationClick', handleFirebaseNotificationClick as EventListener);

    return () => {
      window.removeEventListener('firebaseNotification', handleFirebaseMessage as EventListener);
      window.removeEventListener('notificationClick', handleFirebaseNotificationClick as EventListener);
    };
  }, [subscribeToFirebase, handleFirebaseMessage, handleFirebaseNotificationClick]);

  // Handle new notifications for push notifications
  useEffect(() => {
    try {
      const seen = seenNotificationsRef.current;
      const newNotifications = notifications.filter(
        (n) => n && !seen.has(n.notificationId)
      );

      newNotifications.forEach((notification) => {
        if (!notification) return;

        // Add to seen set
        seen.add(notification.notificationId);

        // Show browser notification if permission is granted
        if (Notification.permission === 'granted') {
          const message = formatNotificationMessage(notification);
          
          const browserNotification = new Notification('New Notification', {
            body: message,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'fleet-notification',
            requireInteraction: true,
          });

          browserNotification.onclick = () => {
            handleNotificationClick(notification);
            browserNotification.close();
          };

          // Auto close after 5 seconds
          setTimeout(() => {
            browserNotification.close();
          }, 5000);
        }
      });
    } catch (error) {
      console.error('Error displaying notifications:', error);
    }
  }, [notifications, handleNotificationClick]);

  return {
    notifications: notifications.map(sanitizeNotification).filter(Boolean) as Notification[],
    unreadCount,
    isLoading,
    error: error ? NOTIFICATION_ERRORS.FETCH_FAILED : null,
    fetchNotifications: fetchNotifications,
    markAsRead,
    markAllAsRead,
    requestPermission,
    subscribeToFirebase,
  };
};

export default useNotification;
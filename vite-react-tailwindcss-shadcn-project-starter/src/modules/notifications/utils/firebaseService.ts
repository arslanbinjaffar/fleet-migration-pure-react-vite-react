import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getMessaging as getFirebaseMessaging,
  getToken,
  onMessage,
  Messaging,
  MessagePayload,
} from 'firebase/messaging';
import type {
  FirebaseConfig,
  FirebaseMessage,
  NotificationPermission,
} from '../types';
import {
  FIREBASE_CONFIG,
  NOTIFICATION_ERRORS,
  NOTIFICATION_SUCCESS,
  NOTIFICATION_SOUND,
} from '../constants';

// Firebase configuration
const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || '',
};

class FirebaseService {
  private app: FirebaseApp | null = null;
  private messaging: Messaging | null = null;
  private currentToken: string | null = null;

  constructor() {
    this.initializeFirebase().catch(error => {
      console.error('Failed to initialize Firebase service:', error);
    });
  }

  /**
   * Validate VAPID key format
   */
  private isValidVapidKey(vapidKey: string): boolean {
    // VAPID key should be a base64url-encoded string of 65 bytes (87 characters)
    const vapidKeyRegex = /^[A-Za-z0-9_-]{87}$/;
    return vapidKeyRegex.test(vapidKey);
  }

  /**
   * Register service worker with proper error handling
   */
  private async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/'
      });

      // Send Firebase config to service worker
      if (registration.active) {
        registration.active.postMessage({
          type: 'FIREBASE_CONFIG',
          config: firebaseConfig
        });
      }

      // Listen for service worker state changes
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              newWorker.postMessage({
                type: 'FIREBASE_CONFIG',
                config: firebaseConfig
              });
            }
          });
        }
      });

      console.log('Service Worker registered successfully');
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw new Error('Failed to register service worker');
    }
  }
  // getMessaging(): Messaging | null {
  //   return this.messaging;
  // }
  /**
   * Initialize Firebase app and messaging
   */
  private async initializeFirebase(): Promise<void> {
    try {
      // Validate Firebase configuration
      if (!this.validateFirebaseConfig()) {
        throw new Error('Invalid Firebase configuration');
      }

      // Check if Firebase is already initialized
      if (getApps().length === 0) {
        this.app = initializeApp(firebaseConfig);
      } else {
        this.app = getApps()[0];
      }

      // Initialize messaging if supported
      if (this.isMessagingSupported()) {
        if (this.app) {
          // Register service worker first
          await this.registerServiceWorker();
          
          this.messaging = getFirebaseMessaging(this.app);
          this.setupMessageListener();
        }
      }
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      throw new Error(NOTIFICATION_ERRORS.FIREBASE_INIT_FAILED);
    }
  }

  /**
   * Validate Firebase configuration
   */
  private validateFirebaseConfig(): boolean {
    const requiredFields = ['apiKey', 'authDomain', 'projectId', 'messagingSenderId', 'appId'];
    
    for (const field of requiredFields) {
      if (!firebaseConfig[field as keyof FirebaseConfig]) {
        console.error(`Missing Firebase config field: ${field}`);
        return false;
      }
    }

    // Validate VAPID key if provided
    if (firebaseConfig.vapidKey && !this.isValidVapidKey(firebaseConfig.vapidKey)) {
      console.error('Invalid VAPID key format');
      return false;
    }

    return true;
  }

  /**
   * Check if messaging is supported in current environment
   */
  private isMessagingSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window
    );
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    try {
      if (!('Notification' in window)) {
        throw new Error('This browser does not support notifications');
      }

      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log(NOTIFICATION_SUCCESS.PERMISSION_GRANTED);
      } else {
        console.warn(NOTIFICATION_ERRORS.PERMISSION_DENIED);
      }

      return permission as NotificationPermission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      throw error;
    }
  }

  /**
   * Get FCM registration token with retry logic
   */
  async getRegistrationToken(retryCount = 3): Promise<string | null> {
    try {
      if (!this.messaging) {
        throw new Error('Messaging not initialized');
      }

      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        throw new Error(NOTIFICATION_ERRORS.PERMISSION_DENIED);
      }

      // Validate VAPID key before attempting to get token
      if (!firebaseConfig.vapidKey) {
        throw new Error('VAPID key not configured');
      }

      if (!this.isValidVapidKey(firebaseConfig.vapidKey)) {
        throw new Error('Invalid VAPID key format');
      }

      const token = await getToken(this.messaging, {
        vapidKey: firebaseConfig.vapidKey,
      });

      if (token) {
        this.currentToken = token;
        console.log(NOTIFICATION_SUCCESS.TOKEN_REGISTERED);
        return token;
      } else {
        throw new Error('No registration token available');
      }
    } catch (error) {
      console.error('Error getting registration token:', error);
      
      // Retry logic
      if (retryCount > 0 && error.message.includes('messaging/registration-token-not-available-in-sw')) {
        console.log(`Retrying token registration... (${retryCount} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        return this.getRegistrationToken(retryCount - 1);
      }
      
      throw new Error(NOTIFICATION_ERRORS.TOKEN_REGISTRATION_FAILED);
    }
  }

  /**
   * Setup foreground message listener
   */
  private setupMessageListener(): void {
    if (!this.messaging) return;

    onMessage(this.messaging, (payload: MessagePayload) => {
      console.log('Foreground message received:', payload);
      this.handleForegroundMessage(payload);
    });
  }

  /**
   * Handle foreground messages
   */
  private handleForegroundMessage(payload: MessagePayload): void {
    const { notification, data } = payload;

    if (notification) {
      // Play notification sound
      this.playNotificationSound();

      // Show browser notification
      this.showBrowserNotification({
        title: notification.title || 'New Notification',
        body: notification.body || '',
        icon: notification.icon,
        data: data,
      });

      // Dispatch custom event for app to handle
      this.dispatchNotificationEvent({
        notification: {
          title: notification.title || '',
          body: notification.body || '',
          icon: notification.icon,
        },
        data,
        from: '',
        messageId: '',
      });
    }
  }

  /**
   * Show browser notification
   */
  private showBrowserNotification(options: {
    title: string;
    body: string;
    icon?: string;
    data?: any;
  }): void {
    if (Notification.permission === 'granted') {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'fleet-notification',
        data: options.data,
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Handle notification click
        if (options.data) {
          this.handleNotificationClick(options.data);
        }
      };

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  }

  /**
   * Play notification sound
   */
  private playNotificationSound(): void {
    if (NOTIFICATION_SOUND.ENABLED) {
      try {
        const audio = new Audio(NOTIFICATION_SOUND.DEFAULT_SOUND);
        audio.volume = NOTIFICATION_SOUND.VOLUME;
        audio.play().catch((error) => {
          console.warn('Could not play notification sound:', error);
        });
      } catch (error) {
        console.warn('Error playing notification sound:', error);
      }
    }
  }

  /**
   * Dispatch custom notification event
   */
  private dispatchNotificationEvent(message: FirebaseMessage): void {
    const event = new CustomEvent('firebaseNotification', {
      detail: message,
    });
    window.dispatchEvent(event);
  }

  /**
   * Handle notification click
   */
  private handleNotificationClick(data: any): void {
    // Dispatch click event for app to handle navigation
    const event = new CustomEvent('notificationClick', {
      detail: data,
    });
    window.dispatchEvent(event);
  }

  /**
   * Get current token
   */
  getCurrentToken(): string | null {
    return this.currentToken;
  }

  /**
   * Check if Firebase is initialized
   */
  isInitialized(): boolean {
    return this.app !== null && this.messaging !== null;
  }

  /**
   * Get messaging instance
   */
  getMessaging(): Messaging | null {
    return this.messaging;
  }

}

// Create singleton instance
const firebaseService = new FirebaseService();

export default firebaseService;

// Export individual functions for convenience
export const {
  requestPermission,
  getRegistrationToken,
  getCurrentToken,
  isInitialized,
  getMessaging,
} = firebaseService;
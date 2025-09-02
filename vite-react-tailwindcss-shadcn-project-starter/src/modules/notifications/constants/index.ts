import type { ModelConfig } from '../types';

// Model configurations for mapping notification types to navigation paths
export const MODEL_CONFIGS: ModelConfig[] = [
  { idField: "invoiceId", entityType: "invoice", modelType: "invoice", url: "invoices/view" },
  { idField: "quotaionId", entityType: "quotaion", modelType: "quotaions", url: "quotation/view" },
  { idField: "lpoId", entityType: "lpo", modelType: "lpo", url: "lpos/view" },
  { idField: "userId", entityType: "user", modelType: "users", url: "employee/view" },
  { idField: "fleetId", entityType: "fleet", modelType: "fleet", url: "fleet/view" },
  { idField: "fleetId", entityType: "fleettbc", modelType: "fleettbc", url: "fleet/view" },
  { idField: "fleetPurchaseOrderId", entityType: "fleetPurchaseOrder", modelType: "fleetPurchaseOrder", url: "purchase-order-fleet/view" },
  { idField: "purchaseOrderId", entityType: "purchaseOrder", modelType: "purchaseOrder", url: "purchase-order/view" },
  { idField: "productId", entityType: "stocklist", modelType: "stocklist", url: "product/view" },
];

// API Endpoints
export const NOTIFICATION_ENDPOINTS = {
  GET_NOTIFICATIONS: '/hrm/notification',
  GET_UNREAD_NOTIFICATIONS: '/hrm/notifications/unread',
  MARK_AS_READ: (id: string) => `/hrm/notifications/${id}/read`,
  MARK_ALL_AS_READ: '/hrm/notifications/mark-read',
  GET_BY_ID: (id: string) => `/notification/${id}`,
} as const;

// Firebase Configuration
export const FIREBASE_CONFIG = {
  VAPID_KEY: import.meta.env.VITE_FIREBASE_VAPID_KEY || '',
  SERVICE_WORKER_PATH: '/firebase-messaging-sw.js',
} as const;

// Notification Themes
export const NOTIFICATION_THEMES = {
  DARKBLUE: 'darkblue',
  RED: 'red',
  LIGHT: 'light',
  DARK: 'dark',
} as const;

// Notification Settings
export const NOTIFICATION_SETTINGS = {
  FETCH_INTERVAL: 60000, // 1 minute
  MAX_NOTIFICATIONS_DISPLAY: 50,
  DEFAULT_DURATION: 5000, // 5 seconds
  MAX_BADGE_COUNT: 99,
} as const;

// Error Messages
export const NOTIFICATION_ERRORS = {
  PERMISSION_DENIED: 'Notification permission denied',
  FIREBASE_INIT_FAILED: 'Failed to initialize Firebase messaging',
  TOKEN_REGISTRATION_FAILED: 'Failed to register FCM token',
  FETCH_FAILED: 'Failed to fetch notifications',
  MARK_READ_FAILED: 'Failed to mark notification as read',
  INVALID_NOTIFICATION: 'Invalid notification data',
  NAVIGATION_FAILED: 'Failed to navigate to notification target',
} as const;

// Success Messages
export const NOTIFICATION_SUCCESS = {
  PERMISSION_GRANTED: 'Notification permission granted',
  TOKEN_REGISTERED: 'FCM token registered successfully',
  MARKED_AS_READ: 'Notification marked as read',
  ALL_MARKED_AS_READ: 'All notifications marked as read',
} as const;

// UI Constants
export const NOTIFICATION_UI = {
  LOADING_TEXT: 'Loading notifications...',
  NO_NOTIFICATIONS: 'No new notifications',
  MARK_ALL_READ: 'Mark all as read',
  NEW_BADGE: 'New',
  NOTIFICATION_TITLE: 'Notifications',
} as const;

// Sound Configuration
export const NOTIFICATION_SOUND = {
  DEFAULT_SOUND: '/assets/sounds/notification.wav',
  VOLUME: 0.5,
  ENABLED: true,
} as const;

// Date Format Options
export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

// Notification Types for Firebase
export const FIREBASE_NOTIFICATION_TYPES = {
  FOREGROUND: 'foreground',
  BACKGROUND: 'background',
  CLICKED: 'notification_clicked',
} as const;

// Permission States
export const PERMISSION_STATES = {
  DEFAULT: 'default',
  GRANTED: 'granted',
  DENIED: 'denied',
} as const;

// Redux Action Types
export const NOTIFICATION_ACTION_TYPES = {
  FETCH_NOTIFICATIONS: 'notifications/fetchNotifications',
  FETCH_NOTIFICATIONS_SUCCESS: 'notifications/fetchNotificationsSuccess',
  FETCH_NOTIFICATIONS_FAILURE: 'notifications/fetchNotificationsFailure',
  MARK_AS_READ: 'notifications/markAsRead',
  MARK_AS_READ_SUCCESS: 'notifications/markAsReadSuccess',
  MARK_AS_READ_FAILURE: 'notifications/markAsReadFailure',
  MARK_ALL_AS_READ: 'notifications/markAllAsRead',
  SET_LOADING: 'notifications/setLoading',
  SET_ERROR: 'notifications/setError',
  CLEAR_NOTIFICATIONS: 'notifications/clearNotifications',
  ADD_NOTIFICATION: 'notifications/addNotification',
  REMOVE_NOTIFICATION: 'notifications/removeNotification',
} as const;

// Export all constants
// export {
//   MODEL_CONFIGS,
//   NOTIFICATION_ENDPOINTS,
//   FIREBASE_CONFIG,
//   NOTIFICATION_THEMES,
//   NOTIFICATION_SETTINGS,
//   NOTIFICATION_ERRORS,
//   NOTIFICATION_SUCCESS,
//   NOTIFICATION_UI,
//   NOTIFICATION_SOUND,
//   DATE_FORMAT_OPTIONS,
//   FIREBASE_NOTIFICATION_TYPES,
//   PERMISSION_STATES,
//   NOTIFICATION_ACTION_TYPES,
// };
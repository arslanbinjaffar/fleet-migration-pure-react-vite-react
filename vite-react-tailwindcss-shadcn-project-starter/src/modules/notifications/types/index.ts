// Notification Domain Types
export interface Notification {
  notificationId: string;
  title?: string;
  message?: string;
  modelType: string;
  details: NotificationDetails;
  expiryField?: string;
  daysRemaining?: number;
  read: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Notification Details based on model type
export interface NotificationDetails {
  // Invoice details
  invoiceId?: string;
  invoiceNo?: string;
  
  // Quotation details
  quotaionId?: string;
  quotationNo?: string;
  
  // LPO details
  lpoId?: string;
  lpoNumber?: string;
  
  // User details
  userId?: string;
  firstName?: string;
  lastName?: string;
  
  // Fleet details
  fleetId?: string;
  vehicleName?: string;
  plateNumber?: string;
  
  // Purchase Order details
  fleetPurchaseOrderId?: string;
  purchaseOrderId?: string;
  purchaseOrderNumber?: string;
  
  // Product/Stock details
  productId?: string;
  product?: {
    productId?: string;
    name?: string;
  };
  stocklist?: {
    productId?: string;
    product?: {
      productId?: string;
      name?: string;
    };
  };
  
  // Generic expiry field
  [key: string]: any;
}

// Model Configuration for routing
export interface ModelConfig {
  idField: string;
  entityType: string;
  modelType: string;
  url: string;
}

// API Response Types
export interface NotificationsResponse {
  data: Notification[];
  unseenCount: number;
  total?: number;
}

export interface NotificationResponse {
  data: Notification;
  message?: string;
}

// Firebase Types
export interface FirebaseNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
}

export interface FirebaseMessage {
  notification?: FirebaseNotificationPayload;
  data?: Record<string, string>;
  from: string;
  messageId: string;
  collapseKey?: string;
}

// Push Notification Types
export interface PushNotificationOptions {
  title: string;
  subtitle?: string;
  message: string;
  theme?: 'darkblue' | 'red' | 'light' | 'dark';
  native?: boolean;
  duration?: number;
  icon?: string;
  onClick?: () => void;
}

// Notification State Types
export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  lastFetched: string | null;
}

// Notification Context Types
export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => void;
}

// Firebase Configuration Types
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  vapidKey?: string;
}

// Notification Permission Types
export type NotificationPermission = 'default' | 'granted' | 'denied';

// Notification Action Types
export interface NotificationAction {
  type: 'FETCH_NOTIFICATIONS' | 'MARK_AS_READ' | 'MARK_ALL_AS_READ' | 'SET_LOADING' | 'SET_ERROR' | 'CLEAR_NOTIFICATIONS';
  payload?: any;
}

// Hook Return Types
export interface UseNotificationReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  requestPermission: () => Promise<NotificationPermission>;
  subscribeToFirebase: () => Promise<string | null>;
}

// Component Props Types
export interface NotificationListProps {
  className?: string;
  maxHeight?: string;
  showMarkAllAsRead?: boolean;
}

export interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
  className?: string;
}

export interface NotificationBadgeProps {
  count: number;
  className?: string;
  maxCount?: number;
}

// Export all types
export type {
  Notification,
  NotificationDetails,
  ModelConfig,
  NotificationsResponse,
  NotificationResponse,
  FirebaseNotificationPayload,
  FirebaseMessage,
  PushNotificationOptions,
  NotificationState,
  NotificationContextType,
  FirebaseConfig,
  NotificationPermission,
  NotificationAction,
  UseNotificationReturn,
  NotificationListProps,
  NotificationItemProps,
  NotificationBadgeProps,
};
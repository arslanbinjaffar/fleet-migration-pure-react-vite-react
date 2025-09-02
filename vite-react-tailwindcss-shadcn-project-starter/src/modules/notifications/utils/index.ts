import type {
  Notification,
  ModelConfig,
  NotificationDetails,
} from '../types';
import { MODEL_CONFIGS, DATE_FORMAT_OPTIONS } from '../constants';

/**
 * Format notification message based on model type and details
 */
export const formatNotificationMessage = (
  notification: Notification,
  singleFleet?: any
): string => {
  if (!notification || !notification.modelType || !notification.details) {
    return 'Invalid notification';
  }

  const { modelType, details, expiryField, daysRemaining } = notification;
  const expiry = expiryField ? new Date(details[expiryField]) : null;
  const expiryFormatted = expiry ? expiry.toLocaleDateString('en-GB') : 'N/A';

  try {
    switch (modelType) {
      case 'invoice':
        return `Invoice ${details.invoiceNo} due in ${daysRemaining} day(s) on ${expiryFormatted}`;
      
      case 'quotaions':
        return `Quotation ${details.quotationNo} expires in ${daysRemaining} day(s) on ${expiryFormatted}`;
      
      case 'lpo':
        return `LPO ${details.lpoNumber} expires in ${daysRemaining} day(s) on ${expiryFormatted}`;
      
      case 'users':
        return `User ${details.firstName} ${details.lastName}'s ${expiryField
          ?.replace(/([A-Z])/g, ' $1')
          .toLowerCase()} expires in ${daysRemaining} day(s) on ${expiryFormatted}`;
      
      case 'fleet':
        return `Vehicle ${details.vehicleName} (Plate: ${details.plateNumber})'s ${expiryField
          ?.replace(/([A-Z])/g, ' $1')
          .toLowerCase()} expires in ${daysRemaining} day(s) on ${expiryFormatted}`;
      
      case 'fleettbc':
        return `Vehicle ${singleFleet?.fleet?.vehicleName || 'N/A'} (Plate: ${
          singleFleet?.fleet?.plateNumber || 'N/A'
        })'s ${expiryField
          ?.replace(/([A-Z])/g, ' $1')
          .toLowerCase()} expires in ${daysRemaining} day(s) on ${expiryFormatted}`;
      
      case 'fleetPurchaseOrder':
      case 'purchaseOrder':
        return `Purchase Order ${details.purchaseOrderNumber || 'N/A'} expires in ${daysRemaining} day(s) on ${expiryFormatted}`;
      
      case 'stocklist':
        return `Product ${details?.product?.name || details?.stocklist?.product?.name || 'N/A'} is out of stock`;
      
      default:
        return notification?.message || 'New Notification';
    }
  } catch (error) {
    console.error('Error formatting message:', error);
    return 'Notification info unavailable';
  }
};

/**
 * Get navigation URL for notification based on model type
 */
export const getNotificationNavigationUrl = (
  notification: Notification,
  userRole: string = 'admin'
): string => {
  if (!notification || !notification.details || !notification.modelType) {
    return `/${userRole}/notifications`;
  }

  const targetConfig = MODEL_CONFIGS.find(
    (config) => config.modelType.toLowerCase() === notification.modelType.toLowerCase()
  );

  if (!targetConfig) {
    console.warn('No config found for', notification.modelType);
    return `/${userRole}/notifications`;
  }

  let detailId: string | undefined;

  if (notification.modelType === 'stocklist') {
    detailId = notification.details?.stocklist?.productId || notification.details?.product?.productId;
  } else {
    detailId = notification.details?.[targetConfig.idField];
  }

  if (detailId) {
    return `/${userRole}/${targetConfig.url}/${detailId}`;
  } else {
    console.warn('Missing ID in notification details');
    return `/${userRole}/notifications`;
  }
};

/**
 * Format notification date
 */
export const formatNotificationDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', DATE_FORMAT_OPTIONS);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Check if notification is recent (within last 24 hours)
 */
export const isRecentNotification = (dateString: string): boolean => {
  try {
    const notificationDate = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60);
    return diffInHours <= 24;
  } catch (error) {
    return false;
  }
};

/**
 * Get notification priority based on days remaining
 */
export const getNotificationPriority = (daysRemaining?: number): 'high' | 'medium' | 'low' => {
  if (daysRemaining === undefined) return 'low';
  
  if (daysRemaining <= 1) return 'high';
  if (daysRemaining <= 7) return 'medium';
  return 'low';
};

/**
 * Get notification icon based on model type
 */
export const getNotificationIcon = (modelType: string): string => {
  const iconMap: Record<string, string> = {
    invoice: '💰',
    quotaions: '📋',
    lpo: '📄',
    users: '👤',
    fleet: '🚗',
    fleettbc: '🚗',
    fleetPurchaseOrder: '🛒',
    purchaseOrder: '🛒',
    stocklist: '📦',
  };

  return iconMap[modelType] || '🔔';
};

/**
 * Group notifications by date
 */
export const groupNotificationsByDate = (notifications: Notification[]) => {
  const groups: Record<string, Notification[]> = {};
  
  notifications.forEach((notification) => {
    const date = new Date(notification.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
  });

  return groups;
};

/**
 * Filter notifications by read status
 */
export const filterNotificationsByReadStatus = (
  notifications: Notification[],
  showUnreadOnly: boolean = false
): Notification[] => {
  if (!showUnreadOnly) return notifications;
  return notifications.filter((notification) => !notification.read);
};

/**
 * Sort notifications by date (newest first)
 */
export const sortNotificationsByDate = (notifications: Notification[]): Notification[] => {
  return [...notifications].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

/**
 * Validate notification data
 */
export const validateNotification = (notification: any): notification is Notification => {
  return (
    notification &&
    typeof notification.notificationId === 'string' &&
    typeof notification.modelType === 'string' &&
    notification.details &&
    typeof notification.read === 'boolean' &&
    typeof notification.createdAt === 'string'
  );
};

/**
 * Sanitize notification data
 */
export const sanitizeNotification = (notification: any): Notification | null => {
  if (!validateNotification(notification)) {
    console.warn('Invalid notification data:', notification);
    return null;
  }

  return {
    notificationId: notification.notificationId,
    title: notification.title || '',
    message: notification.message || '',
    modelType: notification.modelType,
    details: notification.details,
    expiryField: notification.expiryField,
    daysRemaining: notification.daysRemaining,
    read: notification.read,
    isDeleted: notification.isDeleted || false,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  };
};

/**
 * Debounce function for API calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function for frequent operations
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Export all utilities
// export {
//   formatNotificationMessage,
//   getNotificationNavigationUrl,
//   formatNotificationDate,
//   isRecentNotification,
//   getNotificationPriority,
//   getNotificationIcon,
//   groupNotificationsByDate,
//   filterNotificationsByReadStatus,
//   sortNotificationsByDate,
//   validateNotification,
//   sanitizeNotification,
//   debounce,
//   throttle,
// };
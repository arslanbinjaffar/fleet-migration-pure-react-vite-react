import { toast } from 'sonner';

// Notification types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// Notification options
export interface NotificationOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Success notification
export const notifySuccess = (
  message: string,
  options?: NotificationOptions
): void => {
  toast.success(message, {
    description: options?.description,
    duration: options?.duration || 4000,
    action: options?.action,
  });
};

// Error notification
export const notifyError = (
  message: string,
  options?: NotificationOptions
): void => {
  toast.error(message, {
    description: options?.description,
    duration: options?.duration || 5000,
    action: options?.action,
  });
};

// Warning notification
export const notifyWarning = (
  message: string,
  options?: NotificationOptions
): void => {
  toast.warning(message, {
    description: options?.description,
    duration: options?.duration || 4000,
    action: options?.action,
  });
};

// Info notification
export const notifyInfo = (
  message: string,
  options?: NotificationOptions
): void => {
  toast.info(message, {
    description: options?.description,
    duration: options?.duration || 4000,
    action: options?.action,
  });
};

// Generic notification
export const notify = (
  type: NotificationType,
  message: string,
  options?: NotificationOptions
): void => {
  switch (type) {
    case 'success':
      notifySuccess(message, options);
      break;
    case 'error':
      notifyError(message, options);
      break;
    case 'warning':
      notifyWarning(message, options);
      break;
    case 'info':
      notifyInfo(message, options);
      break;
    default:
      toast(message, {
        description: options?.description,
        duration: options?.duration || 4000,
        action: options?.action,
      });
  }
};

// Promise-based notifications for async operations
export const notifyPromise = <T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: any) => string);
  },
  options?: {
    duration?: number;
    action?: {
      label: string;
      onClick: () => void;
    };
  }
): Promise<T> => {
  return toast.promise(promise, {
    loading: messages.loading,
    success: (data) => {
      return typeof messages.success === 'function'
        ? messages.success(data)
        : messages.success;
    },
    error: (error) => {
      return typeof messages.error === 'function'
        ? messages.error(error)
        : messages.error;
    },
    duration: options?.duration,
    action: options?.action,
  });
};

// Dismiss all notifications
export const dismissAllNotifications = (): void => {
  toast.dismiss();
};

// Dismiss specific notification by id
export const dismissNotification = (id: string | number): void => {
  toast.dismiss(id);
};

// Custom notification with custom styling
export const notifyCustom = (
  message: string,
  options?: NotificationOptions & {
    className?: string;
    style?: React.CSSProperties;
  }
): void => {
  toast(message, {
    description: options?.description,
    duration: options?.duration || 4000,
    action: options?.action,
    className: options?.className,
    style: options?.style,
  });
};

// Auth-specific notifications
export const authNotifications = {
  loginSuccess: (userName?: string) => {
    notifySuccess(
      'Login Successful',
      {
        description: userName ? `Welcome back, ${userName}!` : 'Welcome back!',
        duration: 3000,
      }
    );
  },
  
  loginError: (error?: string) => {
    notifyError(
      'Login Failed',
      {
        description: error || 'Please check your credentials and try again.',
        duration: 5000,
      }
    );
  },
  
  logoutSuccess: () => {
    notifySuccess(
      'Logged Out',
      {
        description: 'You have been successfully logged out.',
        duration: 3000,
      }
    );
  },
  
  sessionExpired: () => {
    notifyWarning(
      'Session Expired',
      {
        description: 'Your session has expired. Please log in again.',
        duration: 5000,
      }
    );
  },
  
  unauthorized: () => {
    notifyError(
      'Unauthorized Access',
      {
        description: 'You do not have permission to access this resource.',
        duration: 5000,
      }
    );
  },
};

// Export default notification functions for backward compatibility
export default {
  success: notifySuccess,
  error: notifyError,
  warning: notifyWarning,
  info: notifyInfo,
  notify,
  promise: notifyPromise,
  dismiss: dismissNotification,
  dismissAll: dismissAllNotifications,
  custom: notifyCustom,
  auth: authNotifications,
};
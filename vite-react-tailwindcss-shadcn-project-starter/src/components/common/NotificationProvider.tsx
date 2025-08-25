import React, { createContext, useContext, useEffect, useState } from 'react';
import { useFirebaseNotifications } from '../../hooks/useFirebaseNotifications';
import { Toast } from '../ui/toast';
import { useToast } from '../../hooks/use-toast';

interface NotificationContextType {
  requestPermission: () => Promise<void>;
  token: string | null;
  isSupported: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { token, notification, isSupported, requestPermission, clearNotification } = useFirebaseNotifications();
  const { toast } = useToast();

  // Show toast notification when a new notification arrives
  useEffect(() => {
    if (notification) {
      toast({
        title: notification.notification?.title || 'New Notification',
        description: notification.notification?.body || 'You have a new message',
        duration: 5000,
      });
      
      // Clear the notification after showing
      setTimeout(() => {
        clearNotification();
      }, 100);
    }
  }, [notification, toast, clearNotification]);

  const value: NotificationContextType = {
    requestPermission,
    token,
    isSupported,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Notification Settings Component
export const NotificationSettings: React.FC = () => {
  const { requestPermission, isSupported, token } = useNotificationContext();
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    await requestPermission();
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-800">Notifications are not supported in this browser.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Push Notifications</h3>
          <p className="text-sm text-gray-500">
            Get notified about important updates and messages.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {permissionStatus === 'granted' ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Enabled
            </span>
          ) : permissionStatus === 'denied' ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Blocked
            </span>
          ) : (
            <button
              onClick={handleRequestPermission}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Enable Notifications
            </button>
          )}
        </div>
      </div>
      
      {token && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-xs text-gray-600">
            <strong>FCM Token:</strong> {token.substring(0, 50)}...
          </p>
        </div>
      )}
    </div>
  );
};
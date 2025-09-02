import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

// Icons
import { Bell, Check, Clock, AlertCircle } from 'lucide-react';

// Hooks and utilities
import { useNotification } from '../hooks/useNotification';
import {
  formatNotificationMessage,
  formatNotificationDate,
  getNotificationPriority,
  getNotificationIcon,
  isRecentNotification,
} from '../utils';
import { NOTIFICATION_UI } from '../constants';
import type { NotificationListProps, Notification } from '../types';
import { selectCurrentUser } from '@/stores/slices/authSlice';

// Individual notification item component
interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  const user = useSelector(selectCurrentUser);
  const priority = getNotificationPriority(notification.daysRemaining);
  const isRecent = isRecentNotification(notification.createdAt);
  const icon = getNotificationIcon(notification.modelType);

  const handleClick = useCallback(() => {
    onClick(notification);
  }, [notification, onClick]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div
      className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
        !notification.read ? 'bg-blue-50/50' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Notification Icon */}
        <div className="flex-shrink-0 mt-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getPriorityColor(priority)}`}>
            {icon}
          </div>
        </div>

        {/* Notification Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {!notification.read && (
              <Badge variant="default" className="text-xs px-2 py-0.5">
                {NOTIFICATION_UI.NEW_BADGE}
              </Badge>
            )}
            {isRecent && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                <Clock className="w-3 h-3 mr-1" />
                Recent
              </Badge>
            )}
            {priority === 'high' && (
              <Badge variant="destructive" className="text-xs px-2 py-0.5">
                <AlertCircle className="w-3 h-3 mr-1" />
                Urgent
              </Badge>
            )}
          </div>

          <p className={`text-sm leading-relaxed ${
            !notification.read ? 'font-medium text-gray-900' : 'text-gray-700'
          }`}>
            {formatNotificationMessage(notification)}
          </p>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {formatNotificationDate(notification.createdAt)}
            </span>
            {notification.read && (
              <Check className="w-4 h-4 text-green-500" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main notification list component
const NotificationList: React.FC<NotificationListProps> = ({
  className = '',
  maxHeight = '400px',
  showMarkAllAsRead = true,
}) => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotification();

  const handleNotificationClick = useCallback(
    async (notification: Notification) => {
      try {
        // Mark as read if not already read
        if (!notification.read) {
          await markAsRead(notification.notificationId);
        }

        // Navigate based on notification type
        const role = user?.Role?.roleName?.toLowerCase() || 'admin';
        
        // You can implement specific navigation logic here
        // For now, navigate to a general notifications page
        navigate(`/${role}/notifications`);
      } catch (error) {
        console.error('Error handling notification click:', error);
      }
    },
    [markAsRead, navigate, user]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [markAllAsRead]);

  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        {/* Header Skeleton */}
        <div className="flex justify-between items-center p-3 border-b">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        
        {/* Notification Skeletons */}
        <div className="space-y-0">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-3 border-b">
              <div className="flex items-start gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b bg-gray-50/50">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-gray-600" />
          <h6 className="font-medium text-gray-900">
            {NOTIFICATION_UI.NOTIFICATION_TITLE} ({unreadCount || 0})
          </h6>
        </div>
        
        {showMarkAllAsRead && unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="text-xs h-8 px-3"
          >
            <Check className="w-3 h-3 mr-1" />
            {NOTIFICATION_UI.MARK_ALL_READ}
          </Button>
        )}
      </div>

      {/* Notification List */}
      <ScrollArea className="w-full" style={{ maxHeight }}>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <Bell className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">
              {NOTIFICATION_UI.NO_NOTIFICATIONS}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications
              .filter((n) => n && !n.isDeleted)
              .map((notification) => (
                <NotificationItem
                  key={notification.notificationId}
                  notification={notification}
                  onClick={handleNotificationClick}
                />
              ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <>
          <Separator />
          <div className="p-3 bg-gray-50/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const role = user?.Role?.roleName?.toLowerCase() || 'admin';
                navigate(`/${role}/notifications`);
              }}
              className="w-full text-xs h-8"
            >
              View All Notifications
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationList;
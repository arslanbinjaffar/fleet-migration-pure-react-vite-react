import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { NotificationBadgeProps } from '../types';
import { NOTIFICATION_SETTINGS } from '../constants';

/**
 * Notification badge component for displaying unread count
 */
const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  className = '',
  maxCount = NOTIFICATION_SETTINGS.MAX_BADGE_COUNT,
}) => {
  // Don't render if count is 0
  if (count <= 0) {
    return null;
  }

  // Format count display
  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <Badge
      variant="destructive"
      className={cn(
        'absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center',
        'text-xs font-medium px-1.5 py-0',
        'bg-red-500 hover:bg-red-600 text-white',
        'border-2 border-white',
        'animate-pulse',
        className
      )}
    >
      {displayCount}
    </Badge>
  );
};

export default NotificationBadge;
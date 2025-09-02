import React, { useState, useCallback } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

// Components
import NotificationList from './NotificationList';
import NotificationBadge from './NotificationBadge';

// Hooks
import { useNotification } from '../hooks/useNotification';

interface NotificationDropdownProps {
  className?: string;
  iconSize?: number;
  dropdownAlign?: 'start' | 'center' | 'end';
  onOpenChange?: (open: boolean) => void;
}

/**
 * Notification dropdown component for header integration
 */
const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  className = '',
  iconSize = 18,
  dropdownAlign = 'end',
  onOpenChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, fetchNotifications } = useNotification();

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      
      // Fetch notifications when dropdown opens
      if (open) {
        fetchNotifications();
      }
      
      // Call external handler if provided
      onOpenChange?.(open);
    },
    [fetchNotifications, onOpenChange]
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'relative p-2 h-auto hover:bg-gray-100/80 transition-colors',
            className
          )}
        >
          <Bell size={iconSize} className="text-gray-600" />
          <NotificationBadge count={unreadCount} />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent
        align={dropdownAlign}
        className="w-80 p-0 mt-2"
        sideOffset={8}
      >
        <NotificationList
          maxHeight="400px"
          showMarkAllAsRead={true}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { usePermissions } from '../../contexts/PermissionContext';
import {
  PermissionDropdownProps,
  PermissionDropdownItemProps,
  PermissionModuleType,
} from '../../types/permissions';
import { cn } from '@/lib/utils';
import { MoreHorizontal } from 'lucide-react';

/**
 * PermissionDropdown - A dropdown menu component with built-in permission checking
 * 
 * This component provides dropdown menu functionality while automatically
 * handling permission checks for the entire dropdown and individual items.
 * 
 * @param module - The permission module to check against
 * @param children - Dropdown menu items (should be PermissionDropdownItem components)
 * @param className - Additional CSS classes
 * @param trigger - Custom trigger element (defaults to three dots button)
 * @param align - Dropdown alignment
 * @param side - Dropdown side
 */
const PermissionDropdown: React.FC<PermissionDropdownProps> = ({
  module,
  children,
  className,
  trigger,
  align = 'end',
  side = 'bottom',
}) => {
  const { hasPermission } = usePermissions();
  
  // Check if user has any permission for this module
  const hasAnyPermission = hasPermission(module);
  
  // If no permissions at all, don't render the dropdown
  if (!hasAnyPermission) {
    return null;
  }
  
  // Default trigger is a three dots button
  const defaultTrigger = (
    <Button variant="ghost" className="h-8 w-8 p-0">
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  );
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || defaultTrigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align={align} 
        side={side}
        className={cn(className)}
      >
        {/* Pass module context to children */}
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { module } as any);
          }
          return child;
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/**
 * PermissionDropdownItem - A dropdown menu item with permission checking
 * 
 * This component wraps DropdownMenuItem with permission logic.
 * It receives the module from its parent PermissionDropdown.
 * 
 * @param action - The specific action to check permission for
 * @param children - Item content
 * @param className - Additional CSS classes
 * @param onClick - Click handler (only called if permission is granted)
 * @param disabled - Additional disabled state
 * @param destructive - Whether this is a destructive action (styling)
 * @param module - Module (automatically passed from parent PermissionDropdown)
 */
const PermissionDropdownItem: React.FC<PermissionDropdownItemProps & { module?: PermissionModuleType }> = ({
  action,
  children,
  className,
  onClick,
  disabled = false,
  destructive = false,
  module,
}) => {
  const { hasPermission } = usePermissions();
  
  // If no module provided, render normally (for non-permission items)
  if (!module) {
    return (
      <DropdownMenuItem
        className={cn(destructive && 'text-red-600', className)}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </DropdownMenuItem>
    );
  }
  
  // Check if user has the required permission
  const hasRequiredPermission = hasPermission(module, action);
  
  // If no permission, don't render the item
  if (!hasRequiredPermission) {
    return null;
  }
  
  // Handle click with permission check
  const handleClick = () => {
    if (hasRequiredPermission && onClick) {
      onClick();
    }
  };
  
  return (
    <DropdownMenuItem
      className={cn(destructive && 'text-red-600', className)}
      onClick={handleClick}
      disabled={disabled || !hasRequiredPermission}
    >
      {children}
    </DropdownMenuItem>
  );
};

// Export components with display names
PermissionDropdown.displayName = 'PermissionDropdown';
PermissionDropdownItem.displayName = 'PermissionDropdownItem';

export { PermissionDropdown, PermissionDropdownItem };
export default PermissionDropdown;

// Convenience components for common dropdown patterns

/**
 * ActionsDropdown - Pre-configured dropdown for common CRUD actions
 */
export const ActionsDropdown: React.FC<{
  module: PermissionModuleType;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onManage?: () => void;
  className?: string;
  trigger?: React.ReactNode;
}> = ({
  module,
  onView,
  onEdit,
  onDelete,
  onManage,
  className,
  trigger,
}) => {
  return (
    <PermissionDropdown
      module={module}
      className={className}
      trigger={trigger}
    >
      <DropdownMenuLabel>Actions</DropdownMenuLabel>
      
      {onView && (
        <PermissionDropdownItem action="read" onClick={onView}>
          View Details
        </PermissionDropdownItem>
      )}
      
      {onEdit && (
        <PermissionDropdownItem action="update" onClick={onEdit}>
          Edit
        </PermissionDropdownItem>
      )}
      
      {onManage && (
        <PermissionDropdownItem action="manage" onClick={onManage}>
          Manage
        </PermissionDropdownItem>
      )}
      
      {(onView || onEdit || onManage) && onDelete && (
        <DropdownMenuSeparator />
      )}
      
      {onDelete && (
        <PermissionDropdownItem action="delete" onClick={onDelete} destructive>
          Delete
        </PermissionDropdownItem>
      )}
    </PermissionDropdown>
  );
};

/**
 * StatusDropdown - Pre-configured dropdown for status changes
 */
export const StatusDropdown: React.FC<{
  module: PermissionModuleType;
  currentStatus: string;
  onStatusChange: (status: string) => void;
  statuses: Array<{ value: string; label: string; variant?: 'default' | 'destructive' }>;
  className?: string;
  trigger?: React.ReactNode;
}> = ({
  module,
  currentStatus,
  onStatusChange,
  statuses,
  className,
  trigger,
}) => {
  return (
    <PermissionDropdown
      module={module}
      className={className}
      trigger={trigger}
    >
      <DropdownMenuLabel>Change Status</DropdownMenuLabel>
      <DropdownMenuSeparator />
      
      {statuses.map((status) => (
        <PermissionDropdownItem
          key={status.value}
          action="update"
          onClick={() => onStatusChange(status.value)}
          destructive={status.variant === 'destructive'}
        >
          {status.label}
        </PermissionDropdownItem>
      ))}
    </PermissionDropdown>
  );
};

/**
 * BulkActionsDropdown - Pre-configured dropdown for bulk operations
 */
export const BulkActionsDropdown: React.FC<{
  module: PermissionModuleType;
  selectedCount: number;
  onBulkEdit?: () => void;
  onBulkDelete?: () => void;
  onBulkExport?: () => void;
  onBulkStatusChange?: (status: string) => void;
  availableStatuses?: Array<{ value: string; label: string }>;
  className?: string;
  trigger?: React.ReactNode;
}> = ({
  module,
  selectedCount,
  onBulkEdit,
  onBulkDelete,
  onBulkExport,
  onBulkStatusChange,
  availableStatuses = [],
  className,
  trigger,
}) => {
  if (selectedCount === 0) {
    return null;
  }
  
  return (
    <PermissionDropdown
      module={module}
      className={className}
      trigger={trigger}
    >
      <DropdownMenuLabel>
        Bulk Actions ({selectedCount} selected)
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      
      {onBulkEdit && (
        <PermissionDropdownItem action="update" onClick={onBulkEdit}>
          Bulk Edit
        </PermissionDropdownItem>
      )}
      
      {onBulkExport && (
        <PermissionDropdownItem action="export" onClick={onBulkExport}>
          Export Selected
        </PermissionDropdownItem>
      )}
      
      {availableStatuses.length > 0 && onBulkStatusChange && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
          {availableStatuses.map((status) => (
            <PermissionDropdownItem
              key={status.value}
              action="update"
              onClick={() => onBulkStatusChange(status.value)}
            >
              {status.label}
            </PermissionDropdownItem>
          ))}
        </>
      )}
      
      {onBulkDelete && (
        <>
          <DropdownMenuSeparator />
          <PermissionDropdownItem action="delete" onClick={onBulkDelete} destructive>
            Delete Selected
          </PermissionDropdownItem>
        </>
      )}
    </PermissionDropdown>
  );
};
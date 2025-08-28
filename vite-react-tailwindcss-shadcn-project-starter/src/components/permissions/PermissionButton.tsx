import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePermissions } from '../../contexts/PermissionContext';
import { PermissionButtonProps } from '../../types/permissions';
import { cn } from '@/lib/utils';

/**
 * PermissionButton - A reusable button component that handles permission checks
 * 
 * This component encapsulates all permission logic and provides a consistent
 * interface for permission-controlled buttons throughout the application.
 * 
 * @param module - The permission module to check against
 * @param action - The specific action to check permission for
 * @param children - Button content
 * @param className - Additional CSS classes
 * @param variant - Button variant (default, destructive, outline, etc.)
 * @param size - Button size (default, sm, lg, icon)
 * @param disabled - Additional disabled state (combined with permission check)
 * @param onClick - Click handler (only called if permission is granted)
 * @param fallback - Content to show when permission is denied (null = hide button)
 * @param showTooltip - Whether to show tooltip on permission denial
 * @param tooltipContent - Custom tooltip content for permission denial
 * @param ...props - Additional button props
 */
const PermissionButton: React.FC<PermissionButtonProps & React.ComponentProps<typeof Button>> = ({
  module,
  action,
  children,
  className,
  variant = 'default',
  size = 'default',
  disabled = false,
  onClick,
  fallback = null,
  showTooltip = true,
  tooltipContent,
  ...props
}) => {
  const { hasPermission } = usePermissions();
  
  // Check if user has the required permission
  const hasRequiredPermission = hasPermission(module, action);
  
  // If no permission and no fallback, don't render anything
  if (!hasRequiredPermission && fallback === null) {
    return null;
  }
  
  // If no permission but fallback is provided, render fallback
  if (!hasRequiredPermission && fallback !== null) {
    return <>{fallback}</>;
  }
  
  // Determine if button should be disabled
  const isDisabled = disabled || !hasRequiredPermission;
  
  // Default tooltip content for permission denial
  const defaultTooltipContent = `You don't have permission to ${action} ${module.toLowerCase()}`;
  const finalTooltipContent = tooltipContent || defaultTooltipContent;
  
  // Handle click with permission check
  const handleClick = () => {
    if (hasRequiredPermission && onClick) {
      onClick();
    }
  };
  
  // Button component
  const buttonComponent = (
    <Button
      variant={variant}
      size={size}
      disabled={isDisabled}
      onClick={handleClick}
      className={cn(className)}
      {...props}
    >
      {children}
    </Button>
  );
  
  // If permission denied and tooltip should be shown, wrap with tooltip
  if (!hasRequiredPermission && showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {buttonComponent}
          </TooltipTrigger>
          <TooltipContent>
            <p>{finalTooltipContent}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return buttonComponent;
};

// Export with display name for debugging
PermissionButton.displayName = 'PermissionButton';

export default PermissionButton;

// Convenience wrapper components for common use cases

/**
 * CreateButton - Pre-configured button for create actions
 */
export const CreateButton: React.FC<Omit<PermissionButtonProps, 'action'> & React.ComponentProps<typeof Button>> = ({
  module,
  children,
  ...props
}) => (
  <PermissionButton
    module={module}
    action="create"
    variant="default"
    {...props}
  >
    {children}
  </PermissionButton>
);

/**
 * EditButton - Pre-configured button for edit/update actions
 */
export const EditButton: React.FC<Omit<PermissionButtonProps, 'action'> & React.ComponentProps<typeof Button>> = ({
  module,
  children,
  ...props
}) => (
  <PermissionButton
    module={module}
    action="update"
    variant="outline"
    size="sm"
    {...props}
  >
    {children}
  </PermissionButton>
);

/**
 * DeleteButton - Pre-configured button for delete actions
 */
export const DeleteButton: React.FC<Omit<PermissionButtonProps, 'action'> & React.ComponentProps<typeof Button>> = ({
  module,
  children,
  ...props
}) => (
  <PermissionButton
    module={module}
    action="delete"
    variant="destructive"
    size="sm"
    {...props}
  >
    {children}
  </PermissionButton>
);

/**
 * ViewButton - Pre-configured button for view/read actions
 */
export const ViewButton: React.FC<Omit<PermissionButtonProps, 'action'> & React.ComponentProps<typeof Button>> = ({
  module,
  children,
  ...props
}) => (
  <PermissionButton
    module={module}
    action="read"
    variant="ghost"
    size="sm"
    {...props}
  >
    {children}
  </PermissionButton>
);

/**
 * ExportButton - Pre-configured button for export actions
 */
export const ExportButton: React.FC<Omit<PermissionButtonProps, 'action'> & React.ComponentProps<typeof Button>> = ({
  module,
  children,
  ...props
}) => (
  <PermissionButton
    module={module}
    action="export"
    variant="outline"
    size="sm"
    {...props}
  >
    {children}
  </PermissionButton>
);

/**
 * ManageButton - Pre-configured button for manage actions
 */
export const ManageButton: React.FC<Omit<PermissionButtonProps, 'action'> & React.ComponentProps<typeof Button>> = ({
  module,
  children,
  ...props
}) => (
  <PermissionButton
    module={module}
    action="manage"
    variant="secondary"
    {...props}
  >
    {children}
  </PermissionButton>
);

/**
 * ApproveButton - Pre-configured button for approve actions
 */
export const ApproveButton: React.FC<Omit<PermissionButtonProps, 'action'> & React.ComponentProps<typeof Button>> = ({
  module,
  children,
  ...props
}) => (
  <PermissionButton
    module={module}
    action="approve"
    variant="default"
    {...props}
  >
    {children}
  </PermissionButton>
);
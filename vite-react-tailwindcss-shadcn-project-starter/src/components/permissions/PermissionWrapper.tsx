import React from 'react';
import { usePermissions } from '../../contexts/PermissionContext';
import {
  PermissionModuleType,
  PermissionAction,
  RequiredPermission,
} from '../../types/permissions';

interface PermissionWrapperProps {
  children: React.ReactNode;
  module?: PermissionModuleType;
  action?: PermissionAction;
  permissions?: RequiredPermission[];
  requireAll?: boolean; // true = AND logic, false = OR logic
  fallback?: React.ReactNode;
  className?: string;
}

/**
 * PermissionWrapper - A flexible wrapper component for permission-controlled content
 * 
 * This component can wrap any content and show/hide it based on permission checks.
 * It supports both single permission checks and multiple permission checks with AND/OR logic.
 * 
 * @param children - Content to show when permission is granted
 * @param module - Single module to check (used with action)
 * @param action - Single action to check (used with module)
 * @param permissions - Array of permissions to check (alternative to module/action)
 * @param requireAll - Whether all permissions are required (AND) or any (OR). Default: true
 * @param fallback - Content to show when permission is denied (null = hide completely)
 * @param className - CSS classes to apply to wrapper
 */
const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  children,
  module,
  action,
  permissions,
  requireAll = true,
  fallback = null,
  className,
}) => {
  const { hasPermission } = usePermissions();
  
  let hasRequiredPermission = false;
  
  // Single permission check
  if (module) {
    hasRequiredPermission = hasPermission(module, action);
  }
  // Multiple permissions check
  else if (permissions && permissions.length > 0) {
    if (requireAll) {
      // AND logic - all permissions must be granted
      hasRequiredPermission = permissions.every(({ module: permModule, action: permAction }) =>
        hasPermission(permModule, permAction)
      );
    } else {
      // OR logic - at least one permission must be granted
      hasRequiredPermission = permissions.some(({ module: permModule, action: permAction }) =>
        hasPermission(permModule, permAction)
      );
    }
  }
  // No permission specified - always show
  else {
    hasRequiredPermission = true;
  }
  
  // If no permission and no fallback, don't render anything
  if (!hasRequiredPermission && fallback === null) {
    return null;
  }
  
  // If no permission but fallback is provided, render fallback
  if (!hasRequiredPermission && fallback !== null) {
    return (
      <div className={className}>
        {fallback}
      </div>
    );
  }
  
  // Render children with permission granted
  return (
    <div className={className}>
      {children}
    </div>
  );
};

// Export with display name
PermissionWrapper.displayName = 'PermissionWrapper';

export default PermissionWrapper;

// Convenience wrapper components for common patterns

/**
 * AdminOnly - Wrapper that only shows content to admin users
 */
export const AdminOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}> = ({ children, fallback = null, className }) => {
  const { user } = usePermissions();
  const isAdmin = user?.Role?.roleName?.toLowerCase() === 'admin' || 
                  user?.Role?.roleName?.toLowerCase() === 'superadmin';
  
  if (!isAdmin && fallback === null) {
    return null;
  }
  
  if (!isAdmin && fallback !== null) {
    return <div className={className}>{fallback}</div>;
  }
  
  return <div className={className}>{children}</div>;
};

/**
 * ManagerOrAbove - Wrapper that shows content to managers and admins
 */
export const ManagerOrAbove: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}> = ({ children, fallback = null, className }) => {
  const { user } = usePermissions();
  const userRole = user?.Role?.roleName?.toLowerCase();
  const isManagerOrAbove = userRole === 'admin' || 
                          userRole === 'superadmin' || 
                          userRole === 'manager';
  
  if (!isManagerOrAbove && fallback === null) {
    return null;
  }
  
  if (!isManagerOrAbove && fallback !== null) {
    return <div className={className}>{fallback}</div>;
  }
  
  return <div className={className}>{children}</div>;
};

/**
 * CreatePermission - Wrapper for create permission checks
 */
export const CreatePermission: React.FC<{
  module: PermissionModuleType;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}> = ({ module, children, fallback = null, className }) => (
  <PermissionWrapper
    module={module}
    action="create"
    fallback={fallback}
    className={className}
  >
    {children}
  </PermissionWrapper>
);

/**
 * EditPermission - Wrapper for edit/update permission checks
 */
export const EditPermission: React.FC<{
  module: PermissionModuleType;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}> = ({ module, children, fallback = null, className }) => (
  <PermissionWrapper
    module={module}
    action="update"
    fallback={fallback}
    className={className}
  >
    {children}
  </PermissionWrapper>
);

/**
 * DeletePermission - Wrapper for delete permission checks
 */
export const DeletePermission: React.FC<{
  module: PermissionModuleType;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}> = ({ module, children, fallback = null, className }) => (
  <PermissionWrapper
    module={module}
    action="delete"
    fallback={fallback}
    className={className}
  >
    {children}
  </PermissionWrapper>
);

/**
 * ViewPermission - Wrapper for view/read permission checks
 */
export const ViewPermission: React.FC<{
  module: PermissionModuleType;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}> = ({ module, children, fallback = null, className }) => (
  <PermissionWrapper
    module={module}
    action="read"
    fallback={fallback}
    className={className}
  >
    {children}
  </PermissionWrapper>
);

/**
 * ExportPermission - Wrapper for export permission checks
 */
export const ExportPermission: React.FC<{
  module: PermissionModuleType;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}> = ({ module, children, fallback = null, className }) => (
  <PermissionWrapper
    module={module}
    action="export"
    fallback={fallback}
    className={className}
  >
    {children}
  </PermissionWrapper>
);

/**
 * ManagePermission - Wrapper for manage permission checks
 */
export const ManagePermission: React.FC<{
  module: PermissionModuleType;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}> = ({ module, children, fallback = null, className }) => (
  <PermissionWrapper
    module={module}
    action="manage"
    fallback={fallback}
    className={className}
  >
    {children}
  </PermissionWrapper>
);
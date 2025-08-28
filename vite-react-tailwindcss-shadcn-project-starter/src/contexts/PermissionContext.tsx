import React, { createContext, useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../stores/slices/authSlice';
import {
  AuthUser,
  PermissionAction,
  PermissionModuleType,
  PermissionSet,
  PermissionContextType,
  PermissionProviderProps,
} from '../types/permissions';

// Create the permission context
const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

// Custom hook to use permission context
export const usePermissions = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

// Permission Provider Component
export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  const user = useSelector(selectCurrentUser) as AuthUser | null;
  const isLoading = false; // You can add loading state logic here if needed

  // Core permission checking function
  const hasPermission = useMemo(() => {
    return (module: PermissionModuleType, action?: PermissionAction): boolean => {
      // Always allow access if no user (for public routes)
      if (!user) {
        return false;
      }

      // Super admin or admin role bypass
      const userRole = user.Role?.roleName?.toLowerCase();
      if (userRole === 'superadmin' || userRole === 'admin') {
        return true;
      }

      // Check if user has role and permissions
      if (!user.Role || !user.Role.permissions) {
        return false;
      }

      // Find the specific permission for the module
      const permission = user.Role.permissions.find(
        (perm) => perm?.name === module || (perm.name && perm?.name?.toLowerCase() === module?.toLowerCase())
      );

      // If no permission found for module, deny access
      if (!permission) {
        return false;
      }

      // If no specific action required, just check if permission exists
      if (!action) {
        return true;
      }

      // Check if the specific action is allowed
      return permission.actions.includes(action);
    };
  }, [user]);

  // Get complete permission set for a module
  const getPermissionSet = useMemo(() => {
    return (module: PermissionModuleType): PermissionSet => {
      const defaultPermissionSet: PermissionSet = {
        create: false,
        read: false,
        update: false,
        delete: false,
        manage: false,
        ledger: false,
        approve: false,
        export: false,
        import: false,
        view: false,
        edit: false,
      };

      // Return all false if no user
      if (!user || !user.Role || !user.Role.permissions) {
        return defaultPermissionSet;
      }

      // Super admin gets all permissions
      const userRole = user.Role.roleName?.toLowerCase();
      if (userRole === 'superadmin' || userRole === 'admin') {
        return {
          create: true,
          read: true,
          update: true,
          delete: true,
          manage: true,
          ledger: true,
          approve: true,
          export: true,
          import: true,
          view: true,
          edit: true,
        };
      }

      // Find the specific permission for the module
      const permission = user.Role.permissions.find(
        (perm) => perm.name === module || (perm.name && perm.name.toLowerCase() === module.toLowerCase())
      );

      if (!permission) {
        return defaultPermissionSet;
      }

      // Build permission set based on available actions
      const permissionSet: PermissionSet = {
        create: permission.actions.includes('create'),
        read: permission.actions.includes('read'),
        update: permission.actions.includes('update'),
        delete: permission.actions.includes('delete'),
        manage: permission.actions.includes('manage'),
        ledger: permission.actions.includes('ledger'),
        approve: permission.actions.includes('approve'),
        export: permission.actions.includes('export'),
        import: permission.actions.includes('import'),
        view: permission.actions.includes('view') || permission.actions.includes('read'),
        edit: permission.actions.includes('edit') || permission.actions.includes('update'),
      };

      return permissionSet;
    };
  }, [user]);

  const contextValue: PermissionContextType = {
    user,
    hasPermission,
    getPermissionSet,
    isLoading,
  };

  return (
    <PermissionContext.Provider value={contextValue}>
      {children}
    </PermissionContext.Provider>
  );
};

// Utility hooks for common permission patterns

// Hook to get user role
export const useUserRole = (): string => {
  const { user } = usePermissions();
  return user?.Role?.roleName?.toLowerCase() || '';
};

// Hook to get user permissions for a specific module
export const useModulePermissions = (module: PermissionModuleType) => {
  const { getPermissionSet } = usePermissions();
  return useMemo(() => getPermissionSet(module), [getPermissionSet, module]);
};

// Hook to check if user has specific permission
export const useHasPermission = (module: PermissionModuleType, action?: PermissionAction): boolean => {
  const { hasPermission } = usePermissions();
  return useMemo(() => hasPermission(module, action), [hasPermission, module, action]);
};

// Hook to check multiple permissions at once
export const useHasPermissions = (permissions: Array<{ module: PermissionModuleType; action?: PermissionAction }>): boolean => {
  const { hasPermission } = usePermissions();
  return useMemo(() => {
    return permissions.every(({ module, action }) => hasPermission(module, action));
  }, [hasPermission, permissions]);
};

// Hook to check if user has any of the specified permissions
export const useHasAnyPermission = (permissions: Array<{ module: PermissionModuleType; action?: PermissionAction }>): boolean => {
  const { hasPermission } = usePermissions();
  return useMemo(() => {
    return permissions.some(({ module, action }) => hasPermission(module, action));
  }, [hasPermission, permissions]);
};

// Export the context for direct usage if needed
export { PermissionContext };
export default PermissionProvider;
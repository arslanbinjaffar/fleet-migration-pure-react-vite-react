import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../stores/slices/authSlice';
import type { AuthUser } from '../types/permissions';

/**
 * Custom hook to get the current authenticated user
 * @returns Current user object or null if not authenticated
 */
export const useCurrentUser = (): AuthUser | null => {
  return useSelector(selectCurrentUser) as AuthUser | null;
};

/**
 * Custom hook to get the current user's role
 * @returns User role string or 'admin' as default
 */
export const useCurrentUserRole = (): string => {
  const user = useCurrentUser();
  return user?.Role?.roleName?.toLowerCase() || 'admin';
};

/**
 * Custom hook to get the current user's permissions
 * @returns Array of user permissions or empty array
 */
export const useCurrentUserPermissions = (): string[] => {
  const user = useCurrentUser();
  return user?.Role?.permissions || [];
};

/**
 * Custom hook to check if user has a specific permission
 * @param permission - Permission to check
 * @returns Boolean indicating if user has the permission
 */
export const useHasPermission = (permission: string): boolean => {
  const permissions = useCurrentUserPermissions();
  return permissions.includes(permission);
};

/**
 * Custom hook to check if user has any of the specified permissions
 * @param permissions - Array of permissions to check
 * @returns Boolean indicating if user has any of the permissions
 */
export const useHasAnyPermission = (permissions: string[]): boolean => {
  const userPermissions = useCurrentUserPermissions();
  return permissions.some(permission => userPermissions.includes(permission));
};

/**
 * Custom hook to check if user has all of the specified permissions
 * @param permissions - Array of permissions to check
 * @returns Boolean indicating if user has all of the permissions
 */
export const useHasAllPermissions = (permissions: string[]): boolean => {
  const userPermissions = useCurrentUserPermissions();
  return permissions.every(permission => userPermissions.includes(permission));
};

/**
 * Custom hook to get user's full name
 * @returns Full name string or 'Unknown User' if not available
 */
export const useCurrentUserName = (): string => {
  const user = useCurrentUser();
  if (!user) return 'Unknown User';
  
  const firstName = user.firstName || user.firstname || '';
  const lastName = user.lastName || user.lastname || '';
  
  return `${firstName} ${lastName}`.trim() || user.email || 'Unknown User';
};

/**
 * Custom hook to check if user is authenticated
 * @returns Boolean indicating if user is authenticated
 */
export const useIsAuthenticated = (): boolean => {
  const user = useCurrentUser();
  return !!user;
};

/**
 * Custom hook to get user's ID
 * @returns User ID or null if not available
 */
export const useCurrentUserId = (): string | null => {
  const user = useCurrentUser();
  return user?.id || user?.userId || null;
};

/**
 * Custom hook to check if user has a specific role
 * @param role - Role to check (case insensitive)
 * @returns Boolean indicating if user has the role
 */
export const useHasRole = (role: string): boolean => {
  const userRole = useCurrentUserRole();
  return userRole.toLowerCase() === role.toLowerCase();
};

/**
 * Custom hook to check if user has any of the specified roles
 * @param roles - Array of roles to check (case insensitive)
 * @returns Boolean indicating if user has any of the roles
 */
export const useHasAnyRole = (roles: string[]): boolean => {
  const userRole = useCurrentUserRole();
  return roles.some(role => role.toLowerCase() === userRole.toLowerCase());
};

export default useCurrentUser;
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../stores/slices/authSlice';
import type { AuthUser } from './role';

/**
 * Custom hook for role-based navigation
 * Automatically prepends the user's role to all navigation paths
 * 
 * Usage:
 * const navigate = useRoleBasedNavigation();
 * navigate('/fleet/create'); // Automatically becomes '/admin/fleet/create' if user is admin
 * navigate('/dashboard'); // Becomes '/admin/dashboard'
 * 
 * For absolute paths (without role prefix), use the absolute option:
 * navigate('/login', { absolute: true }); // Goes to '/login' without role prefix
 */
export const useRoleBasedNavigation = () => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser) as AuthUser | null;
  
  // Get user role, default to 'admin' if not available
  const userRole = user?.Role?.roleName?.toLowerCase() || 'admin';
  
  return (path: string, options?: { absolute?: boolean; replace?: boolean; state?: any }) => {
    const { absolute = false, replace = false, state } = options || {};
    
    // If absolute is true, navigate without role prefix
    if (absolute) {
      navigate(path, { replace, state });
      return;
    }
    
    // If path already starts with a role (contains slash after first character), use as-is
    if (path.startsWith('/') && path.indexOf('/', 1) > 0) {
      const potentialRole = path.substring(1, path.indexOf('/', 1));
      // Check if it's likely a role (common roles: admin, manager, employee, user)
      const commonRoles = ['admin', 'manager', 'employee', 'user', 'superadmin'];
      if (commonRoles.includes(potentialRole.toLowerCase())) {
        navigate(path, { replace, state });
        return;
      }
    }
    
    // Remove leading slash if present to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    
    // Construct the full path with role prefix
    const fullPath = `/${userRole}/${cleanPath}`;
    
    navigate(fullPath, { replace, state });
  };
};

/**
 * Utility function to get role-based path without navigation
 * Useful for building URLs or links
 * 
 * Usage:
 * const path = getRoleBasedPath('/fleet/create'); // Returns '/admin/fleet/create'
 * const absolutePath = getRoleBasedPath('/login', { absolute: true }); // Returns '/login'
 */
export const getRoleBasedPath = (path: string, options?: { absolute?: boolean }) => {
  // This function needs to be used within a component to access Redux state
  // For static usage, consider using a different approach or passing the role as parameter
  throw new Error('getRoleBasedPath must be used within a React component. Use useRoleBasedPath hook instead.');
};

/**
 * Hook version of getRoleBasedPath that can access Redux state
 */
export const useRoleBasedPath = () => {
  const user = useSelector(selectCurrentUser) as AuthUser | null;
  const userRole = user?.Role?.roleName?.toLowerCase() || 'admin';
  
  return (path: string, options?: { absolute?: boolean }) => {
    const { absolute = false } = options || {};
    
    if (absolute) {
      return path;
    }
    
    // If path already starts with a role, use as-is
    if (path.startsWith('/') && path.indexOf('/', 1) > 0) {
      const potentialRole = path.substring(1, path.indexOf('/', 1));
      const commonRoles = ['admin', 'manager', 'employee', 'user', 'superadmin'];
      if (commonRoles.includes(potentialRole.toLowerCase())) {
        return path;
      }
    }
    
    // Remove leading slash if present to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    
    // Construct the full path with role prefix
    return `/${userRole}/${cleanPath}`;
  };
};

/**
 * Higher-order component to provide role-based navigation context
 * This can be used to wrap components that need role-based navigation
 */
export const withRoleBasedNavigation = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => {
    const navigate = useRoleBasedNavigation();
    const getRolePath = useRoleBasedPath();
    
    return React.createElement(Component, {
      ...props,
      navigate,
      getRolePath,
    } as P);
  };
};

/**
 * Utility to extract the base route without role prefix
 * Useful for determining the current page/module
 * 
 * Usage:
 * extractBaseRoute('/admin/fleet/create') // Returns '/fleet/create'
 * extractBaseRoute('/manager/dashboard') // Returns '/dashboard'
 */
export const extractBaseRoute = (fullPath: string): string => {
  if (!fullPath.startsWith('/')) {
    return fullPath;
  }
  
  const parts = fullPath.split('/');
  if (parts.length < 3) {
    return fullPath;
  }
  
  // Remove the first empty string and the role
  const baseRoute = '/' + parts.slice(2).join('/');
  return baseRoute;
};

/**
 * Get current user role
 * Utility function to get the current user's role
 */
export const useCurrentUserRole = (): string => {
  const user = useSelector(selectCurrentUser) as AuthUser | null;
  return user?.Role?.roleName?.toLowerCase() || 'admin';
};

export default useRoleBasedNavigation;
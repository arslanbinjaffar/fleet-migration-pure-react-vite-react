import { useSelector } from "react-redux";
import { useNavigate, NavigateOptions } from "react-router-dom";
import { selectCurrentUser } from "../stores/slices/authSlice";
import type { AuthUser } from "../types/permissions";

/**
 * Custom hook for role-based navigation
 * Automatically prepends the user's role to all navigation paths
 */
const useRoleNavigation = () => {
  const user = useSelector(selectCurrentUser) as AuthUser | null;
  const navigate = useNavigate();
  const userRole = user?.Role?.roleName?.toLowerCase() || "admin";

  /**
   * Navigate to a path with automatic role prefixing
   * @param path - The path to navigate to (without role prefix)
   * @param options - Navigation options (replace, state, etc.)
   */
  const roleNavigate = (path: string, options?: NavigateOptions) => {
    // Handle absolute paths (starting with /)
    let cleanPath = path;
    if (path.startsWith("/")) {
      cleanPath = path.slice(1);
    }
    
    // Don't add role prefix if path already starts with a role or is a special route
    const specialRoutes = ["login", "page-error-400", "page-error-403", "page-error-404", "page-error-500", "page-error-503"];
    const isSpecialRoute = specialRoutes.some(route => cleanPath.startsWith(route));
    const alreadyHasRole = cleanPath.startsWith(`${userRole}/`);
    
    if (isSpecialRoute || alreadyHasRole) {
      navigate(`/${cleanPath}`, options);
    } else {
      navigate(`/${userRole}/${cleanPath}`, options);
    }
  };

  /**
   * Navigate back in history
   * @param delta - Number of steps to go back (default: -1)
   */
  const goBack = (delta: number = -1) => {
    navigate(delta);
  };

  /**
   * Replace current route with role-based path
   * @param path - The path to replace with
   */
  const replaceWith = (path: string) => {
    roleNavigate(path, { replace: true });
  };

  /**
   * Get the current user role
   */
  const getCurrentRole = () => userRole;

  /**
   * Build a role-prefixed path without navigating
   * @param path - The path to build
   * @returns The complete role-prefixed path
   */
  const buildRolePath = (path: string): string => {
    let cleanPath = path;
    if (path.startsWith("/")) {
      cleanPath = path.slice(1);
    }
    return `/${userRole}/${cleanPath}`;
  };

  return {
    roleNavigate,
    goBack,
    replaceWith,
    getCurrentRole,
    buildRolePath,
    // Backward compatibility
    navigate: roleNavigate,
  };
};

export default useRoleNavigation;

// Export individual functions for convenience
export { useRoleNavigation };

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/stores/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  fallbackPath = '/login'
}) => {
  const location = useLocation();
  const { isAuthenticated, user, token } = useSelector((state: RootState) => state.auth);

  // Check if user is authenticated
  if (!isAuthenticated || !token || !user) {
    // Redirect to login with the current location
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check if user has required roles (if specified)
  if (requiredRoles.length > 0 && user.role) {
    const userRole = user.role.toLowerCase();
    const hasRequiredRole = requiredRoles.some(role => 
      role.toLowerCase() === userRole
    );

    if (!hasRequiredRole) {
      // Redirect to unauthorized page or dashboard based on user role
      const unauthorizedPath = getUserDashboardPath(userRole);
      return <Navigate to={unauthorizedPath} replace />;
    }
  }

  // User is authenticated and has required permissions
  return <>{children}</>;
};

// Helper function to get dashboard path based on user role
const getUserDashboardPath = (role: string): string => {
  switch (role.toLowerCase()) {
    case 'admin':
    case 'super_admin':
      return '/admin/dashboard';
    case 'manager':
      return '/manager/dashboard';
    case 'employee':
      return '/employee/dashboard';
    case 'hr':
      return '/hr/dashboard';
    default:
      return '/dashboard';
  }
};

export default ProtectedRoute;
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/stores/store';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
}

const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectPath
}) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // If user is authenticated, redirect to appropriate dashboard
  if (isAuthenticated && user) {
    const dashboardPath = redirectPath || getUserDashboardPath(user.role);
    return <Navigate to={dashboardPath} replace />;
  }

  // User is not authenticated, show the public route (login, register, etc.)
  return <>{children}</>;
};

// Helper function to get dashboard path based on user role
const getUserDashboardPath = (role: string): string => {
  switch (role?.toLowerCase()) {
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

export default PublicRoute;
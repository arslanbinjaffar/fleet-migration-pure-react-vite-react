import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectToken } from '../stores/slices/authSlice';
import AuthRequired from '../features/AuthRequired';
import MainLayout from '../layouts/MainLayout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import type { AuthUser } from '../utils/role';
import { filterRoutes } from '@/config/routes';

// Error pages
const Error400 = () => <div className="min-h-screen flex items-center justify-center"><h1 className="text-4xl font-bold">400 - Bad Request</h1></div>;
const Error403 = () => <div className="min-h-screen flex items-center justify-center"><h1 className="text-4xl font-bold">403 - Forbidden</h1></div>;
const Error404 = () => <div className="min-h-screen flex items-center justify-center"><h1 className="text-4xl font-bold">404 - Not Found</h1></div>;
const Error500 = () => <div className="min-h-screen flex items-center justify-center"><h1 className="text-4xl font-bold">500 - Internal Server Error</h1></div>;
const Error503 = () => <div className="min-h-screen flex items-center justify-center"><h1 className="text-4xl font-bold">503 - Service Unavailable</h1></div>;

const capitalizeFirstLetter = (string: string): string => {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

// Improved NotFound component to handle dynamic routes
function NotFound() {
  return <Error404 />;
}

const AppRoutes: React.FC = () => {
  const user = useSelector(selectCurrentUser) as AuthUser | null;
  const token = useSelector(selectToken);
  
  // Get user role and permissions for routing
  const userRole = user?.Role?.roleName?.toLowerCase() || "admin";
  const capitalizedRole = capitalizeFirstLetter(userRole);
  const userPermissions = user?.Role?.permissions || [];
  
  // Get filtered routes based on user permissions
  const dynamicRoutes = filterRoutes(userPermissions, userRole);
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={!token ? <Login /> : <Navigate to={`/${userRole}/dashboard`} replace />} />
      <Route path="/login" element={!token ? <Login /> : <Navigate to={`/${userRole}/dashboard`} replace />} />
      
      {/* Error Pages - Accessible without authentication */}
      <Route path="/page-error-400" element={<Error400 />} />
      <Route path="/page-error-403" element={<Error403 />} />
      <Route path="/page-error-404" element={<Error404 />} />
      <Route path="/page-error-500" element={<Error500 />} />
      <Route path="/page-error-503" element={<Error503 />} />
      
      {/* Protected Routes */}
      <Route
        path={`/${userRole}`}
        element={
          <AuthRequired allowedRoles={[capitalizedRole]} />
        }
      >
        <Route element={<MainLayout />}>
          {/* Default dashboard route */}
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="welcome" element={<Dashboard />} />
          
          {/* Dynamic routes based on user permissions */}
          {dynamicRoutes}
          
          {/* Catch-all for undefined routes within user role */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
      
      {/* Catch-all for invalid routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
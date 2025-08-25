import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PublicRoute from '@/components/auth/PublicRoute';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import MainLayout from '@/layouts/MainLayout';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
      {/* Public Routes - Redirect to dashboard if authenticated */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      
      {/* Protected Routes - Require authentication */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Role-based Protected Routes */}
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute requiredRoles={['admin', 'super_admin']}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/manager/dashboard" 
        element={
          <ProtectedRoute requiredRoles={['manager', 'admin', 'super_admin']}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/employee/dashboard" 
        element={
          <ProtectedRoute requiredRoles={['employee', 'manager', 'admin', 'super_admin']}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/hr/dashboard" 
        element={
          <ProtectedRoute requiredRoles={['hr', 'admin', 'super_admin']}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Catch all route - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
      </Route>

    </Routes>
  );
};

export default AppRoutes;
import React from 'react';

// Dashboard Components
import { Dashboard } from './components';

// Route definitions for dashboard module
export const dashboardRoutes = [
  {
    url: "dashboard",
    component: <Dashboard />,
    module: "Dashboard",
    name: "Dashboard",
    access: ["admin", "employee", "manager"],
    action: ["read"],
  },
  {
    url: "", // Root route - redirect to dashboard
    component: <Dashboard />,
    module: "Dashboard",
    name: "Home",
    access: ["admin", "employee", "manager"],
    action: ["read"],
  },
];

// Export for easy integration with main routing system
export default dashboardRoutes;
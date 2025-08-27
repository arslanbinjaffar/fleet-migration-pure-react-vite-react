import React from 'react';
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';

// Fleet Management Components
import FleetList from '@/modules/fleet/components/FleetList';
import FleetView from '@/modules/fleet/components/FleetView';
import FleetEdit from '@/modules/fleet/components/FleetEdit';
import FleetCreate from '@/modules/fleet/components/FleetCreate';

// Error Pages
import Error400 from '@/pages/Error400';
import Error403 from '@/pages/Error403';
import Error404 from '@/pages/Error404';
import Error500 from '@/pages/Error500';

// Route interface
export interface RouteConfig {
  url: string;
  component: React.ReactElement;
  module: string;
  name: string;
  access: string[];
  action: string[];
}

// All routes configuration - similar to old system
export const allRoutes: RouteConfig[] = [
  // Dashboard Routes
  {
    url: "welcome",
    component: <Dashboard />,
    module: "GENERAL",
    name: "welcome",
    access: [],
    action: ["read"]
  },
  {
    url: "dashboard",
    component: <Dashboard />,
    module: "GENERAL",
    name: "Dashboard",
    access: [],
    action: ["read"]
  },
  
  // Fleet Management Routes
  {
    url: "fleet",
    component: <FleetList />,
    module: "MRM",
    name: "Fleet",
    access: ["admin"],
    action: ["create", "read", "update", "delete"]
  },
  {
    url: "fleet/create",
    component: <FleetCreate />,
    module: "MRM",
    name: "Fleet",
    access: ["admin"],
    action: ["create"]
  },
  {
    url: "fleet/view/:fleetId",
    component: <FleetView />,
    module: "MRM",
    name: "Fleet",
    access: ["admin"],
    action: ["read"]
  },
  {
    url: "fleet/edit/:fleetId",
    component: <FleetEdit />,
    module: "MRM",
    name: "Fleet",
    access: ["admin"],
    action: ["update"]
  },
  
  // Add more routes as needed...
  // LPOS Routes
  {
    url: "lpos",
    component: <div>LPOS List Component</div>, // Placeholder
    module: "MRM",
    name: "LPOS",
    access: ["admin"],
    action: ["create", "read", "update", "delete"]
  },
  
  // Timesheets Routes
  {
    url: "scheduled",
    component: <div>Timesheets Component</div>, // Placeholder
    module: "MRM",
    name: "Timesheets",
    access: ["admin"],
    action: ["create", "read", "update", "delete"]
  },
  
  // Customers Routes
  {
    url: "customer",
    component: <div>Customer List Component</div>, // Placeholder
    module: "MRM",
    name: "Customers",
    access: ["admin"],
    action: ["create", "read", "update", "delete"]
  },
  
  // Fleet Type Routes
  {
    url: "fleet-type",
    component: <div>Fleet Type Component</div>, // Placeholder
    module: "MRM",
    name: "FleetType",
    access: ["admin"],
    action: ["create", "read", "update", "delete"]
  },
  
  // Site Project Routes
  {
    url: "site-project",
    component: <div>Site Project Component</div>, // Placeholder
    module: "MRM",
    name: "SiteProject",
    access: ["admin"],
    action: ["create", "read", "update", "delete"]
  },
  
  // Jobs Routes
  {
    url: "jobs",
    component: <div>Jobs Component</div>, // Placeholder
    module: "GOM",
    name: "Jobs",
    access: ["admin"],
    action: ["create", "read", "update", "delete"]
  },
  
  // Repairs Routes
  {
    url: "repairs",
    component: <div>Repairs Component</div>, // Placeholder
    module: "GOM",
    name: "Repairs",
    access: ["admin"],
    action: ["create", "read", "update", "delete"]
  },
];

// Utility function to capitalize first letter
export const capitalizeFirstLetter = (string: string): string => {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

// Filter routes based on user permissions - similar to old system
export const filterRoutes = (routes: RouteConfig[], userPermissions: any[] = [], userRole?: string): RouteConfig[] => {
  const IGNORED_ROUTES = ["profile", "login", "welcome", "dashboard"];
  
  return routes.filter((route) => {
    // Always allow ignored routes
    if (IGNORED_ROUTES.some(ignored => route.url.includes(ignored))) {
      return true;
    }
    
    // If no permissions available, deny access
    if (!userRole || !userPermissions || userPermissions.length === 0) {
      return false;
    }
    
    // Check if user has permission for the route
    return userPermissions.some((permission: any) =>
      route.action.some((action) => permission?.actions?.includes(action))
    );
  });
};
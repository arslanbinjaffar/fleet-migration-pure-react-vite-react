import React, { ReactElement } from "react";
import { Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import { FleetList, FleetView, FleetEdit } from "../modules/fleet/components";
import { LposList, LposView, LposEdit, LposCreate } from "../modules/lpos";
import { CustomerList, CustomerCreate, CustomerEdit, CustomerView, CustomerLedger } from "../modules/customer";

// Fleet Components
import FleetCreate from '@/modules/fleet/components/FleetCreate';

// Error Pages - Define inline components since separate files don't exist
const Error400 = () => <div className="min-h-screen flex items-center justify-center"><h1 className="text-4xl font-bold">400 - Bad Request</h1></div>;
const Error403 = () => <div className="min-h-screen flex items-center justify-center"><h1 className="text-4xl font-bold">403 - Forbidden</h1></div>;
const Error404 = () => <div className="min-h-screen flex items-center justify-center"><h1 className="text-4xl font-bold">404 - Not Found</h1></div>;
const Error500 = () => <div className="min-h-screen flex items-center justify-center"><h1 className="text-4xl font-bold">500 - Internal Server Error</h1></div>;

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
    component: <LposList />,
    module: "MRM",
    name: "LPOS",
    access: ["admin", "manager", "employee"],
    action: ["create", "read", "update", "delete"]
  },
  {
    url: "lpos/create",
    component: <LposCreate />,
    module: "MRM",
    name: "Create LPO",
    access: ["admin", "manager"],
    action: ["create"]
  },
  {
    url: "lpos/:id",
    component: <LposView />,
    module: "MRM",
    name: "View LPO",
    access: ["admin", "manager", "employee"],
    action: ["read"]
  },
  {
    url: "lpos/:id/edit",
    component: <LposEdit />,
    module: "MRM",
    name: "Edit LPO",
    access: ["admin", "manager"],
    action: ["update"]
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
  
  // Customer Management Routes
  {
    url: "customer",
    component: <CustomerList />,
    module: "MRM",
    name: "Customers",
    access: ["admin", "manager"],
    action: ["create", "read", "update", "delete"]
  },
  {
    url: "customer/create",
    component: <CustomerCreate />,
    module: "MRM",
    name: "Create Customer",
    access: ["admin", "manager"],
    action: ["create"]
  },
  {
    url: "customer/view/:customerId",
    component: <CustomerView />,
    module: "MRM",
    name: "View Customer",
    access: ["admin", "manager", "employee"],
    action: ["read"]
  },
  {
    url: "customer/edit/:customerId",
    component: <CustomerEdit />,
    module: "MRM",
    name: "Edit Customer",
    access: ["admin", "manager"],
    action: ["update"]
  },
  {
    url: "customer/ledger/:customerId",
    component: <CustomerLedger />,
    module: "MRM",
    name: "Customer Ledger",
    access: ["admin", "manager"],
    action: ["read", "create"]
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
  
  // Error Page Routes
  {
    url: "page-error-400",
    component: <Error400 />,
    module: "ERROR",
    name: "Error 400",
    access: [],
    action: ["read"]
  },
  {
    url: "page-error-403",
    component: <Error403 />,
    module: "ERROR",
    name: "Error 403",
    access: [],
    action: ["read"]
  },
  {
    url: "page-error-404",
    component: <Error404 />,
    module: "ERROR",
    name: "Error 404",
    access: [],
    action: ["read"]
  },
  {
    url: "page-error-500",
    component: <Error500 />,
    module: "ERROR",
    name: "Error 500",
    access: [],
    action: ["read"]
  },
];

// Utility function to capitalize first letter
export const capitalizeFirstLetter = (string: string): string => {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

// Filter routes based on user permissions and return React Route elements
export const filterRoutes = (userPermissions: any[] = [], userRole?: string): React.ReactElement[] => {
  const IGNORED_ROUTES = ["profile", "login", "welcome", "dashboard", "page-error"];
  const routes: RouteConfig[] = allRoutes;
  
  const filteredRoutes = routes.filter((route) => {
    // Always allow ignored routes and error pages
    if (IGNORED_ROUTES.some(ignored => route.url.includes(ignored))) {
      return true;
    }
    
    // If no permissions available, only allow basic routes
    if (!userRole || !userPermissions || userPermissions.length === 0) {
      return IGNORED_ROUTES.some(ignored => route.url.includes(ignored));
    }
    
    // For now, allow all routes for authenticated users
    // TODO: Implement proper permission checking when permission system is ready
    return true;
  });
  
  // Convert filtered routes to React Route elements
  return filteredRoutes.map((route) => {
    return React.createElement(Route, {
      key: route.url,
      path: route.url,
      element: route.component
    });
  });
};

// Export routes for direct access
export const getRouteByPath = (path: string): RouteConfig | undefined => {
  return allRoutes.find(route => route.url === path);
};

// Export all routes for external use
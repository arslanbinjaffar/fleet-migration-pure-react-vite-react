import React, { ReactElement } from "react";
import { Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import { FleetList, FleetView, FleetEdit } from "../modules/fleet/components";
import { LposList, LposView, LposEdit, LposCreate, LpoPdfView } from "../modules/lpos";
import { CustomerList, CustomerCreate, CustomerEdit, CustomerView, CustomerLedger } from "../modules/customer";
import { Timesheet, ManageCheckin } from "../modules/timesheet";
import { PurchaseOrderList, PurchaseOrderCreate, PurchaseOrderEdit, PurchaseOrderView, SupplierList, SupplierCreate, SupplierEdit, SupplierView, SupplierLedger, AddPaymentByFleet, FleetPurchases, ViewFleetPurchases, FleetReceiveShipping } from "../modules/fleet-purchases";
import { JobsList, JobsView } from "../modules/jobs/components";
import { RepairsList, RepairsEdit } from "../modules/repairs/components";
import { WarehouseList, WarehouseCreate, WarehouseEdit, WarehouseManage } from "../modules/inventory/warehouse/components";
import { ModelList, ModelCreate, ModelEdit } from "../modules/inventory/model/components";
import { CategoryList, CategoryCreate, CategoryEdit } from "../modules/inventory/category/components";
import { BrandList, BrandCreate, BrandEdit } from "../modules/inventory/brand/components";

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
    url: "lpos/view/:id",
    component: <LposView />,
    module: "MRM",
    name: "View LPO",
    access: ["admin", "manager", "employee"],
    action: ["read"]
  },
    {
    url: "lpos/view/:id/pdf",
    component: <LposView />,
    module: "MRM",
    name: "View LPO",
    access: ["admin", "manager", "employee"],
    action: ["read"]
  },
  {
    url: "lpos/edit/:id",
    component: <LposEdit />,
    module: "MRM",
    name: "Edit LPO",
    access: ["admin", "manager"],
    action: ["update"]
  },
  {
    url: "lpos/:id/pdf",
    component: <LpoPdfView />,
    module: "MRM",
    name: "LPO PDF Preview",
    access: ["admin", "manager", "employee"],
    action: ["read"]
  },
  
  // Timesheet Management Routes
  {
    url: "scheduled",
    component: <Timesheet />,
    module: "MRM",
    name: "Timesheets",
    access: ["admin", "manager"],
    action: ["create", "read", "update", "delete"]
  },
  {
    url: "schedule/edit",
    component: <ManageCheckin />,
    module: "MRM",
    name: "Scheduled",
    access: ["admin"],
    action: ["update"]
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
    component: <JobsList />,
    module: "GOM",
    name: "Jobs",
    access: ["admin", "manager", "employee"],
    action: ["create", "read", "update", "delete"]
  },
  {
    url: "jobs/view/:jobId",
    component: <JobsView />,
    module: "GOM",
    name: "View Job",
    access: ["admin", "manager", "employee"],
    action: ["read"]
  },
  
  // Repairs Routes
  {
    url: "repairs",
    component: <RepairsList />,
    module: "GOM",
    name: "Repairs",
    access: ["admin"],
    action: ["create", "read", "update", "delete"]
  },
  {
    url: "repairs/edit/:repairId",
    component: <RepairsEdit />,
    module: "GOM",
    name: "Edit Repair",
    access: ["admin"],
    action: ["update"]
  },

  // Inventory - Warehouse Routes
  {
    url: "inventory/warehouse",
    component: <WarehouseList />,
    module: "INVENTORY",
    name: "Warehouses",
    access: ["admin", "manager"],
    action: ["create", "read", "update", "delete"]
  },
  {
    url: "inventory/warehouse/create",
    component: <WarehouseCreate />,
    module: "INVENTORY",
    name: "Create Warehouse",
    access: ["admin", "manager"],
    action: ["create"]
  },
  {
    url: "inventory/warehouse/view/:warehouseId",
    component: <WarehouseEdit />,
    module: "INVENTORY",
    name: "View Warehouse",
    access: ["admin", "manager", "employee"],
    action: ["read"]
  },
  {
    url: "inventory/warehouse/edit/:warehouseId",
    component: <WarehouseEdit />,
    module: "INVENTORY",
    name: "Edit Warehouse",
    access: ["admin", "manager"],
    action: ["update"]
  },
  {
     url: "inventory/warehouse/manage",
     component: <WarehouseManage />,
     module: "INVENTORY",
     name: "Manage Warehouse Stock",
     access: ["admin", "manager"],
     action: ["create", "update"]
   },

   // Inventory - Model Routes
   {
     url: "inventory/model",
     component: <ModelList />,
     module: "INVENTORY",
     name: "Models",
     access: ["admin", "manager"],
     action: ["create", "read", "update", "delete"]
   },
   {
     url: "inventory/model/create",
     component: <ModelCreate />,
     module: "INVENTORY",
     name: "Create Model",
     access: ["admin", "manager"],
     action: ["create"]
   },
   {
     url: "inventory/model/view/:modelId",
     component: <ModelEdit />,
     module: "INVENTORY",
     name: "View Model",
     access: ["admin", "manager", "employee"],
     action: ["read"]
   },
   {
      url: "inventory/model/edit/:modelId",
      component: <ModelEdit />,
      module: "INVENTORY",
      name: "Edit Model",
      access: ["admin", "manager"],
      action: ["update"]
    },

    // Inventory - Category Routes
    {
      url: "inventory/category",
      component: <CategoryList />,
      module: "INVENTORY",
      name: "Categories",
      access: ["admin", "manager"],
      action: ["create", "read", "update", "delete"]
    },
    {
      url: "inventory/category/create",
      component: <CategoryCreate />,
      module: "INVENTORY",
      name: "Create Category",
      access: ["admin", "manager"],
      action: ["create"]
    },
    {
      url: "inventory/category/view/:categoryId",
      component: <CategoryEdit />,
      module: "INVENTORY",
      name: "View Category",
      access: ["admin", "manager", "employee"],
      action: ["read"]
    },
    {
       url: "inventory/category/edit/:categoryId",
       component: <CategoryEdit />,
       module: "INVENTORY",
       name: "Edit Category",
       access: ["admin", "manager"],
       action: ["update"]
     },

     // Inventory - Brand Routes
     {
       url: "inventory/brand",
       component: <BrandList />,
       module: "INVENTORY",
       name: "Brands",
       access: ["admin", "manager"],
       action: ["create", "read", "update", "delete"]
     },
     {
       url: "inventory/brand/create",
       component: <BrandCreate />,
       module: "INVENTORY",
       name: "Create Brand",
       access: ["admin", "manager"],
       action: ["create"]
     },
     {
       url: "inventory/brand/view/:brandId",
       component: <BrandEdit />,
       module: "INVENTORY",
       name: "View Brand",
       access: ["admin", "manager", "employee"],
       action: ["read"]
     },
     {
       url: "inventory/brand/edit/:brandId",
       component: <BrandEdit />,
       module: "INVENTORY",
       name: "Edit Brand",
       access: ["admin", "manager"],
       action: ["update"]
     },
  
  // Fleet Purchases Routes
  {
    url: "purchase-order-fleet",
    component: <PurchaseOrderList />,
    module: "MRM",
    name: "Purchase Orders",
    access: ["admin", "manager"],
    action: ["create", "read", "update", "delete"]
  },
  {
    url: "purchase-order-fleet/create",
    component: <PurchaseOrderCreate />,
    module: "MRM",
    name: "Create Purchase Order",
    access: ["admin", "manager"],
    action: ["create"]
  },
  {
    url: "purchase-order-fleet/edit/:id",
    component: <PurchaseOrderEdit />,
    module: "MRM",
    name: "Edit Purchase Order",
    access: ["admin", "manager"],
    action: ["update"]
  },
  {
    url: "purchase-order-fleet/view/:id",
    component: <PurchaseOrderView />,
    module: "MRM",
    name: "View Purchase Order",
    access: ["admin", "manager", "employee"],
    action: ["read"]
  },
  {
    url: "supplier-fleet",
    component: <SupplierList />,
    module: "MRM",
    name: "Suppliers",
    access: ["admin", "manager"],
    action: ["create", "read", "update", "delete"]
  },
  {
     url: "supplier-fleet/create",
     component: <SupplierCreate />,
     module: "MRM",
     name: "Create Supplier",
     access: ["admin", "manager"],
     action: ["create"]
   },
   {
     url: "supplier-fleet/edit/:id",
     component: <SupplierEdit />,
     module: "MRM",
     name: "Edit Supplier",
     access: ["admin", "manager"],
     action: ["update"]
   },
   {
     url: "supplier-fleet/view/:id",
     component: <SupplierView />,
     module: "MRM",
     name: "View Supplier",
     access: ["admin", "manager", "employee"],
     action: ["read"]
   },
   {
     url: "supplier-fleet/ledger/:id",
     component: <SupplierLedger />,
     module: "MRM",
     name: "Supplier Ledger",
     access: ["admin", "manager", "employee"],
     action: ["read"]
   },
   {
     url: "add-payment/supplier/create/fleet",
     component: <AddPaymentByFleet />,
     module: "MRM",
     name: "Add Supplier Payment",
     access: ["admin", "manager"],
     action: ["create"]
   },
  {
     url: "purchases-fleet",
     component: <FleetPurchases />,
     module: "MRM",
     name: "Fleet Purchases",
     access: ["admin", "manager", "employee"],
     action: ["read"]
   },
   {
     url: "purchases-fleet/view/:id",
     component: <ViewFleetPurchases />,
     module: "MRM",
     name: "View Fleet Purchase",
     access: ["admin", "manager", "employee"],
     action: ["read"]
   },
   {
     url: "receive-shipping-fleet",
     component: <FleetReceiveShipping />,
     module: "MRM",
     name: "Receive Shipping",
     access: ["admin", "manager"],
     action: ["create"]
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
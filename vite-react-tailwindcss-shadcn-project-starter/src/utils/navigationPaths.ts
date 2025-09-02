/**
 * Centralized navigation paths configuration
 * This file contains all application routes organized by module
 * Use these constants instead of hardcoded strings for type safety and maintainability
 */

/**
 * Navigation paths for different modules
 * All paths are defined without role prefix - the role will be automatically added by the navigation system
 */
export const NavigationPaths = {
  // Dashboard and Welcome
  DASHBOARD: 'dashboard',
  WELCOME: 'welcome',

  // Fleet Management Module
  FLEET: {
    LIST: 'fleet',
    CREATE: 'fleet/create',
    VIEW: (id: string) => `fleet/view/${id}`,
    EDIT: (id: string) => `fleet/edit/${id}`,
  },

  // Fleet Type Management Module
  FLEET_TYPE: {
    LIST: 'fleet-type',
    CREATE: 'fleet-type/create',
  },

  // Site Project Management Module
  SITE_PROJECT: {
    LIST: 'site-project',
    CREATE: 'site-project/create',
    VIEW: (id: string) => `site-project/view/${id}`,
  },

  // Customer Management Module
  CUSTOMER: {
    LIST: 'customer',
    CREATE: 'customer/create',
    VIEW: (id: string) => `customer/view/${id}`,
    EDIT: (id: string) => `customer/edit/${id}`,
    LEDGER: (id: string) => `customer/ledger/${id}`,
  },

  // LPO Management Module
  LPO: {
    LIST: 'lpos',
    CREATE: 'lpos/create',
    VIEW: (id: string) => `lpos/view/${id}`,
    EDIT: (id: string) => `lpos/edit/${id}`,
    PDF: (id: string) => `lpos/${id}/pdf`,
  },

  // Timesheet Management Module
  TIMESHEET: {
    LIST: 'timesheet',
    CREATE: 'timesheet/create',
    VIEW: (id: string) => `timesheet/view/${id}`,
    EDIT: (id: string) => `timesheet/edit/${id}`,
    MANAGE_CHECKIN: 'manage-checkin',
  },

  // Fleet Purchases Management Module
  FLEET_PURCHASES: {
    // Purchase Orders
    PURCHASE_ORDERS: 'purchase-order-fleet',
    CREATE_PURCHASE_ORDER: 'purchase-order-fleet/create',
    VIEW_PURCHASE_ORDER: (id: string) => `purchase-order-fleet/view/${id}`,
    EDIT_PURCHASE_ORDER: (id: string) => `purchase-order-fleet/edit/${id}`,
    
    // Suppliers
    SUPPLIERS: 'supplier-fleet',
    CREATE_SUPPLIER: 'supplier-fleet/create',
    VIEW_SUPPLIER: (id: string) => `supplier-fleet/view/${id}`,
    EDIT_SUPPLIER: (id: string) => `supplier-fleet/edit/${id}`,
    SUPPLIER_LEDGER: (id: string) => `supplier-fleet/ledger/${id}`,
    
    // Purchases
    PURCHASES: 'purchases-fleet',
    VIEW_PURCHASE: (id: string) => `purchases-fleet/view/${id}`,
    
    // Receive Shipping
    RECEIVE_SHIPPING: 'receive-shipping-fleet',
    
    // Payments
    ADD_PAYMENT: 'add-payment/supplier/create/fleet',
  },

  // Error Pages (these are absolute paths, no role prefix needed)
  ERROR: {
    BAD_REQUEST: '/page-error-400',
    FORBIDDEN: '/page-error-403',
    NOT_FOUND: '/page-error-404',
    INTERNAL_SERVER: '/page-error-500',
    SERVICE_UNAVAILABLE: '/page-error-503',
  },

  // Authentication (absolute path, no role prefix needed)
  AUTH: {
    LOGIN: '/login',
  },
} as const;

/**
 * Module-specific path collections for easier organization
 */
export const ModulePaths = {
  FLEET: NavigationPaths.FLEET,
  CUSTOMER: NavigationPaths.CUSTOMER,
  LPO: NavigationPaths.LPO,
  TIMESHEET: NavigationPaths.TIMESHEET,
  FLEET_PURCHASES: NavigationPaths.FLEET_PURCHASES,
} as const;

/**
 * Common navigation patterns
 */
export const CommonPaths = {
  DASHBOARD: NavigationPaths.DASHBOARD,
  WELCOME: NavigationPaths.WELCOME,
  LOGIN: NavigationPaths.AUTH.LOGIN,
} as const;

/**
 * Type definitions for navigation paths
 */
export type NavigationPathType = typeof NavigationPaths;
export type ModulePathType = typeof ModulePaths;
export type CommonPathType = typeof CommonPaths;

/**
 * Utility function to check if a path is absolute (starts with /)
 * Absolute paths don't need role prefixing
 */
export const isAbsolutePath = (path: string): boolean => {
  return path.startsWith('/');
};

/**
 * Utility function to check if a path is an error page
 */
export const isErrorPath = (path: string): boolean => {
  return Object.values(NavigationPaths.ERROR).includes(path as any);
};

/**
 * Utility function to check if a path is an auth page
 */
export const isAuthPath = (path: string): boolean => {
  return Object.values(NavigationPaths.AUTH).includes(path as any);
};

/**
 * Get all paths that should not have role prefix
 */
export const getAbsolutePaths = (): string[] => {
  return [
    ...Object.values(NavigationPaths.ERROR),
    ...Object.values(NavigationPaths.AUTH),
  ];
};

/**
 * Export default for convenience
 */
export default NavigationPaths;
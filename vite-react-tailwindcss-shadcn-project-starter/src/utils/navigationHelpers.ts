import { NavigationPaths } from './navigationPaths';
import { useRoleBasedNavigation } from './roleBasedNavigation';
import useRoleNavigation from './useNavigation';

/**
 * Type-safe navigation helper functions
 * These functions provide a convenient way to navigate to specific routes
 * All navigation automatically handles role prefixing
 */

/**
 * Hook that provides all navigation helper functions
 * Use this in components that need multiple navigation functions
 */
export const useNavigationHelpers = () => {
  const { roleNavigate } = useRoleNavigation();

  return {
    // Dashboard navigation
    goToDashboard: () => roleNavigate(NavigationPaths.DASHBOARD),
    goToWelcome: () => roleNavigate(NavigationPaths.WELCOME),
    
    // Fleet navigation
    goToFleetList: () => roleNavigate(NavigationPaths.FLEET.LIST),
    goToCreateFleet: () => roleNavigate(NavigationPaths.FLEET.CREATE),
    goToViewFleet: (id: string) => roleNavigate(NavigationPaths.FLEET.VIEW(id)),
    goToEditFleet: (id: string) => roleNavigate(NavigationPaths.FLEET.EDIT(id)),
    
    // Customer navigation
    goToCustomerList: () => roleNavigate(NavigationPaths.CUSTOMER.LIST),
    goToCreateCustomer: () => roleNavigate(NavigationPaths.CUSTOMER.CREATE),
    goToViewCustomer: (id: string) => roleNavigate(NavigationPaths.CUSTOMER.VIEW(id)),
    goToEditCustomer: (id: string) => roleNavigate(NavigationPaths.CUSTOMER.EDIT(id)),
    goToCustomerLedger: (id: string) => roleNavigate(NavigationPaths.CUSTOMER.LEDGER(id)),
    
    // LPO navigation
    goToLpoList: () => roleNavigate(NavigationPaths.LPO.LIST),
    goToCreateLpo: () => roleNavigate(NavigationPaths.LPO.CREATE),
    goToViewLpo: (id: string) => roleNavigate(NavigationPaths.LPO.VIEW(id)),
    goToEditLpo: (id: string) => roleNavigate(NavigationPaths.LPO.EDIT(id)),
    
    // Timesheet navigation
    goToTimesheetList: () => roleNavigate(NavigationPaths.TIMESHEET.LIST),
    goToCreateTimesheet: () => roleNavigate(NavigationPaths.TIMESHEET.CREATE),
    goToViewTimesheet: (id: string) => roleNavigate(NavigationPaths.TIMESHEET.VIEW(id)),
    goToEditTimesheet: (id: string) => roleNavigate(NavigationPaths.TIMESHEET.EDIT(id)),
    goToManageCheckin: () => roleNavigate(NavigationPaths.TIMESHEET.MANAGE_CHECKIN),
    
    // Fleet Purchases navigation
    goToPurchaseOrders: () => roleNavigate(NavigationPaths.FLEET_PURCHASES.PURCHASE_ORDERS),
    goToCreatePurchaseOrder: () => roleNavigate(NavigationPaths.FLEET_PURCHASES.CREATE_PURCHASE_ORDER),
    goToViewPurchaseOrder: (id: string) => roleNavigate(NavigationPaths.FLEET_PURCHASES.VIEW_PURCHASE_ORDER(id)),
    goToEditPurchaseOrder: (id: string) => roleNavigate(NavigationPaths.FLEET_PURCHASES.EDIT_PURCHASE_ORDER(id)),
    
    goToSuppliers: () => roleNavigate(NavigationPaths.FLEET_PURCHASES.SUPPLIERS),
    goToCreateSupplier: () => roleNavigate(NavigationPaths.FLEET_PURCHASES.CREATE_SUPPLIER),
    goToViewSupplier: (id: string) => roleNavigate(NavigationPaths.FLEET_PURCHASES.VIEW_SUPPLIER(id)),
    goToEditSupplier: (id: string) => roleNavigate(NavigationPaths.FLEET_PURCHASES.EDIT_SUPPLIER(id)),
    goToSupplierLedger: (id: string) => roleNavigate(NavigationPaths.FLEET_PURCHASES.SUPPLIER_LEDGER(id)),
    
    goToPurchases: () => roleNavigate(NavigationPaths.FLEET_PURCHASES.PURCHASES),
    goToViewPurchase: (id: string) => roleNavigate(NavigationPaths.FLEET_PURCHASES.VIEW_PURCHASE(id)),
    
    goToReceiveShipping: () => roleNavigate(NavigationPaths.FLEET_PURCHASES.RECEIVE_SHIPPING),
    goToAddPayment: () => roleNavigate(NavigationPaths.FLEET_PURCHASES.ADD_PAYMENT),
    
    // Error navigation (these use absolute paths)
    goToNotFound: () => roleNavigate(NavigationPaths.ERROR.NOT_FOUND),
    goToForbidden: () => roleNavigate(NavigationPaths.ERROR.FORBIDDEN),
    goToBadRequest: () => roleNavigate(NavigationPaths.ERROR.BAD_REQUEST),
    goToInternalServer: () => roleNavigate(NavigationPaths.ERROR.INTERNAL_SERVER),
    goToServiceUnavailable: () => roleNavigate(NavigationPaths.ERROR.SERVICE_UNAVAILABLE),
    
    // Auth navigation (absolute path)
    goToLogin: () => roleNavigate(NavigationPaths.AUTH.LOGIN),
    
    // Generic navigation function
    navigateTo: roleNavigate,
  };
};

/**
 * Individual navigation helper functions
 * Use these for specific navigation needs without the hook overhead
 */

// Fleet helpers
export const FleetNavigation = {
  useGoToList: () => {
    const { roleNavigate } = useRoleNavigation();
    return () => roleNavigate(NavigationPaths.FLEET.LIST);
  },
  useGoToCreate: () => {
    const { roleNavigate } = useRoleNavigation();
    return () => roleNavigate(NavigationPaths.FLEET.CREATE);
  },
  useGoToView: () => {
    const { roleNavigate } = useRoleNavigation();
    return (id: string) => roleNavigate(NavigationPaths.FLEET.VIEW(id));
  },
  useGoToEdit: () => {
    const { roleNavigate } = useRoleNavigation();
    return (id: string) => roleNavigate(NavigationPaths.FLEET.EDIT(id));
  },
};

// Customer helpers
export const CustomerNavigation = {
  useGoToList: () => {
    const { roleNavigate } = useRoleNavigation();
    return () => roleNavigate(NavigationPaths.CUSTOMER.LIST);
  },
  useGoToCreate: () => {
    const { roleNavigate } = useRoleNavigation();
    return () => roleNavigate(NavigationPaths.CUSTOMER.CREATE);
  },
  useGoToView: () => {
    const { roleNavigate } = useRoleNavigation();
    return (id: string) => roleNavigate(NavigationPaths.CUSTOMER.VIEW(id));
  },
  useGoToEdit: () => {
    const { roleNavigate } = useRoleNavigation();
    return (id: string) => roleNavigate(NavigationPaths.CUSTOMER.EDIT(id));
  },
  useGoToLedger: () => {
    const { roleNavigate } = useRoleNavigation();
    return (id: string) => roleNavigate(NavigationPaths.CUSTOMER.LEDGER(id));
  },
};

// LPO helpers
export const LpoNavigation = {
  useGoToList: () => {
    const { roleNavigate } = useRoleNavigation();
    return () => roleNavigate(NavigationPaths.LPO.LIST);
  },
  useGoToCreate: () => {
    const { roleNavigate } = useRoleNavigation();
    return () => roleNavigate(NavigationPaths.LPO.CREATE);
  },
  useGoToView: () => {
    const { roleNavigate } = useRoleNavigation();
    return (id: string) => roleNavigate(NavigationPaths.LPO.VIEW(id));
  },
  useGoToEdit: () => {
    const { roleNavigate } = useRoleNavigation();
    return (id: string) => roleNavigate(NavigationPaths.LPO.EDIT(id));
  },
};

// Timesheet helpers
export const TimesheetNavigation = {
  useGoToList: () => {
    const { roleNavigate } = useRoleNavigation();
    return () => roleNavigate(NavigationPaths.TIMESHEET.LIST);
  },
  useGoToCreate: () => {
    const { roleNavigate } = useRoleNavigation();
    return () => roleNavigate(NavigationPaths.TIMESHEET.CREATE);
  },
  useGoToView: () => {
    const { roleNavigate } = useRoleNavigation();
    return (id: string) => roleNavigate(NavigationPaths.TIMESHEET.VIEW(id));
  },
  useGoToEdit: () => {
    const { roleNavigate } = useRoleNavigation();
    return (id: string) => roleNavigate(NavigationPaths.TIMESHEET.EDIT(id));
  },
  useGoToManageCheckin: () => {
    const { roleNavigate } = useRoleNavigation();
    return () => roleNavigate(NavigationPaths.TIMESHEET.MANAGE_CHECKIN);
  },
};

// Fleet Purchases helpers
export const FleetPurchasesNavigation = {
  // Purchase Orders
  useGoToPurchaseOrders: () => {
    const { roleNavigate } = useRoleNavigation();
    return () => roleNavigate(NavigationPaths.FLEET_PURCHASES.PURCHASE_ORDERS);
  },
  useGoToCreatePurchaseOrder: () => {
    const { roleNavigate } = useRoleNavigation();
    return () => roleNavigate(NavigationPaths.FLEET_PURCHASES.CREATE_PURCHASE_ORDER);
  },
  useGoToViewPurchaseOrder: () => {
    const { roleNavigate } = useRoleNavigation();
    return (id: string) => roleNavigate(NavigationPaths.FLEET_PURCHASES.VIEW_PURCHASE_ORDER(id));
  },
  useGoToEditPurchaseOrder: () => {
    const { roleNavigate } = useRoleNavigation();
    return (id: string) => roleNavigate(NavigationPaths.FLEET_PURCHASES.EDIT_PURCHASE_ORDER(id));
  },
  
  // Suppliers
  useGoToSuppliers: () => {
    const { roleNavigate } = useRoleNavigation();
    return () => roleNavigate(NavigationPaths.FLEET_PURCHASES.SUPPLIERS);
  },
  useGoToCreateSupplier: () => {
    const { roleNavigate } = useRoleNavigation();
    return () => roleNavigate(NavigationPaths.FLEET_PURCHASES.CREATE_SUPPLIER);
  },
  useGoToViewSupplier: () => {
    const { roleNavigate } = useRoleNavigation();
    return (id: string) => roleNavigate(NavigationPaths.FLEET_PURCHASES.VIEW_SUPPLIER(id));
  },
  useGoToEditSupplier: () => {
    const { roleNavigate } = useRoleNavigation();
    return (id: string) => roleNavigate(NavigationPaths.FLEET_PURCHASES.EDIT_SUPPLIER(id));
  },
  useGoToSupplierLedger: () => {
    const { roleNavigate } = useRoleNavigation();
    return (id: string) => roleNavigate(NavigationPaths.FLEET_PURCHASES.SUPPLIER_LEDGER(id));
  },
  
  // Purchases
  useGoToPurchases: () => {
    const { roleNavigate } = useRoleNavigation();
    return () => roleNavigate(NavigationPaths.FLEET_PURCHASES.PURCHASES);
  },
  useGoToViewPurchase: () => {
    const { roleNavigate } = useRoleNavigation();
    return (id: string) => roleNavigate(NavigationPaths.FLEET_PURCHASES.VIEW_PURCHASE(id));
  },
  
  // Other
  useGoToReceiveShipping: () => {
    const { roleNavigate } = useRoleNavigation();
    return () => roleNavigate(NavigationPaths.FLEET_PURCHASES.RECEIVE_SHIPPING);
  },
  useGoToAddPayment: () => {
    const { roleNavigate } = useRoleNavigation();
    return () => roleNavigate(NavigationPaths.FLEET_PURCHASES.ADD_PAYMENT);
  },
};

/**
 * Common navigation helpers
 */
export const CommonNavigation = {
  useGoToDashboard: () => {
    const { roleNavigate } = useRoleNavigation();
    return () => roleNavigate(NavigationPaths.DASHBOARD);
  },
  useGoToLogin: () => {
    const { roleNavigate } = useRoleNavigation();
    return () => roleNavigate(NavigationPaths.AUTH.LOGIN);
  },
};

/**
 * Export the main hook as default
 */
export default useNavigationHelpers;
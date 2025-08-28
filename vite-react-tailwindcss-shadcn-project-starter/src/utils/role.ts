import { useSelector } from "react-redux";
import { selectCurrentUser } from "../stores/slices/authSlice";
import { useMemo } from "react";

// Import new permission system for enhanced functionality
import {
  usePermissions,
  useModulePermissions,
  useHasPermission,
} from '../components/permissions';
import { PermissionModule, PermissionModuleType } from '../types/permissions';

// Types
interface Permission {
  module: string;
  name: string;
  actions: string[];
}

interface UserRole {
  roleName: string;
  permissions: Permission[];
}

interface AuthUser {
  email?: string;
  avatar?: string;
  Role?: UserRole;
  [key: string]: any;
}

// Hook to get user role
export const useUserRole = (): string => {
  const user = useSelector(selectCurrentUser) as AuthUser | null;
  return user?.Role?.roleName?.toLowerCase() || "";
};

// Hook to get user permissions
export const useUserPermissions = (): Permission[] => {
  const user = useSelector(selectCurrentUser) as AuthUser | null;
  return user?.Role?.permissions || [];
};

// Hook to get permission set for a specific module
// DEPRECATED: Use useModulePermissions from the new permission system instead
export const usePermissionSet = (subModule: string) => {
  const userPermissions = useUserPermissions();

  const result = useMemo(() => {
    if (typeof subModule !== "string") return {};

    const permission = userPermissions?.find(
      (perm) => perm?.name?.toLowerCase() === subModule.toLowerCase()
    );

    const actions = ["create", "read", "update", "delete", "manage", "ledger", "approve"];

    return actions.reduce((acc, action) => {
      acc[action] = permission?.actions?.includes(action) || false;
      return acc;
    }, {} as Record<string, boolean>);
  }, [subModule, userPermissions]);

  return result;
};

// Enhanced permission set hook using new permission system
// This provides better type safety and performance
export const useEnhancedPermissionSet = (module: PermissionModuleType) => {
  return useModulePermissions(module);
};

// Convenience hook that works with both old and new permission names
export const useCompatiblePermissionSet = (moduleName: string) => {
  // Try to map old permission names to new ones
  const moduleKey = Object.keys(PermissionModule).find(
    key => PermissionModule[key as keyof typeof PermissionModule].toLowerCase() === moduleName.toLowerCase()
  );
  
  if (moduleKey) {
    const module = PermissionModule[moduleKey as keyof typeof PermissionModule];
    return useModulePermissions(module);
  }
  
  // Fallback to old system for unmapped modules
  return usePermissionSet(moduleName);
};

// Permission names enum
export const PermissionName = Object.freeze({
  Dashboard: "Dashboard",
  Profile: "profile",
  Fleet: "Fleet",
  LPOS: "LPOS",
  Customers: "Customers",
  Timesheets: "Timesheets",
  SiteProject: "SiteProject",
  FleetType: "FleetType",
  PurchaseOrderFleet: "PurchaseOrderFleet",
  ReceiveShippingFleet: "ReceiveShippingFleet",
  PurchasesFleet: "PurchasesFleet",
  SupplierFleet: "SupplierFleet",
  Jobs: "Jobs",
  Repairs: "Repairs",
  Employee: "Employee",
  Payroll: "Payroll",
  Leaves: "Leaves",
  ShiftType: "ShiftType",
  Attendance: "Attendance",
  Holidays: "Holidays",
  CreateLeave: "CreateLeave",
  LeavesType: "LeavesType",
  LeaveBalance: "LeaveBalance",
  SalarySlips: "SalarySlips",
  Salary: "Salary",
  Loans: "Loans",
  Accounts: "Accounts",
  Invoices: "Invoices",
  ReceivePayment: "ReceivePayment",
  Expenses: "Expenses",
  Quotation: "Quotation",
  AccountTransactions: "AccountTransactions",
  JournalEntries: "JournalEntries",
  PettyCash: "PettyCash",
  ReceiptCash: "ReceiptCash",
  PaymentCash: "PaymentCash",
  CreditNote: "CreditNote",
  DebitNote: "DebitNote",
  SundryPurchase: "SundryPurchase",
  Warehouse: "Warehouse",
  Product: "Product",
  Category: "Category",
  Brand: "Brand",
  Stocklist: "Stocklist",
  Model: "Model",
  PurchaseOrder: "PurchaseOrder",
  ReceiveShippingForOrder: "ReceiveShippingForOrder",
  Purchases: "Purchases",
  Supplier: "Supplier",
  ServiceReport: "ServiceReport",
  VendorPurchaseSummary: "VendorPurchaseSummary",
  InvoiceAging: "InvoiceAging",
  ProfitLossStatement: "ProfitLossStatement",
  JournalLedger: "JournalLedger",
  GeneralLedger: "GeneralLedger",
  TrialBalance: "TrialBalance",
  FleetProfitLoss: "FleetProfitLoss",
  BalanceSheet: "BalanceSheet",
  FixedAssetReport: "FixedAssetReport",
  PurchaseRegister: "PurchaseRegister",
  SalesRegister: "SalesRegister",
  SalesByCategory: "SalesByCategory",
  CustomerSaleSummary: "CustomerSaleSummary",
  PayableSummary: "PayableSummary",
  ReceivableSummary: "ReceivableSummary",
  PayableAgingSummary: "PayableAgingSummary",
  VAT_AuditReport: "VAT_AuditReport",
  VAT_ReturnReport: "VAT_ReturnReport",
  RoleBasePermissions: "Role-base-Permissions"
} as const);

// Utility function to check if user has specific permission
export const hasPermission = (user: AuthUser | null, permissionName: string): boolean => {
  if (!user || !user.Role || !user.Role.permissions) {
    return false;
  }
  
  const permission = user.Role.permissions.find(
    (perm) => perm.name === permissionName
  );
  
  return !!permission;
};

// Utility function to check if user has specific permission with action
export const hasPermissionWithAction = (user: AuthUser | null, permissionName: string, action: string): boolean => {
  if (!user || !user.Role || !user.Role.permissions) {
    return false;
  }
  
  const permission = user.Role.permissions.find(
    (perm) => perm.name === permissionName
  );
  
  return permission ? permission.actions.includes(action) : false;
};

// Enhanced permission checking functions using new system
export const useEnhancedHasPermission = (module: PermissionModuleType, action?: string) => {
  return useHasPermission(module, action as any);
};

// Backward compatible permission checking
export const useCompatibleHasPermission = (moduleName: string, action?: string) => {
  const moduleKey = Object.keys(PermissionModule).find(
    key => PermissionModule[key as keyof typeof PermissionModule].toLowerCase() === moduleName.toLowerCase()
  );
  
  if (moduleKey) {
    const module = PermissionModule[moduleKey as keyof typeof PermissionModule];
    return useHasPermission(module, action as any);
  }
  
  // Fallback to old system
  const user = useSelector(selectCurrentUser) as AuthUser | null;
  return hasPermission(user, moduleName);
};

// Export types for use in other components
export type { Permission, UserRole, AuthUser };

// Re-export new permission system components for convenience
export {
  PermissionButton,
  CreateButton,
  EditButton,
  DeleteButton,
  ViewButton,
  ExportButton,
  ManageButton,
  ApproveButton,
  PermissionDropdown,
  PermissionDropdownItem,
  ActionsDropdown,
  StatusDropdown,
  BulkActionsDropdown,
  PermissionWrapper,
  AdminOnly,
  ManagerOrAbove,
  CreatePermission,
  EditPermission,
  DeletePermission,
  ViewPermission,
  ExportPermission,
  ManagePermission,
  usePermissions,
  useUserRole as useEnhancedUserRole,
  useModulePermissions,
  useHasPermission,
  useHasPermissions,
  useHasAnyPermission,
  PermissionModule,
} from '../components/permissions';

/**
 * Migration Guide:
 * 
 * OLD WAY:
 * ```jsx
 * const { create, update, delete: del, read } = usePermissionSet(PermissionName.Fleet);
 * ```
 * 
 * NEW WAY (Recommended):
 * ```tsx
 * const fleetPermissions = useModulePermissions(PermissionModule.Fleet);
 * // or for individual checks:
 * const canCreate = useHasPermission(PermissionModule.Fleet, 'create');
 * ```
 * 
 * COMPATIBLE WAY (for gradual migration):
 * ```tsx
 * const { create, update, delete: del, read } = useCompatiblePermissionSet('Fleet');
 * ```
 */
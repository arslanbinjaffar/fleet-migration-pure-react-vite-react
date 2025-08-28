
// Core permission system types and interfaces

export interface Permission {
  module: string;
  name: string;
  actions: string[];
}

export interface UserRole {
  roleName: string;
  permissions: Permission[];
}

export interface AuthUser {
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  Role?: UserRole;
  [key: string]: any;
}

// Permission action types
export type PermissionAction = 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete' 
  | 'manage' 
  | 'ledger' 
  | 'approve' 
  | 'export' 
  | 'import' 
  | 'view' 
  | 'edit';

// Permission module names - centralized enum
export const PermissionModule = {
  // Core modules
  Dashboard: 'Dashboard',
  Profile: 'profile',
  
  // MRM (Machine Resource Management)
  Fleet: 'Fleet',
  LPOS: 'LPOS',
  Customers: 'Customers',
  Timesheets: 'Timesheets',
  SiteProject: 'SiteProject',
  FleetType: 'FleetType',
  
  // Fleet Purchases
  PurchaseOrderFleet: 'PurchaseOrderFleet',
  ReceiveShippingFleet: 'ReceiveShippingFleet',
  PurchasesFleet: 'PurchasesFleet',
  SupplierFleet: 'SupplierFleet',
  
  // GOM (General Operations Management)
  Jobs: 'Jobs',
  Repairs: 'Repairs',
  
  // HRM (Human Resource Management)
  Employee: 'Employee',
  Payroll: 'Payroll',
  Leaves: 'Leaves',
  ShiftType: 'ShiftType',
  Attendance: 'Attendance',
  Holidays: 'Holidays',
  CreateLeave: 'CreateLeave',
  LeavesType: 'LeavesType',
  LeaveBalance: 'LeaveBalance',
  SalarySlips: 'SalarySlips',
  Salary: 'Salary',
  Loans: 'Loans',
  
  // Finance
  Accounts: 'Accounts',
  Invoices: 'Invoices',
  ReceivePayment: 'ReceivePayment',
  Expenses: 'Expenses',
  Quotation: 'Quotation',
  AccountTransactions: 'AccountTransactions',
  JournalEntries: 'JournalEntries',
  PettyCash: 'PettyCash',
  ReceiptCash: 'ReceiptCash',
  PaymentCash: 'PaymentCash',
  CreditNote: 'CreditNote',
  DebitNote: 'DebitNote',
  SundryPurchase: 'SundryPurchase',
  
  // Inventory
  Warehouse: 'Warehouse',
  Product: 'Product',
  Category: 'Category',
  Brand: 'Brand',
  Stocklist: 'Stocklist',
  Model: 'Model',
  PurchaseOrder: 'PurchaseOrder',
  ReceiveShippingForOrder: 'ReceiveShippingForOrder',
  Purchases: 'Purchases',
  Supplier: 'Supplier',
  
  // Reports
  ServiceReport: 'ServiceReport',
  VendorPurchaseSummary: 'VendorPurchaseSummary',
  InvoiceAging: 'InvoiceAging',
  ProfitLossStatement: 'ProfitLossStatement',
  JournalLedger: 'JournalLedger',
  GeneralLedger: 'GeneralLedger',
  TrialBalance: 'TrialBalance',
  FleetProfitLoss: 'FleetProfitLoss',
  BalanceSheet: 'BalanceSheet',
  FixedAssetReport: 'FixedAssetReport',
  PurchaseRegister: 'PurchaseRegister',
  SalesRegister: 'SalesRegister',
  SalesByCategory: 'SalesByCategory',
  CustomerSaleSummary: 'CustomerSaleSummary',
  PayableSummary: 'PayableSummary',
  ReceivableSummary: 'ReceivableSummary',
  PayableAgingSummary: 'PayableAgingSummary',
  VAT_AuditReport: 'VAT_AuditReport',
  VAT_ReturnReport: 'VAT_ReturnReport',
  
  // Admin
  RoleBasePermissions: 'Role-base-Permissions',
} as const;

export type PermissionModuleType = typeof PermissionModule[keyof typeof PermissionModule];

// Permission check result interface
export interface PermissionSet {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  manage: boolean;
  ledger: boolean;
  approve: boolean;
  export: boolean;
  import: boolean;
  view: boolean;
  edit: boolean;
}

// Permission button props interface
export interface PermissionButtonProps {
  module: PermissionModuleType;
  action: PermissionAction;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  onClick?: () => void;
  fallback?: React.ReactNode;
  showTooltip?: boolean;
  tooltipContent?: string;
}

// Permission dropdown props interface
export interface PermissionDropdownProps {
  module: PermissionModuleType;
  children: React.ReactNode;
  className?: string;
  trigger?: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
}

// Permission dropdown item props interface
export interface PermissionDropdownItemProps {
  action: PermissionAction;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

// Permission context interface
export interface PermissionContextType {
  user: AuthUser | null;
  hasPermission: (module: PermissionModuleType, action?: PermissionAction) => boolean;
  getPermissionSet: (module: PermissionModuleType) => PermissionSet;
  isLoading: boolean;
}

// Permission provider props
export interface PermissionProviderProps {
  children: React.ReactNode;
}

// Utility types for better type safety
export type RequiredPermission = {
  module: PermissionModuleType;
  action: PermissionAction;
};

export type OptionalPermission = {
  module: PermissionModuleType;
  action?: PermissionAction;
};

// Permission configuration for different UI components
export interface PermissionConfig {
  required: RequiredPermission[];
  optional?: OptionalPermission[];
  fallbackBehavior?: 'hide' | 'disable' | 'show';
}

// Export all permission-related types
export type {
  Permission,
  UserRole,
  AuthUser,
  PermissionAction,
  PermissionModuleType,
  PermissionSet,
  PermissionButtonProps,
  PermissionDropdownProps,
  PermissionDropdownItemProps,
  PermissionContextType,
  PermissionProviderProps,
  RequiredPermission,
  OptionalPermission,
  PermissionConfig,
};
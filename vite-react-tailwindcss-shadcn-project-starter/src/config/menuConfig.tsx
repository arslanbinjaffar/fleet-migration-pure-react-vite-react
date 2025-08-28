import {
  FaChartBar,
  FaUsers,
  FaUserTie,
  FaFileInvoiceDollar,
  FaWarehouse,
  FaShoppingCart,
  FaTruck,
  FaUserFriends,
  FaUserClock,
  FaPlane,
  FaChartLine,
  FaFileAlt,
  FaExchangeAlt,
  FaChartPie,
  FaHandHoldingUsd,
  FaTools,
  FaCar,
  FaClipboardCheck,
  FaWrench,
  FaCogs,
  FaUserShield,
  FaMoneyCheck,
  FaRegClipboard,
  FaRegClock,
  FaRegCalendarAlt,
  FaHandshake,
  FaFileContract,
  FaReceipt,
} from "react-icons/fa";
import { ReactElement } from "react";

export interface MenuItemConfig {
  key: string;
  title: string;
  module: string;
  icon: ReactElement;
  path: string;
  location?: "header" | "sidebar";
  permissionName?: string; // For custom permission mapping
  group?: string; // For grouping items in collapsible sections
  isGroupHeader?: boolean; // Indicates if this is a group header
}

export const menuConfig: MenuItemConfig[] = [
  // Header Items (Module Navigation)
  {
    key: "general",
    title: "Dashboard",
    module: "GENERAL",
    icon: <FaChartBar size={20} />,
    path: "dashboard",
    location: "header",
    permissionName: "Dashboard"
  },
  {
    key: "mrm",
    title: "MRM",
    module: "MRM",
    icon: <FaCar size={20} />,
    path: "fleet",
    location: "header",
    permissionName: "Fleet"
  },
  {
    key: "gom",
    title: "GOM",
    module: "GOM",
    icon: <FaTools size={20} />,
    path: "jobs",
    location: "header",
    permissionName: "Jobs"
  },
  {
    key: "hrm",
    title: "HRM",
    module: "HRM",
    icon: <FaUserTie size={20} />,
    path: "employee",
    location: "header",
    permissionName: "Employee"
  },
  {
    key: "finance",
    title: "Finance",
    module: "Finance",
    icon: <FaFileInvoiceDollar size={20} />,
    path: "accounts",
    location: "header",
    permissionName: "Accounts"
  },
  {
    key: "roles",
    title: "Roles",
    module: "Roles",
    icon: <FaUserShield size={20} />,
    path: "group-permission",
    location: "header",
    permissionName: "Role-base-Permissions"
  },

  // Sidebar Items (Detailed Navigation)
  // GENERAL Module
  {
    key: "dashboard",
    title: "Dashboard",
    module: "GENERAL",
    icon: <FaChartBar size={20} />,
    path: "dashboard",
    location: "sidebar",
    permissionName: "Dashboard"
  },

  // MRM Module
  {
    key: "fleet",
    title: "Fleet",
    module: "MRM",
    icon: <FaCar size={20} />,
    path: "fleet",
    location: "sidebar",
    permissionName: "Fleet"
  },
  {
    key: "lpos",
    title: "LPOS",
    module: "MRM",
    icon: <FaFileContract size={20} />,
    path: "lpos",
    location: "sidebar",
    permissionName: "LPOS"
  },
  {
    key: "timesheets",
    title: "Timesheets",
    module: "MRM",
    icon: <FaRegClock size={20} />,
    path: "scheduled",
    location: "sidebar",
    permissionName: "Timesheets"
  },
  {
    key: "customers",
    title: "Customers",
    module: "MRM",
    icon: <FaUserFriends size={20} />,
    path: "customer",
    location: "sidebar",
    permissionName: "Customers"
  },
  
  // MRM - Masters Group
  {
    key: "masters-group",
    title: "Masters",
    module: "MRM",
    icon: <FaCogs size={20} />,
    path: "fleet-type",
    location: "sidebar",
    group: "masters",
    isGroupHeader: true,
    permissionName: "FleetType"
  },
  {
    key: "fleet-type",
    title: "Fleet Type",
    module: "MRM",
    icon: <FaCogs size={20} />,
    path: "fleet-type",
    location: "sidebar",
    group: "masters",
    permissionName: "FleetType"
  },
  {
    key: "site-project",
    title: "Site Project",
    module: "MRM",
    icon: <FaCogs size={20} />,
    path: "site-project",
    location: "sidebar",
    group: "masters",
    permissionName: "SiteProject"
  },
  
  // MRM - Fleet Purchases Group
  {
    key: "fleet-purchases-group",
    title: "Fleet Purchases",
    module: "MRM",
    icon: <FaShoppingCart size={20} />,
    path: "purchase-order-fleet",
    location: "sidebar",
    group: "fleet-purchases",
    isGroupHeader: true,
    permissionName: "PurchaseOrderFleet"
  },
  {
    key: "purchase-order-fleet",
    title: "Purchase Order",
    module: "MRM",
    icon: <FaShoppingCart size={20} />,
    path: "purchase-order-fleet",
    location: "sidebar",
    group: "fleet-purchases",
    permissionName: "PurchaseOrderFleet"
  },
  {
    key: "receive-shipping-fleet",
    title: "Receive Shipping",
    module: "MRM",
    icon: <FaShoppingCart size={20} />,
    path: "receive-shipping-fleet",
    location: "sidebar",
    group: "fleet-purchases",
    permissionName: "ReceiveShippingFleet"
  },
  {
    key: "purchases-fleet",
    title: "Purchases",
    module: "MRM",
    icon: <FaShoppingCart size={20} />,
    path: "purchases-fleet",
    location: "sidebar",
    group: "fleet-purchases",
    permissionName: "PurchasesFleet"
  },
  
  {
    key: "supplier-fleet",
    title: "Fleet Supplier",
    module: "MRM",
    icon: <FaTruck size={20} />,
    path: "supplier-fleet",
    location: "sidebar",
    permissionName: "SupplierFleet"
  },

  // GOM Module
  {
    key: "jobs",
    title: "Jobs",
    module: "GOM",
    icon: <FaTools size={20} />,
    path: "jobs",
    location: "sidebar",
    permissionName: "Jobs"
  },
  {
    key: "repairs",
    title: "Repair Tracking",
    module: "GOM",
    icon: <FaWrench size={20} />,
    path: "repairs",
    location: "sidebar",
    permissionName: "Repairs"
  },
  
  // GOM - Inventory Group
  {
    key: "inventory-group",
    title: "Inventory",
    module: "GOM",
    icon: <FaWarehouse size={20} />,
    path: "warehouse",
    location: "sidebar",
    group: "inventory",
    isGroupHeader: true,
    permissionName: "Warehouse"
  },
  {
    key: "warehouse",
    title: "Warehouse",
    module: "GOM",
    icon: <FaWarehouse size={20} />,
    path: "warehouse",
    location: "sidebar",
    group: "inventory",
    permissionName: "Warehouse"
  },
  {
    key: "brand",
    title: "Brand",
    module: "GOM",
    icon: <FaWarehouse size={20} />,
    path: "brand",
    location: "sidebar",
    group: "inventory",
    permissionName: "Brand"
  },
  {
    key: "category",
    title: "Category",
    module: "GOM",
    icon: <FaWarehouse size={20} />,
    path: "category",
    location: "sidebar",
    group: "inventory",
    permissionName: "Category"
  },
  {
    key: "model",
    title: "Model",
    module: "GOM",
    icon: <FaWarehouse size={20} />,
    path: "model",
    location: "sidebar",
    group: "inventory",
    permissionName: "Model"
  },
  {
    key: "product",
    title: "Spare Parts",
    module: "GOM",
    icon: <FaWarehouse size={20} />,
    path: "product",
    location: "sidebar",
    group: "inventory",
    permissionName: "Product"
  },
  {
    key: "stocklist",
    title: "Stock List",
    module: "GOM",
    icon: <FaWarehouse size={20} />,
    path: "stocklist",
    location: "sidebar",
    group: "inventory",
    permissionName: "Stocklist"
  },
  
  // GOM - Purchases Group
  {
    key: "gom-purchases-group",
    title: "Purchases",
    module: "GOM",
    icon: <FaShoppingCart size={20} />,
    path: "purchase-order",
    location: "sidebar",
    group: "gom-purchases",
    isGroupHeader: true,
    permissionName: "PurchaseOrder"
  },
  {
    key: "purchase-order",
    title: "Purchase",
    module: "GOM",
    icon: <FaShoppingCart size={20} />,
    path: "purchase-order",
    location: "sidebar",
    group: "gom-purchases",
    permissionName: "PurchaseOrder"
  },
  {
    key: "receive-shipping",
    title: "Receive Shipping",
    module: "GOM",
    icon: <FaShoppingCart size={20} />,
    path: "receive-shipping",
    location: "sidebar",
    group: "gom-purchases",
    permissionName: "ReceiveShippingForOrder"
  },
  {
    key: "purchases",
    title: "Purchases",
    module: "GOM",
    icon: <FaShoppingCart size={20} />,
    path: "purchases",
    location: "sidebar",
    group: "gom-purchases",
    permissionName: "Purchases"
  },
  
  {
    key: "supplier",
    title: "Supplier",
    module: "GOM",
    icon: <FaTruck size={20} />,
    path: "supplier",
    location: "sidebar",
    permissionName: "Supplier"
  },

  // HRM Module
  // HRM - Payroll Group
  {
    key: "payroll-group",
    title: "Payroll",
    module: "HRM",
    icon: <FaMoneyCheck size={20} />,
    path: "payroll",
    location: "sidebar",
    group: "payroll",
    isGroupHeader: true,
    permissionName: "Payroll"
  },
  {
    key: "payroll",
    title: "Payroll",
    module: "HRM",
    icon: <FaMoneyCheck size={20} />,
    path: "payroll",
    location: "sidebar",
    group: "payroll",
    permissionName: "Payroll"
  },
  {
    key: "salary",
    title: "Salary",
    module: "HRM",
    icon: <FaMoneyCheck size={20} />,
    path: "salary",
    location: "sidebar",
    group: "payroll",
    permissionName: "Salary"
  },
  {
    key: "salary-slips",
    title: "Salary Slip",
    module: "HRM",
    icon: <FaMoneyCheck size={20} />,
    path: "salary-slips",
    location: "sidebar",
    group: "payroll",
    permissionName: "SalarySlips"
  },
  
  {
    key: "shift-type",
    title: "Shift",
    module: "HRM",
    icon: <FaRegClock size={20} />,
    path: "shiftType",
    location: "sidebar",
    permissionName: "ShiftType"
  },
  {
    key: "loans",
    title: "Loans",
    module: "HRM",
    icon: <FaHandHoldingUsd size={20} />,
    path: "loans",
    location: "sidebar",
    permissionName: "Loans"
  },
  
  // HRM - Leave Group
  {
    key: "leave-group",
    title: "Leave",
    module: "HRM",
    icon: <FaRegCalendarAlt size={20} />,
    path: "leaves",
    location: "sidebar",
    group: "leave",
    isGroupHeader: true,
    permissionName: "Leaves"
  },
  {
    key: "leaves",
    title: "All Leaves",
    module: "HRM",
    icon: <FaRegCalendarAlt size={20} />,
    path: "leaves",
    location: "sidebar",
    group: "leave",
    permissionName: "Leaves"
  },
  {
    key: "leave-create",
    title: "Create Leave",
    module: "HRM",
    icon: <FaRegCalendarAlt size={20} />,
    path: "leave/create",
    location: "sidebar",
    group: "leave",
    permissionName: "CreateLeave"
  },
  {
    key: "leaves-type",
    title: "Leave Type",
    module: "HRM",
    icon: <FaRegCalendarAlt size={20} />,
    path: "leaves-type",
    location: "sidebar",
    group: "leave",
    permissionName: "LeavesType"
  },
  {
    key: "leave-balance",
    title: "Leave Balance",
    module: "HRM",
    icon: <FaRegCalendarAlt size={20} />,
    path: "leave-balance",
    location: "sidebar",
    group: "leave",
    permissionName: "LeaveBalance"
  },
  
  // HRM - Attendance Group
  {
    key: "attendance-group",
    title: "Attendance",
    module: "HRM",
    icon: <FaUserClock size={20} />,
    path: "attendence/add",
    location: "sidebar",
    group: "attendance",
    isGroupHeader: true,
    permissionName: "Attendance"
  },
  {
    key: "attendance-add",
    title: "Add Attendance",
    module: "HRM",
    icon: <FaUserClock size={20} />,
    path: "attendence/add",
    location: "sidebar",
    group: "attendance",
    permissionName: "Attendance"
  },
  {
    key: "today-attendance",
    title: "Today's Attendance",
    module: "HRM",
    icon: <FaUserClock size={20} />,
    path: "today-attendence",
    location: "sidebar",
    group: "attendance",
    permissionName: "Attendance"
  },
  {
    key: "attendance-sheet",
    title: "Attendance Sheet",
    module: "HRM",
    icon: <FaUserClock size={20} />,
    path: "attendence-sheet",
    location: "sidebar",
    group: "attendance",
    permissionName: "Attendance"
  },
  
  {
    key: "employee",
    title: "Employee",
    module: "HRM",
    icon: <FaUserTie size={20} />,
    path: "employee",
    location: "sidebar",
    permissionName: "Employee"
  },
  {
    key: "holidays",
    title: "Holiday",
    module: "HRM",
    icon: <FaRegCalendarAlt size={20} />,
    path: "holidays",
    location: "sidebar",
    permissionName: "Holidays"
  },
  
  // Finance Module
  {
    key: "accounts",
    title: "Chart of Accounts",
    module: "Finance",
    icon: <FaChartPie size={20} />,
    path: "accounts",
    location: "sidebar",
    permissionName: "Accounts"
  },
  
  // Finance - Billing Group
  {
    key: "billing-group",
    title: "Billing",
    module: "Finance",
    icon: <FaFileInvoiceDollar size={20} />,
    path: "invoices",
    location: "sidebar",
    group: "billing",
    isGroupHeader: true,
    permissionName: "Invoices"
  },
  {
    key: "invoices",
    title: "Invoices",
    module: "Finance",
    icon: <FaFileInvoiceDollar size={20} />,
    path: "invoices",
    location: "sidebar",
    group: "billing",
    permissionName: "Invoices"
  },
  {
    key: "quotation",
    title: "Quotations",
    module: "Finance",
    icon: <FaFileInvoiceDollar size={20} />,
    path: "quotation",
    location: "sidebar",
    group: "billing",
    permissionName: "Quotation"
  },
  {
    key: "receive-payment",
    title: "Receive Payment",
    module: "Finance",
    icon: <FaFileInvoiceDollar size={20} />,
    path: "receive-payment",
    location: "sidebar",
    group: "billing",
    permissionName: "ReceivePayment"
  },
    {
    key: "transactions-group",
    title: "Transactions",
    module: "Finance",
    icon: <FaExchangeAlt size={20} />,
    path: "journal-entries",
    location: "sidebar",
    group: "transactions",
    isGroupHeader: true,
    permissionName: "JournalEntries"
  },
  {
    key: "journal-entries",
    title: "Journal Entries",
    module: "Finance",
    icon: <FaExchangeAlt size={20} />,
    path: "journal-entries",
    location: "sidebar",
    group: "transactions",
    permissionName: "JournalEntries"
  },
  {
    key: "petty-cash",
    title: "Petty Cash",
    module: "Finance",
    icon: <FaExchangeAlt size={20} />,
    path: "petty-cash",
    location: "sidebar",
    group: "transactions",
    permissionName: "PettyCash"
  },
  {
    key: "receipt-cash",
    title: "Receipt Cash",
    module: "Finance",
    icon: <FaExchangeAlt size={20} />,
    path: "receipt-cash",
    location: "sidebar",
    group: "transactions",
    permissionName: "ReceiptCash"
  },
  {
    key: "payment-cash",
    title: "Payment Cash",
    module: "Finance",
    icon: <FaExchangeAlt size={20} />,
    path: "payment-cash",
    location: "sidebar",
    group: "transactions",
    permissionName: "PaymentCash"
  },
  {
    key: "debit-note",
    title: "Debit Note",
    module: "Finance",
    icon: <FaExchangeAlt size={20} />,
    path: "debit-note",
    location: "sidebar",
    group: "transactions",
    permissionName: "DebitNote"
  },
  {
    key: "credit-note",
    title: "Credit Note",
    module: "Finance",
    icon: <FaExchangeAlt size={20} />,
    path: "credit-note",
    location: "sidebar",
    group: "transactions",
    permissionName: "CreditNote"
  },
  {
    key: "sundry-purchase",
    title: "Sundry Purchase",
    module: "Finance",
    icon: <FaExchangeAlt size={20} />,
    path: "sundry-purchase",
    location: "sidebar",
    group: "transactions",
    permissionName: "SundryPurchase"
  },
  // {
  //   key: "voucher",
  //   title: "Voucher",
  //   module: "Finance",
  //   icon: <FaReceipt size={20} />,
  //   path: "voucher",
  //   location: "sidebar",
  //   group: "transactions",
  //   permissionName: "Voucher"
  // },
  
  // Finance - Reports Group
  {
    key: "reports-group",
    title: "Reports",
    module: "Finance",
    icon: <FaChartLine size={20} />,
    path: "journal-ledger",
    location: "sidebar",
    group: "reports",
    isGroupHeader: true,
    permissionName: "JournalLedger"
  },
  {
    key: "journal-ledger",
    title: "Journal Ledger",
    module: "Finance",
    icon: <FaChartLine size={20} />,
    path: "journal-ledger",
    location: "sidebar",
    group: "reports",
    permissionName: "JournalLedger"
  },
  {
    key: "general-ledger",
    title: "General Ledger",
    module: "Finance",
    icon: <FaChartLine size={20} />,
    path: "general-ledger/ledger",
    location: "sidebar",
    group: "reports",
    permissionName: "GeneralLedger"
  },
  {
    key: "trial-balance",
    title: "Trial Balance",
    module: "Finance",
    icon: <FaChartLine size={20} />,
    path: "trial-balance/sheet",
    location: "sidebar",
    group: "reports",
    permissionName: "TrialBalance"
  },
  {
    key: "balance-sheet",
    title: "Balance Sheet",
    module: "Finance",
    icon: <FaChartLine size={20} />,
    path: "balance-sheets/sheet",
    location: "sidebar",
    group: "reports",
    permissionName: "BalanceSheet"
  },
  {
    key: "fleet-profit-loss",
    title: "Fleet Profit And Loss Statement",
    module: "Finance",
    icon: <FaChartLine size={20} />,
    path: "fleet-profit-loss/statement",
    location: "sidebar",
    group: "reports",
    permissionName: "FleetProfitLoss"
  },
  {
    key: "profit-loss",
    title: "Profit And Loss Statement", 
    module: "Finance",
    icon: <FaChartLine size={20} />,
    path: "profit-loss/statement",
    location: "sidebar",
    group: "reports",
    permissionName: "ProfitLoss"
  },
  {
    key: "fixed-assets",
    title: "Fixed Assets Reports",
    module: "Finance", 
    icon: <FaChartLine size={20} />,
    path: "fixed-asset-report",
    location: "sidebar",
    group: "reports",
    permissionName: "FixedAssets"
  },
  {
    key: "purchase-register",
    title: "Purchase Register",
    module: "Finance",
    icon: <FaChartLine size={20} />,
    path: "purchase/register",
    location: "sidebar", 
    group: "reports",
    permissionName: "PurchaseRegister"
  },
  {
    key: "vendor-purchase",
    title: "Purchase by Vendor",
    module: "Finance",
    icon: <FaChartLine size={20} />,
    path: "vendor/purchase-summary",
    location: "sidebar",
    group: "reports", 
    permissionName: "VendorPurchase"
  },
  {
    key: "sales-register",
    title: "Sales Register",
    module: "Finance",
    icon: <FaChartLine size={20} />,
    path: "sales/register",
    location: "sidebar",
    group: "reports",
    permissionName: "SalesRegister"
  },
  {
    key: "sales-category",
    title: "Sales Register By Category",
    module: "Finance",
    icon: <FaChartLine size={20} />,
    path: "sales/register/category",
    location: "sidebar",
    group: "reports",
    permissionName: "SalesCategory"
  },
  {
    key: "customer-sales",
    title: "Customer Wise Sale Summary",
    module: "Finance",
    icon: <FaChartLine size={20} />,
    path: "customerwise/sale",
    location: "sidebar",
    group: "reports",
    permissionName: "CustomerSales"
  },
  {
    key: "expenses-category",
    title: "Expenses By Category",
    module: "Finance",
    icon: <FaChartLine size={20} />,
    path: "expenses/category",
    location: "sidebar",
    group: "reports",
    permissionName: "ExpensesCategory"
  },
  {
    key: "payable-summary",
    title: "Accounts Payable Summary",
    module: "Finance",
    icon: <FaChartLine size={20} />,
    path: "payable/summary",
    location: "sidebar",
    group: "reports",
    permissionName: "PayableSummary"
  },
  {
    key: "receivable-summary",
    title: "Account Receivables",
    module: "Finance",
    icon: <FaChartLine size={20} />,
    path: "receiveable/summary",
    location: "sidebar",
    group: "reports",
    permissionName: "ReceivableSummary"
  },
  {
    key: "ap-aging",
    title: "AP Aging Summary",
    module: "Finance",
    icon: <FaChartLine size={20} />,
    path: "payable/aging/summary",
    location: "sidebar",
    group: "reports",
    permissionName: "APAging"
  },
  {
    key: "ar-aging",
    title: "AR Aging Summary",
    module: "Finance",
    icon: <FaChartLine size={20} />,
    path: "invoice/aging",
    location: "sidebar",
    group: "reports",
    permissionName: "ARAging"
  },
  // Finance - Transactions Group
  

  // Roles Module
  {
    key: "group-permission",
    title: "Roles Permission",
    module: "Roles",
    icon: <FaUserShield size={20} />,
    path: "group-permission",
    location: "sidebar",
    permissionName: "Role-base-Permissions"
  },
];
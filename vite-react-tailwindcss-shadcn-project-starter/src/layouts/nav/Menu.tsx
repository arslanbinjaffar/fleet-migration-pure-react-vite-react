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
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { ReactElement } from "react";

// Type definitions
interface Permission {
  module: string;
  name: string;
  actions: string[];
}

interface MenuChild {
  title: string;
  to: string;
  isGroup?: boolean;
}

interface MenuGroup {
  group: string;
  module: string;
  icon: ReactElement;
  children: MenuChild[];
}

interface MenuItem {
  title: string;
  module: string;
  classsChange: string;
  iconStyle: ReactElement;
  content: MenuChild[];
  to?: string;
}

const permissionNameMapping: Record<string, string> = {
  Dashboard: "Dashboard",
  Fleet: "Fleet",
  LPOS: "LPOS",
  Timesheets: "Timesheets",
  Customers: "Customers",
  FleetType: "FleetType",
  SiteProject: "SiteProject",
  "List Purchase Order": "PurchaseOrderFleet",
  ReceiveShippingFleet: "ReceiveShippingFleet",
  "List Purchases": "PurchasesFleet",
  FleetSupplier: "SupplierFleet",
  Supplier: "Supplier",
  Jobs: "Jobs",
  "Repair Tracking": "Repairs",
  Warehouse: "Warehouse",
  Stocklist: "Stocklist",
  Category: "Category",
  Brand: "Brand",
  Model: "Model",
  "Spare Parts": "Product",
  "Purchase Order": "PurchaseOrder",
  ReceiveShipping: "ReceiveShippingForOrder",
  Purchases: "Purchases",
  Employee: "Employee",
  "Official Information": "OfficialInformation",
  Payroll: "Payroll",
  Salary: "Salary",
  "Salary Slips": "SalarySlips",
  Shift: "ShiftType",
  Loans: "Loans",
  "All Leaves": "Leaves",
  "Create Leaves": "CreateLeave",
  "Leave Types": "LeavesType",
  "Leave Balance": "LeaveBalance",
  "Add Attendance": "Attendance",
  "Today's Attendance": "Attendance",
  "Attendance Sheet": "Attendance",
  Holiday: "Holidays",
  "Chart of Accounts": "Accounts",
  Invoices: "Invoices",
  Quotation: "Quotation",
  "Receive Payment": "ReceivePayment",
  "Account Transactions": "AccountTransactions",
  "Journal Entries": "JournalEntries",
  "Petty Cash": "PettyCash",
  "Receipt Cash": "ReceiptCash",
  "Payment Cash": "PaymentCash",
  "Debit Note": "DebitNote",
  "Credit Note": "CreditNote",
  "Sundry Purchase": "SundryPurchase",
  "Journal Ledger": "JournalLedger",
  "General Ledger": "GeneralLedger",
  "Trial Balance": "TrialBalance",
  "Fleet Profit And Loss Statement": "FleetProfitLoss",
  "Profit And Loss Statement": "ProfitLossStatement",
  "Balance Sheet": "BalanceSheet",
  "Fixed Assets Reports": "FixedAssetReport",
  "Purchase Register": "PurchaseRegister",
  "Purchase by Vendor": "VendorPurchaseSummary",
  "Sales Register": "SalesRegister",
  "Sales Register By Category": "SalesByCategory",
  "Customer Wise Sale Summary": "CustomerSaleSummary",
  "Expenses By Category": "Expenses",
  "Accounts Payable Summary": "PayableSummary",
  "Account Receivables": "ReceivableSummary",
  "AP Aging Summary": "PayableAgingSummary",
  "AR Aging Summary": "InvoiceAging",
  "VAT Audit Report": "VAT_AuditReport",
  "VAT Return": "VAT_ReturnReport",
  "Roles Permission": "Role-base-Permissions",
};

// MenuBlueprint with all menu items
const MenuBlueprint: MenuGroup[] = [
  {
    group: "Dashboard",
    module: "GENERAL",
    icon: <FaChartBar size={20} />,
    children: [{ title: "Dashboard", to: "dashboard" }],
  },
  {
    group: "Fleet",
    module: "MRM",
    icon: <FaCar size={20} />,
    children: [{ title: "Fleet", to: "fleet", isGroup: false }],
  },
  {
    group: "LPOS",
    module: "MRM",
    icon: <FaFileContract size={20} />,
    children: [{ title: "LPOS", to: "lpos", isGroup: false }],
  },
  {
    group: "Timesheets",
    module: "MRM",
    icon: <FaRegClock size={20} />,
    children: [
      {
        title: "Timesheets",
        to: "scheduled" || "schedule/edit",
        isGroup: false,
      },
    ],
  },
  {
    group: "Customers",
    module: "MRM",
    icon: <FaUserFriends size={20} />,
    children: [{ title: "Customers", to: "customer", isGroup: false }],
  },
  {
    group: "Masters",
    module: "MRM",
    icon: <FaCogs size={20} />,
    children: [
      { title: "FleetType", to: "fleet-type" },
      { title: "SiteProject", to: "site-project" },
    ],
  },
  {
    group: "Fleet Purchase Order",
    module: "MRM",
    icon: <FaShoppingCart size={20} />,
    children: [
      { title: "List Purchase Order", to: "purchase-order-fleet" },
      { title: "ReceiveShippingFleet", to: "receive-shipping-fleet" },
      { title: "List Purchases", to: "purchases-fleet" },
    ],
  },
  {
    group: "FleetSupplier",
    module: "MRM",
    icon: <FaTruck size={20} />,
    children: [{ title: "FleetSupplier", to: "supplier-fleet" }],
  },
  {
    group: "Jobs",
    module: "GOM",
    icon: <FaTools size={20} />,
    children: [{ title: "Jobs", to: "jobs" }],
  },
  {
    group: "Repair",
    module: "GOM",
    icon: <FaWrench size={20} />,
    children: [{ title: "Repair Tracking", to: "repairs" }],
  },
  {
    group: "Inventory",
    module: "GOM",
    icon: <FaWarehouse size={20} />,
    children: [
      { title: "Warehouse", to: "warehouse" },
      { title: "Stocklist", to: "stocklist" },
      { title: "Category", to: "category" },
      { title: "Brand", to: "brand" },
      { title: "Model", to: "model" },
      { title: "Spare Parts", to: "product" },
    ],
  },
  {
    group: "PurchaseOrder",
    module: "GOM",
    icon: <FaShoppingCart size={20} />,
    children: [
      { title: "Purchase Order", to: "purchase-order" },
      { title: "ReceiveShipping", to: "receive-shipping" },
      { title: "Purchases", to: "purchases" },
    ],
  },
  {
    group: "Parts Supplier",
    module: "GOM",
    icon: <FaTruck size={20} />,
    children: [{ title: "Supplier", to: "supplier" }],
  },
  {
    group: "Payroll",
    module: "HRM",
    icon: <FaMoneyCheck size={20} />,
    children: [
      { title: "Payroll", to: "payroll" },
      { title: "Salary", to: "salary" },
      { title: "Salary Slips", to: "salary-slips" },
    ],
  },
  {
    group: "Shift",
    module: "HRM",
    icon: <FaRegClock size={20} />,
    children: [{ title: "Shift", to: "shiftType" }],
  },
  {
    group: "Loans",
    module: "HRM",
    icon: <FaHandHoldingUsd size={20} />,
    children: [{ title: "Loans", to: "loans" }],
  },
  {
    group: "Leave Management",
    module: "HRM",
    icon: <FaRegCalendarAlt size={20} />,
    children: [
      { title: "All Leaves", to: "leaves" },
      { title: "Create Leaves", to: "leave/create" },
      { title: "Leave Types", to: "leaves-type" },
      { title: "Leave Balance", to: "leave-balance" },
    ],
  },
  {
    group: "Attendance",
    module: "HRM",
    icon: <FaUserClock size={20} />,
    children: [
      { title: "Add Attendance", to: "attendence/add" },
      { title: "Today's Attendance", to: "today-attendence" },
      { title: "Attendance Sheet", to: "attendence-sheet" },
    ],
  },
  {
    group: "Holiday",
    module: "HRM",
    icon: <FaRegCalendarAlt size={20} />,
    children: [{ title: "Holiday", to: "holidays" }],
  },
  {
    group: "Employee",
    module: "HRM",
    icon: <FaUserTie size={20} />,
    children: [{ title: "Employee", to: "employee" }],
  },
  {
    group: "Finance",
    module: "Finance",
    icon: <FaFileInvoiceDollar size={20} />,
    children: [],
  },
  {
    group: "Chart of Accounts",
    module: "Finance",
    icon: <FaChartPie size={20} />,
    children: [{ title: "Chart of Accounts", to: "accounts" }],
  },
  {
    group: "Billings",
    module: "Finance",
    icon: <FaFileInvoiceDollar size={20} />,
    children: [
      { title: "Invoices", to: "invoices" },
      { title: "Quotation", to: "quotation" },
      { title: "Receive Payment", to: "receive-payment" },
    ],
  },
  {
    group: "Transactions",
    module: "Finance",
    icon: <FaExchangeAlt size={20} />,
    children: [
      { title: "Journal Entries", to: "journal-entries" },
      { title: "Petty Cash", to: "petty-cash" },
      { title: "Receipt Cash", to: "receipt-cash" },
      { title: "Payment Cash", to: "payment-cash" },
      { title: "Debit Note", to: "debit-note" },
      { title: "Credit Note", to: "credit-note" },
      { title: "Sundry Purchase", to: "sundry-purchase" },
    ],
  },
  {
    group: "Reports",
    module: "Finance",
    icon: <FaChartLine size={20} />,
    children: [
      { title: "Journal Ledger", to: "journal-ledger" },
      { title: "General Ledger", to: "general-ledger/ledger" },
      { title: "Trial Balance", to: "trial-balance/sheet" },
      {
        title: "Fleet Profit And Loss Statement",
        to: "fleet-profit-loss/statement",
      },
      { title: "Profit And Loss Statement", to: "profit-loss/statement" },
      { title: "Balance Sheet", to: "balance-sheets/sheet" },
      { title: "Fixed Assets Reports", to: "fixed-asset-report" },
      { title: "Purchase Register", to: "purchase/register" },
      { title: "Purchase by Vendor", to: "vendor/purchase-summary" },
      { title: "Sales Register", to: "sales/register" },
      { title: "Sales Register By Category", to: "sales/register/category" },
      { title: "Customer Wise Sale Summary", to: "customerwise/sale" },
      { title: "Expenses By Category", to: "expenses/category" },
      { title: "Accounts Payable Summary", to: "payable/summary" },
      { title: "Account Receivables", to: "receiveable/summary" },
      { title: "AP Aging Summary", to: "payable/aging/summary" },
      { title: "AR Aging Summary", to: "invoice/aging" },
    ],
  },
  {
    group: "Roles",
    module: "Roles",
    icon: <FaUserShield size={20} />,
    children: [{ title: "Roles Permission", to: "group-permission" }],
  },
];

// Enhanced filter function with better matching
function filterMenu(menuBlueprint: MenuGroup[], permissions: Permission[]): MenuItem[] {
  return menuBlueprint
    .map((group) => {
      const filteredChildren = group.children.filter((item) => {
        const permissionName = permissionNameMapping[item.title] || item.title;
        return permissions.some((p) => {
          const moduleMatch = p.module === group.module;
          const nameMatch =
            p.name.toLowerCase() === permissionName.toLowerCase();
          return moduleMatch && nameMatch;
        });
      });

      if (filteredChildren.length > 0) {
        return {
          title: group.group,
          module: group?.module, // Include module for filtering
          classsChange: "mm-collapse",
          iconStyle: group.icon,
          content: filteredChildren,
        };
      }

      return null;
    })
    .filter(Boolean) as MenuItem[];
}

export const useMenuList = (userPermissions: Permission[] = []): MenuItem[] => {
  const [menuList, setMenuList] = useState<MenuItem[]>([]);

  useEffect(() => {
    const generatedMenu = filterMenu(MenuBlueprint, userPermissions);
    setMenuList(generatedMenu);
  }, [userPermissions]);

  return menuList;
};

export type { MenuItem, MenuChild, Permission };
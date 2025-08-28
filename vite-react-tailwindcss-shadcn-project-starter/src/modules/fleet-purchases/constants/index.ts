// Fleet Purchases Module Constants

// Order Status Options
export const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'approved', label: 'Approved', color: 'bg-blue-100 text-blue-800' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
] as const;

// Payment Status Options
export const PAYMENT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'partial', label: 'Partial', color: 'bg-orange-100 text-orange-800' },
  { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
  { value: 'overdue', label: 'Overdue', color: 'bg-red-100 text-red-800' },
] as const;

// Payment Method Options
export const PAYMENT_METHOD_OPTIONS = [
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
  { value: 'cheque', label: 'Cheque', icon: '📝' },
  { value: 'credit_card', label: 'Credit Card', icon: '💳' },
] as const;

// Item Condition Options
export const ITEM_CONDITION_OPTIONS = [
  { value: 'good', label: 'Good', color: 'bg-green-100 text-green-800' },
  { value: 'damaged', label: 'Damaged', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'defective', label: 'Defective', color: 'bg-red-100 text-red-800' },
] as const;

// Transaction Type Options
export const TRANSACTION_TYPE_OPTIONS = [
  { value: 'purchase', label: 'Purchase', color: 'bg-blue-100 text-blue-800' },
  { value: 'payment', label: 'Payment', color: 'bg-green-100 text-green-800' },
  { value: 'adjustment', label: 'Adjustment', color: 'bg-purple-100 text-purple-800' },
] as const;

// View Mode Options
export const VIEW_MODE_OPTIONS = [
  { value: 'table', label: 'Table', icon: 'List' },
  { value: 'grid', label: 'Grid', icon: 'Grid3X3' },
  { value: 'card', label: 'Card', icon: 'LayoutGrid' },
] as const;

// Page Size Options
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

// Default Values
export const DEFAULT_PAGE_SIZE = 25;
export const DEFAULT_CURRENT_PAGE = 1;
export const DEFAULT_VIEW_MODE = 'table';

// Table Columns
export const PURCHASE_ORDER_TABLE_COLUMNS = [
  { key: 'orderNumber', label: 'Order Number', sortable: true },
  { key: 'supplier', label: 'Supplier', sortable: true },
  { key: 'warehouse', label: 'Warehouse', sortable: true },
  { key: 'total', label: 'Total Amount', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'orderDate', label: 'Order Date', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false },
] as const;

export const PURCHASES_TABLE_COLUMNS = [
  { key: 'invoiceNumber', label: 'Invoice Number', sortable: true },
  { key: 'supplier', label: 'Supplier', sortable: true },
  { key: 'total', label: 'Total Amount', sortable: true },
  { key: 'paidAmount', label: 'Paid Amount', sortable: true },
  { key: 'paymentStatus', label: 'Payment Status', sortable: true },
  { key: 'invoiceDate', label: 'Invoice Date', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false },
] as const;

export const SUPPLIERS_TABLE_COLUMNS = [
  { key: 'name', label: 'Supplier Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'phone', label: 'Phone', sortable: true },
  { key: 'TRN', label: 'TRN', sortable: true },
  { key: 'totalPurchases', label: 'Total Purchases', sortable: true },
  { key: 'isActive', label: 'Status', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false },
] as const;

export const SUPPLIER_LEDGER_COLUMNS = [
  { key: 'transactionDate', label: 'Date', sortable: true },
  { key: 'transactionType', label: 'Type', sortable: true },
  { key: 'description', label: 'Description', sortable: false },
  { key: 'debitAmount', label: 'Debit', sortable: true },
  { key: 'creditAmount', label: 'Credit', sortable: true },
  { key: 'balance', label: 'Balance', sortable: true },
] as const;

// Permissions
export const PERMISSIONS = {
  // Purchase Orders
  VIEW_PURCHASE_ORDERS: 'PurchaseOrderFleet',
  CREATE_PURCHASE_ORDER: 'PurchaseOrderFleet',
  EDIT_PURCHASE_ORDER: 'PurchaseOrderFleet',
  DELETE_PURCHASE_ORDER: 'PurchaseOrderFleet',
  APPROVE_PURCHASE_ORDER: 'PurchaseOrderFleet',
  
  // Receive Shipping
  VIEW_RECEIVE_SHIPPING: 'ReceiveShippingFleet',
  CREATE_RECEIVE_SHIPPING: 'ReceiveShippingFleet',
  EDIT_RECEIVE_SHIPPING: 'ReceiveShippingFleet',
  
  // Purchases
  VIEW_PURCHASES: 'PurchasesFleet',
  CREATE_PURCHASE: 'PurchasesFleet',
  EDIT_PURCHASE: 'PurchasesFleet',
  DELETE_PURCHASE: 'PurchasesFleet',
  
  // Suppliers
  VIEW_SUPPLIERS: 'SupplierFleet',
  CREATE_SUPPLIER: 'SupplierFleet',
  EDIT_SUPPLIER: 'SupplierFleet',
  DELETE_SUPPLIER: 'SupplierFleet',
  VIEW_SUPPLIER_LEDGER: 'SupplierFleet',
  CREATE_SUPPLIER_PAYMENT: 'SupplierFleet',
} as const;

// Default Form Values
export const DEFAULT_PURCHASE_ORDER_VALUES = {
  fleetSupplierId: '',
  orderNumber: '',
  subject: '',
  paymentDueDate: '',
  details: '',
  items: [{
    productName: '',
    quantity: 1,
    unitPrice: 0,
    description: '',
    specifications: '',
  }],
  orderDate: new Date().toISOString().split('T')[0],
  expectedDeliveryDate: '',
  notes: '',
  terms: '',
  discountAmount: 0,
  taxAmount: 0,
};

export const DEFAULT_SUPPLIER_VALUES = {
  name: '',
  email: '',
  phone: '',
  TRN: '',
  detail: '',
  address: '',
  contactPerson: '',
  isActive: true,
};

export const DEFAULT_PAYMENT_VALUES = {
  fleetSupplierId: '',
  fleetPurchaseId: '',
  amount: 0,
  paymentDate: new Date().toISOString().split('T')[0],
  paymentMethod: 'cash' as const,
  reference: '',
  description: '',
};

// Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_AMOUNT: 'Please enter a valid amount',
  INVALID_QUANTITY: 'Quantity must be greater than 0',
  INVALID_DATE: 'Please enter a valid date',
  DUPLICATE_SUPPLIER: 'A supplier with this name or TRN already exists',
  INSUFFICIENT_PAYMENT: 'Payment amount cannot exceed the remaining balance',
  INVALID_RECEIVED_QUANTITY: 'Received quantity cannot exceed ordered quantity',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Purchase Orders
  PURCHASE_ORDERS: '/api/fleet-purchase-orders',
  PURCHASE_ORDER_BY_ID: (id: string) => `/api/fleet-purchase-orders/${id}`,
  APPROVE_PURCHASE_ORDER: (id: string) => `/api/fleet-purchase-orders/${id}/approve`,
  
  // Receive Shipping
  RECEIVE_SHIPPING: '/api/receive-shipping-fleet',
  RECEIVE_SHIPPING_BY_ORDER: (orderId: string) => `/api/receive-shipping-fleet/order/${orderId}`,
  
  // Purchases
  PURCHASES: '/api/fleet-purchases',
  PURCHASE_BY_ID: (id: string) => `/api/fleet-purchases/${id}`,
  
  // Suppliers
  SUPPLIERS: '/api/fleet-suppliers',
  SUPPLIER_BY_ID: (id: string) => `/api/fleet-suppliers/${id}`,
  SUPPLIER_LEDGER: (id: string) => `/api/fleet-suppliers/${id}/ledger`,
  SUPPLIER_PAYMENTS: '/api/supplier-payments',
  
  // Lookups
  WAREHOUSES: '/api/warehouses',
  CATEGORIES: '/api/categories',
  
  // Statistics
  PURCHASE_ORDER_STATS: '/api/fleet-purchase-orders/stats',
  SUPPLIER_STATS: '/api/fleet-suppliers/stats',
  
  // Export
  EXPORT_PURCHASE_ORDERS: '/api/fleet-purchase-orders/export',
  EXPORT_PURCHASES: '/api/fleet-purchases/export',
  EXPORT_SUPPLIERS: '/api/fleet-suppliers/export',
} as const;

// Date/Time Formats
export const DATE_FORMAT = 'DD/MM/YYYY';
export const DATETIME_FORMAT = 'DD/MM/YYYY HH:mm';
export const TIME_FORMAT = 'HH:mm';

// Currency
export const CURRENCY_SYMBOL = 'QAR';
export const CURRENCY_DECIMAL_PLACES = 2;

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

// Search and Filter
export const SEARCH_DEBOUNCE_DELAY = 300;
export const MIN_SEARCH_LENGTH = 2;

// Status Colors
export const STATUS_COLORS = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  approved: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  completed: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
  partial: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  paid: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  overdue: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  good: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  damaged: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  defective: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  purchase: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  payment: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  adjustment: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  DUPLICATE_ERROR: 'This record already exists.',
  DELETE_ERROR: 'Cannot delete this record as it is being used elsewhere.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  PURCHASE_ORDER_CREATED: 'Purchase order created successfully',
  PURCHASE_ORDER_UPDATED: 'Purchase order updated successfully',
  PURCHASE_ORDER_DELETED: 'Purchase order deleted successfully',
  PURCHASE_ORDER_APPROVED: 'Purchase order approved successfully',
  SUPPLIER_CREATED: 'Supplier created successfully',
  SUPPLIER_UPDATED: 'Supplier updated successfully',
  SUPPLIER_DELETED: 'Supplier deleted successfully',
  PAYMENT_CREATED: 'Payment recorded successfully',
  SHIPPING_RECEIVED: 'Shipping received successfully',
  EXPORT_SUCCESS: 'Data exported successfully',
} as const;

// Loading Messages
export const LOADING_MESSAGES = {
  LOADING_PURCHASE_ORDERS: 'Loading purchase orders...',
  LOADING_PURCHASES: 'Loading purchases...',
  LOADING_SUPPLIERS: 'Loading suppliers...',
  LOADING_SUPPLIER_LEDGER: 'Loading supplier ledger...',
  SAVING: 'Saving...',
  DELETING: 'Deleting...',
  EXPORTING: 'Exporting...',
} as const;
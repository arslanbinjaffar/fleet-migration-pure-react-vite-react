// Supplier module constants

// API endpoints
export const SUPPLIER_ENDPOINTS = {
  LIST: '/api/suppliers',
  CREATE: '/api/suppliers',
  UPDATE: (id: string) => `/api/suppliers/${id}`,
  DELETE: (id: string) => `/api/suppliers/${id}`,
  GET_BY_ID: (id: string) => `/api/suppliers/${id}`,
  LEDGER: (id: string) => `/api/suppliers/${id}/ledger`,
  PAYMENTS: '/api/suppliers/payments',
  CREATE_PAYMENT: '/api/suppliers/payments',
} as const;

// Default pagination settings
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  maxLimit: 100,
} as const;

// Supplier status options
export const SUPPLIER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const;

// Payment methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CHECK: 'check',
  BANK_TRANSFER: 'bank_transfer',
  CREDIT_CARD: 'credit_card',
} as const;

// Transaction types
export const TRANSACTION_TYPES = {
  PURCHASE: 'purchase',
  PAYMENT: 'payment',
  CREDIT: 'credit',
  DEBIT: 'debit',
  ADJUSTMENT: 'adjustment',
} as const;

// Sort options
export const SORT_OPTIONS = {
  SUPPLIER_NAME: 'supplierName',
  CREATED_AT: 'createdAt',
  CURRENT_BALANCE: 'currentBalance',
} as const;

// Sort orders
export const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

// Form field limits
export const FIELD_LIMITS = {
  SUPPLIER_NAME: { min: 1, max: 100 },
  CONTACT_PERSON: { min: 1, max: 100 },
  EMAIL: { min: 1, max: 255 },
  PHONE: { min: 1, max: 20 },
  ADDRESS: { min: 1, max: 255 },
  CITY: { min: 1, max: 50 },
  COUNTRY: { min: 1, max: 50 },
  POSTAL_CODE: { max: 20 },
  TAX_ID: { max: 50 },
  PAYMENT_TERMS: { max: 100 },
  NOTES: { max: 500 },
  REFERENCE_NUMBER: { max: 50 },
} as const;

// Default values
export const DEFAULT_VALUES = {
  STATUS: SUPPLIER_STATUS.ACTIVE,
  PAYMENT_METHOD: PAYMENT_METHODS.CASH,
  CREDIT_LIMIT: 0,
  CURRENT_BALANCE: 0,
} as const;

// Risk levels
export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

// Risk thresholds (as percentage of credit limit)
export const RISK_THRESHOLDS = {
  MEDIUM: 0.7, // 70%
  HIGH: 0.9,   // 90%
} as const;

// Currency settings
export const CURRENCY_SETTINGS = {
  DEFAULT_CURRENCY: 'USD',
  DECIMAL_PLACES: 2,
} as const;

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy HH:mm',
} as const;

// Table column keys
export const TABLE_COLUMNS = {
  SUPPLIER_NAME: 'supplierName',
  CONTACT_PERSON: 'contactPerson',
  EMAIL: 'email',
  PHONE: 'phone',
  COUNTRY: 'country',
  STATUS: 'status',
  CURRENT_BALANCE: 'currentBalance',
  CREATED_AT: 'createdAt',
  ACTIONS: 'actions',
} as const;

// Ledger column keys
export const LEDGER_COLUMNS = {
  DATE: 'date',
  TRANSACTION_TYPE: 'transactionType',
  DESCRIPTION: 'description',
  REFERENCE: 'referenceNumber',
  AMOUNT: 'amount',
  BALANCE: 'balance',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  NEGATIVE_AMOUNT: 'Amount cannot be negative',
  ZERO_AMOUNT: 'Amount must be greater than zero',
  DUPLICATE_SUPPLIER: 'A supplier with this name already exists',
  NETWORK_ERROR: 'Network error. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  SUPPLIER_CREATED: 'Supplier created successfully',
  SUPPLIER_UPDATED: 'Supplier updated successfully',
  SUPPLIER_DELETED: 'Supplier deleted successfully',
  PAYMENT_CREATED: 'Payment recorded successfully',
  PAYMENT_UPDATED: 'Payment updated successfully',
  PAYMENT_DELETED: 'Payment deleted successfully',
} as const;

// Loading states
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

// Modal types
export const MODAL_TYPES = {
  CREATE_SUPPLIER: 'createSupplier',
  EDIT_SUPPLIER: 'editSupplier',
  DELETE_SUPPLIER: 'deleteSupplier',
  CREATE_PAYMENT: 'createPayment',
  VIEW_LEDGER: 'viewLedger',
} as const;
// Warehouse Status Constants
export const WAREHOUSE_STATUS = {
  ACTIVE: 'active' as const,
  INACTIVE: 'inactive' as const,
} as const;

export const WAREHOUSE_STATUS_OPTIONS = [
  { value: WAREHOUSE_STATUS.ACTIVE, label: 'Active' },
  { value: WAREHOUSE_STATUS.INACTIVE, label: 'Inactive' },
] as const;

// Warehouse Table Constants
export const WAREHOUSE_TABLE_COLUMNS = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'city', label: 'City', sortable: true },
  { key: 'address', label: 'Address', sortable: false },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'capacity', label: 'Capacity', sortable: true },
  { key: 'createdAt', label: 'Created At', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false },
] as const;

// Pagination Constants
export const WAREHOUSE_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 13,
  RECORDS_PER_PAGE_OPTIONS: [10, 13, 25, 50, 100],
} as const;

// Sort Options
export const WAREHOUSE_SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'city', label: 'City' },
  { value: 'createdAt', label: 'Created Date' },
  { value: 'capacity', label: 'Capacity' },
] as const;

export const SORT_ORDER_OPTIONS = [
  { value: 'asc', label: 'Ascending' },
  { value: 'desc', label: 'Descending' },
] as const;

// Form Field Constants
export const WAREHOUSE_FORM_FIELDS = {
  NAME: 'name',
  DESCRIPTION: 'description',
  CITY: 'city',
  STATE: 'state',
  ADDRESS: 'address',
  ZIP_CODE: 'zipCode',
  COUNTRY: 'country',
  PHONE: 'phone',
  EMAIL: 'email',
  MANAGER_ID: 'managerId',
  CAPACITY: 'capacity',
  STATUS: 'status',
} as const;

// Validation Constants
export const WAREHOUSE_VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  CITY_MIN_LENGTH: 2,
  CITY_MAX_LENGTH: 50,
  ADDRESS_MIN_LENGTH: 5,
  ADDRESS_MAX_LENGTH: 200,
  PHONE_PATTERN: /^[\+]?[1-9][\d]{0,15}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  ZIP_CODE_PATTERN: /^[\d]{5}(-[\d]{4})?$/,
  MIN_CAPACITY: 1,
  MAX_CAPACITY: 1000000,
} as const;

// Stock Transfer Constants
export const STOCK_TRANSFER = {
  MIN_TRANSFER_QUANTITY: 1,
  MAX_TRANSFER_QUANTITY: 999999,
} as const;

// Permission Constants
export const WAREHOUSE_PERMISSIONS = {
  CREATE: 'warehouse:create',
  READ: 'warehouse:read',
  UPDATE: 'warehouse:update',
  DELETE: 'warehouse:delete',
} as const;

export const STOCK_PERMISSIONS = {
  CREATE: 'stock:create',
  READ: 'stock:read',
  UPDATE: 'stock:update',
  DELETE: 'stock:delete',
} as const;

// API Endpoints
export const WAREHOUSE_ENDPOINTS = {
  BASE: 'warehouse',
  SINGLE: (id: string) => `warehouse/${id}`,
  SEARCH: 'warehouse/search',
  STATS: 'warehouse/stats',
  EXPORT: 'warehouse/export',
} as const;

// Error Messages
export const WAREHOUSE_ERROR_MESSAGES = {
  REQUIRED_NAME: 'Warehouse name is required',
  REQUIRED_CITY: 'City is required',
  REQUIRED_ADDRESS: 'Address is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_CAPACITY: 'Capacity must be a positive number',
  DUPLICATE_NAME: 'A warehouse with this name already exists',
  NETWORK_ERROR: 'Network error. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred',
} as const;

// Success Messages
export const WAREHOUSE_SUCCESS_MESSAGES = {
  CREATED: 'Warehouse created successfully',
  UPDATED: 'Warehouse updated successfully',
  DELETED: 'Warehouse deleted successfully',
  STOCK_TRANSFERRED: 'Stock transferred successfully',
} as const;

// Card Counter Data (from original component)
export const WAREHOUSE_CARD_COUNTERS = [
  { number: '8', countText: 'primary', title: 'Not Started' },
  { number: '7', countText: 'purple', title: 'In Progress' },
  { number: '13', countText: 'warning', title: 'Testing' },
  { number: '11', countText: 'danger', title: 'Cancelled' },
  { number: '21', countText: 'success', title: 'Complete' },
  { number: '16', countText: 'danger', title: 'Pending' },
] as const;

// Export all constants
export {
  WAREHOUSE_STATUS,
  WAREHOUSE_STATUS_OPTIONS,
  WAREHOUSE_TABLE_COLUMNS,
  WAREHOUSE_PAGINATION,
  WAREHOUSE_SORT_OPTIONS,
  SORT_ORDER_OPTIONS,
  WAREHOUSE_FORM_FIELDS,
  WAREHOUSE_VALIDATION,
  STOCK_TRANSFER,
  WAREHOUSE_PERMISSIONS,
  STOCK_PERMISSIONS,
  WAREHOUSE_ENDPOINTS,
  WAREHOUSE_ERROR_MESSAGES,
  WAREHOUSE_SUCCESS_MESSAGES,
  WAREHOUSE_CARD_COUNTERS,
};
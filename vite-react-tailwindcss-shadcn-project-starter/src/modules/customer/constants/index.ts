import { CustomerFilters } from '../types';

// Customer status options
export const CUSTOMER_STATUS_OPTIONS = [
  { value: 'all', label: 'All Customers', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  { value: 'active', label: 'Active', color: 'text-green-600', bgColor: 'bg-green-100' },
  { value: 'inactive', label: 'Inactive', color: 'text-red-600', bgColor: 'bg-red-100' },
] as const;

// Customer prefix options
export const CUSTOMER_PREFIX_OPTIONS = [
  { value: 'Mr', label: 'Mr.' },
  { value: 'Mrs', label: 'Mrs.' },
  { value: 'Ms', label: 'Ms.' },
  { value: 'Dr', label: 'Dr.' },
  { value: 'Prof', label: 'Prof.' },
] as const;

// Customer ledger transaction types
export const TRANSACTION_TYPE_OPTIONS = [
  { value: 'debit', label: 'Debit', color: 'text-red-600', bgColor: 'bg-red-100' },
  { value: 'credit', label: 'Credit', color: 'text-green-600', bgColor: 'bg-green-100' },
] as const;

// Form steps for customer creation
export const CUSTOMER_FORM_STEPS = [
  {
    id: 0,
    title: 'Personal Information',
    description: 'Basic customer details',
    fields: ['firstname', 'lastname', 'prefixName', 'organization', 'title'],
  },
  {
    id: 1,
    title: 'Contact Information',
    description: 'Email, phone, and business details',
    fields: ['email', 'phone', 'TRN'],
  },
  {
    id: 2,
    title: 'Address Information',
    description: 'Location and address details',
    fields: ['city', 'stateOrProvince', 'area', 'mailingAddress', 'country', 'webSite', 'postalCode'],
  },
] as const;

// Pagination settings
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

// Date formats
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DISPLAY_DATE_FORMAT = 'MMM DD, YYYY';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

// Export formats
export const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV' },
  { value: 'excel', label: 'Excel' },
] as const;

// Customer table columns
export const CUSTOMER_TABLE_COLUMNS = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'phone', label: 'Phone', sortable: false },
  { key: 'organization', label: 'Organization', sortable: true },
  { key: 'city', label: 'City', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'createdAt', label: 'Created', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false },
] as const;

// Customer ledger table columns
export const CUSTOMER_LEDGER_COLUMNS = [
  { key: 'transactionDate', label: 'Date', sortable: true },
  { key: 'transactionType', label: 'Type', sortable: true },
  { key: 'description', label: 'Description', sortable: false },
  { key: 'referenceNumber', label: 'Reference', sortable: false },
  { key: 'amount', label: 'Amount', sortable: true },
  { key: 'balance', label: 'Balance', sortable: false },
] as const;

// Permissions
export const PERMISSIONS = {
  VIEW_CUSTOMER: 'Customers',
  CREATE_CUSTOMER: 'CreateCustomer',
  EDIT_CUSTOMER: 'EditCustomer',
  DELETE_CUSTOMER: 'DeleteCustomer',
  VIEW_LEDGER: 'CustomerLedger',
  CREATE_LEDGER: 'CreateCustomerLedger',
} as const;

// Default customer values
export const DEFAULT_CUSTOMER_VALUES: Partial<CustomerFilters> = {
  status: 'all',
  search: '',
};

// Validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_URL: 'Please enter a valid website URL',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max: number) => `Must be no more than ${max} characters`,
} as const;

// API endpoints
export const API_ENDPOINTS = {
  CUSTOMERS: '/customers',
  CUSTOMER_BY_ID: (id: string) => `/customers/${id}`,
  CHECK_EMAIL: (email: string) => `/customers/checkEmail/${email}`,
  CUSTOMER_LEDGER: '/customerLedger',
  CUSTOMER_LEDGER_BY_ID: (customerId: string) => `/customerLedger/customer/${customerId}`,
  EXPORT_CUSTOMERS: '/customers/export',
} as const;

// Countries list (common ones)
export const COUNTRIES = [
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'IN', label: 'India' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'BD', label: 'Bangladesh' },
  { value: 'EG', label: 'Egypt' },
  { value: 'JO', label: 'Jordan' },
  { value: 'LB', label: 'Lebanon' },
] as const;

// UAE Emirates/States
export const UAE_EMIRATES = [
  { value: 'Abu Dhabi', label: 'Abu Dhabi' },
  { value: 'Dubai', label: 'Dubai' },
  { value: 'Sharjah', label: 'Sharjah' },
  { value: 'Ajman', label: 'Ajman' },
  { value: 'Umm Al Quwain', label: 'Umm Al Quwain' },
  { value: 'Ras Al Khaimah', label: 'Ras Al Khaimah' },
  { value: 'Fujairah', label: 'Fujairah' },
] as const;
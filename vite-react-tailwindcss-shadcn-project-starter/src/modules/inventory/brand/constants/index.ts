// Brand Table Constants
export const BRAND_TABLE_COLUMNS = [
  { key: 'name', label: 'Brand Name', sortable: true },
  { key: 'description', label: 'Description', sortable: false },
  { key: 'createdAt', label: 'Date', sortable: true },
  { key: 'actions', label: 'Action', sortable: false },
] as const;

// Pagination Constants
export const BRAND_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 13,
  RECORDS_PER_PAGE_OPTIONS: [10, 13, 25, 50],
} as const;

// Sort Options
export const BRAND_SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'createdAt', label: 'Created Date' },
] as const;

export const SORT_ORDER_OPTIONS = [
  { value: 'asc', label: 'Ascending' },
  { value: 'desc', label: 'Descending' },
] as const;

// Form Field Constants
export const BRAND_FORM_FIELDS = {
  NAME: 'name',
  DESCRIPTION: 'description',
  TAGS: 'tags',
} as const;

// Validation Constants
export const BRAND_VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  MAX_TAGS: 10,
  TAG_MAX_LENGTH: 50,
} as const;

// Permission Constants
export const BRAND_PERMISSIONS = {
  CREATE: 'brand:create',
  READ: 'brand:read',
  UPDATE: 'brand:update',
  DELETE: 'brand:delete',
} as const;

// API Endpoints
export const BRAND_ENDPOINTS = {
  BASE: 'brand',
  SINGLE: (id: string) => `brand/${id}`,
  SEARCH: 'brand/search',
  STATS: 'brand/stats',
  EXPORT: 'brand/export',
} as const;

// Error Messages
export const BRAND_ERROR_MESSAGES = {
  REQUIRED_NAME: 'Brand name is required',
  NAME_TOO_SHORT: `Brand name must be at least ${BRAND_VALIDATION.NAME_MIN_LENGTH} characters`,
  NAME_TOO_LONG: `Brand name must be less than ${BRAND_VALIDATION.NAME_MAX_LENGTH} characters`,
  DESCRIPTION_TOO_LONG: `Description must be less than ${BRAND_VALIDATION.DESCRIPTION_MAX_LENGTH} characters`,
  DUPLICATE_NAME: 'A brand with this name already exists',
  NETWORK_ERROR: 'Network error. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred',
  DELETE_CONFIRMATION: 'Are you sure?',
  DELETE_WARNING: 'Once deleted, you will not be able to recover this data!',
} as const;

// Success Messages
export const BRAND_SUCCESS_MESSAGES = {
  CREATED: 'Brand created successfully',
  UPDATED: 'Brand updated successfully',
  DELETED: 'Brand deleted successfully',
} as const;

// UI Constants
export const BRAND_UI = {
  SEARCH_PLACEHOLDER: 'Search',
  NO_RESULTS: 'No records found',
  LOADING: 'Loading brands...',
  ADD_BUTTON: 'Add brand',
  EDIT_BUTTON: 'Edit',
  DELETE_BUTTON: 'Delete',
  VIEW_BUTTON: 'View',
  SAVE_BUTTON: 'Save',
  CANCEL_BUTTON: 'Cancel',
  SUBMIT_BUTTON: 'Submit',
  UPDATE_BUTTON: 'Update',
  EXPORT_BUTTON: 'Export Report',
} as const;

// Form Labels
export const BRAND_FORM_LABELS = {
  NAME: 'Brand Name',
  DESCRIPTION: 'Description',
  TAGS: 'Tags',
  NAME_PLACEHOLDER: 'Enter a brand name',
  DESCRIPTION_PLACEHOLDER: 'Description',
  TAGS_PLACEHOLDER: 'Add tags (optional)',
} as const;

// Export all constants
export {
  BRAND_TABLE_COLUMNS,
  BRAND_PAGINATION,
  BRAND_SORT_OPTIONS,
  SORT_ORDER_OPTIONS,
  BRAND_FORM_FIELDS,
  BRAND_VALIDATION,
  BRAND_PERMISSIONS,
  BRAND_ENDPOINTS,
  BRAND_ERROR_MESSAGES,
  BRAND_SUCCESS_MESSAGES,
  BRAND_UI,
  BRAND_FORM_LABELS,
};
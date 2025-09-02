// Category Table Constants
export const CATEGORY_TABLE_COLUMNS = [
  { key: 'name', label: 'Category Name', sortable: true },
  { key: 'description', label: 'Description', sortable: false },
  { key: 'createdAt', label: 'Date', sortable: true },
  { key: 'actions', label: 'Action', sortable: false },
] as const;

// Pagination Constants
export const CATEGORY_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 13,
  RECORDS_PER_PAGE_OPTIONS: [10, 13, 25, 50],
} as const;

// Sort Options
export const CATEGORY_SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'createdAt', label: 'Created Date' },
] as const;

export const SORT_ORDER_OPTIONS = [
  { value: 'asc', label: 'Ascending' },
  { value: 'desc', label: 'Descending' },
] as const;

// Form Field Constants
export const CATEGORY_FORM_FIELDS = {
  NAME: 'name',
  DESCRIPTION: 'description',
  TAGS: 'tags',
} as const;

// Validation Constants
export const CATEGORY_VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  MAX_TAGS: 10,
  TAG_MAX_LENGTH: 50,
} as const;

// Permission Constants
export const CATEGORY_PERMISSIONS = {
  CREATE: 'category:create',
  READ: 'category:read',
  UPDATE: 'category:update',
  DELETE: 'category:delete',
} as const;

// API Endpoints
export const CATEGORY_ENDPOINTS = {
  BASE: 'category',
  SINGLE: (id: string) => `category/${id}`,
  SEARCH: 'category/search',
  STATS: 'category/stats',
  EXPORT: 'category/export',
} as const;

// Error Messages
export const CATEGORY_ERROR_MESSAGES = {
  REQUIRED_NAME: 'Category name is required',
  NAME_TOO_SHORT: `Category name must be at least ${CATEGORY_VALIDATION.NAME_MIN_LENGTH} characters`,
  NAME_TOO_LONG: `Category name must be less than ${CATEGORY_VALIDATION.NAME_MAX_LENGTH} characters`,
  DESCRIPTION_TOO_LONG: `Description must be less than ${CATEGORY_VALIDATION.DESCRIPTION_MAX_LENGTH} characters`,
  DUPLICATE_NAME: 'A category with this name already exists',
  NETWORK_ERROR: 'Network error. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred',
  DELETE_CONFIRMATION: 'Are you sure?',
  DELETE_WARNING: 'Once deleted, you will not be able to recover this data!',
} as const;

// Success Messages
export const CATEGORY_SUCCESS_MESSAGES = {
  CREATED: 'Category created successfully',
  UPDATED: 'Category updated successfully',
  DELETED: 'Category deleted successfully',
} as const;

// UI Constants
export const CATEGORY_UI = {
  SEARCH_PLACEHOLDER: 'Search',
  NO_RESULTS: 'No records found',
  LOADING: 'Loading categories...',
  ADD_BUTTON: 'Add category',
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
export const CATEGORY_FORM_LABELS = {
  NAME: 'Category Name',
  DESCRIPTION: 'Description',
  TAGS: 'Tags',
  NAME_PLACEHOLDER: 'Enter a category name',
  DESCRIPTION_PLACEHOLDER: 'Description',
  TAGS_PLACEHOLDER: 'Add tags (optional)',
} as const;

// View Mode Constants
export const CATEGORY_VIEW_MODES = {
  LIST: 'list',
  GRID: 'grid',
  TABLE: 'table',
} as const;

// Status Constants
export const CATEGORY_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DELETED: 'deleted',
} as const;

// Export all constants
// export {
//   CATEGORY_TABLE_COLUMNS,
//   CATEGORY_PAGINATION,
//   CATEGORY_SORT_OPTIONS,
//   SORT_ORDER_OPTIONS,
//   CATEGORY_FORM_FIELDS,
//   CATEGORY_VALIDATION,
//   CATEGORY_PERMISSIONS,
//   CATEGORY_ENDPOINTS,
//   CATEGORY_ERROR_MESSAGES,
//   CATEGORY_SUCCESS_MESSAGES,
//   CATEGORY_UI,
//   CATEGORY_FORM_LABELS,
//   CATEGORY_VIEW_MODES,
//   CATEGORY_STATUS,
// };
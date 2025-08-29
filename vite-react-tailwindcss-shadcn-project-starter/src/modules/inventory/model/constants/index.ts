// Model Table Constants
export const MODEL_TABLE_COLUMNS = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'description', label: 'Description', sortable: false },
  { key: 'createdAt', label: 'Created At', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false },
] as const;

// Pagination Constants
export const MODEL_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  RECORDS_PER_PAGE_OPTIONS: [5, 10, 20, 50],
} as const;

// Sort Options
export const MODEL_SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'createdAt', label: 'Created Date' },
] as const;

export const SORT_ORDER_OPTIONS = [
  { value: 'asc', label: 'Ascending' },
  { value: 'desc', label: 'Descending' },
] as const;

// Form Field Constants
export const MODEL_FORM_FIELDS = {
  NAME: 'name',
  DESCRIPTION: 'description',
  TAGS: 'tags',
} as const;

// Validation Constants
export const MODEL_VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  MAX_TAGS: 10,
  TAG_MAX_LENGTH: 50,
} as const;

// Permission Constants
export const MODEL_PERMISSIONS = {
  CREATE: 'model:create',
  READ: 'model:read',
  UPDATE: 'model:update',
  DELETE: 'model:delete',
} as const;

// API Endpoints
export const MODEL_ENDPOINTS = {
  BASE: 'model',
  SINGLE: (id: string) => `model/${id}`,
  SEARCH: 'model/search',
  STATS: 'model/stats',
  EXPORT: 'model/export',
} as const;

// Error Messages
export const MODEL_ERROR_MESSAGES = {
  REQUIRED_NAME: 'Model name is required',
  NAME_TOO_SHORT: `Model name must be at least ${MODEL_VALIDATION.NAME_MIN_LENGTH} characters`,
  NAME_TOO_LONG: `Model name must be less than ${MODEL_VALIDATION.NAME_MAX_LENGTH} characters`,
  DESCRIPTION_TOO_LONG: `Description must be less than ${MODEL_VALIDATION.DESCRIPTION_MAX_LENGTH} characters`,
  DUPLICATE_NAME: 'A model with this name already exists',
  NETWORK_ERROR: 'Network error. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred',
  DELETE_CONFIRMATION: 'Are you sure you want to delete this model?',
  DELETE_WARNING: 'This action cannot be undone.',
} as const;

// Success Messages
export const MODEL_SUCCESS_MESSAGES = {
  CREATED: 'Model created successfully',
  UPDATED: 'Model updated successfully',
  DELETED: 'Model deleted successfully',
} as const;

// UI Constants
export const MODEL_UI = {
  SEARCH_PLACEHOLDER: 'Search models...',
  NO_RESULTS: 'No models found',
  LOADING: 'Loading models...',
  ADD_BUTTON: 'Add Model',
  EDIT_BUTTON: 'Edit',
  DELETE_BUTTON: 'Delete',
  VIEW_BUTTON: 'View',
  SAVE_BUTTON: 'Save',
  CANCEL_BUTTON: 'Cancel',
  SUBMIT_BUTTON: 'Submit',
  UPDATE_BUTTON: 'Update',
} as const;

// Form Labels
export const MODEL_FORM_LABELS = {
  NAME: 'Model Name',
  DESCRIPTION: 'Description',
  TAGS: 'Tags',
  NAME_PLACEHOLDER: 'Enter model name',
  DESCRIPTION_PLACEHOLDER: 'Enter description (optional)',
  TAGS_PLACEHOLDER: 'Add tags (optional)',
} as const;

// View Mode Constants
export const MODEL_VIEW_MODES = {
  LIST: 'list',
  GRID: 'grid',
  TABLE: 'table',
} as const;

// Status Constants
export const MODEL_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

// Export all constants
export {
  MODEL_TABLE_COLUMNS,
  MODEL_PAGINATION,
  MODEL_SORT_OPTIONS,
  SORT_ORDER_OPTIONS,
  MODEL_FORM_FIELDS,
  MODEL_VALIDATION,
  MODEL_PERMISSIONS,
  MODEL_ENDPOINTS,
  MODEL_ERROR_MESSAGES,
  MODEL_SUCCESS_MESSAGES,
  MODEL_UI,
  MODEL_FORM_LABELS,
  MODEL_VIEW_MODES,
  MODEL_STATUS,
};
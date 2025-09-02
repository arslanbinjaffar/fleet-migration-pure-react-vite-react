// Fleet Type Constants

// API Endpoints
export const FLEET_TYPE_ENDPOINTS = {
  GET_FLEET_TYPES: '/fleet-type',
  GET_FLEET_TYPE_BY_ID: (id: string) => `/fleet-type/${id}`,
  CREATE_FLEET_TYPE: '/fleet-type',
  UPDATE_FLEET_TYPE: (id: string) => `/fleet-type/${id}`,
  DELETE_FLEET_TYPE: (id: string) => `/fleet-type/delete/${id}`,
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  FLEET_TYPE_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    REQUIRED: true,
  },
  DESCRIPTION: {
    MAX_LENGTH: 500,
    REQUIRED: false,
  },
} as const;

// UI Constants
export const UI_CONSTANTS = {
  RECORDS_PER_PAGE: 10,
  SEARCH_DEBOUNCE_MS: 300,
  DEFAULT_SORT_BY: 'createdAt',
  DEFAULT_SORT_ORDER: 'desc' as const,
} as const;

// Messages
export const FLEET_TYPE_MESSAGES = {
  SUCCESS: {
    CREATED: 'Fleet type created successfully',
    UPDATED: 'Fleet type updated successfully',
    DELETED: 'Fleet type deleted successfully',
    FETCHED: 'Fleet types loaded successfully',
  },
  ERROR: {
    CREATE_FAILED: 'Failed to create fleet type',
    UPDATE_FAILED: 'Failed to update fleet type',
    DELETE_FAILED: 'Failed to delete fleet type',
    FETCH_FAILED: 'Failed to fetch fleet types',
    NOT_FOUND: 'Fleet type not found',
    VALIDATION_FAILED: 'Please check the form fields and try again',
  },
  CONFIRM: {
    DELETE: 'Are you sure you want to delete this fleet type?',
    DELETE_WARNING: 'This action cannot be undone.',
  },
} as const;

// Labels
export const FLEET_TYPE_LABELS = {
  FLEET_TYPE_NAME: 'Fleet Type Name',
  DESCRIPTION: 'Description',
  CREATED_AT: 'Created Date',
  ACTIONS: 'Actions',
  SEARCH_PLACEHOLDER: 'Search fleet types...',
  ADD_FLEET_TYPE: 'Add Fleet Type',
  EDIT_FLEET_TYPE: 'Edit Fleet Type',
  VIEW_FLEET_TYPE: 'View Fleet Type',
  DELETE_FLEET_TYPE: 'Delete Fleet Type',
  FLEET_TYPES: 'Fleet Types',
  NO_FLEET_TYPES: 'No fleet types available',
  TOTAL_RECORDS: 'Total Records',
} as const;

// Table Columns
export const TABLE_COLUMNS = [
  { key: 'index', label: '#', sortable: false, width: '60px' },
  { key: 'fleetType', label: FLEET_TYPE_LABELS.FLEET_TYPE_NAME, sortable: true },
  { key: 'description', label: FLEET_TYPE_LABELS.DESCRIPTION, sortable: false },
  { key: 'createdAt', label: FLEET_TYPE_LABELS.CREATED_AT, sortable: true },
  { key: 'actions', label: FLEET_TYPE_LABELS.ACTIONS, sortable: false, width: '120px' },
] as const;

// Export all constants
export const FLEET_TYPE_CONSTANTS = {
  ENDPOINTS: FLEET_TYPE_ENDPOINTS,
  VALIDATION: VALIDATION_RULES,
  UI: UI_CONSTANTS,
  MESSAGES: FLEET_TYPE_MESSAGES,
  LABELS: FLEET_TYPE_LABELS,
  TABLE: TABLE_COLUMNS,
} as const;
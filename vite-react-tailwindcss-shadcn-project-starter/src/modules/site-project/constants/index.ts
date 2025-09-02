// Site Project Constants

// API Endpoints
export const SITE_PROJECT_ENDPOINTS = {
  GET_SITE_PROJECTS: '/site-project',
  GET_SITE_PROJECT_BY_ID: (id: string) => `/site-project/details/${id}`,
  CREATE_SITE_PROJECT: '/site-project',
  UPDATE_SITE_PROJECT: (id: string) => `/site-project/update/${id}`,
  DELETE_SITE_PROJECT: (id: string) => `/site-project/delete/${id}`,
  GET_SITE_PROJECT_FLEETS: (id: string) => `/site-project-fleets/${id}`,
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  PROJECT_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    REQUIRED: true,
  },
  PROJECT_OWNER: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    REQUIRED: true,
  },
  CONTRACTOR: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    REQUIRED: true,
  },
  SERVICE_PROVIDER: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    REQUIRED: true,
  },
  SUB_PROJECT_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    REQUIRED: true,
  },
  ZONAL_SITE: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    REQUIRED: true,
  },
  COLOR_FORMAT: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
} as const;

// UI Constants
export const UI_CONSTANTS = {
  RECORDS_PER_PAGE: 10,
  SEARCH_DEBOUNCE_MS: 300,
  DEFAULT_SORT_BY: 'createdAt',
  DEFAULT_SORT_ORDER: 'desc' as const,
  DEFAULT_PROJECT_COLOR: '#32CD32',
} as const;

// Project Type Options
export const PROJECT_TYPE_OPTIONS = [
  { value: 'OIL & GAS', label: 'OIL & GAS' },
  { value: 'Industrial Project', label: 'Industrial Project' },
  { value: 'Factory Project', label: 'Factory Project' },
] as const;

// Zone Options
export const ZONE_OPTIONS = [
  { value: 'Central', label: 'Central' },
  { value: 'Regional', label: 'Regional' },
  { value: 'Northern', label: 'Northern' },
  { value: 'Southern', label: 'Southern' },
  { value: 'Eastern', label: 'Eastern' },
  { value: 'Western', label: 'Western' },
] as const;

// Project Name Options
export const PROJECT_NAME_OPTIONS = [
  { value: 'RLPP-1', label: 'RLPP-1' },
  { value: 'RLPP-2', label: 'RLPP-2' },
  { value: 'NFS', label: 'NFS' },
  { value: 'NFE', label: 'NFE' },
] as const;

// Form Sections
export const FORM_SECTIONS = {
  'Project Information': [
    'projectName',
    'typeOfProject',
    'projectOwner',
    'mainContractor',
    'subContractor',
    'serviceProvider',
    'mainClient',
  ],
  'Project Timeline': ['startDate', 'expiryDate'],
  'Project Details': ['subProjectName', 'subProject', 'zone', 'zonalSite', 'projectColor'],
} as const;

// Messages
export const SITE_PROJECT_MESSAGES = {
  SUCCESS: {
    CREATED: 'Site project created successfully',
    UPDATED: 'Site project updated successfully',
    DELETED: 'Site project deleted successfully',
    FETCHED: 'Site projects loaded successfully',
  },
  ERROR: {
    CREATE_FAILED: 'Failed to create site project',
    UPDATE_FAILED: 'Failed to update site project',
    DELETE_FAILED: 'Failed to delete site project',
    FETCH_FAILED: 'Failed to fetch site projects',
    FETCH_DETAILS_FAILED: 'Failed to fetch project details',
    FETCH_FLEETS_FAILED: 'Failed to fetch assigned fleets',
    NOT_FOUND: 'Site project not found',
    VALIDATION_FAILED: 'Please check the form fields and try again',
  },
  CONFIRM: {
    DELETE: 'Are you sure you want to delete this site project?',
    DELETE_WARNING: 'This action cannot be undone.',
  },
} as const;

// Labels
export const SITE_PROJECT_LABELS = {
  // Main labels
  SITE_PROJECTS: 'Site Projects',
  ADD_SITE_PROJECT: 'Add Site Project',
  EDIT_SITE_PROJECT: 'Edit Site Project',
  VIEW_SITE_PROJECT: 'View Site Project',
  DELETE_SITE_PROJECT: 'Delete Site Project',
  PROJECT_DETAILS: 'Project Details',
  ASSIGNED_FLEETS: 'Assigned Fleets',
  
  // Field labels
  PROJECT_NAME: 'Project Name',
  TYPE_OF_PROJECT: 'Type of Project',
  PROJECT_OWNER: 'Project Owner',
  MAIN_CONTRACTOR: 'Main Contractor',
  SUB_CONTRACTOR: 'Sub Contractor',
  SERVICE_PROVIDER: 'Service Provider',
  MAIN_CLIENT: 'Main Client',
  START_DATE: 'Start Date',
  EXPIRY_DATE: 'Expiry Date',
  SUB_PROJECT: 'Sub Project',
  SUB_PROJECT_NAME: 'Sub Project Name',
  ZONE: 'Zone',
  ZONAL_SITE: 'Zonal Site',
  PROJECT_COLOR: 'Project Color',
  CREATED_AT: 'Created Date',
  ACTIONS: 'Actions',
  
  // UI labels
  SEARCH_PLACEHOLDER: 'Search projects...',
  NO_SITE_PROJECTS: 'No site projects found',
  NO_ASSIGNED_FLEETS: 'No fleets assigned to this project',
  TOTAL_RECORDS: 'Total Records',
  ALL_TYPES: 'All Types',
  FLEET_TYPE: 'Fleet Type',
  STATUS: 'Status',
  VEHICLE_NAME: 'Vehicle Name',
} as const;

// Table Columns
export const TABLE_COLUMNS = [
  { key: 'index', label: '#', sortable: false, width: '60px' },
  { key: 'projectName', label: SITE_PROJECT_LABELS.PROJECT_NAME, sortable: true },
  { key: 'typeOfProject', label: SITE_PROJECT_LABELS.TYPE_OF_PROJECT, sortable: true },
  { key: 'subProjectName', label: SITE_PROJECT_LABELS.SUB_PROJECT_NAME, sortable: false },
  { key: 'projectOwner', label: SITE_PROJECT_LABELS.PROJECT_OWNER, sortable: true },
  { key: 'mainContractor', label: SITE_PROJECT_LABELS.MAIN_CONTRACTOR, sortable: false },
  { key: 'zone', label: SITE_PROJECT_LABELS.ZONE, sortable: true },
  { key: 'startDate', label: SITE_PROJECT_LABELS.START_DATE, sortable: true },
  { key: 'actions', label: SITE_PROJECT_LABELS.ACTIONS, sortable: false, width: '120px' },
] as const;

// Export all constants
export const SITE_PROJECT_CONSTANTS = {
  ENDPOINTS: SITE_PROJECT_ENDPOINTS,
  VALIDATION: VALIDATION_RULES,
  UI: UI_CONSTANTS,
  PROJECT_TYPES: PROJECT_TYPE_OPTIONS,
  ZONES: ZONE_OPTIONS,
  PROJECT_NAMES: PROJECT_NAME_OPTIONS,
  FORM_SECTIONS,
  MESSAGES: SITE_PROJECT_MESSAGES,
  LABELS: SITE_PROJECT_LABELS,
  TABLE: TABLE_COLUMNS,
} as const;
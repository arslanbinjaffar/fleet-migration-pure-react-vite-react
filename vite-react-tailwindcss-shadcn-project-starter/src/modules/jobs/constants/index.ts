// Job module constants

// Default pagination settings
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_CURRENT_PAGE = 1;
export const DEFAULT_VIEW_MODE = 'table' as const;

// Job status options
export const JOB_STATUS_OPTIONS = [
  { value: 'Inspection', label: 'Inspection', color: '#28a745' },
  { value: 'Diagnosis', label: 'Diagnosis', color: '#dc3545' },
  { value: 'Repair', label: 'Repair', color: '#28a745' },
  { value: 'Testing', label: 'Testing', color: '#ffc107' },
  { value: 'Handover', label: 'Handover', color: '#dc3545' },
  { value: 'Completed', label: 'Completed', color: '#28a745' },
  { value: 'Cancelled', label: 'Cancelled', color: '#6c757d' },
] as const;

// Payment status options
export const PAYMENT_STATUS_OPTIONS = [
  { value: 'Paid', label: 'Paid', color: '#28a745' },
  { value: 'Unpaid', label: 'Unpaid', color: '#dc3545' },
  { value: 'Partially Paid', label: 'Partially Paid', color: '#ffc107' },
  { value: 'Overdue', label: 'Overdue', color: '#dc3545' },
] as const;

// Assignment filter options
export const ASSIGNMENT_FILTER_OPTIONS = [
  { value: 'all', label: 'All Technicians' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'unassigned', label: 'Unassigned' },
] as const;

// Selection mode options
export const SELECTION_MODE_OPTIONS = [
  { value: 'auto', label: 'Auto Select' },
  { value: 'manual', label: 'Manual Entry' },
] as const;

// View mode options
export const VIEW_MODE_OPTIONS = [
  { value: 'table', label: 'List', icon: 'FaList' },
  { value: 'grid', label: 'Grid', icon: 'FaThLarge' },
] as const;

// Sort options
export const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date Created' },
  { value: 'jobNumber', label: 'Job Number' },
  { value: 'status', label: 'Status' },
  { value: 'customer.firstname', label: 'Customer Name' },
  { value: 'fleet.vehicleName', label: 'Vehicle Name' },
] as const;

// Export CSV headers
export const CSV_HEADERS = [
  { label: 'Job Number', key: 'jobNumber' },
  { label: 'Customer Name', key: 'customer.firstname' },
  { label: 'Vehicle Name', key: 'fleet.vehicleName' },
  { label: 'Plate Number', key: 'fleet.plateNumber' },
  { label: 'Status', key: 'status' },
  { label: 'Technician', key: 'technician_Detail.firstName' },
  { label: 'Created Date', key: 'createdAt' },
] as const;

// Form field names
export const FORM_FIELDS = {
  // Customer fields
  CUSTOMER_SELECTION_MODE: 'customerSelectionMode',
  CUSTOMER_ID: 'customerId',
  CUSTOMER_FIRSTNAME: 'customerFirstname',
  CUSTOMER_LASTNAME: 'customerLastname',
  CUSTOMER_EMAIL: 'customerEmail',
  CUSTOMER_PHONE: 'customerPhone',
  
  // Machine fields
  MACHINE_SELECTION_MODE: 'machineSelectionMode',
  FLEET_ID: 'fleetId',
  MACHINE_NAME: 'machineName',
  MACHINE_TYPE: 'machineType',
  MACHINE_BRAND: 'machineBrand',
  MACHINE_MODEL: 'machineModel',
  MACHINE_CHASSIS_NO: 'machineChassisNo',
  MACHINE_PLATE_NO: 'machinePlateNo',
  RUNNING_HOURS: 'runningHours',
  SERVICE_AREA: 'serviceArea',
  
  // Technician fields
  TECHNICIAN_SELECTION_MODE: 'technicianSelectionMode',
  TECHNICIAN: 'technician',
  MANUAL_TECHNICIAN_NAME: 'manualTechnicianName',
  MANUAL_TECHNICIAN_EMAIL: 'manualTechnicianEmail',
  
  // Job details
  REPORTED_ISSUES: 'reportedIssues',
  COMMENTS: 'comments',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  JOBS: '/jobs',
  JOB_CREATE: '/job/create',
  JOB_UPDATE: (id: string) => `/job/update/${id}`,
  JOB_DELETE: (id: string) => `/job/delete/${id}`,
  JOB_DETAILS: (id: string) => `/job/details/${id}`,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  FETCH_JOBS_FAILED: 'Failed to fetch jobs',
  CREATE_JOB_FAILED: 'Failed to create job',
  UPDATE_JOB_FAILED: 'Failed to update job',
  DELETE_JOB_FAILED: 'Failed to delete job',
  ASSIGN_TECHNICIAN_FAILED: 'Failed to assign technician',
  CLEAR_TECHNICIAN_FAILED: 'Failed to clear technician assignment',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  JOB_CREATED: 'Job created successfully',
  JOB_UPDATED: 'Job updated successfully',
  JOB_DELETED: 'Job deleted successfully',
  TECHNICIAN_ASSIGNED: 'Technician assigned successfully',
  TECHNICIAN_CLEARED: 'Technician assignment cleared successfully',
} as const;

// Modal and dialog IDs
export const MODAL_IDS = {
  CREATE_JOB: 'create-job-modal',
  EDIT_JOB: 'edit-job-modal',
  VIEW_JOB: 'view-job-modal',
  DELETE_CONFIRM: 'delete-confirm-dialog',
  MANUAL_TECHNICIAN: 'manual-technician-modal',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  JOBS_VIEW_MODE: 'jobs_view_mode',
  JOBS_PAGE_SIZE: 'jobs_page_size',
  JOBS_FILTERS: 'jobs_filters',
} as const;

// Validation rules
export const VALIDATION_RULES = {
  MIN_NAME_LENGTH: 1,
  MAX_NAME_LENGTH: 100,
  MIN_DESCRIPTION_LENGTH: 0,
  MAX_DESCRIPTION_LENGTH: 1000,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[+]?[0-9\s\-\(\)]{7,15}$/,
} as const;

// UI constants
export const UI_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  TOAST_DURATION: 3000,
  MODAL_Z_INDEX: 1050,
} as const;
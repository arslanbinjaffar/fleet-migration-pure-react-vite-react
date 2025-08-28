import { StatusOption, FilterOption } from '../types';

// Shift status options
export const SHIFT_STATUS_OPTIONS: StatusOption[] = [
  { value: 'all', label: 'All Status', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  { value: 'working', label: 'Working', color: 'text-green-600', bgColor: 'bg-green-100' },
  { value: 'standby', label: 'Standby', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { value: 'Out of service', label: 'Out of Service', color: 'text-red-600', bgColor: 'bg-red-100' },
  { value: 'stopped', label: 'Stopped', color: 'text-gray-600', bgColor: 'bg-gray-100' },
] as const;

// Shift type options
export const SHIFT_TYPE_OPTIONS = [
  { value: 'single', label: 'Single Shift' },
  { value: 'double', label: 'Double Shift' },
] as const;

// View mode options
export const VIEW_MODE_OPTIONS = [
  { value: 'table', label: 'Table View', icon: 'List' },
  { value: 'card', label: 'Card View', icon: 'Grid' },
] as const;

// Pagination settings
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

// Date formats
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm';
export const DISPLAY_DATE_FORMAT = 'MMM DD, YYYY';
export const DISPLAY_DATETIME_FORMAT = 'MMM DD, YYYY HH:mm';

// Export formats
export const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV' },
  { value: 'excel', label: 'Excel' },
] as const;

// Timesheet table columns
export const TIMESHEET_TABLE_COLUMNS = [
  { key: 'fleet', label: 'Fleet', sortable: true },
  { key: 'project', label: 'Project', sortable: true },
  { key: 'operators', label: 'Operators', sortable: false },
  { key: 'shiftType', label: 'Shift Type', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'machineHours', label: 'Machine Hours', sortable: true },
  { key: 'operatorHours', label: 'Operator Hours', sortable: false },
  { key: 'scheduledDate', label: 'Date', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false },
] as const;

// Permissions
export const PERMISSIONS = {
  VIEW_TIMESHEET: 'Timesheets',
  CREATE_TIMESHEET: 'CreateTimesheet',
  EDIT_TIMESHEET: 'EditTimesheet',
  DELETE_TIMESHEET: 'DeleteTimesheet',
  MANAGE_TIME: 'ManageTime',
  UPDATE_STATUS: 'UpdateTimesheetStatus',
} as const;

// Default timesheet values
export const DEFAULT_TIMESHEET_VALUES = {
  shiftType: 'single' as const,
  status: 'working' as const,
  viewMode: 'table' as const,
  pageSize: DEFAULT_PAGE_SIZE,
  currentPage: 1,
};

// Validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_TIME_RANGE: 'End time must be after start time',
  INVALID_DATE: 'Please enter a valid date',
  INVALID_DATETIME: 'Please enter a valid date and time',
  SECOND_OPERATOR_REQUIRED: 'Second operator is required for double shifts',
  SECOND_OPERATOR_TIMES_REQUIRED: 'Second operator times are required for double shifts',
  MIN_DURATION: (min: number) => `Duration must be at least ${min} minutes`,
  MAX_DURATION: (max: number) => `Duration cannot exceed ${max} hours`,
} as const;

// API endpoints
export const API_ENDPOINTS = {
  SCHEDULED_SHIFTS: '/shedule-shift-daily',
  SCHEDULED_SHIFTS_WITH_DATE: (from: string, to: string) => 
    `/shedule-shift-daily?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
  SHIFT_RELATED_DETAILS: '/shedule-shift/shift-related-details',
  UPDATE_SHIFT_STATUS: (id: string) => `/shedule-shift/update-status/${id}`,
  UPDATE_SHIFT_TYPE: (id: string) => `/shedule-shift/update-type/${id}`,
  DELETE_SHIFT: (id: string) => `/shedule-shift/delete/${id}`,
  CREATE_SHIFT: '/shedule-shift/create',
  UPDATE_SHIFT: (id: string) => `/shedule-shift/update/${id}`,
  UPDATE_TIMESHEET: (id: string) => `/timesheet/update/${id}`,
  EXPORT_TIMESHEETS: '/timesheets/export',
} as const;

// Time calculation constants
export const TIME_CONSTANTS = {
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
  MAX_SHIFT_HOURS: 12,
  MIN_BREAK_MINUTES: 30,
} as const;

// Status styles for legacy compatibility
export const STATUS_STYLES = {
  working: { backgroundColor: '#118D5729', color: '#118D57' },
  standby: { backgroundColor: '#B76E0029', color: '#B76E00' },
  'Out of service': { backgroundColor: '#FF563029', color: '#B71D18' },
  stopped: { backgroundColor: '#FF563029', color: '#B71D18' },
} as const;

// Default filter options
export const DEFAULT_FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All' },
];

// Form steps for timesheet creation
export const TIMESHEET_FORM_STEPS = [
  {
    id: 'shiftDetails',
    title: 'Shift Details',
    description: 'Select site, fleet, and shift type',
    fields: ['selectedSite', 'selectedFleet', 'shiftType'],
  },
  {
    id: 'operatorDetails', 
    title: 'Operator Assignment',
    description: 'Assign operators to the shift',
    fields: ['firstOperator', 'secondOperator'],
  },
  {
    id: 'timeDetails',
    title: 'Time Configuration', 
    description: 'Set working hours and schedule',
    fields: [
      'firstOperatorStartDateTime',
      'firstOperatorEndDateTime',
      'secondOperatorStartDateTime', 
      'secondOperatorEndDateTime',
      'machineStartTime',
      'machineEndTime',
      'comment'
    ],
  },
];

// Time validation constants
export const TIME_VALIDATION = {
  MIN_SHIFT_DURATION_HOURS: 1,
  MAX_SHIFT_DURATION_HOURS: 24,
  MIN_BREAK_MINUTES: 15,
  OVERLAP_TOLERANCE_MINUTES: 30,
} as const;

// Shift type colors
export const SHIFT_TYPE_COLORS = {
  single: { backgroundColor: '#00B8D929', color: '#006C9C' },
  double: { backgroundColor: '#8B5CF629', color: '#5B21B6' },
} as const;

// Card view settings
export const CARD_VIEW_SETTINGS = {
  CARDS_PER_ROW: {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
  },
  CARD_MIN_HEIGHT: '300px',
  CARD_SPACING: '1rem',
} as const;

// Search placeholder texts
export const SEARCH_PLACEHOLDERS = {
  MAIN_SEARCH: 'Search by machine, operator, fleet type, site, status, customer...',
  FLEET_SEARCH: 'Search fleets...',
  OPERATOR_SEARCH: 'Search operators...',
  PROJECT_SEARCH: 'Search projects...',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  FETCH_SHIFTS_FAILED: 'Failed to fetch shifts',
  UPDATE_STATUS_FAILED: 'Failed to update status',
  DELETE_SHIFT_FAILED: 'Failed to delete shift',
  CREATE_SHIFT_FAILED: 'Failed to create shift',
  UPDATE_SHIFT_FAILED: 'Failed to update shift',
  EXPORT_FAILED: 'Failed to export data',
  NETWORK_ERROR: 'Network error occurred',
  UNAUTHORIZED: 'You are not authorized to perform this action',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  STATUS_UPDATED: 'Status updated successfully',
  SHIFT_DELETED: 'Shift deleted successfully',
  SHIFT_CREATED: 'Shift created successfully',
  SHIFT_UPDATED: 'Shift updated successfully',
  TIMESHEET_UPDATED: 'Timesheet updated successfully',
  EXPORT_SUCCESS: 'Data exported successfully',
} as const;

// Loading states
export const LOADING_STATES = {
  FETCHING_SHIFTS: 'Loading shifts...',
  UPDATING_STATUS: 'Updating status...',
  DELETING_SHIFT: 'Deleting shift...',
  CREATING_SHIFT: 'Creating shift...',
  UPDATING_SHIFT: 'Updating shift...',
  EXPORTING_DATA: 'Exporting data...',
} as const;
import { LPOStatus, FleetStatus } from '../types';

// LPO Status Constants
export const LPO_STATUS: Record<LPOStatus, { label: string; color: string; bgColor: string }> = {
  Pending: {
    label: 'Pending',
    color: 'text-yellow-700 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
  },
  Approved: {
    label: 'Approved',
    color: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
  },
  Rejected: {
    label: 'Rejected',
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
  },
  UnderProcess: {
    label: 'Under Process',
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
  },
  Stopped: {
    label: 'Stopped',
    color: 'text-gray-700 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-900/20',
  },
  Completed: {
    label: 'Completed',
    color: 'text-purple-700 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
  },
};

// Fleet Status Constants
export const FLEET_STATUS: Record<FleetStatus, { label: string; color: string; bgColor: string }> = {
  Available: {
    label: 'Available',
    color: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
  },
  'In Use': {
    label: 'In Use',
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
  },
  Maintenance: {
    label: 'Maintenance',
    color: 'text-yellow-700 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
  },
  'Out of Service': {
    label: 'Out of Service',
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
  },
};

// Status Options for Dropdowns
export const LPO_STATUS_OPTIONS = Object.entries(LPO_STATUS).map(([value, config]) => ({
  value: value as LPOStatus,
  label: config.label,
}));

export const FLEET_STATUS_OPTIONS = Object.entries(FLEET_STATUS).map(([value, config]) => ({
  value: value as FleetStatus,
  label: config.label,
}));

// Filter Options
export const LPO_FILTER_STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  ...LPO_STATUS_OPTIONS,
];

// Pagination Constants
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];

// Date Format Constants
export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';
export const DISPLAY_DATE_FORMAT = 'MMM dd, yyyy';
export const DISPLAY_DATETIME_FORMAT = 'MMM dd, yyyy HH:mm';

// Export Constants
export const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV' },
  { value: 'excel', label: 'Excel' },
  { value: 'pdf', label: 'PDF' },
] as const;

// LPO Form Steps
export const LPO_FORM_STEPS = [
  {
    id: 'fleet-info',
    title: 'Fleet Information',
    description: 'Select fleets and set hourly rates',
    icon: 'truck',
  },
  {
    id: 'lpo-details',
    title: 'LPO Details',
    description: 'Project, dates, and reference information',
    icon: 'clipboard',
  },
  {
    id: 'customer-info',
    title: 'Customer Information',
    description: 'Customer details and contact information',
    icon: 'user',
  },
  {
    id: 'terms-conditions',
    title: 'Terms & Conditions',
    description: 'Agreement terms and conditions',
    icon: 'file-text',
  },
];

// Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_DATE: 'Please enter a valid date',
  DATE_RANGE_ERROR: 'End date must be after start date',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max: number) => `Cannot exceed ${max} characters`,
  MIN_VALUE: (min: number) => `Must be at least ${min}`,
  MAX_VALUE: (max: number) => `Cannot exceed ${max}`,
};

// API Endpoints
export const API_ENDPOINTS = {
  LPOS: '/lpo',
  LPO_BY_ID: (id: string) => `/lpo/${id}`,
  LPO_DELETE: (id: string) => `/lpo/delete/${id}`,
  LPO_STOP: (id: string) => `/lpo/stopped/${id}`,
  LPO_EXPORT: '/lpo/export',
  FLEETS: '/fleet',
  CUSTOMERS: '/customers',
  SITE_PROJECTS: '/site-project',
  FLEET_TYPES: '/fleet-type',
};

// Permission Names
export const PERMISSIONS = {
  VIEW_LPO: 'LPOS',
  CREATE_LPO: 'CreateLPO',
  EDIT_LPO: 'EditLPO',
  DELETE_LPO: 'DeleteLPO',
  EXPORT_LPO: 'ExportLPO',
  STOP_LPO: 'StopLPO',
} as const;

// Table Column Definitions
export const LPO_TABLE_COLUMNS = [
  { key: 'lpoNumber', label: 'LPO Number', sortable: true },
  { key: 'customer', label: 'Customer', sortable: true },
  { key: 'siteProject', label: 'Project', sortable: true },
  { key: 'fleetCount', label: 'Fleets', sortable: false },
  { key: 'lpoStartDate', label: 'Start Date', sortable: true },
  { key: 'lpoEndDate', label: 'End Date', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false },
];

// Default Values
export const DEFAULT_LPO_VALUES = {
  fleetIds: [],
  fleetHourlyRates: [],
  siteProjectId: '',
  purpose: '',
  lpoStartDate: new Date().toISOString().split('T')[0],
  lpoEndDate: new Date().toISOString().split('T')[0],
  referenceNumber: '',
  status: 'Pending' as LPOStatus,
  customerId: '',
  designation: '',
  address: '',
  termsAndCondition: '',
};
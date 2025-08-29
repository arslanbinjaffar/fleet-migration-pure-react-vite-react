// Repairs Module Constants

import { 
  FaTools, 
  FaWrench, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaFilter 
} from 'react-icons/fa';
import { MdCarRepair } from 'react-icons/md';
import { RepairStatus, RepairStatusOption } from '../types';

// Job Status Constants
export const JobStatus = Object.freeze({
  STARTED_IN: 'Started IN' as RepairStatus,
  INSPECTION: 'Inspection' as RepairStatus,
  DIAGNOSIS: 'Diagnosis' as RepairStatus,
  REPAIR: 'RepairInProgress' as RepairStatus,
  COMPLETED: 'Completed' as RepairStatus,
});

// Status Options for Dropdowns and Filters
export const STATUS_OPTIONS: RepairStatusOption[] = [
  {
    value: 'all',
    label: 'All Status',
    color: '#6c757d',
    icon: FaFilter({})
  },
  {
    value: 'Started IN',
    label: 'Started IN',
    color: '#007bff',
    icon: MdCarRepair({})
  },
  {
    value: 'RepairInProgress',
    label: 'Repair In Progress',
    color: '#ffc107',
    icon: FaWrench({})
  },
  {
    value: 'Completed',
    label: 'Completed',
    color: '#28a745',
    icon: FaCheckCircle({})
  },
  {
    value: 'Diagnosis',
    label: 'Diagnosis',
    color: '#17a2b8',
    icon: FaExclamationTriangle({})
  },
  {
    value: 'Inspection',
    label: 'Inspection',
    color: '#6610f2',
    icon: FaTools({})
  },
];

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
} as const;

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_FILE_SIZE_MB: 5,
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024,
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  JOBS: 'tracking-jobs',
  JOB_DETAILS: (jobId: string) => `job/details/${jobId}`,
  UPDATE_JOB_STATUS: (jobId: string, status: RepairStatus) => `job/update/${jobId}/${status}`,
  UPDATE_JOB: (jobId: string, status: RepairStatus) => `job/update/${jobId}/${status}`,
} as const;

// Form Field Names
export const FORM_FIELDS = {
  STATUS: 'status',
  LABOR_CHARGES: 'laborCharges',
  REPAIR_DETAILS: 'repairDetails',
  COMPLETION_NOTES: 'completionNotes',
  ATTACHMENT: 'attachment',
  COMMENT: 'comment',
  DESCRIPTION: 'description',
} as const;

// Table Column Keys
export const TABLE_COLUMNS = {
  JOB_NUMBER: 'jobNumber',
  MACHINE: 'machine',
  PLATE_NUMBER: 'plateNumber',
  CUSTOMER_NAME: 'customerName',
  STATUS: 'status',
  PHONE: 'phone',
  EMAIL: 'email',
  TECHNICIAN: 'technician',
  DATE: 'date',
  ACTIONS: 'actions',
} as const;

// Default Values
export const DEFAULT_VALUES = {
  PAGINATION: {
    currentPage: 1,
    recordsPerPage: PAGINATION.DEFAULT_PAGE_SIZE,
    totalRecords: 0,
  },
  FILTERS: {
    search: '',
    statusFilter: 'all' as const,
    dateRange: {
      from: null,
      to: null,
    },
  },
  LABOR_CHARGES: 0,
  QUANTITY: 1,
  UNIT_PRICE: 0,
  DISCOUNT: 0,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  FETCH_JOBS_FAILED: 'Failed to fetch repair jobs',
  FETCH_JOB_DETAILS_FAILED: 'Failed to fetch job details',
  UPDATE_STATUS_FAILED: 'Failed to update job status',
  UPDATE_JOB_FAILED: 'Failed to update job',
  FILE_SIZE_EXCEEDED: (maxSize: number) => `File size should be less than ${maxSize}MB`,
  INVALID_FILE_TYPE: 'Invalid file type',
  REQUIRED_FIELD: (field: string) => `${field} is required`,
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  STATUS_UPDATED: 'Status updated successfully',
  JOB_UPDATED: 'Job updated successfully',
  FILE_UPLOADED: 'File uploaded successfully',
} as const;
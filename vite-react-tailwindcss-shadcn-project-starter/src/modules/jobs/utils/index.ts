import { Job, JobStatus, PaymentStatus, StatusOption } from '../types';
import { JOB_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS } from '../constants';

// Status utility functions
export const getJobStatusStyle = (status?: JobStatus) => {
  const statusOption = JOB_STATUS_OPTIONS.find(opt => opt.value === status);
  
  if (!statusOption) {
    return {
      backgroundColor: '#f0f0f0',
      color: '#555',
      border: '1px dashed #6c757d',
    };
  }

  return {
    backgroundColor: `${statusOption.color}20`,
    color: statusOption.color,
    border: `1px solid ${statusOption.color}`,
  };
};

export const getPaymentStatusStyle = (status?: PaymentStatus) => {
  const statusOption = PAYMENT_STATUS_OPTIONS.find(opt => opt.value === status);
  
  if (!statusOption) {
    return {
      backgroundColor: '#f0f0f0',
      color: '#555',
      border: '1px dashed #6c757d',
    };
  }

  return {
    backgroundColor: `${statusOption.color}20`,
    color: statusOption.color,
    border: `1px solid ${statusOption.color}`,
  };
};

export const getStatusBadgeVariant = (status?: string) => {
  switch (status) {
    case 'Completed':
    case 'Paid':
      return 'success';
    case 'Inspection':
      return 'info';
    case 'Diagnosis':
      return 'primary';
    case 'Repair In Progress':
    case 'Testing':
    case 'Partially Paid':
      return 'warning';
    case 'Invoiced':
      return 'dark';
    case 'Cancelled':
    case 'Unpaid':
    case 'Overdue':
      return 'danger';
    default:
      return 'secondary';
  }
};

// Technician utility functions
export const getTechnicianDisplayName = (job: Job): string => {
  if (job.manualTechnician) {
    return job.manualTechnician.name || job.manualTechnician.email || 'Manual Technician';
  }
  
  if (job.technician_Detail) {
    return `${job.technician_Detail.firstName || ''} ${job.technician_Detail.lastName || ''}`.trim();
  }
  
  if (job.technicianJob) {
    return job.technicianJob.name || '';
  }
  
  return 'Unassigned';
};

export const isTechnicianAssigned = (job: Job): boolean => {
  return !!(job.technician || job.manualTechnician || job.technicianJob);
};

// Customer utility functions
export const getCustomerDisplayName = (job: Job): string => {
  if (job.customer) {
    const prefix = job.customer.prefixName ? `${job.customer.prefixName} ` : '';
    return `${prefix}${job.customer.firstname} ${job.customer.lastname}`.trim();
  }
  
  if (job.customerJob) {
    return `${job.customerJob.firstname || ''} ${job.customerJob.lastname || ''}`.trim();
  }
  
  return 'Unknown Customer';
};

export const getCustomerContact = (job: Job): { phone?: string; email?: string } => {
  if (job.customer) {
    return {
      phone: job.customer.phone,
      email: job.customer.email,
    };
  }
  
  if (job.customerJob) {
    return {
      phone: job.customerJob.phone,
      email: job.customerJob.email,
    };
  }
  
  return {};
};

// Fleet/Machine utility functions
export const getMachineDisplayName = (job: Job): string => {
  if (job.fleet) {
    return job.fleet.vehicleName;
  }
  
  if (job.FleetbyTbcJob) {
    return job.FleetbyTbcJob.machineName || 'Unknown Machine';
  }
  
  return 'Unknown Machine';
};

export const getMachinePlateNumber = (job: Job): string => {
  if (job.fleet) {
    return job.fleet.plateNumber;
  }
  
  if (job.FleetbyTbcJob) {
    return job.FleetbyTbcJob.machinePlateNo || 'N/A';
  }
  
  return 'N/A';
};

// Date utility functions
export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return 'Invalid Date';
  }
};

export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return 'Invalid Date';
  }
};

export const isDateExpired = (dateString?: string): boolean => {
  if (!dateString) return false;
  
  try {
    return new Date(dateString) < new Date();
  } catch {
    return false;
  }
};

// Currency utility functions
export const formatCurrency = (amount?: number, currency = 'USD'): string => {
  if (amount === undefined || amount === null) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const calculateBalance = (totalAmount?: number, paidAmount?: number): number => {
  const total = Number(totalAmount) || 0;
  const paid = Number(paidAmount) || 0;
  return Math.max(0, total - paid);
};

// Array parsing utility (for JSON string fields)
export const parseArrayInput = (input: any): any[] => {
  if (Array.isArray(input)) return input;

  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
};

// Search and filter utilities
export const filterJobs = (jobs: Job[], searchQuery: string): Job[] => {
  if (!searchQuery.trim()) return jobs;
  
  const query = searchQuery.toLowerCase();
  
  return jobs.filter(job => {
    // Search in job number
    if (job.jobNumber?.toLowerCase().includes(query)) return true;
    
    // Search in customer name
    const customerName = getCustomerDisplayName(job).toLowerCase();
    if (customerName.includes(query)) return true;
    
    // Search in machine name
    const machineName = getMachineDisplayName(job).toLowerCase();
    if (machineName.includes(query)) return true;
    
    // Search in plate number
    const plateNumber = getMachinePlateNumber(job).toLowerCase();
    if (plateNumber.includes(query)) return true;
    
    // Search in technician name
    const technicianName = getTechnicianDisplayName(job).toLowerCase();
    if (technicianName.includes(query)) return true;
    
    // Search in status
    if (job.status?.toLowerCase().includes(query)) return true;
    
    return false;
  });
};

export const sortJobs = (jobs: Job[], sortBy: string, sortOrder: 'asc' | 'desc' = 'desc'): Job[] => {
  return [...jobs].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sortBy) {
      case 'jobNumber':
        aValue = a.jobNumber || '';
        bValue = b.jobNumber || '';
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'status':
        aValue = a.status || '';
        bValue = b.status || '';
        break;
      case 'customer':
        aValue = getCustomerDisplayName(a);
        bValue = getCustomerDisplayName(b);
        break;
      case 'machine':
        aValue = getMachineDisplayName(a);
        bValue = getMachineDisplayName(b);
        break;
      case 'technician':
        aValue = getTechnicianDisplayName(a);
        bValue = getTechnicianDisplayName(b);
        break;
      default:
        aValue = a.createdAt;
        bValue = b.createdAt;
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};

// Pagination utilities
export const paginateArray = <T>(array: T[], page: number, pageSize: number): T[] => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return array.slice(startIndex, endIndex);
};

export const calculateTotalPages = (totalItems: number, pageSize: number): number => {
  return Math.ceil(totalItems / pageSize);
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[0-9\s\-\(\)]{7,15}$/;
  return phoneRegex.test(phone);
};

// Export utilities
export const prepareJobsForExport = (jobs: Job[]) => {
  return jobs.map(job => ({
    'Job Number': job.jobNumber,
    'Customer Name': getCustomerDisplayName(job),
    'Customer Phone': getCustomerContact(job).phone || 'N/A',
    'Customer Email': getCustomerContact(job).email || 'N/A',
    'Machine Name': getMachineDisplayName(job),
    'Plate Number': getMachinePlateNumber(job),
    'Technician': getTechnicianDisplayName(job),
    'Status': job.status || 'N/A',
    'Created Date': formatDate(job.createdAt),
    'Description': job.description || 'N/A',
  }));
};

// Local storage utilities
export const saveToLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
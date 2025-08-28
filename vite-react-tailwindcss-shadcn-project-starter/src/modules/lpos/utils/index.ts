import { format, parseISO, isValid, differenceInDays } from 'date-fns';
import { LPO, LPOStatus, FleetStatus, Customer, SiteProject } from '../types';
import { LPO_STATUS, FLEET_STATUS, DISPLAY_DATE_FORMAT, DISPLAY_DATETIME_FORMAT } from '../constants';

// Date Utilities
export const formatDate = (date: string | Date, formatStr: string = DISPLAY_DATE_FORMAT): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? format(dateObj, formatStr) : 'Invalid Date';
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, DISPLAY_DATETIME_FORMAT);
};

export const isDateInRange = (date: string, startDate: string, endDate: string): boolean => {
  try {
    const checkDate = parseISO(date);
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    return checkDate >= start && checkDate <= end;
  } catch (error) {
    return false;
  }
};

export const getDaysDifference = (startDate: string, endDate: string): number => {
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    return differenceInDays(end, start);
  } catch (error) {
    return 0;
  }
};

// Status Utilities
export const getStatusConfig = (status: LPOStatus) => {
  return LPO_STATUS[status] || LPO_STATUS.Pending;
};

export const getFleetStatusConfig = (status: FleetStatus) => {
  return FLEET_STATUS[status] || FLEET_STATUS.Available;
};

export const isLPOActive = (status: LPOStatus): boolean => {
  return ['Approved', 'UnderProcess'].includes(status);
};

export const isLPOEditable = (status: LPOStatus): boolean => {
  return ['Pending', 'Rejected'].includes(status);
};

export const isLPOStoppable = (status: LPOStatus): boolean => {
  return ['Approved', 'UnderProcess'].includes(status);
};

// LPO Utilities
export const generateLPONumber = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `LPO-${timestamp}-${random}`;
};

export const calculateTotalHourlyRate = (fleetHourlyRates: { fleetId: string; hourlyRate: number }[]): number => {
  if (!fleetHourlyRates || !Array.isArray(fleetHourlyRates)) {
    return 0;
  }
  return fleetHourlyRates.reduce((total, rate) => total + (rate?.hourlyRate || 0), 0);
};

export const calculateEstimatedCost = (
  fleetHourlyRates: { fleetId: string; hourlyRate: number }[],
  startDate: string,
  endDate: string,
  hoursPerDay: number = 8
): number => {
  const totalHourlyRate = calculateTotalHourlyRate(fleetHourlyRates);
  const days = getDaysDifference(startDate, endDate) + 1; // Include both start and end dates
  return totalHourlyRate * hoursPerDay * days;
};

// Customer Utilities
export const getCustomerFullName = (customer: Customer): string => {
  return `${customer.firstname} ${customer.lastname}`.trim();
};

export const getCustomerDisplayName = (customer: Customer): string => {
  const fullName = getCustomerFullName(customer);
  return fullName || customer.email || 'Unknown Customer';
};

// Project Utilities
export const getProjectDisplayName = (project: SiteProject): string => {
  return project.projectName || project.mainClient || 'Unknown Project';
};

// Search and Filter Utilities
export const searchLPOs = (lpos: LPO[], searchQuery: string): LPO[] => {
  if (!searchQuery.trim()) return lpos;
  
  const query = searchQuery.toLowerCase();
  return lpos.filter((lpo) => {
    const customerName = lpo.customer ? getCustomerFullName(lpo.customer).toLowerCase() : '';
    const projectName = lpo.siteProject ? getProjectDisplayName(lpo.siteProject).toLowerCase() : '';
    
    return (
      lpo.lpoNumber?.toLowerCase().includes(query) ||
      lpo.referenceNumber?.toLowerCase().includes(query) ||
      lpo.purpose?.toLowerCase().includes(query) ||
      customerName.includes(query) ||
      projectName.includes(query)
    );
  });
};

export const filterLPOsByStatus = (lpos: LPO[], status: LPOStatus | 'all'): LPO[] => {
  if (status === 'all') return lpos;
  return lpos.filter((lpo) => lpo.status === status);
};

export const filterLPOsByDateRange = (
  lpos: LPO[],
  startDate?: string,
  endDate?: string
): LPO[] => {
  if (!startDate || !endDate) return lpos;
  
  return lpos.filter((lpo) => {
    return isDateInRange(lpo.lpoStartDate, startDate, endDate);
  });
};

// Validation Utilities
export const validateDateRange = (startDate: string, endDate: string): boolean => {
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    return isValid(start) && isValid(end) && end >= start;
  } catch (error) {
    return false;
  }
};

export const validateFleetHourlyRates = (
  fleetIds: string[],
  fleetHourlyRates: { fleetId: string; hourlyRate: number }[]
): boolean => {
  if (fleetIds.length !== fleetHourlyRates.length) return false;
  
  const fleetIdsSet = new Set(fleetIds);
  return fleetHourlyRates.every(
    (rate) => fleetIdsSet.has(rate.fleetId) && rate.hourlyRate >= 0
  );
};

// Export Utilities
export const prepareLPOsForExport = (lpos: LPO[]) => {
  return lpos.map((lpo) => ({
    'LPO Number': lpo.lpoNumber,
    'Customer': lpo.customer ? getCustomerFullName(lpo.customer) : '',
    'Project': lpo.siteProject ? getProjectDisplayName(lpo.siteProject) : '',
    'Purpose': lpo.purpose,
    'Start Date': formatDate(lpo.lpoStartDate),
    'End Date': formatDate(lpo.lpoEndDate),
    'Reference Number': lpo.referenceNumber,
    'Status': lpo.status,
    'Designation': lpo.designation,
    'Address': lpo.address,
    'Fleet Count': lpo.fleetIds?.length || 0,
    'Total Hourly Rate': calculateTotalHourlyRate(lpo.fleetHourlyRates || []),
    'Created At': formatDateTime(lpo.createdAt),
    'Updated At': formatDateTime(lpo.updatedAt),
  }));
};

// Sorting Utilities
export const sortLPOs = (lpos: LPO[], sortBy: string, sortOrder: 'asc' | 'desc' = 'asc'): LPO[] => {
  return [...lpos].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sortBy) {
      case 'lpoNumber':
        aValue = a.lpoNumber || '';
        bValue = b.lpoNumber || '';
        break;
      case 'customer':
        aValue = a.customer ? getCustomerFullName(a.customer) : '';
        bValue = b.customer ? getCustomerFullName(b.customer) : '';
        break;
      case 'siteProject':
        aValue = a.siteProject ? getProjectDisplayName(a.siteProject) : '';
        bValue = b.siteProject ? getProjectDisplayName(b.siteProject) : '';
        break;
      case 'lpoStartDate':
      case 'lpoEndDate':
      case 'createdAt':
      case 'updatedAt':
        aValue = new Date(a[sortBy as keyof LPO] as string).getTime();
        bValue = new Date(b[sortBy as keyof LPO] as string).getTime();
        break;
      default:
        aValue = a[sortBy as keyof LPO] || '';
        bValue = b[sortBy as keyof LPO] || '';
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};

// Pagination Utilities
export const paginateLPOs = (lpos: LPO[], page: number, pageSize: number) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    data: lpos.slice(startIndex, endIndex),
    total: lpos.length,
    page,
    pageSize,
    totalPages: Math.ceil(lpos.length / pageSize),
    hasNextPage: endIndex < lpos.length,
    hasPreviousPage: page > 1,
  };
};

// File Size Utilities
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Error Handling Utilities
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.data?.message) return error.data.message;
  if (error?.response?.data?.message) return error.response.data.message;
  return 'An unexpected error occurred';
};

// URL Utilities
export const buildLPOUrl = (lpoId: string, action?: 'view' | 'edit'): string => {
  const baseUrl = `/lpos/${lpoId}`;
  return action ? `${baseUrl}/${action}` : baseUrl;
};
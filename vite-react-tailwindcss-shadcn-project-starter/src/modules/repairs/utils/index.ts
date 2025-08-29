// Repairs Module Utilities

import { RepairStatus, RepairStatusOption, RepairJob } from '../types';
import { STATUS_OPTIONS, FILE_UPLOAD } from '../constants';

/**
 * Get status style configuration for UI display
 */
export const getStatusStyle = (status: RepairStatus) => {
  const statusObj = STATUS_OPTIONS.find((opt) => opt.value === status);
  return {
    backgroundColor: `${statusObj?.color}20`,
    color: statusObj?.color,
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'capitalize' as const,
    border: `1px solid ${statusObj?.color}`,
    display: 'inline-block',
  };
};

/**
 * Get status icon for a given status
 */
export const getStatusIcon = (status: RepairStatus) => {
  const statusObj = STATUS_OPTIONS.find((opt) => opt.value === status);
  return statusObj?.icon || null;
};

/**
 * Get status option by value
 */
export const getStatusOption = (status: RepairStatus | 'all'): RepairStatusOption | undefined => {
  return STATUS_OPTIONS.find((opt) => opt.value === status);
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Format date and time for display
 */
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Get customer full name from repair job
 */
export const getCustomerName = (job: RepairJob): string => {
  const customer = job.customer || job.customerJob;
  if (!customer) return 'N/A';
  return `${customer.firstname || ''} ${customer.lastname || ''}`.trim() || 'N/A';
};

/**
 * Get technician name from repair job
 */
export const getTechnicianName = (job: RepairJob): string => {
  if (job.technician_Detail) {
    return `${job.technician_Detail.firstName || ''} ${job.technician_Detail.lastName || ''}`.trim();
  }
  if (job.technicianJob) {
    return job.technicianJob.name;
  }
  return 'Unassigned';
};

/**
 * Get vehicle/machine name from repair job
 */
export const getVehicleName = (job: RepairJob): string => {
  return job.fleet?.vehicleName || job.FleetbyTbcJob?.machineName || 'N/A';
};

/**
 * Get plate number from repair job
 */
export const getPlateNumber = (job: RepairJob): string => {
  return job.fleet?.plateNumber || job.FleetbyTbcJob?.machinePlateNo || 'N/A';
};

/**
 * Get customer phone from repair job
 */
export const getCustomerPhone = (job: RepairJob): string => {
  const customer = job.customer || job.customerJob;
  return customer?.phone || 'N/A';
};

/**
 * Get customer email from repair job
 */
export const getCustomerEmail = (job: RepairJob): string => {
  const customer = job.customer || job.customerJob;
  return customer?.email || 'N/A';
};

/**
 * Validate file size
 */
export const validateFileSize = (file: File): boolean => {
  return file.size <= FILE_UPLOAD.MAX_FILE_SIZE_BYTES;
};

/**
 * Validate file type
 */
export const validateFileType = (file: File): boolean => {
  return FILE_UPLOAD.ALLOWED_FILE_TYPES.includes(file.type);
};

/**
 * Get filename from URL
 */
export const getFilenameFromUrl = (url: string): string => {
  if (!url) return '';
  const parts = url.split('/');
  return parts[parts.length - 1];
};

/**
 * Calculate subtotal for diagnosis items
 */
export const calculateSubtotal = (unitPrice: number, quantity: number, discount: number = 0): number => {
  return Math.max(0, (unitPrice * quantity) - discount);
};

/**
 * Calculate total for diagnosis data
 */
export const calculateDiagnosisTotal = (
  products: Array<{ subTotal: number; discount: number }> = [],
  services: Array<{ subTotal: number; discount: number }> = [],
  laborCharges: number = 0
) => {
  const productSubtotal = products.reduce((sum, item) => sum + (item.subTotal || 0), 0);
  const productDiscount = products.reduce((sum, item) => sum + (item.discount || 0), 0);
  
  const serviceSubtotal = services.reduce((sum, item) => sum + (item.subTotal || 0), 0);
  const serviceDiscount = services.reduce((sum, item) => sum + (item.discount || 0), 0);
  
  const totalDiscount = productDiscount + serviceDiscount;
  const combinedSubtotal = productSubtotal + serviceSubtotal;
  const grandTotal = combinedSubtotal + laborCharges;
  
  return {
    productSubtotal,
    productDiscount,
    serviceSubtotal,
    serviceDiscount,
    totalDiscount,
    combinedSubtotal,
    laborCharges,
    grandTotal,
  };
};

/**
 * Filter jobs based on search criteria
 */
export const filterJobs = (
  jobs: RepairJob[],
  search: string,
  statusFilter: RepairStatus | 'all',
  dateRange: { from: Date | null; to: Date | null }
): RepairJob[] => {
  return jobs.filter((job) => {
    // Status filter
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;

    // Search filter
    const searchLower = search.toLowerCase();
    const matchesSearch = !search || (
      job.jobNumber?.toString().toLowerCase().includes(searchLower) ||
      getVehicleName(job).toLowerCase().includes(searchLower) ||
      getPlateNumber(job).toLowerCase().includes(searchLower) ||
      getCustomerName(job).toLowerCase().includes(searchLower)
    );

    // Date filter
    let matchesDate = true;
    if (dateRange.from && dateRange.to) {
      const jobDate = new Date(job.createdAt).getTime();
      const fromDate = new Date(dateRange.from).getTime();
      const toDate = new Date(dateRange.to).getTime();
      matchesDate = jobDate >= fromDate && jobDate <= toDate;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });
};

/**
 * Sort jobs by creation date (newest first)
 */
export const sortJobsByDate = (jobs: RepairJob[]): RepairJob[] => {
  return [...jobs].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

/**
 * Paginate jobs array
 */
export const paginateJobs = (
  jobs: RepairJob[],
  currentPage: number,
  recordsPerPage: number
): {
  paginatedJobs: RepairJob[];
  totalPages: number;
  firstIndex: number;
  lastIndex: number;
} => {
  const totalPages = Math.ceil(jobs.length / recordsPerPage);
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const paginatedJobs = jobs.slice(firstIndex, lastIndex);
  
  return {
    paginatedJobs,
    totalPages,
    firstIndex,
    lastIndex: Math.min(lastIndex, jobs.length),
  };
};

/**
 * Generate page numbers for pagination
 */
export const generatePageNumbers = (totalPages: number): number[] => {
  return Array.from({ length: totalPages }, (_, i) => i + 1);
};

/**
 * Check if job can have quotation
 */
export const canCreateQuotation = (job: RepairJob): boolean => {
  return job.status === 'Diagnosis' || job.status === 'RepairInProgress';
};

/**
 * Check if job can have invoice
 */
export const canCreateInvoice = (job: RepairJob): boolean => {
  return job.status === 'Completed';
};

/**
 * Get navigation path for user role
 */
export const getNavigationPath = (userRole: string, path: string): string => {
  return `/${userRole.toLowerCase()}/${path}`;
};

/**
 * Debounce function for search input
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number, currency: string = 'QAR'): string => {
  return `${amount.toFixed(2)} ${currency}`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};
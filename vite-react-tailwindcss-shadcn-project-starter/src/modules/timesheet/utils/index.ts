import { format, parseISO, differenceInMinutes, differenceInHours } from 'date-fns';
import { ScheduledShift, TimesheetFilters, Operator, StatusOption } from '../types';
import { SHIFT_STATUS_OPTIONS, TIME_CONSTANTS } from '../constants';

// Date formatting utilities
export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy');
  } catch {
    return 'Invalid Date';
  }
};

export const formatDateTime = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
  } catch {
    return 'Invalid Date';
  }
};

export const formatTime = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), 'HH:mm');
  } catch {
    return 'Invalid Time';
  }
};

// Time calculation utilities
export const calculateHours = (startTime: string | undefined, endTime: string | undefined): number => {
  if (!startTime || !endTime) return 0;
  
  try {
    const start = parseISO(startTime);
    const end = parseISO(endTime);
    const hours = differenceInHours(end, start);
    return Math.max(0, hours);
  } catch {
    return 0;
  }
};

export const calculateMinutes = (startTime: string | undefined, endTime: string | undefined): number => {
  if (!startTime || !endTime) return 0;
  
  try {
    const start = parseISO(startTime);
    const end = parseISO(endTime);
    const minutes = differenceInMinutes(end, start);
    return Math.max(0, minutes);
  } catch {
    return 0;
  }
};

export const formatHours = (hours: number | undefined): string => {
  if (hours === undefined || hours === null || isNaN(hours)) return '-';
  return `${hours.toFixed(1)}h`;
};

export const formatDuration = (minutes: number): string => {
  if (minutes <= 0) return '0h 0m';
  
  const hours = Math.floor(minutes / TIME_CONSTANTS.MINUTES_PER_HOUR);
  const remainingMinutes = minutes % TIME_CONSTANTS.MINUTES_PER_HOUR;
  
  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
};

// Shift utilities
export const getShiftDuration = (shift: ScheduledShift): number => {
  if (!shift.timesheet) return 0;
  return calculateHours(shift.timesheet.startTimeMachine, shift.timesheet.endTimeMachine);
};

export const getTotalOperatorHours = (shift: ScheduledShift): number => {
  if (!shift.timesheet) return 0;
  
  const operator1Hours = shift.timesheet.totalOperatorHours1 || 0;
  const operator2Hours = shift.timesheet.totalOperatorHours2 || 0;
  
  return operator1Hours + operator2Hours;
};

export const getOperatorName = (operator: Operator | undefined): string => {
  if (!operator) return 'N/A';
  return `${operator.firstName} ${operator.lastName}`.trim();
};

export const getOperatorNames = (shift: ScheduledShift): string => {
  const names = [];
  
  if (shift.FirstOperator) {
    names.push(getOperatorName(shift.FirstOperator));
  }
  
  if (shift.SecondOperator) {
    names.push(getOperatorName(shift.SecondOperator));
  }
  
  return names.length > 0 ? names.join(', ') : 'No operators assigned';
};

// Status utilities
export const getStatusConfig = (status: string): StatusOption => {
  const config = SHIFT_STATUS_OPTIONS.find(option => option.value === status);
  return config || SHIFT_STATUS_OPTIONS[0];
};

export const getStatusStyle = (status: string) => {
  const statusStyles = {
    working: { backgroundColor: '#118D5729', color: '#118D57' },
    standby: { backgroundColor: '#B76E0029', color: '#B76E00' },
    'Out of service': { backgroundColor: '#FF563029', color: '#B71D18' },
    stopped: { backgroundColor: '#FF563029', color: '#B71D18' },
  };
  
  return statusStyles[status as keyof typeof statusStyles] || statusStyles.stopped;
};

// Search and filter utilities
export const searchShifts = (shifts: ScheduledShift[], searchTerm: string): ScheduledShift[] => {
  if (!searchTerm.trim()) return shifts;
  
  const term = searchTerm.toLowerCase();
  return shifts.filter(shift => {
    const machineNo = shift.fleet?.plateNumber?.toLowerCase() || '';
    const fleetType = shift.fleet?.fleetType?.fleetType?.toLowerCase() || '';
    const fleetName = shift.fleet?.vehicleName?.toLowerCase() || '';
    const operatorName = getOperatorNames(shift).toLowerCase();
    const site = shift.siteProject?.projectName?.toLowerCase() || '';
    const status = shift.status?.toLowerCase() || '';
    const customer = shift.lpo?.representativeName?.toLowerCase() || '';
    
    return (
      machineNo.includes(term) ||
      fleetType.includes(term) ||
      fleetName.includes(term) ||
      operatorName.includes(term) ||
      site.includes(term) ||
      status.includes(term) ||
      customer.includes(term)
    );
  });
};

export const filterShiftsByStatus = (shifts: ScheduledShift[], status: string): ScheduledShift[] => {
  if (status === 'all') return shifts;
  return shifts.filter(shift => shift.status === status);
};

export const filterShiftsByFleet = (shifts: ScheduledShift[], fleetName: string): ScheduledShift[] => {
  if (fleetName === 'all') return shifts;
  return shifts.filter(shift => shift.fleet?.vehicleName === fleetName);
};

export const filterShiftsByProject = (shifts: ScheduledShift[], projectName: string): ScheduledShift[] => {
  if (projectName === 'all') return shifts;
  return shifts.filter(shift => shift.siteProject?.projectName === projectName);
};

export const filterShiftsByOperator = (shifts: ScheduledShift[], operatorName: string): ScheduledShift[] => {
  if (operatorName === 'all') return shifts;
  return shifts.filter(shift => {
    const firstOperatorName = getOperatorName(shift.FirstOperator);
    const secondOperatorName = getOperatorName(shift.SecondOperator);
    return firstOperatorName === operatorName || secondOperatorName === operatorName;
  });
};

export const filterShiftsByCustomer = (shifts: ScheduledShift[], customerName: string): ScheduledShift[] => {
  if (customerName === 'all') return shifts;
  return shifts.filter(shift => shift.lpo?.representativeName === customerName);
};

export const filterShiftsByDateRange = (
  shifts: ScheduledShift[], 
  fromDate: string, 
  toDate: string
): ScheduledShift[] => {
  if (!fromDate || !toDate) return shifts;
  
  const from = new Date(fromDate);
  const to = new Date(toDate);
  
  return shifts.filter(shift => {
    if (!shift.scheduledDate) return false;
    const shiftDate = new Date(shift.scheduledDate);
    return shiftDate >= from && shiftDate <= to;
  });
};

// Sorting utilities
export const sortShifts = (
  shifts: ScheduledShift[], 
  sortBy: string, 
  sortOrder: 'asc' | 'desc'
): ScheduledShift[] => {
  return [...shifts].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sortBy) {
      case 'fleet':
        aValue = a.fleet?.vehicleName?.toLowerCase() || '';
        bValue = b.fleet?.vehicleName?.toLowerCase() || '';
        break;
      case 'project':
        aValue = a.siteProject?.projectName?.toLowerCase() || '';
        bValue = b.siteProject?.projectName?.toLowerCase() || '';
        break;
      case 'status':
        aValue = a.status?.toLowerCase() || '';
        bValue = b.status?.toLowerCase() || '';
        break;
      case 'shiftType':
        aValue = a.shiftType;
        bValue = b.shiftType;
        break;
      case 'scheduledDate':
        aValue = new Date(a.scheduledDate || 0);
        bValue = new Date(b.scheduledDate || 0);
        break;
      case 'machineHours':
        aValue = a.timesheet?.totalMachineHours || 0;
        bValue = b.timesheet?.totalMachineHours || 0;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt || 0);
        bValue = new Date(b.createdAt || 0);
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};

// Pagination utilities
export const paginateShifts = (
  shifts: ScheduledShift[], 
  page: number, 
  pageSize: number
) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const data = shifts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(shifts.length / pageSize);
  
  return {
    data,
    totalPages,
    currentPage: page,
    pageSize,
    totalItems: shifts.length,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};

// Export utilities
export const prepareShiftsForExport = (shifts: ScheduledShift[]) => {
  return shifts.map(shift => ({
    'Fleet Name': shift.fleet?.vehicleName || 'N/A',
    'Plate Number': shift.fleet?.plateNumber || 'N/A',
    'Fleet Type': shift.fleet?.fleetType?.fleetType || 'N/A',
    'Project': shift.siteProject?.projectName || 'N/A',
    'First Operator': getOperatorName(shift.FirstOperator),
    'Second Operator': getOperatorName(shift.SecondOperator),
    'Shift Type': shift.shiftType,
    'Status': shift.status,
    'Machine Hours': shift.timesheet?.totalMachineHours || 0,
    'Operator 1 Hours': shift.timesheet?.totalOperatorHours1 || 0,
    'Operator 2 Hours': shift.timesheet?.totalOperatorHours2 || 0,
    'Total Operator Hours': getTotalOperatorHours(shift),
    'Customer': shift.lpo?.representativeName || 'N/A',
    'Scheduled Date': formatDate(shift.scheduledDate),
    'Created Date': formatDate(shift.createdAt),
    'Comments': shift.comment || 'N/A',
  }));
};

// Validation utilities
export const validateTimeRange = (startTime: string, endTime: string): boolean => {
  if (!startTime || !endTime) return false;
  try {
    return new Date(endTime) > new Date(startTime);
  } catch {
    return false;
  }
};

export const validateShiftDuration = (startTime: string, endTime: string, maxHours: number = 12): boolean => {
  if (!validateTimeRange(startTime, endTime)) return false;
  
  const hours = calculateHours(startTime, endTime);
  return hours <= maxHours;
};

// Error handling
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.data?.message) return error.data.message;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return 'An unexpected error occurred';
};

// Statistics utilities
export const generateTimesheetStats = (shifts: ScheduledShift[]) => {
  const totalShifts = shifts.length;
  const workingShifts = shifts.filter(s => s.status === 'working').length;
  const standbyShifts = shifts.filter(s => s.status === 'standby').length;
  const outOfServiceShifts = shifts.filter(s => s.status === 'Out of service').length;
  
  const totalMachineHours = shifts.reduce((sum, shift) => {
    return sum + (shift.timesheet?.totalMachineHours || 0);
  }, 0);
  
  const totalOperatorHours = shifts.reduce((sum, shift) => {
    return sum + getTotalOperatorHours(shift);
  }, 0);
  
  const averageHoursPerShift = totalShifts > 0 ? totalMachineHours / totalShifts : 0;
  
  return {
    totalShifts,
    workingShifts,
    standbyShifts,
    outOfServiceShifts,
    totalMachineHours,
    totalOperatorHours,
    averageHoursPerShift,
  };
};

// Form helpers
export const getDisplayLabel = (fieldName: string): string => {
  const labels: Record<string, string> = {
    selectedSite: 'Site Project',
    selectedFleet: 'Fleet',
    firstOperator: 'First Operator',
    secondOperator: 'Second Operator',
    shiftType: 'Shift Type',
    firstOperatorStartDateTime: 'First Operator Start Time',
    firstOperatorEndDateTime: 'First Operator End Time',
    secondOperatorStartDateTime: 'Second Operator Start Time',
    secondOperatorEndDateTime: 'Second Operator End Time',
    machineStartTime: 'Machine Start Time',
    machineEndTime: 'Machine End Time',
    comment: 'Comments',
  };
  
  return labels[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
};

// Generate filter options from data
export const generateFilterOptions = (shifts: ScheduledShift[]) => {
  const fleetOptions = [
    { value: 'all', label: 'All Fleets' },
    ...Array.from(
      new Set(
        shifts
          .map(shift => shift.fleet?.vehicleName)
          .filter(name => name !== undefined)
      )
    ).map(name => ({ value: name!, label: name! })),
  ];

  const projectOptions = [
    { value: 'all', label: 'All Projects' },
    ...Array.from(
      new Set(
        shifts
          .map(shift => shift.siteProject?.projectName)
          .filter(name => name !== undefined)
      )
    ).map(name => ({ value: name!, label: name! })),
  ];

  const operatorOptions = [
    { value: 'all', label: 'All Operators' },
    ...Array.from(
      new Set(
        shifts
          .flatMap(shift => [
            shift.FirstOperator ? getOperatorName(shift.FirstOperator) : null,
            shift.SecondOperator ? getOperatorName(shift.SecondOperator) : null,
          ])
          .filter(name => name !== null && name !== 'N/A')
      )
    ).map(name => ({ value: name!, label: name! })),
  ];

  const customerOptions = [
    { value: 'all', label: 'All Customers' },
    ...Array.from(
      new Set(
        shifts
          .map(shift => shift.lpo?.representativeName)
          .filter(name => name !== undefined)
      )
    ).map(name => ({ value: name!, label: name! })),
  ];

  return {
    fleetOptions,
    projectOptions,
    operatorOptions,
    customerOptions,
  };
};
import { format, parseISO } from 'date-fns';
import { Customer, CustomerFilters, CustomerLedger } from '../types';
import { CUSTOMER_STATUS_OPTIONS, TRANSACTION_TYPE_OPTIONS } from '../constants';

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

// Customer name utilities
export const getCustomerFullName = (customer: Customer): string => {
  const prefix = customer.prefixName || customer.prefix;
  const parts = [prefix, customer.firstname, customer.lastname].filter(Boolean);
  return parts.join(' ');
};

export const getCustomerDisplayName = (customer: Customer): string => {
  const fullName = getCustomerFullName(customer);
  return customer.organization ? `${fullName} (${customer.organization})` : fullName;
};

// Status utilities
export const getStatusConfig = (status: boolean | undefined) => {
  const isActive = !status; // status true means inactive
  const config = CUSTOMER_STATUS_OPTIONS.find(option => 
    option.value === (isActive ? 'active' : 'inactive')
  );
  return config || CUSTOMER_STATUS_OPTIONS[0];
};

export const getTransactionTypeConfig = (type: 'debit' | 'credit') => {
  return TRANSACTION_TYPE_OPTIONS.find(option => option.value === type) || TRANSACTION_TYPE_OPTIONS[0];
};

// Search and filter utilities
export const searchCustomers = (customers: Customer[], searchTerm: string): Customer[] => {
  if (!searchTerm.trim()) return customers;
  
  const term = searchTerm.toLowerCase();
  return customers.filter(customer => {
    const fullName = getCustomerFullName(customer).toLowerCase();
    const email = customer.email?.toLowerCase() || '';
    const phone = customer.phone?.toLowerCase() || '';
    const organization = customer.organization?.toLowerCase() || '';
    const city = customer.city?.toLowerCase() || '';
    const country = customer.country?.toLowerCase() || '';
    
    return (
      fullName.includes(term) ||
      email.includes(term) ||
      phone.includes(term) ||
      organization.includes(term) ||
      city.includes(term) ||
      country.includes(term)
    );
  });
};

export const filterCustomersByStatus = (customers: Customer[], status: string): Customer[] => {
  if (status === 'all') return customers;
  
  return customers.filter(customer => {
    const isActive = !customer.status;
    return status === 'active' ? isActive : !isActive;
  });
};

export const filterCustomersByDateRange = (
  customers: Customer[], 
  fromDate: string, 
  toDate: string
): Customer[] => {
  if (!fromDate || !toDate) return customers;
  
  const from = new Date(fromDate);
  const to = new Date(toDate);
  
  return customers.filter(customer => {
    if (!customer.createdAt) return false;
    const createdDate = new Date(customer.createdAt);
    return createdDate >= from && createdDate <= to;
  });
};

// Sorting utilities
export const sortCustomers = (
  customers: Customer[], 
  sortBy: string, 
  sortOrder: 'asc' | 'desc'
): Customer[] => {
  return [...customers].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = getCustomerFullName(a).toLowerCase();
        bValue = getCustomerFullName(b).toLowerCase();
        break;
      case 'email':
        aValue = a.email?.toLowerCase() || '';
        bValue = b.email?.toLowerCase() || '';
        break;
      case 'organization':
        aValue = a.organization?.toLowerCase() || '';
        bValue = b.organization?.toLowerCase() || '';
        break;
      case 'city':
        aValue = a.city?.toLowerCase() || '';
        bValue = b.city?.toLowerCase() || '';
        break;
      case 'status':
        aValue = a.status ? 'inactive' : 'active';
        bValue = b.status ? 'inactive' : 'active';
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
export const paginateCustomers = (
  customers: Customer[], 
  page: number, 
  pageSize: number
) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const data = customers.slice(startIndex, endIndex);
  const totalPages = Math.ceil(customers.length / pageSize);
  
  return {
    data,
    totalPages,
    currentPage: page,
    pageSize,
    totalItems: customers.length,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};

// Export utilities
export const prepareCustomersForExport = (customers: Customer[]) => {
  return customers.map(customer => ({
    'Full Name': getCustomerFullName(customer),
    'Email': customer.email,
    'Phone': customer.phone || 'N/A',
    'Organization': customer.organization || 'N/A',
    'Title': customer.title || 'N/A',
    'City': customer.city || 'N/A',
    'State/Province': customer.stateOrProvince || 'N/A',
    'Country': customer.country || 'N/A',
    'TRN': customer.TRN || 'N/A',
    'Status': customer.status ? 'Inactive' : 'Active',
    'Created Date': formatDate(customer.createdAt),
  }));
};

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7;
};

export const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Customer ledger utilities
export const calculateRunningBalance = (ledgers: CustomerLedger[]): CustomerLedger[] => {
  let runningBalance = 0;
  
  return ledgers.map(ledger => {
    if (ledger.transactionType === 'credit') {
      runningBalance += ledger.amount;
    } else {
      runningBalance -= ledger.amount;
    }
    
    return {
      ...ledger,
      balance: runningBalance,
    };
  });
};

export const getTotalBalance = (ledgers: CustomerLedger[]): number => {
  return ledgers.reduce((total, ledger) => {
    return ledger.transactionType === 'credit' 
      ? total + ledger.amount 
      : total - ledger.amount;
  }, 0);
};

// Currency formatting
export const formatCurrency = (amount: number, currency: string = 'AED'): string => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

// Error handling
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.data?.message) return error.data.message;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return 'An unexpected error occurred';
};

// Form field helpers
export const getDisplayLabel = (fieldName: string): string => {
  const labels: Record<string, string> = {
    firstname: 'First Name',
    lastname: 'Last Name',
    prefixName: 'Prefix',
    organization: 'Organization',
    title: 'Job Title',
    email: 'Email Address',
    phone: 'Phone Number',
    TRN: 'TRN Number',
    city: 'City',
    stateOrProvince: 'State/Province',
    area: 'Area',
    mailingAddress: 'Mailing Address',
    country: 'Country',
    webSite: 'Website',
    postalCode: 'Postal Code',
  };
  
  return labels[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
};

// Generate customer statistics
export const generateCustomerStats = (customers: Customer[]) => {
  const total = customers.length;
  const active = customers.filter(c => !c.status).length;
  const inactive = customers.filter(c => c.status).length;
  
  const currentMonth = new Date();
  currentMonth.setDate(1);
  const newThisMonth = customers.filter(c => {
    if (!c.createdAt) return false;
    const createdDate = new Date(c.createdAt);
    return createdDate >= currentMonth;
  }).length;
  
  return {
    total,
    active,
    inactive,
    newThisMonth,
  };
};
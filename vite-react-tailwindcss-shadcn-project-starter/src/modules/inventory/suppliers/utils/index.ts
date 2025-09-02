import type { Supplier, SupplierLedgerEntry } from '../types';

// Format currency values
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Format supplier display name
export const getSupplierDisplayName = (supplier: Supplier): string => {
  return supplier.supplierName || 'Unknown Supplier';
};

// Get supplier status badge color
export const getSupplierStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    case 'suspended':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get payment method display name
export const getPaymentMethodDisplayName = (method: string): string => {
  switch (method) {
    case 'cash':
      return 'Cash';
    case 'check':
      return 'Check';
    case 'bank_transfer':
      return 'Bank Transfer';
    case 'credit_card':
      return 'Credit Card';
    default:
      return method;
  }
};

// Get transaction type color
export const getTransactionTypeColor = (type: string): string => {
  switch (type) {
    case 'purchase':
      return 'text-red-600';
    case 'payment':
      return 'text-green-600';
    case 'credit':
      return 'text-blue-600';
    case 'debit':
      return 'text-orange-600';
    case 'adjustment':
      return 'text-purple-600';
    default:
      return 'text-gray-600';
  }
};

// Calculate supplier balance from ledger entries
export const calculateSupplierBalance = (entries: SupplierLedgerEntry[]): number => {
  return entries.reduce((balance, entry) => {
    switch (entry.transactionType) {
      case 'purchase':
      case 'debit':
        return balance + entry.amount;
      case 'payment':
      case 'credit':
        return balance - entry.amount;
      case 'adjustment':
        return entry.balance; // Adjustment sets absolute balance
      default:
        return balance;
    }
  }, 0);
};

// Format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format date and time for display
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number format
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Generate supplier code
export const generateSupplierCode = (supplierName: string): string => {
  const cleanName = supplierName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const prefix = cleanName.substring(0, 3).padEnd(3, 'X');
  const timestamp = Date.now().toString().slice(-4);
  return `SUP-${prefix}-${timestamp}`;
};

// Check if supplier has outstanding balance
export const hasOutstandingBalance = (supplier: Supplier): boolean => {
  return (supplier.currentBalance || 0) > 0;
};

// Get supplier risk level based on balance and credit limit
export const getSupplierRiskLevel = (supplier: Supplier): 'low' | 'medium' | 'high' => {
  const balance = supplier.currentBalance || 0;
  const creditLimit = supplier.creditLimit || 0;
  
  if (creditLimit === 0) return 'low';
  
  const utilizationRatio = balance / creditLimit;
  
  if (utilizationRatio >= 0.9) return 'high';
  if (utilizationRatio >= 0.7) return 'medium';
  return 'low';
};

// Sort suppliers by various criteria
export const sortSuppliers = (
  suppliers: Supplier[],
  sortBy: 'supplierName' | 'createdAt' | 'currentBalance',
  sortOrder: 'asc' | 'desc' = 'asc'
): Supplier[] => {
  return [...suppliers].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'supplierName':
        comparison = a.supplierName.localeCompare(b.supplierName);
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        break;
      case 'currentBalance':
        comparison = (a.currentBalance || 0) - (b.currentBalance || 0);
        break;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });
};

// Filter suppliers based on search criteria
export const filterSuppliers = (
  suppliers: Supplier[],
  filters: {
    search?: string;
    status?: string;
    country?: string;
  }
): Supplier[] => {
  return suppliers.filter((supplier) => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = 
        supplier.supplierName.toLowerCase().includes(searchTerm) ||
        supplier.contactPerson.toLowerCase().includes(searchTerm) ||
        supplier.email.toLowerCase().includes(searchTerm) ||
        supplier.phone.includes(searchTerm);
      
      if (!matchesSearch) return false;
    }
    
    // Status filter
    if (filters.status && filters.status !== 'all') {
      if (supplier.status !== filters.status) return false;
    }
    
    // Country filter
    if (filters.country) {
      if (supplier.country !== filters.country) return false;
    }
    
    return true;
  });
};
// Supplier type definitions
export interface Supplier {
  supplierId?: string;
  supplierName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  taxId?: string;
  paymentTerms?: string;
  creditLimit?: number;
  currentBalance?: number;
  status: 'active' | 'inactive' | 'suspended';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Supplier ledger entry
export interface SupplierLedgerEntry {
  entryId: string;
  supplierId: string;
  transactionType: 'purchase' | 'payment' | 'credit' | 'debit' | 'adjustment';
  referenceNumber?: string;
  description: string;
  amount: number;
  balance: number;
  date: string;
  createdBy?: string;
  createdAt: string;
}

// Supplier payment
export interface SupplierPayment {
  paymentId?: string;
  supplierId: string;
  amount: number;
  paymentMethod: 'cash' | 'check' | 'bank_transfer' | 'credit_card';
  referenceNumber?: string;
  paymentDate: string;
  notes?: string;
  createdBy?: string;
  createdAt?: string;
}

// API response types
export interface SuppliersResponse {
  suppliers: Supplier[];
  total: number;
  page: number;
  limit: number;
}

export interface SupplierLedgerResponse {
  entries: SupplierLedgerEntry[];
  supplier: Supplier;
  totalBalance: number;
}

// Form types
export interface SupplierFormData {
  supplierName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  taxId?: string;
  paymentTerms?: string;
  creditLimit?: number;
  status: 'active' | 'inactive' | 'suspended';
  notes?: string;
}

export interface PaymentFormData {
  supplierId: string;
  amount: number;
  paymentMethod: 'cash' | 'check' | 'bank_transfer' | 'credit_card';
  referenceNumber?: string;
  paymentDate: string;
  notes?: string;
}

// Filter and search types
export interface SupplierFilters {
  search?: string;
  status?: 'active' | 'inactive' | 'suspended' | 'all';
  country?: string;
  sortBy?: 'supplierName' | 'createdAt' | 'currentBalance';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Constants
export const SUPPLIER_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
] as const;

export const PAYMENT_METHOD_OPTIONS = [
  { value: 'cash', label: 'Cash' },
  { value: 'check', label: 'Check' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'credit_card', label: 'Credit Card' },
] as const;

export const TRANSACTION_TYPE_OPTIONS = [
  { value: 'purchase', label: 'Purchase' },
  { value: 'payment', label: 'Payment' },
  { value: 'credit', label: 'Credit' },
  { value: 'debit', label: 'Debit' },
  { value: 'adjustment', label: 'Adjustment' },
] as const;
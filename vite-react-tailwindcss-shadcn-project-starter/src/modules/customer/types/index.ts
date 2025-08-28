// Customer type definitions
export interface Customer {
  customerId?: string;
  firstname: string;
  lastname: string;
  prefixName?: string;
  prefix?: string;
  organization?: string;
  title?: string;
  email: string;
  phone?: string;
  TRN?: string;
  city?: string;
  stateOrProvince?: string;
  area?: string;
  mailingAddress?: string;
  country?: string;
  webSite?: string;
  postalCode?: string;
  status?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  deleteBy?: string;
}

export interface CustomerLedger {
  customerLedgerId?: string;
  customerId: string;
  transactionType: 'debit' | 'credit';
  amount: number;
  description?: string;
  referenceNumber?: string;
  transactionDate: string;
  balance?: number;
  createdAt?: string;
  updatedAt?: string;
  customer?: Customer;
}

export interface CustomerFormData {
  firstname: string;
  lastname: string;
  prefixName?: string;
  prefix?: string;
  organization?: string;
  title?: string;
  email: string;
  phone?: string;
  TRN?: string;
  city?: string;
  stateOrProvince?: string;
  area?: string;
  mailingAddress?: string;
  country?: string;
  webSite?: string;
  postalCode?: string;
  [key: string]: any;
}

export interface CustomerApiResponse {
  customer: Customer;
  message?: string;
}

export interface CustomerListResponse {
  customers: Customer[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface CustomerLedgerResponse {
  ledgers: CustomerLedger[];
  total?: number;
  balance?: number;
}

export interface CreateCustomerRequest extends CustomerFormData {}

export interface UpdateCustomerRequest extends Partial<CustomerFormData> {
  customerId: string;
}

export interface CreateCustomerLedgerRequest {
  customerId: string;
  transactionType: 'debit' | 'credit';
  amount: number;
  description?: string;
  referenceNumber?: string;
  transactionDate: string;
}

export interface CustomerFilters {
  status?: 'active' | 'inactive' | 'all';
  search?: string;
  city?: string;
  country?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface ExportCustomersRequest {
  format: 'csv' | 'excel';
  filters?: CustomerFilters;
  fields?: string[];
}

// Form validation types
export interface CustomerFormErrors {
  [key: string]: string | undefined;
}

// Customer statistics
export interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
  totalRevenue?: number;
}
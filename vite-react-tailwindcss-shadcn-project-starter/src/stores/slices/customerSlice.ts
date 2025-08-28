import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { Customer, CustomerFilters, CustomerLedger } from '../../modules/customer/types';

interface CustomerState {
  // Current customer being viewed/edited
  currentCustomer: Customer | null;
  
  // Customer list state
  customers: Customer[];
  totalCustomers: number;
  currentPage: number;
  pageSize: number;
  
  // Search and filters
  searchQuery: string;
  filters: CustomerFilters;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Form state
  formData: Partial<Customer> | null;
  
  // Selection state for bulk operations
  selectedCustomerIds: string[];
  
  // View preferences
  viewMode: 'grid' | 'list';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  
  // Customer ledger state
  currentCustomerLedgers: CustomerLedger[];
  ledgerLoading: boolean;
  ledgerError: string | null;
  
  // Statistics
  stats: {
    total: number;
    active: number;
    inactive: number;
    newThisMonth: number;
  } | null;
}

const initialState: CustomerState = {
  currentCustomer: null,
  customers: [],
  totalCustomers: 0,
  currentPage: 1,
  pageSize: 20,
  searchQuery: '',
  filters: {},
  isLoading: false,
  error: null,
  formData: null,
  selectedCustomerIds: [],
  viewMode: 'list',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  currentCustomerLedgers: [],
  ledgerLoading: false,
  ledgerError: null,
  stats: null,
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    // Customer management
    setCurrentCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.currentCustomer = action.payload;
    },
    
    setCustomers: (state, action: PayloadAction<Customer[]>) => {
      state.customers = action.payload;
    },
    
    addCustomer: (state, action: PayloadAction<Customer>) => {
      state.customers.unshift(action.payload);
      state.totalCustomers += 1;
    },
    
    updateCustomer: (state, action: PayloadAction<Customer>) => {
      const index = state.customers.findIndex(customer => customer.customerId === action.payload.customerId);
      if (index !== -1) {
        state.customers[index] = action.payload;
      }
      if (state.currentCustomer?.customerId === action.payload.customerId) {
        state.currentCustomer = action.payload;
      }
    },
    
    removeCustomer: (state, action: PayloadAction<string>) => {
      state.customers = state.customers.filter(customer => customer.customerId !== action.payload);
      state.totalCustomers = Math.max(0, state.totalCustomers - 1);
      if (state.currentCustomer?.customerId === action.payload) {
        state.currentCustomer = null;
      }
    },
    
    // Pagination
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.currentPage = 1; // Reset to first page when changing page size
    },
    
    setTotalCustomers: (state, action: PayloadAction<number>) => {
      state.totalCustomers = action.payload;
    },
    
    // Search and filters
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1; // Reset to first page when searching
    },
    
    setFilters: (state, action: PayloadAction<CustomerFilters>) => {
      state.filters = action.payload;
      state.currentPage = 1; // Reset to first page when filtering
    },
    
    updateFilters: (state, action: PayloadAction<Partial<CustomerFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1;
    },
    
    clearFilters: (state) => {
      state.filters = {};
      state.searchQuery = '';
      state.currentPage = 1;
    },
    
    // UI state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // Form state
    setFormData: (state, action: PayloadAction<Partial<Customer> | null>) => {
      state.formData = action.payload;
    },
    
    updateFormData: (state, action: PayloadAction<Partial<Customer>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    
    clearFormData: (state) => {
      state.formData = null;
    },
    
    // Selection management
    toggleCustomerSelection: (state, action: PayloadAction<string>) => {
      const customerId = action.payload;
      const index = state.selectedCustomerIds.indexOf(customerId);
      if (index === -1) {
        state.selectedCustomerIds.push(customerId);
      } else {
        state.selectedCustomerIds.splice(index, 1);
      }
    },
    
    selectAllCustomers: (state, action: PayloadAction<string[]>) => {
      state.selectedCustomerIds = action.payload;
    },
    
    clearSelection: (state) => {
      state.selectedCustomerIds = [];
    },
    
    // View preferences
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload;
    },
    
    setSorting: (state, action: PayloadAction<{ sortBy: string; sortOrder: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
    
    // Customer ledger management
    setCurrentCustomerLedgers: (state, action: PayloadAction<CustomerLedger[]>) => {
      state.currentCustomerLedgers = action.payload;
    },
    
    addCustomerLedgerEntry: (state, action: PayloadAction<CustomerLedger>) => {
      state.currentCustomerLedgers.unshift(action.payload);
    },
    
    setLedgerLoading: (state, action: PayloadAction<boolean>) => {
      state.ledgerLoading = action.payload;
    },
    
    setLedgerError: (state, action: PayloadAction<string | null>) => {
      state.ledgerError = action.payload;
    },
    
    // Statistics
    setStats: (state, action: PayloadAction<CustomerState['stats']>) => {
      state.stats = action.payload;
    },
    
    // Bulk operations
    bulkUpdateCustomerStatus: (state, action: PayloadAction<{ customerIds: string[]; status: boolean }>) => {
      const { customerIds, status } = action.payload;
      state.customers = state.customers.map(customer => 
        customerIds.includes(customer.customerId!) ? { ...customer, status } : customer
      );
    },
    
    bulkRemoveCustomers: (state, action: PayloadAction<string[]>) => {
      const customerIds = action.payload;
      state.customers = state.customers.filter(customer => !customerIds.includes(customer.customerId!));
      state.totalCustomers = Math.max(0, state.totalCustomers - customerIds.length);
      state.selectedCustomerIds = state.selectedCustomerIds.filter(id => !customerIds.includes(id));
    },
    
    // Reset state
    resetCustomerState: () => initialState,
  },
});

export const {
  // Customer management
  setCurrentCustomer,
  setCustomers,
  addCustomer,
  updateCustomer,
  removeCustomer,
  
  // Pagination
  setCurrentPage,
  setPageSize,
  setTotalCustomers,
  
  // Search and filters
  setSearchQuery,
  setFilters,
  updateFilters,
  clearFilters,
  
  // UI state
  setLoading,
  setError,
  
  // Form state
  setFormData,
  updateFormData,
  clearFormData,
  
  // Selection management
  toggleCustomerSelection,
  selectAllCustomers,
  clearSelection,
  
  // View preferences
  setViewMode,
  setSorting,
  
  // Customer ledger management
  setCurrentCustomerLedgers,
  addCustomerLedgerEntry,
  setLedgerLoading,
  setLedgerError,
  
  // Statistics
  setStats,
  
  // Bulk operations
  bulkUpdateCustomerStatus,
  bulkRemoveCustomers,
  
  // Reset
  resetCustomerState,
} = customerSlice.actions;

// Selectors
export const selectCurrentCustomer = (state: RootState) => state.customer.currentCustomer;
export const selectCustomers = (state: RootState) => state.customer.customers;
export const selectCustomersLoading = (state: RootState) => state.customer.isLoading;
export const selectCustomersError = (state: RootState) => state.customer.error;
export const selectCustomersPagination = (state: RootState) => ({
  currentPage: state.customer.currentPage,
  pageSize: state.customer.pageSize,
  totalCustomers: state.customer.totalCustomers,
});
export const selectCustomersSearch = (state: RootState) => state.customer.searchQuery;
export const selectCustomersFilters = (state: RootState) => state.customer.filters;
export const selectSelectedCustomerIds = (state: RootState) => state.customer.selectedCustomerIds;
export const selectCustomersViewMode = (state: RootState) => state.customer.viewMode;
export const selectCustomersSorting = (state: RootState) => ({
  sortBy: state.customer.sortBy,
  sortOrder: state.customer.sortOrder,
});
export const selectCustomerFormData = (state: RootState) => state.customer.formData;
export const selectCurrentCustomerLedgers = (state: RootState) => state.customer.currentCustomerLedgers;
export const selectLedgerLoading = (state: RootState) => state.customer.ledgerLoading;
export const selectLedgerError = (state: RootState) => state.customer.ledgerError;
export const selectCustomerStats = (state: RootState) => state.customer.stats;

export default customerSlice.reducer;
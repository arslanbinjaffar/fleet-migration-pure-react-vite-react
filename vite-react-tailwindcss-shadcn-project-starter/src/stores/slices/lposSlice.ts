import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { LPO, LPOFilters, LPOStatus, Customer, SiteProject, Fleet } from '../../modules/lpos/types';

interface LPOState {
  // Current LPO being viewed/edited
  currentLPO: LPO | null;
  
  // LPO list state
  lpos: LPO[];
  totalLPOs: number;
  currentPage: number;
  pageSize: number;
  
  // Search and filters
  searchQuery: string;
  filters: LPOFilters;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Form state
  formData: Partial<LPO> | null;
  
  // Selection state for bulk operations
  selectedLPOIds: string[];
  
  // View preferences
  viewMode: 'grid' | 'list';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  
  // Related data for LPO creation/editing
  customers: Customer[];
  siteProjects: SiteProject[];
  availableFleets: Fleet[];
  fleetsByLpo: Record<string, Fleet[]>;
  
  // Statistics
  stats: {
    total: number;
    byStatus: Record<string, number>;
    totalValue: number;
    averageValue: number;
  } | null;
}

const initialState: LPOState = {
  currentLPO: null,
  lpos: [],
  totalLPOs: 0,
  currentPage: 1,
  pageSize: 10,
  searchQuery: '',
  filters: {},
  isLoading: false,
  error: null,
  formData: null,
  selectedLPOIds: [],
  viewMode: 'list',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  customers: [],
  siteProjects: [],
  availableFleets: [],
  fleetsByLpo: {},
  stats: null,
};

const lposSlice = createSlice({
  name: 'lpos',
  initialState,
  reducers: {
    // LPO management
    setCurrentLPO: (state, action: PayloadAction<LPO | null>) => {
      state.currentLPO = action.payload;
    },
    
    setLPOs: (state, action: PayloadAction<LPO[]>) => {
      state.lpos = action.payload;
    },
    
    addLPO: (state, action: PayloadAction<LPO>) => {
      state.lpos.unshift(action.payload);
      state.totalLPOs += 1;
    },
    
    updateLPO: (state, action: PayloadAction<LPO>) => {
      const index = state.lpos.findIndex(lpo => lpo.lpoId === action.payload.lpoId);
      if (index !== -1) {
        state.lpos[index] = action.payload;
      }
      if (state.currentLPO?.lpoId === action.payload.lpoId) {
        state.currentLPO = action.payload;
      }
    },
    
    removeLPO: (state, action: PayloadAction<string>) => {
      state.lpos = state.lpos.filter(lpo => lpo.lpoId !== action.payload);
      state.totalLPOs = Math.max(0, state.totalLPOs - 1);
      if (state.currentLPO?.lpoId === action.payload) {
        state.currentLPO = null;
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
    
    setTotalLPOs: (state, action: PayloadAction<number>) => {
      state.totalLPOs = action.payload;
    },
    
    // Search and filters
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1; // Reset to first page when searching
    },
    
    setFilters: (state, action: PayloadAction<LPOFilters>) => {
      state.filters = action.payload;
      state.currentPage = 1; // Reset to first page when filtering
    },
    
    updateFilters: (state, action: PayloadAction<Partial<LPOFilters>>) => {
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
    setFormData: (state, action: PayloadAction<Partial<LPO> | null>) => {
      state.formData = action.payload;
    },
    
    updateFormData: (state, action: PayloadAction<Partial<LPO>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    
    clearFormData: (state) => {
      state.formData = null;
    },
    
    // Selection management
    toggleLPOSelection: (state, action: PayloadAction<string>) => {
      const lpoId = action.payload;
      const index = state.selectedLPOIds.indexOf(lpoId);
      if (index === -1) {
        state.selectedLPOIds.push(lpoId);
      } else {
        state.selectedLPOIds.splice(index, 1);
      }
    },
    
    selectAllLPOs: (state, action: PayloadAction<string[]>) => {
      state.selectedLPOIds = action.payload;
    },
    
    clearSelection: (state) => {
      state.selectedLPOIds = [];
    },
    
    // View preferences
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload;
    },
    
    setSorting: (state, action: PayloadAction<{ sortBy: string; sortOrder: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
    
    // Related data
    setCustomers: (state, action: PayloadAction<Customer[]>) => {
      state.customers = action.payload;
    },
    
    setSiteProjects: (state, action: PayloadAction<SiteProject[]>) => {
      state.siteProjects = action.payload;
    },
    
    setAvailableFleets: (state, action: PayloadAction<Fleet[]>) => {
      state.availableFleets = action.payload;
    },
    
    setFleetsByLpo: (state, action: PayloadAction<Record<string, Fleet[]>>) => {
      state.fleetsByLpo = action.payload;
    },
    
    // Statistics
    setStats: (state, action: PayloadAction<LPOState['stats']>) => {
      state.stats = action.payload;
    },
    
    // Bulk operations
    bulkUpdateLPOStatus: (state, action: PayloadAction<{ lpoIds: string[]; status: LPOStatus }>) => {
      const { lpoIds, status } = action.payload;
      state.lpos = state.lpos.map(lpo => 
        lpoIds.includes(lpo.lpoId) ? { ...lpo, status } : lpo
      );
    },
    
    bulkRemoveLPOs: (state, action: PayloadAction<string[]>) => {
      const lpoIds = action.payload;
      state.lpos = state.lpos.filter(lpo => !lpoIds.includes(lpo.lpoId));
      state.totalLPOs = Math.max(0, state.totalLPOs - lpoIds.length);
      state.selectedLPOIds = state.selectedLPOIds.filter(id => !lpoIds.includes(id));
    },
    
    // Reset state
    resetLPOState: () => initialState,
  },
});

export const {
  // LPO management
  setCurrentLPO,
  setLPOs,
  addLPO,
  updateLPO,
  removeLPO,
  
  // Pagination
  setCurrentPage,
  setPageSize,
  setTotalLPOs,
  
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
  toggleLPOSelection,
  selectAllLPOs,
  clearSelection,
  
  // View preferences
  setViewMode,
  setSorting,
  
  // Related data
  setCustomers,
  setSiteProjects,
  setAvailableFleets,
  setFleetsByLpo,
  
  // Statistics
  setStats,
  
  // Bulk operations
  bulkUpdateLPOStatus,
  bulkRemoveLPOs,
  
  // Reset
  resetLPOState,
} = lposSlice.actions;

// Selectors
export const selectCurrentLPO = (state: RootState) => state.lpos.currentLPO;
export const selectLPOs = (state: RootState) => state.lpos.lpos;
export const selectLPOsLoading = (state: RootState) => state.lpos.isLoading;
export const selectLPOsError = (state: RootState) => state.lpos.error;
export const selectLPOsPagination = (state: RootState) => ({
  currentPage: state.lpos.currentPage,
  pageSize: state.lpos.pageSize,
  totalLPOs: state.lpos.totalLPOs,
});
export const selectLPOsSearch = (state: RootState) => state.lpos.searchQuery;
export const selectLPOsFilters = (state: RootState) => state.lpos.filters;
export const selectSelectedLPOIds = (state: RootState) => state.lpos.selectedLPOIds;
export const selectLPOsViewMode = (state: RootState) => state.lpos.viewMode;
export const selectLPOsSorting = (state: RootState) => ({
  sortBy: state.lpos.sortBy,
  sortOrder: state.lpos.sortOrder,
});
export const selectLPOFormData = (state: RootState) => state.lpos.formData;
export const selectCustomers = (state: RootState) => state.lpos.customers;
export const selectSiteProjects = (state: RootState) => state.lpos.siteProjects;
export const selectAvailableFleets = (state: RootState) => state.lpos.availableFleets;
export const selectFleetsByLpo = (state: RootState) => state.lpos.fleetsByLpo;
export const selectLPOStats = (state: RootState) => state.lpos.stats;

export default lposSlice.reducer;
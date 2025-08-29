import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Warehouse } from '../api/warehouseApiSlice';

// Warehouse State Interface
export interface WarehouseState {
  // Data
  warehouses: Warehouse[];
  selectedWarehouse: Warehouse | null;
  searchResults: Warehouse[];
  
  // Filters and Pagination
  filters: {
    search: string;
    status: 'active' | 'inactive' | 'all';
    location: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  sorting: {
    field: string;
    direction: 'asc' | 'desc';
  };
  
  // Loading and Error States
  loading: {
    list: boolean;
    details: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    search: boolean;
    stats: boolean;
  };
  error: {
    list: string | null;
    details: string | null;
    create: string | null;
    update: string | null;
    delete: string | null;
    search: string | null;
    stats: string | null;
  };
}

// Warehouse UI State Interface
export interface WarehouseUIState {
  // Modal and Dialog States
  modals: {
    create: boolean;
    edit: boolean;
    delete: boolean;
    view: boolean;
    bulkDelete: boolean;
    stats: boolean;
  };
  
  // Panel and Drawer States
  panels: {
    filters: boolean;
    details: boolean;
    inventory: boolean;
  };
  
  // Selection States
  selection: {
    selectedIds: string[];
    selectAll: boolean;
  };
  
  // View States
  view: {
    mode: 'grid' | 'list' | 'table';
    density: 'compact' | 'comfortable' | 'spacious';
  };
  
  // Form States
  forms: {
    create: {
      isSubmitting: boolean;
      isDirty: boolean;
    };
    edit: {
      isSubmitting: boolean;
      isDirty: boolean;
      warehouseId: string | null;
    };
  };
}

// Initial States
const initialWarehouseState: WarehouseState = {
  warehouses: [],
  selectedWarehouse: null,
  searchResults: [],
  filters: {
    search: '',
    status: 'all',
    location: '',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  sorting: {
    field: 'name',
    direction: 'asc',
  },
  loading: {
    list: false,
    details: false,
    create: false,
    update: false,
    delete: false,
    search: false,
    stats: false,
  },
  error: {
    list: null,
    details: null,
    create: null,
    update: null,
    delete: null,
    search: null,
    stats: null,
  },
};

const initialUIState: WarehouseUIState = {
  modals: {
    create: false,
    edit: false,
    delete: false,
    view: false,
    bulkDelete: false,
    stats: false,
  },
  panels: {
    filters: false,
    details: false,
    inventory: false,
  },
  selection: {
    selectedIds: [],
    selectAll: false,
  },
  view: {
    mode: 'table',
    density: 'comfortable',
  },
  forms: {
    create: {
      isSubmitting: false,
      isDirty: false,
    },
    edit: {
      isSubmitting: false,
      isDirty: false,
      warehouseId: null,
    },
  },
};

// Warehouse Slice
export const warehouseSlice = createSlice({
  name: 'warehouse',
  initialState: {
    data: initialWarehouseState,
    ui: initialUIState,
  },
  reducers: {
    // Data Management
    setWarehouses: (state, action: PayloadAction<Warehouse[]>) => {
      state.data.warehouses = action.payload;
    },
    addWarehouse: (state, action: PayloadAction<Warehouse>) => {
      state.data.warehouses.unshift(action.payload);
    },
    updateWarehouse: (state, action: PayloadAction<Warehouse>) => {
      const index = state.data.warehouses.findIndex(w => w.warehouseId === action.payload.warehouseId);
      if (index !== -1) {
        state.data.warehouses[index] = action.payload;
      }
    },
    removeWarehouse: (state, action: PayloadAction<string>) => {
      state.data.warehouses = state.data.warehouses.filter(w => w.warehouseId !== action.payload);
    },
    setSelectedWarehouse: (state, action: PayloadAction<Warehouse | null>) => {
      state.data.selectedWarehouse = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<Warehouse[]>) => {
      state.data.searchResults = action.payload;
    },
    
    // Filter Management
    setFilters: (state, action: PayloadAction<Partial<WarehouseState['filters']>>) => {
      state.data.filters = { ...state.data.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.data.filters = initialWarehouseState.filters;
    },
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.data.filters.search = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<'active' | 'inactive' | 'all'>) => {
      state.data.filters.status = action.payload;
    },
    setLocationFilter: (state, action: PayloadAction<string>) => {
      state.data.filters.location = action.payload;
    },
    
    // Pagination Management
    setPagination: (state, action: PayloadAction<Partial<WarehouseState['pagination']>>) => {
      state.data.pagination = { ...state.data.pagination, ...action.payload };
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.data.pagination.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.data.pagination.limit = action.payload;
    },
    
    // Sorting Management
    setSorting: (state, action: PayloadAction<WarehouseState['sorting']>) => {
      state.data.sorting = action.payload;
    },
    
    // Loading States
    setLoading: (state, action: PayloadAction<{ key: keyof WarehouseState['loading']; value: boolean }>) => {
      state.data.loading[action.payload.key] = action.payload.value;
    },
    
    // Error States
    setError: (state, action: PayloadAction<{ key: keyof WarehouseState['error']; value: string | null }>) => {
      state.data.error[action.payload.key] = action.payload.value;
    },
    clearErrors: (state) => {
      state.data.error = initialWarehouseState.error;
    },
    
    // UI State Management
    toggleModal: (state, action: PayloadAction<keyof WarehouseUIState['modals']>) => {
      state.ui.modals[action.payload] = !state.ui.modals[action.payload];
    },
    setModal: (state, action: PayloadAction<{ modal: keyof WarehouseUIState['modals']; open: boolean }>) => {
      state.ui.modals[action.payload.modal] = action.payload.open;
    },
    closeAllModals: (state) => {
      state.ui.modals = initialUIState.modals;
    },
    
    togglePanel: (state, action: PayloadAction<keyof WarehouseUIState['panels']>) => {
      state.ui.panels[action.payload] = !state.ui.panels[action.payload];
    },
    setPanel: (state, action: PayloadAction<{ panel: keyof WarehouseUIState['panels']; open: boolean }>) => {
      state.ui.panels[action.payload.panel] = action.payload.open;
    },
    
    // Selection Management
    toggleSelection: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const index = state.ui.selection.selectedIds.indexOf(id);
      if (index === -1) {
        state.ui.selection.selectedIds.push(id);
      } else {
        state.ui.selection.selectedIds.splice(index, 1);
      }
    },
    setSelection: (state, action: PayloadAction<string[]>) => {
      state.ui.selection.selectedIds = action.payload;
    },
    clearSelection: (state) => {
      state.ui.selection.selectedIds = [];
      state.ui.selection.selectAll = false;
    },
    toggleSelectAll: (state) => {
      state.ui.selection.selectAll = !state.ui.selection.selectAll;
      if (state.ui.selection.selectAll) {
        state.ui.selection.selectedIds = state.data.warehouses.map(w => w.warehouseId);
      } else {
        state.ui.selection.selectedIds = [];
      }
    },
    
    // View Management
    setViewMode: (state, action: PayloadAction<WarehouseUIState['view']['mode']>) => {
      state.ui.view.mode = action.payload;
    },
    setViewDensity: (state, action: PayloadAction<WarehouseUIState['view']['density']>) => {
      state.ui.view.density = action.payload;
    },
    
    // Form Management
    setFormState: (state, action: PayloadAction<{ form: 'create' | 'edit'; field: string; value: any }>) => {
      const { form, field, value } = action.payload;
      (state.ui.forms[form] as any)[field] = value;
    },
    resetFormState: (state, action: PayloadAction<'create' | 'edit'>) => {
      state.ui.forms[action.payload] = initialUIState.forms[action.payload];
    },
    
    // Reset State
    resetWarehouseState: (state) => {
      state.data = initialWarehouseState;
      state.ui = initialUIState;
    },
  },
});

// Export actions
export const {
  // Data actions
  setWarehouses,
  addWarehouse,
  updateWarehouse,
  removeWarehouse,
  setSelectedWarehouse,
  setSearchResults,
  
  // Filter actions
  setFilters,
  resetFilters,
  setSearchFilter,
  setStatusFilter,
  setLocationFilter,
  
  // Pagination actions
  setPagination,
  setPage,
  setLimit,
  
  // Sorting actions
  setSorting,
  
  // Loading and error actions
  setLoading,
  setError,
  clearErrors,
  
  // UI actions
  toggleModal,
  setModal,
  closeAllModals,
  togglePanel,
  setPanel,
  
  // Selection actions
  toggleSelection,
  setSelection,
  clearSelection,
  toggleSelectAll,
  
  // View actions
  setViewMode,
  setViewDensity,
  
  // Form actions
  setFormState,
  resetFormState,
  
  // Reset actions
  resetWarehouseState,
} = warehouseSlice.actions;

// Selectors
export const selectWarehouseData = (state: RootState) => state.warehouse.data;
export const selectWarehouseUI = (state: RootState) => state.warehouse.ui;
export const selectWarehouses = (state: RootState) => state.warehouse.data.warehouses;
export const selectSelectedWarehouse = (state: RootState) => state.warehouse.data.selectedWarehouse;
export const selectWarehouseFilters = (state: RootState) => state.warehouse.data.filters;
export const selectWarehousePagination = (state: RootState) => state.warehouse.data.pagination;
export const selectWarehouseSorting = (state: RootState) => state.warehouse.data.sorting;
export const selectWarehouseLoading = (state: RootState) => state.warehouse.data.loading;
export const selectWarehouseError = (state: RootState) => state.warehouse.data.error;
export const selectWarehouseModals = (state: RootState) => state.warehouse.ui.modals;
export const selectWarehouseSelection = (state: RootState) => state.warehouse.ui.selection;
export const selectWarehouseView = (state: RootState) => state.warehouse.ui.view;

// Complex selectors
export const selectFilteredWarehouses = (state: RootState) => {
  const { warehouses, filters } = state.warehouse.data;
  return warehouses.filter(warehouse => {
    if (filters.search && !warehouse.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.status !== 'all' && warehouse.status !== filters.status) {
      return false;
    }
    if (filters.location && !warehouse.location?.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    return true;
  });
};

export const selectSelectedWarehouses = (state: RootState) => {
  const { warehouses } = state.warehouse.data;
  const { selectedIds } = state.warehouse.ui.selection;
  return warehouses.filter(warehouse => selectedIds.includes(warehouse.warehouseId));
};

export const selectIsWarehouseSelected = (warehouseId: string) => (state: RootState) => {
  return state.warehouse.ui.selection.selectedIds.includes(warehouseId);
};

export const selectActiveWarehouses = (state: RootState) => {
  return state.warehouse.data.warehouses.filter(warehouse => warehouse.status === 'active');
};

// Export reducer
export default warehouseSlice.reducer;
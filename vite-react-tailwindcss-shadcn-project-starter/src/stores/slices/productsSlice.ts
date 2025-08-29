import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Product } from '../api/productsApiSlice';

// Products State Interface
export interface ProductsState {
  // Data
  products: Product[];
  selectedProduct: Product | null;
  searchResults: Product[];
  
  // Filters and Pagination
  filters: {
    search: string;
    categoryId: string;
    warehouseId: string;
    isActive: boolean | null;
    priceRange: {
      min: number;
      max: number;
    };
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
  };
  error: {
    list: string | null;
    details: string | null;
    create: string | null;
    update: string | null;
    delete: string | null;
    search: string | null;
  };
}

// Products UI State Interface
export interface ProductsUIState {
  // Modal and Dialog States
  modals: {
    create: boolean;
    edit: boolean;
    delete: boolean;
    view: boolean;
    imageUpload: boolean;
    bulkDelete: boolean;
  };
  
  // Panel and Drawer States
  panels: {
    filters: boolean;
    details: boolean;
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
      productId: string | null;
    };
  };
}

// Initial States
const initialProductsState: ProductsState = {
  products: [],
  selectedProduct: null,
  searchResults: [],
  filters: {
    search: '',
    categoryId: '',
    warehouseId: '',
    isActive: null,
    priceRange: {
      min: 0,
      max: 10000,
    },
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
  },
  error: {
    list: null,
    details: null,
    create: null,
    update: null,
    delete: null,
    search: null,
  },
};

const initialUIState: ProductsUIState = {
  modals: {
    create: false,
    edit: false,
    delete: false,
    view: false,
    imageUpload: false,
    bulkDelete: false,
  },
  panels: {
    filters: false,
    details: false,
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
      productId: null,
    },
  },
};

// Products Slice
export const productsSlice = createSlice({
  name: 'products',
  initialState: {
    data: initialProductsState,
    ui: initialUIState,
  },
  reducers: {
    // Data Management
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.data.products = action.payload;
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      state.data.products.unshift(action.payload);
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.data.products.findIndex(p => p.productId === action.payload.productId);
      if (index !== -1) {
        state.data.products[index] = action.payload;
      }
    },
    removeProduct: (state, action: PayloadAction<string>) => {
      state.data.products = state.data.products.filter(p => p.productId !== action.payload);
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.data.selectedProduct = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<Product[]>) => {
      state.data.searchResults = action.payload;
    },
    
    // Filter Management
    setFilters: (state, action: PayloadAction<Partial<ProductsState['filters']>>) => {
      state.data.filters = { ...state.data.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.data.filters = initialProductsState.filters;
    },
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.data.filters.search = action.payload;
    },
    setCategoryFilter: (state, action: PayloadAction<string>) => {
      state.data.filters.categoryId = action.payload;
    },
    setWarehouseFilter: (state, action: PayloadAction<string>) => {
      state.data.filters.warehouseId = action.payload;
    },
    setPriceRangeFilter: (state, action: PayloadAction<{ min: number; max: number }>) => {
      state.data.filters.priceRange = action.payload;
    },
    
    // Pagination Management
    setPagination: (state, action: PayloadAction<Partial<ProductsState['pagination']>>) => {
      state.data.pagination = { ...state.data.pagination, ...action.payload };
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.data.pagination.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.data.pagination.limit = action.payload;
    },
    
    // Sorting Management
    setSorting: (state, action: PayloadAction<ProductsState['sorting']>) => {
      state.data.sorting = action.payload;
    },
    
    // Loading States
    setLoading: (state, action: PayloadAction<{ key: keyof ProductsState['loading']; value: boolean }>) => {
      state.data.loading[action.payload.key] = action.payload.value;
    },
    
    // Error States
    setError: (state, action: PayloadAction<{ key: keyof ProductsState['error']; value: string | null }>) => {
      state.data.error[action.payload.key] = action.payload.value;
    },
    clearErrors: (state) => {
      state.data.error = initialProductsState.error;
    },
    
    // UI State Management
    toggleModal: (state, action: PayloadAction<keyof ProductsUIState['modals']>) => {
      state.ui.modals[action.payload] = !state.ui.modals[action.payload];
    },
    setModal: (state, action: PayloadAction<{ modal: keyof ProductsUIState['modals']; open: boolean }>) => {
      state.ui.modals[action.payload.modal] = action.payload.open;
    },
    closeAllModals: (state) => {
      state.ui.modals = initialUIState.modals;
    },
    
    togglePanel: (state, action: PayloadAction<keyof ProductsUIState['panels']>) => {
      state.ui.panels[action.payload] = !state.ui.panels[action.payload];
    },
    setPanel: (state, action: PayloadAction<{ panel: keyof ProductsUIState['panels']; open: boolean }>) => {
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
        state.ui.selection.selectedIds = state.data.products.map(p => p.productId);
      } else {
        state.ui.selection.selectedIds = [];
      }
    },
    
    // View Management
    setViewMode: (state, action: PayloadAction<ProductsUIState['view']['mode']>) => {
      state.ui.view.mode = action.payload;
    },
    setViewDensity: (state, action: PayloadAction<ProductsUIState['view']['density']>) => {
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
    resetProductsState: (state) => {
      state.data = initialProductsState;
      state.ui = initialUIState;
    },
  },
});

// Export actions
export const {
  // Data actions
  setProducts,
  addProduct,
  updateProduct,
  removeProduct,
  setSelectedProduct,
  setSearchResults,
  
  // Filter actions
  setFilters,
  resetFilters,
  setSearchFilter,
  setCategoryFilter,
  setWarehouseFilter,
  setPriceRangeFilter,
  
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
  resetProductsState,
} = productsSlice.actions;

// Selectors
export const selectProductsData = (state: RootState) => state.products.data;
export const selectProductsUI = (state: RootState) => state.products.ui;
export const selectProducts = (state: RootState) => state.products.data.products;
export const selectSelectedProduct = (state: RootState) => state.products.data.selectedProduct;
export const selectProductsFilters = (state: RootState) => state.products.data.filters;
export const selectProductsPagination = (state: RootState) => state.products.data.pagination;
export const selectProductsSorting = (state: RootState) => state.products.data.sorting;
export const selectProductsLoading = (state: RootState) => state.products.data.loading;
export const selectProductsError = (state: RootState) => state.products.data.error;
export const selectProductsModals = (state: RootState) => state.products.ui.modals;
export const selectProductsSelection = (state: RootState) => state.products.ui.selection;
export const selectProductsView = (state: RootState) => state.products.ui.view;

// Complex selectors
export const selectFilteredProducts = (state: RootState) => {
  const { products, filters } = state.products.data;
  return products.filter(product => {
    if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.categoryId && product.categoryId !== filters.categoryId) {
      return false;
    }
    if (filters.warehouseId && product.warehouseId !== filters.warehouseId) {
      return false;
    }
    if (filters.isActive !== null && product.isActive !== filters.isActive) {
      return false;
    }
    if (product.price < filters.priceRange.min || product.price > filters.priceRange.max) {
      return false;
    }
    return true;
  });
};

export const selectSelectedProducts = (state: RootState) => {
  const { products } = state.products.data;
  const { selectedIds } = state.products.ui.selection;
  return products.filter(product => selectedIds.includes(product.productId));
};

export const selectIsProductSelected = (productId: string) => (state: RootState) => {
  return state.products.ui.selection.selectedIds.includes(productId);
};

// Export reducer
export default productsSlice.reducer;
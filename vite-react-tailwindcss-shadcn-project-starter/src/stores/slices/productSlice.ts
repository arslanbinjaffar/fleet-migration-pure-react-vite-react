import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Product } from '../api/productApiSlice';

// Product State Interface
export interface ProductState {
  // Data
  products: Product[];
  currentProduct: Product | null;
  searchResults: Product[];
  
  // Filters and Pagination
  filters: {
    search: string;
    categoryId: string;
    warehouseId: string;
    priceRange: {
      min: number;
      max: number;
    };
    inStock: boolean | null;
  };
  
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
  
  // Sorting
  sorting: {
    field: 'name' | 'price' | 'createdAt' | 'quantity';
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

// Product UI State Interface
export interface ProductUIState {
  // Modal and Dialog States
  modals: {
    create: boolean;
    edit: boolean;
    delete: boolean;
    view: boolean;
    imageUpload: boolean;
  };
  
  // Panel States
  panels: {
    filters: boolean;
    details: boolean;
  };
  
  // Selection States
  selectedProducts: string[];
  activeProductId: string | null;
  
  // View States
  viewMode: 'grid' | 'list' | 'table';
  
  // Form States
  formData: {
    name: string;
    description: string;
    price: number;
    categoryId: string;
    warehouseId: string;
    quantity: number;
    sku: string;
  };
  
  // Bulk Operations
  bulkOperations: {
    isActive: boolean;
    selectedCount: number;
    operation: 'delete' | 'update' | 'export' | null;
  };
}

// Initial States
const initialProductState: ProductState = {
  products: [],
  currentProduct: null,
  searchResults: [],
  
  filters: {
    search: '',
    categoryId: '',
    warehouseId: '',
    priceRange: {
      min: 0,
      max: 10000,
    },
    inStock: null,
  },
  
  pagination: {
    currentPage: 1,
    itemsPerPage: 12,
    totalItems: 0,
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

const initialProductUIState: ProductUIState = {
  modals: {
    create: false,
    edit: false,
    delete: false,
    view: false,
    imageUpload: false,
  },
  
  panels: {
    filters: false,
    details: false,
  },
  
  selectedProducts: [],
  activeProductId: null,
  
  viewMode: 'grid',
  
  formData: {
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    warehouseId: '',
    quantity: 0,
    sku: '',
  },
  
  bulkOperations: {
    isActive: false,
    selectedCount: 0,
    operation: null,
  },
};

// Product Slice
const productSlice = createSlice({
  name: 'product',
  initialState: {
    ...initialProductState,
    ui: initialProductUIState,
  },
  reducers: {
    // Product Data Management
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    
    addProduct: (state, action: PayloadAction<Product>) => {
      state.products.unshift(action.payload);
    },
    
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex(p => p.productId === action.payload.productId);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
      if (state.currentProduct?.productId === action.payload.productId) {
        state.currentProduct = action.payload;
      }
    },
    
    removeProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter(p => p.productId !== action.payload);
      if (state.currentProduct?.productId === action.payload) {
        state.currentProduct = null;
      }
    },
    
    setCurrentProduct: (state, action: PayloadAction<Product | null>) => {
      state.currentProduct = action.payload;
    },
    
    setSearchResults: (state, action: PayloadAction<Product[]>) => {
      state.searchResults = action.payload;
    },
    
    // Filter Management
    setFilters: (state, action: PayloadAction<Partial<ProductState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    resetFilters: (state) => {
      state.filters = initialProductState.filters;
    },
    
    // Pagination Management
    setPagination: (state, action: PayloadAction<Partial<ProductState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    // Sorting Management
    setSorting: (state, action: PayloadAction<ProductState['sorting']>) => {
      state.sorting = action.payload;
    },
    
    // Loading States
    setLoading: (state, action: PayloadAction<{ key: keyof ProductState['loading']; value: boolean }>) => {
      state.loading[action.payload.key] = action.payload.value;
    },
    
    // Error States
    setError: (state, action: PayloadAction<{ key: keyof ProductState['error']; value: string | null }>) => {
      state.error[action.payload.key] = action.payload.value;
    },
    
    clearErrors: (state) => {
      state.error = initialProductState.error;
    },
    
    // UI State Management
    toggleModal: (state, action: PayloadAction<{ modal: keyof ProductUIState['modals']; isOpen?: boolean }>) => {
      const { modal, isOpen } = action.payload;
      state.ui.modals[modal] = isOpen !== undefined ? isOpen : !state.ui.modals[modal];
    },
    
    togglePanel: (state, action: PayloadAction<{ panel: keyof ProductUIState['panels']; isOpen?: boolean }>) => {
      const { panel, isOpen } = action.payload;
      state.ui.panels[panel] = isOpen !== undefined ? isOpen : !state.ui.panels[panel];
    },
    
    setActiveProduct: (state, action: PayloadAction<string | null>) => {
      state.ui.activeProductId = action.payload;
    },
    
    setViewMode: (state, action: PayloadAction<ProductUIState['viewMode']>) => {
      state.ui.viewMode = action.payload;
    },
    
    // Selection Management
    toggleProductSelection: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      const index = state.ui.selectedProducts.indexOf(productId);
      
      if (index === -1) {
        state.ui.selectedProducts.push(productId);
      } else {
        state.ui.selectedProducts.splice(index, 1);
      }
      
      state.ui.bulkOperations.selectedCount = state.ui.selectedProducts.length;
      state.ui.bulkOperations.isActive = state.ui.selectedProducts.length > 0;
    },
    
    selectAllProducts: (state) => {
      state.ui.selectedProducts = state.products.map(p => p.productId);
      state.ui.bulkOperations.selectedCount = state.ui.selectedProducts.length;
      state.ui.bulkOperations.isActive = true;
    },
    
    clearSelection: (state) => {
      state.ui.selectedProducts = [];
      state.ui.bulkOperations.selectedCount = 0;
      state.ui.bulkOperations.isActive = false;
      state.ui.bulkOperations.operation = null;
    },
    
    // Form Management
    setFormData: (state, action: PayloadAction<Partial<ProductUIState['formData']>>) => {
      state.ui.formData = { ...state.ui.formData, ...action.payload };
    },
    
    resetFormData: (state) => {
      state.ui.formData = initialProductUIState.formData;
    },
    
    // Bulk Operations
    setBulkOperation: (state, action: PayloadAction<ProductUIState['bulkOperations']['operation']>) => {
      state.ui.bulkOperations.operation = action.payload;
    },
    
    // Reset State
    resetProductState: (state) => {
      Object.assign(state, {
        ...initialProductState,
        ui: initialProductUIState,
      });
    },
  },
});

// Export actions
export const {
  setProducts,
  addProduct,
  updateProduct,
  removeProduct,
  setCurrentProduct,
  setSearchResults,
  setFilters,
  resetFilters,
  setPagination,
  setSorting,
  setLoading,
  setError,
  clearErrors,
  toggleModal,
  togglePanel,
  setActiveProduct,
  setViewMode,
  toggleProductSelection,
  selectAllProducts,
  clearSelection,
  setFormData,
  resetFormData,
  setBulkOperation,
  resetProductState,
} = productSlice.actions;

// Selectors
export const selectProducts = (state: RootState) => state.product.products;
export const selectCurrentProduct = (state: RootState) => state.product.currentProduct;
export const selectSearchResults = (state: RootState) => state.product.searchResults;
export const selectProductFilters = (state: RootState) => state.product.filters;
export const selectProductPagination = (state: RootState) => state.product.pagination;
export const selectProductSorting = (state: RootState) => state.product.sorting;
export const selectProductLoading = (state: RootState) => state.product.loading;
export const selectProductError = (state: RootState) => state.product.error;

// UI Selectors
export const selectProductUI = (state: RootState) => state.product.ui;
export const selectProductModals = (state: RootState) => state.product.ui.modals;
export const selectProductPanels = (state: RootState) => state.product.ui.panels;
export const selectSelectedProducts = (state: RootState) => state.product.ui.selectedProducts;
export const selectActiveProductId = (state: RootState) => state.product.ui.activeProductId;
export const selectProductViewMode = (state: RootState) => state.product.ui.viewMode;
export const selectProductFormData = (state: RootState) => state.product.ui.formData;
export const selectBulkOperations = (state: RootState) => state.product.ui.bulkOperations;

// Computed Selectors
export const selectFilteredProducts = (state: RootState) => {
  const { products, filters, sorting } = state.product;
  
  let filtered = products.filter(product => {
    // Search filter
    if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (filters.categoryId && product.categoryId !== filters.categoryId) {
      return false;
    }
    
    // Warehouse filter
    if (filters.warehouseId && product.warehouseId !== filters.warehouseId) {
      return false;
    }
    
    // Price range filter
    if (product.price < filters.priceRange.min || product.price > filters.priceRange.max) {
      return false;
    }
    
    // Stock filter
    if (filters.inStock !== null) {
      const inStock = (product.quantity || 0) > 0;
      if (filters.inStock !== inStock) {
        return false;
      }
    }
    
    return true;
  });
  
  // Apply sorting
  filtered.sort((a, b) => {
    const aValue = a[sorting.field];
    const bValue = b[sorting.field];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sorting.direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sorting.direction === 'asc' 
        ? aValue - bValue
        : bValue - aValue;
    }
    
    return 0;
  });
  
  return filtered;
};

export const selectPaginatedProducts = (state: RootState) => {
  const filtered = selectFilteredProducts(state);
  const { currentPage, itemsPerPage } = state.product.pagination;
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  return filtered.slice(startIndex, endIndex);
};

export const selectProductById = (state: RootState, productId: string) => {
  return state.product.products.find(p => p.productId === productId);
};

export const selectIsProductSelected = (state: RootState, productId: string) => {
  return state.product.ui.selectedProducts.includes(productId);
};

// Export reducer
export default productSlice.reducer;
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Category } from '../api/categoryApiSlice';

// Category State Interface
export interface CategoryState {
  // Data
  categories: Category[];
  currentCategory: Category | null;
  categoryTree: Category[];
  searchResults: Category[];
  
  // Filters and Pagination
  filters: {
    search: string;
    parentCategoryId: string;
    isActive: boolean | null;
    hasProducts: boolean | null;
  };
  
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
  
  // Sorting
  sorting: {
    field: 'name' | 'sortOrder' | 'createdAt' | 'productCount';
    direction: 'asc' | 'desc';
  };
  
  // Loading and Error States
  loading: {
    list: boolean;
    tree: boolean;
    details: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    search: boolean;
    reorder: boolean;
  };
  
  error: {
    list: string | null;
    tree: string | null;
    details: string | null;
    create: string | null;
    update: string | null;
    delete: string | null;
    search: string | null;
    reorder: string | null;
  };
  
  // Statistics
  statistics: {
    totalCategories: number;
    activeCategories: number;
    inactiveCategories: number;
    rootCategories: number;
    maxDepth: number;
  };
}

// Category UI State Interface
export interface CategoryUIState {
  // Modal and Dialog States
  modals: {
    create: boolean;
    edit: boolean;
    delete: boolean;
    view: boolean;
    move: boolean;
    reorder: boolean;
    imageUpload: boolean;
  };
  
  // Panel States
  panels: {
    filters: boolean;
    details: boolean;
    tree: boolean;
    products: boolean;
  };
  
  // Selection States
  selectedCategories: string[];
  activeCategoryId: string | null;
  expandedCategories: string[];
  
  // View States
  viewMode: 'tree' | 'list' | 'grid' | 'table';
  treeExpanded: boolean;
  
  // Form States
  formData: {
    name: string;
    description: string;
    parentCategoryId: string;
    isActive: boolean;
    sortOrder: number;
    imageUrl: string;
  };
  
  // Bulk Operations
  bulkOperations: {
    isActive: boolean;
    selectedCount: number;
    operation: 'delete' | 'activate' | 'deactivate' | 'move' | 'export' | null;
  };
  
  // Drag and Drop
  dragDrop: {
    isDragging: boolean;
    draggedCategoryId: string | null;
    dropTargetId: string | null;
    dropPosition: 'before' | 'after' | 'inside' | null;
  };
  
  // Reorder State
  reorderMode: {
    isActive: boolean;
    pendingChanges: Array<{ categoryId: string; sortOrder: number }>;
  };
}

// Initial States
const initialCategoryState: CategoryState = {
  categories: [],
  currentCategory: null,
  categoryTree: [],
  searchResults: [],
  
  filters: {
    search: '',
    parentCategoryId: '',
    isActive: null,
    hasProducts: null,
  },
  
  pagination: {
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    totalPages: 0,
  },
  
  sorting: {
    field: 'sortOrder',
    direction: 'asc',
  },
  
  loading: {
    list: false,
    tree: false,
    details: false,
    create: false,
    update: false,
    delete: false,
    search: false,
    reorder: false,
  },
  
  error: {
    list: null,
    tree: null,
    details: null,
    create: null,
    update: null,
    delete: null,
    search: null,
    reorder: null,
  },
  
  statistics: {
    totalCategories: 0,
    activeCategories: 0,
    inactiveCategories: 0,
    rootCategories: 0,
    maxDepth: 0,
  },
};

const initialCategoryUIState: CategoryUIState = {
  modals: {
    create: false,
    edit: false,
    delete: false,
    view: false,
    move: false,
    reorder: false,
    imageUpload: false,
  },
  
  panels: {
    filters: false,
    details: false,
    tree: true,
    products: false,
  },
  
  selectedCategories: [],
  activeCategoryId: null,
  expandedCategories: [],
  
  viewMode: 'tree',
  treeExpanded: true,
  
  formData: {
    name: '',
    description: '',
    parentCategoryId: '',
    isActive: true,
    sortOrder: 0,
    imageUrl: '',
  },
  
  bulkOperations: {
    isActive: false,
    selectedCount: 0,
    operation: null,
  },
  
  dragDrop: {
    isDragging: false,
    draggedCategoryId: null,
    dropTargetId: null,
    dropPosition: null,
  },
  
  reorderMode: {
    isActive: false,
    pendingChanges: [],
  },
};

// Category Slice
const categorySlice = createSlice({
  name: 'category',
  initialState: {
    ...initialCategoryState,
    ui: initialCategoryUIState,
  },
  reducers: {
    // Category Data Management
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    
    setCategoryTree: (state, action: PayloadAction<Category[]>) => {
      state.categoryTree = action.payload;
    },
    
    addCategory: (state, action: PayloadAction<Category>) => {
      state.categories.unshift(action.payload);
    },
    
    updateCategory: (state, action: PayloadAction<Category>) => {
      const index = state.categories.findIndex(c => c.categoryId === action.payload.categoryId);
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
      if (state.currentCategory?.categoryId === action.payload.categoryId) {
        state.currentCategory = action.payload;
      }
    },
    
    removeCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter(c => c.categoryId !== action.payload);
      if (state.currentCategory?.categoryId === action.payload) {
        state.currentCategory = null;
      }
    },
    
    setCurrentCategory: (state, action: PayloadAction<Category | null>) => {
      state.currentCategory = action.payload;
    },
    
    setSearchResults: (state, action: PayloadAction<Category[]>) => {
      state.searchResults = action.payload;
    },
    
    // Filter Management
    setFilters: (state, action: PayloadAction<Partial<CategoryState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    resetFilters: (state) => {
      state.filters = initialCategoryState.filters;
    },
    
    // Pagination Management
    setPagination: (state, action: PayloadAction<Partial<CategoryState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    // Sorting Management
    setSorting: (state, action: PayloadAction<CategoryState['sorting']>) => {
      state.sorting = action.payload;
    },
    
    // Loading States
    setLoading: (state, action: PayloadAction<{ key: keyof CategoryState['loading']; value: boolean }>) => {
      state.loading[action.payload.key] = action.payload.value;
    },
    
    // Error States
    setError: (state, action: PayloadAction<{ key: keyof CategoryState['error']; value: string | null }>) => {
      state.error[action.payload.key] = action.payload.value;
    },
    
    clearErrors: (state) => {
      state.error = initialCategoryState.error;
    },
    
    // Statistics Management
    setStatistics: (state, action: PayloadAction<Partial<CategoryState['statistics']>>) => {
      state.statistics = { ...state.statistics, ...action.payload };
    },
    
    // UI State Management
    toggleModal: (state, action: PayloadAction<{ modal: keyof CategoryUIState['modals']; isOpen?: boolean }>) => {
      const { modal, isOpen } = action.payload;
      state.ui.modals[modal] = isOpen !== undefined ? isOpen : !state.ui.modals[modal];
    },
    
    togglePanel: (state, action: PayloadAction<{ panel: keyof CategoryUIState['panels']; isOpen?: boolean }>) => {
      const { panel, isOpen } = action.payload;
      state.ui.panels[panel] = isOpen !== undefined ? isOpen : !state.ui.panels[panel];
    },
    
    setActiveCategory: (state, action: PayloadAction<string | null>) => {
      state.ui.activeCategoryId = action.payload;
    },
    
    setViewMode: (state, action: PayloadAction<CategoryUIState['viewMode']>) => {
      state.ui.viewMode = action.payload;
    },
    
    // Tree Management
    toggleCategoryExpansion: (state, action: PayloadAction<string>) => {
      const categoryId = action.payload;
      const index = state.ui.expandedCategories.indexOf(categoryId);
      
      if (index === -1) {
        state.ui.expandedCategories.push(categoryId);
      } else {
        state.ui.expandedCategories.splice(index, 1);
      }
    },
    
    expandAllCategories: (state) => {
      state.ui.expandedCategories = state.categories.map(c => c.categoryId);
      state.ui.treeExpanded = true;
    },
    
    collapseAllCategories: (state) => {
      state.ui.expandedCategories = [];
      state.ui.treeExpanded = false;
    },
    
    // Selection Management
    toggleCategorySelection: (state, action: PayloadAction<string>) => {
      const categoryId = action.payload;
      const index = state.ui.selectedCategories.indexOf(categoryId);
      
      if (index === -1) {
        state.ui.selectedCategories.push(categoryId);
      } else {
        state.ui.selectedCategories.splice(index, 1);
      }
      
      state.ui.bulkOperations.selectedCount = state.ui.selectedCategories.length;
      state.ui.bulkOperations.isActive = state.ui.selectedCategories.length > 0;
    },
    
    selectAllCategories: (state) => {
      state.ui.selectedCategories = state.categories.map(c => c.categoryId);
      state.ui.bulkOperations.selectedCount = state.ui.selectedCategories.length;
      state.ui.bulkOperations.isActive = true;
    },
    
    clearSelection: (state) => {
      state.ui.selectedCategories = [];
      state.ui.bulkOperations.selectedCount = 0;
      state.ui.bulkOperations.isActive = false;
      state.ui.bulkOperations.operation = null;
    },
    
    // Form Management
    setFormData: (state, action: PayloadAction<Partial<CategoryUIState['formData']>>) => {
      state.ui.formData = { ...state.ui.formData, ...action.payload };
    },
    
    resetFormData: (state) => {
      state.ui.formData = initialCategoryUIState.formData;
    },
    
    // Bulk Operations
    setBulkOperation: (state, action: PayloadAction<CategoryUIState['bulkOperations']['operation']>) => {
      state.ui.bulkOperations.operation = action.payload;
    },
    
    // Drag and Drop Management
    startDrag: (state, action: PayloadAction<string>) => {
      state.ui.dragDrop.isDragging = true;
      state.ui.dragDrop.draggedCategoryId = action.payload;
    },
    
    setDropTarget: (state, action: PayloadAction<{ targetId: string; position: 'before' | 'after' | 'inside' }>) => {
      state.ui.dragDrop.dropTargetId = action.payload.targetId;
      state.ui.dragDrop.dropPosition = action.payload.position;
    },
    
    endDrag: (state) => {
      state.ui.dragDrop.isDragging = false;
      state.ui.dragDrop.draggedCategoryId = null;
      state.ui.dragDrop.dropTargetId = null;
      state.ui.dragDrop.dropPosition = null;
    },
    
    // Reorder Management
    toggleReorderMode: (state) => {
      state.ui.reorderMode.isActive = !state.ui.reorderMode.isActive;
      if (!state.ui.reorderMode.isActive) {
        state.ui.reorderMode.pendingChanges = [];
      }
    },
    
    addReorderChange: (state, action: PayloadAction<{ categoryId: string; sortOrder: number }>) => {
      const { categoryId, sortOrder } = action.payload;
      const existingIndex = state.ui.reorderMode.pendingChanges.findIndex(c => c.categoryId === categoryId);
      
      if (existingIndex !== -1) {
        state.ui.reorderMode.pendingChanges[existingIndex].sortOrder = sortOrder;
      } else {
        state.ui.reorderMode.pendingChanges.push({ categoryId, sortOrder });
      }
    },
    
    clearReorderChanges: (state) => {
      state.ui.reorderMode.pendingChanges = [];
    },
    
    // Reset State
    resetCategoryState: (state) => {
      Object.assign(state, {
        ...initialCategoryState,
        ui: initialCategoryUIState,
      });
    },
  },
});

// Export actions
export const {
  setCategories,
  setCategoryTree,
  addCategory,
  updateCategory,
  removeCategory,
  setCurrentCategory,
  setSearchResults,
  setFilters,
  resetFilters,
  setPagination,
  setSorting,
  setLoading,
  setError,
  clearErrors,
  setStatistics,
  toggleModal,
  togglePanel,
  setActiveCategory,
  setViewMode,
  toggleCategoryExpansion,
  expandAllCategories,
  collapseAllCategories,
  toggleCategorySelection,
  selectAllCategories,
  clearSelection,
  setFormData,
  resetFormData,
  setBulkOperation,
  startDrag,
  setDropTarget,
  endDrag,
  toggleReorderMode,
  addReorderChange,
  clearReorderChanges,
  resetCategoryState,
} = categorySlice.actions;

// Selectors
export const selectCategories = (state: RootState) => state.category.categories;
export const selectCategoryTree = (state: RootState) => state.category.categoryTree;
export const selectCurrentCategory = (state: RootState) => state.category.currentCategory;
export const selectSearchResults = (state: RootState) => state.category.searchResults;
export const selectCategoryFilters = (state: RootState) => state.category.filters;
export const selectCategoryPagination = (state: RootState) => state.category.pagination;
export const selectCategorySorting = (state: RootState) => state.category.sorting;
export const selectCategoryLoading = (state: RootState) => state.category.loading;
export const selectCategoryError = (state: RootState) => state.category.error;
export const selectCategoryStatistics = (state: RootState) => state.category.statistics;

// UI Selectors
export const selectCategoryUI = (state: RootState) => state.category.ui;
export const selectCategoryModals = (state: RootState) => state.category.ui.modals;
export const selectCategoryPanels = (state: RootState) => state.category.ui.panels;
export const selectSelectedCategories = (state: RootState) => state.category.ui.selectedCategories;
export const selectActiveCategoryId = (state: RootState) => state.category.ui.activeCategoryId;
export const selectExpandedCategories = (state: RootState) => state.category.ui.expandedCategories;
export const selectCategoryViewMode = (state: RootState) => state.category.ui.viewMode;
export const selectCategoryFormData = (state: RootState) => state.category.ui.formData;
export const selectCategoryBulkOperations = (state: RootState) => state.category.ui.bulkOperations;
export const selectCategoryDragDrop = (state: RootState) => state.category.ui.dragDrop;
export const selectCategoryReorderMode = (state: RootState) => state.category.ui.reorderMode;

// Computed Selectors
export const selectFilteredCategories = (state: RootState) => {
  const { categories, filters, sorting } = state.category;
  
  let filtered = categories.filter(category => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!category.name.toLowerCase().includes(searchLower) &&
          !category.description?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    
    // Parent category filter
    if (filters.parentCategoryId && category.parentCategoryId !== filters.parentCategoryId) {
      return false;
    }
    
    // Active status filter
    if (filters.isActive !== null && category.isActive !== filters.isActive) {
      return false;
    }
    
    // Has products filter
    if (filters.hasProducts !== null) {
      const hasProducts = (category.productCount || 0) > 0;
      if (filters.hasProducts !== hasProducts) {
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

export const selectPaginatedCategories = (state: RootState) => {
  const filtered = selectFilteredCategories(state);
  const { currentPage, itemsPerPage } = state.category.pagination;
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  return filtered.slice(startIndex, endIndex);
};

export const selectCategoryById = (state: RootState, categoryId: string) => {
  return state.category.categories.find(c => c.categoryId === categoryId);
};

export const selectIsCategorySelected = (state: RootState, categoryId: string) => {
  return state.category.ui.selectedCategories.includes(categoryId);
};

export const selectIsCategoryExpanded = (state: RootState, categoryId: string) => {
  return state.category.ui.expandedCategories.includes(categoryId);
};

export const selectRootCategories = (state: RootState) => {
  return state.category.categories.filter(c => !c.parentCategoryId);
};

export const selectActiveCategories = (state: RootState) => {
  return state.category.categories.filter(c => c.isActive);
};

export const selectCategoryOptions = (state: RootState) => {
  return state.category.categories
    .filter(c => c.isActive)
    .map(c => ({
      value: c.categoryId,
      label: c.name,
      parentId: c.parentCategoryId,
    }));
};

export const selectSubCategories = (state: RootState, parentId: string) => {
  return state.category.categories.filter(c => c.parentCategoryId === parentId);
};

export const selectCategoryPath = (state: RootState, categoryId: string): Category[] => {
  const path: Category[] = [];
  let currentCategory = state.category.categories.find(c => c.categoryId === categoryId);
  
  while (currentCategory) {
    path.unshift(currentCategory);
    if (currentCategory.parentCategoryId) {
      currentCategory = state.category.categories.find(c => c.categoryId === currentCategory!.parentCategoryId);
    } else {
      break;
    }
  }
  
  return path;
};

// Export reducer
export default categorySlice.reducer;
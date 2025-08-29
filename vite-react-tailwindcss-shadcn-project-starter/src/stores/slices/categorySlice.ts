import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Category } from '../api/categoryApiSlice';

// Category State Interface
export interface CategoryState {
  // Data
  categories: Category[];
  selectedCategory: Category | null;
  categoryTree: Category[];
  rootCategories: Category[];
  searchResults: Category[];
  
  // Filters and Pagination
  filters: {
    search: string;
    parentCategoryId: string;
    isActive: boolean | null;
    includeSubCategories: boolean;
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
    tree: boolean;
    reorder: boolean;
  };
  error: {
    list: string | null;
    details: string | null;
    create: string | null;
    update: string | null;
    delete: string | null;
    search: string | null;
    tree: string | null;
    reorder: string | null;
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
    bulkDelete: boolean;
    move: boolean;
    reorder: boolean;
    imageUpload: boolean;
  };
  
  // Panel and Drawer States
  panels: {
    filters: boolean;
    details: boolean;
    tree: boolean;
  };
  
  // Selection States
  selection: {
    selectedIds: string[];
    selectAll: boolean;
  };
  
  // View States
  view: {
    mode: 'tree' | 'list' | 'table' | 'grid';
    density: 'compact' | 'comfortable' | 'spacious';
    expandedNodes: string[];
  };
  
  // Form States
  forms: {
    create: {
      isSubmitting: boolean;
      isDirty: boolean;
      parentCategoryId: string | null;
    };
    edit: {
      isSubmitting: boolean;
      isDirty: boolean;
      categoryId: string | null;
    };
    move: {
      isSubmitting: boolean;
      categoryId: string | null;
      newParentId: string | null;
    };
  };
}

// Initial States
const initialCategoryState: CategoryState = {
  categories: [],
  selectedCategory: null,
  categoryTree: [],
  rootCategories: [],
  searchResults: [],
  filters: {
    search: '',
    parentCategoryId: '',
    isActive: null,
    includeSubCategories: false,
  },
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  },
  sorting: {
    field: 'sortOrder',
    direction: 'asc',
  },
  loading: {
    list: false,
    details: false,
    create: false,
    update: false,
    delete: false,
    search: false,
    tree: false,
    reorder: false,
  },
  error: {
    list: null,
    details: null,
    create: null,
    update: null,
    delete: null,
    search: null,
    tree: null,
    reorder: null,
  },
};

const initialUIState: CategoryUIState = {
  modals: {
    create: false,
    edit: false,
    delete: false,
    view: false,
    bulkDelete: false,
    move: false,
    reorder: false,
    imageUpload: false,
  },
  panels: {
    filters: false,
    details: false,
    tree: true,
  },
  selection: {
    selectedIds: [],
    selectAll: false,
  },
  view: {
    mode: 'tree',
    density: 'comfortable',
    expandedNodes: [],
  },
  forms: {
    create: {
      isSubmitting: false,
      isDirty: false,
      parentCategoryId: null,
    },
    edit: {
      isSubmitting: false,
      isDirty: false,
      categoryId: null,
    },
    move: {
      isSubmitting: false,
      categoryId: null,
      newParentId: null,
    },
  },
};

// Category Slice
export const categorySlice = createSlice({
  name: 'category',
  initialState: {
    data: initialCategoryState,
    ui: initialUIState,
  },
  reducers: {
    // Data Management
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.data.categories = action.payload;
    },
    addCategory: (state, action: PayloadAction<Category>) => {
      state.data.categories.unshift(action.payload);
    },
    updateCategory: (state, action: PayloadAction<Category>) => {
      const index = state.data.categories.findIndex(c => c.categoryId === action.payload.categoryId);
      if (index !== -1) {
        state.data.categories[index] = action.payload;
      }
    },
    removeCategory: (state, action: PayloadAction<string>) => {
      state.data.categories = state.data.categories.filter(c => c.categoryId !== action.payload);
    },
    setSelectedCategory: (state, action: PayloadAction<Category | null>) => {
      state.data.selectedCategory = action.payload;
    },
    setCategoryTree: (state, action: PayloadAction<Category[]>) => {
      state.data.categoryTree = action.payload;
    },
    setRootCategories: (state, action: PayloadAction<Category[]>) => {
      state.data.rootCategories = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<Category[]>) => {
      state.data.searchResults = action.payload;
    },
    
    // Filter Management
    setFilters: (state, action: PayloadAction<Partial<CategoryState['filters']>>) => {
      state.data.filters = { ...state.data.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.data.filters = initialCategoryState.filters;
    },
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.data.filters.search = action.payload;
    },
    setParentCategoryFilter: (state, action: PayloadAction<string>) => {
      state.data.filters.parentCategoryId = action.payload;
    },
    setActiveFilter: (state, action: PayloadAction<boolean | null>) => {
      state.data.filters.isActive = action.payload;
    },
    setIncludeSubCategoriesFilter: (state, action: PayloadAction<boolean>) => {
      state.data.filters.includeSubCategories = action.payload;
    },
    
    // Pagination Management
    setPagination: (state, action: PayloadAction<Partial<CategoryState['pagination']>>) => {
      state.data.pagination = { ...state.data.pagination, ...action.payload };
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.data.pagination.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.data.pagination.limit = action.payload;
    },
    
    // Sorting Management
    setSorting: (state, action: PayloadAction<CategoryState['sorting']>) => {
      state.data.sorting = action.payload;
    },
    
    // Loading States
    setLoading: (state, action: PayloadAction<{ key: keyof CategoryState['loading']; value: boolean }>) => {
      state.data.loading[action.payload.key] = action.payload.value;
    },
    
    // Error States
    setError: (state, action: PayloadAction<{ key: keyof CategoryState['error']; value: string | null }>) => {
      state.data.error[action.payload.key] = action.payload.value;
    },
    clearErrors: (state) => {
      state.data.error = initialCategoryState.error;
    },
    
    // UI State Management
    toggleModal: (state, action: PayloadAction<keyof CategoryUIState['modals']>) => {
      state.ui.modals[action.payload] = !state.ui.modals[action.payload];
    },
    setModal: (state, action: PayloadAction<{ modal: keyof CategoryUIState['modals']; open: boolean }>) => {
      state.ui.modals[action.payload.modal] = action.payload.open;
    },
    closeAllModals: (state) => {
      state.ui.modals = initialUIState.modals;
    },
    
    togglePanel: (state, action: PayloadAction<keyof CategoryUIState['panels']>) => {
      state.ui.panels[action.payload] = !state.ui.panels[action.payload];
    },
    setPanel: (state, action: PayloadAction<{ panel: keyof CategoryUIState['panels']; open: boolean }>) => {
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
        state.ui.selection.selectedIds = state.data.categories.map(c => c.categoryId);
      } else {
        state.ui.selection.selectedIds = [];
      }
    },
    
    // View Management
    setViewMode: (state, action: PayloadAction<CategoryUIState['view']['mode']>) => {
      state.ui.view.mode = action.payload;
    },
    setViewDensity: (state, action: PayloadAction<CategoryUIState['view']['density']>) => {
      state.ui.view.density = action.payload;
    },
    
    // Tree Node Management
    toggleNodeExpansion: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload;
      const index = state.ui.view.expandedNodes.indexOf(nodeId);
      if (index === -1) {
        state.ui.view.expandedNodes.push(nodeId);
      } else {
        state.ui.view.expandedNodes.splice(index, 1);
      }
    },
    setExpandedNodes: (state, action: PayloadAction<string[]>) => {
      state.ui.view.expandedNodes = action.payload;
    },
    expandAllNodes: (state) => {
      state.ui.view.expandedNodes = state.data.categories.map(c => c.categoryId);
    },
    collapseAllNodes: (state) => {
      state.ui.view.expandedNodes = [];
    },
    
    // Form Management
    setFormState: (state, action: PayloadAction<{ form: 'create' | 'edit' | 'move'; field: string; value: any }>) => {
      const { form, field, value } = action.payload;
      (state.ui.forms[form] as any)[field] = value;
    },
    resetFormState: (state, action: PayloadAction<'create' | 'edit' | 'move'>) => {
      state.ui.forms[action.payload] = initialUIState.forms[action.payload];
    },
    
    // Category Hierarchy Management
    moveCategory: (state, action: PayloadAction<{ categoryId: string; newParentId: string | null }>) => {
      const { categoryId, newParentId } = action.payload;
      const category = state.data.categories.find(c => c.categoryId === categoryId);
      if (category) {
        category.parentCategoryId = newParentId || undefined;
      }
    },
    
    // Reorder Categories
    reorderCategories: (state, action: PayloadAction<Array<{ categoryId: string; sortOrder: number }>>) => {
      const reorderData = action.payload;
      reorderData.forEach(({ categoryId, sortOrder }) => {
        const category = state.data.categories.find(c => c.categoryId === categoryId);
        if (category) {
          category.sortOrder = sortOrder;
        }
      });
      // Sort categories by sortOrder
      state.data.categories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    },
    
    // Reset State
    resetCategoryState: (state) => {
      state.data = initialCategoryState;
      state.ui = initialUIState;
    },
  },
});

// Export actions
export const {
  // Data actions
  setCategories,
  addCategory,
  updateCategory,
  removeCategory,
  setSelectedCategory,
  setCategoryTree,
  setRootCategories,
  setSearchResults,
  
  // Filter actions
  setFilters,
  resetFilters,
  setSearchFilter,
  setParentCategoryFilter,
  setActiveFilter,
  setIncludeSubCategoriesFilter,
  
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
  
  // Tree actions
  toggleNodeExpansion,
  setExpandedNodes,
  expandAllNodes,
  collapseAllNodes,
  
  // Form actions
  setFormState,
  resetFormState,
  
  // Hierarchy actions
  moveCategory,
  reorderCategories,
  
  // Reset actions
  resetCategoryState,
} = categorySlice.actions;

// Selectors
export const selectCategoryData = (state: RootState) => state.category.data;
export const selectCategoryUI = (state: RootState) => state.category.ui;
export const selectCategories = (state: RootState) => state.category.data.categories;
export const selectSelectedCategory = (state: RootState) => state.category.data.selectedCategory;
export const selectCategoryTree = (state: RootState) => state.category.data.categoryTree;
export const selectRootCategories = (state: RootState) => state.category.data.rootCategories;
export const selectCategoryFilters = (state: RootState) => state.category.data.filters;
export const selectCategoryPagination = (state: RootState) => state.category.data.pagination;
export const selectCategorySorting = (state: RootState) => state.category.data.sorting;
export const selectCategoryLoading = (state: RootState) => state.category.data.loading;
export const selectCategoryError = (state: RootState) => state.category.data.error;
export const selectCategoryModals = (state: RootState) => state.category.ui.modals;
export const selectCategorySelection = (state: RootState) => state.category.ui.selection;
export const selectCategoryView = (state: RootState) => state.category.ui.view;
export const selectExpandedNodes = (state: RootState) => state.category.ui.view.expandedNodes;

// Complex selectors
export const selectFilteredCategories = (state: RootState) => {
  const { categories, filters } = state.category.data;
  return categories.filter(category => {
    if (filters.search && !category.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.parentCategoryId && category.parentCategoryId !== filters.parentCategoryId) {
      return false;
    }
    if (filters.isActive !== null && category.isActive !== filters.isActive) {
      return false;
    }
    return true;
  });
};

export const selectSelectedCategories = (state: RootState) => {
  const { categories } = state.category.data;
  const { selectedIds } = state.category.ui.selection;
  return categories.filter(category => selectedIds.includes(category.categoryId));
};

export const selectIsCategorySelected = (categoryId: string) => (state: RootState) => {
  return state.category.ui.selection.selectedIds.includes(categoryId);
};

export const selectIsNodeExpanded = (nodeId: string) => (state: RootState) => {
  return state.category.ui.view.expandedNodes.includes(nodeId);
};

export const selectActiveCategories = (state: RootState) => {
  return state.category.data.categories.filter(category => category.isActive);
};

export const selectCategoriesByParent = (parentId: string | null) => (state: RootState) => {
  return state.category.data.categories.filter(category => 
    parentId ? category.parentCategoryId === parentId : !category.parentCategoryId
  );
};

// Export reducer
export default categorySlice.reducer;
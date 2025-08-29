// Category Domain Types
export interface Category {
  categoryId: string;
  name: string;
  description?: string;
  tags?: string[];
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// Category Form Data Types
export interface CategoryFormData {
  name: string;
  description?: string;
  tags?: string[];
}

// API Response Types
export interface CategoriesResponse {
  categories: Category[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface CategoryResponse {
  categories: Category;
  message?: string;
}

// Search and Filter Types
export interface CategorySearchParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Category Statistics Types
export interface CategoryStats {
  totalCategories: number;
  recentCategories: number;
  popularCategories: Category[];
}

// Permission Types
export interface CategoryPermissions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

// UI State Types
export interface CategoryUIState {
  currentPage: number;
  recordsPerPage: number;
  searchTerm: string;
  selectedCategory: Category | null;
  isLoading: boolean;
  error: string | null;
}

// Form State Types
export interface CategoryFormState {
  isSubmitting: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
}

// List Item Type for display
export interface CategoryListItem {
  categoryId: string;
  name: string;
  description?: string;
  createdAt: string;
  formattedDate: string;
  canEdit: boolean;
  canDelete: boolean;
}

// Export all types
export type {
  Category,
  CategoryFormData,
  CategoriesResponse,
  CategoryResponse,
  CategorySearchParams,
  CategoryStats,
  CategoryPermissions,
  CategoryUIState,
  CategoryFormState,
  CategoryListItem,
};
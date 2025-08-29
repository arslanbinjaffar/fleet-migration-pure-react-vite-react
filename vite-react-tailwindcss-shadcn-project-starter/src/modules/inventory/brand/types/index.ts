// Brand Domain Types
export interface Brand {
  brandId: string;
  name: string;
  description?: string;
  tags?: string[];
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// Brand Form Data Types
export interface BrandFormData {
  name: string;
  description?: string;
  tags?: string[];
}

// API Response Types
export interface BrandsResponse {
  brands: Brand[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface BrandResponse {
  brands: Brand;
  message?: string;
}

// Search and Filter Types
export interface BrandSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Brand Statistics Types
export interface BrandStats {
  totalBrands: number;
  recentBrands: number;
  popularBrands: Brand[];
}

// Permission Types
export interface BrandPermissions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

// UI State Types
export interface BrandUIState {
  currentPage: number;
  recordsPerPage: number;
  searchTerm: string;
  selectedBrand: Brand | null;
  isLoading: boolean;
  error: string | null;
}

// Form State Types
export interface BrandFormState {
  isSubmitting: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
}

// List Item Type for display
export interface BrandListItem {
  brandId: string;
  name: string;
  description?: string;
  createdAt: string;
  formattedDate: string;
  canEdit: boolean;
  canDelete: boolean;
}

// Export all types
export type {
  Brand,
  BrandFormData,
  BrandsResponse,
  BrandResponse,
  BrandSearchParams,
  BrandStats,
  BrandPermissions,
  BrandUIState,
  BrandFormState,
  BrandListItem,
};
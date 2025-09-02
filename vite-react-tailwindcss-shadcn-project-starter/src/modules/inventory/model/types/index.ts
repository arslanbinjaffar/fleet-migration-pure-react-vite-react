// Model Domain Types
export interface Model {
  modelId: string;
  name: string;
  description?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// Model Form Data Types
export interface ModelFormData {
  name: string;
  description?: string;
  tags?: string[];
}

// API Response Types
export interface ModelsResponse {
  model: Model[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface ModelResponse {
  model: Model;
  message?: string;
}

// Search and Filter Types
export interface ModelSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Model Statistics Types
export interface ModelStats {
  totalModels: number;
  recentModels: number;
  popularModels: Model[];
}

// Permission Types
export interface ModelPermissions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

// UI State Types
export interface ModelUIState {
  currentPage: number;
  recordsPerPage: number;
  searchTerm: string;
  selectedModel: Model | null;
  isLoading: boolean;
  error: string | null;
}

// Form State Types
export interface ModelFormState {
  isSubmitting: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
}

// List Item Type for display
export interface ModelListItem {
  modelId: string;
  name: string;
  description?: string;
  createdAt: string;
  formattedDate: string;
  canEdit: boolean;
  canDelete: boolean;
}


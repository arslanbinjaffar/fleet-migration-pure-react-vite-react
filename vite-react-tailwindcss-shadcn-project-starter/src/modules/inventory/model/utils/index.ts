import { format, parseISO } from 'date-fns';
import { Model, ModelSearchParams, ModelListItem } from '../types';

// Format model data for display
export const formatModelForDisplay = (model: Model): ModelListItem => {
  return {
    modelId: model.modelId,
    name: model.name,
    description: model.description,
    createdAt: model.createdAt,
    formattedDate: format(parseISO(model.createdAt), 'MMM dd, yyyy'),
    canEdit: true, // This should be determined by permissions
    canDelete: true, // This should be determined by permissions
  };
};

// Filter models based on search criteria
export const filterModels = (models: Model[], searchParams: ModelSearchParams) => {
  let filtered = [...models];

  // Search filter
  if (searchParams.search) {
    const searchTerm = searchParams.search.toLowerCase();
    filtered = filtered.filter(model => 
      model.name.toLowerCase().includes(searchTerm) ||
      model.description?.toLowerCase().includes(searchTerm) ||
      format(parseISO(model.createdAt), 'MMM dd, yyyy').toLowerCase().includes(searchTerm)
    );
  }

  return filtered;
};

// Sort models
export const sortModels = (models: Model[], sortBy: string, sortOrder: 'asc' | 'desc') => {
  return [...models].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }

    if (aValue < bValue) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

// Paginate models
export const paginateModels = (models: Model[], page: number, limit: number) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    data: models.slice(startIndex, endIndex),
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(models.length / limit),
      totalItems: models.length,
      itemsPerPage: limit,
      hasNextPage: endIndex < models.length,
      hasPreviousPage: page > 1,
    },
  };
};

// Generate CSV data for export
export const generateModelCSVData = (models: Model[]) => {
  const headers = [
    'Name',
    'Description',
    'Tags',
    'Created At',
    'Updated At',
  ];

  const data = models.map(model => [
    model.name,
    model.description || '',
    model.tags?.join(', ') || '',
    format(parseISO(model.createdAt), 'yyyy-MM-dd HH:mm:ss'),
    format(parseISO(model.updatedAt), 'yyyy-MM-dd HH:mm:ss'),
  ]);

  return [headers, ...data];
};

// Validate model name uniqueness
export const validateModelNameUniqueness = (name: string, models: Model[], excludeId?: string) => {
  const normalizedName = name.toLowerCase().trim();
  return !models.some(model => 
    model.name.toLowerCase().trim() === normalizedName && 
    model.modelId !== excludeId
  );
};

// Generate model options for select components
export const generateModelOptions = (models: Model[]) => {
  return models.map(model => ({
    value: model.modelId,
    label: model.name,
    description: model.description,
  }));
};

// Debounce function for search
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Format tags for display
export const formatTags = (tags?: string[]) => {
  if (!tags || tags.length === 0) return 'No tags';
  return tags.join(', ');
};

// Validate model form data
export const validateModelForm = (data: any) => {
  const errors: Record<string, string> = {};

  if (!data.name?.trim()) {
    errors.name = 'Model name is required';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Model name must be at least 2 characters';
  } else if (data.name.trim().length > 100) {
    errors.name = 'Model name must be less than 100 characters';
  }

  if (data.description && data.description.length > 500) {
    errors.description = 'Description must be less than 500 characters';
  }

  if (data.tags && Array.isArray(data.tags)) {
    if (data.tags.length > 10) {
      errors.tags = 'Maximum 10 tags allowed';
    }
    
    const invalidTag = data.tags.find((tag: string) => tag.length > 50);
    if (invalidTag) {
      errors.tags = 'Each tag must be less than 50 characters';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Search models with highlighting
export const searchModelsWithHighlight = (models: Model[], searchTerm: string) => {
  if (!searchTerm) return models.map(model => ({ ...model, highlighted: false }));
  
  const term = searchTerm.toLowerCase();
  
  return models.map(model => {
    const highlighted = 
      model.name.toLowerCase().includes(term) ||
      model.description?.toLowerCase().includes(term) || false;
    
    return {
      ...model,
      highlighted,
    };
  });
};

// Calculate model statistics
export const calculateModelStats = (models: Model[]) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const recentModels = models.filter(model => 
    new Date(model.createdAt) >= thirtyDaysAgo
  ).length;
  
  const popularModels = models
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  
  return {
    totalModels: models.length,
    recentModels,
    popularModels,
  };
};

// Clean model data for API submission
export const cleanModelData = (data: any) => {
  return {
    name: data.name?.trim(),
    description: data.description?.trim() || undefined,
    tags: data.tags?.filter((tag: string) => tag.trim()) || [],
  };
};

// Export all utilities

import { format, parseISO } from 'date-fns';
import { Category, CategorySearchParams, CategoryListItem } from '../types';

// Format category data for display
export const formatCategoryForDisplay = (category: Category): CategoryListItem => {
  return {
    categoryId: category.categoryId,
    name: category.name,
    description: category.description,
    createdAt: category.createdAt,
    formattedDate: format(parseISO(category.createdAt), 'MMM dd, yyyy'),
    canEdit: true, // This should be determined by permissions
    canDelete: true, // This should be determined by permissions
  };
};

// Filter categories based on search criteria
export const filterCategories = (categories: Category[], searchParams: CategorySearchParams) => {
  let filtered = [...categories];

  // Search filter
  if (searchParams.search) {
    const searchTerm = searchParams.search.toLowerCase();
    filtered = filtered.filter(category => 
      category.name.toLowerCase().includes(searchTerm) ||
      category.description?.toLowerCase().includes(searchTerm) ||
      format(parseISO(category.createdAt), 'MMM dd, yyyy').toLowerCase().includes(searchTerm)
    );
  }

  return filtered;
};

// Sort categories
export const sortCategories = (categories: Category[], sortBy: string, sortOrder: 'asc' | 'desc') => {
  return [...categories].sort((a, b) => {
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

// Paginate categories
export const paginateCategories = (categories: Category[], page: number, limit: number) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    data: categories.slice(startIndex, endIndex),
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(categories.length / limit),
      totalItems: categories.length,
      itemsPerPage: limit,
      hasNextPage: endIndex < categories.length,
      hasPreviousPage: page > 1,
    },
  };
};

// Generate CSV data for export
export const generateCategoryCSVData = (categories: Category[]) => {
  const headers = [
    '#',
    'Category Name',
    'Description',
    'Date',
  ];

  const data = categories.map((category, index) => [
    (index + 1).toString(),
    category.name,
    category.description || '',
    format(parseISO(category.createdAt), 'dd/MM/yyyy HH:mm:ss'),
  ]);

  return [headers, ...data];
};

// Validate category name uniqueness
export const validateCategoryNameUniqueness = (name: string, categories: Category[], excludeId?: string) => {
  const normalizedName = name.toLowerCase().trim();
  return !categories.some(category => 
    category.name.toLowerCase().trim() === normalizedName && 
    category.categoryId !== excludeId
  );
};

// Generate category options for select components
export const generateCategoryOptions = (categories: Category[]) => {
  return categories
    .filter(category => !category.isDeleted)
    .map(category => ({
      value: category.categoryId,
      label: category.name,
      description: category.description,
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

// Validate category form data
export const validateCategoryForm = (data: any) => {
  const errors: Record<string, string> = {};

  if (!data.name?.trim()) {
    errors.name = 'Category name is required';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Category name must be at least 2 characters';
  } else if (data.name.trim().length > 100) {
    errors.name = 'Category name must be less than 100 characters';
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

// Search categories with highlighting
export const searchCategoriesWithHighlight = (categories: Category[], searchTerm: string) => {
  if (!searchTerm) return categories.map(category => ({ ...category, highlighted: false }));
  
  const term = searchTerm.toLowerCase();
  
  return categories.map(category => {
    const highlighted = 
      category.name.toLowerCase().includes(term) ||
      category.description?.toLowerCase().includes(term) || false;
    
    return {
      ...category,
      highlighted,
    };
  });
};

// Calculate category statistics
export const calculateCategoryStats = (categories: Category[]) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const recentCategories = categories.filter(category => 
    new Date(category.createdAt) >= thirtyDaysAgo
  ).length;
  
  const popularCategories = categories
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  
  return {
    totalCategories: categories.length,
    recentCategories,
    popularCategories,
  };
};

// Clean category data for API submission
export const cleanCategoryData = (data: any) => {
  return {
    name: data.name?.trim(),
    description: data.description?.trim() || undefined,
    tags: data.tags?.filter((tag: string) => tag.trim()) || [],
  };
};

// Export all utilities
export {
  formatCategoryForDisplay,
  filterCategories,
  sortCategories,
  paginateCategories,
  generateCategoryCSVData,
  validateCategoryNameUniqueness,
  generateCategoryOptions,
  debounce,
  formatTags,
  validateCategoryForm,
  searchCategoriesWithHighlight,
  calculateCategoryStats,
  cleanCategoryData,
};
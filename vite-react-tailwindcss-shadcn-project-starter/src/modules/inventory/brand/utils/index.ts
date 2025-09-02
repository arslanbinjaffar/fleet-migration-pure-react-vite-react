import { format, parseISO } from 'date-fns';
import { Brand, BrandSearchParams, BrandListItem } from '../types';

// Format brand data for display
export const formatBrandForDisplay = (brand: Brand): BrandListItem => {
  return {
    brandId: brand.brandId,
    name: brand.name,
    description: brand.description,
    createdAt: brand.createdAt,
    formattedDate: format(parseISO(brand.createdAt), 'MMM dd, yyyy'),
    canEdit: true, // This should be determined by permissions
    canDelete: true, // This should be determined by permissions
  };
};

// Filter brands based on search criteria
export const filterBrands = (brands: Brand[], searchParams: BrandSearchParams) => {
  let filtered = [...brands];

  // Search filter
  if (searchParams.search) {
    const searchTerm = searchParams.search.toLowerCase();
    filtered = filtered.filter(brand => 
      brand.name.toLowerCase().includes(searchTerm) ||
      brand.description?.toLowerCase().includes(searchTerm) ||
      format(parseISO(brand.createdAt), 'MMM dd, yyyy').toLowerCase().includes(searchTerm)
    );
  }

  return filtered;
};

// Sort brands
export const sortBrands = (brands: Brand[], sortBy: string, sortOrder: 'asc' | 'desc') => {
  return [...brands].sort((a, b) => {
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

// Paginate brands
export const paginateBrands = (brands: Brand[], page: number, limit: number) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    data: brands.slice(startIndex, endIndex),
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(brands.length / limit),
      totalItems: brands.length,
      itemsPerPage: limit,
      hasNextPage: endIndex < brands.length,
      hasPreviousPage: page > 1,
    },
  };
};

// Generate CSV data for export
export const generateBrandCSVData = (brands: Brand[]) => {
  const headers = [
    '#',
    'Brand Name',
    'Description',
    'Date',
  ];

  const data = brands.map((brand, index) => [
    (index + 1).toString(),
    brand.name,
    brand.description || '',
    format(parseISO(brand.createdAt), 'dd/MM/yyyy HH:mm:ss'),
  ]);

  return [headers, ...data];
};

// Validate brand name uniqueness
export const validateBrandNameUniqueness = (name: string, brands: Brand[], excludeId?: string) => {
  const normalizedName = name.toLowerCase().trim();
  return !brands.some(brand => 
    brand.name.toLowerCase().trim() === normalizedName && 
    brand.brandId !== excludeId
  );
};

// Generate brand options for select components
export const generateBrandOptions = (brands: Brand[]) => {
  return brands
    .filter(brand => !brand.isDeleted)
    .map(brand => ({
      value: brand.brandId,
      label: brand.name,
      description: brand.description,
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

// Clean brand data for API submission
export const cleanBrandData = (data: any) => {
  return {
    name: data.name?.trim(),
    description: data.description?.trim() || undefined,
    tags: data.tags?.filter((tag: string) => tag.trim()) || [],
  };
};
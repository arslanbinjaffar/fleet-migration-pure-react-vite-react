import type { SparePart, StockLevelInfo, StockMovement } from '../types';

// Format currency values
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Format spare part display name
export const getSparePartDisplayName = (sparePart: SparePart): string => {
  return `${sparePart.partNumber} - ${sparePart.partName}`;
};

// Get spare part status badge color
export const getSparePartStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    case 'discontinued':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get stock level information
export const getStockLevelInfo = (sparePart: SparePart): StockLevelInfo => {
  const { quantityInStock, minimumStock, reorderLevel, maximumStock } = sparePart;
  
  if (quantityInStock === 0) {
    return {
      level: 'out',
      color: 'text-red-600 bg-red-50',
      message: 'Out of Stock'
    };
  }
  
  if (quantityInStock <= reorderLevel) {
    return {
      level: 'critical',
      color: 'text-orange-600 bg-orange-50',
      message: 'Critical Stock'
    };
  }
  
  if (quantityInStock <= minimumStock) {
    return {
      level: 'low',
      color: 'text-yellow-600 bg-yellow-50',
      message: 'Low Stock'
    };
  }
  
  if (maximumStock && quantityInStock > maximumStock) {
    return {
      level: 'overstock',
      color: 'text-blue-600 bg-blue-50',
      message: 'Overstock'
    };
  }
  
  return {
    level: 'normal',
    color: 'text-green-600 bg-green-50',
    message: 'Normal Stock'
  };
};

// Get stock level color class
export const getStockLevelColor = (sparePart: SparePart): string => {
  const stockInfo = getStockLevelInfo(sparePart);
  return stockInfo.color;
};

// Calculate stock value
export const calculateStockValue = (sparePart: SparePart): number => {
  return sparePart.quantityInStock * (sparePart.costPrice || sparePart.unitPrice);
};

// Calculate potential profit
export const calculatePotentialProfit = (sparePart: SparePart): number => {
  if (!sparePart.costPrice) return 0;
  const profitPerUnit = sparePart.unitPrice - sparePart.costPrice;
  return sparePart.quantityInStock * profitPerUnit;
};

// Calculate profit margin percentage
export const calculateProfitMargin = (sparePart: SparePart): number => {
  if (!sparePart.costPrice || sparePart.costPrice === 0) return 0;
  return ((sparePart.unitPrice - sparePart.costPrice) / sparePart.unitPrice) * 100;
};

// Format dimensions
export const formatDimensions = (dimensions?: { length?: number; width?: number; height?: number }): string => {
  if (!dimensions) return '-';
  
  const { length, width, height } = dimensions;
  const parts = [];
  
  if (length) parts.push(`L: ${length}`);
  if (width) parts.push(`W: ${width}`);
  if (height) parts.push(`H: ${height}`);
  
  return parts.length > 0 ? parts.join(' × ') : '-';
};

// Format weight
export const formatWeight = (weight?: number, unit = 'kg'): string => {
  if (!weight) return '-';
  return `${weight} ${unit}`;
};

// Generate SKU
export const generateSKU = (partName: string, brand: string, category: string): string => {
  const cleanName = partName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 3);
  const cleanBrand = brand.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 2);
  const cleanCategory = category.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 2);
  const timestamp = Date.now().toString().slice(-4);
  
  return `${cleanCategory}${cleanBrand}${cleanName}${timestamp}`;
};

// Check if spare part needs reordering
export const needsReordering = (sparePart: SparePart): boolean => {
  return sparePart.quantityInStock <= sparePart.reorderLevel;
};

// Check if spare part is low stock
export const isLowStock = (sparePart: SparePart): boolean => {
  return sparePart.quantityInStock <= sparePart.minimumStock;
};

// Check if spare part is out of stock
export const isOutOfStock = (sparePart: SparePart): boolean => {
  return sparePart.quantityInStock === 0;
};

// Check if spare part is overstocked
export const isOverstocked = (sparePart: SparePart): boolean => {
  return sparePart.maximumStock ? sparePart.quantityInStock > sparePart.maximumStock : false;
};

// Get movement type color
export const getMovementTypeColor = (type: string): string => {
  switch (type) {
    case 'in':
      return 'text-green-600';
    case 'out':
      return 'text-red-600';
    case 'adjustment':
      return 'text-blue-600';
    case 'transfer':
      return 'text-purple-600';
    default:
      return 'text-gray-600';
  }
};

// Format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format date and time for display
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Sort spare parts by various criteria
export const sortSpareParts = (
  spareParts: SparePart[],
  sortBy: 'partName' | 'partNumber' | 'quantityInStock' | 'unitPrice' | 'createdAt',
  sortOrder: 'asc' | 'desc' = 'asc'
): SparePart[] => {
  return [...spareParts].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'partName':
        comparison = a.partName.localeCompare(b.partName);
        break;
      case 'partNumber':
        comparison = a.partNumber.localeCompare(b.partNumber);
        break;
      case 'quantityInStock':
        comparison = a.quantityInStock - b.quantityInStock;
        break;
      case 'unitPrice':
        comparison = a.unitPrice - b.unitPrice;
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        break;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });
};

// Filter spare parts based on search criteria
export const filterSpareParts = (
  spareParts: SparePart[],
  filters: {
    search?: string;
    category?: string;
    subcategory?: string;
    brand?: string;
    status?: string;
    stockLevel?: string;
    supplierId?: string;
  }
): SparePart[] => {
  return spareParts.filter((sparePart) => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = 
        sparePart.partName.toLowerCase().includes(searchTerm) ||
        sparePart.partNumber.toLowerCase().includes(searchTerm) ||
        sparePart.brand.toLowerCase().includes(searchTerm) ||
        (sparePart.description && sparePart.description.toLowerCase().includes(searchTerm)) ||
        (sparePart.sku && sparePart.sku.toLowerCase().includes(searchTerm));
      
      if (!matchesSearch) return false;
    }
    
    // Category filter
    if (filters.category && sparePart.category !== filters.category) {
      return false;
    }
    
    // Subcategory filter
    if (filters.subcategory && sparePart.subcategory !== filters.subcategory) {
      return false;
    }
    
    // Brand filter
    if (filters.brand && sparePart.brand !== filters.brand) {
      return false;
    }
    
    // Status filter
    if (filters.status && filters.status !== 'all' && sparePart.status !== filters.status) {
      return false;
    }
    
    // Stock level filter
    if (filters.stockLevel && filters.stockLevel !== 'all') {
      switch (filters.stockLevel) {
        case 'low_stock':
          if (!isLowStock(sparePart)) return false;
          break;
        case 'out_of_stock':
          if (!isOutOfStock(sparePart)) return false;
          break;
        case 'overstock':
          if (!isOverstocked(sparePart)) return false;
          break;
      }
    }
    
    // Supplier filter
    if (filters.supplierId && sparePart.supplierId !== filters.supplierId) {
      return false;
    }
    
    return true;
  });
};

// Calculate total stock value for multiple spare parts
export const calculateTotalStockValue = (spareParts: SparePart[]): number => {
  return spareParts.reduce((total, sparePart) => total + calculateStockValue(sparePart), 0);
};

// Get spare parts that need reordering
export const getReorderSpareParts = (spareParts: SparePart[]): SparePart[] => {
  return spareParts.filter(needsReordering);
};

// Get low stock spare parts
export const getLowStockSpareParts = (spareParts: SparePart[]): SparePart[] => {
  return spareParts.filter(isLowStock);
};

// Get out of stock spare parts
export const getOutOfStockSpareParts = (spareParts: SparePart[]): SparePart[] => {
  return spareParts.filter(isOutOfStock);
};

// Validate part number format
export const isValidPartNumber = (partNumber: string): boolean => {
  // Basic validation - alphanumeric with hyphens and underscores
  const partNumberRegex = /^[A-Za-z0-9\-_]+$/;
  return partNumberRegex.test(partNumber);
};

// Generate barcode (simple implementation)
export const generateBarcode = (partNumber: string): string => {
  // Simple barcode generation - in real app, use proper barcode library
  const cleanPartNumber = partNumber.replace(/[^A-Za-z0-9]/g, '');
  const timestamp = Date.now().toString().slice(-6);
  return `${cleanPartNumber}${timestamp}`.toUpperCase();
};

// Calculate days until reorder needed (based on usage rate)
export const calculateDaysUntilReorder = (
  sparePart: SparePart,
  dailyUsageRate: number
): number => {
  if (dailyUsageRate <= 0) return Infinity;
  
  const daysUntilReorderLevel = (sparePart.quantityInStock - sparePart.reorderLevel) / dailyUsageRate;
  return Math.max(0, Math.ceil(daysUntilReorderLevel));
};

// Get compatible vehicles display text
export const getCompatibleVehiclesText = (compatibleVehicles?: string[]): string => {
  if (!compatibleVehicles || compatibleVehicles.length === 0) {
    return 'Universal';
  }
  
  if (compatibleVehicles.length <= 3) {
    return compatibleVehicles.join(', ');
  }
  
  return `${compatibleVehicles.slice(0, 3).join(', ')} +${compatibleVehicles.length - 3} more`;
};
// Spare Parts type definitions
export interface SparePart {
  sparePartId?: string;
  partNumber: string;
  partName: string;
  description?: string;
  category: string;
  subcategory?: string;
  brand: string;
  model?: string;
  unitPrice: number;
  costPrice?: number;
  quantityInStock: number;
  minimumStock: number;
  maximumStock?: number;
  reorderLevel: number;
  unit: string; // e.g., 'piece', 'kg', 'liter'
  location?: string; // warehouse location
  barcode?: string;
  sku?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  compatibleVehicles?: string[]; // array of vehicle model IDs
  supplierId?: string;
  supplierPartNumber?: string;
  warrantyPeriod?: number; // in months
  status: 'active' | 'inactive' | 'discontinued';
  images?: string[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// Spare part category
export interface SparePartCategory {
  categoryId: string;
  categoryName: string;
  description?: string;
  parentCategoryId?: string;
  subcategories?: SparePartCategory[];
}

// Stock movement
export interface StockMovement {
  movementId: string;
  sparePartId: string;
  movementType: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  referenceNumber?: string; // PO number, job number, etc.
  location?: string;
  performedBy: string;
  performedAt: string;
  notes?: string;
}

// API response types
export interface SparePartsResponse {
  spareParts: SparePart[];
  total: number;
  page: number;
  limit: number;
}

export interface SparePartCategoriesResponse {
  categories: SparePartCategory[];
}

export interface StockMovementsResponse {
  movements: StockMovement[];
  total: number;
}

// Form types
export interface SparePartFormData {
  partNumber: string;
  partName: string;
  description?: string;
  category: string;
  subcategory?: string;
  brand: string;
  model?: string;
  unitPrice: number;
  costPrice?: number;
  quantityInStock: number;
  minimumStock: number;
  maximumStock?: number;
  reorderLevel: number;
  unit: string;
  location?: string;
  barcode?: string;
  sku?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  compatibleVehicles?: string[];
  supplierId?: string;
  supplierPartNumber?: string;
  warrantyPeriod?: number;
  status: 'active' | 'inactive' | 'discontinued';
  notes?: string;
}

export interface StockAdjustmentFormData {
  sparePartId: string;
  adjustmentType: 'increase' | 'decrease' | 'set';
  quantity: number;
  reason: string;
  notes?: string;
}

// Filter and search types
export interface SparePartFilters {
  search?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  status?: 'active' | 'inactive' | 'discontinued' | 'all';
  stockLevel?: 'all' | 'low_stock' | 'out_of_stock' | 'overstock';
  supplierId?: string;
  sortBy?: 'partName' | 'partNumber' | 'quantityInStock' | 'unitPrice' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Constants
export const SPARE_PART_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'discontinued', label: 'Discontinued' },
] as const;

export const UNIT_OPTIONS = [
  { value: 'piece', label: 'Piece' },
  { value: 'pair', label: 'Pair' },
  { value: 'set', label: 'Set' },
  { value: 'kg', label: 'Kilogram' },
  { value: 'g', label: 'Gram' },
  { value: 'liter', label: 'Liter' },
  { value: 'ml', label: 'Milliliter' },
  { value: 'meter', label: 'Meter' },
  { value: 'cm', label: 'Centimeter' },
  { value: 'box', label: 'Box' },
  { value: 'pack', label: 'Pack' },
] as const;

export const STOCK_LEVEL_OPTIONS = [
  { value: 'all', label: 'All Stock Levels' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: 'overstock', label: 'Overstock' },
] as const;

export const MOVEMENT_TYPE_OPTIONS = [
  { value: 'in', label: 'Stock In' },
  { value: 'out', label: 'Stock Out' },
  { value: 'adjustment', label: 'Adjustment' },
  { value: 'transfer', label: 'Transfer' },
] as const;

export const ADJUSTMENT_TYPE_OPTIONS = [
  { value: 'increase', label: 'Increase Stock' },
  { value: 'decrease', label: 'Decrease Stock' },
  { value: 'set', label: 'Set Stock Level' },
] as const;

// Common spare part categories
export const DEFAULT_CATEGORIES = [
  'Engine Parts',
  'Transmission',
  'Brakes',
  'Suspension',
  'Electrical',
  'Body Parts',
  'Interior',
  'Filters',
  'Fluids & Oils',
  'Tires & Wheels',
  'Exhaust System',
  'Cooling System',
  'Fuel System',
  'Lighting',
  'Safety Equipment',
] as const;

// Stock level indicators
export interface StockLevelInfo {
  level: 'normal' | 'low' | 'critical' | 'out' | 'overstock';
  color: string;
  message: string;
}
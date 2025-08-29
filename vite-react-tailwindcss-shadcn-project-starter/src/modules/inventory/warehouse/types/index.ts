// Warehouse Domain Types
export interface Warehouse {
  warehouseId: string;
  name: string;
  description?: string;
  city: string;
  state?: string;
  address: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  managerId?: string;
  capacity?: number;
  status: 'active' | 'inactive';
  location?: string;
  createdAt: string;
  updatedAt: string;
}

// Warehouse Form Data Types
export interface WarehouseFormData {
  name: string;
  description?: string;
  city: string;
  state?: string;
  address: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  managerId?: string;
  capacity?: number;
  status?: 'active' | 'inactive';
}

// API Response Types
export interface WarehousesResponse {
  warehouse: Warehouse[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface WarehouseResponse {
  warehouse: Warehouse;
  message?: string;
}

// Search and Filter Types
export interface WarehouseSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  state?: string;
  status?: 'active' | 'inactive' | 'all';
  sortBy?: 'name' | 'city' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Stock Transfer Types
export interface StockTransferItem {
  productId: string;
  productName: string;
  product_quantity: number;
  transfer_quantity: number;
  checkbox: boolean;
}

export interface StockTransferData {
  fromWarehouseId: string;
  toWarehouseId: string;
  products: StockTransferItem[];
  transferDate?: string;
  notes?: string;
}

// Warehouse Statistics Types
export interface WarehouseStats {
  totalWarehouses: number;
  activeWarehouses: number;
  inactiveWarehouses: number;
  totalCapacity: number;
  utilizationRate: number;
}

// Permission Types
export interface WarehousePermissions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface StockPermissions {
  stockCreate: boolean;
  stockRead: boolean;
  stockUpdate: boolean;
  stockDelete: boolean;
}

// UI State Types
export interface WarehouseUIState {
  currentPage: number;
  recordsPerPage: number;
  searchTerm: string;
  selectedWarehouse: Warehouse | null;
  isLoading: boolean;
  error: string | null;
}

// Export all types
export type {
  Warehouse,
  WarehouseFormData,
  WarehousesResponse,
  WarehouseResponse,
  WarehouseSearchParams,
  StockTransferItem,
  StockTransferData,
  WarehouseStats,
  WarehousePermissions,
  StockPermissions,
  WarehouseUIState,
};
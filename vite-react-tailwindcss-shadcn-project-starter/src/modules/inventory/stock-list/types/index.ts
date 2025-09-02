// Stock List type definitions
export interface StockItem {
  stockId?: string;
  sparePartId: string;
  partNumber: string;
  partName: string;
  description?: string;
  category: string;
  brand: string;
  currentStock: number;
  minimumStock: number;
  maximumStock?: number;
  reorderLevel: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
  location?: string;
  lastUpdated: string;
  lastMovement?: StockMovement;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock';
}

export interface StockMovement {
  movementId: string;
  sparePartId: string;
  movementType: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  referenceNumber?: string;
  location?: string;
  performedBy: string;
  performedAt: string;
  notes?: string;
}

export interface StockAlert {
  alertId: string;
  sparePartId: string;
  partNumber: string;
  partName: string;
  alertType: 'low_stock' | 'out_of_stock' | 'overstock' | 'reorder';
  currentStock: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  isRead: boolean;
}

// API response types
export interface StockListResponse {
  items: StockItem[];
  total: number;
  page: number;
  limit: number;
  summary: StockSummary;
}

export interface StockSummary {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  overstockItems: number;
  reorderItems: number;
}

// Filter and search types
export interface StockFilters {
  search?: string;
  category?: string;
  brand?: string;
  status?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock' | 'all';
  location?: string;
  sortBy?: 'partName' | 'currentStock' | 'totalValue' | 'lastUpdated';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Constants
export const STOCK_STATUS_OPTIONS = [
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: 'overstock', label: 'Overstock' },
] as const;

export const ALERT_SEVERITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
] as const;
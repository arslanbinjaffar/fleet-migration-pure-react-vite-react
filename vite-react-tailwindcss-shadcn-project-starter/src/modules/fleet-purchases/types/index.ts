// Fleet Purchases Module Types

// Base Interfaces
export interface FleetSupplier {
  fleetSupplierId: string;
  name: string;
  email?: string;
  phone: string;
  TRN: string;
  detail?: string;
  address?: string;
  contactPerson?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  warehouseId: string;
  name: string;
  location?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  categoryId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  purchaseOrderItemId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description?: string;
  specifications?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FleetPurchaseOrder {
  fleetPurchaseOrderId: string;
  fleetSupplierId: string;
  warehouseId: string;
  categoryId?: string;
  orderNumber: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  orderStatus: OrderStatus;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  notes?: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  FleetSupplier?: FleetSupplier;
  warehouse?: Warehouse;
  category?: Category;
  items: PurchaseOrderItem[];
}

export interface ReceiveShippingItem {
  receiveShippingItemId: string;
  purchaseOrderItemId: string;
  receivedQuantity: number;
  condition: ItemCondition;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReceiveShipping {
  receiveShippingId: string;
  fleetPurchaseOrderId: string;
  receivedDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  fleetPurchaseOrder?: FleetPurchaseOrder;
  receivedItems: ReceiveShippingItem[];
}

export interface FleetPurchase {
  fleetPurchaseId: string;
  fleetPurchaseOrderId: string;
  invoiceNumber: string;
  invoiceDate: string;
  paymentDueDate?: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  paymentReference?: string;
  paidAmount: number;
  remainingAmount: number;
  createdAt: string;
  updatedAt: string;
  // Relations
  fleetPurchaseOrder?: FleetPurchaseOrder;
}

export interface SupplierPayment {
  supplierPaymentId: string;
  fleetSupplierId: string;
  fleetPurchaseId?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  reference: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  FleetSupplier?: FleetSupplier;
  fleetPurchase?: FleetPurchase;
}

export interface SupplierLedger {
  ledgerId: string;
  fleetSupplierId: string;
  transactionType: TransactionType;
  transactionDate: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
  balance: number;
  referenceId?: string;
  createdAt: string;
  updatedAt: string;
}

// Form Data Interfaces
export interface PurchaseOrderFormData {
  fleetSupplierId: string;
  warehouseId: string;
  categoryId?: string;
  items: {
    productName: string;
    quantity: number;
    unitPrice: number;
    description?: string;
    specifications?: string;
  }[];
  orderDate: string;
  expectedDeliveryDate?: string;
  notes?: string;
  terms?: string;
  discountAmount?: number;
  taxAmount?: number;
}

export interface SupplierFormData {
  name: string;
  email?: string;
  phone: string;
  TRN: string;
  detail?: string;
  address?: string;
  contactPerson?: string;
  isActive: boolean;
}

export interface ReceiveShippingFormData {
  fleetPurchaseOrderId: string;
  receivedDate: string;
  receivedItems: {
    purchaseOrderItemId: string;
    receivedQuantity: number;
    condition: ItemCondition;
    notes?: string;
  }[];
  notes?: string;
}

export interface SupplierPaymentFormData {
  fleetSupplierId: string;
  fleetPurchaseId?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  reference: string;
  description?: string;
}

// API Response Interfaces
export interface PurchaseOrdersResponse {
  purchaseOrders: FleetPurchaseOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SuppliersResponse {
  suppliers: FleetSupplier[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PurchasesResponse {
  purchases: FleetPurchase[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SupplierLedgerResponse {
  ledgerEntries: SupplierLedger[];
  totalBalance: number;
  totalDebit: number;
  totalCredit: number;
}

export interface WarehousesResponse {
  warehouses: Warehouse[];
}

export interface CategoriesResponse {
  categories: Category[];
}

// Filter Interfaces
export interface PurchaseOrderFilters {
  status?: OrderStatus;
  supplierId?: string;
  warehouseId?: string;
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface SupplierFilters {
  isActive?: boolean;
  search?: string;
}

export interface PurchaseFilters {
  status?: PaymentStatus;
  supplierId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Request Interfaces
export interface CreatePurchaseOrderRequest {
  data: PurchaseOrderFormData;
}

export interface UpdatePurchaseOrderRequest {
  id: string;
  data: Partial<PurchaseOrderFormData>;
}

export interface CreateSupplierRequest {
  data: SupplierFormData;
}

export interface UpdateSupplierRequest {
  id: string;
  data: Partial<SupplierFormData>;
}

export interface CreateReceiveShippingRequest {
  data: ReceiveShippingFormData;
}

export interface CreateSupplierPaymentRequest {
  data: SupplierPaymentFormData;
}

// Statistics Interfaces
export interface PurchaseOrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  approvedOrders: number;
  completedOrders: number;
  totalValue: number;
  averageOrderValue: number;
}

export interface SupplierStatistics {
  totalSuppliers: number;
  activeSuppliers: number;
  totalPurchaseValue: number;
  averagePurchaseValue: number;
}

// Export Request Interfaces
export interface ExportPurchaseOrdersRequest {
  format: 'csv' | 'excel' | 'pdf';
  filters?: PurchaseOrderFilters;
}

export interface ExportSuppliersRequest {
  format: 'csv' | 'excel' | 'pdf';
  filters?: SupplierFilters;
}

export interface ExportPurchasesRequest {
  format: 'csv' | 'excel' | 'pdf';
  filters?: PurchaseFilters;
}

export interface ExportSupplierLedgerRequest {
  supplierId: string;
  format: 'csv' | 'excel' | 'pdf';
}

// Validation Interfaces
export interface ValidationResponse {
  exists: boolean;
  message?: string;
}

export interface ValidateTRNRequest {
  trn: string;
  excludeId?: string;
}

export interface ValidateSupplierNameRequest {
  name: string;
  excludeId?: string;
}

// Type Definitions
export type OrderStatus = 'pending' | 'approved' | 'completed' | 'rejected' | 'cancelled';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overdue';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'check' | 'credit_card' | 'other';
export type ItemCondition = 'good' | 'damaged' | 'defective';
export type TransactionType = 'purchase' | 'payment' | 'adjustment' | 'refund';
export type ViewMode = 'table' | 'grid' | 'list';
export type SortDirection = 'asc' | 'desc';

// Sort Options
export interface SortOption {
  field: string;
  direction: SortDirection;
}

// Pagination Interface
export interface PaginationState {
  currentPage: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// Multi-step Form Interfaces
export interface MultiStepFormState {
  currentStep: number;
  totalSteps: number;
  isValid: boolean;
  data: Record<string, any>;
}

// Bulk Operation Interfaces
export interface BulkDeleteRequest {
  ids: string[];
}

export interface BulkUpdateStatusRequest {
  ids: string[];
  status: OrderStatus | PaymentStatus;
}

export interface BulkOperationResponse {
  success: boolean;
  processed: number;
  failed: number;
  errors?: string[];
}
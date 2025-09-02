// Purchase Orders type definitions
export interface PurchaseOrder {
  purchaseOrderId?: string;
  purchaseOrderNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  status: 'draft' | 'pending' | 'approved' | 'sent' | 'received' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  totalAmount: number;
  taxAmount?: number;
  discountAmount?: number;
  finalAmount: number;
  paymentTerms?: string;
  deliveryAddress: string;
  items: PurchaseOrderItem[];
  notes?: string;
  attachments?: string[];
  approvedBy?: string;
  approvedAt?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface PurchaseOrderItem {
  itemId: string;
  sparePartId?: string;
  partNumber?: string;
  partName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string;
  expectedDeliveryDate?: string;
  notes?: string;
}

// Purchase order approval workflow
export interface PurchaseOrderApproval {
  approvalId: string;
  purchaseOrderId: string;
  approverUserId: string;
  approverName: string;
  approvalLevel: number;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  approvedAt?: string;
  createdAt: string;
}

// API response types
export interface PurchaseOrdersResponse {
  purchaseOrders: PurchaseOrder[];
  total: number;
  page: number;
  limit: number;
}

export interface PurchaseOrderDetailsResponse {
  purchaseOrder: PurchaseOrder;
  approvals: PurchaseOrderApproval[];
  relatedPurchases: any[];
}

// Form types
export interface PurchaseOrderFormData {
  purchaseOrderNumber: string;
  supplierId: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  paymentTerms?: string;
  deliveryAddress: string;
  items: PurchaseOrderItemFormData[];
  notes?: string;
}

export interface PurchaseOrderItemFormData {
  sparePartId?: string;
  partName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  expectedDeliveryDate?: string;
  notes?: string;
}

// Filter and search types
export interface PurchaseOrderFilters {
  search?: string;
  supplierId?: string;
  status?: 'draft' | 'pending' | 'approved' | 'sent' | 'received' | 'cancelled' | 'all';
  priority?: 'low' | 'medium' | 'high' | 'urgent' | 'all';
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'purchaseOrderNumber' | 'orderDate' | 'totalAmount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Constants
export const PURCHASE_ORDER_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'sent', label: 'Sent to Supplier' },
  { value: 'received', label: 'Received' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
] as const;

// Purchase order summary statistics
export interface PurchaseOrderSummary {
  totalOrders: number;
  totalAmount: number;
  pendingOrders: number;
  approvedOrders: number;
  sentOrders: number;
  receivedOrders: number;
}
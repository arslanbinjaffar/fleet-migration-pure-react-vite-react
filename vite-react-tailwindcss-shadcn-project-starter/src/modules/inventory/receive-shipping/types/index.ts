// Receive Shipping type definitions
export interface ShippingReceipt {
  receiptId?: string;
  receiptNumber: string;
  purchaseOrderId?: string;
  purchaseOrderNumber?: string;
  supplierId: string;
  supplierName: string;
  shipmentDate?: string;
  receivedDate: string;
  receivedBy: string;
  status: 'pending' | 'partial' | 'complete' | 'damaged' | 'rejected';
  trackingNumber?: string;
  carrier?: string;
  items: ShippingReceiptItem[];
  notes?: string;
  attachments?: string[];
  totalItems: number;
  receivedItems: number;
  damagedItems: number;
  rejectedItems: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ShippingReceiptItem {
  itemId: string;
  sparePartId?: string;
  partNumber?: string;
  partName: string;
  description?: string;
  orderedQuantity: number;
  receivedQuantity: number;
  damagedQuantity?: number;
  rejectedQuantity?: number;
  unit: string;
  condition: 'good' | 'damaged' | 'defective' | 'missing';
  location?: string;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
}

// Shipping inspection
export interface ShippingInspection {
  inspectionId: string;
  receiptId: string;
  inspectorUserId: string;
  inspectorName: string;
  inspectionDate: string;
  overallCondition: 'excellent' | 'good' | 'fair' | 'poor';
  packagingCondition: 'intact' | 'damaged' | 'severely_damaged';
  items: ShippingInspectionItem[];
  notes?: string;
  photos?: string[];
  approved: boolean;
  approvedAt?: string;
  createdAt: string;
}

export interface ShippingInspectionItem {
  itemId: string;
  receiptItemId: string;
  condition: 'good' | 'damaged' | 'defective' | 'missing';
  qualityRating: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  photos?: string[];
}

// API response types
export interface ShippingReceiptsResponse {
  receipts: ShippingReceipt[];
  total: number;
  page: number;
  limit: number;
}

export interface ShippingReceiptDetailsResponse {
  receipt: ShippingReceipt;
  inspection?: ShippingInspection;
  relatedPurchaseOrder?: any;
}

// Form types
export interface ShippingReceiptFormData {
  receiptNumber: string;
  purchaseOrderId?: string;
  supplierId: string;
  shipmentDate?: string;
  receivedDate: string;
  receivedBy: string;
  trackingNumber?: string;
  carrier?: string;
  items: ShippingReceiptItemFormData[];
  notes?: string;
}

export interface ShippingReceiptItemFormData {
  sparePartId?: string;
  partName: string;
  description?: string;
  orderedQuantity: number;
  receivedQuantity: number;
  damagedQuantity?: number;
  rejectedQuantity?: number;
  unit: string;
  condition: 'good' | 'damaged' | 'defective' | 'missing';
  location?: string;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
}

// Filter and search types
export interface ShippingReceiptFilters {
  search?: string;
  supplierId?: string;
  status?: 'pending' | 'partial' | 'complete' | 'damaged' | 'rejected' | 'all';
  receivedBy?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'receiptNumber' | 'receivedDate' | 'supplierName' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Constants
export const SHIPPING_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'partial', label: 'Partially Received' },
  { value: 'complete', label: 'Complete' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'rejected', label: 'Rejected' },
] as const;

export const ITEM_CONDITION_OPTIONS = [
  { value: 'good', label: 'Good' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'defective', label: 'Defective' },
  { value: 'missing', label: 'Missing' },
] as const;

export const PACKAGING_CONDITION_OPTIONS = [
  { value: 'intact', label: 'Intact' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'severely_damaged', label: 'Severely Damaged' },
] as const;

export const OVERALL_CONDITION_OPTIONS = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
] as const;

// Shipping summary statistics
export interface ShippingSummary {
  totalReceipts: number;
  pendingReceipts: number;
  completeReceipts: number;
  damagedReceipts: number;
  totalItemsReceived: number;
  damagedItemsReceived: number;
}
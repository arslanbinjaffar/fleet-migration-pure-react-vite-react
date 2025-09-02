// Purchases type definitions
export interface Purchase {
  purchaseId?: string;
  purchaseNumber: string;
  supplierId: string;
  supplierName: string;
  purchaseOrderId?: string;
  purchaseOrderNumber?: string;
  purchaseDate: string;
  deliveryDate?: string;
  receivedDate?: string;
  status: 'pending' | 'received' | 'partial' | 'cancelled';
  totalAmount: number;
  paidAmount?: number;
  remainingAmount?: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'overdue';
  paymentTerms?: string;
  dueDate?: string;
  items: PurchaseItem[];
  notes?: string;
  attachments?: string[];
  receivedBy?: string;
  approvedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface PurchaseItem {
  itemId: string;
  sparePartId?: string;
  partNumber?: string;
  partName: string;
  description?: string;
  quantity: number;
  receivedQuantity?: number;
  unitPrice: number;
  totalPrice: number;
  unit: string;
  notes?: string;
}

// Purchase receipt/receiving
export interface PurchaseReceipt {
  receiptId?: string;
  purchaseId: string;
  receiptNumber: string;
  receivedDate: string;
  receivedBy: string;
  items: PurchaseReceiptItem[];
  notes?: string;
  attachments?: string[];
  status: 'draft' | 'confirmed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseReceiptItem {
  itemId: string;
  purchaseItemId: string;
  receivedQuantity: number;
  condition: 'good' | 'damaged' | 'defective';
  notes?: string;
}

// Purchase payment
export interface PurchasePayment {
  paymentId?: string;
  purchaseId: string;
  amount: number;
  paymentMethod: 'cash' | 'check' | 'bank_transfer' | 'credit_card';
  referenceNumber?: string;
  paymentDate: string;
  notes?: string;
  createdBy?: string;
  createdAt?: string;
}

// API response types
export interface PurchasesResponse {
  purchases: Purchase[];
  total: number;
  page: number;
  limit: number;
}

export interface PurchaseDetailsResponse {
  purchase: Purchase;
  receipts: PurchaseReceipt[];
  payments: PurchasePayment[];
}

// Form types
export interface PurchaseFormData {
  purchaseNumber: string;
  supplierId: string;
  purchaseOrderId?: string;
  purchaseDate: string;
  deliveryDate?: string;
  paymentTerms?: string;
  dueDate?: string;
  items: PurchaseItemFormData[];
  notes?: string;
}

export interface PurchaseItemFormData {
  sparePartId?: string;
  partName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  notes?: string;
}

export interface PurchaseReceiptFormData {
  purchaseId: string;
  receiptNumber: string;
  receivedDate: string;
  receivedBy: string;
  items: PurchaseReceiptItemFormData[];
  notes?: string;
}

export interface PurchaseReceiptItemFormData {
  purchaseItemId: string;
  receivedQuantity: number;
  condition: 'good' | 'damaged' | 'defective';
  notes?: string;
}

// Filter and search types
export interface PurchaseFilters {
  search?: string;
  supplierId?: string;
  status?: 'pending' | 'received' | 'partial' | 'cancelled' | 'all';
  paymentStatus?: 'unpaid' | 'partial' | 'paid' | 'overdue' | 'all';
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'purchaseNumber' | 'purchaseDate' | 'totalAmount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Constants
export const PURCHASE_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'received', label: 'Received' },
  { value: 'partial', label: 'Partially Received' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

export const PAYMENT_STATUS_OPTIONS = [
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'partial', label: 'Partially Paid' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
] as const;

export const ITEM_CONDITION_OPTIONS = [
  { value: 'good', label: 'Good' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'defective', label: 'Defective' },
] as const;

export const PAYMENT_METHOD_OPTIONS = [
  { value: 'cash', label: 'Cash' },
  { value: 'check', label: 'Check' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'credit_card', label: 'Credit Card' },
] as const;

// Purchase summary statistics
export interface PurchaseSummary {
  totalPurchases: number;
  totalAmount: number;
  pendingPurchases: number;
  receivedPurchases: number;
  overduePayments: number;
  unpaidAmount: number;
}
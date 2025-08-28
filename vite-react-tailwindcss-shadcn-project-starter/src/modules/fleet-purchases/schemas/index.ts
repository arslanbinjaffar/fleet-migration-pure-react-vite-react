import { z } from 'zod';

// Base schemas
export const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(1, 'Phone number is required').regex(/^[+]?[0-9\s-()]+$/, 'Invalid phone number format'),
  TRN: z.string().min(1, 'TRN is required').max(20, 'TRN must be less than 20 characters'),
  detail: z.string().max(500, 'Details must be less than 500 characters').optional(),
  address: z.string().max(200, 'Address must be less than 200 characters').optional(),
  contactPerson: z.string().max(100, 'Contact person name must be less than 100 characters').optional(),
  isActive: z.boolean().default(true),
});

export const purchaseOrderItemSchema = z.object({
  productName: z.string().min(1, 'Product name is required').max(100, 'Product name must be less than 100 characters'),
  quantity: z.number().min(1, 'Quantity must be at least 1').max(10000, 'Quantity cannot exceed 10,000'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative').max(1000000, 'Unit price cannot exceed 1,000,000'),
  description: z.string().max(200, 'Description must be less than 200 characters').optional(),
  specifications: z.string().max(300, 'Specifications must be less than 300 characters').optional(),
});

export const purchaseOrderSchema = z.object({
  fleetSupplierId: z.string().min(1, 'Supplier is required'),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  categoryId: z.string().optional(),
  items: z.array(purchaseOrderItemSchema).min(1, 'At least one item is required').max(50, 'Cannot exceed 50 items'),
  orderDate: z.string().min(1, 'Order date is required'),
  expectedDeliveryDate: z.string().optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  terms: z.string().max(1000, 'Terms must be less than 1000 characters').optional(),
  discountAmount: z.number().min(0, 'Discount cannot be negative').optional().default(0),
  taxAmount: z.number().min(0, 'Tax cannot be negative').optional().default(0),
}).refine((data) => {
  // Validate that expected delivery date is after order date
  if (data.expectedDeliveryDate && data.orderDate) {
    return new Date(data.expectedDeliveryDate) >= new Date(data.orderDate);
  }
  return true;
}, {
  message: 'Expected delivery date must be on or after order date',
  path: ['expectedDeliveryDate'],
});

export const receiveShippingItemSchema = z.object({
  purchaseOrderItemId: z.string().min(1, 'Purchase order item is required'),
  receivedQuantity: z.number().min(0, 'Received quantity cannot be negative'),
  condition: z.enum(['good', 'damaged', 'defective'], {
    errorMap: () => ({ message: 'Please select a valid condition' }),
  }),
  notes: z.string().max(200, 'Notes must be less than 200 characters').optional(),
});

export const receiveShippingSchema = z.object({
  fleetPurchaseOrderId: z.string().min(1, 'Purchase order is required'),
  receivedDate: z.string().min(1, 'Received date is required'),
  receivedItems: z.array(receiveShippingItemSchema).min(1, 'At least one item must be received'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
}).refine((data) => {
  // Validate that received date is not in the future
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return new Date(data.receivedDate) <= today;
}, {
  message: 'Received date cannot be in the future',
  path: ['receivedDate'],
});

export const supplierPaymentSchema = z.object({
  fleetSupplierId: z.string().min(1, 'Supplier is required'),
  fleetPurchaseId: z.string().optional(),
  amount: z.number().min(0.01, 'Amount must be greater than 0').max(10000000, 'Amount cannot exceed 10,000,000'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'cheque', 'credit_card'], {
    errorMap: () => ({ message: 'Please select a valid payment method' }),
  }),
  reference: z.string().min(1, 'Reference is required').max(50, 'Reference must be less than 50 characters'),
  description: z.string().max(200, 'Description must be less than 200 characters').optional(),
}).refine((data) => {
  // Validate that payment date is not in the future
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return new Date(data.paymentDate) <= today;
}, {
  message: 'Payment date cannot be in the future',
  path: ['paymentDate'],
});

// Filter schemas
export const purchaseOrderFiltersSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'completed', 'cancelled']).optional(),
  supplierId: z.string().optional(),
  warehouseId: z.string().optional(),
  categoryId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
}).refine((data) => {
  // Validate date range
  if (data.dateFrom && data.dateTo) {
    return new Date(data.dateFrom) <= new Date(data.dateTo);
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['dateTo'],
}).refine((data) => {
  // Validate amount range
  if (data.minAmount !== undefined && data.maxAmount !== undefined) {
    return data.minAmount <= data.maxAmount;
  }
  return true;
}, {
  message: 'Maximum amount must be greater than minimum amount',
  path: ['maxAmount'],
});

export const supplierFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
});

// Search and pagination schemas
export const searchSchema = z.object({
  query: z.string().min(2, 'Search query must be at least 2 characters').max(100, 'Search query must be less than 100 characters'),
});

export const paginationSchema = z.object({
  page: z.number().min(1, 'Page must be at least 1').default(1),
  limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(25),
});

// Export schemas
export const exportSchema = z.object({
  format: z.enum(['csv', 'excel', 'pdf'], {
    errorMap: () => ({ message: 'Please select a valid export format' }),
  }),
  filters: z.record(z.any()).optional(),
});

// Update schemas (for editing existing records)
export const updateSupplierSchema = supplierSchema.partial().extend({
  fleetSupplierId: z.string().min(1, 'Supplier ID is required'),
});

export const updatePurchaseOrderSchema = purchaseOrderSchema.partial().extend({
  fleetPurchaseOrderId: z.string().min(1, 'Purchase order ID is required'),
});

// Status update schemas
export const updateOrderStatusSchema = z.object({
  fleetPurchaseOrderId: z.string().min(1, 'Purchase order ID is required'),
  orderStatus: z.enum(['pending', 'approved', 'rejected', 'completed', 'cancelled'], {
    errorMap: () => ({ message: 'Please select a valid status' }),
  }),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

export const updatePaymentStatusSchema = z.object({
  fleetPurchaseId: z.string().min(1, 'Purchase ID is required'),
  paymentStatus: z.enum(['pending', 'partial', 'paid', 'overdue'], {
    errorMap: () => ({ message: 'Please select a valid payment status' }),
  }),
});

// Bulk operation schemas
export const bulkDeleteSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'At least one item must be selected').max(100, 'Cannot delete more than 100 items at once'),
});

export const bulkUpdateStatusSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'At least one item must be selected').max(100, 'Cannot update more than 100 items at once'),
  status: z.string().min(1, 'Status is required'),
});

// Form step schemas (for multi-step forms)
export const purchaseOrderStep1Schema = z.object({
  fleetSupplierId: z.string().min(1, 'Supplier is required'),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  categoryId: z.string().optional(),
  orderDate: z.string().min(1, 'Order date is required'),
  expectedDeliveryDate: z.string().optional(),
});

export const purchaseOrderStep2Schema = z.object({
  items: z.array(purchaseOrderItemSchema).min(1, 'At least one item is required'),
});

export const purchaseOrderStep3Schema = z.object({
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  terms: z.string().max(1000, 'Terms must be less than 1000 characters').optional(),
  discountAmount: z.number().min(0, 'Discount cannot be negative').optional().default(0),
  taxAmount: z.number().min(0, 'Tax cannot be negative').optional().default(0),
});

// Type exports
export type SupplierFormData = z.infer<typeof supplierSchema>;
export type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;
export type PurchaseOrderItemFormData = z.infer<typeof purchaseOrderItemSchema>;
export type ReceiveShippingFormData = z.infer<typeof receiveShippingSchema>;
export type ReceiveShippingItemFormData = z.infer<typeof receiveShippingItemSchema>;
export type SupplierPaymentFormData = z.infer<typeof supplierPaymentSchema>;
export type PurchaseOrderFilters = z.infer<typeof purchaseOrderFiltersSchema>;
export type SupplierFilters = z.infer<typeof supplierFiltersSchema>;
export type SearchQuery = z.infer<typeof searchSchema>;
export type PaginationParams = z.infer<typeof paginationSchema>;
export type ExportParams = z.infer<typeof exportSchema>;
export type UpdateSupplierFormData = z.infer<typeof updateSupplierSchema>;
export type UpdatePurchaseOrderFormData = z.infer<typeof updatePurchaseOrderSchema>;
export type UpdateOrderStatusData = z.infer<typeof updateOrderStatusSchema>;
export type UpdatePaymentStatusData = z.infer<typeof updatePaymentStatusSchema>;
export type BulkDeleteData = z.infer<typeof bulkDeleteSchema>;
export type BulkUpdateStatusData = z.infer<typeof bulkUpdateStatusSchema>;
export type PurchaseOrderStep1Data = z.infer<typeof purchaseOrderStep1Schema>;
export type PurchaseOrderStep2Data = z.infer<typeof purchaseOrderStep2Schema>;
export type PurchaseOrderStep3Data = z.infer<typeof purchaseOrderStep3Schema>;

// Form sections for step-by-step validation
export const PURCHASE_ORDER_FORM_SECTIONS = {
  BASIC_INFO: {
    title: 'Basic Information',
    fields: ['fleetSupplierId', 'warehouseId', 'categoryId', 'orderDate', 'expectedDeliveryDate'],
    schema: purchaseOrderStep1Schema,
  },
  ITEMS: {
    title: 'Order Items',
    fields: ['items'],
    schema: purchaseOrderStep2Schema,
  },
  ADDITIONAL_INFO: {
    title: 'Additional Information',
    fields: ['notes', 'terms', 'discountAmount', 'taxAmount'],
    schema: purchaseOrderStep3Schema,
  },
} as const;

export const SUPPLIER_FORM_SECTIONS = {
  BASIC_INFO: {
    title: 'Basic Information',
    fields: ['name', 'email', 'phone', 'TRN'],
  },
  ADDITIONAL_INFO: {
    title: 'Additional Information',
    fields: ['detail', 'address', 'contactPerson', 'isActive'],
  },
} as const;
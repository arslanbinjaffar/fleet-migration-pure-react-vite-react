import { z } from 'zod';

// Dimensions schema
const dimensionsSchema = z.object({
  length: z.number().min(0, 'Length cannot be negative').optional().nullable(),
  width: z.number().min(0, 'Width cannot be negative').optional().nullable(),
  height: z.number().min(0, 'Height cannot be negative').optional().nullable(),
}).optional().nullable();

// Spare part validation schema
export const sparePartSchema = z.object({
  partNumber: z.string().min(1, 'Part number is required').max(50, 'Part number must be less than 50 characters'),
  partName: z.string().min(1, 'Part name is required').max(100, 'Part name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional().nullable(),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional().nullable(),
  brand: z.string().min(1, 'Brand is required').max(50, 'Brand must be less than 50 characters'),
  model: z.string().max(50, 'Model must be less than 50 characters').optional().nullable(),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
  costPrice: z.number().min(0, 'Cost price cannot be negative').optional().nullable(),
  quantityInStock: z.number().min(0, 'Quantity in stock cannot be negative'),
  minimumStock: z.number().min(0, 'Minimum stock cannot be negative'),
  maximumStock: z.number().min(0, 'Maximum stock cannot be negative').optional().nullable(),
  reorderLevel: z.number().min(0, 'Reorder level cannot be negative'),
  unit: z.string().min(1, 'Unit is required'),
  location: z.string().max(100, 'Location must be less than 100 characters').optional().nullable(),
  barcode: z.string().max(50, 'Barcode must be less than 50 characters').optional().nullable(),
  sku: z.string().max(50, 'SKU must be less than 50 characters').optional().nullable(),
  weight: z.number().min(0, 'Weight cannot be negative').optional().nullable(),
  dimensions: dimensionsSchema,
  compatibleVehicles: z.array(z.string()).optional().nullable(),
  supplierId: z.string().uuid('Invalid supplier ID').optional().nullable(),
  supplierPartNumber: z.string().max(50, 'Supplier part number must be less than 50 characters').optional().nullable(),
  warrantyPeriod: z.number().min(0, 'Warranty period cannot be negative').optional().nullable(),
  status: z.enum(['active', 'inactive', 'discontinued'], {
    required_error: 'Status is required',
    invalid_type_error: 'Invalid status value',
  }),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional().nullable(),
}).refine((data) => {
  // Validate that maximum stock is greater than minimum stock if provided
  if (data.maximumStock !== null && data.maximumStock !== undefined) {
    return data.maximumStock >= data.minimumStock;
  }
  return true;
}, {
  message: 'Maximum stock must be greater than or equal to minimum stock',
  path: ['maximumStock'],
}).refine((data) => {
  // Validate that reorder level is between minimum and maximum stock
  const maxStock = data.maximumStock || Infinity;
  return data.reorderLevel >= data.minimumStock && data.reorderLevel <= maxStock;
}, {
  message: 'Reorder level must be between minimum and maximum stock levels',
  path: ['reorderLevel'],
}).refine((data) => {
  // Validate that cost price is less than or equal to unit price if provided
  if (data.costPrice !== null && data.costPrice !== undefined) {
    return data.costPrice <= data.unitPrice;
  }
  return true;
}, {
  message: 'Cost price should not exceed unit price',
  path: ['costPrice'],
});

// Stock adjustment validation schema
export const stockAdjustmentSchema = z.object({
  sparePartId: z.string().uuid('Invalid spare part ID').min(1, 'Spare part is required'),
  adjustmentType: z.enum(['increase', 'decrease', 'set'], {
    required_error: 'Adjustment type is required',
    invalid_type_error: 'Invalid adjustment type',
  }),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  reason: z.string().min(1, 'Reason is required').max(200, 'Reason must be less than 200 characters'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional().nullable(),
});

// Spare part category validation schema
export const sparePartCategorySchema = z.object({
  categoryName: z.string().min(1, 'Category name is required').max(50, 'Category name must be less than 50 characters'),
  description: z.string().max(200, 'Description must be less than 200 characters').optional().nullable(),
  parentCategoryId: z.string().uuid('Invalid parent category ID').optional().nullable(),
});

// Spare part filters validation schema
export const sparePartFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  status: z.enum(['active', 'inactive', 'discontinued', 'all']).optional(),
  stockLevel: z.enum(['all', 'low_stock', 'out_of_stock', 'overstock']).optional(),
  supplierId: z.string().uuid().optional(),
  sortBy: z.enum(['partName', 'partNumber', 'quantityInStock', 'unitPrice', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

// Bulk import validation schema
export const bulkImportSchema = z.object({
  file: z.instanceof(File, { message: 'Please select a file' }),
  skipFirstRow: z.boolean().default(true),
  updateExisting: z.boolean().default(false),
});

// Stock movement validation schema
export const stockMovementSchema = z.object({
  sparePartId: z.string().uuid('Invalid spare part ID'),
  movementType: z.enum(['in', 'out', 'adjustment', 'transfer']),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  reason: z.string().min(1, 'Reason is required').max(200, 'Reason must be less than 200 characters'),
  referenceNumber: z.string().max(50, 'Reference number must be less than 50 characters').optional().nullable(),
  location: z.string().max(100, 'Location must be less than 100 characters').optional().nullable(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional().nullable(),
});

// Type inference from schemas
export type SparePartFormData = z.infer<typeof sparePartSchema>;
export type StockAdjustmentFormData = z.infer<typeof stockAdjustmentSchema>;
export type SparePartCategoryFormData = z.infer<typeof sparePartCategorySchema>;
export type SparePartFiltersData = z.infer<typeof sparePartFiltersSchema>;
export type BulkImportFormData = z.infer<typeof bulkImportSchema>;
export type StockMovementFormData = z.infer<typeof stockMovementSchema>;
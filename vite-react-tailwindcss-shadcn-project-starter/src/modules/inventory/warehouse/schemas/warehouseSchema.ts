import { z } from 'zod';
import {
  WAREHOUSE_VALIDATION,
  WAREHOUSE_STATUS,
  WAREHOUSE_ERROR_MESSAGES,
  STOCK_TRANSFER,
} from '../constants';

// Base Warehouse Schema
export const warehouseSchema = z.object({
  name: z
    .string()
    .min(WAREHOUSE_VALIDATION.NAME_MIN_LENGTH, WAREHOUSE_ERROR_MESSAGES.REQUIRED_NAME)
    .max(WAREHOUSE_VALIDATION.NAME_MAX_LENGTH, `Name must be less than ${WAREHOUSE_VALIDATION.NAME_MAX_LENGTH} characters`)
    .trim(),
  
  description: z
    .string()
    .max(WAREHOUSE_VALIDATION.DESCRIPTION_MAX_LENGTH, `Description must be less than ${WAREHOUSE_VALIDATION.DESCRIPTION_MAX_LENGTH} characters`)
    .optional()
    .or(z.literal('')),
  
  city: z
    .string()
    .min(WAREHOUSE_VALIDATION.CITY_MIN_LENGTH, WAREHOUSE_ERROR_MESSAGES.REQUIRED_CITY)
    .max(WAREHOUSE_VALIDATION.CITY_MAX_LENGTH, `City must be less than ${WAREHOUSE_VALIDATION.CITY_MAX_LENGTH} characters`)
    .trim(),
  
  state: z
    .string()
    .max(50, 'State must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  
  address: z
    .string()
    .min(WAREHOUSE_VALIDATION.ADDRESS_MIN_LENGTH, WAREHOUSE_ERROR_MESSAGES.REQUIRED_ADDRESS)
    .max(WAREHOUSE_VALIDATION.ADDRESS_MAX_LENGTH, `Address must be less than ${WAREHOUSE_VALIDATION.ADDRESS_MAX_LENGTH} characters`)
    .trim(),
  
  zipCode: z
    .string()
    .regex(WAREHOUSE_VALIDATION.ZIP_CODE_PATTERN, 'Please enter a valid ZIP code')
    .optional()
    .or(z.literal('')),
  
  country: z
    .string()
    .max(50, 'Country must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  
  phone: z
    .string()
    .regex(WAREHOUSE_VALIDATION.PHONE_PATTERN, WAREHOUSE_ERROR_MESSAGES.INVALID_PHONE)
    .optional()
    .or(z.literal('')),
  
  email: z
    .string()
    .email(WAREHOUSE_ERROR_MESSAGES.INVALID_EMAIL)
    .optional()
    .or(z.literal('')),
  
  managerId: z
    .string()
    .optional()
    .or(z.literal('')),
  
  capacity: z
    .number()
    .min(WAREHOUSE_VALIDATION.MIN_CAPACITY, WAREHOUSE_ERROR_MESSAGES.INVALID_CAPACITY)
    .max(WAREHOUSE_VALIDATION.MAX_CAPACITY, `Capacity cannot exceed ${WAREHOUSE_VALIDATION.MAX_CAPACITY}`)
    .optional(),
  
  status: z
    .enum([WAREHOUSE_STATUS.ACTIVE, WAREHOUSE_STATUS.INACTIVE])
    .optional()
    .default(WAREHOUSE_STATUS.ACTIVE),
});

// Create Warehouse Schema (for new warehouse creation)
export const createWarehouseSchema = warehouseSchema;

// Update Warehouse Schema (for editing existing warehouse)
export const updateWarehouseSchema = warehouseSchema.partial().extend({
  warehouseId: z.string().min(1, 'Warehouse ID is required'),
});

// Warehouse Search Schema
export const warehouseSearchSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(13),
  search: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  status: z.enum([WAREHOUSE_STATUS.ACTIVE, WAREHOUSE_STATUS.INACTIVE, 'all']).optional(),
  sortBy: z.enum(['name', 'city', 'createdAt', 'capacity']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

// Stock Transfer Item Schema
export const stockTransferItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  productName: z.string().min(1, 'Product name is required'),
  product_quantity: z.number().min(0, 'Product quantity must be non-negative'),
  transfer_quantity: z
    .number()
    .min(STOCK_TRANSFER.MIN_TRANSFER_QUANTITY, `Minimum transfer quantity is ${STOCK_TRANSFER.MIN_TRANSFER_QUANTITY}`)
    .max(STOCK_TRANSFER.MAX_TRANSFER_QUANTITY, `Maximum transfer quantity is ${STOCK_TRANSFER.MAX_TRANSFER_QUANTITY}`),
  checkbox: z.boolean(),
});

// Stock Transfer Schema
export const stockTransferSchema = z.object({
  fromWarehouseId: z.string().min(1, 'Source warehouse is required'),
  toWarehouseId: z.string().min(1, 'Destination warehouse is required'),
  products: z.array(stockTransferItemSchema).min(1, 'At least one product must be selected for transfer'),
  transferDate: z.string().optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
}).refine(
  (data) => data.fromWarehouseId !== data.toWarehouseId,
  {
    message: 'Source and destination warehouses must be different',
    path: ['toWarehouseId'],
  }
).refine(
  (data) => data.products.some(product => product.checkbox && product.transfer_quantity > 0),
  {
    message: 'At least one product must be selected with a valid transfer quantity',
    path: ['products'],
  }
).refine(
  (data) => data.products.every(product => 
    !product.checkbox || product.transfer_quantity <= product.product_quantity
  ),
  {
    message: 'Transfer quantity cannot exceed available quantity',
    path: ['products'],
  }
);

// Warehouse Filter Schema
export const warehouseFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum([WAREHOUSE_STATUS.ACTIVE, WAREHOUSE_STATUS.INACTIVE, 'all']).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

// Type exports
export type WarehouseFormData = z.infer<typeof warehouseSchema>;
export type CreateWarehouseData = z.infer<typeof createWarehouseSchema>;
export type UpdateWarehouseData = z.infer<typeof updateWarehouseSchema>;
export type WarehouseSearchParams = z.infer<typeof warehouseSearchSchema>;
export type StockTransferItemData = z.infer<typeof stockTransferItemSchema>;
export type StockTransferData = z.infer<typeof stockTransferSchema>;
export type WarehouseFilterData = z.infer<typeof warehouseFilterSchema>;
import { z } from 'zod';

// Supplier validation schema
export const supplierSchema = z.object({
  supplierName: z.string().min(1, 'Supplier name is required').max(100, 'Supplier name must be less than 100 characters'),
  contactPerson: z.string().min(1, 'Contact person is required').max(100, 'Contact person must be less than 100 characters'),
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
  phone: z.string().min(1, 'Phone number is required').max(20, 'Phone number must be less than 20 characters'),
  address: z.string().min(1, 'Address is required').max(255, 'Address must be less than 255 characters'),
  city: z.string().min(1, 'City is required').max(50, 'City must be less than 50 characters'),
  country: z.string().min(1, 'Country is required').max(50, 'Country must be less than 50 characters'),
  postalCode: z.string().max(20, 'Postal code must be less than 20 characters').optional().nullable(),
  taxId: z.string().max(50, 'Tax ID must be less than 50 characters').optional().nullable(),
  paymentTerms: z.string().max(100, 'Payment terms must be less than 100 characters').optional().nullable(),
  creditLimit: z.number().min(0, 'Credit limit cannot be negative').optional().nullable(),
  status: z.enum(['active', 'inactive', 'suspended'], {
    required_error: 'Status is required',
    invalid_type_error: 'Invalid status value',
  }),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional().nullable(),
});

// Payment validation schema
export const paymentSchema = z.object({
  supplierId: z.string().uuid('Invalid supplier ID').min(1, 'Supplier is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  paymentMethod: z.enum(['cash', 'check', 'bank_transfer', 'credit_card'], {
    required_error: 'Payment method is required',
    invalid_type_error: 'Invalid payment method',
  }),
  referenceNumber: z.string().max(50, 'Reference number must be less than 50 characters').optional().nullable(),
  paymentDate: z.string().min(1, 'Payment date is required'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional().nullable(),
});

// Supplier filters validation schema
export const supplierFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended', 'all']).optional(),
  country: z.string().optional(),
  sortBy: z.enum(['supplierName', 'createdAt', 'currentBalance']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

// Type inference from schemas
export type SupplierFormData = z.infer<typeof supplierSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
export type SupplierFiltersData = z.infer<typeof supplierFiltersSchema>;
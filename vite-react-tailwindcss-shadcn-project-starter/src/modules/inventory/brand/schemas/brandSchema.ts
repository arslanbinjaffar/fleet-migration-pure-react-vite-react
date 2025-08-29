import { z } from 'zod';
import {
  BRAND_VALIDATION,
  BRAND_ERROR_MESSAGES,
} from '../constants';

// Base Brand Schema
export const brandSchema = z.object({
  name: z
    .string()
    .min(BRAND_VALIDATION.NAME_MIN_LENGTH, BRAND_ERROR_MESSAGES.NAME_TOO_SHORT)
    .max(BRAND_VALIDATION.NAME_MAX_LENGTH, BRAND_ERROR_MESSAGES.NAME_TOO_LONG)
    .trim(),
  
  description: z
    .string()
    .max(BRAND_VALIDATION.DESCRIPTION_MAX_LENGTH, BRAND_ERROR_MESSAGES.DESCRIPTION_TOO_LONG)
    .optional()
    .or(z.literal('')),
  
  tags: z
    .array(z.string().max(BRAND_VALIDATION.TAG_MAX_LENGTH, 'Tag is too long'))
    .max(BRAND_VALIDATION.MAX_TAGS, `Maximum ${BRAND_VALIDATION.MAX_TAGS} tags allowed`)
    .optional()
    .default([]),
});

// Create Brand Schema (for new brand creation)
export const createBrandSchema = brandSchema;

// Update Brand Schema (for editing existing brand)
export const updateBrandSchema = brandSchema.partial().extend({
  brandId: z.string().min(1, 'Brand ID is required'),
});

// Brand Search Schema
export const brandSearchSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(13),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

// Brand Filter Schema
export const brandFilterSchema = z.object({
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// Brand ID Schema (for single brand operations)
export const brandIdSchema = z.object({
  brandId: z.string().min(1, 'Brand ID is required'),
});

// Bulk Operations Schema
export const bulkBrandSchema = z.object({
  brandIds: z.array(z.string().min(1)).min(1, 'At least one brand must be selected'),
  action: z.enum(['delete', 'export']),
});

// Type exports
export type BrandFormData = z.infer<typeof brandSchema>;
export type CreateBrandData = z.infer<typeof createBrandSchema>;
export type UpdateBrandData = z.infer<typeof updateBrandSchema>;
export type BrandSearchParams = z.infer<typeof brandSearchSchema>;
export type BrandFilterData = z.infer<typeof brandFilterSchema>;
export type BrandIdData = z.infer<typeof brandIdSchema>;
export type BulkBrandData = z.infer<typeof bulkBrandSchema>;

// Export all schemas
export {
  brandSchema,
  createBrandSchema,
  updateBrandSchema,
  brandSearchSchema,
  brandFilterSchema,
  brandIdSchema,
  bulkBrandSchema,
};
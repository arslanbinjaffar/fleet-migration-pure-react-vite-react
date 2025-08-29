import { z } from 'zod';
import {
  CATEGORY_VALIDATION,
  CATEGORY_ERROR_MESSAGES,
} from '../constants';

// Base Category Schema
export const categorySchema = z.object({
  name: z
    .string()
    .min(CATEGORY_VALIDATION.NAME_MIN_LENGTH, CATEGORY_ERROR_MESSAGES.NAME_TOO_SHORT)
    .max(CATEGORY_VALIDATION.NAME_MAX_LENGTH, CATEGORY_ERROR_MESSAGES.NAME_TOO_LONG)
    .trim(),
  
  description: z
    .string()
    .max(CATEGORY_VALIDATION.DESCRIPTION_MAX_LENGTH, CATEGORY_ERROR_MESSAGES.DESCRIPTION_TOO_LONG)
    .optional()
    .or(z.literal('')),
  
  tags: z
    .array(z.string().max(CATEGORY_VALIDATION.TAG_MAX_LENGTH, 'Tag is too long'))
    .max(CATEGORY_VALIDATION.MAX_TAGS, `Maximum ${CATEGORY_VALIDATION.MAX_TAGS} tags allowed`)
    .optional()
    .default([]),
});

// Create Category Schema (for new category creation)
export const createCategorySchema = categorySchema;

// Update Category Schema (for editing existing category)
export const updateCategorySchema = categorySchema.partial().extend({
  categoryId: z.string().min(1, 'Category ID is required'),
});

// Category Search Schema
export const categorySearchSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(13),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

// Category Filter Schema
export const categoryFilterSchema = z.object({
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// Category ID Schema (for single category operations)
export const categoryIdSchema = z.object({
  categoryId: z.string().min(1, 'Category ID is required'),
});

// Bulk Operations Schema
export const bulkCategorySchema = z.object({
  categoryIds: z.array(z.string().min(1)).min(1, 'At least one category must be selected'),
  action: z.enum(['delete', 'export']),
});

// Category Import Schema (if needed for bulk import)
export const categoryImportSchema = z.object({
  categories: z.array(categorySchema).min(1, 'At least one category is required'),
});

// Type exports
export type CategoryFormData = z.infer<typeof categorySchema>;
export type CreateCategoryData = z.infer<typeof createCategorySchema>;
export type UpdateCategoryData = z.infer<typeof updateCategorySchema>;
export type CategorySearchParams = z.infer<typeof categorySearchSchema>;
export type CategoryFilterData = z.infer<typeof categoryFilterSchema>;
export type CategoryIdData = z.infer<typeof categoryIdSchema>;
export type BulkCategoryData = z.infer<typeof bulkCategorySchema>;
export type CategoryImportData = z.infer<typeof categoryImportSchema>;

// Export all schemas
export {
  categorySchema,
  createCategorySchema,
  updateCategorySchema,
  categorySearchSchema,
  categoryFilterSchema,
  categoryIdSchema,
  bulkCategorySchema,
  categoryImportSchema,
};
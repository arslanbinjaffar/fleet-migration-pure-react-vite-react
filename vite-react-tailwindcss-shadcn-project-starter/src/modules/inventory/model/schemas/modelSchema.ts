import { z } from 'zod';
import {
  MODEL_VALIDATION,
  MODEL_ERROR_MESSAGES,
} from '../constants';

// Base Model Schema
export const modelSchema = z.object({
  name: z
    .string()
    .min(MODEL_VALIDATION.NAME_MIN_LENGTH, MODEL_ERROR_MESSAGES.NAME_TOO_SHORT)
    .max(MODEL_VALIDATION.NAME_MAX_LENGTH, MODEL_ERROR_MESSAGES.NAME_TOO_LONG)
    .trim(),
  
  description: z
    .string()
    .max(MODEL_VALIDATION.DESCRIPTION_MAX_LENGTH, MODEL_ERROR_MESSAGES.DESCRIPTION_TOO_LONG)
    .optional()
    .or(z.literal('')),
  
  tags: z
    .array(z.string().max(MODEL_VALIDATION.TAG_MAX_LENGTH, 'Tag is too long'))
    .max(MODEL_VALIDATION.MAX_TAGS, `Maximum ${MODEL_VALIDATION.MAX_TAGS} tags allowed`)
    .optional()
    .default([]),
});

// Create Model Schema (for new model creation)
export const createModelSchema = modelSchema;

// Update Model Schema (for editing existing model)
export const updateModelSchema = modelSchema.partial().extend({
  modelId: z.string().min(1, 'Model ID is required'),
});

// Model Search Schema
export const modelSearchSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

// Model Filter Schema
export const modelFilterSchema = z.object({
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// Model ID Schema (for single model operations)
export const modelIdSchema = z.object({
  modelId: z.string().min(1, 'Model ID is required'),
});

// Bulk Operations Schema
export const bulkModelSchema = z.object({
  modelIds: z.array(z.string().min(1)).min(1, 'At least one model must be selected'),
  action: z.enum(['delete', 'export']),
});

// Model Import Schema (if needed for bulk import)
export const modelImportSchema = z.object({
  models: z.array(modelSchema).min(1, 'At least one model is required'),
});

// Type exports
export type ModelFormData = z.infer<typeof modelSchema>;
export type CreateModelData = z.infer<typeof createModelSchema>;
export type UpdateModelData = z.infer<typeof updateModelSchema>;
export type ModelSearchParams = z.infer<typeof modelSearchSchema>;
export type ModelFilterData = z.infer<typeof modelFilterSchema>;
export type ModelIdData = z.infer<typeof modelIdSchema>;
export type BulkModelData = z.infer<typeof bulkModelSchema>;
export type ModelImportData = z.infer<typeof modelImportSchema>;

// Export all schemas

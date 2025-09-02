import { z } from 'zod';
import { VALIDATION_RULES } from '../constants';

// Fleet Type Schema
export const fleetTypeSchema = z.object({
  fleetType: z
    .string()
    .min(VALIDATION_RULES.FLEET_TYPE_NAME.MIN_LENGTH, 
      `Fleet type name must be at least ${VALIDATION_RULES.FLEET_TYPE_NAME.MIN_LENGTH} characters`)
    .max(VALIDATION_RULES.FLEET_TYPE_NAME.MAX_LENGTH, 
      `Fleet type name must be less than ${VALIDATION_RULES.FLEET_TYPE_NAME.MAX_LENGTH} characters`)
    .trim()
    .nonempty('Fleet type name is required'),
  
  description: z
    .string()
    .max(VALIDATION_RULES.DESCRIPTION.MAX_LENGTH, 
      `Description must be less than ${VALIDATION_RULES.DESCRIPTION.MAX_LENGTH} characters`)
    .optional()
    .or(z.literal('')),
});

// Fleet Type Update Schema (all fields optional)
export const fleetTypeUpdateSchema = fleetTypeSchema.partial();

// Fleet Type Search Schema
export const fleetTypeSearchSchema = z.object({
  search: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Fleet Type Filter Schema
export const fleetTypeFilterSchema = z.object({
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

// Bulk Operations Schema
export const bulkFleetTypeOperationSchema = z.object({
  fleetTypeIds: z.array(z.string().uuid()).min(1, 'At least one fleet type must be selected'),
  operation: z.enum(['delete']),
});

// Type inference
export type FleetTypeFormData = z.infer<typeof fleetTypeSchema>;
export type FleetTypeUpdateData = z.infer<typeof fleetTypeUpdateSchema>;
export type FleetTypeSearchData = z.infer<typeof fleetTypeSearchSchema>;
export type FleetTypeFilterData = z.infer<typeof fleetTypeFilterSchema>;
export type BulkFleetTypeOperationData = z.infer<typeof bulkFleetTypeOperationSchema>;

// Validation functions
export const validateFleetType = (data: unknown) => {
  return fleetTypeSchema.safeParse(data);
};

export const validateFleetTypeUpdate = (data: unknown) => {
  return fleetTypeUpdateSchema.safeParse(data);
};

export const validateFleetTypeSearch = (data: unknown) => {
  return fleetTypeSearchSchema.safeParse(data);
};

export const validateFleetTypeFilter = (data: unknown) => {
  return fleetTypeFilterSchema.safeParse(data);
};

export const validateBulkFleetTypeOperation = (data: unknown) => {
  return bulkFleetTypeOperationSchema.safeParse(data);
};
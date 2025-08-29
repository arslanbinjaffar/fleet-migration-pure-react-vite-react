// Repair Schemas for Form Validation

import { z } from 'zod';
import { FILE_UPLOAD } from '../constants';

// Base Repair Status Schema
export const repairStatusSchema = z.enum([
  'Started IN',
  'Inspection', 
  'Diagnosis',
  'RepairInProgress',
  'Completed'
]);

// Inspection Schema
export const inspectionItemSchema = z.object({
  attachment: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => {
        if (!file) return true;
        return file.size <= FILE_UPLOAD.MAX_FILE_SIZE_BYTES;
      },
      {
        message: `File size should be less than ${FILE_UPLOAD.MAX_FILE_SIZE_MB}MB`,
      }
    )
    .refine(
      (file) => {
        if (!file) return true;
        return FILE_UPLOAD.ALLOWED_FILE_TYPES.includes(file.type);
      },
      {
        message: 'Invalid file type',
      }
    ),
  description: z.string().min(1, 'Description is required'),
  comment: z.string().optional(),
  url: z.string().url().optional(),
});

export const inspectionDataSchema = z.array(inspectionItemSchema);

// Diagnosis Product Schema
export const diagnosisProductSchema = z.object({
  id: z.number(),
  productId: z.string().min(1, 'Product is required'),
  description: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  subTotal: z.number().min(0, 'Subtotal must be non-negative'),
  discount: z.number().min(0, 'Discount must be non-negative'),
});

// Diagnosis Service Schema
export const diagnosisServiceSchema = z.object({
  id: z.number(),
  serviceName: z.string().min(1, 'Service name is required'),
  description: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  subTotal: z.number().min(0, 'Subtotal must be non-negative'),
  discount: z.number().min(0, 'Discount must be non-negative'),
});

// Diagnosis Data Schema
export const diagnosisDataSchema = z.object({
  laborCharges: z.number().min(0, 'Labor charges must be non-negative'),
  products: z.array(diagnosisProductSchema).optional(),
  services: z.array(diagnosisServiceSchema).optional(),
});

// Repair Form Schema
export const repairFormSchema = z.object({
  status: repairStatusSchema,
  inspectionData: inspectionDataSchema.optional(),
  diagnosisData: diagnosisDataSchema.optional(),
  repairDetails: z.string().optional(),
  completionNotes: z.string().optional(),
}).refine(
  (data) => {
    // If status is Inspection, inspectionData should be provided
    if (data.status === 'Inspection') {
      return data.inspectionData && data.inspectionData.length > 0;
    }
    return true;
  },
  {
    message: 'Inspection data is required for Inspection status',
    path: ['inspectionData'],
  }
).refine(
  (data) => {
    // If status is Diagnosis, diagnosisData should be provided
    if (data.status === 'Diagnosis') {
      return data.diagnosisData;
    }
    return true;
  },
  {
    message: 'Diagnosis data is required for Diagnosis status',
    path: ['diagnosisData'],
  }
).refine(
  (data) => {
    // If status is RepairInProgress, repairDetails should be provided
    if (data.status === 'RepairInProgress') {
      return data.repairDetails && data.repairDetails.trim().length > 0;
    }
    return true;
  },
  {
    message: 'Repair details are required for Repair In Progress status',
    path: ['repairDetails'],
  }
).refine(
  (data) => {
    // If status is Completed, completionNotes should be provided
    if (data.status === 'Completed') {
      return data.completionNotes && data.completionNotes.trim().length > 0;
    }
    return true;
  },
  {
    message: 'Completion notes are required for Completed status',
    path: ['completionNotes'],
  }
);

// Filter Schema
export const repairFiltersSchema = z.object({
  search: z.string(),
  statusFilter: z.union([repairStatusSchema, z.literal('all')]),
  dateRange: z.object({
    from: z.date().nullable(),
    to: z.date().nullable(),
  }),
});

// Pagination Schema
export const repairPaginationSchema = z.object({
  currentPage: z.number().min(1, 'Page must be at least 1'),
  recordsPerPage: z.number().min(1, 'Records per page must be at least 1'),
  totalRecords: z.number().min(0, 'Total records must be non-negative'),
});

// Status Update Schema
export const statusUpdateSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  status: repairStatusSchema,
});

// File Upload Schema
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= FILE_UPLOAD.MAX_FILE_SIZE_BYTES,
      {
        message: `File size should be less than ${FILE_UPLOAD.MAX_FILE_SIZE_MB}MB`,
      }
    )
    .refine(
      (file) => FILE_UPLOAD.ALLOWED_FILE_TYPES.includes(file.type),
      {
        message: 'Invalid file type',
      }
    ),
  description: z.string().min(1, 'Description is required'),
});

// Export types inferred from schemas
export type RepairStatusType = z.infer<typeof repairStatusSchema>;
export type InspectionItemType = z.infer<typeof inspectionItemSchema>;
export type InspectionDataType = z.infer<typeof inspectionDataSchema>;
export type DiagnosisProductType = z.infer<typeof diagnosisProductSchema>;
export type DiagnosisServiceType = z.infer<typeof diagnosisServiceSchema>;
export type DiagnosisDataType = z.infer<typeof diagnosisDataSchema>;
export type RepairFormType = z.infer<typeof repairFormSchema>;
export type RepairFiltersType = z.infer<typeof repairFiltersSchema>;
export type RepairPaginationType = z.infer<typeof repairPaginationSchema>;
export type StatusUpdateType = z.infer<typeof statusUpdateSchema>;
export type FileUploadType = z.infer<typeof fileUploadSchema>;
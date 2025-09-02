import { z } from 'zod';
import { VALIDATION_RULES } from '../constants';

// Base validation schemas
const emailSchema = z
  .string()
  .optional()
  .refine(
    (email) => !email || VALIDATION_RULES.EMAIL_REGEX.test(email),
    'Please enter a valid email address'
  );

const phoneSchema = z
  .string()
  .optional()
  .refine(
    (phone) => !phone || VALIDATION_RULES.PHONE_REGEX.test(phone),
    'Please enter a valid phone number'
  );

const nameSchema = z
  .string()
  .optional()
  .refine(
    (name) => !name || (name.length >= VALIDATION_RULES.MIN_NAME_LENGTH && name.length <= VALIDATION_RULES.MAX_NAME_LENGTH),
    `Name must be between ${VALIDATION_RULES.MIN_NAME_LENGTH} and ${VALIDATION_RULES.MAX_NAME_LENGTH} characters`
  );

const descriptionSchema = z
  .string()
  .optional()
  .refine(
    (desc) => !desc || (desc.length >= VALIDATION_RULES.MIN_DESCRIPTION_LENGTH && desc.length <= VALIDATION_RULES.MAX_DESCRIPTION_LENGTH),
    `Description must be between ${VALIDATION_RULES.MIN_DESCRIPTION_LENGTH} and ${VALIDATION_RULES.MAX_DESCRIPTION_LENGTH} characters`
  );

// Job creation/update schema
export const jobSchema = z.object({
  // Customer selection
  customerSelectionMode: z.enum(['auto', 'manual']),
  customerId: z.string().uuid().optional(),
  customerFirstname: nameSchema,
  customerLastname: nameSchema,
  customerEmail: emailSchema,
  customerPhone: phoneSchema,
  
  // Machine selection
  machineSelectionMode: z.enum(['auto', 'manual']),
  fleetId: z.string().uuid().optional(),
  machineName: nameSchema,
  machineType: nameSchema,
  machineBrand: nameSchema,
  machineModel: nameSchema,
  machineChassisNo: z.string().optional(),
  machinePlateNo: z.string().optional(),
  runningHours: z.string().optional(),
  serviceArea: z.string().optional(),
  fleetbyTbcJobId: z.string().optional(),
  
  // Technician selection
  technicianSelectionMode: z.enum(['auto', 'manual']),
  technician: z.string().uuid().optional(),
  manualTechnicianName: nameSchema,
  manualTechnicianEmail: emailSchema,
  
  // Job details
  reportedIssues: descriptionSchema,
  comments: descriptionSchema,
})
.refine(
  (data) => {
    // If customer selection mode is auto, customerId is required
    if (data.customerSelectionMode === 'auto') {
      return !!data.customerId;
    }
    // If customer selection mode is manual, at least one customer field should be provided
    if (data.customerSelectionMode === 'manual') {
      return !!(data.customerFirstname || data.customerLastname || data.customerEmail || data.customerPhone);
    }
    return true;
  },
  {
    message: 'Customer information is required',
    path: ['customerId'],
  }
)
.refine(
  (data) => {
    // If machine selection mode is auto, fleetId is required
    if (data.machineSelectionMode === 'auto') {
      return !!data.fleetId;
    }
    // If machine selection mode is manual, at least machine name should be provided
    if (data.machineSelectionMode === 'manual') {
      return !!data.machineName;
    }
    return true;
  },
  {
    message: 'Machine information is required',
    path: ['fleetId'],
  }
)
.refine(
  (data) => {
    // If technician selection mode is auto and technician is provided, it should be valid UUID
    if (data.technicianSelectionMode === 'auto' && data.technician) {
      return z.string().uuid().safeParse(data.technician).success;
    }
    return true;
  },
  {
    message: 'Invalid technician selection',
    path: ['technician'],
  }
);

// Job update schema (all fields optional)
export const jobUpdateSchema = jobSchema.partial();

// Job filter schema
export const jobFilterSchema = z.object({
  status: z.array(z.enum(['Inspection', 'Diagnosis', 'Repair', 'Testing', 'Handover', 'Completed', 'Cancelled'])).optional(),
  assignmentFilter: z.enum(['all', 'assigned', 'unassigned']).optional(),
  customerId: z.string().uuid().optional(),
  fleetId: z.string().uuid().optional(),
  technicianId: z.string().uuid().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

// Job search params schema
export const jobSearchSchema = z.object({
  search: z.string().optional(),
  filters: jobFilterSchema.optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Manual technician schema
export const manualTechnicianSchema = z.object({
  name: nameSchema,
  email: emailSchema,
})
.refine(
  (data) => !!(data.name || data.email),
  {
    message: 'At least technician name or email is required',
    path: ['name'],
  }
);

// Technician assignment schema
export const technicianAssignmentSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  technician: z.string().uuid().optional(),
  manualTechnician: manualTechnicianSchema.optional(),
})
.refine(
  (data) => !!(data.technician || data.manualTechnician),
  {
    message: 'Either system technician or manual technician must be provided',
    path: ['technician'],
  }
);

// Job status update schema
export const jobStatusUpdateSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  status: z.enum(['Inspection', 'Diagnosis', 'Repair', 'Testing', 'Handover', 'Completed', 'Cancelled']),
  secondaryStatus: z.string().optional(),
});

// Bulk operations schema
export const bulkJobOperationSchema = z.object({
  jobIds: z.array(z.string().uuid()).min(1, 'At least one job must be selected'),
  operation: z.enum(['delete', 'updateStatus', 'assignTechnician']),
  data: z.record(z.any()).optional(),
});

// Export types
export type JobFormData = z.infer<typeof jobSchema>;
export type JobUpdateData = z.infer<typeof jobUpdateSchema>;
export type JobFilterData = z.infer<typeof jobFilterSchema>;
export type JobSearchData = z.infer<typeof jobSearchSchema>;
export type ManualTechnicianData = z.infer<typeof manualTechnicianSchema>;
export type TechnicianAssignmentData = z.infer<typeof technicianAssignmentSchema>;
export type JobStatusUpdateData = z.infer<typeof jobStatusUpdateSchema>;
export type BulkJobOperationData = z.infer<typeof bulkJobOperationSchema>;

// Validation functions
export const validateJob = (data: unknown) => {
  return jobSchema.safeParse(data);
};

export const validateJobUpdate = (data: unknown) => {
  return jobUpdateSchema.safeParse(data);
};

export const validateJobFilter = (data: unknown) => {
  return jobFilterSchema.safeParse(data);
};

export const validateJobSearch = (data: unknown) => {
  return jobSearchSchema.safeParse(data);
};

export const validateManualTechnician = (data: unknown) => {
  return manualTechnicianSchema.safeParse(data);
};

export const validateTechnicianAssignment = (data: unknown) => {
  return technicianAssignmentSchema.safeParse(data);
};

export const validateJobStatusUpdate = (data: unknown) => {
  return jobStatusUpdateSchema.safeParse(data);
};

export const validateBulkJobOperation = (data: unknown) => {
  return bulkJobOperationSchema.safeParse(data);
};
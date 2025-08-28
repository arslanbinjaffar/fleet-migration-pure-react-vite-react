import { z } from 'zod';

// Fleet hourly rate schema
const fleetHourlyRateSchema = z.object({
  fleetId: z.string().uuid('Invalid fleet ID').min(1, 'Fleet ID is required'),
  hourlyRate: z.number().min(0, 'Hourly rate cannot be negative'),
});

// Main LPO validation schema
export const lpoSchema = z.object({
  // Fleet Information
  fleetIds: z
    .array(z.string().uuid('Invalid fleet ID'))
    .min(1, 'At least one fleet is required')
    .nonempty('Fleet selection is required'),
  
  fleetHourlyRates: z
    .array(fleetHourlyRateSchema)
    .min(1, 'Fleet hourly rates are required'),

  // Project and Purpose
  siteProjectId: z
    .string()
    .uuid('Invalid project ID')
    .min(1, 'Project is required'),
  
  purpose: z
    .string()
    .min(1, 'Purpose is required')
    .max(500, 'Purpose cannot exceed 500 characters'),

  // Date Information
  lpoStartDate: z
    .string()
    .min(1, 'Start date is required')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Invalid start date format'),
  
  lpoEndDate: z
    .string()
    .min(1, 'End date is required')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Invalid end date format'),

  // Reference and Status
  referenceNumber: z
    .string()
    .min(1, 'Reference number is required')
    .max(100, 'Reference number cannot exceed 100 characters'),
  
  status: z
    .enum(['Pending', 'Approved', 'Rejected', 'UnderProcess', 'Stopped', 'Completed'], {
      errorMap: () => ({ message: 'Invalid status selected' }),
    })
    .default('Pending'),

  // Customer Information
  customerId: z
    .string()
    .uuid('Invalid customer ID')
    .min(1, 'Customer is required'),
  
  designation: z
    .string()
    .min(1, 'Designation is required')
    .max(100, 'Designation cannot exceed 100 characters'),
  
  address: z
    .string()
    .min(1, 'Address is required')
    .max(500, 'Address cannot exceed 500 characters'),

  // Terms and Conditions
  termsAndCondition: z
    .string()
    .min(1, 'Terms and conditions are required')
    .max(2000, 'Terms and conditions cannot exceed 2000 characters'),
})
.refine(
  (data) => {
    const startDate = new Date(data.lpoStartDate);
    const endDate = new Date(data.lpoEndDate);
    return endDate >= startDate;
  },
  {
    message: 'End date must be after or equal to start date',
    path: ['lpoEndDate'],
  }
)
.refine(
  (data) => {
    // Ensure fleet hourly rates match selected fleets
    const fleetIdsSet = new Set(data.fleetIds);
    const rateFleetIds = data.fleetHourlyRates.map(rate => rate.fleetId);
    return rateFleetIds.every(id => fleetIdsSet.has(id)) && 
           rateFleetIds.length === data.fleetIds.length;
  },
  {
    message: 'Fleet hourly rates must match selected fleets',
    path: ['fleetHourlyRates'],
  }
);

// Create LPO schema (for API requests)
export const createLpoSchema = lpoSchema;

// Update LPO schema (partial updates allowed)
export const updateLpoSchema = lpoSchema.partial().extend({
  lpoId: z.string().uuid('Invalid LPO ID').min(1, 'LPO ID is required'),
});

// LPO filter schema
export const lpoFilterSchema = z.object({
  status: z.enum(['all', 'Pending', 'Approved', 'Rejected', 'UnderProcess', 'Stopped', 'Completed']).optional(),
  customerId: z.string().uuid().optional(),
  siteProjectId: z.string().uuid().optional(),
  dateRange: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
  }).optional(),
}).optional();

// Export schema types
export type LpoFormData = z.infer<typeof lpoSchema>;
export type CreateLpoData = z.infer<typeof createLpoSchema>;
export type UpdateLpoData = z.infer<typeof updateLpoSchema>;
export type LpoFilterData = z.infer<typeof lpoFilterSchema>;

// Form sections for step-by-step validation
export const lpoFormSections = {
  'Fleet Information': {
    fields: ['fleetIds', 'fleetHourlyRates'],
    schema: lpoSchema.pick({ fleetIds: true, fleetHourlyRates: true }),
  },
  'LPO Details': {
    fields: ['siteProjectId', 'purpose', 'lpoStartDate', 'lpoEndDate', 'referenceNumber', 'status'],
    schema: lpoSchema.pick({ 
      siteProjectId: true, 
      purpose: true, 
      lpoStartDate: true, 
      lpoEndDate: true, 
      referenceNumber: true, 
      status: true 
    }),
  },
  'Customer Information': {
    fields: ['customerId', 'designation', 'address'],
    schema: lpoSchema.pick({ customerId: true, designation: true, address: true }),
  },
  'Terms & Conditions': {
    fields: ['termsAndCondition'],
    schema: lpoSchema.pick({ termsAndCondition: true }),
  },
};
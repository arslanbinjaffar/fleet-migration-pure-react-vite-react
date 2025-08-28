import { z } from 'zod';

// Customer validation schema
export const customerSchema = z.object({
  // Personal Information
  firstname: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastname: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  prefixName: z.string().optional(),
  prefix: z.string().optional(),
  organization: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  
  // Contact Information
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  phone: z.string().optional().nullable(),
  
  // Business Information
  TRN: z.string().optional().nullable(),
  
  // Address Information
  city: z.string().optional().nullable(),
  stateOrProvince: z.string().optional().nullable(),
  area: z.string().optional().nullable(),
  mailingAddress: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  webSite: z.string().url('Invalid website URL').optional().or(z.literal('')),
  postalCode: z.string().optional().nullable(),
});

// Create customer schema
export const createCustomerSchema = customerSchema;

// Update customer schema (all fields optional except ID)
export const updateCustomerSchema = customerSchema.partial().extend({
  customerId: z.string().uuid('Invalid customer ID'),
});

// Customer ledger schema
export const customerLedgerSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID').min(1, 'Customer is required'),
  transactionType: z.enum(['debit', 'credit'], {
    required_error: 'Transaction type is required',
  }),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional().nullable(),
  referenceNumber: z.string().optional().nullable(),
  transactionDate: z.string().min(1, 'Transaction date is required'),
});

// Customer filter schema
export const customerFilterSchema = z.object({
  status: z.enum(['active', 'inactive', 'all']).optional(),
  search: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  dateRange: z.object({
    from: z.string(),
    to: z.string(),
  }).optional(),
});

// Export form data types
export type CustomerFormData = z.infer<typeof customerSchema>;
export type CreateCustomerFormData = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerFormData = z.infer<typeof updateCustomerSchema>;
export type CustomerLedgerFormData = z.infer<typeof customerLedgerSchema>;
export type CustomerFiltersFormData = z.infer<typeof customerFilterSchema>;

// Form sections for step-by-step validation
export const customerFormSections = {
  personalInfo: {
    fields: ['firstname', 'lastname', 'prefixName', 'prefix', 'organization', 'title'],
    schema: customerSchema.pick({
      firstname: true,
      lastname: true,
      prefixName: true,
      prefix: true,
      organization: true,
      title: true,
    }),
  },
  contactInfo: {
    fields: ['email', 'phone', 'TRN'],
    schema: customerSchema.pick({
      email: true,
      phone: true,
      TRN: true,
    }),
  },
  addressInfo: {
    fields: ['city', 'stateOrProvince', 'area', 'mailingAddress', 'country', 'webSite', 'postalCode'],
    schema: customerSchema.pick({
      city: true,
      stateOrProvince: true,
      area: true,
      mailingAddress: true,
      country: true,
      webSite: true,
      postalCode: true,
    }),
  },
};
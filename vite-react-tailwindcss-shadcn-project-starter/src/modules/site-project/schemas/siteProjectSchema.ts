import { z } from 'zod';
import { VALIDATION_RULES, PROJECT_TYPE_OPTIONS, ZONE_OPTIONS } from '../constants';

// Site Project Schema
export const siteProjectSchema = z.object({
  projectName: z
    .string()
    .min(VALIDATION_RULES.PROJECT_NAME.MIN_LENGTH, 
      `Project name must be at least ${VALIDATION_RULES.PROJECT_NAME.MIN_LENGTH} characters`)
    .max(VALIDATION_RULES.PROJECT_NAME.MAX_LENGTH, 
      `Project name must be less than ${VALIDATION_RULES.PROJECT_NAME.MAX_LENGTH} characters`)
    .trim()
    .nonempty('Project name is required'),

  typeOfProject: z
    .string()
    .nonempty('Type of project is required')
    .refine(
      (value) => PROJECT_TYPE_OPTIONS.some(option => option.value === value),
      'Please select a valid project type'
    ),

  projectOwner: z
    .string()
    .min(VALIDATION_RULES.PROJECT_OWNER.MIN_LENGTH, 
      `Project owner must be at least ${VALIDATION_RULES.PROJECT_OWNER.MIN_LENGTH} characters`)
    .max(VALIDATION_RULES.PROJECT_OWNER.MAX_LENGTH, 
      `Project owner must be less than ${VALIDATION_RULES.PROJECT_OWNER.MAX_LENGTH} characters`)
    .trim()
    .nonempty('Project owner is required'),

  mainContractor: z
    .string()
    .min(VALIDATION_RULES.CONTRACTOR.MIN_LENGTH, 
      `Main contractor must be at least ${VALIDATION_RULES.CONTRACTOR.MIN_LENGTH} characters`)
    .max(VALIDATION_RULES.CONTRACTOR.MAX_LENGTH, 
      `Main contractor must be less than ${VALIDATION_RULES.CONTRACTOR.MAX_LENGTH} characters`)
    .trim()
    .nonempty('Main contractor is required'),

  subContractor: z
    .string()
    .min(VALIDATION_RULES.CONTRACTOR.MIN_LENGTH, 
      `Sub contractor must be at least ${VALIDATION_RULES.CONTRACTOR.MIN_LENGTH} characters`)
    .max(VALIDATION_RULES.CONTRACTOR.MAX_LENGTH, 
      `Sub contractor must be less than ${VALIDATION_RULES.CONTRACTOR.MAX_LENGTH} characters`)
    .trim()
    .nonempty('Sub contractor is required'),

  serviceProvider: z
    .string()
    .min(VALIDATION_RULES.SERVICE_PROVIDER.MIN_LENGTH, 
      `Service provider must be at least ${VALIDATION_RULES.SERVICE_PROVIDER.MIN_LENGTH} characters`)
    .max(VALIDATION_RULES.SERVICE_PROVIDER.MAX_LENGTH, 
      `Service provider must be less than ${VALIDATION_RULES.SERVICE_PROVIDER.MAX_LENGTH} characters`)
    .trim()
    .nonempty('Service provider is required'),

  mainClient: z
    .string()
    .optional()
    .or(z.literal('')),

  startDate: z
    .string()
    .nonempty('Start date is required')
    .refine(
      (date) => {
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime());
      },
      'Please enter a valid start date'
    ),

  expiryDate: z
    .string()
    .nonempty('Expiry date is required')
    .refine(
      (date) => {
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime());
      },
      'Please enter a valid expiry date'
    ),

  subProject: z
    .string()
    .optional()
    .or(z.literal('')),

  subProjectName: z
    .string()
    .min(VALIDATION_RULES.SUB_PROJECT_NAME.MIN_LENGTH, 
      `Sub project name must be at least ${VALIDATION_RULES.SUB_PROJECT_NAME.MIN_LENGTH} characters`)
    .max(VALIDATION_RULES.SUB_PROJECT_NAME.MAX_LENGTH, 
      `Sub project name must be less than ${VALIDATION_RULES.SUB_PROJECT_NAME.MAX_LENGTH} characters`)
    .trim()
    .nonempty('Sub project name is required'),

  zone: z
    .string()
    .nonempty('Zone is required')
    .refine(
      (value) => ZONE_OPTIONS.some(option => option.value === value),
      'Please select a valid zone'
    ),

  zonalSite: z
    .string()
    .min(VALIDATION_RULES.ZONAL_SITE.MIN_LENGTH, 
      `Zonal site must be at least ${VALIDATION_RULES.ZONAL_SITE.MIN_LENGTH} characters`)
    .max(VALIDATION_RULES.ZONAL_SITE.MAX_LENGTH, 
      `Zonal site must be less than ${VALIDATION_RULES.ZONAL_SITE.MAX_LENGTH} characters`)
    .trim()
    .nonempty('Zonal site is required'),

  projectColor: z
    .string()
    .nonempty('Project color is required')
    .regex(VALIDATION_RULES.COLOR_FORMAT, 'Invalid color format'),
})
.refine(
  (data) => {
    const startDate = new Date(data.startDate);
    const expiryDate = new Date(data.expiryDate);
    return startDate < expiryDate;
  },
  {
    message: 'Start date must be before expiry date',
    path: ['expiryDate'],
  }
);

// Site Project Update Schema (all fields optional)
export const siteProjectUpdateSchema = siteProjectSchema.partial();

// Site Project Search Schema
export const siteProjectSearchSchema = z.object({
  search: z.string().optional(),
  typeFilter: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Site Project Filter Schema
export const siteProjectFilterSchema = z.object({
  search: z.string().optional(),
  typeFilter: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

// Bulk Operations Schema
export const bulkSiteProjectOperationSchema = z.object({
  siteProjectIds: z.array(z.string().uuid()).min(1, 'At least one site project must be selected'),
  operation: z.enum(['delete']),
});

// Form Sections Schema (for complex form validation)
export const siteProjectSectionSchema = z.object({
  'Project Information': z.object({
    projectName: siteProjectSchema.shape.projectName,
    typeOfProject: siteProjectSchema.shape.typeOfProject,
    projectOwner: siteProjectSchema.shape.projectOwner,
    mainContractor: siteProjectSchema.shape.mainContractor,
    subContractor: siteProjectSchema.shape.subContractor,
    serviceProvider: siteProjectSchema.shape.serviceProvider,
  }),
  'Project Timeline': z.object({
    startDate: siteProjectSchema.shape.startDate,
    expiryDate: siteProjectSchema.shape.expiryDate,
  }),
  'Project Details': z.object({
    subProjectName: siteProjectSchema.shape.subProjectName,
    zone: siteProjectSchema.shape.zone,
    zonalSite: siteProjectSchema.shape.zonalSite,
    projectColor: siteProjectSchema.shape.projectColor,
  }),
});

// Type inference
export type SiteProjectFormData = z.infer<typeof siteProjectSchema>;
export type SiteProjectUpdateData = z.infer<typeof siteProjectUpdateSchema>;
export type SiteProjectSearchData = z.infer<typeof siteProjectSearchSchema>;
export type SiteProjectFilterData = z.infer<typeof siteProjectFilterSchema>;
export type BulkSiteProjectOperationData = z.infer<typeof bulkSiteProjectOperationSchema>;
export type SiteProjectSectionData = z.infer<typeof siteProjectSectionSchema>;

// Validation functions
export const validateSiteProject = (data: unknown) => {
  return siteProjectSchema.safeParse(data);
};

export const validateSiteProjectUpdate = (data: unknown) => {
  return siteProjectUpdateSchema.safeParse(data);
};

export const validateSiteProjectSearch = (data: unknown) => {
  return siteProjectSearchSchema.safeParse(data);
};

export const validateSiteProjectFilter = (data: unknown) => {
  return siteProjectFilterSchema.safeParse(data);
};

export const validateBulkSiteProjectOperation = (data: unknown) => {
  return bulkSiteProjectOperationSchema.safeParse(data);
};

export const validateSiteProjectSection = (section: string, data: unknown) => {
  const sectionSchema = siteProjectSectionSchema.shape[section as keyof typeof siteProjectSectionSchema.shape];
  return sectionSchema ? sectionSchema.safeParse(data) : { success: false, error: 'Invalid section' };
};
import { z } from 'zod';
import { MAX_FILE_SIZE_BYTES } from '../utils';

// File validation schema
const fileSchema = z
  .instanceof(File)
  .optional()
  .refine(
    (file) => !file || file.size <= MAX_FILE_SIZE_BYTES,
    `File size should be less than 5MB`
  );

// Fleet validation schema
export const fleetSchema = z.object({
  // Fleet Information
  fleetType: z.string().uuid('Invalid fleet type ID').min(1, 'Fleet type is required'),
  plateNumber: z.string().min(1, 'Plate number is required'),
  plateType: z.string().min(1, 'Plate type is required'),
  ownerName: z.string().min(1, 'Owner name is required'),
  ownerID: z.string().min(1, 'Owner ID is required'),
  nationality: z.string().min(1, 'Nationality is required'),
  hourlyRate: z.number().min(0, 'Hourly rate cannot be negative').optional().nullable(),

  // Registration Details
  firstRegistrationDate: z.string().optional().nullable(),
  registrationRenewalDate: z.string().optional().nullable(),
  registrationExpiryDate: z.string().optional().nullable(),
  fahesDate: z.string().optional().nullable(),
  fahesReport: fileSchema,
  fahesReportUrl: z.string().optional(),

  // Vehicle Details
  vehicleName: z.string().min(1, 'Fleet name is required'),
  vehicleModel: z.string().min(1, 'Fleet model is required'),
  madeIn: z.string().min(1, 'Made in is required'),
  productionDate: z.string().optional().nullable(),
  shape: z.string().min(1, 'Shape is required'),
  noOfCylinders: z.number().min(0, 'Number of cylinders cannot be negative').optional().nullable(),
  numberOfDoors: z.number().min(0, 'Number of doors cannot be negative').optional().nullable(),
  weight: z.number().min(0, 'Weight cannot be negative').optional().nullable(),
  grossWeight: z.number().min(0, 'Gross weight cannot be negative').optional().nullable(),
  color: z.string().min(1, 'Color is required'),
  subColor: z.string().optional().nullable(),
  chassisNumber: z.string().min(1, 'Chassis number is required'),
  engineNumber: z.string().min(1, 'Engine number is required'),

  // Insurance Details
  insurer: z.string().min(1, 'Insurer is required'),
  insurancePolicy: z.string().min(1, 'Insurance policy is required'),
  insuranceExpiryDate: z.string().optional().nullable(),
  ownershipType: z.string().min(1, 'Ownership type is required'),
  insuranceType: z.string().min(1, 'Insurance type is required'),

  // Third Party Inspection
  tpcInspectionAs: z.string().optional().nullable(),
  tpcExpiryDate: z.string().optional().nullable(),
  thirdPartyCertificateCo: z.string().optional().nullable(),
  inspectionDate: z.string().optional().nullable(),
  inspectionExpiryDate: z.string().optional().nullable(),
  inspectionType: z.string().optional().nullable(),
  dateOfLastExamination: z.string().optional().nullable(),
  dateOfNextExamination: z.string().optional().nullable(),
});

// Sticker validation schema
export const stickerSchema = z.object({
  siteInspectionStickerIssueDate: z.string().min(1, 'Issue date is required'),
  siteInspectionStickerExpiryDate: z.string().min(1, 'Expiry date is required'),
  siteInspectionStickerAttachment: fileSchema,
  siteInspectionStickerAttachmentUrl: z.string().optional(),
  siteInspectionStickerAttachmentName: z.string().optional(),
  isCreated: z.boolean().optional(),
  stickerId: z.string().optional(),
});

// Attachment validation schema
export const attachmentSchema = z.object({
  file: fileSchema,
  comment: z.string().optional(),
  url: z.string().optional(),
  attachmentId: z.string().optional(),
});

// Complete fleet form schema including attachments and stickers
export const fleetFormSchema = fleetSchema.extend({
  attachments: z.array(attachmentSchema).optional(),
  stickers: z.array(stickerSchema).optional(),
});

// Type inference from schemas
export type FleetFormData = z.infer<typeof fleetFormSchema>;
export type FleetData = z.infer<typeof fleetSchema>;
export type StickerData = z.infer<typeof stickerSchema>;
export type AttachmentData = z.infer<typeof attachmentSchema>;

// Validation helper functions
export const validateFleet = (data: unknown) => {
  return fleetSchema.safeParse(data);
};

export const validateFleetForm = (data: unknown) => {
  return fleetFormSchema.safeParse(data);
};

export const validateSticker = (data: unknown) => {
  return stickerSchema.safeParse(data);
};

export const validateAttachment = (data: unknown) => {
  return attachmentSchema.safeParse(data);
};
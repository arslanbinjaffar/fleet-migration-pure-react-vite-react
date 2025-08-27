// Fleet type definitions
export interface Fleet {
  fleetId?: string;
  fleetType?: string;
  fleetTypeId?: string;
  plateNumber: string;
  plateType: string;
  ownerName: string;
  ownerID: string;
  nationality: string;
  hourlyRate?: number;
  firstRegistrationDate?: string;
  registrationRenewalDate?: string;
  registrationExpiryDate?: string;
  fahesDate?: string;
  fahesReport?: File | null;
  fahesReportUrl?: string;
  vehicleName: string;
  vehicleModel: string;
  madeIn: string;
  productionDate?: string;
  shape: string;
  noOfCylinders?: number;
  numberOfDoors?: number;
  weight?: number;
  grossWeight?: number;
  color: string;
  subColor?: string;
  chassisNumber: string;
  engineNumber: string;
  insurer: string;
  insurancePolicy: string;
  insuranceExpiryDate?: string;
  ownershipType: string;
  insuranceType: string;
  status?: string;
  // Third Party Certificate fields
  tpcInspectionAs?: string;
  tpcExpiryDate?: string;
  thirdPartyCertificateCo?: string;
  inspectionDate?: string;
  inspectionExpiryDate?: string;
  inspectionType?: string;
  dateOfLastExamination?: string;
  dateOfNextExamination?: string;
  // Attachments and stickers
  fleetAttachments?: FleetAttachment[];
  stickers?: FleetSticker[];
}

export interface FleetAttachment {
  id?: string;
  file?: File | null;
  comment: string;
  url?: string;
  fileUrl?: string;
  attachmentId?: string;
}

export interface FleetSticker {
  id?: string;
  siteInspectionStickerIssueDate: string;
  siteInspectionStickerExpiryDate: string;
  siteInspectionStickerAttachment?: File | null;
  siteInspectionStickerAttachmentUrl?: string;
  siteInspectionStickerAttachmentName?: string;
  fileName?: string;
  fileUrl?: string;
  isCreated?: boolean;
  stickerId?: string;
}

export interface FleetType {
  fleetTypeId: string;
  fleetType: string;
}

export interface FleetFormData extends Omit<Fleet, 'fleetId'> {
  attachments?: FleetAttachment[];
}

export interface FleetApiResponse {
  fleet: Fleet;
  message?: string;
}

export interface FleetListResponse {
  fleets: Fleet[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface FleetTypesResponse {
  fleetTypes: FleetType[];
}

// Form validation types
export interface FleetFormErrors {
  [key: string]: string | undefined;
}

// Select option types
export interface SelectOption {
  value: string;
  label: string;
}

export interface FleetSelectOptions {
  insuranceType: SelectOption[];
  thirdPartyCertificateCo: SelectOption[];
  inspectionType: SelectOption[];
}
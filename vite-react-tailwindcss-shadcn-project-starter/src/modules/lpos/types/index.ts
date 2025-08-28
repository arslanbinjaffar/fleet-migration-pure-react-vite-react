// LPOS Types
export interface LPO {
  lpoId: string;
  lpoNumber: string;
  fleetIds: string[];
  fleetHourlyRates: FleetHourlyRate[];
  siteProjectId: string;
  purpose: string;
  lpoStartDate: string;
  lpoEndDate: string;
  referenceNumber: string;
  status: LPOStatus;
  customerId: string;
  designation: string;
  address: string;
  termsAndCondition: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  customer?: Customer;
  siteProject?: SiteProject;
  fleets?: Fleet[];
}

export interface FleetHourlyRate {
  fleetId: string;
  hourlyRate: number;
}

export interface Customer {
  customerId: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface SiteProject {
  siteProjectId: string;
  projectName: string;
  mainClient: string;
  location: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  zonalSite:string;
  mainContractor:string
}

export interface Fleet {
  fleetId: string;
  vehicleName: string;
  plateNumber: string;
  plateType: string;
  status: FleetStatus;
  hourlyRate?: number;
  vehicleModel?: string;
  color?: string;
  fleetType?: FleetType;
  createdAt: string;
  updatedAt: string;
}

export interface FleetType {
  fleetTypeId: string;
  typeName: string;
  description: string;
}

export type LPOStatus = 'Pending' | 'Approved' | 'Rejected' | 'UnderProcess' | 'Stopped' | 'Completed';
export type FleetStatus = 'Available' | 'In Use' | 'Maintenance' | 'Out of Service';

// Form Types
export interface CreateLPORequest {
  fleetIds: string[];
  fleetHourlyRates: FleetHourlyRate[];
  siteProjectId: string;
  purpose: string;
  lpoStartDate: string;
  lpoEndDate: string;
  referenceNumber: string;
  status: LPOStatus;
  customerId: string;
  designation: string;
  address: string;
  termsAndCondition: string;
}

export interface UpdateLPORequest extends Partial<CreateLPORequest> {
  lpoId: string;
}

// API Response Types
export interface LPOsResponse {
  lpos: LPO[];
  fleetsByLpo: Record<string, Fleet[]>;
  total: number;
  page: number;
  limit: number;
}

export interface LPOResponse {
  lpo: LPO;
  fleets: Fleet[];
}

// Filter Types
export interface LPOFilters {
  status?: LPOStatus | 'all';
  customerId?: string;
  siteProjectId?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

// Export Types
export interface ExportLPOsRequest {
  format: 'csv' | 'excel' | 'pdf';
  filters?: LPOFilters;
  fields?: string[];
}
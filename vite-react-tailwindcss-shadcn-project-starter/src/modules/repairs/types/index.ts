// Repairs Module Types

export interface RepairJob {
  jobId: string;
  jobNumber: string;
  status: RepairStatus;
  createdAt: string;
  updatedAt?: string;
  fleet?: {
    vehicleName: string;
    registrationNumber: string;
    plateNumber: string;
  };
  FleetbyTbcJob?: {
    machineName: string;
    machinePlateNo: string;
  };
  customer?: {
    firstname: string;
    lastname: string;
    phone: string;
    email: string;
  };
  customerJob?: {
    firstname: string;
    lastname: string;
    phone: string;
    email: string;
  };
  technician_Detail?: {
    firstName: string;
    lastName: string;
  };
  technicianJob?: {
    name: string;
  };
  quotaionId?: string;
  invoiceId?: string;
}

export type RepairStatus = 
  | 'Started IN'
  | 'Inspection'
  | 'Diagnosis'
  | 'RepairInProgress'
  | 'Completed';

export interface RepairStatusOption {
  value: RepairStatus | 'all';
  label: string;
  color: string;
  icon: React.ReactNode;
}

export interface InspectionData {
  attachment: File | null;
  description: string;
  comment?: string;
  url?: string;
}

export interface DiagnosisProduct {
  id: number;
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
  discount: number;
}

export interface DiagnosisService {
  id: number;
  serviceName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
  discount: number;
}

export interface DiagnosisData {
  laborCharges: number;
  spareParts?: DiagnosisProduct[];
  services?: DiagnosisService[];
}

export interface RepairJobDetails extends RepairJob {
  inspectionJob?: {
    JobDocuments?: Array<{
      description: string;
      comment: string;
      fileUrl: string;
    }>;
  };
  diagnosisJob?: DiagnosisData;
}

export interface RepairFilters {
  search: string;
  statusFilter: RepairStatus | 'all';
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}

export interface RepairPagination {
  currentPage: number;
  recordsPerPage: number;
  totalRecords: number;
}

export interface RepairFormData {
  status: RepairStatus;
  inspectionData?: InspectionData[];
  diagnosisData?: {
    laborCharges: number;
    products: DiagnosisProduct[];
    services: DiagnosisService[];
  };
  repairDetails?: string;
  completionNotes?: string;
}

// API Response Types
export interface RepairJobsResponse {
  jobs: RepairJob[];
  total: number;
  page: number;
  limit: number;
}

export interface RepairJobDetailsResponse {
  jobData: {
    job: RepairJob;
    inspectionJob?: any;
    diagnosisJob?: DiagnosisData;
  };
}

// Product Types (for diagnosis)
export interface Product {
  productId: string;
  name: string;
  description?: string;
  price: number;
}

export interface ProductsResponse {
  products: Product[];
}

// Form Props Types
export interface RepairListProps {
  className?: string;
}

export interface RepairEditProps {
  repairId: string;
}

export interface RepairStatusDropdownProps {
  job: RepairJob;
  onStatusUpdate?: (jobId: string, newStatus: RepairStatus) => void;
}

// Redux State Types
export interface RepairState {
  jobs: RepairJob[];
  currentJob: RepairJobDetails | null;
  filters: RepairFilters;
  pagination: RepairPagination;
  loading: boolean;
  error: string | null;
}

// API Endpoints
export interface RepairApiEndpoints {
  getJobs: string;
  getJobDetails: (jobId: string) => string;
  updateJobStatus: (jobId: string, status: RepairStatus) => string;
  updateJob: (jobId: string, status: RepairStatus) => string;
}
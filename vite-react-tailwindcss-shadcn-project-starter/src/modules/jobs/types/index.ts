// Job type definitions

// Core Job interfaces
export interface Job {
  jobId: string;
  jobNumber: string;
  customerId?: string;
  fleetId?: string;
  fleetbyTbcJobId?: string;
  technician?: string;
  status?: JobStatus;
  secondaryStatus?: string;
  description?: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
  
  // Related entities
  customer?: Customer;
  customerJob?: CustomerJob; // Manual customer entry
  fleet?: Fleet;
  FleetbyTbcJob?: FleetbyTbcJob; // Manual fleet entry
  technician_Detail?: TechnicianDetail;
  technicianJob?: TechnicianJob; // Alternative technician reference
  manualTechnician?: ManualTechnician;
  
  // Job workflow entities
  inspectionJob?: InspectionJob;
  diagnosisJob?: DiagnosisJob;
  quotaion?: Quotation; // Note: keeping original spelling for API compatibility
  invoice?: Invoice;
}

// Job Status enum
export type JobStatus = 
  | 'Inspection'
  | 'Diagnosis' 
  | 'Repair'
  | 'Testing'
  | 'Handover'
  | 'Completed'
  | 'Cancelled';

// Customer interfaces
export interface Customer {
  customerId: string;
  prefixName?: string;
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  organization?: string;
  mailingAddress?: string;
  city?: string;
  stateOrProvince?: string;
  area?: string;
  country?: string;
  TRN?: string;
}

export interface CustomerJob {
  customerJobId: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  email?: string;
}

// Fleet interfaces
export interface Fleet {
  fleetId: string;
  vehicleName: string;
  plateNumber: string;
  vehicleModel: string;
  madeIn: string;
  productionDate?: string;
  chassisNumber: string;
  engineNumber: string;
  color: string;
  registrationNumber?: string;
}

export interface FleetbyTbcJob {
  fleetbyTbcJobId: string;
  machineName?: string;
  machineType?: string;
  machineBrand?: string;
  machineModel?: string;
  machineChassisNo?: string;
  machinePlateNo?: string;
  runningHours?: string;
  servicesArea?: string;
}

// Technician interfaces
export interface TechnicianDetail {
  userId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  employeeNumber?: string;
  localMobileNo?: string;
  idProfession?: string;
}

export interface TechnicianJob {
  userId: string;
  name: string;
}

export interface ManualTechnician {
  name?: string;
  email?: string;
}

// Inspection interfaces
export interface InspectionJob {
  inspectionJobId: string;
  jobId: string;
  documents?: InspectionDocument[] | string; // Can be array or JSON string
  createdAt: string;
  updatedAt: string;
}

export interface InspectionDocument {
  fileUrl?: string;
  comment?: string;
}

// Diagnosis interfaces
export interface DiagnosisJob {
  diagnosisJobId: string;
  jobId: string;
  laborCharges?: number;
  subtotal?: number;
  VAT?: number;
  totalCharges?: number;
  jobProducts?: JobProduct[] | string; // Can be array or JSON string
  createdAt: string;
  updatedAt: string;
}

export interface JobProduct {
  productId?: string;
  subService?: SubService;
  startRangePrice?: number;
  quantity?: number;
  discount?: number;
  subTotal?: number;
  detail?: string;
}

export interface SubService {
  subServiceId: string;
  name: string;
  description?: string;
}

// Quotation interfaces
export interface Quotation {
  quotaionId: string; // Note: keeping original spelling
  quotationNo: string;
  subject?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  discription?: string; // Note: keeping original spelling
  subSeriviceList?: QuotationItem[];
  salesTaxs?: number;
  pricesCalculation?: PricesCalculation;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationItem {
  product?: Product;
  startRangePrice?: number;
  quantity?: number;
  discount?: number;
  subTotal?: number;
  otherCharges?: number;
  detail?: string;
  otherChargesDescription?: string;
}

export interface Product {
  productId: string;
  name: string;
  description?: string;
}

export interface PricesCalculation {
  subtotal?: number;
  totalDiscount?: number;
  EstimatedTax?: number;
  total?: number;
}

// Invoice interfaces
export interface Invoice {
  invoiceId: string;
  invoiceNo: string;
  invoiceDate?: string;
  invoiceDue?: string;
  paymentStatus: PaymentStatus;
  paymentMode?: string;
  TRN?: string;
  description?: string;
  subSeriviceList?: InvoiceItem[] | string; // Can be array or JSON string
  subTotal?: number;
  itemDiscounts?: number;
  estimatedTax?: number;
  totalAmount?: number;
  paidAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = 
  | 'Paid'
  | 'Unpaid'
  | 'Partially Paid'
  | 'Overdue';

export interface InvoiceItem {
  subService?: SubService;
  startRangePrice?: number;
  quantity?: number;
  discount?: number;
  subTotal?: number;
  detail?: string;
}

// Job form data interfaces
export interface JobFormData {
  // Customer selection
  customerSelectionMode: 'auto' | 'manual';
  customerId?: string;
  customerFirstname?: string;
  customerLastname?: string;
  customerEmail?: string;
  customerPhone?: string;
  
  // Machine selection
  machineSelectionMode: 'auto' | 'manual';
  fleetId?: string;
  machineName?: string;
  machineType?: string;
  machineBrand?: string;
  machineModel?: string;
  machineChassisNo?: string;
  machinePlateNo?: string;
  runningHours?: string;
  serviceArea?: string;
  fleetbyTbcJobId?: string;
  
  // Technician assignment
  technicianSelectionMode: 'auto' | 'manual';
  technician?: string;
  manualTechnicianName?: string;
  manualTechnicianEmail?: string;
  
  // Job details
  reportedIssues?: string;
  comments?: string;
}

// API Response interfaces
export interface JobApiResponse {
  job: Job;
  message?: string;
}

export interface JobListResponse {
  jobs: Job[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface JobDetailsResponse {
  jobData: {
    job: Job;
    inspectionJob?: InspectionJob;
    diagnosisJobWithJobProducts?: {
      diagnosisJob: DiagnosisJob;
      JobProducts: JobProduct[];
    };
  };
}

// Filter and search interfaces
export interface JobFilters {
  status?: JobStatus[];
  assignmentFilter?: 'all' | 'assigned' | 'unassigned';
  customerId?: string;
  fleetId?: string;
  technicianId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface JobSearchParams {
  search?: string;
  filters?: JobFilters;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// UI State interfaces
export type ViewMode = 'table' | 'grid';

export interface Pagination {
  currentPage: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

// Form validation interfaces
export interface JobFormErrors {
  [key: string]: string | undefined;
}

// Select option interface
export interface SelectOption {
  value: string;
  label: string;
}

// Status options for dropdowns
export interface StatusOption {
  value: JobStatus;
  label: string;
  color: string;
}

// Export utility types
export type JobCreateData = Omit<Job, 'jobId' | 'jobNumber' | 'createdAt' | 'updatedAt'>;
export type JobUpdateData = Partial<JobCreateData>;
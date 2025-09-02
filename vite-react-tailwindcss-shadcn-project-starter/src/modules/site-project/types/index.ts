// Site Project Types
export interface SiteProject {
  siteProjectId: string;
  projectName: string;
  typeOfProject: string;
  projectOwner: string;
  mainContractor: string;
  subContractor: string;
  serviceProvider: string;
  mainClient?: string;
  startDate: string;
  expiryDate: string;
  subProject?: string;
  subProjectName: string;
  zone: string;
  zonalSite: string;
  projectColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface SiteProjectFormData {
  projectName: string;
  typeOfProject: string;
  projectOwner: string;
  mainContractor: string;
  subContractor: string;
  serviceProvider: string;
  mainClient?: string;
  startDate: string;
  expiryDate: string;
  subProject?: string;
  subProjectName: string;
  zone: string;
  zonalSite: string;
  projectColor: string;
}

export interface SiteProjectCreateData {
  projectName: string;
  typeOfProject: string;
  projectOwner: string;
  mainContractor: string;
  subContractor: string;
  serviceProvider: string;
  mainClient?: string;
  startDate: string;
  expiryDate: string;
  subProject?: string;
  subProjectName: string;
  zone: string;
  zonalSite: string;
  projectColor: string;
}

export interface SiteProjectUpdateData {
  projectName?: string;
  typeOfProject?: string;
  projectOwner?: string;
  mainContractor?: string;
  subContractor?: string;
  serviceProvider?: string;
  mainClient?: string;
  startDate?: string;
  expiryDate?: string;
  subProject?: string;
  subProjectName?: string;
  zone?: string;
  zonalSite?: string;
  projectColor?: string;
}

export interface SiteProjectsResponse {
  siteProjects: SiteProject[];
  total: number;
  page: number;
  limit: number;
}

export interface SiteProjectResponse {
  siteProject: SiteProject;
  message?: string;
}

export interface SiteProjectSearchParams {
  search?: string;
  typeFilter?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SiteProjectListState {
  search: string;
  currentPage: number;
  recordsPerPage: number;
  typeFilter: string;
  dateRange: {
    from: string | null;
    to: string | null;
  };
  isLoading: boolean;
  selectedSiteProject: SiteProject | null;
  showDeleteModal: boolean;
}

export interface SiteProjectPermissions {
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

// Fleet assignment types
export interface AssignedFleet {
  fleet: {
    fleetId: string;
    vehicleName: string;
    status: string;
    fleetType?: {
      fleetType: string;
    };
  };
}

export interface SiteProjectFleets {
  assignedfleets: AssignedFleet[];
}

// Project type options
export interface ProjectTypeOption {
  value: string;
  label: string;
}

export interface ZoneOption {
  value: string;
  label: string;
}

// Form sections for complex form
export interface FormSection {
  title: string;
  fields: string[];
}

export interface FormSections {
  [key: string]: string[];
}

// Export all types
export type {
  SiteProject as default,
};
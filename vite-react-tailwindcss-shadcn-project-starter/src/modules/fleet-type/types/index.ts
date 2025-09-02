// Fleet Type Types
export interface FleetType {
  fleetTypeId: string;
  fleetType: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FleetTypeFormData {
  fleetType: string;
  description?: string;
}

export interface FleetTypeCreateData {
  fleetType: string;
  description?: string;
}

export interface FleetTypeUpdateData {
  fleetType?: string;
  description?: string;
}

export interface FleetTypesResponse {
  fleetTypes: FleetType[];
  total: number;
  page: number;
  limit: number;
}

export interface FleetTypeResponse {
  fleetType: FleetType;
  message?: string;
}

export interface FleetTypeSearchParams {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FleetTypeListState {
  search: string;
  currentPage: number;
  recordsPerPage: number;
  isLoading: boolean;
  selectedFleetType: FleetType | null;
  showDeleteModal: boolean;
}

export interface FleetTypePermissions {
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

// Export all types
export type {
  FleetType as default,
};
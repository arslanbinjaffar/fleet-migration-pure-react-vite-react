import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  RepairJob,
  RepairFilters,
  RepairPagination,
  RepairStatus,
} from '../../modules/repairs/types';
import {
  DEFAULT_VALUES,
  PAGINATION,
} from '../../modules/repairs/constants';

// Repairs State
interface RepairsState {
  jobs: RepairJob[];
  selectedJobIds: string[];
  currentJob: RepairJob | null;
  filters: RepairFilters;
  pagination: RepairPagination;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// UI State for Repairs
interface RepairsUIState {
  // Modals
  isEditRepairModalOpen: boolean;
  isViewRepairModalOpen: boolean;
  isStatusUpdateModalOpen: boolean;
  isInspectionModalOpen: boolean;
  isDiagnosisModalOpen: boolean;
  
  // Dialogs
  isDeleteConfirmDialogOpen: boolean;
  isBulkStatusUpdateDialogOpen: boolean;
  isExportDialogOpen: boolean;
  
  // Panels
  isFilterPanelOpen: boolean;
  isStatisticsPanelOpen: boolean;
  
  // Other UI states
  activeTab: string;
  activeStatusFilter: RepairStatus | 'all';
  sidebarCollapsed: boolean;
  
  // Current selections for modals/dialogs
  currentJobForEdit: RepairJob | null;
  currentJobForStatusUpdate: RepairJob | null;
  currentJobForDelete: RepairJob | null;
  
  // Form states
  isSubmitting: boolean;
  formErrors: Record<string, string>;
}

// Combined State
interface RepairsSliceState {
  repairs: RepairsState;
  ui: RepairsUIState;
}

// Initial States
const initialRepairsState: RepairsState = {
  jobs: [],
  selectedJobIds: [],
  currentJob: null,
  filters: DEFAULT_VALUES.FILTERS,
  pagination: DEFAULT_VALUES.PAGINATION,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const initialUIState: RepairsUIState = {
  // Modals
  isEditRepairModalOpen: false,
  isViewRepairModalOpen: false,
  isStatusUpdateModalOpen: false,
  isInspectionModalOpen: false,
  isDiagnosisModalOpen: false,
  
  // Dialogs
  isDeleteConfirmDialogOpen: false,
  isBulkStatusUpdateDialogOpen: false,
  isExportDialogOpen: false,
  
  // Panels
  isFilterPanelOpen: false,
  isStatisticsPanelOpen: false,
  
  // Other UI states
  activeTab: 'repairs-list',
  activeStatusFilter: 'all',
  sidebarCollapsed: false,
  
  // Current selections
  currentJobForEdit: null,
  currentJobForStatusUpdate: null,
  currentJobForDelete: null,
  
  // Form states
  isSubmitting: false,
  formErrors: {},
};

const initialState: RepairsSliceState = {
  repairs: initialRepairsState,
  ui: initialUIState,
};

// Repairs Slice
const repairsSlice = createSlice({
  name: 'repairs',
  initialState,
  reducers: {
    // Job Management Actions
    setRepairJobs: (state, action: PayloadAction<RepairJob[]>) => {
      state.repairs.jobs = action.payload;
      state.repairs.lastUpdated = new Date().toISOString();
    },
    
    addRepairJob: (state, action: PayloadAction<RepairJob>) => {
      state.repairs.jobs.unshift(action.payload);
      state.repairs.lastUpdated = new Date().toISOString();
    },
    
    updateRepairJob: (state, action: PayloadAction<RepairJob>) => {
      const index = state.repairs.jobs.findIndex(job => job.jobId === action.payload.jobId);
      if (index !== -1) {
        state.repairs.jobs[index] = action.payload;
        if (state.repairs.currentJob?.jobId === action.payload.jobId) {
          state.repairs.currentJob = action.payload;
        }
      }
      state.repairs.lastUpdated = new Date().toISOString();
    },
    
    removeRepairJob: (state, action: PayloadAction<string>) => {
      state.repairs.jobs = state.repairs.jobs.filter(job => job.jobId !== action.payload);
      if (state.repairs.currentJob?.jobId === action.payload) {
        state.repairs.currentJob = null;
      }
      state.repairs.selectedJobIds = state.repairs.selectedJobIds.filter(id => id !== action.payload);
      state.repairs.lastUpdated = new Date().toISOString();
    },
    
    setCurrentRepairJob: (state, action: PayloadAction<RepairJob | null>) => {
      state.repairs.currentJob = action.payload;
    },
    
    // Status Management
    updateRepairJobStatus: (state, action: PayloadAction<{ jobId: string; status: RepairStatus }>) => {
      const { jobId, status } = action.payload;
      const job = state.repairs.jobs.find(job => job.jobId === jobId);
      if (job) {
        job.status = status;
        job.updatedAt = new Date().toISOString();
      }
      if (state.repairs.currentJob?.jobId === jobId) {
        state.repairs.currentJob.status = status;
        state.repairs.currentJob.updatedAt = new Date().toISOString();
      }
      state.repairs.lastUpdated = new Date().toISOString();
    },
    
    // Filter Management
    setRepairFilters: (state, action: PayloadAction<Partial<RepairFilters>>) => {
      state.repairs.filters = { ...state.repairs.filters, ...action.payload };
      state.repairs.pagination.currentPage = 1; // Reset to first page when filters change
    },
    
    setRepairSearchQuery: (state, action: PayloadAction<string>) => {
      state.repairs.filters.search = action.payload;
      state.repairs.pagination.currentPage = 1;
    },
    
    clearRepairFilters: (state) => {
      state.repairs.filters = DEFAULT_VALUES.FILTERS;
      state.repairs.pagination.currentPage = 1;
    },
    
    // Pagination Management
    setRepairPagination: (state, action: PayloadAction<Partial<RepairPagination>>) => {
      state.repairs.pagination = { ...state.repairs.pagination, ...action.payload };
    },
    
    // Selection Management
    toggleRepairJobSelection: (state, action: PayloadAction<string>) => {
      const jobId = action.payload;
      const index = state.repairs.selectedJobIds.indexOf(jobId);
      if (index === -1) {
        state.repairs.selectedJobIds.push(jobId);
      } else {
        state.repairs.selectedJobIds.splice(index, 1);
      }
    },
    
    selectAllRepairJobs: (state, action: PayloadAction<string[]>) => {
      state.repairs.selectedJobIds = action.payload;
    },
    
    clearRepairJobSelection: (state) => {
      state.repairs.selectedJobIds = [];
    },
    
    // Loading and Error States
    setRepairsLoading: (state, action: PayloadAction<boolean>) => {
      state.repairs.isLoading = action.payload;
    },
    
    setRepairsError: (state, action: PayloadAction<string | null>) => {
      state.repairs.error = action.payload;
    },
    
    // UI State Management - Modals
    setEditRepairModalOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isEditRepairModalOpen = action.payload;
    },
    
    setViewRepairModalOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isViewRepairModalOpen = action.payload;
    },
    
    setStatusUpdateModalOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isStatusUpdateModalOpen = action.payload;
    },
    
    setInspectionModalOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isInspectionModalOpen = action.payload;
    },
    
    setDiagnosisModalOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isDiagnosisModalOpen = action.payload;
    },
    
    // UI State Management - Dialogs
    setDeleteConfirmDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isDeleteConfirmDialogOpen = action.payload;
    },
    
    setBulkStatusUpdateDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isBulkStatusUpdateDialogOpen = action.payload;
    },
    
    setExportDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isExportDialogOpen = action.payload;
    },
    
    // UI State Management - Panels
    setFilterPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isFilterPanelOpen = action.payload;
    },
    
    setStatisticsPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isStatisticsPanelOpen = action.payload;
    },
    
    // UI State Management - Other
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.ui.activeTab = action.payload;
    },
    
    setActiveStatusFilter: (state, action: PayloadAction<RepairStatus | 'all'>) => {
      state.ui.activeStatusFilter = action.payload;
    },
    
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.ui.sidebarCollapsed = action.payload;
    },
    
    // Current Selections Management
    setCurrentJobForEdit: (state, action: PayloadAction<RepairJob | null>) => {
      state.ui.currentJobForEdit = action.payload;
    },
    
    setCurrentJobForStatusUpdate: (state, action: PayloadAction<RepairJob | null>) => {
      state.ui.currentJobForStatusUpdate = action.payload;
    },
    
    setCurrentJobForDelete: (state, action: PayloadAction<RepairJob | null>) => {
      state.ui.currentJobForDelete = action.payload;
    },
    
    // Form State Management
    setSubmitting: (state, action: PayloadAction<boolean>) => {
      state.ui.isSubmitting = action.payload;
    },
    
    setFormErrors: (state, action: PayloadAction<Record<string, string>>) => {
      state.ui.formErrors = action.payload;
    },
    
    clearFormErrors: (state) => {
      state.ui.formErrors = {};
    },
    
    // Bulk Operations
    bulkUpdateRepairJobStatus: (state, action: PayloadAction<{ jobIds: string[]; status: RepairStatus }>) => {
      const { jobIds, status } = action.payload;
      state.repairs.jobs.forEach(job => {
        if (jobIds.includes(job.jobId)) {
          job.status = status;
          job.updatedAt = new Date().toISOString();
        }
      });
      if (state.repairs.currentJob && jobIds.includes(state.repairs.currentJob.jobId)) {
        state.repairs.currentJob.status = status;
        state.repairs.currentJob.updatedAt = new Date().toISOString();
      }
      state.repairs.lastUpdated = new Date().toISOString();
    },
    
    // Reset Actions
    resetRepairsState: (state) => {
      state.repairs = initialRepairsState;
    },
    
    resetRepairsUIState: (state) => {
      state.ui = initialUIState;
    },
    
    resetAllRepairsState: () => initialState,
  },
});

// Export Actions
export const {
  // Job Management
  setRepairJobs,
  addRepairJob,
  updateRepairJob,
  removeRepairJob,
  setCurrentRepairJob,
  
  // Status Management
  updateRepairJobStatus,
  
  // Filter Management
  setRepairFilters,
  setRepairSearchQuery,
  clearRepairFilters,
  
  // Pagination Management
  setRepairPagination,
  
  // Selection Management
  toggleRepairJobSelection,
  selectAllRepairJobs,
  clearRepairJobSelection,
  
  // Loading and Error States
  setRepairsLoading,
  setRepairsError,
  
  // UI State Management - Modals
  setEditRepairModalOpen,
  setViewRepairModalOpen,
  setStatusUpdateModalOpen,
  setInspectionModalOpen,
  setDiagnosisModalOpen,
  
  // UI State Management - Dialogs
  setDeleteConfirmDialogOpen,
  setBulkStatusUpdateDialogOpen,
  setExportDialogOpen,
  
  // UI State Management - Panels
  setFilterPanelOpen,
  setStatisticsPanelOpen,
  
  // UI State Management - Other
  setActiveTab,
  setActiveStatusFilter,
  setSidebarCollapsed,
  
  // Current Selections Management
  setCurrentJobForEdit,
  setCurrentJobForStatusUpdate,
  setCurrentJobForDelete,
  
  // Form State Management
  setSubmitting,
  setFormErrors,
  clearFormErrors,
  
  // Bulk Operations
  bulkUpdateRepairJobStatus,
  
  // Reset Actions
  resetRepairsState,
  resetRepairsUIState,
  resetAllRepairsState,
} = repairsSlice.actions;

// Selectors
export const selectRepairsState = (state: { repairs: RepairsSliceState }) => state.repairs;
export const selectRepairJobs = (state: { repairs: RepairsSliceState }) => state.repairs.repairs.jobs;
export const selectRepairsUIState = (state: { repairs: RepairsSliceState }) => state.repairs.ui;

// Repairs Data Selectors
export const selectCurrentRepairJob = (state: { repairs: RepairsSliceState }) => state.repairs.repairs.currentJob;
export const selectRepairsLoading = (state: { repairs: RepairsSliceState }) => state.repairs.repairs.isLoading;
export const selectRepairsError = (state: { repairs: RepairsSliceState }) => state.repairs.repairs.error;
export const selectRepairFilters = (state: { repairs: RepairsSliceState }) => state.repairs.repairs.filters;
export const selectRepairPagination = (state: { repairs: RepairsSliceState }) => state.repairs.repairs.pagination;
export const selectSelectedRepairJobIds = (state: { repairs: RepairsSliceState }) => state.repairs.repairs.selectedJobIds;
export const selectRepairsLastUpdated = (state: { repairs: RepairsSliceState }) => state.repairs.repairs.lastUpdated;

// UI State Selectors
export const selectIsEditRepairModalOpen = (state: { repairs: RepairsSliceState }) => state.repairs.ui.isEditRepairModalOpen;
export const selectIsViewRepairModalOpen = (state: { repairs: RepairsSliceState }) => state.repairs.ui.isViewRepairModalOpen;
export const selectIsStatusUpdateModalOpen = (state: { repairs: RepairsSliceState }) => state.repairs.ui.isStatusUpdateModalOpen;
export const selectIsInspectionModalOpen = (state: { repairs: RepairsSliceState }) => state.repairs.ui.isInspectionModalOpen;
export const selectIsDiagnosisModalOpen = (state: { repairs: RepairsSliceState }) => state.repairs.ui.isDiagnosisModalOpen;
export const selectCurrentJobForEdit = (state: { repairs: RepairsSliceState }) => state.repairs.ui.currentJobForEdit;
export const selectCurrentJobForStatusUpdate = (state: { repairs: RepairsSliceState }) => state.repairs.ui.currentJobForStatusUpdate;
export const selectCurrentJobForDelete = (state: { repairs: RepairsSliceState }) => state.repairs.ui.currentJobForDelete;
export const selectActiveStatusFilter = (state: { repairs: RepairsSliceState }) => state.repairs.ui.activeStatusFilter;
export const selectIsSubmitting = (state: { repairs: RepairsSliceState }) => state.repairs.ui.isSubmitting;
export const selectFormErrors = (state: { repairs: RepairsSliceState }) => state.repairs.ui.formErrors;

export default repairsSlice.reducer;
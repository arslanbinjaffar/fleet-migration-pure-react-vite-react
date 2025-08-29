import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  Job,
  JobFilters,
  ViewMode,
  SortOption,
  Pagination,
} from '../../modules/jobs/types';
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_CURRENT_PAGE,
  DEFAULT_VIEW_MODE,
} from '../../modules/jobs/constants';

// Jobs State
interface JobsState {
  jobs: Job[];
  selectedJobIds: string[];
  currentJob: Job | null;
  filters: JobFilters;
  searchQuery: string;
  pagination: Pagination;
  sorting: SortOption;
  viewMode: ViewMode;
  isLoading: boolean;
  error: string | null;
}

// UI State
interface UIState {
  // Modals
  isCreateJobModalOpen: boolean;
  isEditJobModalOpen: boolean;
  isViewJobModalOpen: boolean;
  isManualTechnicianModalOpen: boolean;
  
  // Dialogs
  isDeleteConfirmDialogOpen: boolean;
  isBulkDeleteConfirmDialogOpen: boolean;
  isTechnicianAssignDialogOpen: boolean;
  
  // Panels
  isFilterPanelOpen: boolean;
  isExportPanelOpen: boolean;
  
  // Other UI states
  activeTab: string;
  sidebarCollapsed: boolean;
  
  // Current selections for modals/dialogs
  currentJobForTechnician: Job | null;
  currentJobForDelete: Job | null;
}

// Combined State
interface JobsSliceState {
  jobs: JobsState;
  ui: UIState;
}

// Initial States
const initialJobsState: JobsState = {
  jobs: [],
  selectedJobIds: [],
  currentJob: null,
  filters: {},
  searchQuery: '',
  pagination: {
    currentPage: DEFAULT_CURRENT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0,
  },
  sorting: {
    field: 'createdAt',
    direction: 'desc',
  },
  viewMode: DEFAULT_VIEW_MODE,
  isLoading: false,
  error: null,
};

const initialUIState: UIState = {
  // Modals
  isCreateJobModalOpen: false,
  isEditJobModalOpen: false,
  isViewJobModalOpen: false,
  isManualTechnicianModalOpen: false,
  
  // Dialogs
  isDeleteConfirmDialogOpen: false,
  isBulkDeleteConfirmDialogOpen: false,
  isTechnicianAssignDialogOpen: false,
  
  // Panels
  isFilterPanelOpen: false,
  isExportPanelOpen: false,
  
  // Other UI states
  activeTab: 'jobs-list',
  sidebarCollapsed: false,
  
  // Current selections
  currentJobForTechnician: null,
  currentJobForDelete: null,
};

const initialState: JobsSliceState = {
  jobs: initialJobsState,
  ui: initialUIState,
};

// Jobs Slice
const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    // Jobs CRUD operations
    setJobs: (state, action: PayloadAction<Job[]>) => {
      state.jobs.jobs = action.payload;
    },
    
    addJob: (state, action: PayloadAction<Job>) => {
      state.jobs.jobs.unshift(action.payload);
    },
    
    updateJob: (state, action: PayloadAction<Job>) => {
      const index = state.jobs.jobs.findIndex(job => job.jobId === action.payload.jobId);
      if (index !== -1) {
        state.jobs.jobs[index] = action.payload;
      }
      // Update current job if it's the same
      if (state.jobs.currentJob?.jobId === action.payload.jobId) {
        state.jobs.currentJob = action.payload;
      }
    },
    
    removeJob: (state, action: PayloadAction<string>) => {
      state.jobs.jobs = state.jobs.jobs.filter(job => job.jobId !== action.payload);
      // Clear current job if it's the deleted one
      if (state.jobs.currentJob?.jobId === action.payload) {
        state.jobs.currentJob = null;
      }
      // Remove from selected jobs
      state.jobs.selectedJobIds = state.jobs.selectedJobIds.filter(id => id !== action.payload);
    },
    
    setCurrentJob: (state, action: PayloadAction<Job | null>) => {
      state.jobs.currentJob = action.payload;
    },
    
    // Filters and search
    setJobFilters: (state, action: PayloadAction<JobFilters>) => {
      state.jobs.filters = { ...state.jobs.filters, ...action.payload };
      // Reset pagination when filters change
      state.jobs.pagination.currentPage = DEFAULT_CURRENT_PAGE;
    },
    
    setJobSearchQuery: (state, action: PayloadAction<string>) => {
      state.jobs.searchQuery = action.payload;
      // Reset pagination when search changes
      state.jobs.pagination.currentPage = DEFAULT_CURRENT_PAGE;
    },
    
    clearJobFilters: (state) => {
      state.jobs.filters = {};
      state.jobs.searchQuery = '';
      state.jobs.pagination.currentPage = DEFAULT_CURRENT_PAGE;
    },
    
    // Pagination
    setJobPagination: (state, action: PayloadAction<Partial<Pagination>>) => {
      state.jobs.pagination = { ...state.jobs.pagination, ...action.payload };
    },
    
    // Sorting
    setJobSorting: (state, action: PayloadAction<SortOption>) => {
      state.jobs.sorting = action.payload;
    },
    
    // View mode
    setJobViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.jobs.viewMode = action.payload;
    },
    
    // Selection
    toggleJobSelection: (state, action: PayloadAction<string>) => {
      const jobId = action.payload;
      const index = state.jobs.selectedJobIds.indexOf(jobId);
      if (index === -1) {
        state.jobs.selectedJobIds.push(jobId);
      } else {
        state.jobs.selectedJobIds.splice(index, 1);
      }
    },
    
    selectAllJobs: (state, action: PayloadAction<string[]>) => {
      state.jobs.selectedJobIds = action.payload;
    },
    
    clearJobSelection: (state) => {
      state.jobs.selectedJobIds = [];
    },
    
    // Loading and error states
    setJobsLoading: (state, action: PayloadAction<boolean>) => {
      state.jobs.isLoading = action.payload;
    },
    
    setJobsError: (state, action: PayloadAction<string | null>) => {
      state.jobs.error = action.payload;
    },
    
    // UI State - Modals
    setCreateJobModalOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isCreateJobModalOpen = action.payload;
    },
    
    setEditJobModalOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isEditJobModalOpen = action.payload;
    },
    
    setViewJobModalOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isViewJobModalOpen = action.payload;
    },
    
    setManualTechnicianModalOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isManualTechnicianModalOpen = action.payload;
    },
    
    // UI State - Dialogs
    setDeleteConfirmDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isDeleteConfirmDialogOpen = action.payload;
    },
    
    setBulkDeleteConfirmDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isBulkDeleteConfirmDialogOpen = action.payload;
    },
    
    setTechnicianAssignDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isTechnicianAssignDialogOpen = action.payload;
    },
    
    // UI State - Panels
    setFilterPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isFilterPanelOpen = action.payload;
    },
    
    setExportPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isExportPanelOpen = action.payload;
    },
    
    // UI State - Other
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.ui.activeTab = action.payload;
    },
    
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.ui.sidebarCollapsed = action.payload;
    },
    
    // UI State - Current selections
    setCurrentJobForTechnician: (state, action: PayloadAction<Job | null>) => {
      state.ui.currentJobForTechnician = action.payload;
    },
    
    setCurrentJobForDelete: (state, action: PayloadAction<Job | null>) => {
      state.ui.currentJobForDelete = action.payload;
    },
    
    // Technician assignment actions
    assignTechnicianToJob: (state, action: PayloadAction<{ jobId: string; technicianId: string; technicianDetail: any }>) => {
      const { jobId, technicianId, technicianDetail } = action.payload;
      const jobIndex = state.jobs.jobs.findIndex(job => job.jobId === jobId);
      if (jobIndex !== -1) {
        state.jobs.jobs[jobIndex] = {
          ...state.jobs.jobs[jobIndex],
          technician: technicianId,
          technician_Detail: technicianDetail,
          manualTechnician: undefined, // Clear manual technician
        };
      }
      // Update current job if it's the same
      if (state.jobs.currentJob?.jobId === jobId) {
        state.jobs.currentJob = {
          ...state.jobs.currentJob,
          technician: technicianId,
          technician_Detail: technicianDetail,
          manualTechnician: undefined,
        };
      }
    },
    
    assignManualTechnicianToJob: (state, action: PayloadAction<{ jobId: string; manualTechnician: any }>) => {
      const { jobId, manualTechnician } = action.payload;
      const jobIndex = state.jobs.jobs.findIndex(job => job.jobId === jobId);
      if (jobIndex !== -1) {
        state.jobs.jobs[jobIndex] = {
          ...state.jobs.jobs[jobIndex],
          technician: undefined, // Clear system technician
          manualTechnician,
          technician_Detail: {
            userId: '',
            firstName: manualTechnician.name || 'Manual',
            lastName: 'Technician',
            email: manualTechnician.email || '',
          },
        };
      }
      // Update current job if it's the same
      if (state.jobs.currentJob?.jobId === jobId) {
        state.jobs.currentJob = {
          ...state.jobs.currentJob,
          technician: undefined,
          manualTechnician,
          technician_Detail: {
            userId: '',
            firstName: manualTechnician.name || 'Manual',
            lastName: 'Technician',
            email: manualTechnician.email || '',
          },
        };
      }
    },
    
    clearTechnicianFromJob: (state, action: PayloadAction<string>) => {
      const jobId = action.payload;
      const jobIndex = state.jobs.jobs.findIndex(job => job.jobId === jobId);
      if (jobIndex !== -1) {
        state.jobs.jobs[jobIndex] = {
          ...state.jobs.jobs[jobIndex],
          technician: undefined,
          manualTechnician: undefined,
          technician_Detail: undefined,
        };
      }
      // Update current job if it's the same
      if (state.jobs.currentJob?.jobId === jobId) {
        state.jobs.currentJob = {
          ...state.jobs.currentJob,
          technician: undefined,
          manualTechnician: undefined,
          technician_Detail: undefined,
        };
      }
    },
    
    // Reset actions
    resetJobsState: (state) => {
      state.jobs = initialJobsState;
    },
    
    resetUIState: (state) => {
      state.ui = initialUIState;
    },
    
    resetAllJobsState: () => initialState,
  },
});

// Export actions
export const {
  // Jobs CRUD
  setJobs,
  addJob,
  updateJob,
  removeJob,
  setCurrentJob,
  
  // Filters and search
  setJobFilters,
  setJobSearchQuery,
  clearJobFilters,
  
  // Pagination
  setJobPagination,
  
  // Sorting
  setJobSorting,
  
  // View mode
  setJobViewMode,
  
  // Selection
  toggleJobSelection,
  selectAllJobs,
  clearJobSelection,
  
  // Loading and error
  setJobsLoading,
  setJobsError,
  
  // UI State - Modals
  setCreateJobModalOpen,
  setEditJobModalOpen,
  setViewJobModalOpen,
  setManualTechnicianModalOpen,
  
  // UI State - Dialogs
  setDeleteConfirmDialogOpen,
  setBulkDeleteConfirmDialogOpen,
  setTechnicianAssignDialogOpen,
  
  // UI State - Panels
  setFilterPanelOpen,
  setExportPanelOpen,
  
  // UI State - Other
  setActiveTab,
  setSidebarCollapsed,
  
  // UI State - Current selections
  setCurrentJobForTechnician,
  setCurrentJobForDelete,
  
  // Technician assignment
  assignTechnicianToJob,
  assignManualTechnicianToJob,
  clearTechnicianFromJob,
  
  // Reset actions
  resetJobsState,
  resetUIState,
  resetAllJobsState,
} = jobsSlice.actions;

// Selectors
export const selectJobsState = (state: { jobs: JobsSliceState }) => state.jobs;
export const selectJobs = (state: { jobs: JobsSliceState }) => state.jobs.jobs;
export const selectJobsUIState = (state: { jobs: JobsSliceState }) => state.jobs.ui;

// Specific selectors
export const selectCurrentJob = (state: { jobs: JobsSliceState }) => state.jobs.jobs.currentJob;
export const selectJobsLoading = (state: { jobs: JobsSliceState }) => state.jobs.jobs.isLoading;
export const selectJobsError = (state: { jobs: JobsSliceState }) => state.jobs.jobs.error;
export const selectJobFilters = (state: { jobs: JobsSliceState }) => state.jobs.jobs.filters;
export const selectJobSearchQuery = (state: { jobs: JobsSliceState }) => state.jobs.jobs.searchQuery;
export const selectJobPagination = (state: { jobs: JobsSliceState }) => state.jobs.jobs.pagination;
export const selectJobSorting = (state: { jobs: JobsSliceState }) => state.jobs.jobs.sorting;
export const selectJobViewMode = (state: { jobs: JobsSliceState }) => state.jobs.jobs.viewMode;
export const selectSelectedJobIds = (state: { jobs: JobsSliceState }) => state.jobs.jobs.selectedJobIds;

// UI selectors
export const selectIsCreateJobModalOpen = (state: { jobs: JobsSliceState }) => state.jobs.ui.isCreateJobModalOpen;
export const selectIsEditJobModalOpen = (state: { jobs: JobsSliceState }) => state.jobs.ui.isEditJobModalOpen;
export const selectIsViewJobModalOpen = (state: { jobs: JobsSliceState }) => state.jobs.ui.isViewJobModalOpen;
export const selectIsManualTechnicianModalOpen = (state: { jobs: JobsSliceState }) => state.jobs.ui.isManualTechnicianModalOpen;
export const selectCurrentJobForTechnician = (state: { jobs: JobsSliceState }) => state.jobs.ui.currentJobForTechnician;
export const selectCurrentJobForDelete = (state: { jobs: JobsSliceState }) => state.jobs.ui.currentJobForDelete;

export default jobsSlice.reducer;
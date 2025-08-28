import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ScheduledShift, TimesheetFilters } from '../../modules/timesheet/types';
import { DEFAULT_TIMESHEET_VALUES } from '../../modules/timesheet/constants';

interface TimesheetState {
  // Current timesheet data
  shifts: ScheduledShift[];
  replicatedShifts: ScheduledShift[];
  currentShift: ScheduledShift | null;
  
  // Pagination
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  
  // Filters and search
  filters: TimesheetFilters;
  searchTerm: string;
  
  // UI state
  viewMode: 'table' | 'card';
  isLoading: boolean;
  isUpdatingStatus: boolean;
  isReplicating: boolean;
  selectedShiftIds: string[];
  
  // Date range
  dateRange: {
    from: string | null;
    to: string | null;
  };
  
  // Sort configuration
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  
  // Form state
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isManageTimeModalOpen: boolean;
  editingShift: ScheduledShift | null;
  
  // Statistics
  stats: {
    totalShifts: number;
    workingShifts: number;
    standbyShifts: number;
    outOfServiceShifts: number;
    totalMachineHours: number;
    totalOperatorHours: number;
    averageHoursPerShift: number;
  };
  
  // Error handling
  error: string | null;
  lastFetchTime: number | null;
}

const initialState: TimesheetState = {
  shifts: [],
  replicatedShifts: [],
  currentShift: null,
  
  currentPage: DEFAULT_TIMESHEET_VALUES.currentPage,
  pageSize: DEFAULT_TIMESHEET_VALUES.pageSize,
  totalItems: 0,
  totalPages: 0,
  
  filters: {
    status: 'all',
    fleet: 'all',
    project: 'all',
    operator: 'all',
    customer: 'all',
  },
  searchTerm: '',
  
  viewMode: DEFAULT_TIMESHEET_VALUES.viewMode,
  isLoading: false,
  isUpdatingStatus: false,
  isReplicating: false,
  selectedShiftIds: [],
  
  dateRange: {
    from: null,
    to: null,
  },
  
  sortBy: 'createdAt',
  sortOrder: 'desc',
  
  isCreateModalOpen: false,
  isEditModalOpen: false,
  isManageTimeModalOpen: false,
  editingShift: null,
  
  stats: {
    totalShifts: 0,
    workingShifts: 0,
    standbyShifts: 0,
    outOfServiceShifts: 0,
    totalMachineHours: 0,
    totalOperatorHours: 0,
    averageHoursPerShift: 0,
  },
  
  error: null,
  lastFetchTime: null,
};

const timesheetSlice = createSlice({
  name: 'timesheet',
  initialState,
  reducers: {
    // Shift data management
    setShifts: (state, action: PayloadAction<ScheduledShift[]>) => {
      state.shifts = action.payload;
      state.totalItems = action.payload.length;
      state.totalPages = Math.ceil(action.payload.length / state.pageSize);
      state.lastFetchTime = Date.now();
    },
    
    addShift: (state, action: PayloadAction<ScheduledShift>) => {
      state.shifts.unshift(action.payload);
      state.totalItems = state.shifts.length;
      state.totalPages = Math.ceil(state.shifts.length / state.pageSize);
    },
    
    updateShift: (state, action: PayloadAction<ScheduledShift>) => {
      const index = state.shifts.findIndex(
        shift => shift.scheduledFleetId === action.payload.scheduledFleetId
      );
      if (index !== -1) {
        state.shifts[index] = action.payload;
      }
    },
    
    removeShift: (state, action: PayloadAction<string>) => {
      state.shifts = state.shifts.filter(
        shift => shift.scheduledFleetId !== action.payload
      );
      state.totalItems = state.shifts.length;
      state.totalPages = Math.ceil(state.shifts.length / state.pageSize);
    },
    
    updateShiftStatus: (state, action: PayloadAction<{ id: string; status: string }>) => {
      const shift = state.shifts.find(
        shift => shift.scheduledFleetId === action.payload.id
      );
      if (shift) {
        shift.status = action.payload.status as any;
      }
    },
    
    // Replicated shifts management
    setReplicatedShifts: (state, action: PayloadAction<ScheduledShift[]>) => {
      state.replicatedShifts = action.payload;
    },
    
    addReplicatedShifts: (state, action: PayloadAction<ScheduledShift[]>) => {
      state.replicatedShifts.push(...action.payload);
    },
    
    clearReplicatedShifts: (state) => {
      state.replicatedShifts = [];
    },
    
    // Current shift management
    setCurrentShift: (state, action: PayloadAction<ScheduledShift | null>) => {
      state.currentShift = action.payload;
    },
    
    // Pagination
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.totalPages = Math.ceil(state.totalItems / action.payload);
      state.currentPage = 1; // Reset to first page when changing page size
    },
    
    // Filters and search
    setFilters: (state, action: PayloadAction<Partial<TimesheetFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1; // Reset to first page when filtering
    },
    
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.currentPage = 1; // Reset to first page when searching
    },
    
    clearFilters: (state) => {
      state.filters = {
        status: 'all',
        fleet: 'all',
        project: 'all',
        operator: 'all',
        customer: 'all',
      };
      state.searchTerm = '';
      state.currentPage = 1;
    },
    
    // Date range
    setDateRange: (state, action: PayloadAction<{ from: string | null; to: string | null }>) => {
      state.dateRange = action.payload;
      state.currentPage = 1;
    },
    
    clearDateRange: (state) => {
      state.dateRange = { from: null, to: null };
      state.currentPage = 1;
    },
    
    // UI state
    setViewMode: (state, action: PayloadAction<'table' | 'card'>) => {
      state.viewMode = action.payload;
    },
    
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setIsUpdatingStatus: (state, action: PayloadAction<boolean>) => {
      state.isUpdatingStatus = action.payload;
    },
    
    setIsReplicating: (state, action: PayloadAction<boolean>) => {
      state.isReplicating = action.payload;
    },
    
    // Selection management
    setSelectedShiftIds: (state, action: PayloadAction<string[]>) => {
      state.selectedShiftIds = action.payload;
    },
    
    toggleShiftSelection: (state, action: PayloadAction<string>) => {
      const shiftId = action.payload;
      const index = state.selectedShiftIds.indexOf(shiftId);
      if (index === -1) {
        state.selectedShiftIds.push(shiftId);
      } else {
        state.selectedShiftIds.splice(index, 1);
      }
    },
    
    selectAllShifts: (state) => {
      state.selectedShiftIds = state.shifts.map(shift => shift.scheduledFleetId);
    },
    
    clearSelection: (state) => {
      state.selectedShiftIds = [];
    },
    
    // Sorting
    setSorting: (state, action: PayloadAction<{ sortBy: string; sortOrder: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
    
    toggleSortOrder: (state, action: PayloadAction<string>) => {
      if (state.sortBy === action.payload) {
        state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortBy = action.payload;
        state.sortOrder = 'asc';
      }
    },
    
    // Modal management
    setIsCreateModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isCreateModalOpen = action.payload;
    },
    
    setIsEditModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isEditModalOpen = action.payload;
      if (!action.payload) {
        state.editingShift = null;
      }
    },
    
    setIsManageTimeModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isManageTimeModalOpen = action.payload;
      if (!action.payload) {
        state.editingShift = null;
      }
    },
    
    setEditingShift: (state, action: PayloadAction<ScheduledShift | null>) => {
      state.editingShift = action.payload;
    },
    
    // Statistics
    setStats: (state, action: PayloadAction<TimesheetState['stats']>) => {
      state.stats = action.payload;
    },
    
    // Error handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // Reset state
    resetTimesheetState: (state) => {
      return { ...initialState };
    },
    
    // Bulk operations
    bulkUpdateShiftStatus: (state, action: PayloadAction<{ ids: string[]; status: string }>) => {
      const { ids, status } = action.payload;
      state.shifts.forEach(shift => {
        if (ids.includes(shift.scheduledFleetId)) {
          shift.status = status as any;
        }
      });
    },
    
    bulkRemoveShifts: (state, action: PayloadAction<string[]>) => {
      const idsToRemove = action.payload;
      state.shifts = state.shifts.filter(
        shift => !idsToRemove.includes(shift.scheduledFleetId)
      );
      state.totalItems = state.shifts.length;
      state.totalPages = Math.ceil(state.shifts.length / state.pageSize);
      state.selectedShiftIds = [];
    },
  },
});

export const {
  // Shift data management
  setShifts,
  addShift,
  updateShift,
  removeShift,
  updateShiftStatus,
  
  // Replicated shifts management
  setReplicatedShifts,
  addReplicatedShifts,
  clearReplicatedShifts,
  
  // Current shift management
  setCurrentShift,
  
  // Pagination
  setCurrentPage,
  setPageSize,
  
  // Filters and search
  setFilters,
  setSearchTerm,
  clearFilters,
  
  // Date range
  setDateRange,
  clearDateRange,
  
  // UI state
  setViewMode,
  setIsLoading,
  setIsUpdatingStatus,
  setIsReplicating,
  
  // Selection management
  setSelectedShiftIds,
  toggleShiftSelection,
  selectAllShifts,
  clearSelection,
  
  // Sorting
  setSorting,
  toggleSortOrder,
  
  // Modal management
  setIsCreateModalOpen,
  setIsEditModalOpen,
  setIsManageTimeModalOpen,
  setEditingShift,
  
  // Statistics
  setStats,
  
  // Error handling
  setError,
  clearError,
  
  // Reset state
  resetTimesheetState,
  
  // Bulk operations
  bulkUpdateShiftStatus,
  bulkRemoveShifts,
} = timesheetSlice.actions;

export default timesheetSlice.reducer;

// Selectors
export const selectTimesheetState = (state: { timesheet: TimesheetState }) => state.timesheet;
export const selectShifts = (state: { timesheet: TimesheetState }) => state.timesheet.shifts;
export const selectReplicatedShifts = (state: { timesheet: TimesheetState }) => state.timesheet.replicatedShifts;
export const selectCurrentShift = (state: { timesheet: TimesheetState }) => state.timesheet.currentShift;
export const selectTimesheetFilters = (state: { timesheet: TimesheetState }) => state.timesheet.filters;
export const selectTimesheetPagination = (state: { timesheet: TimesheetState }) => ({
  currentPage: state.timesheet.currentPage,
  pageSize: state.timesheet.pageSize,
  totalItems: state.timesheet.totalItems,
  totalPages: state.timesheet.totalPages,
});
export const selectTimesheetUI = (state: { timesheet: TimesheetState }) => ({
  viewMode: state.timesheet.viewMode,
  isLoading: state.timesheet.isLoading,
  isUpdatingStatus: state.timesheet.isUpdatingStatus,
  isReplicating: state.timesheet.isReplicating,
  selectedShiftIds: state.timesheet.selectedShiftIds,
});
export const selectTimesheetModals = (state: { timesheet: TimesheetState }) => ({
  isCreateModalOpen: state.timesheet.isCreateModalOpen,
  isEditModalOpen: state.timesheet.isEditModalOpen,
  isManageTimeModalOpen: state.timesheet.isManageTimeModalOpen,
  editingShift: state.timesheet.editingShift,
});
export const selectTimesheetStats = (state: { timesheet: TimesheetState }) => state.timesheet.stats;
export const selectTimesheetError = (state: { timesheet: TimesheetState }) => state.timesheet.error;
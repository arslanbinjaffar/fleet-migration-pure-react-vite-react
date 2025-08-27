import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { Fleet, FleetAttachment, FleetSticker } from '../../modules/fleet/types';

interface FleetState {
  // Current fleet being viewed/edited
  currentFleet: Fleet | null;
  
  // Fleet list state
  fleets: Fleet[];
  totalFleets: number;
  currentPage: number;
  pageSize: number;
  
  // Search and filters
  searchQuery: string;
  filters: {
    fleetType?: string;
    status?: string;
    ownerName?: string;
    plateNumber?: string;
  };
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Form state
  formData: Partial<Fleet> | null;
  attachments: FleetAttachment[];
  stickers: FleetSticker[];
  
  // Selection state for bulk operations
  selectedFleetIds: string[];
  
  // View preferences
  viewMode: 'grid' | 'list';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const initialState: FleetState = {
  currentFleet: null,
  fleets: [],
  totalFleets: 0,
  currentPage: 1,
  pageSize: 10,
  searchQuery: '',
  filters: {},
  isLoading: false,
  error: null,
  formData: null,
  attachments: [],
  stickers: [],
  selectedFleetIds: [],
  viewMode: 'list',
  sortBy: 'vehicleName',
  sortOrder: 'asc',
};

export const fleetSlice = createSlice({
  name: 'fleet',
  initialState,
  reducers: {
    // Fleet data actions
    setCurrentFleet: (state, action: PayloadAction<Fleet | null>) => {
      state.currentFleet = action.payload;
    },
    
    setFleets: (state, action: PayloadAction<{ fleets: Fleet[]; total: number }>) => {
      state.fleets = action.payload.fleets;
      state.totalFleets = action.payload.total;
    },
    
    addFleet: (state, action: PayloadAction<Fleet>) => {
      state.fleets.unshift(action.payload);
      state.totalFleets += 1;
    },
    
    updateFleet: (state, action: PayloadAction<Fleet>) => {
      const index = state.fleets.findIndex(fleet => fleet.fleetId === action.payload.fleetId);
      if (index !== -1) {
        state.fleets[index] = action.payload;
      }
      if (state.currentFleet?.fleetId === action.payload.fleetId) {
        state.currentFleet = action.payload;
      }
    },
    
    removeFleet: (state, action: PayloadAction<string>) => {
      state.fleets = state.fleets.filter(fleet => fleet.fleetId !== action.payload);
      state.totalFleets -= 1;
      if (state.currentFleet?.fleetId === action.payload) {
        state.currentFleet = null;
      }
    },
    
    // Search and filter actions
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1; // Reset to first page when searching
    },
    
    setFilters: (state, action: PayloadAction<Partial<FleetState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1; // Reset to first page when filtering
    },
    
    clearFilters: (state) => {
      state.filters = {};
      state.searchQuery = '';
      state.currentPage = 1;
    },
    
    // Pagination actions
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.currentPage = 1; // Reset to first page when changing page size
    },
    
    // UI state actions
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // Form state actions
    setFormData: (state, action: PayloadAction<Partial<Fleet> | null>) => {
      state.formData = action.payload;
    },
    
    updateFormData: (state, action: PayloadAction<Partial<Fleet>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    
    setAttachments: (state, action: PayloadAction<FleetAttachment[]>) => {
      state.attachments = action.payload;
    },
    
    addAttachment: (state, action: PayloadAction<FleetAttachment>) => {
      state.attachments.push(action.payload);
    },
    
    removeAttachment: (state, action: PayloadAction<number>) => {
      state.attachments.splice(action.payload, 1);
    },
    
    updateAttachment: (state, action: PayloadAction<{ index: number; attachment: Partial<FleetAttachment> }>) => {
      const { index, attachment } = action.payload;
      if (state.attachments[index]) {
        state.attachments[index] = { ...state.attachments[index], ...attachment };
      }
    },
    
    setStickers: (state, action: PayloadAction<FleetSticker[]>) => {
      state.stickers = action.payload;
    },
    
    addSticker: (state, action: PayloadAction<FleetSticker>) => {
      state.stickers.push(action.payload);
    },
    
    removeSticker: (state, action: PayloadAction<number>) => {
      state.stickers.splice(action.payload, 1);
    },
    
    updateSticker: (state, action: PayloadAction<{ index: number; sticker: Partial<FleetSticker> }>) => {
      const { index, sticker } = action.payload;
      if (state.stickers[index]) {
        state.stickers[index] = { ...state.stickers[index], ...sticker };
      }
    },
    
    // Selection actions
    setSelectedFleetIds: (state, action: PayloadAction<string[]>) => {
      state.selectedFleetIds = action.payload;
    },
    
    toggleFleetSelection: (state, action: PayloadAction<string>) => {
      const fleetId = action.payload;
      const index = state.selectedFleetIds.indexOf(fleetId);
      if (index === -1) {
        state.selectedFleetIds.push(fleetId);
      } else {
        state.selectedFleetIds.splice(index, 1);
      }
    },
    
    selectAllFleets: (state) => {
      state.selectedFleetIds = state.fleets.map(fleet => fleet.fleetId!).filter(Boolean);
    },
    
    clearSelection: (state) => {
      state.selectedFleetIds = [];
    },
    
    // View preferences
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload;
    },
    
    setSorting: (state, action: PayloadAction<{ sortBy: string; sortOrder: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
    
    // Reset actions
    resetFleetState: () => initialState,
    
    resetFormState: (state) => {
      state.formData = null;
      state.attachments = [];
      state.stickers = [];
      state.error = null;
    },
  },
});

// Export actions
export const {
  setCurrentFleet,
  setFleets,
  addFleet,
  updateFleet,
  removeFleet,
  setSearchQuery,
  setFilters,
  clearFilters,
  setCurrentPage,
  setPageSize,
  setLoading,
  setError,
  setFormData,
  updateFormData,
  setAttachments,
  addAttachment,
  removeAttachment,
  updateAttachment,
  setStickers,
  addSticker,
  removeSticker,
  updateSticker,
  setSelectedFleetIds,
  toggleFleetSelection,
  selectAllFleets,
  clearSelection,
  setViewMode,
  setSorting,
  resetFleetState,
  resetFormState,
} = fleetSlice.actions;

// Export selectors
export const selectCurrentFleet = (state: RootState) => state.fleet.currentFleet;
export const selectFleets = (state: RootState) => state.fleet.fleets;
export const selectTotalFleets = (state: RootState) => state.fleet.totalFleets;
export const selectCurrentPage = (state: RootState) => state.fleet.currentPage;
export const selectPageSize = (state: RootState) => state.fleet.pageSize;
export const selectSearchQuery = (state: RootState) => state.fleet.searchQuery;
export const selectFilters = (state: RootState) => state.fleet.filters;
export const selectIsLoading = (state: RootState) => state.fleet.isLoading;
export const selectError = (state: RootState) => state.fleet.error;
export const selectFormData = (state: RootState) => state.fleet.formData;
export const selectAttachments = (state: RootState) => state.fleet.attachments;
export const selectStickers = (state: RootState) => state.fleet.stickers;
export const selectSelectedFleetIds = (state: RootState) => state.fleet.selectedFleetIds;
export const selectViewMode = (state: RootState) => state.fleet.viewMode;
export const selectSortBy = (state: RootState) => state.fleet.sortBy;
export const selectSortOrder = (state: RootState) => state.fleet.sortOrder;

// Complex selectors
export const selectPaginatedFleets = (state: RootState) => {
  const { fleets, currentPage, pageSize } = state.fleet;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return fleets.slice(startIndex, endIndex);
};

export const selectTotalPages = (state: RootState) => {
  const { totalFleets, pageSize } = state.fleet;
  return Math.ceil(totalFleets / pageSize);
};

export const selectIsAllSelected = (state: RootState) => {
  const { fleets, selectedFleetIds } = state.fleet;
  return fleets.length > 0 && selectedFleetIds.length === fleets.length;
};

export const selectIsSomeSelected = (state: RootState) => {
  const { selectedFleetIds } = state.fleet;
  return selectedFleetIds.length > 0;
};

// Export reducer
export default fleetSlice.reducer;
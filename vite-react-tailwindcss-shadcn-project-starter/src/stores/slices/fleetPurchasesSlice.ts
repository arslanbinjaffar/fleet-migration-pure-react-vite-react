import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  FleetPurchaseOrder,
  FleetSupplier,
  FleetPurchase,
  PurchaseOrderFilters,
  SupplierFilters,
  ViewMode,
  SortOption,
  Pagination,
} from '../../modules/fleet-purchases/types';
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_CURRENT_PAGE,
  DEFAULT_VIEW_MODE,
} from '../../modules/fleet-purchases/constants';

// Purchase Orders State
interface PurchaseOrdersState {
  orders: FleetPurchaseOrder[];
  selectedOrderIds: string[];
  currentOrder: FleetPurchaseOrder | null;
  filters: PurchaseOrderFilters;
  searchQuery: string;
  pagination: Pagination;
  sorting: SortOption;
  viewMode: ViewMode;
  isLoading: boolean;
  error: string | null;
}

// Suppliers State
interface SuppliersState {
  suppliers: FleetSupplier[];
  selectedSupplierIds: string[];
  currentSupplier: FleetSupplier | null;
  filters: SupplierFilters;
  searchQuery: string;
  pagination: Pagination;
  sorting: SortOption;
  viewMode: ViewMode;
  isLoading: boolean;
  error: string | null;
}

// Purchases State
interface PurchasesState {
  purchases: FleetPurchase[];
  selectedPurchaseIds: string[];
  currentPurchase: FleetPurchase | null;
  filters: PurchaseOrderFilters;
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
  isCreateOrderModalOpen: boolean;
  isEditOrderModalOpen: boolean;
  isViewOrderModalOpen: boolean;
  isCreateSupplierModalOpen: boolean;
  isEditSupplierModalOpen: boolean;
  isViewSupplierModalOpen: boolean;
  isCreatePaymentModalOpen: boolean;
  isReceiveShippingModalOpen: boolean;
  
  // Dialogs
  isDeleteConfirmDialogOpen: boolean;
  isBulkDeleteConfirmDialogOpen: boolean;
  isApprovalDialogOpen: boolean;
  
  // Panels
  isFilterPanelOpen: boolean;
  isExportPanelOpen: boolean;
  
  // Other UI states
  activeTab: string;
  sidebarCollapsed: boolean;
}

// Combined State
interface FleetPurchasesState {
  purchaseOrders: PurchaseOrdersState;
  suppliers: SuppliersState;
  purchases: PurchasesState;
  ui: UIState;
}

// Initial States
const initialPurchaseOrdersState: PurchaseOrdersState = {
  orders: [],
  selectedOrderIds: [],
  currentOrder: null,
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

const initialSuppliersState: SuppliersState = {
  suppliers: [],
  selectedSupplierIds: [],
  currentSupplier: null,
  filters: {},
  searchQuery: '',
  pagination: {
    currentPage: DEFAULT_CURRENT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0,
  },
  sorting: {
    field: 'name',
    direction: 'asc',
  },
  viewMode: DEFAULT_VIEW_MODE,
  isLoading: false,
  error: null,
};

const initialPurchasesState: PurchasesState = {
  purchases: [],
  selectedPurchaseIds: [],
  currentPurchase: null,
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
  isCreateOrderModalOpen: false,
  isEditOrderModalOpen: false,
  isViewOrderModalOpen: false,
  isCreateSupplierModalOpen: false,
  isEditSupplierModalOpen: false,
  isViewSupplierModalOpen: false,
  isCreatePaymentModalOpen: false,
  isReceiveShippingModalOpen: false,
  
  // Dialogs
  isDeleteConfirmDialogOpen: false,
  isBulkDeleteConfirmDialogOpen: false,
  isApprovalDialogOpen: false,
  
  // Panels
  isFilterPanelOpen: false,
  isExportPanelOpen: false,
  
  // Other UI states
  activeTab: 'purchase-orders',
  sidebarCollapsed: false,
};

const initialState: FleetPurchasesState = {
  purchaseOrders: initialPurchaseOrdersState,
  suppliers: initialSuppliersState,
  purchases: initialPurchasesState,
  ui: initialUIState,
};

// Slice
const fleetPurchasesSlice = createSlice({
  name: 'fleetPurchases',
  initialState,
  reducers: {
    // Purchase Orders Actions
    setPurchaseOrders: (state, action: PayloadAction<FleetPurchaseOrder[]>) => {
      state.purchaseOrders.orders = action.payload;
    },
    
    addPurchaseOrder: (state, action: PayloadAction<FleetPurchaseOrder>) => {
      state.purchaseOrders.orders.unshift(action.payload);
    },
    
    updatePurchaseOrder: (state, action: PayloadAction<FleetPurchaseOrder>) => {
      const index = state.purchaseOrders.orders.findIndex(
        order => order.fleetPurchaseOrderId === action.payload.fleetPurchaseOrderId
      );
      if (index !== -1) {
        state.purchaseOrders.orders[index] = action.payload;
      }
    },
    
    removePurchaseOrder: (state, action: PayloadAction<string>) => {
      state.purchaseOrders.orders = state.purchaseOrders.orders.filter(
        order => order.fleetPurchaseOrderId !== action.payload
      );
      state.purchaseOrders.selectedOrderIds = state.purchaseOrders.selectedOrderIds.filter(
        id => id !== action.payload
      );
    },
    
    setCurrentPurchaseOrder: (state, action: PayloadAction<FleetPurchaseOrder | null>) => {
      state.purchaseOrders.currentOrder = action.payload;
    },
    
    setPurchaseOrderFilters: (state, action: PayloadAction<PurchaseOrderFilters>) => {
      state.purchaseOrders.filters = action.payload;
      state.purchaseOrders.pagination.currentPage = 1; // Reset to first page when filters change
    },
    
    setPurchaseOrderSearchQuery: (state, action: PayloadAction<string>) => {
      state.purchaseOrders.searchQuery = action.payload;
      state.purchaseOrders.pagination.currentPage = 1; // Reset to first page when search changes
    },
    
    setPurchaseOrderPagination: (state, action: PayloadAction<Partial<Pagination>>) => {
      state.purchaseOrders.pagination = { ...state.purchaseOrders.pagination, ...action.payload };
    },
    
    setPurchaseOrderSorting: (state, action: PayloadAction<SortOption>) => {
      state.purchaseOrders.sorting = action.payload;
    },
    
    setPurchaseOrderViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.purchaseOrders.viewMode = action.payload;
    },
    
    togglePurchaseOrderSelection: (state, action: PayloadAction<string>) => {
      const orderId = action.payload;
      const index = state.purchaseOrders.selectedOrderIds.indexOf(orderId);
      if (index === -1) {
        state.purchaseOrders.selectedOrderIds.push(orderId);
      } else {
        state.purchaseOrders.selectedOrderIds.splice(index, 1);
      }
    },
    
    selectAllPurchaseOrders: (state, action: PayloadAction<string[]>) => {
      state.purchaseOrders.selectedOrderIds = action.payload;
    },
    
    clearPurchaseOrderSelection: (state) => {
      state.purchaseOrders.selectedOrderIds = [];
    },
    
    // Suppliers Actions
    setSuppliers: (state, action: PayloadAction<FleetSupplier[]>) => {
      state.suppliers.suppliers = action.payload;
    },
    
    addSupplier: (state, action: PayloadAction<FleetSupplier>) => {
      state.suppliers.suppliers.unshift(action.payload);
    },
    
    updateSupplier: (state, action: PayloadAction<FleetSupplier>) => {
      const index = state.suppliers.suppliers.findIndex(
        supplier => supplier.fleetSupplierId === action.payload.fleetSupplierId
      );
      if (index !== -1) {
        state.suppliers.suppliers[index] = action.payload;
      }
    },
    
    removeSupplier: (state, action: PayloadAction<string>) => {
      state.suppliers.suppliers = state.suppliers.suppliers.filter(
        supplier => supplier.fleetSupplierId !== action.payload
      );
      state.suppliers.selectedSupplierIds = state.suppliers.selectedSupplierIds.filter(
        id => id !== action.payload
      );
    },
    
    setCurrentSupplier: (state, action: PayloadAction<FleetSupplier | null>) => {
      state.suppliers.currentSupplier = action.payload;
    },
    
    setSupplierFilters: (state, action: PayloadAction<SupplierFilters>) => {
      state.suppliers.filters = action.payload;
      state.suppliers.pagination.currentPage = 1;
    },
    
    setSupplierSearchQuery: (state, action: PayloadAction<string>) => {
      state.suppliers.searchQuery = action.payload;
      state.suppliers.pagination.currentPage = 1;
    },
    
    setSupplierPagination: (state, action: PayloadAction<Partial<Pagination>>) => {
      state.suppliers.pagination = { ...state.suppliers.pagination, ...action.payload };
    },
    
    setSupplierSorting: (state, action: PayloadAction<SortOption>) => {
      state.suppliers.sorting = action.payload;
    },
    
    setSupplierViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.suppliers.viewMode = action.payload;
    },
    
    toggleSupplierSelection: (state, action: PayloadAction<string>) => {
      const supplierId = action.payload;
      const index = state.suppliers.selectedSupplierIds.indexOf(supplierId);
      if (index === -1) {
        state.suppliers.selectedSupplierIds.push(supplierId);
      } else {
        state.suppliers.selectedSupplierIds.splice(index, 1);
      }
    },
    
    selectAllSuppliers: (state, action: PayloadAction<string[]>) => {
      state.suppliers.selectedSupplierIds = action.payload;
    },
    
    clearSupplierSelection: (state) => {
      state.suppliers.selectedSupplierIds = [];
    },
    
    // Purchases Actions
    setPurchases: (state, action: PayloadAction<FleetPurchase[]>) => {
      state.purchases.purchases = action.payload;
    },
    
    addPurchase: (state, action: PayloadAction<FleetPurchase>) => {
      state.purchases.purchases.unshift(action.payload);
    },
    
    updatePurchase: (state, action: PayloadAction<FleetPurchase>) => {
      const index = state.purchases.purchases.findIndex(
        purchase => purchase.fleetPurchaseId === action.payload.fleetPurchaseId
      );
      if (index !== -1) {
        state.purchases.purchases[index] = action.payload;
      }
    },
    
    removePurchase: (state, action: PayloadAction<string>) => {
      state.purchases.purchases = state.purchases.purchases.filter(
        purchase => purchase.fleetPurchaseId !== action.payload
      );
      state.purchases.selectedPurchaseIds = state.purchases.selectedPurchaseIds.filter(
        id => id !== action.payload
      );
    },
    
    setCurrentPurchase: (state, action: PayloadAction<FleetPurchase | null>) => {
      state.purchases.currentPurchase = action.payload;
    },
    
    setPurchaseFilters: (state, action: PayloadAction<PurchaseOrderFilters>) => {
      state.purchases.filters = action.payload;
      state.purchases.pagination.currentPage = 1;
    },
    
    setPurchaseSearchQuery: (state, action: PayloadAction<string>) => {
      state.purchases.searchQuery = action.payload;
      state.purchases.pagination.currentPage = 1;
    },
    
    setPurchasePagination: (state, action: PayloadAction<Partial<Pagination>>) => {
      state.purchases.pagination = { ...state.purchases.pagination, ...action.payload };
    },
    
    setPurchaseSorting: (state, action: PayloadAction<SortOption>) => {
      state.purchases.sorting = action.payload;
    },
    
    setPurchaseViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.purchases.viewMode = action.payload;
    },
    
    togglePurchaseSelection: (state, action: PayloadAction<string>) => {
      const purchaseId = action.payload;
      const index = state.purchases.selectedPurchaseIds.indexOf(purchaseId);
      if (index === -1) {
        state.purchases.selectedPurchaseIds.push(purchaseId);
      } else {
        state.purchases.selectedPurchaseIds.splice(index, 1);
      }
    },
    
    selectAllPurchases: (state, action: PayloadAction<string[]>) => {
      state.purchases.selectedPurchaseIds = action.payload;
    },
    
    clearPurchaseSelection: (state) => {
      state.purchases.selectedPurchaseIds = [];
    },
    
    // UI Actions
    setCreateOrderModalOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isCreateOrderModalOpen = action.payload;
    },
    
    setEditOrderModalOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isEditOrderModalOpen = action.payload;
    },
    
    setViewOrderModalOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isViewOrderModalOpen = action.payload;
    },
    
    setCreateSupplierModalOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isCreateSupplierModalOpen = action.payload;
    },
    
    setEditSupplierModalOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isEditSupplierModalOpen = action.payload;
    },
    
    setViewSupplierModalOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isViewSupplierModalOpen = action.payload;
    },
    
    setCreatePaymentModalOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isCreatePaymentModalOpen = action.payload;
    },
    
    setReceiveShippingModalOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isReceiveShippingModalOpen = action.payload;
    },
    
    setDeleteConfirmDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isDeleteConfirmDialogOpen = action.payload;
    },
    
    setBulkDeleteConfirmDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isBulkDeleteConfirmDialogOpen = action.payload;
    },
    
    setApprovalDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isApprovalDialogOpen = action.payload;
    },
    
    setFilterPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isFilterPanelOpen = action.payload;
    },
    
    setExportPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isExportPanelOpen = action.payload;
    },
    
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.ui.activeTab = action.payload;
    },
    
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.ui.sidebarCollapsed = action.payload;
    },
    
    // Loading and Error Actions
    setPurchaseOrdersLoading: (state, action: PayloadAction<boolean>) => {
      state.purchaseOrders.isLoading = action.payload;
    },
    
    setPurchaseOrdersError: (state, action: PayloadAction<string | null>) => {
      state.purchaseOrders.error = action.payload;
    },
    
    setSuppliersLoading: (state, action: PayloadAction<boolean>) => {
      state.suppliers.isLoading = action.payload;
    },
    
    setSuppliersError: (state, action: PayloadAction<string | null>) => {
      state.suppliers.error = action.payload;
    },
    
    setPurchasesLoading: (state, action: PayloadAction<boolean>) => {
      state.purchases.isLoading = action.payload;
    },
    
    setPurchasesError: (state, action: PayloadAction<string | null>) => {
      state.purchases.error = action.payload;
    },
    
    // Reset Actions
    resetPurchaseOrdersState: (state) => {
      state.purchaseOrders = initialPurchaseOrdersState;
    },
    
    resetSuppliersState: (state) => {
      state.suppliers = initialSuppliersState;
    },
    
    resetPurchasesState: (state) => {
      state.purchases = initialPurchasesState;
    },
    
    resetUIState: (state) => {
      state.ui = initialUIState;
    },
    
    resetAllState: () => initialState,
  },
});

// Export actions
export const {
  // Purchase Orders
  setPurchaseOrders,
  addPurchaseOrder,
  updatePurchaseOrder,
  removePurchaseOrder,
  setCurrentPurchaseOrder,
  setPurchaseOrderFilters,
  setPurchaseOrderSearchQuery,
  setPurchaseOrderPagination,
  setPurchaseOrderSorting,
  setPurchaseOrderViewMode,
  togglePurchaseOrderSelection,
  selectAllPurchaseOrders,
  clearPurchaseOrderSelection,
  
  // Suppliers
  setSuppliers,
  addSupplier,
  updateSupplier,
  removeSupplier,
  setCurrentSupplier,
  setSupplierFilters,
  setSupplierSearchQuery,
  setSupplierPagination,
  setSupplierSorting,
  setSupplierViewMode,
  toggleSupplierSelection,
  selectAllSuppliers,
  clearSupplierSelection,
  
  // Purchases
  setPurchases,
  addPurchase,
  updatePurchase,
  removePurchase,
  setCurrentPurchase,
  setPurchaseFilters,
  setPurchaseSearchQuery,
  setPurchasePagination,
  setPurchaseSorting,
  setPurchaseViewMode,
  togglePurchaseSelection,
  selectAllPurchases,
  clearPurchaseSelection,
  
  // UI
  setCreateOrderModalOpen,
  setEditOrderModalOpen,
  setViewOrderModalOpen,
  setCreateSupplierModalOpen,
  setEditSupplierModalOpen,
  setViewSupplierModalOpen,
  setCreatePaymentModalOpen,
  setReceiveShippingModalOpen,
  setDeleteConfirmDialogOpen,
  setBulkDeleteConfirmDialogOpen,
  setApprovalDialogOpen,
  setFilterPanelOpen,
  setExportPanelOpen,
  setActiveTab,
  setSidebarCollapsed,
  
  // Loading and Error
  setPurchaseOrdersLoading,
  setPurchaseOrdersError,
  setSuppliersLoading,
  setSuppliersError,
  setPurchasesLoading,
  setPurchasesError,
  
  // Reset
  resetPurchaseOrdersState,
  resetSuppliersState,
  resetPurchasesState,
  resetUIState,
  resetAllState,
} = fleetPurchasesSlice.actions;

// Selectors
export const selectFleetPurchasesState = (state: { fleetPurchases: FleetPurchasesState }) => state.fleetPurchases;
export const selectPurchaseOrdersState = (state: { fleetPurchases: FleetPurchasesState }) => state.fleetPurchases.purchaseOrders;
export const selectSuppliersState = (state: { fleetPurchases: FleetPurchasesState }) => state.fleetPurchases.suppliers;
export const selectPurchasesState = (state: { fleetPurchases: FleetPurchasesState }) => state.fleetPurchases.purchases;
export const selectUIState = (state: { fleetPurchases: FleetPurchasesState }) => state.fleetPurchases.ui;

// Export reducer
export default fleetPurchasesSlice.reducer;
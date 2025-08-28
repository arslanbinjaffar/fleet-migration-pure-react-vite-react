// Fleet Purchases Module - Main Export File

// Components
export * from './components';

// Types
export type {
  FleetSupplier,
  SupplierLedger,
  FleetPurchase,
  FleetPurchaseOrder,
  ReceiveShipping,
  SupplierPayment,
  Warehouse,
  Category,
  PurchaseOrderFormData,
  SupplierFormData,
  ReceiveShippingFormData,
  SupplierPaymentFormData,
  PurchaseOrdersResponse,
  SuppliersResponse,
  PurchasesResponse,
  SupplierLedgerResponse,
  WarehousesResponse,
  CategoriesResponse,
  PurchaseOrderFilters,
  SupplierFilters,
  PurchaseFilters,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  ItemCondition,
  TransactionType
} from './types/index';

// Schemas
export * from './schemas';

// Constants
export * from './constants';

// Utils
export * from './utils';

// API Slice (re-export for convenience)
export {
  fleetPurchasesApiSlice,
  // Purchase Orders
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderByIdQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
  useUpdatePurchaseOrderStatusMutation,
  useApprovePurchaseOrderMutation,
  useBulkDeletePurchaseOrdersMutation,
  useBulkUpdatePurchaseOrderStatusMutation,
  // Suppliers
  useGetSuppliersQuery,
  useGetSupplierByIdQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  useBulkDeleteSuppliersMutation,
  // Supplier Ledger
  useGetSupplierLedgerQuery,
  // Supplier Payments
  useGetSupplierPaymentsQuery,
  useCreateSupplierPaymentMutation,
  useUpdateSupplierPaymentMutation,
  useDeleteSupplierPaymentMutation,
  // Purchases
  useGetPurchasesQuery,
  useGetPurchaseByIdQuery,
  useCreatePurchaseMutation,
  useUpdatePurchaseMutation,
  useUpdatePurchasePaymentStatusMutation,
  // Receive Shipping
  useGetReceiveShippingsQuery,
  useGetReceiveShippingByOrderIdQuery,
  useCreateReceiveShippingMutation,
  useUpdateReceiveShippingMutation,
  // Lookups
  useGetWarehousesQuery,
  useGetCategoriesQuery,
  // Statistics
  useGetPurchaseOrderStatsQuery,
  useGetSupplierStatsQuery,
  // Export
  useExportPurchaseOrdersMutation,
  useExportSuppliersMutation,
  useExportPurchasesMutation,
  useExportSupplierLedgerMutation,
  // Search
  useSearchSuppliersQuery,
  useSearchPurchaseOrdersQuery,
  // Validation
  useValidateSupplierTRNQuery,
  useValidateSupplierNameQuery,
  // Dashboard
  useGetDashboardDataQuery,
} from '@/stores/api/fleetPurchasesApiSlice';

// Redux Slice (re-export for convenience)
export {
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
  // Selectors
  selectFleetPurchasesState,
  selectPurchaseOrdersState,
  selectSuppliersState,
  selectPurchasesState,
  selectUIState,
} from '@/stores/slices/fleetPurchasesSlice';

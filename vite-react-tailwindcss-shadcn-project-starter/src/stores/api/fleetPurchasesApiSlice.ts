import { createApi } from '@reduxjs/toolkit/query/react';
import { apiSlice } from './apiSlice';
import {
  FleetPurchaseOrder,
  FleetSupplier,
  FleetPurchase,
  ReceiveShipping,
  SupplierPayment,
  SupplierLedger,
  Warehouse,
  Category,
  PurchaseOrdersResponse,
  SuppliersResponse,
  PurchasesResponse,
  SupplierLedgerResponse,
  WarehousesResponse,
  CategoriesResponse,
  PurchaseOrderFormData,
  SupplierFormData,
  ReceiveShippingFormData,
  SupplierPaymentFormData,
  PurchaseOrderFilters,
  SupplierFilters,
  PurchaseFilters,
  ExportPurchaseOrdersRequest,
  ExportSuppliersRequest,
  ExportPurchasesRequest,
  BulkDeleteRequest,
  BulkOperationResponse,
} from '../../modules/fleet-purchases/types';

export const fleetPurchasesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Purchase Orders
    getPurchaseOrders: builder.query<PurchaseOrdersResponse, { filters?: PurchaseOrderFilters; page?: number; limit?: number } | void>({
      query: (params = {}) => ({
        url: 'finance/fleet/purchase-order',
        params,
      }),
      providesTags: ['PurchaseOrder'],
    }),

    getPurchaseOrderById: builder.query<FleetPurchaseOrder, string>({
      query: (id) => `finance/fleet/purchase-order/${id}`,
      providesTags: (result, error, id) => [{ type: 'PurchaseOrder', id }],
    }),

    createPurchaseOrder: builder.mutation<FleetPurchaseOrder, PurchaseOrderFormData>({
      query: (data) => ({
        url: 'finance/fleet/purchase-order',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PurchaseOrder'],
    }),

    updatePurchaseOrder: builder.mutation<FleetPurchaseOrder, { id: string; data: Partial<PurchaseOrderFormData> }>({
      query: ({ id, data }) => ({
        url: `finance/fleet/purchase-order/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PurchaseOrder', id },
        'PurchaseOrder',
        'PurchaseOrderStats',
      ],
    }),

    deletePurchaseOrder: builder.mutation<void, string>({
      query: (id) => ({
        url: `finance/fleet/purchase-order/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PurchaseOrder', 'PurchaseOrderStats'],
    }),

    updatePurchaseOrderStatus: builder.mutation<FleetPurchaseOrder, { fleetPurchaseOrderId: string; orderStatus: string }>({
      query: ({ fleetPurchaseOrderId, ...data }) => ({
        url: `finance/fleet-purchase-orders/${fleetPurchaseOrderId}/status`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { fleetPurchaseOrderId }) => [
        { type: 'PurchaseOrder', id: fleetPurchaseOrderId },
        'PurchaseOrder',
      ],
    }),

    approvePurchaseOrder: builder.mutation<FleetPurchaseOrder, { id: string; notes?: string }>({
      query: ({ id, notes }) => ({
        url: `finance/fleet-purchase-orders/${id}/approve`,
        method: 'PATCH',
        body: { notes },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PurchaseOrder', id },
        'PurchaseOrder',
        'PurchaseOrderStats',
      ],
    }),

    bulkDeletePurchaseOrders: builder.mutation<BulkOperationResponse, BulkDeleteRequest>({
      query: (data) => ({
        url: 'fleet-purchase-orders/bulk-delete',
        method: 'DELETE',
        body: data,
      }),
      invalidatesTags: ['PurchaseOrder'],
    }),

    bulkUpdatePurchaseOrderStatus: builder.mutation<BulkOperationResponse, { ids: string[]; status: string }>({
      query: (data) => ({
        url: 'fleet-purchase-orders/bulk-status',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['PurchaseOrder'],
    }),

    // Suppliers
    getSuppliers: builder.query<SuppliersResponse, { filters?: SupplierFilters; page?: number; limit?: number } | void>({
      query: (params = {}) => ({
        url: 'fleet/supplier',
        params,
      }),
      providesTags: ['Supplier'],
    }),

    getSupplierById: builder.query<FleetSupplier, string>({
      query: (id) => `fleet/supplier/${id}`,
      providesTags: (result, error, id) => [{ type: 'Supplier', id }],
    }),

    createSupplier: builder.mutation<FleetSupplier, SupplierFormData>({
      query: (data) => ({
        url: 'fleet/supplier',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Supplier'],
    }),

    updateSupplier: builder.mutation<FleetSupplier, { id: string; data: Partial<SupplierFormData> }>({
      query: ({ id, data }) => ({
        url: `fleet/supplier/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Supplier', id },
        'Supplier',
        'SupplierStats',
      ],
    }),

    deleteSupplier: builder.mutation<void, string>({
      query: (id) => ({
        url: `fleet/supplier/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Supplier', 'SupplierStats'],
    }),

    bulkDeleteSuppliers: builder.mutation<BulkOperationResponse, BulkDeleteRequest>({
      query: (data) => ({
        url: 'fleet/supplier/bulk-delete',
        method: 'DELETE',
        body: data,
      }),
      invalidatesTags: ['Supplier'],
    }),

    // Supplier Ledger
    getSupplierLedger: builder.query<SupplierLedgerResponse, string>({
      query: (supplierId) => `fleet/suppliers/${supplierId}/ledger`,
      providesTags: (result, error, supplierId) => [{ type: 'SupplierLedger', id: supplierId }],
    }),

    // Supplier Payments
    getSupplierPayments: builder.query<SupplierPayment[], string>({
      query: (supplierId) => `fleet/suppliers/${supplierId}/payments`,
      providesTags: ['SupplierPayment'],
    }),

    createSupplierPayment: builder.mutation<SupplierPayment, SupplierPaymentFormData>({
      query: (data) => ({
        url: 'supplier-payments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SupplierPayment', 'SupplierLedger', 'Purchase'],
    }),

    updateSupplierPayment: builder.mutation<SupplierPayment, { id: string; data: Partial<SupplierPaymentFormData> }>({
      query: ({ id, data }) => ({
        url: `supplier-payments/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['SupplierPayment', 'SupplierLedger', 'Purchase'],
    }),

    deleteSupplierPayment: builder.mutation<void, string>({
      query: (id) => ({
        url: `supplier-payments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SupplierPayment', 'SupplierLedger', 'Purchase'],
    }),

    // Purchases
    getPurchases: builder.query<PurchasesResponse, { filters?: PurchaseFilters; page?: number; limit?: number } | void>({
      query: (params = {}) => ({
        url: 'fleet-purchases',
        params,
      }),
      providesTags: ['Purchase'],
    }),

    getPurchaseById: builder.query<FleetPurchase, string>({
      query: (id) => `fleet-purchases/${id}`,
      providesTags: (result, error, id) => [{ type: 'Purchase', id }],
    }),

    createPurchase: builder.mutation<FleetPurchase, { purchaseOrderId: string; invoiceData: any }>({
      query: (data) => ({
        url: 'fleet-purchases',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Purchase', 'PurchaseOrder'],
    }),

    updatePurchase: builder.mutation<FleetPurchase, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `fleet-purchases/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Purchase', id },
        'Purchase',
      ],
    }),

    updatePurchasePaymentStatus: builder.mutation<FleetPurchase, { fleetPurchaseId: string; paymentStatus: string }>({
      query: ({ fleetPurchaseId, ...data }) => ({
        url: `fleet-purchases/${fleetPurchaseId}/payment-status`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { fleetPurchaseId }) => [
        { type: 'Purchase', id: fleetPurchaseId },
        'Purchase',
      ],
    }),

    // Receive Shipping
    getReceiveShippings: builder.query<ReceiveShipping[], void>({
      query: () => 'receive-shipping-fleet',
      providesTags: ['ReceiveShipping'],
    }),

    getReceiveShippingByOrderId: builder.query<ReceiveShipping[], string>({
      query: (orderId) => `receive-shipping-fleet/order/${orderId}`,
      providesTags: (result, error, orderId) => [{ type: 'ReceiveShipping', id: orderId }],
    }),

    createReceiveShipping: builder.mutation<ReceiveShipping, ReceiveShippingFormData>({
      query: (data) => ({
        url: 'receive-shipping-fleet',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ReceiveShipping', 'PurchaseOrder'],
    }),

    updateReceiveShipping: builder.mutation<ReceiveShipping, { id: string; data: Partial<ReceiveShippingFormData> }>({
      query: ({ id, data }) => ({
        url: `receive-shipping-fleet/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'ReceiveShipping', id },
        'ReceiveShipping',
        'PurchaseOrder',
      ],
    }),

    // Lookups
    getWarehouses: builder.query<WarehousesResponse, void>({
      query: () => 'warehouses',
      providesTags: ['Warehouse'],
    }),

    getCategories: builder.query<CategoriesResponse, void>({
      query: () => 'categories',
      providesTags: ['Category'],
    }),

    // Statistics
    getPurchaseOrderStats: builder.query<any, void>({
      query: () => 'fleet-purchase-orders/stats',
      providesTags: ['PurchaseOrderStats'],
    }),

    getSupplierStats: builder.query<any, void>({
      query: () => 'fleet-suppliers/stats',
      providesTags: ['SupplierStats'],
    }),

    // Export
    exportPurchaseOrders: builder.mutation<Blob, ExportPurchaseOrdersRequest>({
      query: (params) => ({
        url: 'fleet-purchase-orders/export',
        method: 'POST',
        body: params,
        responseHandler: (response) => response.blob(),
      }),
    }),

    exportSuppliers: builder.mutation<Blob, ExportSuppliersRequest>({
      query: (params) => ({
        url: 'fleet-suppliers/export',
        method: 'POST',
        body: params,
        responseHandler: (response) => response.blob(),
      }),
    }),

    exportPurchases: builder.mutation<Blob, ExportPurchasesRequest>({
      query: (params) => ({
        url: 'fleet-purchases/export',
        method: 'POST',
        body: params,
        responseHandler: (response) => response.blob(),
      }),
    }),

    exportSupplierLedger: builder.mutation<Blob, { supplierId: string; format: 'csv' | 'excel' | 'pdf' }>({
      query: ({ supplierId, format }) => ({
        url: `fleet-suppliers/${supplierId}/ledger/export`,
        method: 'POST',
        body: { format },
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Search and Autocomplete
    searchSuppliers: builder.query<FleetSupplier[], string>({
      query: (searchTerm) => `fleet-suppliers/search?q=${encodeURIComponent(searchTerm)}`,
      providesTags: ['Supplier'],
    }),

    searchPurchaseOrders: builder.query<FleetPurchaseOrder[], string>({
      query: (searchTerm) => `fleet-purchase-orders/search?q=${encodeURIComponent(searchTerm)}`,
      providesTags: ['PurchaseOrder'],
    }),

    // Validation
    validateSupplierTRN: builder.query<{ isValid: boolean; exists: boolean }, { trn: string; excludeId?: string }>({
      query: ({ trn, excludeId }) => ({
        url: 'fleet-suppliers/validate-trn',
        params: { trn, excludeId },
      }),
    }),

    validateSupplierName: builder.query<{ isValid: boolean; exists: boolean }, { name: string; excludeId?: string }>({
      query: ({ name, excludeId }) => ({
        url: 'fleet-suppliers/validate-name',
        params: { name, excludeId },
      }),
    }),

    // Dashboard Data
    getDashboardData: builder.query<{
      recentPurchaseOrders: FleetPurchaseOrder[];
      pendingApprovals: FleetPurchaseOrder[];
      overduePayments: FleetPurchase[];
      topSuppliers: FleetSupplier[];
      monthlyStats: any;
    }, void>({
      query: () => 'fleet-purchases/dashboard',
      providesTags: ['PurchaseOrder', 'Purchase', 'Supplier'],
    }),

    // Reports
    getPurchaseOrderReport: builder.query<any, {
      dateFrom: string;
      dateTo: string;
      supplierId?: string;
      warehouseId?: string;
      status?: string;
    }>({
      query: (params) => ({
        url: 'fleet-purchase-orders/report',
        params,
      }),
    }),

    getSupplierPerformanceReport: builder.query<any, {
      dateFrom: string;
      dateTo: string;
      supplierId?: string;
    }>({
      query: (params) => ({
        url: 'fleet-suppliers/performance-report',
        params,
      }),
    }),

    getPurchaseAnalyticsReport: builder.query<any, {
      dateFrom: string;
      dateTo: string;
      groupBy: 'month' | 'quarter' | 'year';
    }>({
      query: (params) => ({
        url: 'fleet-purchases/analytics-report',
        params,
      }),
    }),
  }),
});

// Export hooks
export const {
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
} = fleetPurchasesApiSlice;

// Export the slice
export default fleetPurchasesApiSlice;
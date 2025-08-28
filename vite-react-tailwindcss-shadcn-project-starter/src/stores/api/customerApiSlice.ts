import { apiSlice } from './apiSlice';
import type {
  Customer,
  CustomerApiResponse,
  CustomerListResponse,
  CustomerLedgerResponse,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CreateCustomerLedgerRequest,
  CustomerFilters,
  ExportCustomersRequest,
} from '../../modules/customer/types';

export const customerApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all customers with filtering and pagination
    getCustomers: builder.query<CustomerListResponse, {
      page?: number;
      limit?: number;
      search?: string;
      filters?: CustomerFilters;
    }>({
      query: ({ page = 1, limit = 20, search = '', filters = {} } = {}) => ({
        url: '/customers',
        params: {
          page,
          limit,
          search,
          ...filters,
        },
      }),
      providesTags: (result) =>
        result?.customers
          ? [
              ...result.customers.map(({ customerId }) => ({ type: 'MRM' as const, id: customerId })),
              { type: 'MRM', id: 'CUSTOMER_LIST' },
            ]
          : [{ type: 'MRM', id: 'CUSTOMER_LIST' }],
    }),

    // Get single customer by ID
    getCustomerById: builder.query<CustomerApiResponse, string>({
      query: (id) => `/customers/${id}`,
      providesTags: (result, error, id) => [{ type: 'MRM', id }],
    }),

    // Create new customer
    createCustomer: builder.mutation<CustomerApiResponse, CreateCustomerRequest>({
      query: (customerData) => ({
        url: '/customers',
        method: 'POST',
        body: customerData,
      }),
      invalidatesTags: [{ type: 'MRM', id: 'CUSTOMER_LIST' }],
    }),

    // Update existing customer
    updateCustomer: builder.mutation<CustomerApiResponse, UpdateCustomerRequest>({
      query: ({ customerId, ...data }) => ({
        url: `/customers/${customerId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { customerId }) => [
        { type: 'MRM', id: customerId },
        { type: 'MRM', id: 'CUSTOMER_LIST' },
      ],
    }),

    // Delete customer (soft delete)
    deleteCustomer: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'MRM', id },
        { type: 'MRM', id: 'CUSTOMER_LIST' },
      ],
    }),

    // Check email existence
    checkEmailExistence: builder.query<{ exists: boolean }, string>({
      query: (email) => `/customers/checkEmail/${email}`,
    }),

    // Export customers
    exportCustomers: builder.mutation<Blob, ExportCustomersRequest>({
      query: (exportData) => ({
        url: '/customers/export',
        method: 'POST',
        body: exportData,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Customer Ledger endpoints
    getCustomerLedgers: builder.query<CustomerLedgerResponse, {
      customerId: string;
      page?: number;
      limit?: number;
    }>({
      query: ({ customerId, page = 1, limit = 50 }) => ({
        url: `/customerLedger/customer/${customerId}`,
        params: { page, limit },
      }),
      providesTags: (result, error, { customerId }) => [
        { type: 'MRM', id: `CUSTOMER_LEDGER_${customerId}` },
      ],
    }),

    // Create customer ledger entry
    createCustomerLedger: builder.mutation<{ message: string }, CreateCustomerLedgerRequest>({
      query: (ledgerData) => ({
        url: '/customerLedger',
        method: 'POST',
        body: ledgerData,
      }),
      invalidatesTags: (result, error, { customerId }) => [
        { type: 'MRM', id: `CUSTOMER_LEDGER_${customerId}` },
      ],
    }),

    // Bulk operations
    bulkDeleteCustomers: builder.mutation<{ message: string; deletedCount: number }, string[]>({
      query: (customerIds) => ({
        url: '/customers/bulk-delete',
        method: 'DELETE',
        body: { customerIds },
      }),
      invalidatesTags: [{ type: 'MRM', id: 'CUSTOMER_LIST' }],
    }),

    // Bulk status update
    bulkUpdateCustomerStatus: builder.mutation<
      { message: string; updatedCount: number },
      { customerIds: string[]; status: boolean }
    >({
      query: ({ customerIds, status }) => ({
        url: '/customers/bulk-status-update',
        method: 'PUT',
        body: { customerIds, status },
      }),
      invalidatesTags: [{ type: 'MRM', id: 'CUSTOMER_LIST' }],
    }),

    // Get customer statistics
    getCustomerStats: builder.query<{
      total: number;
      active: number;
      inactive: number;
      newThisMonth: number;
    }, { dateRange?: { from: string; to: string } }>({
      query: ({ dateRange } = {}) => ({
        url: '/customers/stats',
        params: dateRange,
      }),
      providesTags: [{ type: 'MRM', id: 'CUSTOMER_STATS' }],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useCheckEmailExistenceQuery,
  useExportCustomersMutation,
  useGetCustomerLedgersQuery,
  useCreateCustomerLedgerMutation,
  useBulkDeleteCustomersMutation,
  useBulkUpdateCustomerStatusMutation,
  useGetCustomerStatsQuery,
} = customerApiSlice;
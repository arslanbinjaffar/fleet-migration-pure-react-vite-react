import { apiSlice } from './apiSlice';
import type {
  LPO,
  LPOsResponse,
  LPOResponse,
  CreateLPORequest,
  UpdateLPORequest,
  LPOFilters,
  ExportLPOsRequest,
  Customer,
  SiteProject,
  Fleet,
} from '../../modules/lpos/types';

export const lposApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all LPOs with filtering and pagination
    getLPOs: builder.query<LPOsResponse, {
      page?: number;
      limit?: number;
      search?: string;
      filters?: LPOFilters;
    }>({
      query: ({ page = 1, limit = 10, search = '', filters = {} } = {}) => ({
        url: '/lpo',
        params: {
          page,
          limit,
          search,
          ...filters,
        },
      }),
      providesTags: (result) =>
        result?.lpos
          ? [
              ...result.lpos.map(({ lpoId }) => ({ type: 'MRM' as const, id: lpoId })),
              { type: 'MRM', id: 'LPO_LIST' },
            ]
          : [{ type: 'MRM', id: 'LPO_LIST' }],
    }),

    // Get single LPO by ID
    getLPOById: builder.query<LPOResponse, string>({
      query: (id) => `/lpo/details/${id}`,
      providesTags: (result, error, id) => [{ type: 'MRM', id }],
    }),

    // Create new LPO
    createLPO: builder.mutation<LPOResponse, CreateLPORequest>({
      query: (lpoData) => ({
        url: '/lpo/create',
        method: 'POST',
        body: lpoData,
      }),
      invalidatesTags: [{ type: 'MRM', id: 'LPO_LIST' }],
    }),

    // Update existing LPO
    updateLPO: builder.mutation<LPOResponse, UpdateLPORequest>({
      query: ({ lpoId, ...data }) => ({
        url: `/lpo/update/${lpoId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { lpoId }) => [
        { type: 'MRM', id: lpoId },
        { type: 'MRM', id: 'LPO_LIST' },
      ],
    }),

    // Delete LPO
    deleteLPO: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/lpo/delete/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'MRM', id },
        { type: 'MRM', id: 'LPO_LIST' },
      ],
    }),

    // Stop LPO
    stopLPO: builder.mutation<LPOResponse, string>({
      query: (id) => ({
        url: `/lpo/stopped/${id}`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'MRM', id },
        { type: 'MRM', id: 'LPO_LIST' },
      ],
    }),

    // Export LPOs
    exportLPOs: builder.mutation<Blob, ExportLPOsRequest>({
      query: (exportData) => ({
        url: '/lpo/export',
        method: 'POST',
        body: exportData,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Get customers for LPO creation
    getCustomers: builder.query<{ customers: Customer[] }, void>({
      query: () => '/customers',
      providesTags: [{ type: 'MRM', id: 'CUSTOMERS' }],
    }),

    // Get site projects for LPO creation
    getSiteProjects: builder.query<{ projects: SiteProject[] }, void>({
      query: () => '/site-project',
      providesTags: [{ type: 'MRM', id: 'SITE_PROJECTS' }],
    }),

    // Get available fleets for LPO creation
    getAvailableFleets: builder.query<{ fleets: Fleet[] }, void>({
      query: () => '/fleet?status=Available',
      providesTags: [{ type: 'MRM', id: 'AVAILABLE_FLEETS' }],
    }),

    // Bulk operations
    bulkDeleteLPOs: builder.mutation<{ message: string; deletedCount: number }, string[]>({
      query: (lpoIds) => ({
        url: '/lpo/bulk-delete',
        method: 'DELETE',
        body: { lpoIds },
      }),
      invalidatesTags: [{ type: 'MRM', id: 'LPO_LIST' }],
    }),

    // Bulk status update
    bulkUpdateLPOStatus: builder.mutation<
      { message: string; updatedCount: number },
      { lpoIds: string[]; status: string }
    >({
      query: ({ lpoIds, status }) => ({
        url: '/lpo/bulk-status-update',
        method: 'PUT',
        body: { lpoIds, status },
      }),
      invalidatesTags: [{ type: 'MRM', id: 'LPO_LIST' }],
    }),

    // Get LPO statistics
    getLPOStats: builder.query<{
      total: number;
      byStatus: Record<string, number>;
      totalValue: number;
      averageValue: number;
    }, { dateRange?: { from: string; to: string } }>({
      query: ({ dateRange } = {}) => ({
        url: '/lpo/stats',
        params: dateRange,
      }),
      providesTags: [{ type: 'MRM', id: 'LPO_STATS' }],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetLPOsQuery,
  useGetLPOByIdQuery,
  useCreateLPOMutation,
  useUpdateLPOMutation,
  useDeleteLPOMutation,
  useStopLPOMutation,
  useExportLPOsMutation,
  useGetCustomersQuery,
  useGetSiteProjectsQuery,
  useGetAvailableFleetsQuery,
  useBulkDeleteLPOsMutation,
  useBulkUpdateLPOStatusMutation,
  useGetLPOStatsQuery,
} = lposApiSlice;
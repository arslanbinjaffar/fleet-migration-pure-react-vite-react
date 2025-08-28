import { apiSlice } from './apiSlice';
import type {
  Fleet,
  FleetApiResponse,
  FleetListResponse,
  FleetTypesResponse,
  FleetFormData,
} from '../../modules/fleet/types';

export const fleetApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all fleets
    getFleets: builder.query<FleetListResponse, { page?: number; limit?: number; search?: string }>({
      query: ({ page = 1, limit = 10, search = '' } = {}) => ({
        url: '/fleet',
        params: { page, limit },
      }),
      providesTags: (result) =>
        result?.fleets
          ? [
              ...result.fleets.map(({ fleetId }) => ({ type: 'MRM' as const, id: fleetId })),
              { type: 'MRM', id: 'LIST' },
            ]
          : [{ type: 'MRM', id: 'LIST' }],
    }),

    // Get single fleet by ID
    getFleetById: builder.query<FleetApiResponse, string>({
      query: (id) => `/fleet/details/${id}`,
      providesTags: (result, error, id) => [{ type: 'MRM', id }],
    }),

    // Get fleet profit and loss
    getFleetProfitLoss: builder.query<any, string>({
      query: (id) => `/fleet/profit-loss/${id}`,
      providesTags: (result, error, id) => [{ type: 'MRM', id: `${id}-profit-loss` }],
    }),

    // Get fleet types
    getFleetTypes: builder.query<FleetTypesResponse, void>({
      query: () => '/fleet-type',
      providesTags: [{ type: 'MRM', id: 'FLEET_TYPES' }],
    }),

    // Create new fleet
    createFleet: builder.mutation<FleetApiResponse, FormData>({
      query: (fleetData) => ({
        url: '/fleet',
        method: 'POST',
        body: fleetData,
        formData: true,
      }),
      invalidatesTags: [{ type: 'MRM', id: 'LIST' }],
    }),

    // Update existing fleet
    updateFleet: builder.mutation<FleetApiResponse, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/fleet/update/${id}`,
        method: 'PUT',
        body: data,
        formData: true,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'MRM', id },
        { type: 'MRM', id: 'LIST' },
      ],
    }),

    // Delete fleet
    deleteFleet: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/fleet/delete/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'MRM', id },
        { type: 'MRM', id: 'LIST' },
      ],
    }),

    // Delete fleet attachment
    deleteFleetAttachment: builder.mutation<{ message: string }, string>({
      query: (attachmentId) => ({
        url: `/fleet/attachment/${attachmentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'MRM', id: 'LIST' }],
    }),

    // Upload fleet attachment
    uploadFleetAttachment: builder.mutation<any, { fleetId: string; formData: FormData }>({
      query: ({ fleetId, formData }) => ({
        url: `/fleet/${fleetId}/attachment`,
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: (result, error, { fleetId }) => [
        { type: 'MRM', id: fleetId },
        { type: 'MRM', id: 'LIST' },
      ],
    }),

    // Update fleet status
    updateFleetStatus: builder.mutation<FleetApiResponse, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/fleet/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'MRM', id },
        { type: 'MRM', id: 'LIST' },
      ],
    }),

    // Bulk delete fleets
    bulkDeleteFleets: builder.mutation<{ message: string }, string[]>({
      query: (fleetIds) => ({
        url: '/fleet/bulk-delete',
        method: 'DELETE',
        body: { fleetIds },
      }),
      invalidatesTags: [{ type: 'MRM', id: 'LIST' }],
    }),

    // Export fleets
    exportFleets: builder.mutation<Blob, { format: 'csv' | 'excel'; filters?: any }>({
      query: ({ format, filters }) => ({
        url: `/fleet/export/${format}`,
        method: 'POST',
        body: filters || {},
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetFleetsQuery,
  useGetFleetByIdQuery,
  useGetFleetProfitLossQuery,
  useGetFleetTypesQuery,
  useCreateFleetMutation,
  useUpdateFleetMutation,
  useDeleteFleetMutation,
  useDeleteFleetAttachmentMutation,
  useUploadFleetAttachmentMutation,
  useUpdateFleetStatusMutation,
  useBulkDeleteFleetsMutation,
  useExportFleetsMutation,
} = fleetApiSlice;

// Export endpoints for use in other parts of the app
export const {
  endpoints: {
    getFleets,
    getFleetById,
    getFleetProfitLoss,
    getFleetTypes,
    createFleet,
    updateFleet,
    deleteFleet,
    deleteFleetAttachment,
    uploadFleetAttachment,
    updateFleetStatus,
    bulkDeleteFleets,
    exportFleets,
  },
} = fleetApiSlice;
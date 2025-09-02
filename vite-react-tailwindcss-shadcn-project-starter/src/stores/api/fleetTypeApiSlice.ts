import { apiSlice } from './apiSlice';
import type {
  FleetType,
  FleetTypeFormData,
  FleetTypeUpdateData,
  FleetTypesResponse,
  FleetTypeResponse,
  FleetTypeSearchParams,
} from '../../modules/fleet-type/types';
import { FLEET_TYPE_ENDPOINTS } from '../../modules/fleet-type/constants';

// Fleet Type API slice
export const fleetTypeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all fleet types
    getFleetTypes: builder.query<FleetTypesResponse, FleetTypeSearchParams | void>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        if (params.search) searchParams.append('search', params.search);
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.sortBy) searchParams.append('sortBy', params.sortBy);
        if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
        
        const queryString = searchParams.toString();
        return `${FLEET_TYPE_ENDPOINTS.GET_FLEET_TYPES}${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response: any) => ({
        fleetTypes: response.fleetTypes || [],
        total: response.total || response.fleetTypes?.length || 0,
        page: response.page || 1,
        limit: response.limit || 10,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.fleetTypes.map(({ fleetTypeId }) => ({ type: 'FleetType' as const, id: fleetTypeId })),
              { type: 'FleetType', id: 'LIST' },
            ]
          : [{ type: 'FleetType', id: 'LIST' }],
    }),

    // Get single fleet type
    getFleetTypeById: builder.query<FleetType, string>({
      query: (fleetTypeId) => FLEET_TYPE_ENDPOINTS.GET_FLEET_TYPE_BY_ID(fleetTypeId),
      transformResponse: (response: any) => response.fleetType || response,
      providesTags: (result, error, id) => [{ type: 'FleetType', id }],
    }),

    // Create fleet type
    createFleetType: builder.mutation<FleetTypeResponse, FleetTypeFormData>({
      query: (data) => ({
        url: FLEET_TYPE_ENDPOINTS.CREATE_FLEET_TYPE,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'FleetType', id: 'LIST' }],
    }),

    // Update fleet type
    updateFleetType: builder.mutation<FleetTypeResponse, { id: string; data: FleetTypeUpdateData }>({
      query: ({ id, data }) => ({
        url: FLEET_TYPE_ENDPOINTS.UPDATE_FLEET_TYPE(id),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'FleetType', id },
        { type: 'FleetType', id: 'LIST' },
      ],
    }),

    // Delete fleet type
    deleteFleetType: builder.mutation<{ message: string }, string>({
      query: (fleetTypeId) => ({
        url: FLEET_TYPE_ENDPOINTS.DELETE_FLEET_TYPE(fleetTypeId),
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'FleetType', id },
        { type: 'FleetType', id: 'LIST' },
      ],
    }),

    // Bulk delete fleet types
    bulkDeleteFleetTypes: builder.mutation<{ message: string }, string[]>({
      query: (fleetTypeIds) => ({
        url: '/fleet-type/bulk-delete',
        method: 'DELETE',
        body: { fleetTypeIds },
      }),
      invalidatesTags: [{ type: 'FleetType', id: 'LIST' }],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetFleetTypesQuery,
  useGetFleetTypeByIdQuery,
  useCreateFleetTypeMutation,
  useUpdateFleetTypeMutation,
  useDeleteFleetTypeMutation,
  useBulkDeleteFleetTypesMutation,
} = fleetTypeApiSlice;

// Export the reducer
export default fleetTypeApiSlice.reducer;
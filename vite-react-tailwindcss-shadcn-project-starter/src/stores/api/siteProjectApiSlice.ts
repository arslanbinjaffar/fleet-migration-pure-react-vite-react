import { apiSlice } from './apiSlice';
import type {
  SiteProject,
  SiteProjectFormData,
  SiteProjectUpdateData,
  SiteProjectsResponse,
  SiteProjectResponse,
  SiteProjectSearchParams,
  SiteProjectFleets,
} from '../../modules/site-project/types';
import { SITE_PROJECT_ENDPOINTS } from '../../modules/site-project/constants';

// Site Project API slice
export const siteProjectApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all site projects
    getSiteProjects: builder.query<SiteProjectsResponse, SiteProjectSearchParams | void>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        if (params.search) searchParams.append('search', params.search);
        if (params.typeFilter && params.typeFilter !== 'all') {
          searchParams.append('typeFilter', params.typeFilter);
        }
        if (params.dateFrom) searchParams.append('dateFrom', params.dateFrom);
        if (params.dateTo) searchParams.append('dateTo', params.dateTo);
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.sortBy) searchParams.append('sortBy', params.sortBy);
        if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
        
        const queryString = searchParams.toString();
        return `${SITE_PROJECT_ENDPOINTS.GET_SITE_PROJECTS}${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response: any) => ({
        siteProjects: response.siteProjects || [],
        total: response.total || response.siteProjects?.length || 0,
        page: response.page || 1,
        limit: response.limit || 10,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.siteProjects.map(({ siteProjectId }) => ({ type: 'SiteProject' as const, id: siteProjectId })),
              { type: 'SiteProject', id: 'LIST' },
            ]
          : [{ type: 'SiteProject', id: 'LIST' }],
    }),

    // Get single site project
    getSiteProjectById: builder.query<SiteProject, string>({
      query: (siteProjectId) => SITE_PROJECT_ENDPOINTS.GET_SITE_PROJECT_BY_ID(siteProjectId),
      transformResponse: (response: any) => response.siteProject || response,
      providesTags: (result, error, id) => [{ type: 'SiteProject', id }],
    }),

    // Get site project fleets
    getSiteProjectFleets: builder.query<SiteProjectFleets, string>({
      query: (siteProjectId) => SITE_PROJECT_ENDPOINTS.GET_SITE_PROJECT_FLEETS(siteProjectId),
      transformResponse: (response: any) => ({
        assignedfleets: response.assignedfleets || [],
      }),
      providesTags: (result, error, id) => [{ type: 'SiteProject', id: `${id}-fleets` }],
    }),

    // Create site project
    createSiteProject: builder.mutation<SiteProjectResponse, SiteProjectFormData>({
      query: (data) => {
        // Transform dates to ISO format
        const payload = {
          ...data,
          startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
          expiryDate: data.expiryDate ? new Date(data.expiryDate).toISOString() : null,
        };
        
        return {
          url: SITE_PROJECT_ENDPOINTS.CREATE_SITE_PROJECT,
          method: 'POST',
          body: payload,
        };
      },
      invalidatesTags: [{ type: 'SiteProject', id: 'LIST' }],
    }),

    // Update site project
    updateSiteProject: builder.mutation<SiteProjectResponse, { id: string; data: SiteProjectUpdateData }>({
      query: ({ id, data }) => {
        // Transform dates to ISO format if they exist
        const payload = {
          ...data,
          ...(data.startDate && { startDate: new Date(data.startDate).toISOString() }),
          ...(data.expiryDate && { expiryDate: new Date(data.expiryDate).toISOString() }),
        };
        
        return {
          url: SITE_PROJECT_ENDPOINTS.UPDATE_SITE_PROJECT(id),
          method: 'PUT',
          body: payload,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'SiteProject', id },
        { type: 'SiteProject', id: 'LIST' },
        { type: 'SiteProject', id: `${id}-fleets` },
      ],
    }),

    // Delete site project
    deleteSiteProject: builder.mutation<{ message: string }, string>({
      query: (siteProjectId) => ({
        url: SITE_PROJECT_ENDPOINTS.DELETE_SITE_PROJECT(siteProjectId),
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'SiteProject', id },
        { type: 'SiteProject', id: 'LIST' },
        { type: 'SiteProject', id: `${id}-fleets` },
      ],
    }),

    // Bulk delete site projects
    bulkDeleteSiteProjects: builder.mutation<{ message: string }, string[]>({
      query: (siteProjectIds) => ({
        url: '/site-project/bulk-delete',
        method: 'DELETE',
        body: { siteProjectIds },
      }),
      invalidatesTags: [{ type: 'SiteProject', id: 'LIST' }],
    }),

    // Get project types (for filtering)
    getProjectTypes: builder.query<string[], void>({
      query: () => '/site-project/types',
      transformResponse: (response: any) => response.types || [],
      providesTags: [{ type: 'SiteProject', id: 'TYPES' }],
    }),

    // Get project statistics
    getSiteProjectStats: builder.query<any, void>({
      query: () => '/site-project/stats',
      providesTags: [{ type: 'SiteProject', id: 'STATS' }],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetSiteProjectsQuery,
  useGetSiteProjectByIdQuery,
  useGetSiteProjectFleetsQuery,
  useCreateSiteProjectMutation,
  useUpdateSiteProjectMutation,
  useDeleteSiteProjectMutation,
  useBulkDeleteSiteProjectsMutation,
  useGetProjectTypesQuery,
  useGetSiteProjectStatsQuery,
} = siteProjectApiSlice;

// Export the reducer
export default siteProjectApiSlice.reducer;
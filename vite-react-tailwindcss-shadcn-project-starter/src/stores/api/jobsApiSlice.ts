import { apiSlice } from './apiSlice';
import type {
  Job,
  JobApiResponse,
  JobListResponse,
  JobDetailsResponse,
  JobFormData,
  JobSearchParams,
  ManualTechnician,
} from '../../modules/jobs/types';

export const jobsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all jobs
    getJobs: builder.query<JobListResponse, JobSearchParams>(
      {
        query: ({ page = 1, limit = 10, search = '', filters = {}, sortBy = 'createdAt', sortOrder = 'desc' } = {}) => ({
          url: '/jobs',
          params: {
            page,
            limit,
            search,
            sortBy,
            sortOrder,
            ...filters,
          },
        }),
        providesTags: (result) =>
          result?.jobs
            ? [
                ...result.jobs.map(({ jobId }) => ({ type: 'Job' as const, id: jobId })),
                { type: 'Job', id: 'LIST' },
              ]
            : [{ type: 'Job', id: 'LIST' }],
      }
    ),

    // Get single job by ID
    getJobById: builder.query<JobApiResponse, string>({
      query: (id) => `/job/details/${id}`,
      providesTags: (result, error, id) => [{ type: 'Job', id }],
    }),

    // Get job details with related data
    getJobDetails: builder.query<JobDetailsResponse, string>({
      query: (id) => `/job/details/${id}`,
      providesTags: (result, error, id) => [
        { type: 'Job', id },
        { type: 'Job', id: `${id}-details` },
      ],
    }),

    // Create new job
    createJob: builder.mutation<JobApiResponse, JobFormData>({
      query: (jobData) => ({
        url: '/job/create',
        method: 'POST',
        body: jobData,
      }),
      invalidatesTags: [{ type: 'Job', id: 'LIST' }],
    }),

    // Update job
    updateJob: builder.mutation<JobApiResponse, { id: string; data: Partial<JobFormData> }>({
      query: ({ id, data }) => ({
        url: `/job/update/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Job', id },
        { type: 'Job', id: 'LIST' },
        { type: 'Job', id: `${id}-details` },
      ],
    }),

    // Delete job
    deleteJob: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/job/delete/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Job', id },
        { type: 'Job', id: 'LIST' },
      ],
    }),

    // Assign technician to job
    assignTechnician: builder.mutation<JobApiResponse, { jobId: string; technicianId: string }>({
      query: ({ jobId, technicianId }) => ({
        url: `/job/update/${jobId}`,
        method: 'PUT',
        body: { technician: technicianId },
      }),
      invalidatesTags: (result, error, { jobId }) => [
        { type: 'Job', id: jobId },
        { type: 'Job', id: 'LIST' },
      ],
    }),

    // Assign manual technician to job
    assignManualTechnician: builder.mutation<JobApiResponse, { jobId: string; manualTechnician: ManualTechnician }>({
      query: ({ jobId, manualTechnician }) => ({
        url: `/job/update/${jobId}`,
        method: 'PUT',
        body: { manualTechnician },
      }),
      invalidatesTags: (result, error, { jobId }) => [
        { type: 'Job', id: jobId },
        { type: 'Job', id: 'LIST' },
      ],
    }),

    // Clear technician assignment
    clearTechnician: builder.mutation<JobApiResponse, string>({
      query: (jobId) => ({
        url: `/job/update/${jobId}`,
        method: 'PUT',
        body: {
          technician: null,
          manualTechnician: null,
        },
      }),
      invalidatesTags: (result, error, jobId) => [
        { type: 'Job', id: jobId },
        { type: 'Job', id: 'LIST' },
      ],
    }),

    // Update job status
    updateJobStatus: builder.mutation<JobApiResponse, { id: string; status: string; secondaryStatus?: string }>({
      query: ({ id, status, secondaryStatus }) => ({
        url: `/job/update/${id}`,
        method: 'PUT',
        body: {
          status,
          ...(secondaryStatus && { secondaryStatus }),
        },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Job', id },
        { type: 'Job', id: 'LIST' },
      ],
    }),

    // Bulk delete jobs
    bulkDeleteJobs: builder.mutation<{ message: string }, string[]>({
      query: (jobIds) => ({
        url: '/jobs/bulk-delete',
        method: 'DELETE',
        body: { jobIds },
      }),
      invalidatesTags: [{ type: 'Job', id: 'LIST' }],
    }),

    // Bulk update job status
    bulkUpdateJobStatus: builder.mutation<{ message: string }, { jobIds: string[]; status: string }>({
      query: ({ jobIds, status }) => ({
        url: '/jobs/bulk-update-status',
        method: 'PUT',
        body: { jobIds, status },
      }),
      invalidatesTags: [{ type: 'Job', id: 'LIST' }],
    }),

    // Bulk assign technician
    bulkAssignTechnician: builder.mutation<{ message: string }, { jobIds: string[]; technicianId: string }>({
      query: ({ jobIds, technicianId }) => ({
        url: '/jobs/bulk-assign-technician',
        method: 'PUT',
        body: { jobIds, technicianId },
      }),
      invalidatesTags: [{ type: 'Job', id: 'LIST' }],
    }),

    // Export jobs
    exportJobs: builder.mutation<Blob, { format: 'csv' | 'excel'; filters?: any }>({
      query: ({ format, filters }) => ({
        url: `/jobs/export/${format}`,
        method: 'POST',
        body: filters || {},
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Get job statistics
    getJobStatistics: builder.query<any, { dateFrom?: string; dateTo?: string }>({
      query: ({ dateFrom, dateTo } = {}) => ({
        url: '/jobs/statistics',
        params: {
          ...(dateFrom && { dateFrom }),
          ...(dateTo && { dateTo }),
        },
      }),
      providesTags: [{ type: 'Job', id: 'STATISTICS' }],
    }),

    // Get jobs by customer
    getJobsByCustomer: builder.query<JobListResponse, { customerId: string; page?: number; limit?: number }>({
      query: ({ customerId, page = 1, limit = 10 }) => ({
        url: `/jobs/customer/${customerId}`,
        params: { page, limit },
      }),
      providesTags: (result, error, { customerId }) => [
        { type: 'Job', id: `CUSTOMER-${customerId}` },
      ],
    }),

    // Get jobs by fleet
    getJobsByFleet: builder.query<JobListResponse, { fleetId: string; page?: number; limit?: number }>({
      query: ({ fleetId, page = 1, limit = 10 }) => ({
        url: `/jobs/fleet/${fleetId}`,
        params: { page, limit },
      }),
      providesTags: (result, error, { fleetId }) => [
        { type: 'Job', id: `FLEET-${fleetId}` },
      ],
    }),

    // Get jobs by technician
    getJobsByTechnician: builder.query<JobListResponse, { technicianId: string; page?: number; limit?: number }>({
      query: ({ technicianId, page = 1, limit = 10 }) => ({
        url: `/jobs/technician/${technicianId}`,
        params: { page, limit },
      }),
      providesTags: (result, error, { technicianId }) => [
        { type: 'Job', id: `TECHNICIAN-${technicianId}` },
      ],
    }),

    // Search jobs
    searchJobs: builder.query<JobListResponse, { query: string; filters?: any }>({
      query: ({ query, filters = {} }) => ({
        url: '/jobs/search',
        params: {
          q: query,
          ...filters,
        },
      }),
      providesTags: [{ type: 'Job', id: 'SEARCH' }],
    }),
  }),
});

// Export hooks
export const {
  useGetJobsQuery,
  useGetJobByIdQuery,
  useGetJobDetailsQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation,
  useAssignTechnicianMutation,
  useAssignManualTechnicianMutation,
  useClearTechnicianMutation,
  useUpdateJobStatusMutation,
  useBulkDeleteJobsMutation,
  useBulkUpdateJobStatusMutation,
  useBulkAssignTechnicianMutation,
  useExportJobsMutation,
  useGetJobStatisticsQuery,
  useGetJobsByCustomerQuery,
  useGetJobsByFleetQuery,
  useGetJobsByTechnicianQuery,
  useSearchJobsQuery,
} = jobsApiSlice;

// Export endpoints
export const {
  endpoints: {
    getJobs,
    getJobById,
    getJobDetails,
    createJob,
    updateJob,
    deleteJob,
    assignTechnician,
    assignManualTechnician,
    clearTechnician,
    updateJobStatus,
    bulkDeleteJobs,
    bulkUpdateJobStatus,
    bulkAssignTechnician,
    exportJobs,
    getJobStatistics,
    getJobsByCustomer,
    getJobsByFleet,
    getJobsByTechnician,
    searchJobs,
  },
} = jobsApiSlice;
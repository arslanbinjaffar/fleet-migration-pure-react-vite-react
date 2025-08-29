import { apiSlice } from './apiSlice';
import type {
  RepairJob,
  RepairJobsResponse,
  RepairJobDetailsResponse,
  RepairFormData,
  RepairStatus,
  RepairFilters,
} from '../../modules/repairs/types';

export const repairsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all repair jobs (tracking-jobs endpoint)
    getRepairJobs: builder.query<RepairJobsResponse, RepairFilters & { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10, search = '', statusFilter = 'all', dateRange, ...filters } = {}) => {
        const params: any = {
          page,
          limit,
          search,
          ...filters,
        };
        
        if (statusFilter !== 'all') {
          params.status = statusFilter;
        }
        
        if (dateRange?.from) {
          params.dateFrom = dateRange.from.toISOString();
        }
        
        if (dateRange?.to) {
          params.dateTo = dateRange.to.toISOString();
        }
        
        return {
          url: '/tracking-jobs',
          params,
        };
      },
      providesTags: (result) =>
        result?.jobs
          ? [
              ...result.jobs.map(({ jobId }) => ({ type: 'RepairJob' as const, id: jobId })),
              { type: 'RepairJob', id: 'LIST' },
            ]
          : [{ type: 'RepairJob', id: 'LIST' }],
    }),

    // Get single repair job details
    getRepairJobDetails: builder.query<RepairJobDetailsResponse, string>({
      query: (jobId) => `/job/details/${jobId}`,
      providesTags: (result, error, jobId) => [
        { type: 'RepairJob', id: jobId },
        { type: 'RepairJob', id: `${jobId}-details` },
      ],
    }),

    // Update repair job status
    updateRepairJobStatus: builder.mutation<{ message: string }, { jobId: string; status: RepairStatus }>({
      query: ({ jobId, status }) => ({
        url: `/job/update/${jobId}/${status}`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, { jobId }) => [
        { type: 'RepairJob', id: jobId },
        { type: 'RepairJob', id: 'LIST' },
        { type: 'RepairJob', id: `${jobId}-details` },
      ],
    }),

    // Update repair job with form data (for inspection, diagnosis, etc.)
    updateRepairJob: builder.mutation<{ message: string }, { jobId: string; status: RepairStatus; formData: FormData }>({
      query: ({ jobId, status, formData }) => ({
        url: `/job/update/${jobId}/${status}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: (result, error, { jobId }) => [
        { type: 'RepairJob', id: jobId },
        { type: 'RepairJob', id: 'LIST' },
        { type: 'RepairJob', id: `${jobId}-details` },
      ],
    }),

    // Get repair job statistics
    getRepairStatistics: builder.query<any, { dateFrom?: string; dateTo?: string; status?: RepairStatus }>({
      query: ({ dateFrom, dateTo, status } = {}) => ({
        url: '/repair-jobs/statistics',
        params: {
          ...(dateFrom && { dateFrom }),
          ...(dateTo && { dateTo }),
          ...(status && { status }),
        },
      }),
      providesTags: [{ type: 'RepairJob', id: 'STATISTICS' }],
    }),

    // Get repair jobs by status
    getRepairJobsByStatus: builder.query<RepairJobsResponse, { status: RepairStatus; page?: number; limit?: number }>({
      query: ({ status, page = 1, limit = 10 }) => ({
        url: '/tracking-jobs',
        params: {
          status,
          page,
          limit,
        },
      }),
      providesTags: (result, error, { status }) => [
        { type: 'RepairJob', id: `STATUS-${status}` },
      ],
    }),

    // Get repair jobs by customer
    getRepairJobsByCustomer: builder.query<RepairJobsResponse, { customerId: string; page?: number; limit?: number }>({
      query: ({ customerId, page = 1, limit = 10 }) => ({
        url: `/tracking-jobs/customer/${customerId}`,
        params: { page, limit },
      }),
      providesTags: (result, error, { customerId }) => [
        { type: 'RepairJob', id: `CUSTOMER-${customerId}` },
      ],
    }),

    // Get repair jobs by fleet/vehicle
    getRepairJobsByFleet: builder.query<RepairJobsResponse, { fleetId: string; page?: number; limit?: number }>({
      query: ({ fleetId, page = 1, limit = 10 }) => ({
        url: `/tracking-jobs/fleet/${fleetId}`,
        params: { page, limit },
      }),
      providesTags: (result, error, { fleetId }) => [
        { type: 'RepairJob', id: `FLEET-${fleetId}` },
      ],
    }),

    // Get repair jobs by technician
    getRepairJobsByTechnician: builder.query<RepairJobsResponse, { technicianId: string; page?: number; limit?: number }>({
      query: ({ technicianId, page = 1, limit = 10 }) => ({
        url: `/tracking-jobs/technician/${technicianId}`,
        params: { page, limit },
      }),
      providesTags: (result, error, { technicianId }) => [
        { type: 'RepairJob', id: `TECHNICIAN-${technicianId}` },
      ],
    }),

    // Search repair jobs
    searchRepairJobs: builder.query<RepairJobsResponse, { query: string; filters?: Partial<RepairFilters> }>({
      query: ({ query, filters = {} }) => ({
        url: '/tracking-jobs/search',
        params: {
          q: query,
          ...filters,
        },
      }),
      providesTags: [{ type: 'RepairJob', id: 'SEARCH' }],
    }),

    // Export repair jobs
    exportRepairJobs: builder.mutation<Blob, { format: 'csv' | 'excel'; filters?: Partial<RepairFilters> }>({
      query: ({ format, filters }) => ({
        url: `/tracking-jobs/export/${format}`,
        method: 'POST',
        body: filters || {},
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Bulk update repair job status
    bulkUpdateRepairJobStatus: builder.mutation<{ message: string }, { jobIds: string[]; status: RepairStatus }>({
      query: ({ jobIds, status }) => ({
        url: '/tracking-jobs/bulk-update-status',
        method: 'PUT',
        body: { jobIds, status },
      }),
      invalidatesTags: [{ type: 'RepairJob', id: 'LIST' }],
    }),

    // Get repair job timeline/history
    getRepairJobTimeline: builder.query<any[], string>({
      query: (jobId) => `/job/${jobId}/timeline`,
      providesTags: (result, error, jobId) => [
        { type: 'RepairJob', id: `${jobId}-timeline` },
      ],
    }),

    // Add inspection data to repair job
    addInspectionData: builder.mutation<{ message: string }, { jobId: string; inspectionData: FormData }>({
      query: ({ jobId, inspectionData }) => ({
        url: `/job/update/${jobId}/Inspection`,
        method: 'PUT',
        body: inspectionData,
      }),
      invalidatesTags: (result, error, { jobId }) => [
        { type: 'RepairJob', id: jobId },
        { type: 'RepairJob', id: 'LIST' },
        { type: 'RepairJob', id: `${jobId}-details` },
      ],
    }),

    // Add diagnosis data to repair job
    addDiagnosisData: builder.mutation<{ message: string }, { jobId: string; diagnosisData: FormData }>({
      query: ({ jobId, diagnosisData }) => ({
        url: `/job/update/${jobId}/Diagnosis`,
        method: 'PUT',
        body: diagnosisData,
      }),
      invalidatesTags: (result, error, { jobId }) => [
        { type: 'RepairJob', id: jobId },
        { type: 'RepairJob', id: 'LIST' },
        { type: 'RepairJob', id: `${jobId}-details` },
      ],
    }),

    // Complete repair job
    completeRepairJob: builder.mutation<{ message: string }, { jobId: string; completionData: FormData }>({
      query: ({ jobId, completionData }) => ({
        url: `/job/update/${jobId}/Completed`,
        method: 'PUT',
        body: completionData,
      }),
      invalidatesTags: (result, error, { jobId }) => [
        { type: 'RepairJob', id: jobId },
        { type: 'RepairJob', id: 'LIST' },
        { type: 'RepairJob', id: `${jobId}-details` },
      ],
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetRepairJobsQuery,
  useGetRepairJobDetailsQuery,
  useUpdateRepairJobStatusMutation,
  useUpdateRepairJobMutation,
  useGetRepairStatisticsQuery,
  useGetRepairJobsByStatusQuery,
  useGetRepairJobsByCustomerQuery,
  useGetRepairJobsByFleetQuery,
  useGetRepairJobsByTechnicianQuery,
  useSearchRepairJobsQuery,
  useExportRepairJobsMutation,
  useBulkUpdateRepairJobStatusMutation,
  useGetRepairJobTimelineQuery,
  useAddInspectionDataMutation,
  useAddDiagnosisDataMutation,
  useCompleteRepairJobMutation,
} = repairsApiSlice;

// Export endpoints for use in other slices
export const {
  endpoints: {
    getRepairJobs,
    getRepairJobDetails,
    updateRepairJobStatus,
    updateRepairJob,
    getRepairStatistics,
    getRepairJobsByStatus,
    getRepairJobsByCustomer,
    getRepairJobsByFleet,
    getRepairJobsByTechnician,
    searchRepairJobs,
    exportRepairJobs,
    bulkUpdateRepairJobStatus,
    getRepairJobTimeline,
    addInspectionData,
    addDiagnosisData,
    completeRepairJob,
  },
} = repairsApiSlice;
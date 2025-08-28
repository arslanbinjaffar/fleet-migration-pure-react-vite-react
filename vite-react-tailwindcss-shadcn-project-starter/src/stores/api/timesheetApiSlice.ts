import { apiSlice } from './apiSlice';
import { 
  ScheduledShift,
  TimesheetApiResponse,
  TimesheetListResponse,
  ShiftRelatedDetailsResponse,
  CreateScheduledShiftRequest,
  UpdateScheduledShiftRequest,
  UpdateShiftStatusRequest,
  UpdateTimesheetRequest,
  TimesheetFilters,
  ExportTimesheetRequest,
} from '../../modules/timesheet/types';

export const timesheetApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get scheduled shifts with optional date range
    getScheduledShifts: builder.query<TimesheetApiResponse, { from?: string; to?: string }>(
      {
        query: ({ from, to }) => {
          let url = 'shedule-shift-daily';
          if (from && to) {
            url += `?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
          }
          return url;
        },
        providesTags: (result) =>
          result
            ? [
                ...result.shifts.map(({ scheduledFleetId }) => ({
                  type: 'ScheduledShift' as const,
                  id: scheduledFleetId,
                })),
                { type: 'ScheduledShift', id: 'LIST' },
              ]
            : [{ type: 'ScheduledShift', id: 'LIST' }],
      }
    ),

    // Get shift related details (sites, fleets, operators)
    getShiftRelatedDetails: builder.query<ShiftRelatedDetailsResponse, void>({
      query: () => 'shedule-shift/shift-related-details',
      providesTags: [
        { type: 'SiteProject', id: 'LIST' },
        { type: 'Fleet', id: 'LIST' },
        { type: 'Operator', id: 'LIST' },
      ],
    }),

    // Create a new scheduled shift
    createScheduledShift: builder.mutation<
      { success: boolean; message: string; shift?: ScheduledShift },
      CreateScheduledShiftRequest
    >({
      query: (shiftData) => ({
        url: 'shedule-shift/create',
        method: 'POST',
        body: shiftData,
      }),
      invalidatesTags: [
        { type: 'ScheduledShift', id: 'LIST' },
        { type: 'TimesheetStats', id: 'STATS' },
      ],
    }),

    // Update a scheduled shift
    updateScheduledShift: builder.mutation<
      { success: boolean; message: string; shift?: ScheduledShift },
      UpdateScheduledShiftRequest
    >({
      query: ({ scheduledFleetId, ...shiftData }) => ({
        url: `shedule-shift/update/${scheduledFleetId}`,
        method: 'PUT',
        body: shiftData,
      }),
      invalidatesTags: (result, error, { scheduledFleetId }) => [
        { type: 'ScheduledShift', id: scheduledFleetId },
        { type: 'ScheduledShift', id: 'LIST' },
        { type: 'TimesheetStats', id: 'STATS' },
      ],
    }),

    // Update shift status
    updateShiftStatus: builder.mutation<
      { success: boolean; message: string },
      UpdateShiftStatusRequest
    >({
      query: ({ scheduledFleetId, status }) => ({
        url: `shedule-shift/update-status/${scheduledFleetId}`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (result, error, { scheduledFleetId }) => [
        { type: 'ScheduledShift', id: scheduledFleetId },
        { type: 'ScheduledShift', id: 'LIST' },
        { type: 'TimesheetStats', id: 'STATS' },
      ],
    }),

    // Update shift type
    updateShiftType: builder.mutation<
      { success: boolean; message: string },
      { scheduledFleetId: string; shiftType: 'single' | 'double' }
    >({
      query: ({ scheduledFleetId, shiftType }) => ({
        url: `shedule-shift/update-type/${scheduledFleetId}`,
        method: 'PATCH',
        body: { shiftType },
      }),
      invalidatesTags: (result, error, { scheduledFleetId }) => [
        { type: 'ScheduledShift', id: scheduledFleetId },
        { type: 'ScheduledShift', id: 'LIST' },
      ],
    }),

    // Update timesheet
    updateTimesheet: builder.mutation<
      { success: boolean; message: string },
      UpdateTimesheetRequest
    >({
      query: ({ scheduledFleetId, ...timesheetData }) => ({
        url: `timesheet/update/${scheduledFleetId}`,
        method: 'PUT',
        body: timesheetData,
      }),
      invalidatesTags: (result, error, { scheduledFleetId }) => [
        { type: 'ScheduledShift', id: scheduledFleetId },
        { type: 'ScheduledShift', id: 'LIST' },
        { type: 'TimesheetStats', id: 'STATS' },
      ],
    }),

    // Delete a scheduled shift
    deleteScheduledShift: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (scheduledFleetId) => ({
        url: `shedule-shift/delete/${scheduledFleetId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, scheduledFleetId) => [
        { type: 'ScheduledShift', id: scheduledFleetId },
        { type: 'ScheduledShift', id: 'LIST' },
        { type: 'TimesheetStats', id: 'STATS' },
      ],
    }),

    // Export timesheets
    exportTimesheets: builder.mutation<
      Blob,
      ExportTimesheetRequest
    >({
      query: (exportData) => ({
        url: 'timesheets/export',
        method: 'POST',
        body: exportData,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Get timesheet statistics
    getTimesheetStats: builder.query<
      {
        totalShifts: number;
        workingShifts: number;
        standbyShifts: number;
        outOfServiceShifts: number;
        totalMachineHours: number;
        totalOperatorHours: number;
        averageHoursPerShift: number;
      },
      { from?: string; to?: string }
    >({
      query: ({ from, to }) => {
        let url = 'timesheets/stats';
        if (from && to) {
          url += `?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
        }
        return url;
      },
      providesTags: [{ type: 'TimesheetStats', id: 'STATS' }],
    }),

    // Bulk update shift status
    bulkUpdateShiftStatus: builder.mutation<
      { success: boolean; message: string; updated: number },
      { scheduledFleetIds: string[]; status: string }
    >({
      query: ({ scheduledFleetIds, status }) => ({
        url: 'shedule-shift/bulk-update-status',
        method: 'PUT',
        body: { scheduledFleetIds, status },
      }),
      invalidatesTags: [
        { type: 'ScheduledShift', id: 'LIST' },
        { type: 'TimesheetStats', id: 'STATS' },
      ],
    }),

    // Bulk delete shifts
    bulkDeleteShifts: builder.mutation<
      { success: boolean; message: string; deleted: number },
      string[]
    >({
      query: (scheduledFleetIds) => ({
        url: 'shedule-shift/bulk-delete',
        method: 'DELETE',
        body: { scheduledFleetIds },
      }),
      invalidatesTags: [
        { type: 'ScheduledShift', id: 'LIST' },
        { type: 'TimesheetStats', id: 'STATS' },
      ],
    }),

    // Replicate shifts (create multiple shifts based on template)
    replicateShifts: builder.mutation<
      { success: boolean; message: string; shifts: ScheduledShift[] },
      {
        templateShiftId: string;
        dates: string[];
        options?: {
          includeOperators?: boolean;
          includeTimesheet?: boolean;
        };
      }
    >({
      query: ({ templateShiftId, dates, options }) => ({
        url: 'shedule-shift/replicate',
        method: 'POST',
        body: { templateShiftId, dates, options },
      }),
      invalidatesTags: [
        { type: 'ScheduledShift', id: 'LIST' },
        { type: 'TimesheetStats', id: 'STATS' },
      ],
    }),

    // Get shift by ID
    getScheduledShiftById: builder.query<
      { shift: ScheduledShift },
      string
    >({
      query: (scheduledFleetId) => `shedule-shift/${scheduledFleetId}`,
      providesTags: (result, error, scheduledFleetId) => [
        { type: 'ScheduledShift', id: scheduledFleetId },
      ],
    }),

    // Check shift conflicts
    checkShiftConflicts: builder.query<
      {
        hasConflicts: boolean;
        conflicts: {
          type: 'fleet' | 'operator';
          message: string;
          conflictingShift: ScheduledShift;
        }[];
      },
      {
        fleetId: string;
        operatorIds: string[];
        startTime: string;
        endTime: string;
        excludeShiftId?: string;
      }
    >({
      query: (conflictData) => ({
        url: 'shedule-shift/check-conflicts',
        method: 'POST',
        body: conflictData,
      }),
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetScheduledShiftsQuery,
  useGetShiftRelatedDetailsQuery,
  useCreateScheduledShiftMutation,
  useUpdateScheduledShiftMutation,
  useUpdateShiftStatusMutation,
  useUpdateShiftTypeMutation,
  useUpdateTimesheetMutation,
  useDeleteScheduledShiftMutation,
  useExportTimesheetsMutation,
  useGetTimesheetStatsQuery,
  useBulkUpdateShiftStatusMutation,
  useBulkDeleteShiftsMutation,
  useReplicateShiftsMutation,
  useGetScheduledShiftByIdQuery,
  useCheckShiftConflictsQuery,
  useLazyGetScheduledShiftsQuery,
  useLazyGetTimesheetStatsQuery,
  useLazyCheckShiftConflictsQuery,
} = timesheetApiSlice;
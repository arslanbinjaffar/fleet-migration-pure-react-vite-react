import { z } from 'zod';

// Timesheet validation schema
export const timesheetSchema = z.object({
  selectedSite: z.object({
    value: z.string().min(1, 'Site is required'),
    label: z.string(),
  }).nullable().refine(val => val !== null, 'Site selection is required'),
  
  selectedFleet: z.object({
    value: z.string().min(1, 'Fleet is required'),
    label: z.string(),
  }).nullable().refine(val => val !== null, 'Fleet selection is required'),
  
  firstOperator: z.object({
    value: z.string().min(1, 'First operator is required'),
    label: z.string(),
  }).nullable().refine(val => val !== null, 'First operator is required'),
  
  secondOperator: z.object({
    value: z.string(),
    label: z.string(),
  }).nullable().optional(),
  
  shiftType: z.enum(['single', 'double'], {
    required_error: 'Shift type is required',
  }),
  
  firstOperatorStartDateTime: z.string().min(1, 'First operator start time is required'),
  firstOperatorEndDateTime: z.string().min(1, 'First operator end time is required'),
  
  secondOperatorStartDateTime: z.string().optional(),
  secondOperatorEndDateTime: z.string().optional(),
  
  machineStartTime: z.string().min(1, 'Machine start time is required'),
  machineEndTime: z.string().min(1, 'Machine end time is required'),
  
  comment: z.string().optional(),
}).refine(
  (data) => {
    if (data.shiftType === 'double') {
      return data.secondOperator !== null && 
             data.secondOperatorStartDateTime && 
             data.secondOperatorEndDateTime;
    }
    return true;
  },
  {
    message: 'Second operator and times are required for double shifts',
    path: ['secondOperator'],
  }
).refine(
  (data) => {
    // Validate that end time is after start time for first operator
    if (data.firstOperatorStartDateTime && data.firstOperatorEndDateTime) {
      return new Date(data.firstOperatorEndDateTime) > new Date(data.firstOperatorStartDateTime);
    }
    return true;
  },
  {
    message: 'End time must be after start time',
    path: ['firstOperatorEndDateTime'],
  }
).refine(
  (data) => {
    // Validate that machine end time is after start time
    if (data.machineStartTime && data.machineEndTime) {
      return new Date(data.machineEndTime) > new Date(data.machineStartTime);
    }
    return true;
  },
  {
    message: 'Machine end time must be after start time',
    path: ['machineEndTime'],
  }
);

// Create scheduled shift schema
export const createScheduledShiftSchema = z.object({
  fleetId: z.string().uuid('Invalid fleet ID').min(1, 'Fleet is required'),
  siteProjectId: z.string().uuid('Invalid site project ID').min(1, 'Site project is required'),
  lpoId: z.string().uuid('Invalid LPO ID').optional(),
  firstOperatorId: z.string().uuid('Invalid operator ID').optional(),
  secondOperatorId: z.string().uuid('Invalid operator ID').optional(),
  shiftType: z.enum(['single', 'double'], {
    required_error: 'Shift type is required',
  }),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  firstOperatorStartDateTime: z.string().optional(),
  firstOperatorEndDateTime: z.string().optional(),
  secondOperatorStartDateTime: z.string().optional(),
  secondOperatorEndDateTime: z.string().optional(),
  comment: z.string().optional(),
});

// Update scheduled shift schema
export const updateScheduledShiftSchema = createScheduledShiftSchema.partial().extend({
  scheduledFleetId: z.string().uuid('Invalid scheduled fleet ID'),
});

// Update shift status schema
export const updateShiftStatusSchema = z.object({
  scheduledFleetId: z.string().uuid('Invalid scheduled fleet ID'),
  status: z.enum(['working', 'standby', 'Out of service', 'stopped'], {
    required_error: 'Status is required',
  }),
});

// Update timesheet schema
export const updateTimesheetSchema = z.object({
  scheduledFleetId: z.string().uuid('Invalid scheduled fleet ID'),
  machineStartTime: z.string().optional(),
  machineEndTime: z.string().optional(),
  firstOperatorStartDateTime: z.string().optional(),
  firstOperatorEndDateTime: z.string().optional(),
  secondOperatorStartDateTime: z.string().optional(),
  secondOperatorEndDateTime: z.string().optional(),
}).refine(
  (data) => {
    // At least one field should be provided
    return Object.values(data).some(value => value !== undefined && value !== '');
  },
  {
    message: 'At least one time field must be provided',
  }
);

// Timesheet filter schema
export const timesheetFilterSchema = z.object({
  status: z.enum(['all', 'working', 'standby', 'Out of service', 'stopped']).optional(),
  fleet: z.string().optional(),
  project: z.string().optional(),
  operator: z.string().optional(),
  customer: z.string().optional(),
  search: z.string().optional(),
  dateRange: z.object({
    from: z.string(),
    to: z.string(),
  }).optional(),
});

// Export form data types
export type TimesheetFormData = z.infer<typeof timesheetSchema>;
export type CreateScheduledShiftFormData = z.infer<typeof createScheduledShiftSchema>;
export type UpdateScheduledShiftFormData = z.infer<typeof updateScheduledShiftSchema>;
export type UpdateShiftStatusFormData = z.infer<typeof updateShiftStatusSchema>;
export type UpdateTimesheetFormData = z.infer<typeof updateTimesheetSchema>;
export type TimesheetFiltersFormData = z.infer<typeof timesheetFilterSchema>;

// Form sections for step-by-step validation
export const timesheetFormSections = {
  shiftDetails: {
    fields: ['selectedSite', 'selectedFleet', 'shiftType'],
    schema: timesheetSchema.pick({
      selectedSite: true,
      selectedFleet: true,
      shiftType: true,
    }),
  },
  operatorDetails: {
    fields: ['firstOperator', 'secondOperator'],
    schema: timesheetSchema.pick({
      firstOperator: true,
      secondOperator: true,
    }),
  },
  timeDetails: {
    fields: [
      'firstOperatorStartDateTime',
      'firstOperatorEndDateTime',
      'secondOperatorStartDateTime',
      'secondOperatorEndDateTime',
      'machineStartTime',
      'machineEndTime',
      'comment'
    ],
    schema: timesheetSchema.pick({
      firstOperatorStartDateTime: true,
      firstOperatorEndDateTime: true,
      secondOperatorStartDateTime: true,
      secondOperatorEndDateTime: true,
      machineStartTime: true,
      machineEndTime: true,
      comment: true,
    }),
  },
};
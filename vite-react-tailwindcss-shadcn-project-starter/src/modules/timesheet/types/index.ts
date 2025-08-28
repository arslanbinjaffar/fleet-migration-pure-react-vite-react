// Timesheet type definitions
export interface Operator {
  userId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

export interface Fleet {
  fleetId: string;
  vehicleName: string;
  plateNumber: string;
  fleetType?: {
    fleetType: string;
  };
}

export interface SiteProject {
  siteProjectId: string;
  projectName: string;
  location?: string;
  customerId?: string;
}

export interface LPO {
  lpoId: string;
  representativeName?: string;
  customerId?: string;
}

export interface Timesheet {
  timesheetId?: string;
  scheduledFleetId: string;
  totalMachineHours?: number;
  totalOperatorHours1?: number;
  totalOperatorHours2?: number;
  startTimeMachine?: string;
  endTimeMachine?: string;
  startTimeOperator1?: string;
  endTimeOperator1?: string;
  startTimeOperator2?: string;
  endTimeOperator2?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScheduledShift {
  scheduledFleetId: string;
  fleetId: string;
  siteProjectId: string;
  lpoId?: string;
  firstOperatorId?: string;
  secondOperatorId?: string;
  shiftType: 'single' | 'double';
  status: 'working' | 'standby' | 'Out of service' | 'stopped';
  comment?: string;
  scheduledDate: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Related data
  fleet?: Fleet;
  siteProject?: SiteProject;
  lpo?: LPO;
  FirstOperator?: Operator;
  SecondOperator?: Operator;
  timesheet?: Timesheet;
  todayDate?: string;
}

export interface TimesheetFormData {
  selectedSite: { value: string; label: string } | null;
  selectedFleet: { value: string; label: string } | null;
  firstOperator: { value: string; label: string } | null;
  secondOperator: { value: string; label: string } | null;
  shiftType: 'single' | 'double';
  firstOperatorStartDateTime: string;
  firstOperatorEndDateTime: string;
  secondOperatorStartDateTime: string;
  secondOperatorEndDateTime: string;
  machineStartTime: string;
  machineEndTime: string;
  comment?: string;
}

export interface CreateScheduledShiftRequest {
  fleetId: string;
  siteProjectId: string;
  lpoId?: string;
  firstOperatorId?: string;
  secondOperatorId?: string;
  shiftType: 'single' | 'double';
  scheduledDate: string;
  firstOperatorStartDateTime?: string;
  firstOperatorEndDateTime?: string;
  secondOperatorStartDateTime?: string;
  secondOperatorEndDateTime?: string;
  comment?: string;
}

export interface UpdateScheduledShiftRequest extends Partial<CreateScheduledShiftRequest> {
  scheduledFleetId: string;
}

export interface UpdateShiftStatusRequest {
  scheduledFleetId: string;
  status: 'working' | 'standby' | 'Out of service' | 'stopped';
}

export interface UpdateTimesheetRequest {
  scheduledFleetId: string;
  machineStartTime?: string;
  machineEndTime?: string;
  firstOperatorStartDateTime?: string;
  firstOperatorEndDateTime?: string;
  secondOperatorStartDateTime?: string;
  secondOperatorEndDateTime?: string;
}

export interface TimesheetApiResponse {
  shifts: ScheduledShift[];
  timeSheet: Timesheet[];
  todayDate: string;
  message?: string;
}

export interface TimesheetListResponse {
  shifts: ScheduledShift[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface ShiftRelatedDetailsResponse {
  siteProjects: SiteProject[];
  fleets: Fleet[];
  operators: Operator[];
}

export interface TimesheetFilters {
  status?: 'all' | 'working' | 'standby' | 'Out of service' | 'stopped';
  fleet?: string;
  project?: string;
  operator?: string;
  customer?: string;
  search?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface ExportTimesheetRequest {
  format: 'csv' | 'excel';
  filters?: TimesheetFilters;
  fields?: string[];
}

// Form validation types
export interface TimesheetFormErrors {
  [key: string]: string | undefined;
}

// Timesheet statistics
export interface TimesheetStats {
  totalShifts: number;
  workingShifts: number;
  standbyShifts: number;
  outOfServiceShifts: number;
  totalMachineHours: number;
  totalOperatorHours: number;
  averageHoursPerShift: number;
}

// Status options
export interface StatusOption {
  value: string;
  label: string;
  color: string;
  bgColor?: string;
}

// Filter options
export interface FilterOption {
  value: string;
  label: string;
}
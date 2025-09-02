// Dashboard type definitions
export interface DashboardData {
  // Fleet statistics
  outOfServiceFleets: number;
  inUseFleets: number;
  availableFleets: number;
  
  // Project statistics
  AllSiteProjects: number;
  ActiveSiteProjects: number;
  
  // Job statistics
  CompletedJobs: number;
  CompletedJobsPercentage: number;
  RepairJobs: number;
  RepairJobsPercentage: number;
  TotalJobs: number;
  TotalJobsPercentage: number;
  
  // Hours statistics
  TotalMachineHours: number;
  TotalOperatorHours: number;
  
  // Job details
  jobsDetail: JobDetail[];
  
  // Site project fleets (optional)
  siteProjectFLeets?: SiteProjectFleet[];
  
  // Financial data (from FinancialStatsCards)
  totalRevenue?: number;
  totalExpenses?: number;
  netProfit?: number;
  profitMargin?: number;
}

export interface JobDetail {
  jobId: string;
  jobNumber: string;
  fleetId: string;
  fleetName: string;
  plateNumber: string;
  jobType: 'repair' | 'maintenance' | 'inspection';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTechnician?: string;
  technicianName?: string;
  description: string;
  estimatedHours?: number;
  actualHours?: number;
  startDate: string;
  expectedCompletionDate?: string;
  completionDate?: string;
  location?: string;
  cost?: number;
  parts?: JobPart[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobPart {
  partId: string;
  partName: string;
  partNumber: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SiteProjectFleet {
  siteProjectId: string;
  projectName: string;
  fleetId: string;
  fleetName: string;
  plateNumber: string;
  lpoNumber?: string;
  assignedDate: string;
  status: 'assigned' | 'active' | 'completed' | 'maintenance';
  location: string;
  operatorName?: string;
  dailyRate?: number;
}

// Fleet utilization data
export interface FleetUtilizationData {
  outOfService: number;
  inUse: number;
  available: number;
  total: number;
}

// Project overview data
export interface ProjectOverviewData {
  total: number;
  active: number;
  completed: number;
  pending: number;
}

// Job progress data
export interface JobProgressData {
  completed: {
    count: number;
    percentage: number;
  };
  repair: {
    count: number;
    percentage: number;
  };
  inspection: {
    count: number;
    percentage: number;
  };
  total: number;
}

// Stats card data
export interface StatsCardData {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
}

// Financial stats data
export interface FinancialStatsData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  monthlyRevenue?: MonthlyData[];
  monthlyExpenses?: MonthlyData[];
}

export interface MonthlyData {
  month: string;
  value: number;
}

// Chart data interfaces
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface LineChartData {
  name: string;
  data: number[];
  color: string;
}

export interface BarChartData {
  category: string;
  value: number;
  color?: string;
}

// Dashboard filters
export interface DashboardFilters {
  dateRange: {
    from: Date;
    to: Date;
  };
  fleetType?: string;
  location?: string;
  status?: string;
}

// API response types
export interface DashboardApiResponse {
  success: boolean;
  data: DashboardData;
  message?: string;
}

export interface DashboardError {
  message: string;
  code?: string;
  details?: any;
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Dashboard metrics
export interface DashboardMetrics {
  fleetUtilization: FleetUtilizationData;
  projectOverview: ProjectOverviewData;
  jobProgress: JobProgressData;
  financialStats: FinancialStatsData;
  recentJobs: JobDetail[];
  alerts: DashboardAlert[];
}

export interface DashboardAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

// Component props interfaces
export interface DashboardComponentProps {
  className?: string;
  data?: DashboardData;
  loading?: boolean;
  error?: string | null;
}

export interface ChartComponentProps {
  data: any;
  height?: number;
  className?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
}

// Time period options
export type TimePeriod = 'today' | 'week' | 'month' | 'quarter' | 'year';

// Dashboard widget types
export type WidgetType = 
  | 'fleet_utilization'
  | 'project_overview'
  | 'job_progress'
  | 'financial_stats'
  | 'recent_jobs'
  | 'alerts'
  | 'machine_hours'
  | 'operator_hours';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isVisible: boolean;
  config?: Record<string, any>;
}

// Dashboard layout
export interface DashboardLayout {
  widgets: DashboardWidget[];
  lastModified: string;
  version: number;
}
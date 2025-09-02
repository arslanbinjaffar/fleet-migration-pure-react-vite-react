import type { 
  DashboardData, 
  JobDetail, 
  FleetUtilizationData, 
  ProjectOverviewData, 
  JobProgressData,
  FinancialStatsData,
  ChartDataPoint,
  TimePeriod
} from '../types';

// Format currency values
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Format percentage values
export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

// Format large numbers with abbreviations
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format date and time for display
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format time duration in hours
export const formatHours = (hours: number): string => {
  if (hours < 1) {
    return `${Math.round(hours * 60)}m`;
  }
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${Math.round(remainingHours)}h`;
  }
  return `${Math.round(hours)}h`;
};

// Get job status color
export const getJobStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get job priority color
export const getJobPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 text-red-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get fleet status color
export const getFleetStatusColor = (status: string): string => {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800';
    case 'in_use':
      return 'bg-blue-100 text-blue-800';
    case 'out_of_service':
      return 'bg-red-100 text-red-800';
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Calculate fleet utilization percentage
export const calculateFleetUtilization = (data: FleetUtilizationData): number => {
  const total = data.available + data.inUse + data.outOfService;
  if (total === 0) return 0;
  return (data.inUse / total) * 100;
};

// Calculate project completion rate
export const calculateProjectCompletionRate = (data: ProjectOverviewData): number => {
  if (data.total === 0) return 0;
  return (data.completed / data.total) * 100;
};

// Calculate job completion rate
export const calculateJobCompletionRate = (data: JobProgressData): number => {
  if (data.total === 0) return 0;
  return (data.completed.count / data.total) * 100;
};

// Calculate profit margin
export const calculateProfitMargin = (revenue: number, expenses: number): number => {
  if (revenue === 0) return 0;
  return ((revenue - expenses) / revenue) * 100;
};

// Transform dashboard data for charts
export const transformFleetDataForChart = (data: DashboardData): ChartDataPoint[] => {
  return [
    {
      name: 'Available',
      value: data.availableFleets,
      color: '#10b981',
    },
    {
      name: 'In Use',
      value: data.inUseFleets,
      color: '#3b82f6',
    },
    {
      name: 'Out of Service',
      value: data.outOfServiceFleets,
      color: '#ef4444',
    },
  ];
};

export const transformJobDataForChart = (data: DashboardData): ChartDataPoint[] => {
  return [
    {
      name: 'Completed',
      value: data.CompletedJobs,
      color: '#10b981',
    },
    {
      name: 'In Progress',
      value: data.RepairJobs,
      color: '#f59e0b',
    },
    {
      name: 'Total',
      value: data.TotalJobs,
      color: '#6b7280',
    },
  ];
};

export const transformProjectDataForChart = (data: DashboardData): ChartDataPoint[] => {
  const completedProjects = data.AllSiteProjects - data.ActiveSiteProjects;
  return [
    {
      name: 'Active',
      value: data.ActiveSiteProjects,
      color: '#3b82f6',
    },
    {
      name: 'Completed',
      value: completedProjects,
      color: '#10b981',
    },
  ];
};

// Filter jobs by status
export const filterJobsByStatus = (jobs: JobDetail[], status: string): JobDetail[] => {
  return jobs.filter(job => job.status === status);
};

// Filter jobs by priority
export const filterJobsByPriority = (jobs: JobDetail[], priority: string): JobDetail[] => {
  return jobs.filter(job => job.priority === priority);
};

// Sort jobs by date
export const sortJobsByDate = (jobs: JobDetail[], order: 'asc' | 'desc' = 'desc'): JobDetail[] => {
  return [...jobs].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
};

// Get recent jobs (last 7 days)
export const getRecentJobs = (jobs: JobDetail[], days = 7): JobDetail[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return jobs.filter(job => new Date(job.createdAt) >= cutoffDate);
};

// Calculate average job completion time
export const calculateAverageCompletionTime = (jobs: JobDetail[]): number => {
  const completedJobs = jobs.filter(job => job.status === 'completed' && job.actualHours);
  if (completedJobs.length === 0) return 0;
  
  const totalHours = completedJobs.reduce((sum, job) => sum + (job.actualHours || 0), 0);
  return totalHours / completedJobs.length;
};

// Calculate total job cost
export const calculateTotalJobCost = (jobs: JobDetail[]): number => {
  return jobs.reduce((total, job) => total + (job.cost || 0), 0);
};

// Get overdue jobs
export const getOverdueJobs = (jobs: JobDetail[]): JobDetail[] => {
  const now = new Date();
  return jobs.filter(job => {
    if (!job.expectedCompletionDate || job.status === 'completed') return false;
    return new Date(job.expectedCompletionDate) < now;
  });
};

// Get high priority jobs
export const getHighPriorityJobs = (jobs: JobDetail[]): JobDetail[] => {
  return jobs.filter(job => job.priority === 'high' || job.priority === 'urgent');
};

// Calculate fleet efficiency
export const calculateFleetEfficiency = (data: DashboardData): number => {
  const totalFleets = data.availableFleets + data.inUseFleets + data.outOfServiceFleets;
  if (totalFleets === 0) return 0;
  
  const operationalFleets = data.availableFleets + data.inUseFleets;
  return (operationalFleets / totalFleets) * 100;
};

// Generate time series data for charts
export const generateTimeSeriesData = (period: TimePeriod): string[] => {
  const now = new Date();
  const labels: string[] = [];
  
  switch (period) {
    case 'today':
      for (let i = 23; i >= 0; i--) {
        const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
        labels.push(hour.getHours().toString().padStart(2, '0') + ':00');
      }
      break;
    case 'week':
      for (let i = 6; i >= 0; i--) {
        const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        labels.push(day.toLocaleDateString('en-US', { weekday: 'short' }));
      }
      break;
    case 'month':
      for (let i = 29; i >= 0; i--) {
        const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        labels.push(day.getDate().toString());
      }
      break;
    case 'quarter':
      for (let i = 11; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(month.toLocaleDateString('en-US', { month: 'short' }));
      }
      break;
    case 'year':
      for (let i = 11; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(month.toLocaleDateString('en-US', { month: 'short' }));
      }
      break;
  }
  
  return labels;
};

// Validate dashboard data
export const validateDashboardData = (data: any): data is DashboardData => {
  return (
    data &&
    typeof data.outOfServiceFleets === 'number' &&
    typeof data.inUseFleets === 'number' &&
    typeof data.availableFleets === 'number' &&
    typeof data.AllSiteProjects === 'number' &&
    typeof data.ActiveSiteProjects === 'number' &&
    typeof data.CompletedJobs === 'number' &&
    typeof data.RepairJobs === 'number' &&
    typeof data.TotalJobs === 'number' &&
    Array.isArray(data.jobsDetail)
  );
};

// Calculate dashboard summary statistics
export const calculateDashboardSummary = (data: DashboardData) => {
  const totalFleets = data.availableFleets + data.inUseFleets + data.outOfServiceFleets;
  const fleetUtilization = totalFleets > 0 ? (data.inUseFleets / totalFleets) * 100 : 0;
  const jobCompletionRate = data.TotalJobs > 0 ? (data.CompletedJobs / data.TotalJobs) * 100 : 0;
  const projectCompletionRate = data.AllSiteProjects > 0 ? 
    ((data.AllSiteProjects - data.ActiveSiteProjects) / data.AllSiteProjects) * 100 : 0;
  
  return {
    totalFleets,
    fleetUtilization,
    jobCompletionRate,
    projectCompletionRate,
    totalHours: data.TotalMachineHours + data.TotalOperatorHours,
    activeJobs: data.RepairJobs,
    completedJobs: data.CompletedJobs,
    totalJobs: data.TotalJobs,
  };
};

// Debounce function for search and filters
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
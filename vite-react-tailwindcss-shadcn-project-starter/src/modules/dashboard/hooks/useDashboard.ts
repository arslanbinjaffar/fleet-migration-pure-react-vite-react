import { useState, useEffect, useCallback } from 'react';
import type { DashboardData, DashboardError, LoadingState } from '../types';
import { DASHBOARD_ENDPOINTS, REFRESH_INTERVALS } from '../constants';
import { validateDashboardData } from '../utils';

// Mock data for development - replace with actual API call
const MOCK_DASHBOARD_DATA: DashboardData = {
  outOfServiceFleets: 5,
  inUseFleets: 25,
  availableFleets: 15,
  AllSiteProjects: 12,
  ActiveSiteProjects: 8,
  CompletedJobs: 145,
  CompletedJobsPercentage: 72.5,
  RepairJobs: 35,
  RepairJobsPercentage: 17.5,
  TotalJobs: 200,
  TotalJobsPercentage: 100,
  TotalMachineHours: 1250,
  TotalOperatorHours: 980,
  jobsDetail: [
    {
      jobId: '1',
      jobNumber: 'JOB-2024-001',
      fleetId: 'FL001',
      fleetName: 'Excavator CAT 320',
      plateNumber: 'ABC-123',
      jobType: 'repair',
      status: 'in_progress',
      priority: 'high',
      assignedTechnician: 'TECH001',
      technicianName: 'John Smith',
      description: 'Engine overhaul and hydraulic system repair',
      estimatedHours: 24,
      actualHours: 18,
      startDate: '2024-02-01T08:00:00Z',
      expectedCompletionDate: '2024-02-03T17:00:00Z',
      location: 'Workshop A',
      cost: 2500,
      createdAt: '2024-02-01T08:00:00Z',
      updatedAt: '2024-02-02T14:30:00Z',
    },
    {
      jobId: '2',
      jobNumber: 'JOB-2024-002',
      fleetId: 'FL002',
      fleetName: 'Bulldozer D6T',
      plateNumber: 'XYZ-456',
      jobType: 'maintenance',
      status: 'pending',
      priority: 'medium',
      description: 'Routine maintenance and oil change',
      estimatedHours: 4,
      startDate: '2024-02-03T09:00:00Z',
      location: 'Workshop B',
      cost: 350,
      createdAt: '2024-02-01T10:00:00Z',
      updatedAt: '2024-02-01T10:00:00Z',
    },
    {
      jobId: '3',
      jobNumber: 'JOB-2024-003',
      fleetId: 'FL003',
      fleetName: 'Crane Liebherr LTM',
      plateNumber: 'DEF-789',
      jobType: 'inspection',
      status: 'completed',
      priority: 'low',
      assignedTechnician: 'TECH002',
      technicianName: 'Sarah Johnson',
      description: 'Annual safety inspection',
      estimatedHours: 2,
      actualHours: 2.5,
      startDate: '2024-01-30T08:00:00Z',
      expectedCompletionDate: '2024-01-30T10:00:00Z',
      completionDate: '2024-01-30T10:30:00Z',
      location: 'Site A',
      cost: 150,
      createdAt: '2024-01-29T15:00:00Z',
      updatedAt: '2024-01-30T10:30:00Z',
    },
  ],
  totalRevenue: 125000,
  totalExpenses: 89000,
  netProfit: 36000,
  profitMargin: 28.8,
};

interface UseDashboardOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseDashboardReturn {
  data: DashboardData | null;
  loading: LoadingState;
  error: DashboardError | null;
  refetch: () => Promise<void>;
  refresh: () => void;
}

export const useDashboard = (options: UseDashboardOptions = {}): UseDashboardReturn => {
  const {
    autoRefresh = true,
    refreshInterval = REFRESH_INTERVALS.DASHBOARD_DATA,
  } = options;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<LoadingState>('idle');
  const [error, setError] = useState<DashboardError | null>(null);

  const fetchDashboardData = useCallback(async (): Promise<void> => {
    try {
      setLoading('loading');
      setError(null);

      // TODO: Replace with actual API call
      // const response = await fetch(DASHBOARD_ENDPOINTS.DASHBOARD_DATA);
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }
      // const result = await response.json();

      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      const result = MOCK_DASHBOARD_DATA;

      if (!validateDashboardData(result)) {
        throw new Error('Invalid dashboard data format');
      }

      setData(result);
      setLoading('success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError({
        message: errorMessage,
        code: 'FETCH_ERROR',
        details: err,
      });
      setLoading('error');
    }
  }, []);

  const refresh = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchDashboardData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchDashboardData]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardData,
    refresh,
  };
};

// Hook for specific dashboard metrics
export const useDashboardMetrics = () => {
  const { data, loading, error } = useDashboard();

  const metrics = data ? {
    fleetUtilization: {
      total: data.availableFleets + data.inUseFleets + data.outOfServiceFleets,
      available: data.availableFleets,
      inUse: data.inUseFleets,
      outOfService: data.outOfServiceFleets,
      utilizationRate: data.availableFleets + data.inUseFleets + data.outOfServiceFleets > 0 
        ? (data.inUseFleets / (data.availableFleets + data.inUseFleets + data.outOfServiceFleets)) * 100 
        : 0,
    },
    jobProgress: {
      total: data.TotalJobs,
      completed: data.CompletedJobs,
      inProgress: data.RepairJobs,
      completionRate: data.TotalJobs > 0 ? (data.CompletedJobs / data.TotalJobs) * 100 : 0,
    },
    projectOverview: {
      total: data.AllSiteProjects,
      active: data.ActiveSiteProjects,
      completed: data.AllSiteProjects - data.ActiveSiteProjects,
      completionRate: data.AllSiteProjects > 0 
        ? ((data.AllSiteProjects - data.ActiveSiteProjects) / data.AllSiteProjects) * 100 
        : 0,
    },
    hours: {
      machine: data.TotalMachineHours,
      operator: data.TotalOperatorHours,
      total: data.TotalMachineHours + data.TotalOperatorHours,
    },
    financial: {
      revenue: data.totalRevenue || 0,
      expenses: data.totalExpenses || 0,
      profit: data.netProfit || 0,
      margin: data.profitMargin || 0,
    },
  } : null;

  return {
    metrics,
    loading,
    error,
  };
};

// Hook for real-time alerts
export const useDashboardAlerts = () => {
  const { data } = useDashboard();
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (!data) return;

    const newAlerts = [];

    // Check for low fleet availability
    const totalFleets = data.availableFleets + data.inUseFleets + data.outOfServiceFleets;
    const availabilityRate = totalFleets > 0 ? (data.availableFleets / totalFleets) * 100 : 0;
    
    if (availabilityRate < 20) {
      newAlerts.push({
        id: 'low-fleet-availability',
        type: 'warning',
        title: 'Low Fleet Availability',
        message: `Only ${data.availableFleets} fleets available (${availabilityRate.toFixed(1)}%)`,
        timestamp: new Date().toISOString(),
        isRead: false,
      });
    }

    // Check for high number of repair jobs
    if (data.RepairJobs > 30) {
      newAlerts.push({
        id: 'high-repair-jobs',
        type: 'warning',
        title: 'High Repair Workload',
        message: `${data.RepairJobs} repair jobs currently in progress`,
        timestamp: new Date().toISOString(),
        isRead: false,
      });
    }

    // Check for overdue jobs
    const overdueJobs = data.jobsDetail.filter(job => {
      if (!job.expectedCompletionDate || job.status === 'completed') return false;
      return new Date(job.expectedCompletionDate) < new Date();
    });

    if (overdueJobs.length > 0) {
      newAlerts.push({
        id: 'overdue-jobs',
        type: 'error',
        title: 'Overdue Jobs',
        message: `${overdueJobs.length} jobs are overdue`,
        timestamp: new Date().toISOString(),
        isRead: false,
      });
    }

    setAlerts(newAlerts);
  }, [data]);

  return alerts;
};
import React from 'react';
import { RefreshCw, AlertTriangle, TrendingUp, Users, Clock } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Dashboard components
import { StatsCard } from './StatsCard';
import { FleetUtilizationChart } from './FleetUtilizationChart';
import { JobProgressChart } from './JobProgressChart';
import { ProjectOverviewChart } from './ProjectOverviewChart';
import { JobsTable } from './JobsTable';
import { FinancialStatsCards } from './FinancialStatsCards';

// Hooks and utilities
import { useDashboard, useDashboardAlerts } from '../hooks/useDashboard';
import { formatCurrency, formatHours } from '../utils';
import { GRADIENT_BACKGROUNDS } from '../constants';

interface DashboardProps {
  className?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ className }) => {
  const { data, loading, error, refresh } = useDashboard();
  const alerts = useDashboardAlerts();

  // Loading state
  if (loading === 'loading' && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading dashboard data: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No dashboard data available
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`space-y-6 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hi, welcome back 👋</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your fleet operations today.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={refresh}
          disabled={loading === 'loading'}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading === 'loading' ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <Alert key={alert.id} variant={alert.type === 'error' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{alert.title}:</strong> {alert.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Financial Stats Cards */}
      <FinancialStatsCards data={data} />

      {/* Fleet Utilization and Projects Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fleet Utilization Chart */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Fleet Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <FleetUtilizationChart
                outOfServiceFleets={data.outOfServiceFleets}
                inUseFleets={data.inUseFleets}
                availableFleets={data.availableFleets}
              />
            </CardContent>
          </Card>
        </div>

        {/* Projects Overview and Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Projects Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectOverviewChart
                allProjects={data.AllSiteProjects}
                activeProjects={data.ActiveSiteProjects}
              />
            </CardContent>
          </Card>

          {/* Machine and Operator Hours */}
          <div className="grid grid-cols-1 gap-4">
            <StatsCard
              title="Machine Hours"
              value={formatHours(data.TotalMachineHours)}
              icon={<Clock className="h-4 w-4" />}
              trend={{
                value: 12.5,
                isPositive: true,
              }}
            />
            <StatsCard
              title="Operator Hours"
              value={formatHours(data.TotalOperatorHours)}
              icon={<Users className="h-4 w-4" />}
              trend={{
                value: 8.3,
                isPositive: true,
              }}
            />
          </div>
        </div>
      </div>

      {/* Jobs Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jobs Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Job Details For Repair In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <JobsTable jobs={data.jobsDetail} />
            </CardContent>
          </Card>
        </div>

        {/* Job Status Cards */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Completed Jobs */}
              <div 
                className="p-4 rounded-lg text-white"
                style={{ background: GRADIENT_BACKGROUNDS.COMPLETED_JOBS }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{data.CompletedJobs}</div>
                    <div className="text-sm opacity-90">Completed Jobs</div>
                  </div>
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>

              {/* Repair Jobs */}
              <div 
                className="p-4 rounded-lg text-white"
                style={{ background: GRADIENT_BACKGROUNDS.REPAIR_JOBS }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{data.RepairJobs}</div>
                    <div className="text-sm opacity-90">Repairs In Progress</div>
                  </div>
                  <Clock className="h-6 w-6" />
                </div>
              </div>

              {/* Total Jobs */}
              <div 
                className="p-4 rounded-lg text-white"
                style={{ background: GRADIENT_BACKGROUNDS.TOTAL_JOBS }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{data.TotalJobs}</div>
                    <div className="text-sm opacity-90">Total Jobs</div>
                  </div>
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Job Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Job Progress Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <JobProgressChart
            completedJobs={data.CompletedJobs}
            completedJobsPercentage={data.CompletedJobsPercentage}
            repairJobs={data.RepairJobs}
            repairJobsPercentage={data.RepairJobsPercentage}
            inspectionJobs={data.TotalJobs}
            inspectionJobsPercentage={data.TotalJobsPercentage}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
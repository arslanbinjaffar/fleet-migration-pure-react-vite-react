import React from 'react';
import { Progress } from '@/components/ui/progress';

interface JobProgressChartProps {
  completedJobs: number;
  completedJobsPercentage: number;
  repairJobs: number;
  repairJobsPercentage: number;
  inspectionJobs: number;
  inspectionJobsPercentage: number;
  className?: string;
}

export const JobProgressChart: React.FC<JobProgressChartProps> = ({
  completedJobs,
  completedJobsPercentage,
  repairJobs,
  repairJobsPercentage,
  inspectionJobs,
  inspectionJobsPercentage,
  className,
}) => {
  const jobTypes = [
    {
      name: 'Completed Jobs',
      count: completedJobs,
      percentage: completedJobsPercentage,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Repair Jobs',
      count: repairJobs,
      percentage: repairJobsPercentage,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      name: 'Total Jobs',
      count: inspectionJobs,
      percentage: inspectionJobsPercentage,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Job Progress Bars */}
      <div className="space-y-4">
        {jobTypes.map((job, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 ${job.color} rounded-full`} />
                <span className="font-medium">{job.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{job.count}</span>
                <span className={`text-sm ${job.textColor}`}>
                  ({job.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
            <Progress 
              value={job.percentage} 
              className="h-2"
            />
          </div>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {jobTypes.map((job, index) => (
          <div key={index} className={`p-4 ${job.bgColor} rounded-lg`}>
            <div className="text-center">
              <div className={`text-xl font-bold ${job.textColor}`}>
                {job.count}
              </div>
              <div className={`text-sm ${job.textColor}`}>
                {job.name}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {job.percentage.toFixed(1)}% of total
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Overall Progress */}
      <div className="p-4 bg-muted rounded-lg">
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-2">Overall Job Completion Rate</div>
          <div className="text-2xl font-bold text-green-600">
            {completedJobsPercentage.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground">
            {completedJobs} completed out of {inspectionJobs} total jobs
          </div>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ProjectOverviewChartProps {
  allProjects: number;
  activeProjects: number;
  className?: string;
}

export const ProjectOverviewChart: React.FC<ProjectOverviewChartProps> = ({
  allProjects,
  activeProjects,
  className,
}) => {
  const completedProjects = allProjects - activeProjects;
  const completionRate = allProjects > 0 ? (completedProjects / allProjects) * 100 : 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Project Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{activeProjects}</div>
          <div className="text-sm text-blue-600">Active</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{completedProjects}</div>
          <div className="text-sm text-green-600">Completed</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Project Completion</span>
          <span>{completionRate.toFixed(1)}%</span>
        </div>
        <Progress value={completionRate} className="h-2" />
      </div>

      {/* Total Projects */}
      <div className="text-center p-3 bg-muted rounded-lg">
        <div className="text-lg font-semibold">{allProjects}</div>
        <div className="text-sm text-muted-foreground">Total Projects</div>
      </div>
    </div>
  );
};
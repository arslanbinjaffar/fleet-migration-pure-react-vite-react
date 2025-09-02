import React from 'react';
import { Eye, Clock, User } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { JobDetail } from '../types';
import { 
  formatDate, 
  formatCurrency, 
  getJobStatusColor, 
  getJobPriorityColor 
} from '../utils';

interface JobsTableProps {
  jobs: JobDetail[];
  className?: string;
  maxRows?: number;
}

export const JobsTable: React.FC<JobsTableProps> = ({ 
  jobs, 
  className, 
  maxRows = 5 
}) => {
  // Show only recent jobs, limited by maxRows
  const displayJobs = jobs
    .filter(job => job.status === 'in_progress' || job.status === 'pending')
    .slice(0, maxRows);

  if (displayJobs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No active jobs found
      </div>
    );
  }

  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job #</TableHead>
            <TableHead>Fleet</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Technician</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead className="w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayJobs.map((job) => {
            const progress = job.estimatedHours && job.actualHours 
              ? Math.min((job.actualHours / job.estimatedHours) * 100, 100)
              : 0;

            return (
              <TableRow key={job.jobId}>
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold">{job.jobNumber}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(job.startDate)}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div>
                    <div className="font-medium">{job.fleetName}</div>
                    <div className="text-xs text-muted-foreground">
                      {job.plateNumber}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {job.jobType}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <Badge className={getJobStatusColor(job.status)}>
                    {job.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <Badge className={getJobPriorityColor(job.priority)}>
                    {job.priority}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  {job.technicianName ? (
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      <span className="text-sm">{job.technicianName}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                
                <TableCell>
                  {job.estimatedHours ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <Clock className="h-3 w-3" />
                        <span>
                          {job.actualHours || 0}h / {job.estimatedHours}h
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {progress.toFixed(0)}% complete
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                
                <TableCell>
                  {job.cost ? (
                    <span className="font-medium">
                      {formatCurrency(job.cost)}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {jobs.length > maxRows && (
        <div className="mt-4 text-center">
          <Button variant="outline" size="sm">
            View All Jobs ({jobs.length})
          </Button>
        </div>
      )}
    </div>
  );
};
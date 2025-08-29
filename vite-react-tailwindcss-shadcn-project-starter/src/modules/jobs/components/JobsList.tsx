import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CSVLink } from 'react-csv';
import {
  Search,
  Plus,
  FileDown,
  List,
  Grid3X3,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';

// Store and API
import { useGetJobsQuery, useDeleteJobMutation } from '@/stores/api/jobsApiSlice';
import {
  selectJobs,
  selectJobsLoading,
  selectJobsError,
  selectJobFilters,
  selectJobSearchQuery,
  selectJobPagination,
  selectJobViewMode,
  selectSelectedJobIds,
  setJobSearchQuery,
  setJobFilters,
  setJobPagination,
  setJobViewMode,
  toggleJobSelection,
  selectAllJobs,
  clearJobSelection,
  setCreateJobModalOpen,
  setEditJobModalOpen,
  setCurrentJob,
  setCurrentJobForDelete,
  setDeleteConfirmDialogOpen,
} from '@/stores/slices/jobsSlice';

// Types and utilities
import type { Job, JobFilters as JobFiltersType } from '../types';
import {
  getJobStatusStyle,
  getTechnicianDisplayName,
  getCustomerDisplayName,
  getMachineDisplayName,
  getMachinePlateNumber,
  formatDate,
  filterJobs,
  sortJobs,
  paginateArray,
  calculateTotalPages,
  prepareJobsForExport,
  debounce,
} from '../utils';
import {
  ASSIGNMENT_FILTER_OPTIONS,
  VIEW_MODE_OPTIONS,
  CSV_HEADERS,
  UI_CONSTANTS,
} from '../constants';

// Components
import JobModal from './JobModal';
import TechnicianDropdown from './TechnicianDropdown';
import ManualTechnicianModal from './ManualTechnicianModal';

interface JobsListProps {
  className?: string;
}

const JobsList: React.FC<JobsListProps> = ({ className }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Selectors
  const jobs = useSelector(selectJobs);
  const isLoading = useSelector(selectJobsLoading);
  const error = useSelector(selectJobsError);
  const filters = useSelector(selectJobFilters);
  const searchQuery = useSelector(selectJobSearchQuery);
  const pagination = useSelector(selectJobPagination);
  const viewMode = useSelector(selectJobViewMode);
  const selectedJobIds = useSelector(selectSelectedJobIds);

  // Local state
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // API hooks
  const {
    data: jobsData,
    isLoading: isJobsLoading,
    error: jobsError,
    refetch,
  } = useGetJobsQuery({
    page: pagination.currentPage,
    limit: pagination.pageSize,
    search: searchQuery,
    filters,
  });

  const [deleteJob, { isLoading: isDeleting }] = useDeleteJobMutation();

  // Memoized filtered and sorted jobs
  const processedJobs = useMemo(() => {
    let filteredJobs = filterJobs(jobs.jobs || [], searchQuery);
    
    // Apply assignment filter
    if (filters.assignmentFilter && filters.assignmentFilter !== 'all') {
      filteredJobs = filteredJobs.filter((job) => {
        const isAssigned = !!(job.technician || job.manualTechnician || job.technicianJob);
        return filters.assignmentFilter === 'assigned' ? isAssigned : !isAssigned;
      });
    }

    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      filteredJobs = filteredJobs.filter((job) => 
        job.status && filters.status!.includes(job.status)
      );
    }

    return sortJobs(filteredJobs, 'createdAt', 'desc');
  }, [jobs.jobs, searchQuery, filters]);

  // Paginated jobs
  const paginatedJobs = useMemo(() => {
    return paginateArray(
      processedJobs,
      pagination.currentPage,
      pagination.pageSize
    );
  }, [processedJobs, pagination.currentPage, pagination.pageSize]);

  // Update pagination when jobs change
  useEffect(() => {
    const totalPages = calculateTotalPages(processedJobs.length, pagination.pageSize);
    dispatch(setJobPagination({
      total: processedJobs.length,
      totalPages,
    }));
  }, [processedJobs.length, pagination.pageSize, dispatch]);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      dispatch(setJobSearchQuery(query));
    }, UI_CONSTANTS.DEBOUNCE_DELAY),
    [dispatch]
  );

  // Event handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleFilterChange = (key: keyof JobFiltersType, value: any) => {
    dispatch(setJobFilters({ [key]: value }));
  };

  const handleViewModeChange = (mode: 'table' | 'grid') => {
    dispatch(setJobViewMode(mode));
  };

  const handlePageChange = (page: number) => {
    dispatch(setJobPagination({ currentPage: page }));
  };

  const handleCreateJob = () => {
    dispatch(setCreateJobModalOpen(true));
  };

  const handleEditJob = (job: Job) => {
    dispatch(setCurrentJob(job));
    dispatch(setEditJobModalOpen(true));
  };

  const handleDeleteJob = (job: Job) => {
    setDeleteJobId(job.jobId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteJobId) return;

    try {
      await deleteJob(deleteJobId).unwrap();
      toast({
        title: 'Success',
        description: 'Job deleted successfully',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete job',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteJobId(null);
    }
  };

  const handleJobSelection = (jobId: string) => {
    dispatch(toggleJobSelection(jobId));
  };

  const handleSelectAll = () => {
    const allJobIds = paginatedJobs.map(job => job.jobId);
    if (selectedJobIds.length === allJobIds.length) {
      dispatch(clearJobSelection());
    } else {
      dispatch(selectAllJobs(allJobIds));
    }
  };

  // Render job status badge
  const renderStatusBadge = (status?: string) => {
    const style = getJobStatusStyle(status as any);
    return (
      <Badge 
        variant="outline" 
        style={{
          backgroundColor: style.backgroundColor,
          color: style.color,
          borderColor: style.color,
        }}
      >
        {status || 'New'}
      </Badge>
    );
  };

  // Render table row
  const renderTableRow = (job: Job, index: number) => (
    <TableRow key={job.jobId} className="hover:bg-muted/50">
      <TableCell>
        <input
          type="checkbox"
          checked={selectedJobIds.includes(job.jobId)}
          onChange={() => handleJobSelection(job.jobId)}
          className="rounded border-gray-300"
        />
      </TableCell>
      <TableCell className="font-medium">{job.jobNumber}</TableCell>
      <TableCell>{getMachineDisplayName(job)}</TableCell>
      <TableCell>{getMachinePlateNumber(job)}</TableCell>
      <TableCell>{getCustomerDisplayName(job)}</TableCell>
      <TableCell>
        {job.customer?.phone || job.customerJob?.phone || '-'}
      </TableCell>
      <TableCell>
        {job.customer?.email || job.customerJob?.email || '-'}
      </TableCell>
      <TableCell>
        <TechnicianDropdown job={job} />
      </TableCell>
      <TableCell>{formatDate(job.createdAt)}</TableCell>
      <TableCell>{renderStatusBadge(job.status)}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEditJob(job)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleDeleteJob(job)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );

  // Render grid card
  const renderGridCard = (job: Job) => (
    <Card key={job.jobId} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Job #{job.jobNumber}</CardTitle>
          {renderStatusBadge(job.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <span className="font-medium">Machine:</span>{' '}
          {getMachineDisplayName(job)}
        </div>
        <div>
          <span className="font-medium">Plate No:</span>{' '}
          {getMachinePlateNumber(job)}
        </div>
        <div>
          <span className="font-medium">Customer:</span>{' '}
          {getCustomerDisplayName(job)}
        </div>
        <div>
          <span className="font-medium">Phone:</span>{' '}
          {job.customer?.phone || job.customerJob?.phone || '-'}
        </div>
        <div>
          <span className="font-medium">Technician:</span>
          <div className="mt-1">
            <TechnicianDropdown job={job} />
          </div>
        </div>
        <div>
          <span className="font-medium">Date:</span>{' '}
          {formatDate(job.createdAt)}
        </div>
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleEditJob(job)}
            className="flex-1"
          >
            <Edit className="mr-1 h-3 w-3" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDeleteJob(job)}
            className="flex-1 text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-1 h-3 w-3" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading || isJobsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground">
            Manage and track job assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleViewModeChange('table')}
          >
            <List className="mr-1 h-4 w-4" />
            List
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleViewModeChange('grid')}
          >
            <Grid3X3 className="mr-1 h-4 w-4" />
            Grid
          </Button>
        </div>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                Total: {processedJobs.length}
              </Badge>
              {selectedJobIds.length > 0 && (
                <Badge variant="outline" className="text-sm">
                  Selected: {selectedJobIds.length}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Job No, Customer, Machine..."
                  onChange={handleSearchChange}
                  className="pl-8 w-64"
                />
              </div>

              {/* Assignment Filter */}
              <Select
                value={filters.assignmentFilter || 'all'}
                onValueChange={(value) => handleFilterChange('assignmentFilter', value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNMENT_FILTER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Export */}
              <CSVLink
                data={prepareJobsForExport(processedJobs)}
                headers={CSV_HEADERS}
                filename="jobs.csv"
                className="inline-flex"
              >
                <Button variant="outline" size="sm">
                  <FileDown className="mr-1 h-4 w-4" />
                  Export
                </Button>
              </CSVLink>

              {/* Create Job */}
              <Button onClick={handleCreateJob}>
                <Plus className="mr-1 h-4 w-4" />
                New Job
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {viewMode === 'table' ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedJobIds.length === paginatedJobs.length && paginatedJobs.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead>Job No</TableHead>
                  <TableHead>Machine</TableHead>
                  <TableHead>Plate No.</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedJobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8">
                      <div className="text-muted-foreground">
                        No jobs found. Create a new job to get started.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedJobs.map((job, index) => renderTableRow(job, index))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedJobs.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <div className="text-muted-foreground">
                No jobs found. Create a new job to get started.
              </div>
            </div>
          ) : (
            paginatedJobs.map(renderGridCard)
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={pagination.currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePageChange(page)}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Modals */}
      <JobModal />
      <ManualTechnicianModal />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default JobsList;
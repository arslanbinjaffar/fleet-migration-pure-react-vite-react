import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FaTools, 
  FaSearch, 
  FaFilter, 
  FaCalendarAlt, 
  FaEdit, 
  FaDollarSign, 
  FaFileInvoice,
  FaCheckCircle,
  FaExclamationTriangle,
  FaWrench,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCar,
  FaFileInvoiceDollar
} from 'react-icons/fa';
import { FaCircleDollarToSlot, FaSackDollar } from 'react-icons/fa6';
import { PiInvoiceBold } from 'react-icons/pi';
import { MdCarRepair } from 'react-icons/md';

// shadcn UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

// Internal imports
import { selectCurrentUser } from '@/stores/slices/authSlice';
import { useGetRepairJobsQuery, useUpdateRepairJobStatusMutation } from '@/stores/api/repairsApiSlice';
import { 
  RepairJob, 
  RepairStatus, 
  RepairStatusOption,
  RepairListProps 
} from '../types';
import { 
  STATUS_OPTIONS, 
  JobStatus,
  PAGINATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES 
} from '../constants';
import {
  getStatusStyle,
  getStatusIcon,
  formatDate,
  getCustomerName,
  getTechnicianName,
  getVehicleName,
  getPlateNumber,
  getCustomerPhone,
  getCustomerEmail,
  filterJobs,
  sortJobsByDate,
  paginateJobs,
  generatePageNumbers,
  canCreateQuotation,
  canCreateInvoice,
  getNavigationPath
} from '../utils';

// Status Dropdown Component
interface StatusDropdownProps {
  job: RepairJob;
  onStatusUpdate?: (jobId: string, newStatus: RepairStatus) => void;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({ job, onStatusUpdate }) => {
  const [updateStatus, { isLoading }] = useUpdateRepairJobStatusMutation();
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: RepairStatus) => {
    if (newStatus === job.status) return;

    try {
      await updateStatus({ jobId: job.jobId, status: newStatus }).unwrap();
      toast({
        title: 'Success',
        description: SUCCESS_MESSAGES.STATUS_UPDATED,
      });
      onStatusUpdate?.(job.jobId, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: ERROR_MESSAGES.UPDATE_STATUS_FAILED,
        variant: 'destructive',
      });
    }
  };

  if (job.status !== JobStatus.REPAIR) {
    return (
      <Badge 
        variant="outline" 
        className="inline-flex items-center gap-1"
        style={getStatusStyle(job.status)}
      >
        {getStatusIcon(job.status)}
        {job.status || 'Started IN'}
      </Badge>
    );
  }

  return (
    <Select 
      value={job.status} 
      onValueChange={handleStatusChange}
      disabled={isLoading}
    >
      <SelectTrigger className="w-auto min-w-[120px]">
        <SelectValue>
          <div className="flex items-center gap-1">
            {getStatusIcon(job.status)}
            {job.status}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS
          .filter(opt => opt.value !== 'all')
          .map((option) => (
            <SelectItem key={option.value} value={option.value as string}>
              <div className="flex items-center gap-2">
                {option.icon}
                {option.label}
              </div>
            </SelectItem>
          ))
        }
      </SelectContent>
    </Select>
  );
};

// Main RepairsList Component
const RepairsList: React.FC<RepairListProps> = ({ className }) => {
  const navigate = useNavigate();
  const userInfo = useSelector(selectCurrentUser);
  const { toast } = useToast();

  // Local state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RepairStatus | 'all'>('all');
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: null,
    to: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = PAGINATION.DEFAULT_PAGE_SIZE;

  // API query
  const {
    data: repairJobsData,
    isLoading,
    error,
    refetch
  } = useGetRepairJobsQuery({
    page: currentPage,
    limit: recordsPerPage,
    search,
    statusFilter,
    dateRange,
  });

  const jobs = repairJobsData?.jobs || [];

  // Filtered and paginated data
  const filteredJobs = useMemo(() => {
    const filtered = filterJobs(jobs, search, statusFilter, dateRange);
    return sortJobsByDate(filtered);
  }, [jobs, search, statusFilter, dateRange]);

  const paginationData = useMemo(() => {
    return paginateJobs(filteredJobs, currentPage, recordsPerPage);
  }, [filteredJobs, currentPage, recordsPerPage]);

  const { paginatedJobs, totalPages, firstIndex, lastIndex } = paginationData;
  const pageNumbers = generatePageNumbers(totalPages);

  // Event handlers
  const handleDateRangeChange = (type: 'from' | 'to', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [type]: value ? new Date(value) : null,
    }));
    setCurrentPage(1);
  };

  const handleStatusUpdate = () => {
    refetch();
  };

  const userRole = userInfo?.Role?.roleName?.toLowerCase() || '';

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {ERROR_MESSAGES.FETCH_JOBS_FAILED}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FaTools className="text-primary" />
              Repair Tracking
            </h2>
          </div>
        </CardHeader>
        <CardBody>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by job no, machine, customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as RepairStatus | 'all')}>
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    {STATUS_OPTIONS.find(s => s.value === statusFilter)?.icon}
                    {STATUS_OPTIONS.find(s => s.value === statusFilter)?.label}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status.value} value={status.value as string}>
                    <div className="flex items-center gap-2">
                      {status.icon}
                      {status.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date From */}
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="date"
                value={dateRange.from ? dateRange.from.toISOString().split('T')[0] : ''}
                onChange={(e) => handleDateRangeChange('from', e.target.value)}
                className="pl-10"
                placeholder="From"
              />
            </div>

            {/* Date To */}
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="date"
                value={dateRange.to ? dateRange.to.toISOString().split('T')[0] : ''}
                onChange={(e) => handleDateRangeChange('to', e.target.value)}
                className="pl-10"
                placeholder="To"
                min={dateRange.from ? dateRange.from.toISOString().split('T')[0] : ''}
              />
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Job No</TableHead>
                  <TableHead>Machine</TableHead>
                  <TableHead>Plate Number</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-32 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedJobs.length > 0 ? (
                  paginatedJobs.map((job, index) => (
                    <TableRow key={job.jobId}>
                      <TableCell className="text-center">
                        {firstIndex + index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {job.jobNumber || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FaCar className="text-muted-foreground" />
                          {getVehicleName(job)}
                        </div>
                      </TableCell>
                      <TableCell>{getPlateNumber(job)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FaUser className="text-muted-foreground" />
                          {getCustomerName(job)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusDropdown job={job} onStatusUpdate={handleStatusUpdate} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FaPhone className="text-muted-foreground" />
                          {getCustomerPhone(job)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FaEnvelope className="text-muted-foreground" />
                          {getCustomerEmail(job)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTechnicianName(job) === 'Unassigned' ? 'secondary' : 'default'}>
                          {getTechnicianName(job)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-muted-foreground" />
                          {formatDate(job.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`edit/${job.jobId}`)}
                          >
                            <FaEdit />
                          </Button>
                          {canCreateQuotation(job) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const path = job.quotaionId
                                  ? getNavigationPath(userRole, `quotation/view/${job.quotaionId}`)
                                  : getNavigationPath(userRole, `quotation/create/job/${job.jobId}`);
                                navigate(path);
                              }}
                            >
                              <FaDollarSign />
                            </Button>
                          )}
                          {canCreateInvoice(job) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const path = job.invoiceId
                                  ? getNavigationPath(userRole, `invoices/view/${job.invoiceId}`)
                                  : getNavigationPath(userRole, `invoice/create/job/${job.jobId}`);
                                navigate(path, {
                                  state: { quotaionId: job.quotaionId }
                                });
                              }}
                            >
                              <FaFileInvoice />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8">
                      No records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {paginatedJobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No records found
              </div>
            ) : (
              paginatedJobs.map((job) => (
                <Card key={job.jobId} className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Job #{job.jobNumber}</span>
                      <StatusDropdown job={job} onStatusUpdate={handleStatusUpdate} />
                    </div>
                    <div><strong>Machine:</strong> {getVehicleName(job)}</div>
                    <div><strong>Plate No:</strong> {getPlateNumber(job)}</div>
                    <div><strong>Customer:</strong> {getCustomerName(job)}</div>
                    <div><strong>Phone:</strong> {getCustomerPhone(job)}</div>
                    <div><strong>Email:</strong> {getCustomerEmail(job)}</div>
                    <div><strong>Technician:</strong> {getTechnicianName(job)}</div>
                    <div><strong>Date:</strong> {formatDate(job.createdAt)}</div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`edit/${job.jobId}`)}
                      >
                        Edit
                      </Button>
                      {canCreateQuotation(job) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            const path = job.quotaionId
                              ? getNavigationPath(userRole, `quotation/view/${job.quotaionId}`)
                              : getNavigationPath(userRole, `quotation/create/job/${job.jobId}`);
                            navigate(path);
                          }}
                        >
                          {job.quotaionId ? <FaCircleDollarToSlot /> : <FaSackDollar />}
                        </Button>
                      )}
                      {canCreateInvoice(job) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            const path = job.invoiceId
                              ? getNavigationPath(userRole, `invoices/view/${job.invoiceId}`)
                              : getNavigationPath(userRole, `invoice/create/job/${job.jobId}`);
                            navigate(path, {
                              state: { quotaionId: job.quotaionId }
                            });
                          }}
                        >
                          {job.invoiceId ? <FaFileInvoiceDollar /> : <PiInvoiceBold />}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {filteredJobs.length > 0 ? firstIndex + 1 : 0} to{' '}
              {Math.min(lastIndex, filteredJobs.length)} of {filteredJobs.length} entries
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {pageNumbers.map((n) => (
                <Button
                  key={n}
                  variant={currentPage === n ? 'default' : 'outline'}
                  onClick={() => setCurrentPage(n)}
                >
                  {n}
                </Button>
              ))}
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default RepairsList;
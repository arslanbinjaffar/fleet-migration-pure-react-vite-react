import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Calendar,
  Clock,
  Users,
  Truck,
  Building,
  Filter,
  Search,
  Download,
  Plus,
  Grid,
  List,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Loader2,
  RefreshCw,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

import {
  useGetScheduledShiftsQuery,
  useUpdateShiftStatusMutation,
  useDeleteScheduledShiftMutation,
  useBulkUpdateShiftStatusMutation,
  useBulkDeleteShiftsMutation,
} from '../../../stores/api/timesheetApiSlice';
import { selectCurrentUser } from '../../../stores/slices/authSlice';
import {
  selectTimesheetState,
  setShifts,
  setCurrentPage,
  setPageSize,
  setFilters,
  setSearchTerm,
  setViewMode,
  setDateRange,
  toggleShiftSelection,
  selectAllShifts,
  clearSelection,
  toggleSortOrder,
  setIsCreateModalOpen,
  setIsEditModalOpen,
  setIsManageTimeModalOpen,
  setEditingShift,
} from '../../../stores/slices/timesheetSlice';
import {
  SHIFT_STATUS_OPTIONS,
  VIEW_MODE_OPTIONS,
  PAGE_SIZE_OPTIONS,
  TIMESHEET_TABLE_COLUMNS,
  PERMISSIONS,
} from '../constants';
import {
  formatDate,
  formatTime,
  formatHours,
  getOperatorNames,
  getStatusConfig,
  searchShifts,
  filterShiftsByStatus,
  filterShiftsByFleet,
  filterShiftsByProject,
  filterShiftsByOperator,
  filterShiftsByCustomer,
  sortShifts,
  paginateShifts,
  generateFilterOptions,
  getErrorMessage,
} from '../utils';
import {
  ManageButton,
  EditButton,
  DeleteButton,
  ViewButton,
  ExportButton,
  ActionsDropdown,
  BulkActionsDropdown,
  CreatePermission,
  PermissionModule,
  useModulePermissions,
} from '../../../components/permissions';
import { useNavigate } from 'react-router-dom';

const TimesheetList: React.FC = () => {
  const dispatch = useDispatch();
  const navigate=useNavigate()
  const user = useSelector(selectCurrentUser);
  const timesheetState = useSelector(selectTimesheetState);

  function handleManageTimeToNavigate(){
  return navigate(`/${user?.Role?.roleName}/schedule/edit`)
  }
  const {
    shifts,
    replicatedShifts,
    currentPage,
    pageSize,
    filters,
    searchTerm,
    viewMode,
    dateRange,
    selectedShiftIds,
    sortBy,
    sortOrder,
    isLoading,
    isUpdatingStatus,
  } = timesheetState;
  
  // API hooks
  const {
    data: shiftsResponse,
    error: shiftsError,
    isLoading: isFetchingShifts,
    refetch: refetchShifts,
  } = useGetScheduledShiftsQuery(
    dateRange.from && dateRange.to
      ? { from: dateRange.from, to: dateRange.to }
      : {},
    {
      refetchOnMountOrArgChange: true,
    }
  );
  
  const [updateShiftStatus] = useUpdateShiftStatusMutation();
  const [deleteShift] = useDeleteScheduledShiftMutation();
  const [bulkUpdateStatus] = useBulkUpdateShiftStatusMutation();
  const [bulkDeleteShifts] = useBulkDeleteShiftsMutation();
  
  // Permission checks using new system
  const timesheetPermissions = useModulePermissions(PermissionModule.Timesheets);
  
  // Update shifts when API data changes
  useEffect(() => {
    if (shiftsResponse?.shifts) {
      const shiftsWithTimesheet = shiftsResponse.shifts.map(shift => ({
        ...shift,
        timesheet: shiftsResponse.timeSheet?.find(
          ts => ts.scheduledFleetId === shift.scheduledFleetId
        ),
        todayDate: shiftsResponse.todayDate,
      }));
      dispatch(setShifts(shiftsWithTimesheet));
    }
  }, [shiftsResponse, dispatch]);
  
  // Generate filter options from current data
  const filterOptions = useMemo(() => {
    return generateFilterOptions([...shifts, ...replicatedShifts]);
  }, [shifts, replicatedShifts]);
  
  // Apply filters and search
  const filteredShifts = useMemo(() => {
    let result = [...shifts, ...replicatedShifts];
    
    // Apply search
    if (searchTerm) {
      result = searchShifts(result, searchTerm);
    }
    
    // Apply filters
    result = filterShiftsByStatus(result, filters.status || 'all');
    result = filterShiftsByFleet(result, filters.fleet || 'all');
    result = filterShiftsByProject(result, filters.project || 'all');
    result = filterShiftsByOperator(result, filters.operator || 'all');
    result = filterShiftsByCustomer(result, filters.customer || 'all');
    
    // Apply sorting
    result = sortShifts(result, sortBy, sortOrder);
    
    return result;
  }, [shifts, replicatedShifts, searchTerm, filters, sortBy, sortOrder]);
  
  // Paginate results
  const paginatedData = useMemo(() => {
    return paginateShifts(filteredShifts, currentPage, pageSize);
  }, [filteredShifts, currentPage, pageSize]);
  
  // Handle status update
  const handleStatusUpdate = async (shiftId: string, newStatus: string) => {
    if (isUpdatingStatus) return;
    
    try {
      await updateShiftStatus({ scheduledFleetId: shiftId, status: newStatus as any }).unwrap();
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };
  
  // Handle delete
  const handleDelete = async (shiftId: string) => {
    try {
      await deleteShift(shiftId).unwrap();
      toast.success('Shift deleted successfully');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };
  
  // Handle bulk operations
  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedShiftIds.length === 0) {
      toast.error('Please select shifts to update');
      return;
    }
    
    try {
      await bulkUpdateStatus({ scheduledFleetIds: selectedShiftIds, status }).unwrap();
      toast.success(`Updated ${selectedShiftIds.length} shifts successfully`);
      dispatch(clearSelection());
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };
  
  const handleBulkDelete = async () => {
    if (selectedShiftIds.length === 0) {
      toast.error('Please select shifts to delete');
      return;
    }
    
    try {
      await bulkDeleteShifts(selectedShiftIds).unwrap();
      toast.success(`Deleted ${selectedShiftIds.length} shifts successfully`);
      dispatch(clearSelection());
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };
  
  // Handle edit
  const handleEdit = (shift: any) => {
    dispatch(setEditingShift(shift));
    dispatch(setIsEditModalOpen(true));
  };
  
  // Handle manage time
  const handleManageTime = (shift: any) => {
    dispatch(setEditingShift(shift));
    dispatch(setIsManageTimeModalOpen(true));
  };
  
  // Handle date range change
  const handleDateRangeChange = (from: string, to: string) => {
    dispatch(setDateRange({ from, to }));
  };
  
  // Render status badge
  const renderStatusBadge = (status: string) => {
    const config = getStatusConfig(status);
    return (
      <Badge className={`${config.bgColor} ${config.color} border-0`}>
        {status === 'working' && <Play className="h-3 w-3 mr-1" />}
        {status === 'standby' && <Pause className="h-3 w-3 mr-1" />}
        {status === 'Out of service' && <XCircle className="h-3 w-3 mr-1" />}
        {status === 'stopped' && <XCircle className="h-3 w-3 mr-1" />}
        {config.label}
      </Badge>
    );
  };
  
  // Render table view
  const renderTableView = () => (
    <Card>
      <CardHeader>
        <CardTitle>Timesheet Records</CardTitle>
        <CardDescription>
          {filteredShifts.length} shifts found
          {selectedShiftIds.length > 0 && ` (${selectedShiftIds.length} selected)`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {paginatedData.data.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No shifts found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || Object.values(filters).some(f => f !== 'all')
                ? 'No shifts match your current filters.'
                : 'No shifts have been scheduled yet.'}
            </p>
            <ManageButton module={PermissionModule.Timesheets} onClick={() => handleManageTimeToNavigate()}>
            manage timesheet
          </ManageButton>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedShiftIds.length === paginatedData.data.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          dispatch(selectAllShifts());
                        } else {
                          dispatch(clearSelection());
                        }
                      }}
                    />
                  </TableHead>
                  {TIMESHEET_TABLE_COLUMNS.map((column) => (
                    <TableHead
                      key={column.key}
                      className={column.sortable ? 'cursor-pointer hover:bg-muted/50' : ''}
                      onClick={() => {
                        if (column.sortable) {
                          dispatch(toggleSortOrder(column.key));
                        }
                      }}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{column.label}</span>
                        {column.sortable && sortBy === column.key && (
                          <span className="text-xs">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.data.map((shift) => (
                  <TableRow key={shift.scheduledFleetId}>
                    <TableCell>
                      <Checkbox
                        checked={selectedShiftIds.includes(shift.scheduledFleetId)}
                        onCheckedChange={() => {
                          dispatch(toggleShiftSelection(shift.scheduledFleetId));
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{shift.fleet?.vehicleName}</div>
                          <div className="text-sm text-muted-foreground">
                            {shift.fleet?.plateNumber}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>{shift.siteProject?.projectName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{getOperatorNames(shift)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {shift.shiftType} Shift
                      </Badge>
                    </TableCell>
                    <TableCell>{renderStatusBadge(shift.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>{formatHours(shift.timesheet?.totalMachineHours)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Op1: {formatHours(shift.timesheet?.totalOperatorHours1)}</div>
                        {shift.shiftType === 'double' && (
                          <div>Op2: {formatHours(shift.timesheet?.totalOperatorHours2)}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{formatDate(shift.scheduledDate)}</span>
                      </div>
                    </TableCell>
                    {/* <TableCell>
                      <ActionsDropdown
                          module={PermissionModule.Timesheets}
                          onView={() => handleEdit(shift)}
                          onEdit={() => handleEdit(shift)}
                          onDelete={() => handleDelete(shift.scheduledFleetId)}
                          onManage={() => handleManageTime(shift)}
                          trigger={
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          }
                        />
                    </TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Clock className="h-8 w-8 mr-3 text-primary" />
            Timesheets
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage fleet schedules and track working hours
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetchShifts()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <ManageButton module={PermissionModule.Timesheets} onClick={() => handleManageTimeToNavigate()}>
          manage timesheet
        </ManageButton>
        </div>
      </div>
      
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by machine, operator, fleet type, site, status, customer..."
              value={searchTerm}
              onChange={(e) => dispatch(setSearchTerm(e.target.value))}
              className="flex-1"
            />
          </div>
          
          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => dispatch(setFilters({ status: value as any }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {SHIFT_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={filters.fleet || 'all'}
              onValueChange={(value) => dispatch(setFilters({ fleet: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Fleet" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.fleetOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={filters.project || 'all'}
              onValueChange={(value) => dispatch(setFilters({ project: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.projectOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={filters.operator || 'all'}
              onValueChange={(value) => dispatch(setFilters({ operator: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Operator" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.operatorOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={filters.customer || 'all'}
              onValueChange={(value) => dispatch(setFilters({ customer: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Customer" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.customerOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Date Range */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Date Range:</span>
            </div>
            <Input
              type="date"
              value={dateRange.from || ''}
              onChange={(e) => handleDateRangeChange(e.target.value, dateRange.to || '')}
              className="w-40"
            />
            <span className="text-muted-foreground">to</span>
            <Input
              type="date"
              value={dateRange.to || ''}
              onChange={(e) => handleDateRangeChange(dateRange.from || '', e.target.value)}
              className="w-40"
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Bulk Actions */}
      {selectedShiftIds.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedShiftIds.length} shift(s) selected
              </span>
              <div className="flex items-center gap-2">
                <BulkActionsDropdown
                  module={PermissionModule.Timesheets}
                  selectedCount={selectedShiftIds.length}
                  onBulkDelete={handleBulkDelete}
                  onBulkStatusChange={handleBulkStatusUpdate}
                  availableStatuses={[
                    { value: 'working', label: 'Working' },
                    { value: 'standby', label: 'Standby' },
                    { value: 'Out of service', label: 'Out of Service' }
                  ]}
                  trigger={
                    <Button size="sm" variant="outline">
                      <MoreHorizontal className="h-4 w-4 mr-2" />
                      Actions ({selectedShiftIds.length})
                    </Button>
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">View:</span>
            <div className="flex items-center border rounded-md">
              {VIEW_MODE_OPTIONS.map((mode) => (
                <Button
                  key={mode.value}
                  variant={viewMode === mode.value ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => dispatch(setViewMode(mode.value as any))}
                  className="rounded-none first:rounded-l-md last:rounded-r-md"
                >
                  {mode.value === 'table' ? (
                    <List className="h-4 w-4" />
                  ) : (
                    <Grid className="h-4 w-4" />
                  )}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Show:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => dispatch(setPageSize(parseInt(value)))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Error Display */}
      {shiftsError && (
        <Alert>
          <AlertDescription>
            {getErrorMessage(shiftsError)}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Loading State */}
      {(isFetchingShifts || isLoading) && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading shifts...</span>
        </div>
      )}
      
      {/* Content */}
      {!isFetchingShifts && !isLoading && renderTableView()}
      
      {/* Pagination */}
      {paginatedData.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} to{' '}
            {Math.min(currentPage * pageSize, paginatedData.totalItems)} of{' '}
            {paginatedData.totalItems} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(setCurrentPage(currentPage - 1))}
              disabled={!paginatedData.hasPreviousPage}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {paginatedData.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(setCurrentPage(currentPage + 1))}
              disabled={!paginatedData.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimesheetList;
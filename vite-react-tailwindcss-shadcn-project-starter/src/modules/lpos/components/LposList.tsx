import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useRoleNavigation from '../../../utils/useNavigation';
import { NavigationPaths } from '../../../utils/navigationPaths';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  Building,
  User,
  Truck,
  StopCircle,
  AlertTriangle,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';

import { selectCurrentUser } from '../../../stores/slices/authSlice';
import { useSelector, useDispatch } from 'react-redux';
import {
  useGetLPOsQuery,
  useDeleteLPOMutation,
  useStopLPOMutation,
  useBulkDeleteLPOsMutation,
  useExportLPOsMutation,
} from '../../../stores/api/lposApiSlice';
import {
  selectLPOsPagination,
  selectLPOsSearch,
  selectLPOsFilters,
  selectSelectedLPOIds,
  selectLPOsViewMode,
  selectLPOsSorting,
  setCurrentPage,
  setPageSize,
  setSearchQuery,
  setFilters,
  toggleLPOSelection,
  selectAllLPOs,
  clearSelection,
  setViewMode,
  setSorting,
} from '../../../stores/slices/lposSlice';
import {
  LPO,
  LPOFilters,
  LPOStatus,
} from '../types';
import {
  LPO_FILTER_STATUS_OPTIONS,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  PERMISSIONS,
} from '../constants';
import {
  formatDate,
  getStatusConfig,
  getCustomerFullName,
  getProjectDisplayName,
  prepareLPOsForExport,
  getErrorMessage,
} from '../utils';
import {
  CreateButton,
  EditButton,
  DeleteButton,
  ViewButton,
  ExportButton,
  ActionsDropdown,
  PermissionModule,
  useModulePermissions,
} from '../../../components/permissions';

const LposList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const { roleNavigate } = useRoleNavigation();
  
  // Redux state
  const pagination = useSelector(selectLPOsPagination);
  const searchQuery = useSelector(selectLPOsSearch);
  const filters = useSelector(selectLPOsFilters);
  const selectedLpoIds = useSelector(selectSelectedLPOIds);
  const viewMode = useSelector(selectLPOsViewMode);
  const sorting = useSelector(selectLPOsSorting);
  
  // Local state
  const [showFilters, setShowFilters] = useState(false);
  
  // API hooks
  const {
    data: lposResponse,
    isLoading,
    error: lposError,
    refetch,
  } = useGetLPOsQuery({
    page: pagination.currentPage,
    limit: pagination.pageSize,
    search: searchQuery,
    filters,
  });
  
  const [deleteLPOMutation, { isLoading: isDeleting }] = useDeleteLPOMutation();
  const [stopLPOMutation, { isLoading: isStopping }] = useStopLPOMutation();
  const [exportLPOsMutation] = useExportLPOsMutation();
  const [bulkDeleteLPOsMutation] = useBulkDeleteLPOsMutation();
  
  // Extract data from response
  const lpos = lposResponse?.lpos || [];
  const fleetsByLpo = lposResponse?.fleetsByLpo || {};
  
  // Modal states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stopDialogOpen, setStopDialogOpen] = useState(false);
  const [selectedLpoId, setSelectedLpoId] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Error handling
  const error = lposError ? getErrorMessage(lposError) : null;

  // Show error toast when API error occurs
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Handlers
  const handleSearch = (value: string) => {
    dispatch(setSearchQuery(value));
  };

  const handleStatusFilter = (status: string) => {
    dispatch(setFilters({ ...filters, status: status as LPOStatus | 'all' }));
  };

  const handleDateRangeFilter = (range: { from: Date; to: Date } | undefined) => {
    dispatch(setFilters({
      ...filters,
      dateRange: range ? {
        from: range.from.toISOString().split('T')[0],
        to: range.to.toISOString().split('T')[0],
      } : undefined,
    }));
  };

  const handleSort = (column: string) => {
    if (sorting.sortBy === column) {
      dispatch(setSorting({ sortBy: column, sortOrder: sorting.sortOrder === 'asc' ? 'desc' : 'asc' }));
    } else {
      dispatch(setSorting({ sortBy: column, sortOrder: 'asc' }));
    }
  };

  const handleSelectLpo = (lpoId: string, checked: boolean) => {
    dispatch(toggleLPOSelection(lpoId));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      dispatch(selectAllLPOs(lpos.map(lpo => lpo.lpoId)));
    } else {
      dispatch(clearSelection());
    }
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  const handlePageSizeChange = (size: number) => {
    dispatch(setPageSize(size));
  };

  const handleDelete = async () => {
    if (!selectedLpoId) return;
    
    try {
      await deleteLPOMutation(selectedLpoId).unwrap();
      toast.success('LPO deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedLpoId(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleStop = async () => {
    if (!selectedLpoId) return;
    
    try {
      await stopLPOMutation(selectedLpoId).unwrap();
      toast.success('LPO stopped successfully');
      setStopDialogOpen(false);
      setSelectedLpoId(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleExport = async () => {
    try {
      const exportData = {
        format: 'csv' as const,
        filters,
        fields: ['lpoNumber', 'customer', 'siteProject', 'status', 'lpoStartDate', 'lpoEndDate'],
      };
      
      const blob = await exportLPOsMutation(exportData).unwrap();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lpos-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('LPOs exported successfully');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDownloadPDF = async (lpo: LPO) => {
    setIsGeneratingPDF(true);
    try {
      // Dynamic import for html2pdf to avoid SSR issues
      const html2pdf = (await import('html2pdf.js')).default;
      
      // Create a temporary element with LPO content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = `
        <div style="font-family: 'Times New Roman', serif; padding: 20px; color: #000;">
          <div style="text-align: center; border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 24px;">IMPRESSIVE TRADING & CONTRACTING CO.</h1>
            <p style="margin: 5px 0; font-size: 14px;">P.O. Box-30961, DOHA – QATAR</p>
            <p style="margin: 5px 0; font-size: 14px;">Mob. No.: 55855163</p>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div><strong>Ref. No: <span style="text-decoration: underline;">${lpo.referenceNumber}</span></strong></div>
            <div><strong>LPO No: ${lpo.lpoNumber}</strong></div>
          </div>
          
          <p style="margin-bottom: 15px;">This Local Purchase Order is issued on <strong>${new Date().toLocaleDateString()}</strong></p>
          
          <p style="font-weight: bold; text-align: center; margin: 20px 0;">PURCHASE ORDER DETAILS</p>
          
          <p style="margin-bottom: 15px;">
            <strong style="text-decoration: underline;">${lpo.customer?.firstname || ''} ${lpo.customer?.lastname || ''}</strong>
            with offices at <strong>${lpo.address}</strong><br/>
            Designation: <strong>${lpo.designation}</strong>
          </p>
          
          <p style="margin-bottom: 15px;">
            <strong>Purpose:</strong> ${lpo.purpose}<br/>
            <strong>Duration:</strong> ${lpo.lpoStartDate} to ${lpo.lpoEndDate}<br/>
            <strong>Status:</strong> ${lpo.status}
          </p>
          
          <div style="margin-top: 30px;">
            ${lpo.termsAndCondition || 'Standard terms and conditions apply.'}
          </div>
        </div>
      `;
      
      document.body.appendChild(tempDiv);
      
      const options = {
        margin: [10, 5, 0, 5],
        filename: `LPO_${lpo.lpoNumber}_${lpo.purpose?.replace(/[^a-zA-Z0-9]/g, '_') || 'Document'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };
      
      await html2pdf().set(options).from(tempDiv).save();
      document.body.removeChild(tempDiv);
      
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error('PDF generation failed:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Permission checks using new system
  const lposPermissions = useModulePermissions(PermissionModule.LPOS);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading LPOs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">LPOs</h1>
          <p className="text-muted-foreground">
            Manage Local Purchase Orders and fleet assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton module={PermissionModule.LPOS} variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </ExportButton>
          <CreateButton module={PermissionModule.LPOS} onClick={() => roleNavigate(NavigationPaths.LPO.CREATE)}>
            <Plus className="h-4 w-4 mr-2" />
            Create LPO
          </CreateButton>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search LPOs..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filters.status || 'all'} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {LPO_FILTER_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
          {showFilters && (
            <div className="pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Date Range</Label>
                  <DatePickerWithRange
                    onSelect={handleDateRangeFilter}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {pagination.totalLPOs} LPO{pagination.totalLPOs !== 1 ? 's' : ''}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={pagination.pageSize.toString()} onValueChange={(value) => handlePageSizeChange(Number(value))}>
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
        </CardHeader>
        <CardContent>
          {lpos.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No LPOs found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || (filters.status && filters.status !== 'all') ? 'Try adjusting your search or filters' : 'Get started by creating your first LPO'}
              </p>
              <CreateButton module={PermissionModule.LPOS} fallback={null}>
                {!searchQuery && (!filters.status || filters.status === 'all') && (
                  <Button onClick={() => roleNavigate(NavigationPaths.LPO.CREATE)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create LPO
                  </Button>
                )}
              </CreateButton>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedLpoIds.length === lpos.length && lpos.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('lpoNumber')}
                    >
                      LPO Number
                      {sorting.sortBy === 'lpoNumber' && (
                        <span className="ml-1">{sorting.sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('customer')}
                    >
                      Customer
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('siteProject')}
                    >
                      Project
                    </TableHead>
                    <TableHead>Fleets</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('lpoStartDate')}
                    >
                      Start Date
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('lpoEndDate')}
                    >
                      End Date
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('status')}
                    >
                      Status
                    </TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lpos.map((lpo) => {
                    const statusConfig = getStatusConfig(lpo.status);
                    const fleetCount = lpo.fleetIds?.length || 0;
                    
                    return (
                      <TableRow key={lpo.lpoId}>
                        <TableCell>
                          <Checkbox
                            checked={selectedLpoIds.includes(lpo.lpoId)}
                            onCheckedChange={(checked) => handleSelectLpo(lpo.lpoId, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {lpo.lpoNumber}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {lpo.customer ? getCustomerFullName(lpo.customer) : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            {lpo.siteProject ? getProjectDisplayName(lpo.siteProject) : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            {fleetCount} Fleet{fleetCount !== 1 ? 's' : ''}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(lpo.lpoStartDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(lpo.lpoEndDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusConfig.bgColor} ${statusConfig.color}`}>
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => roleNavigate(NavigationPaths.LPO.VIEW(lpo.lpoId))}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => roleNavigate(NavigationPaths.LPO.PDF(lpo.lpoId))}>
                                <FileText className="h-4 w-4 mr-2" />
                                PDF Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownloadPDF(lpo)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => roleNavigate(NavigationPaths.LPO.EDIT(lpo.lpoId))}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedLpoId(lpo.lpoId);
                                  setStopDialogOpen(true);
                                }}
                                disabled={lpo.status === 'Stopped' || lpo.status === 'Completed'}
                              >
                                <StopCircle className="h-4 w-4 mr-2" />
                                Stop LPO
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedLpoId(lpo.lpoId);
                                  setDeleteDialogOpen(true);
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {Math.ceil(pagination.totalLPOs / pagination.pageSize) > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalLPOs)} of {pagination.totalLPOs} results
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.max(1, pagination.currentPage - 1))}
                      disabled={pagination.currentPage <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, Math.ceil(pagination.totalLPOs / pagination.pageSize)) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <Button
                            key={pageNum}
                            variant={pagination.currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.min(Math.ceil(pagination.totalLPOs / pagination.pageSize), pagination.currentPage + 1))}
                      disabled={pagination.currentPage >= Math.ceil(pagination.totalLPOs / pagination.pageSize)}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete LPO</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this LPO? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stop Dialog */}
      <AlertDialog open={stopDialogOpen} onOpenChange={setStopDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop LPO</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to stop this LPO? This will change its status to "Stopped".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStop}
              disabled={isStopping}
              className="bg-yellow-600 text-white hover:bg-yellow-700"
            >
              {isStopping && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Stop LPO
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LposList;
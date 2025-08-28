import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  Building,
  User,
  DollarSign,
  AlertTriangle,
  CreditCard,
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
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
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
import { toast } from 'sonner';

import {
  useGetPurchasesQuery,
  useGetSuppliersQuery,
  useUpdatePurchasePaymentStatusMutation,
  useExportPurchasesMutation,
} from '../../../stores/api/fleetPurchasesApiSlice';
import {
  selectPurchasesState,
  setPurchaseFilters,
  setPurchaseSearchQuery,
  setPurchasePagination,
  setPurchaseSorting,
  togglePurchaseSelection,
  selectAllPurchases,
  clearPurchaseSelection,
} from '../../../stores/slices/fleetPurchasesSlice';
import {
  ViewButton,
  ExportButton,
  ActionsDropdown,
  BulkActionsDropdown,
  PermissionModule,
} from '../../../components/permissions';
import {
  PAYMENT_STATUS_OPTIONS,
  PAGE_SIZE_OPTIONS,
  PURCHASES_TABLE_COLUMNS,
} from '../constants';
import {
  formatDate,
  formatCurrency,
  getPaymentStatusConfig,
  searchPurchases,
  calculateTotalPages,
  getErrorMessage,
} from '../utils';
import type { FleetPurchase } from '../types';

const FleetPurchases: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const purchasesState = useSelector(selectPurchasesState);
  
  const {
    purchases,
    selectedPurchaseIds,
    filters,
    searchQuery,
    pagination,
    sorting,
    viewMode,
    isLoading,
    error,
  } = purchasesState;
  
  // Local state
  const [showFilters, setShowFilters] = useState(false);
  
  // API hooks
  const {
    data: purchasesResponse,
    isLoading: isFetchingPurchases,
    error: fetchError,
    refetch,
  } = useGetPurchasesQuery({
    page: pagination.currentPage,
    limit: pagination.pageSize,
    search: searchQuery,
    filters,
  });
  
  const { data: suppliersResponse } = useGetSuppliersQuery();
  const [updatePaymentStatus] = useUpdatePurchasePaymentStatusMutation();
  const [exportPurchases, { isLoading: isExporting }] = useExportPurchasesMutation();
  
  // Extract data from responses
  const purchasesList = purchasesResponse?.purchases || [];
  const totalPurchases = purchasesResponse?.total || 0;
  const suppliers = suppliersResponse?.suppliers || [];
  
  // Update pagination when data changes
  useEffect(() => {
    if (purchasesResponse) {
      dispatch(setPurchasePagination({
        total: purchasesResponse.total,
        totalPages: calculateTotalPages(purchasesResponse.total, pagination.pageSize),
      }));
    }
  }, [purchasesResponse, pagination.pageSize, dispatch]);
  
  // Error handling
  useEffect(() => {
    if (fetchError) {
      toast.error(getErrorMessage(fetchError));
    }
  }, [fetchError]);
  
  // Handlers
  const handleSearch = (value: string) => {
    dispatch(setPurchaseSearchQuery(value));
  };
  
  const handleFilterChange = (key: string, value: string) => {
    dispatch(setPurchaseFilters({ ...filters, [key]: value || undefined }));
  };
  
  const clearFilters = () => {
    dispatch(setPurchaseFilters({}));
    dispatch(setPurchaseSearchQuery(''));
  };
  
  const handlePageChange = (page: number) => {
    dispatch(setPurchasePagination({ currentPage: page }));
  };
  
  const handlePageSizeChange = (size: string) => {
    dispatch(setPurchasePagination({ 
      pageSize: parseInt(size), 
      currentPage: 1 
    }));
  };
  
  const handleSort = (field: string) => {
    const newDirection = sorting.field === field && sorting.direction === 'asc' ? 'desc' : 'asc';
    dispatch(setPurchaseSorting({ field, direction: newDirection }));
  };
  
  const handleSelectAll = () => {
    if (selectedPurchaseIds.length === purchasesList.length) {
      dispatch(clearPurchaseSelection());
    } else {
      dispatch(selectAllPurchases(purchasesList.map(purchase => purchase.fleetPurchaseId)));
    }
  };
  
  const handleSelectPurchase = (purchaseId: string) => {
    dispatch(togglePurchaseSelection(purchaseId));
  };
  
  const handleView = (purchase: FleetPurchase) => {
    navigate(`/purchases-fleet/view/${purchase.fleetPurchaseId}`);
  };
  
  const handleUpdatePaymentStatus = async (purchaseId: string, status: string) => {
    try {
      await updatePaymentStatus({
        fleetPurchaseId: purchaseId,
        paymentStatus: status as any,
      }).unwrap();
      toast.success('Payment status updated successfully');
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    }
  };
  
  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const blob = await exportPurchases({ format, filters }).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `fleet-purchases.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Purchases exported successfully');
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    }
  };
  
  // Render loading state
  if (isFetchingPurchases && purchasesList.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading purchases...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Receipt className="h-8 w-8 mr-3 text-primary" />
            Fleet Purchases
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage fleet purchase invoices and payment tracking
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <ExportButton 
            module={PermissionModule.PurchasesFleet} 
            variant="outline" 
            onClick={() => handleExport('csv')}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </ExportButton>
        </div>
      </div>
      
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by invoice number, supplier, or order number..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-muted' : ''}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
          
          {showFilters && (
            <>
              <Separator className="my-4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Payment Status</label>
                  <Select
                    value={filters.status || ''}
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      {PAYMENT_STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Supplier</label>
                  <Select
                    value={filters.supplierId || ''}
                    onValueChange={(value) => handleFilterChange('supplierId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All suppliers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All suppliers</SelectItem>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.fleetSupplierId} value={supplier.fleetSupplierId}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button onClick={clearFilters} variant="outline" className="w-full">
                    Clear Filters
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Bulk Actions */}
      {selectedPurchaseIds.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedPurchaseIds.length} purchase(s) selected
              </span>
              <div className="flex gap-2">
                <BulkActionsDropdown
                  module={PermissionModule.PurchasesFleet}
                  selectedCount={selectedPurchaseIds.length}
                  onBulkExport={() => handleExport('csv')}
                  trigger={
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4 mr-2" />
                      Actions ({selectedPurchaseIds.length})
                    </Button>
                  }
                />
                <Button onClick={() => dispatch(clearPurchaseSelection())} variant="outline" size="sm">
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Showing {purchasesList.length} of {totalPurchases} purchases
          </span>
        </div>
      </div>
      
      {/* Purchases Table */}
      {error ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load purchases. Please try again.
          </AlertDescription>
        </Alert>
      ) : purchasesList.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No purchases found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || Object.keys(filters).some(key => filters[key as keyof typeof filters])
                ? 'No purchases match your search criteria.'
                : 'No purchase invoices have been created yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedPurchaseIds.length === purchasesList.length && purchasesList.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                {PURCHASES_TABLE_COLUMNS.map((column) => (
                  <TableHead 
                    key={column.key}
                    className={column.sortable ? 'cursor-pointer hover:bg-muted/50' : ''}
                    onClick={column.sortable ? () => handleSort(column.key) : undefined}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {column.sortable && sorting.field === column.key && (
                        <span className="text-xs">
                          {sorting.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchasesList.map((purchase) => {
                const statusConfig = getPaymentStatusConfig(purchase.paymentStatus);
                
                return (
                  <TableRow key={purchase.fleetPurchaseId} className="hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedPurchaseIds.includes(purchase.fleetPurchaseId)}
                        onCheckedChange={() => handleSelectPurchase(purchase.fleetPurchaseId)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {purchase.invoiceNumber}
                    </TableCell>
                    <TableCell>{purchase.fleetPurchaseOrder?.FleetSupplier?.name || 'N/A'}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(purchase.fleetPurchaseOrder?.total || 0)}
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      {formatCurrency(purchase.paidAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig.color}>
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(purchase.invoiceDate)}</TableCell>
                    <TableCell>
                      <ActionsDropdown
                        module={PermissionModule.PurchasesFleet}
                        onView={() => handleView(purchase)}
                        trigger={
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        }
                      >
                        {/* Additional custom menu items */}
                        {PAYMENT_STATUS_OPTIONS.map((status) => {
                          if (status.value !== purchase.paymentStatus) {
                            return (
                              <Button
                                key={status.value}
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start"
                                onClick={() => handleUpdatePaymentStatus(purchase.fleetPurchaseId, status.value)}
                              >
                                <CreditCard className="h-4 w-4 mr-2" />
                                Mark as {status.label}
                              </Button>
                            );
                          }
                          return null;
                        })}
                      </ActionsDropdown>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
      
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Rows per page:</span>
                <Select value={pagination.pageSize.toString()} onValueChange={handlePageSizeChange}>
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
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FleetPurchases;
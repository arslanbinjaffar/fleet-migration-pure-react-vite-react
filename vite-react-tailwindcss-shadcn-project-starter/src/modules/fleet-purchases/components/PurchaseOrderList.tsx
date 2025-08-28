import React, { useState, useEffect, useMemo } from 'react';
import useRoleNavigation from '../../../utils/useNavigation';
import { NavigationPaths } from '../../../utils/navigationPaths';
import { useSelector, useDispatch } from 'react-redux';
import {
  FileText,
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
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
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
  useGetPurchaseOrdersQuery,
  useGetSuppliersQuery,
  useGetWarehousesQuery,
  useDeletePurchaseOrderMutation,
  useBulkDeletePurchaseOrdersMutation,
  useUpdatePurchaseOrderStatusMutation,
  useExportPurchaseOrdersMutation,
} from '../../../stores/api/fleetPurchasesApiSlice';
import {
  selectPurchaseOrdersState,
  selectUIState,
  setPurchaseOrderFilters,
  setPurchaseOrderSearchQuery,
  setPurchaseOrderPagination,
  setPurchaseOrderSorting,
  setPurchaseOrderViewMode,
  togglePurchaseOrderSelection,
  selectAllPurchaseOrders,
  clearPurchaseOrderSelection,
  setCurrentPurchaseOrder,
  setDeleteConfirmDialogOpen,
  setBulkDeleteConfirmDialogOpen,
  setCreateOrderModalOpen,
  setEditOrderModalOpen,
  setViewOrderModalOpen,
} from '../../../stores/slices/fleetPurchasesSlice';
import {
  CreateButton,
  EditButton,
  DeleteButton,
  ViewButton,
  ExportButton,
  ActionsDropdown,
  BulkActionsDropdown,
  PermissionModule,
} from '../../../components/permissions';
import {
  ORDER_STATUS_OPTIONS,
  PAGE_SIZE_OPTIONS,
  PURCHASE_ORDER_TABLE_COLUMNS,
  DEFAULT_PAGE_SIZE,
} from '../constants';
import {
  formatDate,
  formatCurrency,
  getOrderStatusConfig,
  searchPurchaseOrders,
  filterPurchaseOrdersByStatus,
  filterPurchaseOrdersBySupplier,
  filterPurchaseOrdersByWarehouse,
  filterPurchaseOrdersByDateRange,
  sortPurchaseOrders,
  paginateData,
  calculateTotalPages,
  getErrorMessage,
} from '../utils';
import type { FleetPurchaseOrder } from '../types';

const PurchaseOrderList: React.FC = () => {
  const { roleNavigate } = useRoleNavigation();
  const dispatch = useDispatch();
  
  // Redux state
  const purchaseOrdersState = useSelector(selectPurchaseOrdersState);
  const uiState = useSelector(selectUIState);
  
  const {
    orders,
    selectedOrderIds,
    currentOrder,
    filters,
    searchQuery,
    pagination,
    sorting,
    viewMode,
    isLoading,
    error,
  } = purchaseOrdersState;
  
  // Local state
  const [showFilters, setShowFilters] = useState(false);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  
  // API hooks
  const {
    data: purchaseOrdersResponse,
    isLoading: isFetchingOrders,
    error: fetchError,
    refetch,
  } = useGetPurchaseOrdersQuery({
    page: pagination.currentPage,
    limit: pagination.pageSize,
    search: searchQuery,
    filters,
  });
  
  const { data: suppliersResponse } = useGetSuppliersQuery();
  const { data: warehousesResponse } = useGetWarehousesQuery();
  
  const [deletePurchaseOrder, { isLoading: isDeleting }] = useDeletePurchaseOrderMutation();
  const [bulkDeletePurchaseOrders, { isLoading: isBulkDeleting }] = useBulkDeletePurchaseOrdersMutation();
  const [updateOrderStatus] = useUpdatePurchaseOrderStatusMutation();
  const [exportPurchaseOrders, { isLoading: isExporting }] = useExportPurchaseOrdersMutation();
  
  // Extract data from responses
  const purchaseOrders = purchaseOrdersResponse?.purchaseOrders || [];
  const totalOrders = purchaseOrdersResponse?.total || 0;
  const suppliers = suppliersResponse?.suppliers || [];
  const warehouses = warehousesResponse?.warehouses || [];
  
  // Update pagination when data changes
  useEffect(() => {
    if (purchaseOrdersResponse) {
      dispatch(setPurchaseOrderPagination({
        total: purchaseOrdersResponse.total,
        totalPages: calculateTotalPages(purchaseOrdersResponse.total, pagination.pageSize),
      }));
    }
  }, [purchaseOrdersResponse, pagination.pageSize, dispatch]);
  
  // Error handling
  useEffect(() => {
    if (fetchError) {
      toast.error(getErrorMessage(fetchError));
    }
  }, [fetchError]);
  
  // Handlers
  const handleSearch = (value: string) => {
    dispatch(setPurchaseOrderSearchQuery(value));
  };
  
  const handleFilterChange = (key: string, value: string) => {
    dispatch(setPurchaseOrderFilters({ ...filters, [key]: value || undefined }));
  };
  
  const clearFilters = () => {
    dispatch(setPurchaseOrderFilters({}));
    dispatch(setPurchaseOrderSearchQuery(''));
  };
  
  const handlePageChange = (page: number) => {
    dispatch(setPurchaseOrderPagination({ currentPage: page }));
  };
  
  const handlePageSizeChange = (size: string) => {
    dispatch(setPurchaseOrderPagination({ 
      pageSize: parseInt(size), 
      currentPage: 1 
    }));
  };
  
  const handleSort = (field: string) => {
    const newDirection = sorting.field === field && sorting.direction === 'asc' ? 'desc' : 'asc';
    dispatch(setPurchaseOrderSorting({ field, direction: newDirection }));
  };
  
  const handleSelectAll = () => {
    if (selectedOrderIds.length === purchaseOrders.length) {
      dispatch(clearPurchaseOrderSelection());
    } else {
      dispatch(selectAllPurchaseOrders(purchaseOrders.map(order => order.fleetPurchaseOrderId)));
    }
  };
  
  const handleSelectOrder = (orderId: string) => {
    dispatch(togglePurchaseOrderSelection(orderId));
  };
  
  const handleCreate = () => {
    roleNavigate(NavigationPaths.FLEET_PURCHASES.CREATE_PURCHASE_ORDER);
  };
  
  const handleView = (order: FleetPurchaseOrder) => {
    roleNavigate(NavigationPaths.FLEET_PURCHASES.VIEW_PURCHASE_ORDER(order.fleetPurchaseOrderId));
  };
  
  const handleEdit = (order: FleetPurchaseOrder) => {
    roleNavigate(NavigationPaths.FLEET_PURCHASES.EDIT_PURCHASE_ORDER(order.fleetPurchaseOrderId));
  };
  
  const handleDelete = async (orderId: string) => {
    try {
      await deletePurchaseOrder(orderId).unwrap();
      toast.success('Purchase order deleted successfully');
      dispatch(clearPurchaseOrderSelection());
      setDeleteOrderId(null);
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    }
  };
  
  const handleBulkDelete = async () => {
    if (selectedOrderIds.length === 0) return;
    
    try {
      await bulkDeletePurchaseOrders({ ids: selectedOrderIds }).unwrap();
      toast.success(`${selectedOrderIds.length} purchase order(s) deleted successfully`);
      dispatch(clearPurchaseOrderSelection());
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    }
  };
  
  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus({
        fleetPurchaseOrderId: orderId,
        orderStatus: status as any,
      }).unwrap();
      toast.success('Order status updated successfully');
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    }
  };
  
  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const blob = await exportPurchaseOrders({ format, filters }).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `purchase-orders.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Purchase orders exported successfully');
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    }
  };
  
  // Render loading state
  if (isFetchingOrders && purchaseOrders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading purchase orders...</span>
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
            <FileText className="h-8 w-8 mr-3 text-primary" />
            Purchase Orders
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage fleet purchase orders and procurement
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <ExportButton 
            module={PermissionModule.PurchaseOrderFleet} 
            variant="outline" 
            onClick={() => handleExport('csv')}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </ExportButton>
          <CreateButton module={PermissionModule.PurchaseOrderFleet} onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Order
          </CreateButton>
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
                  placeholder="Search by order number, supplier, or warehouse..."
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={filters.status || ''}
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      {ORDER_STATUS_OPTIONS.map((status) => (
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
                
                <div>
                  <label className="text-sm font-medium">Warehouse</label>
                  <Select
                    value={filters.warehouseId || ''}
                    onValueChange={(value) => handleFilterChange('warehouseId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All warehouses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All warehouses</SelectItem>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.warehouseId} value={warehouse.warehouseId}>
                          {warehouse.name}
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
      {selectedOrderIds.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedOrderIds.length} order(s) selected
              </span>
              <div className="flex gap-2">
                <BulkActionsDropdown
                  module={PermissionModule.PurchaseOrderFleet}
                  selectedCount={selectedOrderIds.length}
                  onBulkDelete={handleBulkDelete}
                  onBulkExport={() => handleExport('csv')}
                  trigger={
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4 mr-2" />
                      Actions ({selectedOrderIds.length})
                    </Button>
                  }
                />
                <Button onClick={() => dispatch(clearPurchaseOrderSelection())} variant="outline" size="sm">
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
            Showing {purchaseOrders.length} of {totalOrders} orders
          </span>
        </div>
      </div>
      
      {/* Purchase Orders Table */}
      {error ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load purchase orders. Please try again.
          </AlertDescription>
        </Alert>
      ) : purchaseOrders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No purchase orders found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || Object.keys(filters).some(key => filters[key as keyof typeof filters])
                ? 'No orders match your search criteria.'
                : 'Get started by creating your first purchase order.'}
            </p>
            {!searchQuery && !Object.keys(filters).some(key => filters[key as keyof typeof filters]) && (
              <CreateButton module={PermissionModule.PurchaseOrderFleet} onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create Order
              </CreateButton>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedOrderIds.length === purchaseOrders.length && purchaseOrders.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                {PURCHASE_ORDER_TABLE_COLUMNS.map((column) => (
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
              {purchaseOrders.map((order) => {
                const statusConfig = getOrderStatusConfig(order.orderStatus);
                
                return (
                  <TableRow key={order.fleetPurchaseOrderId} className="hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedOrderIds.includes(order.fleetPurchaseOrderId)}
                        onCheckedChange={() => handleSelectOrder(order.fleetPurchaseOrderId)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      #{order.orderNumber}
                    </TableCell>
                    <TableCell>{order.FleetSupplier?.name || 'N/A'}</TableCell>
                    <TableCell>{order.warehouse?.name || 'N/A'}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig.color}>
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(order.orderDate)}</TableCell>
                    <TableCell>
                      <ActionsDropdown
                        module={PermissionModule.PurchaseOrderFleet}
                        onView={() => handleView(order)}
                        onEdit={() => handleEdit(order)}
                        onDelete={() => setDeleteOrderId(order.fleetPurchaseOrderId)}
                        trigger={
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        }
                      />
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
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteOrderId} onOpenChange={() => setDeleteOrderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Purchase Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this purchase order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteOrderId && handleDelete(deleteOrderId)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PurchaseOrderList;
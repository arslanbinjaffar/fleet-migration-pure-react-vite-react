import React, { useState, useEffect } from 'react';
import useRoleNavigation from '../../../utils/useNavigation';
import { NavigationPaths } from '../../../utils/navigationPaths';
import { useSelector, useDispatch } from 'react-redux';
import {
  Users,
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
  Mail,
  Phone,
  Building,
  FileText,
  CreditCard,
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
  useGetSuppliersQuery,
  useDeleteSupplierMutation,
  useBulkDeleteSuppliersMutation,
  useExportSuppliersMutation,
} from '../../../stores/api/fleetPurchasesApiSlice';
import {
  selectSuppliersState,
  setSupplierFilters,
  setSupplierSearchQuery,
  setSupplierPagination,
  setSupplierSorting,
  setSupplierViewMode,
  toggleSupplierSelection,
  selectAllSuppliers,
  clearSupplierSelection,
  setCurrentSupplier,
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
  PAGE_SIZE_OPTIONS,
  SUPPLIERS_TABLE_COLUMNS,
} from '../constants';
import {
  formatDate,
  formatCurrency,
  searchSuppliers,
  filterSuppliersByStatus,
  sortSuppliers,
  calculateTotalPages,
  getErrorMessage,
  getSupplierDisplayName,
} from '../utils';
import type { FleetSupplier } from '../types';

const SupplierList: React.FC = () => {
  const { roleNavigate } = useRoleNavigation();
  const dispatch = useDispatch();
  
  // Redux state
  const suppliersState = useSelector(selectSuppliersState);
  
  const {
    suppliers,
    selectedSupplierIds,
    currentSupplier,
    filters,
    searchQuery,
    pagination,
    sorting,
    viewMode,
    isLoading,
    error,
  } = suppliersState;
  
  // Local state
  const [showFilters, setShowFilters] = useState(false);
  const [deleteSupplierId, setDeleteSupplierId] = useState<string | null>(null);
  
  // API hooks
  const {
    data: suppliersResponse,
    isLoading: isFetchingSuppliers,
    error: fetchError,
    refetch,
  } = useGetSuppliersQuery({
    page: pagination.currentPage,
    limit: pagination.pageSize,
    search: searchQuery,
    filters,
  });
  
  const [deleteSupplier, { isLoading: isDeleting }] = useDeleteSupplierMutation();
  const [bulkDeleteSuppliers, { isLoading: isBulkDeleting }] = useBulkDeleteSuppliersMutation();
  const [exportSuppliers, { isLoading: isExporting }] = useExportSuppliersMutation();
  
  // Extract data from response
  const suppliersList = suppliersResponse?.suppliers || [];
  const totalSuppliers = suppliersResponse?.total || 0;
  
  // Update pagination when data changes
  useEffect(() => {
    if (suppliersResponse) {
      dispatch(setSupplierPagination({
        total: suppliersResponse.total,
        totalPages: calculateTotalPages(suppliersResponse.total, pagination.pageSize),
      }));
    }
  }, [suppliersResponse, pagination.pageSize, dispatch]);
  
  // Error handling
  useEffect(() => {
    if (fetchError) {
      toast.error(getErrorMessage(fetchError));
    }
  }, [fetchError]);
  
  // Handlers
  const handleSearch = (value: string) => {
    dispatch(setSupplierSearchQuery(value));
  };
  
  const handleFilterChange = (key: string, value: string | boolean) => {
    dispatch(setSupplierFilters({ ...filters, [key]: value }));
  };
  
  const clearFilters = () => {
    dispatch(setSupplierFilters({}));
    dispatch(setSupplierSearchQuery(''));
  };
  
  const handlePageChange = (page: number) => {
    dispatch(setSupplierPagination({ currentPage: page }));
  };
  
  const handlePageSizeChange = (size: string) => {
    dispatch(setSupplierPagination({ 
      pageSize: parseInt(size), 
      currentPage: 1 
    }));
  };
  
  const handleSort = (field: string) => {
    const newDirection = sorting.field === field && sorting.direction === 'asc' ? 'desc' : 'asc';
    dispatch(setSupplierSorting({ field, direction: newDirection }));
  };
  
  const handleSelectAll = () => {
    if (selectedSupplierIds.length === suppliersList.length) {
      dispatch(clearSupplierSelection());
    } else {
      dispatch(selectAllSuppliers(suppliersList.map(supplier => supplier.fleetSupplierId)));
    }
  };
  
  const handleSelectSupplier = (supplierId: string) => {
    dispatch(toggleSupplierSelection(supplierId));
  };
  
  const handleCreate = () => {
    roleNavigate(NavigationPaths.FLEET_PURCHASES.CREATE_SUPPLIER);
  };
  
  const handleView = (supplier: FleetSupplier) => {
    roleNavigate(NavigationPaths.FLEET_PURCHASES.VIEW_SUPPLIER(supplier.fleetSupplierId));
  };
  
  const handleEdit = (supplier: FleetSupplier) => {
    roleNavigate(NavigationPaths.FLEET_PURCHASES.EDIT_SUPPLIER(supplier.fleetSupplierId));
  };
  
  const handleViewLedger = (supplier: FleetSupplier) => {
    roleNavigate(NavigationPaths.FLEET_PURCHASES.SUPPLIER_LEDGER(supplier.fleetSupplierId));
  };
  
  const handleAddPayment = (supplier: FleetSupplier) => {
    roleNavigate(`${NavigationPaths.FLEET_PURCHASES.ADD_PAYMENT}?supplierId=${supplier.fleetSupplierId}`);
  };
  
  const handleDelete = async (supplierId: string) => {
    try {
      await deleteSupplier(supplierId).unwrap();
      toast.success('Supplier deleted successfully');
      dispatch(clearSupplierSelection());
      setDeleteSupplierId(null);
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    }
  };
  
  const handleBulkDelete = async () => {
    if (selectedSupplierIds.length === 0) return;
    
    try {
      await bulkDeleteSuppliers({ ids: selectedSupplierIds }).unwrap();
      toast.success(`${selectedSupplierIds.length} supplier(s) deleted successfully`);
      dispatch(clearSupplierSelection());
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    }
  };
  
  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const blob = await exportSuppliers({ format, filters }).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `suppliers.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Suppliers exported successfully');
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    }
  };
  
  // Render loading state
  if (isFetchingSuppliers && suppliersList.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading suppliers...</span>
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
            <Users className="h-8 w-8 mr-3 text-primary" />
            Fleet Suppliers
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your fleet suppliers and vendor relationships
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <ExportButton 
            module={PermissionModule.SupplierFleet} 
            variant="outline" 
            onClick={() => handleExport('csv')}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </ExportButton>
          <CreateButton module={PermissionModule.SupplierFleet} onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
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
                  placeholder="Search by name, email, phone, or TRN..."
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
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                    onValueChange={(value) => handleFilterChange('isActive', value === '' ? undefined : value === 'true')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="md:col-span-2 flex items-end">
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
      {selectedSupplierIds.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedSupplierIds.length} supplier(s) selected
              </span>
              <div className="flex gap-2">
                <BulkActionsDropdown
                  module={PermissionModule.SupplierFleet}
                  selectedCount={selectedSupplierIds.length}
                  onBulkDelete={handleBulkDelete}
                  onBulkExport={() => handleExport('csv')}
                  trigger={
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4 mr-2" />
                      Actions ({selectedSupplierIds.length})
                    </Button>
                  }
                />
                <Button onClick={() => dispatch(clearSupplierSelection())} variant="outline" size="sm">
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
            Showing {suppliersList.length} of {totalSuppliers} suppliers
          </span>
        </div>
      </div>
      
      {/* Suppliers Table */}
      {error ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load suppliers. Please try again.
          </AlertDescription>
        </Alert>
      ) : suppliersList.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No suppliers found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filters.isActive !== undefined
                ? 'No suppliers match your search criteria.'
                : 'Get started by adding your first supplier.'}
            </p>
            {!searchQuery && filters.isActive === undefined && (
              <CreateButton module={PermissionModule.SupplierFleet} onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier
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
                    checked={selectedSupplierIds.length === suppliersList.length && suppliersList.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                {SUPPLIERS_TABLE_COLUMNS.map((column) => (
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
              {suppliersList.map((supplier) => (
                <TableRow key={supplier.fleetSupplierId} className="hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedSupplierIds.includes(supplier.fleetSupplierId)}
                      onCheckedChange={() => handleSelectSupplier(supplier.fleetSupplierId)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span>{supplier.email || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span>{supplier.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{supplier.TRN}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(0)} {/* TODO: Calculate total purchases */}
                  </TableCell>
                  <TableCell>
                    <Badge variant={supplier.isActive ? 'default' : 'secondary'}>
                      {supplier.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ActionsDropdown
                      module={PermissionModule.SupplierFleet}
                      onView={() => handleView(supplier)}
                      onEdit={() => handleEdit(supplier)}
                      onDelete={() => setDeleteSupplierId(supplier.fleetSupplierId)}
                      trigger={
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      }
                    >
                      {/* Additional custom menu items */}
                      <ViewButton 
                        module={PermissionModule.SupplierFleet}
                        action="ledger"
                        onClick={() => handleViewLedger(supplier)}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Ledger
                      </ViewButton>
                      <CreateButton 
                        module={PermissionModule.SupplierFleet}
                        onClick={() => handleAddPayment(supplier)}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Add Payment
                      </CreateButton>
                    </ActionsDropdown>
                  </TableCell>
                </TableRow>
              ))}
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
      <AlertDialog open={!!deleteSupplierId} onOpenChange={() => setDeleteSupplierId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this supplier? This action cannot be undone and will affect all related purchase orders.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteSupplierId && handleDelete(deleteSupplierId)}
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

export default SupplierList;
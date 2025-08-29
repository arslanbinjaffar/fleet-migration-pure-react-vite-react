import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

// Icons
import {
  Plus,
  Search,
  FileDown,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Settings,
} from 'lucide-react';

// API and State
import {
  useGetWarehousesQuery,
  usePutWarehouseMutation,
} from '@/stores/api/warehouseApiSlice';
import {
  selectWarehouseFilters,
  selectWarehousePagination,
  setFilters,
  setPagination,
} from '@/stores/slices/warehouseSlice';

// Types and Utils
import { Warehouse } from '../types';
import {
  filterWarehouses,
  sortWarehouses,
  paginateWarehouses,
  generateWarehouseCSVData,
  formatWarehouseForDisplay,
  debounce,
} from '../utils';
import {
  WAREHOUSE_PAGINATION,
  WAREHOUSE_SUCCESS_MESSAGES,
  WAREHOUSE_ERROR_MESSAGES,
} from '../constants';

// Permission hook (assuming it exists)
import { usePermissions } from '@/hooks/usePermissions';

interface WarehouseListProps {
  className?: string;
}

const WarehouseList: React.FC<WarehouseListProps> = ({ className }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteWarehouseId, setDeleteWarehouseId] = useState<string | null>(null);
  
  // Redux state
  const filters = useSelector(selectWarehouseFilters);
  const pagination = useSelector(selectWarehousePagination);
  
  // API hooks
  const {
    data: warehousesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetWarehousesQuery({
    page: pagination.currentPage,
    limit: pagination.itemsPerPage,
    search: filters.search,
    status: filters.status,
  });
  
  const [putWarehouse, { isLoading: isDeleting }] = usePutWarehouseMutation();
  
  // Permissions
  const permissions = usePermissions();
  const canCreate = permissions?.warehouse?.create || false;
  const canRead = permissions?.warehouse?.read || false;
  const canUpdate = permissions?.warehouse?.update || false;
  const canDelete = permissions?.warehouse?.delete || false;
  const canManageStock = permissions?.stock?.create || permissions?.stock?.update || false;
  
  // Memoized data processing
  const warehouses = warehousesResponse?.warehouse || [];
  
  const processedWarehouses = useMemo(() => {
    let filtered = filterWarehouses(warehouses, {
      search: searchTerm,
      status: filters.status,
    });
    
    filtered = sortWarehouses(filtered, 'name', 'asc');
    
    return paginateWarehouses(
      filtered,
      pagination.currentPage,
      pagination.itemsPerPage
    );
  }, [warehouses, searchTerm, filters.status, pagination.currentPage, pagination.itemsPerPage]);
  
  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      dispatch(setFilters({ search: value }));
      dispatch(setPagination({ currentPage: 1 }));
    }, 300),
    [dispatch]
  );
  
  // Effects
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);
  
  useEffect(() => {
    refetch();
  }, [refetch]);
  
  // Handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };
  
  const handlePageChange = (page: number) => {
    dispatch(setPagination({ currentPage: page }));
  };
  
  const handleView = (warehouse: Warehouse) => {
    navigate(`/inventory/warehouse/view/${warehouse.warehouseId}`);
  };
  
  const handleEdit = (warehouse: Warehouse) => {
    navigate(`/inventory/warehouse/edit/${warehouse.warehouseId}`);
  };
  
  const handleDelete = async (warehouseId: string) => {
    try {
      const warehouse = warehouses.find(w => w.warehouseId === warehouseId);
      if (!warehouse) return;
      
      const updatedWarehouse = {
        ...warehouse,
        status: 'inactive' as const,
        // isDeleted: true, // Soft delete
      };
      
      await putWarehouse({
        id: warehouseId,
        updatedWarehouse,
      }).unwrap();
      
      toast({
        title: 'Success',
        description: WAREHOUSE_SUCCESS_MESSAGES.DELETED,
      });
      
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: WAREHOUSE_ERROR_MESSAGES.UNKNOWN_ERROR,
        variant: 'destructive',
      });
    }
  };
  
  // CSV Export
  const handleExport = () => {
    const csvData = generateWarehouseCSVData(processedWarehouses.data);
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'warehouse_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };
  
  // Pagination helpers
  const totalPages = processedWarehouses.pagination.totalPages;
  const currentPage = processedWarehouses.pagination.currentPage;
  const hasNextPage = processedWarehouses.pagination.hasNextPage;
  const hasPreviousPage = processedWarehouses.pagination.hasPreviousPage;
  
  const renderPaginationNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="h-8 w-8 p-0"
        >
          {i}
        </Button>
      );
    }
    
    return pages;
  };
  
  if (isError) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading warehouses. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-2xl font-bold">Warehouses</CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search warehouses..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              {/* Export Button */}
              {processedWarehouses.data.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="whitespace-nowrap"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              )}
              
              {/* Manage Stock Button */}
              {canManageStock && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="whitespace-nowrap"
                >
                  <Link to="/inventory/warehouse/manage">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Stock
                  </Link>
                </Button>
              )}
              
              {/* Add Warehouse Button */}
              {canCreate && (
                <Button size="sm" asChild className="whitespace-nowrap">
                  <Link to="/inventory/warehouse/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Warehouse
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Desktop Table View */}
      <Card className="hidden sm:block">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedWarehouses.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        No warehouses found
                      </TableCell>
                    </TableRow>
                  ) : (
                    processedWarehouses.data.map((warehouse, index) => {
                      const formattedWarehouse = formatWarehouseForDisplay(warehouse);
                      return (
                        <TableRow key={warehouse.warehouseId}>
                          <TableCell>
                            {(currentPage - 1) * pagination.itemsPerPage + index + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            {warehouse.name}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {warehouse.description || 'N/A'}
                          </TableCell>
                          <TableCell>{warehouse.city}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {warehouse.address}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={warehouse.status === 'active' ? 'default' : 'secondary'}
                            >
                              {formattedWarehouse.statusLabel}
                            </Badge>
                          </TableCell>
                          <TableCell>{formattedWarehouse.formattedCreatedAt}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {canRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleView(warehouse)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                              
                              {canUpdate && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(warehouse)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              
                              {canDelete && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will deactivate the warehouse. This action can be undone by editing the warehouse.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(warehouse.warehouseId)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * pagination.itemsPerPage + 1} to{' '}
                    {Math.min(currentPage * pagination.itemsPerPage, processedWarehouses.pagination.totalItems)} of{' '}
                    {processedWarehouses.pagination.totalItems} entries
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!hasPreviousPage}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    {renderPaginationNumbers()}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!hasNextPage}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Mobile Card View */}
      <div className="sm:hidden space-y-4">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))
        ) : processedWarehouses.data.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              No warehouses found
            </CardContent>
          </Card>
        ) : (
          processedWarehouses.data.map((warehouse) => {
            const formattedWarehouse = formatWarehouseForDisplay(warehouse);
            return (
              <Card key={warehouse.warehouseId}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg">{warehouse.name}</h3>
                    <Badge
                      variant={warehouse.status === 'active' ? 'default' : 'secondary'}
                    >
                      {warehouse.city}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Description:</span>{' '}
                      {warehouse.description || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Address:</span>{' '}
                      {warehouse.address}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>{' '}
                      <Badge
                        variant={warehouse.status === 'active' ? 'default' : 'secondary'}
                        className="ml-1"
                      >
                        {formattedWarehouse.statusLabel}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Created:</span>{' '}
                      {formattedWarehouse.formattedCreatedAt}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    {canRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(warehouse)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    )}
                    
                    {canUpdate && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(warehouse)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                    
                    {canDelete && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will deactivate the warehouse. This action can be undone by editing the warehouse.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(warehouse.warehouseId)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
        
        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!hasPreviousPage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasNextPage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WarehouseList;
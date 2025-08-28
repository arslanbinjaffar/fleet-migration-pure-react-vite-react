import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  AlertCircle,
  FileText,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
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

import { selectCurrentUser } from '../../../stores/slices/authSlice';
import {
  useGetCustomersQuery,
  useDeleteCustomerMutation,
  useUpdateCustomerMutation,
  useBulkDeleteCustomersMutation,
  useExportCustomersMutation,
} from '../../../stores/api/customerApiSlice';
import {
  selectCustomersPagination,
  selectCustomersSearch,
  selectCustomersFilters,
  selectSelectedCustomerIds,
  selectCustomersViewMode,
  selectCustomersSorting,
  setCurrentPage,
  setPageSize,
  setSearchQuery,
  setFilters,
  toggleCustomerSelection,
  selectAllCustomers,
  clearSelection,
  setViewMode,
  setSorting,
} from '../../../stores/slices/customerSlice';
import {
  Customer,
  CustomerFilters,
} from '../types';
import {
  CUSTOMER_STATUS_OPTIONS,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  PERMISSIONS,
} from '../constants';
import {
  formatDate,
  getStatusConfig,
  getCustomerFullName,
  getCustomerDisplayName,
  prepareCustomersForExport,
  getErrorMessage,
} from '../utils';
import { hasPermission } from '../../../utils/role';

const CustomerList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  
  // Redux state
  const pagination = useSelector(selectCustomersPagination);
  const searchQuery = useSelector(selectCustomersSearch);
  const filters = useSelector(selectCustomersFilters);
  const selectedCustomerIds = useSelector(selectSelectedCustomerIds);
  const viewMode = useSelector(selectCustomersViewMode);
  const sorting = useSelector(selectCustomersSorting);
  
  // Local state
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  
  // API hooks
  const {
    data: customersResponse,
    isLoading,
    error: customersError,
    refetch,
  } = useGetCustomersQuery({
    page: pagination.currentPage,
    limit: pagination.pageSize,
    search: searchQuery,
    filters,
  });
  
  const [deleteCustomerMutation, { isLoading: isDeleting }] = useDeleteCustomerMutation();
  const [updateCustomerMutation] = useUpdateCustomerMutation();
  const [exportCustomersMutation] = useExportCustomersMutation();
  const [bulkDeleteCustomersMutation] = useBulkDeleteCustomersMutation();
  
  // Extract data from response
  const customers = customersResponse?.customers || [];
  const totalCustomers = customersResponse?.total || 0;
  
  // Error handling
  const error = customersError ? getErrorMessage(customersError) : null;
  
  // Show error toast when API error occurs
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);
  
  // Permission checks
  const canCreate = hasPermission(user, PERMISSIONS.CREATE_CUSTOMER);
  const canEdit = hasPermission(user, PERMISSIONS.EDIT_CUSTOMER);
  const canDelete = hasPermission(user, PERMISSIONS.DELETE_CUSTOMER);
  const canViewLedger = hasPermission(user, PERMISSIONS.VIEW_LEDGER);
  
  // Handlers
  const handleSearch = (value: string) => {
    dispatch(setSearchQuery(value));
  };
  
  const handleStatusFilter = (status: string) => {
    dispatch(setFilters({ ...filters, status: status as CustomerFilters['status'] }));
  };
  
  const handleSort = (column: string) => {
    if (sorting.sortBy === column) {
      dispatch(setSorting({ sortBy: column, sortOrder: sorting.sortOrder === 'asc' ? 'desc' : 'asc' }));
    } else {
      dispatch(setSorting({ sortBy: column, sortOrder: 'asc' }));
    }
  };
  
  const handleSelectCustomer = (customerId: string, checked: boolean) => {
    dispatch(toggleCustomerSelection(customerId));
  };
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      dispatch(selectAllCustomers(customers.map(customer => customer.customerId!)));
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
    if (!selectedCustomerId) return;
    
    try {
      await deleteCustomerMutation(selectedCustomerId).unwrap();
      toast.success('Customer deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedCustomerId(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };
  
  const handleStatusToggle = async (customer: Customer) => {
    try {
      await updateCustomerMutation({
        customerId: customer.customerId!,
        status: !customer.status,
      }).unwrap();
      toast.success(`Customer ${customer.status ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };
  
  const handleExport = async () => {
    try {
      const exportData = {
        format: 'csv' as const,
        filters,
        fields: ['name', 'email', 'phone', 'organization', 'city', 'status', 'createdAt'],
      };
      
      const blob = await exportCustomersMutation(exportData).unwrap();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `customers-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Customers exported successfully');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };
  
  const openDeleteDialog = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setDeleteDialogOpen(true);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading customers...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Users className="h-8 w-8 mr-3 text-primary" />
            Customers
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your customer database and relationships
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {canCreate && (
            <Button onClick={() => navigate(`/${user?.Role?.roleName?.toLowerCase() || 'admin'}/customer/create`)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          )}
        </div>
      </div>
      
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {totalCustomers} Customer{totalCustomers !== 1 ? 's' : ''}
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
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search customers by name, email, phone, or organization..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.status || 'all'} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {CUSTOMER_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
          
          {customers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No customers found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || (filters.status && filters.status !== 'all') ? 'Try adjusting your search or filters' : 'Get started by adding your first customer'}
              </p>
              {canCreate && !searchQuery && (!filters.status || filters.status === 'all') && (
                <Button onClick={() => navigate(`/${user?.Role?.roleName?.toLowerCase() || 'admin'}/customer/create`)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedCustomerIds.length === customers.length && customers.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('name')}
                      >
                        Customer
                        {sorting.sortBy === 'name' && (
                          <span className="ml-1">{sorting.sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('email')}
                      >
                        Contact
                        {sorting.sortBy === 'email' && (
                          <span className="ml-1">{sorting.sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('organization')}
                      >
                        Organization
                        {sorting.sortBy === 'organization' && (
                          <span className="ml-1">{sorting.sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('city')}
                      >
                        Location
                        {sorting.sortBy === 'city' && (
                          <span className="ml-1">{sorting.sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('status')}
                      >
                        Status
                        {sorting.sortBy === 'status' && (
                          <span className="ml-1">{sorting.sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('createdAt')}
                      >
                        Created
                        {sorting.sortBy === 'createdAt' && (
                          <span className="ml-1">{sorting.sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </TableHead>
                      <TableHead className="w-12">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => {
                      const statusConfig = getStatusConfig(customer.status);
                      
                      return (
                        <TableRow key={customer.customerId}>
                          <TableCell>
                            <Checkbox
                              checked={selectedCustomerIds.includes(customer.customerId!)}
                              onCheckedChange={(checked) => handleSelectCustomer(customer.customerId!, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Users className="h-5 w-5 text-primary" />
                                </div>
                              </div>
                              <div>
                                <div className="font-medium">{getCustomerFullName(customer)}</div>
                                {customer.title && (
                                  <div className="text-sm text-muted-foreground">{customer.title}</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                                {customer.email}
                              </div>
                              {customer.phone && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {customer.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {customer.organization ? (
                              <div className="flex items-center text-sm">
                                <Building className="h-3 w-3 mr-1 text-muted-foreground" />
                                {customer.organization}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {customer.city ? (
                              <div className="flex items-center text-sm">
                                <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                                {customer.city}
                                {customer.country && `, ${customer.country}`}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${statusConfig.bgColor} ${statusConfig.color}`}>
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(customer.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => navigate(`/${user?.Role?.roleName?.toLowerCase() || 'admin'}/customer/view/${customer.customerId}`)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {canViewLedger && (
                                  <DropdownMenuItem
                                    onClick={() => navigate(`/${user?.Role?.roleName?.toLowerCase() || 'admin'}/customer/ledger/${customer.customerId}`)}
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    View Ledger
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                {canEdit && (
                                  <DropdownMenuItem
                                    onClick={() => navigate(`/${user?.Role?.roleName?.toLowerCase() || 'admin'}/customer/edit/${customer.customerId}`)}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                )}
                                {canEdit && (
                                  <DropdownMenuItem onClick={() => handleStatusToggle(customer)}>
                                    {customer.status ? 'Activate' : 'Deactivate'}
                                  </DropdownMenuItem>
                                )}
                                {canDelete && (
                                  <DropdownMenuItem
                                    onClick={() => openDeleteDialog(customer.customerId!)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {Math.ceil(totalCustomers / pagination.pageSize) > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to {Math.min(pagination.currentPage * pagination.pageSize, totalCustomers)} of {totalCustomers} results
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
                      {Array.from({ length: Math.min(5, Math.ceil(totalCustomers / pagination.pageSize)) }, (_, i) => {
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
                      onClick={() => handlePageChange(Math.min(Math.ceil(totalCustomers / pagination.pageSize), pagination.currentPage + 1))}
                      disabled={pagination.currentPage >= Math.ceil(totalCustomers / pagination.pageSize)}
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
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer
              and remove their data from our servers.
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
    </div>
  );
};

export default CustomerList;
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  FileText,
  CreditCard,
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

// Types and utilities
import type { Supplier, SupplierFilters } from '../types';
import {
  formatCurrency,
  getSupplierStatusColor,
  formatDate,
  filterSuppliers,
  sortSuppliers,
} from '../utils';
import { SUPPLIER_STATUS } from '../constants';

// Mock data - replace with actual API call
const MOCK_SUPPLIERS: Supplier[] = [
  {
    supplierId: '1',
    supplierName: 'ABC Auto Parts',
    contactPerson: 'John Smith',
    email: 'john@abcautoparts.com',
    phone: '+1-555-0123',
    address: '123 Main St',
    city: 'New York',
    country: 'USA',
    status: 'active',
    currentBalance: 5000,
    creditLimit: 10000,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    supplierId: '2',
    supplierName: 'Global Fleet Solutions',
    contactPerson: 'Sarah Johnson',
    email: 'sarah@globalfleet.com',
    phone: '+1-555-0456',
    address: '456 Oak Ave',
    city: 'Los Angeles',
    country: 'USA',
    status: 'active',
    currentBalance: 2500,
    creditLimit: 15000,
    createdAt: '2024-02-01T14:30:00Z',
  },
  {
    supplierId: '3',
    supplierName: 'Premium Parts Ltd',
    contactPerson: 'Mike Wilson',
    email: 'mike@premiumparts.com',
    phone: '+1-555-0789',
    address: '789 Pine St',
    city: 'Chicago',
    country: 'USA',
    status: 'suspended',
    currentBalance: 12000,
    creditLimit: 8000,
    createdAt: '2024-01-20T09:15:00Z',
  },
];

interface SupplierListProps {
  className?: string;
}

const SupplierList: React.FC<SupplierListProps> = ({ className }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [suppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [filters, setFilters] = useState<SupplierFilters>({
    search: '',
    status: 'all',
    sortBy: 'supplierName',
    sortOrder: 'asc',
  });
  const [isLoading] = useState(false);

  // Filtered and sorted suppliers
  const filteredSuppliers = useMemo(() => {
    let result = filterSuppliers(suppliers, {
      search: filters.search,
      status: filters.status === 'all' ? undefined : filters.status,
    });
    
    if (filters.sortBy) {
      result = sortSuppliers(result, filters.sortBy, filters.sortOrder);
    }
    
    return result;
  }, [suppliers, filters]);

  // Handlers
  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status: status as any }));
  };

  const handleSort = (sortBy: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: sortBy as any,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleCreateSupplier = () => {
    navigate('/inventory/supplier/create');
  };

  const handleEditSupplier = (supplierId: string) => {
    navigate(`/inventory/supplier/edit/${supplierId}`);
  };

  const handleViewSupplier = (supplierId: string) => {
    navigate(`/inventory/supplier/view/${supplierId}`);
  };

  const handleViewLedger = (supplierId: string) => {
    navigate(`/inventory/supplier/ledger/${supplierId}`);
  };

  const handleAddPayment = () => {
    navigate('/inventory/add-payment/supplier/create');
  };

  const handleDeleteSupplier = async (supplierId: string) => {
    try {
      // TODO: Implement delete API call
      toast({
        title: 'Success',
        description: 'Supplier deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete supplier',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">
            Manage your suppliers and vendor relationships
          </p>
        </div>
        <Button onClick={handleCreateSupplier}>
          <Plus className="mr-2 h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search suppliers..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-48">
              <Select value={filters.status} onValueChange={handleStatusFilter}>
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={SUPPLIER_STATUS.ACTIVE}>Active</SelectItem>
                  <SelectItem value={SUPPLIER_STATUS.INACTIVE}>Inactive</SelectItem>
                  <SelectItem value={SUPPLIER_STATUS.SUSPENDED}>Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Add Payment Button */}
            <Button variant="outline" onClick={handleAddPayment}>
              <CreditCard className="mr-2 h-4 w-4" />
              Add Payment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('supplierName')}
                >
                  Supplier Name
                </TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Status</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('currentBalance')}
                >
                  Balance
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('createdAt')}
                >
                  Created
                </TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                      <span className="ml-2">Loading suppliers...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {filters.search || filters.status !== 'all'
                        ? 'No suppliers found matching your criteria'
                        : 'No suppliers found. Create your first supplier to get started.'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.supplierId}>
                    <TableCell className="font-medium">
                      {supplier.supplierName}
                    </TableCell>
                    <TableCell>{supplier.contactPerson}</TableCell>
                    <TableCell>{supplier.email}</TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                    <TableCell>{supplier.country}</TableCell>
                    <TableCell>
                      <Badge className={getSupplierStatusColor(supplier.status)}>
                        {supplier.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={supplier.currentBalance && supplier.currentBalance > 0 ? 'text-red-600' : 'text-green-600'}>
                        {formatCurrency(supplier.currentBalance || 0)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {supplier.createdAt ? formatDate(supplier.createdAt) : '-'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewSupplier(supplier.supplierId!)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditSupplier(supplier.supplierId!)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewLedger(supplier.supplierId!)}>
                            <FileText className="mr-2 h-4 w-4" />
                            View Ledger
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteSupplier(supplier.supplierId!)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierList;
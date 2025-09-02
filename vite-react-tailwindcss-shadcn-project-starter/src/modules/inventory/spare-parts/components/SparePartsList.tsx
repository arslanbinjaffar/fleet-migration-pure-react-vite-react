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
  Package,
  AlertTriangle,
  TrendingUp,
  Download,
  Upload,
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
import type { SparePart, SparePartFilters } from '../types';
import {
  formatCurrency,
  getSparePartStatusColor,
  getStockLevelInfo,
  formatDate,
  filterSpareParts,
  sortSpareParts,
  calculateStockValue,
  calculateTotalStockValue,
  getLowStockSpareParts,
  getOutOfStockSpareParts,
} from '../utils';
import { SPARE_PART_STATUS, STOCK_LEVELS, DEFAULT_CATEGORIES } from '../constants';

// Mock data - replace with actual API call
const MOCK_SPARE_PARTS: SparePart[] = [
  {
    sparePartId: '1',
    partNumber: 'ENG-001',
    partName: 'Engine Oil Filter',
    description: 'High-quality oil filter for diesel engines',
    category: 'Filters',
    subcategory: 'Oil Filter',
    brand: 'Bosch',
    model: 'F026407006',
    unitPrice: 25.99,
    costPrice: 18.50,
    quantityInStock: 45,
    minimumStock: 10,
    maximumStock: 100,
    reorderLevel: 15,
    unit: 'piece',
    location: 'A1-B2',
    barcode: '1234567890123',
    sku: 'FIBOENG001',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    sparePartId: '2',
    partNumber: 'BRK-002',
    partName: 'Brake Pads Set',
    description: 'Front brake pads for heavy-duty vehicles',
    category: 'Brakes',
    subcategory: 'Brake Pads',
    brand: 'TRW',
    model: 'GDB1330',
    unitPrice: 89.99,
    costPrice: 65.00,
    quantityInStock: 8,
    minimumStock: 12,
    maximumStock: 50,
    reorderLevel: 15,
    unit: 'set',
    location: 'B2-C3',
    status: 'active',
    createdAt: '2024-01-20T14:30:00Z',
  },
  {
    sparePartId: '3',
    partNumber: 'TIR-003',
    partName: 'Heavy Duty Tire',
    description: '295/80R22.5 truck tire',
    category: 'Tires & Wheels',
    subcategory: 'Tires',
    brand: 'Michelin',
    model: 'XZE2+',
    unitPrice: 450.00,
    costPrice: 320.00,
    quantityInStock: 0,
    minimumStock: 4,
    maximumStock: 20,
    reorderLevel: 6,
    unit: 'piece',
    location: 'C1-D1',
    status: 'active',
    createdAt: '2024-02-01T09:15:00Z',
  },
];

interface SparePartsListProps {
  className?: string;
}

const SparePartsList: React.FC<SparePartsListProps> = ({ className }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [spareParts] = useState<SparePart[]>(MOCK_SPARE_PARTS);
  const [filters, setFilters] = useState<SparePartFilters>({
    search: '',
    category: '',
    status: 'all',
    stockLevel: 'all',
    sortBy: 'partName',
    sortOrder: 'asc',
  });
  const [isLoading] = useState(false);

  // Filtered and sorted spare parts
  const filteredSpareParts = useMemo(() => {
    let result = filterSpareParts(spareParts, {
      search: filters.search,
      category: filters.category,
      status: filters.status === 'all' ? undefined : filters.status,
      stockLevel: filters.stockLevel === 'all' ? undefined : filters.stockLevel,
    });
    
    if (filters.sortBy) {
      result = sortSpareParts(result, filters.sortBy, filters.sortOrder);
    }
    
    return result;
  }, [spareParts, filters]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalValue = calculateTotalStockValue(spareParts);
    const lowStockParts = getLowStockSpareParts(spareParts);
    const outOfStockParts = getOutOfStockSpareParts(spareParts);
    
    return {
      totalParts: spareParts.length,
      totalValue,
      lowStockCount: lowStockParts.length,
      outOfStockCount: outOfStockParts.length,
    };
  }, [spareParts]);

  // Handlers
  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleCategoryFilter = (category: string) => {
    setFilters(prev => ({ ...prev, category }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status: status as any }));
  };

  const handleStockLevelFilter = (stockLevel: string) => {
    setFilters(prev => ({ ...prev, stockLevel: stockLevel as any }));
  };

  const handleSort = (sortBy: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: sortBy as any,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleCreateSparePart = () => {
    navigate('/inventory/spare-parts/create');
  };

  const handleEditSparePart = (sparePartId: string) => {
    navigate(`/inventory/spare-parts/edit/${sparePartId}`);
  };

  const handleViewSparePart = (sparePartId: string) => {
    navigate(`/inventory/spare-parts/view/${sparePartId}`);
  };

  const handleAdjustStock = (sparePartId: string) => {
    // TODO: Open stock adjustment modal
    toast({
      title: 'Stock Adjustment',
      description: 'Stock adjustment functionality will be implemented',
    });
  };

  const handleDeleteSparePart = async (sparePartId: string) => {
    try {
      // TODO: Implement delete API call
      toast({
        title: 'Success',
        description: 'Spare part deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete spare part',
        variant: 'destructive',
      });
    }
  };

  const handleBulkImport = () => {
    // TODO: Open bulk import modal
    toast({
      title: 'Bulk Import',
      description: 'Bulk import functionality will be implemented',
    });
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast({
      title: 'Export',
      description: 'Export functionality will be implemented',
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Spare Parts</h1>
          <p className="text-muted-foreground">
            Manage your spare parts inventory and stock levels
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleBulkImport}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={handleCreateSparePart}>
            <Plus className="mr-2 h-4 w-4" />
            Add Spare Part
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Parts</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalParts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.lowStockCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.outOfStockCount}</div>
          </CardContent>
        </Card>
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
                  placeholder="Search spare parts..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-48">
              <Select value={filters.category} onValueChange={handleCategoryFilter}>
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {DEFAULT_CATEGORIES.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-40">
              <Select value={filters.status} onValueChange={handleStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={SPARE_PART_STATUS.ACTIVE}>Active</SelectItem>
                  <SelectItem value={SPARE_PART_STATUS.INACTIVE}>Inactive</SelectItem>
                  <SelectItem value={SPARE_PART_STATUS.DISCONTINUED}>Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stock Level Filter */}
            <div className="w-full md:w-48">
              <Select value={filters.stockLevel} onValueChange={handleStockLevelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Stock Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={STOCK_LEVELS.ALL}>All Stock Levels</SelectItem>
                  <SelectItem value={STOCK_LEVELS.LOW_STOCK}>Low Stock</SelectItem>
                  <SelectItem value={STOCK_LEVELS.OUT_OF_STOCK}>Out of Stock</SelectItem>
                  <SelectItem value={STOCK_LEVELS.OVERSTOCK}>Overstock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spare Parts Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('partNumber')}
                >
                  Part Number
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('partName')}
                >
                  Part Name
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('quantityInStock')}
                >
                  Stock
                </TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('unitPrice')}
                >
                  Unit Price
                </TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                      <span className="ml-2">Loading spare parts...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredSpareParts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {filters.search || filters.category || filters.status !== 'all' || filters.stockLevel !== 'all'
                        ? 'No spare parts found matching your criteria'
                        : 'No spare parts found. Create your first spare part to get started.'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSpareParts.map((sparePart) => {
                  const stockInfo = getStockLevelInfo(sparePart);
                  const stockValue = calculateStockValue(sparePart);
                  
                  return (
                    <TableRow key={sparePart.sparePartId}>
                      <TableCell className="font-medium">
                        {sparePart.partNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{sparePart.partName}</div>
                          {sparePart.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {sparePart.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{sparePart.category}</div>
                          {sparePart.subcategory && (
                            <div className="text-sm text-muted-foreground">
                              {sparePart.subcategory}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{sparePart.brand}</div>
                          {sparePart.model && (
                            <div className="text-sm text-muted-foreground">
                              {sparePart.model}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-right">
                          <div className="font-medium">
                            {sparePart.quantityInStock} {sparePart.unit}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Min: {sparePart.minimumStock}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={stockInfo.color}>
                          {stockInfo.message}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(sparePart.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(stockValue)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getSparePartStatusColor(sparePart.status)}>
                          {sparePart.status}
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
                            <DropdownMenuItem onClick={() => handleViewSparePart(sparePart.sparePartId!)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditSparePart(sparePart.sparePartId!)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAdjustStock(sparePart.sparePartId!)}>
                              <Package className="mr-2 h-4 w-4" />
                              Adjust Stock
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteSparePart(sparePart.sparePartId!)}
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
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SparePartsList;
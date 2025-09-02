import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  AlertTriangle,
  Package,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

// UI Components
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
import type { StockItem, StockFilters } from '../types';

// Mock data
const MOCK_STOCK_ITEMS: StockItem[] = [
  {
    stockId: '1',
    sparePartId: '1',
    partNumber: 'ENG-001',
    partName: 'Engine Oil Filter',
    category: 'Filters',
    brand: 'Bosch',
    currentStock: 45,
    minimumStock: 10,
    reorderLevel: 15,
    unit: 'piece',
    unitPrice: 25.99,
    totalValue: 1169.55,
    location: 'A1-B2',
    lastUpdated: '2024-02-01T10:00:00Z',
    status: 'in_stock',
  },
  {
    stockId: '2',
    sparePartId: '2',
    partNumber: 'BRK-002',
    partName: 'Brake Pads Set',
    category: 'Brakes',
    brand: 'TRW',
    currentStock: 8,
    minimumStock: 12,
    reorderLevel: 15,
    unit: 'set',
    unitPrice: 89.99,
    totalValue: 719.92,
    location: 'B2-C3',
    lastUpdated: '2024-02-01T14:30:00Z',
    status: 'low_stock',
  },
  {
    stockId: '3',
    sparePartId: '3',
    partNumber: 'TIR-003',
    partName: 'Heavy Duty Tire',
    category: 'Tires & Wheels',
    brand: 'Michelin',
    currentStock: 0,
    minimumStock: 4,
    reorderLevel: 6,
    unit: 'piece',
    unitPrice: 450.00,
    totalValue: 0,
    location: 'C1-D1',
    lastUpdated: '2024-02-02T09:15:00Z',
    status: 'out_of_stock',
  },
];

interface StockListProps {
  className?: string;
}

const StockList: React.FC<StockListProps> = ({ className }) => {
  const [stockItems] = useState<StockItem[]>(MOCK_STOCK_ITEMS);
  const [filters, setFilters] = useState<StockFilters>({
    search: '',
    status: 'all',
  });
  const [isLoading] = useState(false);

  // Filtered stock items
  const filteredItems = useMemo(() => {
    return stockItems.filter(item => {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          item.partName.toLowerCase().includes(searchTerm) ||
          item.partNumber.toLowerCase().includes(searchTerm) ||
          item.brand.toLowerCase().includes(searchTerm);
        if (!matchesSearch) return false;
      }
      
      if (filters.status && filters.status !== 'all') {
        if (item.status !== filters.status) return false;
      }
      
      return true;
    });
  }, [stockItems, filters]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalItems = stockItems.length;
    const totalValue = stockItems.reduce((sum, item) => sum + item.totalValue, 0);
    const lowStockItems = stockItems.filter(item => item.status === 'low_stock').length;
    const outOfStockItems = stockItems.filter(item => item.status === 'out_of_stock').length;
    const overstockItems = stockItems.filter(item => item.status === 'overstock').length;
    
    return {
      totalItems,
      totalValue,
      lowStockItems,
      outOfStockItems,
      overstockItems,
    };
  }, [stockItems]);

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status: status as any }));
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      case 'overstock': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock List</h1>
          <p className="text-muted-foreground">
            Monitor inventory levels and stock movements
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalItems}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalValue)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summary.lowStockItems}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.outOfStockItems}</div>
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
                  placeholder="Search stock items..."
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
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="overstock">Overstock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Part Number</TableHead>
                <TableHead>Part Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                      <span className="ml-2">Loading stock items...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <div className="text-muted-foreground">
                      No stock items found
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.stockId}>
                    <TableCell className="font-medium">
                      {item.partNumber}
                    </TableCell>
                    <TableCell>{item.partName}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.brand}</TableCell>
                    <TableCell>
                      <div className="text-right">
                        <div className="font-medium">
                          {item.currentStock} {item.unit}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Min: {item.minimumStock}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(item.totalValue)}
                    </TableCell>
                    <TableCell>{item.location || '-'}</TableCell>
                    <TableCell>{formatDate(item.lastUpdated)}</TableCell>
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

export default StockList;
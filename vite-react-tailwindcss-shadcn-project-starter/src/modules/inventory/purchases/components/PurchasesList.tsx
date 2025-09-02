import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
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
import type { Purchase, PurchaseFilters } from '../types';

// Mock data
const MOCK_PURCHASES: Purchase[] = [
  {
    purchaseId: '1',
    purchaseNumber: 'PUR-2024-001',
    supplierId: '1',
    supplierName: 'ABC Auto Parts',
    purchaseDate: '2024-02-01T10:00:00Z',
    deliveryDate: '2024-02-05T10:00:00Z',
    status: 'received',
    totalAmount: 5000,
    paidAmount: 5000,
    remainingAmount: 0,
    paymentStatus: 'paid',
    items: [],
    createdAt: '2024-02-01T10:00:00Z',
  },
  {
    purchaseId: '2',
    purchaseNumber: 'PUR-2024-002',
    supplierId: '2',
    supplierName: 'Global Fleet Solutions',
    purchaseDate: '2024-02-03T14:00:00Z',
    status: 'pending',
    totalAmount: 3500,
    paidAmount: 0,
    remainingAmount: 3500,
    paymentStatus: 'unpaid',
    items: [],
    createdAt: '2024-02-03T14:00:00Z',
  },
];

interface PurchasesListProps {
  className?: string;
}

const PurchasesList: React.FC<PurchasesListProps> = ({ className }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [purchases] = useState<Purchase[]>(MOCK_PURCHASES);
  const [filters, setFilters] = useState<PurchaseFilters>({
    search: '',
    status: 'all',
    paymentStatus: 'all',
  });
  const [isLoading] = useState(false);

  // Filtered purchases
  const filteredPurchases = useMemo(() => {
    return purchases.filter(purchase => {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          purchase.purchaseNumber.toLowerCase().includes(searchTerm) ||
          purchase.supplierName.toLowerCase().includes(searchTerm);
        if (!matchesSearch) return false;
      }
      
      if (filters.status && filters.status !== 'all') {
        if (purchase.status !== filters.status) return false;
      }
      
      if (filters.paymentStatus && filters.paymentStatus !== 'all') {
        if (purchase.paymentStatus !== filters.paymentStatus) return false;
      }
      
      return true;
    });
  }, [purchases, filters]);

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status: status as any }));
  };

  const handlePaymentStatusFilter = (paymentStatus: string) => {
    setFilters(prev => ({ ...prev, paymentStatus: paymentStatus as any }));
  };

  const handleViewPurchase = (purchaseId: string) => {
    navigate(`/inventory/purchases/view/${purchaseId}`);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'received': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string): string => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
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
          <h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
          <p className="text-muted-foreground">
            Manage purchase orders and track deliveries
          </p>
        </div>
        <Button onClick={() => navigate('/inventory/purchase-order/create')}>
          <Plus className="mr-2 h-4 w-4" />
          New Purchase Order
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
                  placeholder="Search purchases..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Status Filter */}
            <div className="w-full md:w-48">
              <Select value={filters.paymentStatus} onValueChange={handlePaymentStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchases Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Purchase #</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                      <span className="ml-2">Loading purchases...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredPurchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="text-muted-foreground">
                      No purchases found
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPurchases.map((purchase) => (
                  <TableRow key={purchase.purchaseId}>
                    <TableCell className="font-medium">
                      {purchase.purchaseNumber}
                    </TableCell>
                    <TableCell>{purchase.supplierName}</TableCell>
                    <TableCell>{formatDate(purchase.purchaseDate)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(purchase.status)}>
                        {purchase.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPaymentStatusColor(purchase.paymentStatus)}>
                        {purchase.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(purchase.totalAmount)}</TableCell>
                    <TableCell>
                      <span className={purchase.remainingAmount && purchase.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}>
                        {formatCurrency(purchase.remainingAmount || 0)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewPurchase(purchase.purchaseId!)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            Generate Report
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Record Payment
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

export default PurchasesList;
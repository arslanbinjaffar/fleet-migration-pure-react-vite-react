import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Eye,
  Send,
  Check,
  X,
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

// Types
import type { PurchaseOrder as PurchaseOrderType, PurchaseOrderFilters } from '../types';

// Mock data
const MOCK_PURCHASE_ORDERS: PurchaseOrderType[] = [
  {
    purchaseOrderId: '1',
    purchaseOrderNumber: 'PO-2024-001',
    supplierId: '1',
    supplierName: 'ABC Auto Parts',
    orderDate: '2024-02-01T10:00:00Z',
    expectedDeliveryDate: '2024-02-05T10:00:00Z',
    status: 'approved',
    priority: 'high',
    totalAmount: 5000,
    finalAmount: 5000,
    deliveryAddress: '123 Main St, Workshop A',
    items: [],
    createdAt: '2024-02-01T10:00:00Z',
  },
  {
    purchaseOrderId: '2',
    purchaseOrderNumber: 'PO-2024-002',
    supplierId: '2',
    supplierName: 'Global Fleet Solutions',
    orderDate: '2024-02-03T14:00:00Z',
    expectedDeliveryDate: '2024-02-08T14:00:00Z',
    status: 'pending',
    priority: 'medium',
    totalAmount: 3500,
    finalAmount: 3500,
    deliveryAddress: '456 Oak Ave, Workshop B',
    items: [],
    createdAt: '2024-02-03T14:00:00Z',
  },
];

interface PurchaseOrderProps {
  className?: string;
}

const PurchaseOrder: React.FC<PurchaseOrderProps> = ({ className }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [purchaseOrders] = useState<PurchaseOrderType[]>(MOCK_PURCHASE_ORDERS);
  const [filters, setFilters] = useState<PurchaseOrderFilters>({
    search: '',
    status: 'all',
    priority: 'all',
  });
  const [isLoading] = useState(false);

  // Filtered purchase orders
  const filteredOrders = useMemo(() => {
    return purchaseOrders.filter(order => {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          order.purchaseOrderNumber.toLowerCase().includes(searchTerm) ||
          order.supplierName.toLowerCase().includes(searchTerm);
        if (!matchesSearch) return false;
      }
      
      if (filters.status && filters.status !== 'all') {
        if (order.status !== filters.status) return false;
      }
      
      if (filters.priority && filters.priority !== 'all') {
        if (order.priority !== filters.priority) return false;
      }
      
      return true;
    });
  }, [purchaseOrders, filters]);

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status: status as any }));
  };

  const handlePriorityFilter = (priority: string) => {
    setFilters(prev => ({ ...prev, priority: priority as any }));
  };

  const handleCreateOrder = () => {
    navigate('/inventory/purchase-order/create');
  };

  const handleEditOrder = (orderId: string) => {
    navigate(`/inventory/purchase-order/edit/${orderId}`);
  };

  const handleViewOrder = (orderId: string) => {
    navigate(`/inventory/purchase-order/view/${orderId}`);
  };

  const handleApproveOrder = async (orderId: string) => {
    try {
      // TODO: Implement approve API call
      toast({
        title: 'Success',
        description: 'Purchase order approved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve purchase order',
        variant: 'destructive',
      });
    }
  };

  const handleSendOrder = async (orderId: string) => {
    try {
      // TODO: Implement send API call
      toast({
        title: 'Success',
        description: 'Purchase order sent to supplier',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send purchase order',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'received': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
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
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground">
            Create and manage purchase orders for suppliers
          </p>
        </div>
        <Button onClick={handleCreateOrder}>
          <Plus className="mr-2 h-4 w-4" />
          Create Purchase Order
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
                  placeholder="Search purchase orders..."
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
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div className="w-full md:w-48">
              <Select value={filters.priority} onValueChange={handlePriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Expected Delivery</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                      <span className="ml-2">Loading purchase orders...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="text-muted-foreground">
                      No purchase orders found
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.purchaseOrderId}>
                    <TableCell className="font-medium">
                      {order.purchaseOrderNumber}
                    </TableCell>
                    <TableCell>{order.supplierName}</TableCell>
                    <TableCell>{formatDate(order.orderDate)}</TableCell>
                    <TableCell>
                      {order.expectedDeliveryDate ? formatDate(order.expectedDeliveryDate) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(order.priority)}>
                        {order.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(order.finalAmount)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewOrder(order.purchaseOrderId!)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditOrder(order.purchaseOrderId!)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {order.status === 'pending' && (
                            <DropdownMenuItem onClick={() => handleApproveOrder(order.purchaseOrderId!)}>
                              <Check className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                          )}
                          {order.status === 'approved' && (
                            <DropdownMenuItem onClick={() => handleSendOrder(order.purchaseOrderId!)}>
                              <Send className="mr-2 h-4 w-4" />
                              Send to Supplier
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <X className="mr-2 h-4 w-4" />
                            Cancel
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

export default PurchaseOrder;
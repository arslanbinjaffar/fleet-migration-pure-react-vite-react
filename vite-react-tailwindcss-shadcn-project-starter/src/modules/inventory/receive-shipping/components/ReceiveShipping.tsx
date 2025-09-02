import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Package,
  CheckCircle,
  AlertTriangle,
  XCircle,
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
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';

// Types
import type { ShippingReceipt, ShippingReceiptFilters } from '../types';

// Mock data
const MOCK_SHIPPING_RECEIPTS: ShippingReceipt[] = [
  {
    receiptId: '1',
    receiptNumber: 'REC-2024-001',
    purchaseOrderId: '1',
    purchaseOrderNumber: 'PO-2024-001',
    supplierId: '1',
    supplierName: 'ABC Auto Parts',
    shipmentDate: '2024-02-03T10:00:00Z',
    receivedDate: '2024-02-05T14:30:00Z',
    receivedBy: 'John Smith',
    status: 'complete',
    trackingNumber: 'TRK123456789',
    carrier: 'FedEx',
    totalItems: 10,
    receivedItems: 10,
    damagedItems: 0,
    rejectedItems: 0,
    items: [],
    createdAt: '2024-02-05T14:30:00Z',
  },
  {
    receiptId: '2',
    receiptNumber: 'REC-2024-002',
    purchaseOrderId: '2',
    purchaseOrderNumber: 'PO-2024-002',
    supplierId: '2',
    supplierName: 'Global Fleet Solutions',
    shipmentDate: '2024-02-06T09:00:00Z',
    receivedDate: '2024-02-08T11:15:00Z',
    receivedBy: 'Sarah Johnson',
    status: 'partial',
    trackingNumber: 'TRK987654321',
    carrier: 'UPS',
    totalItems: 15,
    receivedItems: 12,
    damagedItems: 2,
    rejectedItems: 1,
    items: [],
    createdAt: '2024-02-08T11:15:00Z',
  },
  {
    receiptId: '3',
    receiptNumber: 'REC-2024-003',
    supplierId: '3',
    supplierName: 'Premium Parts Ltd',
    receivedDate: '2024-02-10T16:00:00Z',
    receivedBy: 'Mike Wilson',
    status: 'pending',
    totalItems: 8,
    receivedItems: 0,
    damagedItems: 0,
    rejectedItems: 0,
    items: [],
    createdAt: '2024-02-10T16:00:00Z',
  },
];

interface ReceiveShippingProps {
  className?: string;
}

const ReceiveShipping: React.FC<ReceiveShippingProps> = ({ className }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [receipts] = useState<ShippingReceipt[]>(MOCK_SHIPPING_RECEIPTS);
  const [filters, setFilters] = useState<ShippingReceiptFilters>({
    search: '',
    status: 'all',
  });
  const [isLoading] = useState(false);

  // Filtered receipts
  const filteredReceipts = useMemo(() => {
    return receipts.filter(receipt => {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          receipt.receiptNumber.toLowerCase().includes(searchTerm) ||
          receipt.supplierName.toLowerCase().includes(searchTerm) ||
          (receipt.trackingNumber && receipt.trackingNumber.toLowerCase().includes(searchTerm));
        if (!matchesSearch) return false;
      }
      
      if (filters.status && filters.status !== 'all') {
        if (receipt.status !== filters.status) return false;
      }
      
      return true;
    });
  }, [receipts, filters]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalReceipts = receipts.length;
    const pendingReceipts = receipts.filter(r => r.status === 'pending').length;
    const completeReceipts = receipts.filter(r => r.status === 'complete').length;
    const damagedReceipts = receipts.filter(r => r.status === 'damaged').length;
    const totalItemsReceived = receipts.reduce((sum, r) => sum + r.receivedItems, 0);
    const damagedItemsReceived = receipts.reduce((sum, r) => sum + r.damagedItems, 0);
    
    return {
      totalReceipts,
      pendingReceipts,
      completeReceipts,
      damagedReceipts,
      totalItemsReceived,
      damagedItemsReceived,
    };
  }, [receipts]);

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status: status as any }));
  };

  const handleCreateReceipt = () => {
    navigate('/inventory/receive-shipping/create');
  };

  const handleViewReceipt = (receiptId: string) => {
    navigate(`/inventory/receive-shipping/view/${receiptId}`);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      case 'complete': return 'bg-green-100 text-green-800';
      case 'damaged': return 'bg-orange-100 text-orange-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'partial': return <Package className="h-4 w-4 text-blue-600" />;
      case 'damaged': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateReceiptProgress = (receipt: ShippingReceipt): number => {
    if (receipt.totalItems === 0) return 0;
    return (receipt.receivedItems / receipt.totalItems) * 100;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Receive Shipping</h1>
          <p className="text-muted-foreground">
            Track and manage incoming shipments and deliveries
          </p>
        </div>
        <Button onClick={handleCreateReceipt}>
          <Plus className="mr-2 h-4 w-4" />
          New Receipt
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receipts</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalReceipts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complete</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.completeReceipts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summary.pendingReceipts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Received</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalItemsReceived}</div>
            {summary.damagedItemsReceived > 0 && (
              <div className="text-xs text-orange-600">
                {summary.damagedItemsReceived} damaged
              </div>
            )}
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
                  placeholder="Search receipts..."
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
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receipts Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt #</TableHead>
                <TableHead>PO Number</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Received Date</TableHead>
                <TableHead>Received By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Tracking</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                      <span className="ml-2">Loading receipts...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredReceipts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="text-muted-foreground">
                      No shipping receipts found
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReceipts.map((receipt) => {
                  const progress = calculateReceiptProgress(receipt);
                  
                  return (
                    <TableRow key={receipt.receiptId}>
                      <TableCell className="font-medium">
                        {receipt.receiptNumber}
                      </TableCell>
                      <TableCell>
                        {receipt.purchaseOrderNumber || '-'}
                      </TableCell>
                      <TableCell>{receipt.supplierName}</TableCell>
                      <TableCell>{formatDate(receipt.receivedDate)}</TableCell>
                      <TableCell>{receipt.receivedBy}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(receipt.status)}
                          <Badge className={getStatusColor(receipt.status)}>
                            {receipt.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>{receipt.receivedItems}/{receipt.totalItems} items</span>
                            <span>{progress.toFixed(0)}%</span>
                          </div>
                          <Progress value={progress} className="h-1.5" />
                          {receipt.damagedItems > 0 && (
                            <div className="text-xs text-orange-600">
                              {receipt.damagedItems} damaged
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {receipt.trackingNumber ? (
                          <div className="text-xs">
                            <div className="font-medium">{receipt.trackingNumber}</div>
                            <div className="text-muted-foreground">{receipt.carrier}</div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewReceipt(receipt.receiptId!)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Package className="mr-2 h-4 w-4" />
                              Update Status
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

export default ReceiveShipping;
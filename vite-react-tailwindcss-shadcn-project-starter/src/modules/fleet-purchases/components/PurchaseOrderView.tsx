import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  Edit,
  Download,
  Package,
  Building,
  User,
  Calendar,
  DollarSign,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Truck,
  MapPin,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

import {
  useGetPurchaseOrderByIdQuery,
  useApprovePurchaseOrderMutation,
  useUpdatePurchaseOrderStatusMutation,
} from '../../../stores/api/fleetPurchasesApiSlice';
import {
  EditButton,
  ViewButton,
  PermissionModule,
} from '../../../components/permissions';
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  getOrderStatusConfig,
  calculateItemTotal,
  getErrorMessage,
} from '../utils';
import { ORDER_STATUS_OPTIONS } from '../constants';
import type { FleetPurchaseOrder } from '../types';

const PurchaseOrderView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isApproving, setIsApproving] = useState(false);
  
  // API hooks
  const {
    data: purchaseOrder,
    isLoading,
    error,
    refetch,
  } = useGetPurchaseOrderByIdQuery(id!, {
    skip: !id,
  });
  
  const [approvePurchaseOrder] = useApprovePurchaseOrderMutation();
  const [updateOrderStatus] = useUpdatePurchaseOrderStatusMutation();
  
  // Handlers
  const handleBack = () => {
    navigate('/purchase-order-fleet');
  };
  
  const handleEdit = () => {
    navigate(`/purchase-order-fleet/edit/${id}`);
  };
  
  const handleApprove = async () => {
    if (!purchaseOrder) return;
    
    setIsApproving(true);
    try {
      await approvePurchaseOrder({ id: purchaseOrder.fleetPurchaseOrderId }).unwrap();
      toast.success('Purchase order approved successfully');
      refetch();
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsApproving(false);
    }
  };
  
  const handleStatusChange = async (status: string) => {
    if (!purchaseOrder) return;
    
    try {
      await updateOrderStatus({
        fleetPurchaseOrderId: purchaseOrder.fleetPurchaseOrderId,
        orderStatus: status as any,
      }).unwrap();
      toast.success('Order status updated successfully');
      refetch();
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    }
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-20" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !purchaseOrder) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error ? getErrorMessage(error) : 'Purchase order not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const statusConfig = getOrderStatusConfig(purchaseOrder.orderStatus);
  const subtotal = purchaseOrder.subtotal || 0;
  const taxAmount = purchaseOrder.taxAmount || 0;
  const discountAmount = purchaseOrder.discountAmount || 0;
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <FileText className="h-8 w-8 mr-3 text-primary" />
              Purchase Order #{purchaseOrder.orderNumber}
            </h1>
            <p className="text-muted-foreground mt-1">
              Created on {formatDateTime(purchaseOrder.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Download className="h-4 w-4 mr-2" />
            Print
          </Button>
          {purchaseOrder.orderStatus === 'pending' && (
            <Button onClick={handleApprove} disabled={isApproving}>
              {isApproving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          )}
          <EditButton
            module={PermissionModule.PurchaseOrderFleet}
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </EditButton>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Order Details
                </CardTitle>
                <Badge className={statusConfig.color}>
                  {statusConfig.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Supplier:</span>
                  </div>
                  <div className="ml-6">
                    <p className="font-medium">{purchaseOrder.FleetSupplier?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      TRN: {purchaseOrder.FleetSupplier?.TRN}
                    </p>
                    {purchaseOrder.FleetSupplier?.email && (
                      <p className="text-sm text-muted-foreground">
                        {purchaseOrder.FleetSupplier.email}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Warehouse:</span>
                  </div>
                  <div className="ml-6">
                    <p className="font-medium">{purchaseOrder.warehouse?.name}</p>
                    {purchaseOrder.warehouse?.location && (
                      <p className="text-sm text-muted-foreground">
                        {purchaseOrder.warehouse.location}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Order Date:</span>
                  </div>
                  <div className="ml-6">
                    <p>{formatDate(purchaseOrder.orderDate)}</p>
                  </div>
                </div>
                
                {purchaseOrder.expectedDeliveryDate && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Expected Delivery:</span>
                    </div>
                    <div className="ml-6">
                      <p>{formatDate(purchaseOrder.expectedDeliveryDate)}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {purchaseOrder.category && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Category:</span>
                  </div>
                  <div className="ml-6">
                    <Badge variant="outline">{purchaseOrder.category.name}</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead className="w-24 text-right">Quantity</TableHead>
                      <TableHead className="w-32 text-right">Unit Price</TableHead>
                      <TableHead className="w-32 text-right">Total</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseOrder.items.map((item, index) => {
                      const itemTotal = calculateItemTotal(item.quantity, item.unitPrice);
                      
                      return (
                        <TableRow key={item.purchaseOrderItemId}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(itemTotal)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.description || 'N/A'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          {/* Notes and Terms */}
          {(purchaseOrder.notes || purchaseOrder.terms) && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {purchaseOrder.notes && (
                  <div>
                    <h4 className="font-medium mb-2">Notes</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {purchaseOrder.notes}
                    </p>
                  </div>
                )}
                
                {purchaseOrder.terms && (
                  <div>
                    <h4 className="font-medium mb-2">Terms and Conditions</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {purchaseOrder.terms}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              {taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>+{formatCurrency(taxAmount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>{formatCurrency(purchaseOrder.total)}</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Status Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Status Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {ORDER_STATUS_OPTIONS.map((status) => {
                const isCurrentStatus = status.value === purchaseOrder.orderStatus;
                const canChangeToStatus = !isCurrentStatus && (
                  (status.value === 'approved' && purchaseOrder.orderStatus === 'pending') ||
                  (status.value === 'completed' && purchaseOrder.orderStatus === 'approved') ||
                  (status.value === 'cancelled' && purchaseOrder.orderStatus !== 'completed')
                );
                
                return (
                  <Button
                    key={status.value}
                    variant={isCurrentStatus ? 'default' : 'outline'}
                    size="sm"
                    className="w-full justify-start"
                    disabled={!canChangeToStatus && !isCurrentStatus}
                    onClick={() => canChangeToStatus && handleStatusChange(status.value)}
                  >
                    {status.value === 'pending' && <Clock className="h-4 w-4 mr-2" />}
                    {status.value === 'approved' && <CheckCircle className="h-4 w-4 mr-2" />}
                    {status.value === 'completed' && <CheckCircle className="h-4 w-4 mr-2" />}
                    {status.value === 'rejected' && <XCircle className="h-4 w-4 mr-2" />}
                    {status.value === 'cancelled' && <XCircle className="h-4 w-4 mr-2" />}
                    {status.label}
                    {isCurrentStatus && <span className="ml-auto text-xs">(Current)</span>}
                  </Button>
                );
              })}
            </CardContent>
          </Card>
          
          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Order Created</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(purchaseOrder.createdAt)}
                  </p>
                </div>
              </div>
              
              {purchaseOrder.updatedAt !== purchaseOrder.createdAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-muted rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(purchaseOrder.updatedAt)}
                    </p>
                  </div>
                </div>
              )}
              
              {purchaseOrder.actualDeliveryDate && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Delivered</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(purchaseOrder.actualDeliveryDate)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderView;
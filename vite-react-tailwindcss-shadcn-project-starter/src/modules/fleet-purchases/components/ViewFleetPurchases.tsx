import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import useRoleNavigation from '../../../utils/useNavigation';
import { NavigationPaths } from '../../../utils/navigationPaths';
import {
  Receipt,
  ArrowLeft,
  Download,
  CreditCard,
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
  FileText,
  Truck,
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
  useGetPurchaseByIdQuery,
  useUpdatePurchasePaymentStatusMutation,
} from '../../../stores/api/fleetPurchasesApiSlice';
import {
  ViewButton,
  PermissionModule,
} from '../../../components/permissions';
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  getPaymentStatusConfig,
  calculateItemTotal,
  getErrorMessage,
} from '../utils';
import { PAYMENT_STATUS_OPTIONS } from '../constants';
import type { FleetPurchase } from '../types';

const ViewFleetPurchases: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { roleNavigate } = useRoleNavigation();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  // API hooks
  const {
    data: purchase,
    isLoading,
    error,
    refetch,
  } = useGetPurchaseByIdQuery(id!, {
    skip: !id,
  });
  
  const [updatePaymentStatus] = useUpdatePurchasePaymentStatusMutation();
  
  // Handlers
  const handleBack = () => {
    roleNavigate(NavigationPaths.FLEET_PURCHASES.PURCHASES);
  };
  
  const handleViewPurchaseOrder = () => {
    if (purchase?.fleetPurchaseOrder) {
      roleNavigate(NavigationPaths.FLEET_PURCHASES.VIEW_PURCHASE_ORDER(purchase.fleetPurchaseOrder.fleetPurchaseOrderId));
    }
  };
  
  const handleViewSupplier = () => {
    if (purchase?.fleetPurchaseOrder?.FleetSupplier) {
      roleNavigate(NavigationPaths.FLEET_PURCHASES.VIEW_SUPPLIER(purchase.fleetPurchaseOrder.FleetSupplier.fleetSupplierId));
    }
  };
  
  const handleAddPayment = () => {
    if (purchase) {
      roleNavigate(`${NavigationPaths.FLEET_PURCHASES.ADD_PAYMENT}?supplierId=${purchase.fleetPurchaseOrder?.fleetSupplierId}&purchaseId=${purchase.fleetPurchaseId}`);
    }
  };
  
  const handleUpdatePaymentStatus = async (status: string) => {
    if (!purchase) return;
    
    setIsUpdatingStatus(true);
    try {
      await updatePaymentStatus({
        fleetPurchaseId: purchase.fleetPurchaseId,
        paymentStatus: status as any,
      }).unwrap();
      toast.success('Payment status updated successfully');
      refetch();
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsUpdatingStatus(false);
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
  if (error || !purchase) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error ? getErrorMessage(error) : 'Purchase not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const statusConfig = getPaymentStatusConfig(purchase.paymentStatus);
  const purchaseOrder = purchase.fleetPurchaseOrder;
  const supplier = purchaseOrder?.FleetSupplier;
  
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
              <Receipt className="h-8 w-8 mr-3 text-primary" />
              Invoice {purchase.invoiceNumber}
            </h1>
            <p className="text-muted-foreground mt-1">
              Created on {formatDateTime(purchase.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Download className="h-4 w-4 mr-2" />
            Print
          </Button>
          {purchase.remainingAmount > 0 && (
            <Button onClick={handleAddPayment}>
              <CreditCard className="h-4 w-4 mr-2" />
              Add Payment
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Purchase Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Purchase Details
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
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Invoice Number:</span>
                  </div>
                  <div className="ml-6">
                    <p className="font-medium">{purchase.invoiceNumber}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Invoice Date:</span>
                  </div>
                  <div className="ml-6">
                    <p>{formatDate(purchase.invoiceDate)}</p>
                  </div>
                </div>
                
                {supplier && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Supplier:</span>
                    </div>
                    <div className="ml-6">
                      <p className="font-medium">{supplier.name}</p>
                      <p className="text-sm text-muted-foreground">
                        TRN: {supplier.TRN}
                      </p>
                      {supplier.email && (
                        <p className="text-sm text-muted-foreground">
                          {supplier.email}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {purchaseOrder && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Purchase Order:</span>
                    </div>
                    <div className="ml-6">
                      <Button
                        variant="link"
                        className="p-0 h-auto font-medium text-primary"
                        onClick={handleViewPurchaseOrder}
                      >
                        #{purchaseOrder.orderNumber}
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        Order Date: {formatDate(purchaseOrder.orderDate)}
                      </p>
                    </div>
                  </div>
                )}
                
                {purchase.paymentDueDate && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Payment Due:</span>
                    </div>
                    <div className="ml-6">
                      <p>{formatDate(purchase.paymentDueDate)}</p>
                    </div>
                  </div>
                )}
                
                {purchase.paymentMethod && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Payment Method:</span>
                    </div>
                    <div className="ml-6">
                      <p>{purchase.paymentMethod}</p>
                    </div>
                  </div>
                )}
                
                {purchase.paymentReference && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Payment Reference:</span>
                    </div>
                    <div className="ml-6">
                      <p className="font-mono">{purchase.paymentReference}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Purchase Order Items */}
          {purchaseOrder?.items && purchaseOrder.items.length > 0 && (
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
          )}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Total Amount:</span>
                <span className="font-medium">{formatCurrency(purchaseOrder?.total || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Paid Amount:</span>
                <span className="font-medium text-green-600">{formatCurrency(purchase.paidAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Remaining:</span>
                <span className="font-medium text-red-600">{formatCurrency(purchase.remainingAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Payment Status:</span>
                <Badge className={statusConfig.color}>
                  {statusConfig.label}
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          {/* Payment Status Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {PAYMENT_STATUS_OPTIONS.map((status) => {
                const isCurrentStatus = status.value === purchase.paymentStatus;
                const canChangeToStatus = !isCurrentStatus;
                
                return (
                  <Button
                    key={status.value}
                    variant={isCurrentStatus ? 'default' : 'outline'}
                    size="sm"
                    className="w-full justify-start"
                    disabled={!canChangeToStatus || isUpdatingStatus}
                    onClick={() => canChangeToStatus && handleUpdatePaymentStatus(status.value)}
                  >
                    {isUpdatingStatus && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {status.value === 'pending' && <Clock className="h-4 w-4 mr-2" />}
                    {status.value === 'partial' && <AlertTriangle className="h-4 w-4 mr-2" />}
                    {status.value === 'paid' && <CheckCircle className="h-4 w-4 mr-2" />}
                    {status.value === 'overdue' && <XCircle className="h-4 w-4 mr-2" />}
                    Mark as {status.label}
                    {isCurrentStatus && <span className="ml-auto text-xs">(Current)</span>}
                  </Button>
                );
              })}
            </CardContent>
          </Card>
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {supplier && (
                <ViewButton
                  module={PermissionModule.SupplierFleet}
                  onClick={handleViewSupplier}
                  className="w-full justify-start"
                >
                  <User className="h-4 w-4 mr-2" />
                  View Supplier
                </ViewButton>
              )}
              
              {purchaseOrder && (
                <ViewButton
                  module={PermissionModule.PurchaseOrderFleet}
                  onClick={handleViewPurchaseOrder}
                  className="w-full justify-start"
                >
                  <Package className="h-4 w-4 mr-2" />
                  View Purchase Order
                </ViewButton>
              )}
              
              {supplier && (
                <ViewButton
                  module={PermissionModule.SupplierFleet}
                  action="ledger"
                  onClick={() => roleNavigate(NavigationPaths.FLEET_PURCHASES.SUPPLIER_LEDGER(supplier.fleetSupplierId))}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Supplier Ledger
                </ViewButton>
              )}
            </CardContent>
          </Card>
          
          {/* Purchase Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Invoice Created</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(purchase.createdAt)}
                  </p>
                </div>
              </div>
              
              {purchase.updatedAt !== purchase.createdAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-muted rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(purchase.updatedAt)}
                    </p>
                  </div>
                </div>
              )}
              
              {purchase.paymentStatus === 'paid' && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Fully Paid</p>
                    <p className="text-xs text-muted-foreground">
                      Payment completed
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

export default ViewFleetPurchases;
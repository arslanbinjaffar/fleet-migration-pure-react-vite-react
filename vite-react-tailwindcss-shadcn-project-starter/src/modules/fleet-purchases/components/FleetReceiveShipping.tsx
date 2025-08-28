import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import useRoleNavigation from '../../../utils/useNavigation';
import { NavigationPaths } from '../../../utils/navigationPaths';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Truck,
  ArrowLeft,
  Save,
  Package,
  Calendar,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

import {
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderByIdQuery,
  useCreateReceiveShippingMutation,
} from '../../../stores/api/fleetPurchasesApiSlice';
import { CreateButton, PermissionModule } from '../../../components/permissions';
import { receiveShippingSchema, type ReceiveShippingFormData } from '../schemas';
import { ITEM_CONDITION_OPTIONS } from '../constants';
import {
  formatDate,
  formatCurrency,
  getOrderStatusConfig,
  getItemConditionConfig,
  getErrorMessage,
} from '../utils';
import type { FleetPurchaseOrder } from '../types';

const FleetReceiveShipping: React.FC = () => {
  const { roleNavigate } = useRoleNavigation();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  
  // Get order ID from URL params if provided
  const preSelectedOrderId = searchParams.get('orderId');
  
  // API hooks
  const { data: purchaseOrdersResponse } = useGetPurchaseOrdersQuery({
    filters: { status: 'approved' }, // Only show approved orders
  });
  
  const {
    data: selectedOrder,
    isLoading: isLoadingOrder,
  } = useGetPurchaseOrderByIdQuery(selectedOrderId, {
    skip: !selectedOrderId,
  });
  
  const [createReceiveShipping] = useCreateReceiveShippingMutation();
  
  // Extract data
  const purchaseOrders = purchaseOrdersResponse?.purchaseOrders || [];
  
  // Form setup
  const form = useForm<ReceiveShippingFormData>({
    resolver: zodResolver(receiveShippingSchema),
    defaultValues: {
      fleetPurchaseOrderId: preSelectedOrderId || '',
      receivedDate: new Date().toISOString().split('T')[0],
      receivedItems: [],
      notes: '',
    },
  });
  
  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'receivedItems',
  });
  
  const watchedOrderId = form.watch('fleetPurchaseOrderId');
  
  // Update selected order when form value changes
  useEffect(() => {
    if (watchedOrderId && watchedOrderId !== selectedOrderId) {
      setSelectedOrderId(watchedOrderId);
    }
  }, [watchedOrderId, selectedOrderId]);
  
  // Initialize received items when order is selected
  useEffect(() => {
    if (selectedOrder?.items) {
      const receivedItems = selectedOrder.items.map(item => ({
        purchaseOrderItemId: item.purchaseOrderItemId,
        receivedQuantity: 0,
        condition: 'good' as const,
        notes: '',
      }));
      replace(receivedItems);
    }
  }, [selectedOrder, replace]);
  
  // Handlers
  const handleSubmit = async (data: ReceiveShippingFormData) => {
    setIsSubmitting(true);
    
    try {
      await createReceiveShipping(data).unwrap();
      toast.success('Shipping receipt recorded successfully');
      roleNavigate(NavigationPaths.FLEET_PURCHASES.RECEIVE_SHIPPING);
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    roleNavigate(NavigationPaths.FLEET_PURCHASES.RECEIVE_SHIPPING);
  };
  
  const handleReceiveAll = () => {
    if (selectedOrder?.items) {
      const updatedItems = fields.map((field, index) => {
        const orderItem = selectedOrder.items[index];
        return {
          ...field,
          receivedQuantity: orderItem?.quantity || 0,
          condition: 'good' as const,
        };
      });
      replace(updatedItems);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <Truck className="h-8 w-8 mr-3 text-primary" />
              Receive Shipping
            </h1>
            <p className="text-muted-foreground mt-1">
              Record receipt of items from purchase orders
            </p>
          </div>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Purchase Order Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Purchase Order Selection
              </CardTitle>
              <CardDescription>
                Select the purchase order for which you are receiving items
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="fleetPurchaseOrderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Order *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select purchase order" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {purchaseOrders
                            .filter(order => order.orderStatus === 'approved')
                            .map((order) => (
                              <SelectItem key={order.fleetPurchaseOrderId} value={order.fleetPurchaseOrderId}>
                                #{order.orderNumber} - {order.FleetSupplier?.name} ({formatCurrency(order.total)})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="receivedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Received Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Order Details Display */}
              {selectedOrder && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Purchase Order Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Order Number:</span>
                      <span className="ml-2 font-medium">#{selectedOrder.orderNumber}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Supplier:</span>
                      <span className="ml-2 font-medium">{selectedOrder.FleetSupplier?.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Order Date:</span>
                      <span className="ml-2">{formatDate(selectedOrder.orderDate)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Amount:</span>
                      <span className="ml-2 font-medium">{formatCurrency(selectedOrder.total)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <Badge className={getOrderStatusConfig(selectedOrder.orderStatus).color}>
                        {getOrderStatusConfig(selectedOrder.orderStatus).label}
                      </Badge>
                    </div>
                    {selectedOrder.expectedDeliveryDate && (
                      <div>
                        <span className="text-muted-foreground">Expected Delivery:</span>
                        <span className="ml-2">{formatDate(selectedOrder.expectedDeliveryDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Received Items */}
          {selectedOrder && fields.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Package className="h-5 w-5 mr-2" />
                      Received Items
                    </CardTitle>
                    <CardDescription>
                      Record the quantity and condition of received items
                    </CardDescription>
                  </div>
                  <Button type="button" onClick={handleReceiveAll} variant="outline">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Receive All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead className="min-w-[200px]">Product Name</TableHead>
                        <TableHead className="w-24">Ordered</TableHead>
                        <TableHead className="w-32">Received *</TableHead>
                        <TableHead className="w-32">Condition *</TableHead>
                        <TableHead className="min-w-[150px]">Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => {
                        const orderItem = selectedOrder.items[index];
                        const receivedQuantity = form.watch(`receivedItems.${index}.receivedQuantity`) || 0;
                        
                        return (
                          <TableRow key={field.id}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell className="font-medium">
                              {orderItem?.productName}
                              {orderItem?.description && (
                                <p className="text-sm text-muted-foreground">
                                  {orderItem.description}
                                </p>
                              )}
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              {orderItem?.quantity}
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`receivedItems.${index}.receivedQuantity`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="0"
                                        max={orderItem?.quantity}
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              {receivedQuantity > (orderItem?.quantity || 0) && (
                                <p className="text-xs text-amber-600 mt-1">
                                  Exceeds ordered quantity
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`receivedItems.${index}.condition`}
                                render={({ field }) => (
                                  <FormItem>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {ITEM_CONDITION_OPTIONS.map((condition) => {
                                          const config = getItemConditionConfig(condition.value);
                                          return (
                                            <SelectItem key={condition.value} value={condition.value}>
                                              <div className="flex items-center">
                                                {condition.value === 'good' && <CheckCircle className="h-4 w-4 mr-2 text-green-600" />}
                                                {condition.value === 'damaged' && <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />}
                                                {condition.value === 'defective' && <XCircle className="h-4 w-4 mr-2 text-red-600" />}
                                                {config.label}
                                              </div>
                                            </SelectItem>
                                          );
                                        })}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`receivedItems.${index}.notes`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input placeholder="Notes" {...field} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
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
          
          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any additional notes about the shipment receipt"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional notes about the condition, delivery, or any issues with the shipment
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <CreateButton
              module={PermissionModule.PurchaseOrderFleet}
              type="submit"
              disabled={isSubmitting || !selectedOrder || fields.length === 0}
              className="min-w-[120px]"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Record Receipt
            </CreateButton>
          </div>
        </form>
      </Form>
      
      {/* Loading overlay for order details */}
      {isLoadingOrder && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading order details...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetReceiveShipping;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FileText,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Calculator,
  Package,
  Building,
  User,
  Calendar,
  DollarSign,
  Loader2,
  AlertTriangle,
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
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

import {
  useGetPurchaseOrderByIdQuery,
  useGetSuppliersQuery,
  useGetWarehousesQuery,
  useGetCategoriesQuery,
  useUpdatePurchaseOrderMutation,
} from '../../../stores/api/fleetPurchasesApiSlice';
import { EditButton } from '../../../components/permissions';
import { purchaseOrderSchema, type PurchaseOrderFormData } from '../schemas';
import {
  formatCurrency,
  calculateItemTotal,
  calculateSubtotal,
  calculateTotal,
  getErrorMessage,
} from '../utils';
import type { PurchaseOrderItem } from '../types';

const PurchaseOrderEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // API hooks
  const {
    data: purchaseOrder,
    isLoading: isLoadingOrder,
    error: orderError,
  } = useGetPurchaseOrderByIdQuery(id!, {
    skip: !id,
  });
  
  const { data: suppliersResponse } = useGetSuppliersQuery();
  const { data: warehousesResponse } = useGetWarehousesQuery();
  const { data: categoriesResponse } = useGetCategoriesQuery();
  const [updatePurchaseOrder] = useUpdatePurchaseOrderMutation();
  
  // Extract data
  const suppliers = suppliersResponse?.suppliers || [];
  const warehouses = warehousesResponse?.warehouses || [];
  const categories = categoriesResponse?.categories || [];
  
  // Form setup
  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
  });
  
  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'items',
  });
  
  const watchedItems = form.watch('items');
  const watchedDiscountAmount = form.watch('discountAmount') || 0;
  const watchedTaxAmount = form.watch('taxAmount') || 0;
  
  // Initialize form with purchase order data
  useEffect(() => {
    if (purchaseOrder) {
      const formData: PurchaseOrderFormData = {
        fleetSupplierId: purchaseOrder.fleetSupplierId,
        warehouseId: purchaseOrder.warehouseId,
        categoryId: purchaseOrder.categoryId || '',
        items: purchaseOrder.items.map(item => ({
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          description: item.description || '',
          specifications: item.specifications || '',
        })),
        orderDate: purchaseOrder.orderDate.split('T')[0], // Convert to YYYY-MM-DD format
        expectedDeliveryDate: purchaseOrder.expectedDeliveryDate 
          ? purchaseOrder.expectedDeliveryDate.split('T')[0] 
          : '',
        notes: purchaseOrder.notes || '',
        terms: purchaseOrder.terms || '',
        discountAmount: purchaseOrder.discountAmount || 0,
        taxAmount: purchaseOrder.taxAmount || 0,
      };
      
      // Reset form with the data
      form.reset(formData);
      replace(formData.items);
    }
  }, [purchaseOrder, form, replace]);
  
  // Calculate totals
  const subtotal = calculateSubtotal(watchedItems.map(item => ({
    ...item,
    totalPrice: calculateItemTotal(item.quantity, item.unitPrice),
  })) as PurchaseOrderItem[]);
  
  const total = calculateTotal(subtotal, watchedTaxAmount, watchedDiscountAmount);
  
  // Handlers
  const handleAddItem = () => {
    append({
      productName: '',
      quantity: 1,
      unitPrice: 0,
      description: '',
      specifications: '',
    });
  };
  
  const handleRemoveItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };
  
  const handleSubmit = async (data: PurchaseOrderFormData) => {
    if (!id) return;
    
    setIsSubmitting(true);
    
    try {
      await updatePurchaseOrder({ id, data }).unwrap();
      toast.success('Purchase order updated successfully');
      navigate(`/purchase-order-fleet/view/${id}`);
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    navigate(`/purchase-order-fleet/view/${id}`);
  };
  
  // Loading state
  if (isLoadingOrder) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-20" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }
  
  // Error state
  if (orderError || !purchaseOrder) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {orderError ? getErrorMessage(orderError) : 'Purchase order not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Don't allow editing if order is completed or cancelled
  if (['completed', 'cancelled'].includes(purchaseOrder.orderStatus)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This purchase order cannot be edited because it is {purchaseOrder.orderStatus}.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
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
              <FileText className="h-8 w-8 mr-3 text-primary" />
              Edit Purchase Order #{purchaseOrder.orderNumber}
            </h1>
            <p className="text-muted-foreground mt-1">
              Update purchase order details and items
            </p>
          </div>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Update the basic details for the purchase order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="fleetSupplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select supplier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier.fleetSupplierId} value={supplier.fleetSupplierId}>
                              {supplier.name} ({supplier.TRN})
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
                  name="warehouseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warehouse *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select warehouse" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {warehouses.map((warehouse) => (
                            <SelectItem key={warehouse.warehouseId} value={warehouse.warehouseId}>
                              {warehouse.name}
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
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No category</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.categoryId} value={category.categoryId}>
                              {category.name}
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
                  name="orderDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="expectedDeliveryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Delivery Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Order Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Order Items
                  </CardTitle>
                  <CardDescription>
                    Update items in the purchase order
                  </CardDescription>
                </div>
                <Button type="button" onClick={handleAddItem} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead className="min-w-[200px]">Product Name *</TableHead>
                      <TableHead className="w-24">Quantity *</TableHead>
                      <TableHead className="w-32">Unit Price *</TableHead>
                      <TableHead className="w-32">Total</TableHead>
                      <TableHead className="min-w-[150px]">Description</TableHead>
                      <TableHead className="w-12">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => {
                      const quantity = form.watch(`items.${index}.quantity`) || 0;
                      const unitPrice = form.watch(`items.${index}.unitPrice`) || 0;
                      const itemTotal = calculateItemTotal(quantity, unitPrice);
                      
                      return (
                        <TableRow key={field.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.productName`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="Enter product name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="1"
                                      {...field}
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.unitPrice`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(itemTotal)}
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="Description" {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(index)}
                              disabled={fields.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="discountAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="taxAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Discount:</span>
                    <span>-{formatCurrency(watchedDiscountAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>+{formatCurrency(watchedTaxAmount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any additional notes or instructions"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terms and Conditions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter terms and conditions"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
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
            <EditButton
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Update Order
            </EditButton>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PurchaseOrderEdit;
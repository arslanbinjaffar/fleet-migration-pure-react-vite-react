import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import useRoleNavigation from '../../../utils/useNavigation';
import { NavigationPaths } from '../../../utils/navigationPaths';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreditCard,
  ArrowLeft,
  Save,
  DollarSign,
  Calendar,
  FileText,
  Building,
  User,
  Loader2,
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
import { toast } from 'sonner';

import {
  useGetSuppliersQuery,
  useGetPurchasesQuery,
  useCreateSupplierPaymentMutation,
} from '../../../stores/api/fleetPurchasesApiSlice';
import { CreateButton, PermissionModule } from '../../../components/permissions';
import { supplierPaymentSchema, type SupplierPaymentFormData } from '../schemas';
import { PAYMENT_METHOD_OPTIONS, DEFAULT_PAYMENT_VALUES } from '../constants';
import { formatCurrency, getErrorMessage, getPaymentMethodConfig } from '../utils';

const AddPaymentByFleet: React.FC = () => {
  const { roleNavigate } = useRoleNavigation();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get supplier ID from URL params
  const preSelectedSupplierId = searchParams.get('supplierId');
  const preSelectedPurchaseId = searchParams.get('purchaseId');
  
  // API hooks
  const { data: suppliersResponse } = useGetSuppliersQuery();
  const { data: purchasesResponse } = useGetPurchasesQuery();
  const [createPayment] = useCreateSupplierPaymentMutation();
  
  // Extract data
  const suppliers = suppliersResponse?.suppliers || [];
  const purchases = purchasesResponse?.purchases || [];
  
  // Form setup
  const form = useForm<SupplierPaymentFormData>({
    resolver: zodResolver(supplierPaymentSchema),
    defaultValues: {
      ...DEFAULT_PAYMENT_VALUES,
      fleetSupplierId: preSelectedSupplierId || '',
      fleetPurchaseId: preSelectedPurchaseId || '',
    },
  });
  
  const watchedSupplierId = form.watch('fleetSupplierId');
  const watchedPurchaseId = form.watch('fleetPurchaseId');
  
  // Filter purchases by selected supplier
  const supplierPurchases = purchases.filter(
    purchase => purchase.fleetPurchaseOrder?.fleetSupplierId === watchedSupplierId
  );
  
  // Get selected supplier and purchase details
  const selectedSupplier = suppliers.find(s => s.fleetSupplierId === watchedSupplierId);
  const selectedPurchase = purchases.find(p => p.fleetPurchaseId === watchedPurchaseId);
  
  // Reset purchase selection when supplier changes
  useEffect(() => {
    if (watchedSupplierId && watchedPurchaseId) {
      const purchaseExists = supplierPurchases.some(p => p.fleetPurchaseId === watchedPurchaseId);
      if (!purchaseExists) {
        form.setValue('fleetPurchaseId', '');
      }
    }
  }, [watchedSupplierId, watchedPurchaseId, supplierPurchases, form]);
  
  // Handlers
  const handleSubmit = async (data: SupplierPaymentFormData) => {
    setIsSubmitting(true);
    
    try {
      await createPayment(data).unwrap();
      toast.success('Payment recorded successfully');
      
      // Navigate back to appropriate page
      if (preSelectedSupplierId) {
        roleNavigate(NavigationPaths.FLEET_PURCHASES.SUPPLIER_LEDGER(preSelectedSupplierId));
      } else {
        roleNavigate(NavigationPaths.FLEET_PURCHASES.SUPPLIERS);
      }
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    if (preSelectedSupplierId) {
      roleNavigate(NavigationPaths.FLEET_PURCHASES.VIEW_SUPPLIER(preSelectedSupplierId));
    } else {
      roleNavigate(NavigationPaths.FLEET_PURCHASES.SUPPLIERS);
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
              <CreditCard className="h-8 w-8 mr-3 text-primary" />
              Add Supplier Payment
            </h1>
            <p className="text-muted-foreground mt-1">
              Record a payment to a fleet supplier
            </p>
          </div>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Supplier Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Supplier Information
              </CardTitle>
              <CardDescription>
                Select the supplier and related purchase order (if applicable)
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
                          {suppliers
                            .filter(supplier => supplier.isActive)
                            .map((supplier) => (
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
                  name="fleetPurchaseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related Purchase (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select purchase order" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No specific purchase</SelectItem>
                          {supplierPurchases.map((purchase) => (
                            <SelectItem key={purchase.fleetPurchaseId} value={purchase.fleetPurchaseId}>
                              {purchase.invoiceNumber} - {formatCurrency(purchase.remainingAmount)} remaining
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Link this payment to a specific purchase order
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Supplier Details Display */}
              {selectedSupplier && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Supplier Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <span className="ml-2 font-medium">{selectedSupplier.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">TRN:</span>
                      <span className="ml-2 font-mono">{selectedSupplier.TRN}</span>
                    </div>
                    {selectedSupplier.email && (
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <span className="ml-2">{selectedSupplier.email}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="ml-2">{selectedSupplier.phone}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Purchase Details Display */}
              {selectedPurchase && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Purchase Order Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Invoice:</span>
                      <span className="ml-2 font-medium">{selectedPurchase.invoiceNumber}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Amount:</span>
                      <span className="ml-2 font-medium">{formatCurrency(selectedPurchase.fleetPurchaseOrder?.total || 0)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Paid Amount:</span>
                      <span className="ml-2 font-medium">{formatCurrency(selectedPurchase.paidAmount)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Remaining:</span>
                      <span className="ml-2 font-medium text-red-600">{formatCurrency(selectedPurchase.remainingAmount)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Payment Details
              </CardTitle>
              <CardDescription>
                Enter the payment amount and details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Amount *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      {selectedPurchase && field.value > selectedPurchase.remainingAmount && (
                        <p className="text-sm text-amber-600">
                          Warning: Payment amount exceeds remaining balance
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="paymentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PAYMENT_METHOD_OPTIONS.map((method) => {
                            const config = getPaymentMethodConfig(method.value);
                            return (
                              <SelectItem key={method.value} value={method.value}>
                                <div className="flex items-center">
                                  <span className="mr-2">{config.icon}</span>
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
                
                <FormField
                  control={form.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter reference number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Transaction ID, check number, or other reference
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description/Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any additional notes about this payment"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional notes about the payment purpose or details
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
              module={PermissionModule.SupplierFleet}
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Record Payment
            </CreateButton>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddPaymentByFleet;
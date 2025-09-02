import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, X, CreditCard } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

// Types and validation
import { paymentSchema, type PaymentFormData } from '../schemas/supplierSchema';
import type { Supplier } from '../types';
import { PAYMENT_METHODS } from '../constants';
import { formatCurrency, getSupplierStatusColor } from '../utils';

// Mock suppliers data - replace with actual API call
const MOCK_SUPPLIERS: Supplier[] = [
  {
    supplierId: '1',
    supplierName: 'ABC Auto Parts',
    contactPerson: 'John Smith',
    email: 'john@abcautoparts.com',
    phone: '+1-555-0123',
    address: '123 Main St',
    city: 'New York',
    country: 'USA',
    status: 'active',
    currentBalance: 5000,
    creditLimit: 10000,
  },
  {
    supplierId: '2',
    supplierName: 'Global Fleet Solutions',
    contactPerson: 'Sarah Johnson',
    email: 'sarah@globalfleet.com',
    phone: '+1-555-0456',
    address: '456 Oak Ave',
    city: 'Los Angeles',
    country: 'USA',
    status: 'active',
    currentBalance: 2500,
    creditLimit: 15000,
  },
];

interface AddPaymentProps {
  className?: string;
}

const AddPayment: React.FC<AddPaymentProps> = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);

  // Get pre-selected supplier from navigation state
  const preSelectedSupplierId = location.state?.supplierId;
  const preSelectedSupplierName = location.state?.supplierName;

  // Form setup
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      supplierId: preSelectedSupplierId || '',
      amount: 0,
      paymentMethod: PAYMENT_METHODS.CASH,
      referenceNumber: '',
      paymentDate: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  // Load suppliers
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setSuppliers(MOCK_SUPPLIERS);
        
        // Set pre-selected supplier if provided
        if (preSelectedSupplierId) {
          const supplier = MOCK_SUPPLIERS.find(s => s.supplierId === preSelectedSupplierId);
          if (supplier) {
            setSelectedSupplier(supplier);
          }
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load suppliers',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingSuppliers(false);
      }
    };

    loadSuppliers();
  }, [preSelectedSupplierId, toast]);

  // Handle supplier selection
  const handleSupplierChange = (supplierId: string) => {
    const supplier = suppliers.find(s => s.supplierId === supplierId);
    setSelectedSupplier(supplier || null);
    form.setValue('supplierId', supplierId);
  };

  // Submit handler
  const onSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement API call to create payment
      console.log('Creating payment:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'Payment recorded successfully',
      });
      
      // Navigate back to supplier ledger if came from there, otherwise to supplier list
      if (preSelectedSupplierId) {
        navigate(`/inventory/supplier/ledger/${preSelectedSupplierId}`);
      } else {
        navigate('/inventory/supplier');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to record payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (preSelectedSupplierId) {
      navigate(`/inventory/supplier/ledger/${preSelectedSupplierId}`);
    } else {
      navigate('/inventory/supplier');
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Payment</h1>
          <p className="text-muted-foreground">
            Record a payment {preSelectedSupplierName ? `for ${preSelectedSupplierName}` : 'from supplier'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Supplier Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier *</FormLabel>
                    <Select 
                      onValueChange={handleSupplierChange} 
                      value={field.value}
                      disabled={isLoadingSuppliers || !!preSelectedSupplierId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.supplierId} value={supplier.supplierId!}>
                            <div className="flex items-center justify-between w-full">
                              <span>{supplier.supplierName}</span>
                              <Badge 
                                variant="outline" 
                                className={`ml-2 ${getSupplierStatusColor(supplier.status)}`}
                              >
                                {formatCurrency(supplier.currentBalance || 0)}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Selected Supplier Info */}
              {selectedSupplier && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Contact Person</p>
                        <p className="font-medium">{selectedSupplier.contactPerson}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Current Balance</p>
                        <p className={`font-bold ${selectedSupplier.currentBalance && selectedSupplier.currentBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(selectedSupplier.currentBalance || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge className={getSupplierStatusColor(selectedSupplier.status)}>
                          {selectedSupplier.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Amount *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
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
                          <SelectItem value={PAYMENT_METHODS.CASH}>Cash</SelectItem>
                          <SelectItem value={PAYMENT_METHODS.CHECK}>Check</SelectItem>
                          <SelectItem value={PAYMENT_METHODS.BANK_TRANSFER}>Bank Transfer</SelectItem>
                          <SelectItem value={PAYMENT_METHODS.CREDIT_CARD}>Credit Card</SelectItem>
                        </SelectContent>
                      </Select>
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
                  name="referenceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Check #1234, Transaction ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional notes about the payment" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedSupplier}>
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
                  Recording...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Record Payment
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddPayment;
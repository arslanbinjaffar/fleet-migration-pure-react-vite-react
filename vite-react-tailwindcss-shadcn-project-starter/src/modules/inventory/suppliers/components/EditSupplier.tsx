import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, X, Eye } from 'lucide-react';

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
import { supplierSchema, type SupplierFormData } from '../schemas/supplierSchema';
import type { Supplier } from '../types';
import { SUPPLIER_STATUS } from '../constants';
import { formatCurrency, getSupplierStatusColor, formatDate } from '../utils';

// Mock data - replace with actual API call
const MOCK_SUPPLIER: Supplier = {
  supplierId: '1',
  supplierName: 'ABC Auto Parts',
  contactPerson: 'John Smith',
  email: 'john@abcautoparts.com',
  phone: '+1-555-0123',
  address: '123 Main St',
  city: 'New York',
  country: 'USA',
  postalCode: '10001',
  taxId: 'TAX123456',
  paymentTerms: 'Net 30 days',
  creditLimit: 10000,
  currentBalance: 5000,
  status: 'active',
  notes: 'Reliable supplier for auto parts',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-02-01T14:30:00Z',
};

interface EditSupplierProps {
  className?: string;
  viewMode?: boolean;
}

const EditSupplier: React.FC<EditSupplierProps> = ({ className, viewMode = false }) => {
  const navigate = useNavigate();
  const { supplierId } = useParams<{ supplierId: string }>();
  const { toast } = useToast();
  
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form setup
  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      supplierName: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: '',
      postalCode: '',
      taxId: '',
      paymentTerms: '',
      creditLimit: 0,
      status: SUPPLIER_STATUS.ACTIVE,
      notes: '',
    },
  });

  // Load supplier data
  useEffect(() => {
    const loadSupplier = async () => {
      try {
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (supplierId === MOCK_SUPPLIER.supplierId) {
          setSupplier(MOCK_SUPPLIER);
          
          // Populate form with supplier data
          form.reset({
            supplierName: MOCK_SUPPLIER.supplierName,
            contactPerson: MOCK_SUPPLIER.contactPerson,
            email: MOCK_SUPPLIER.email,
            phone: MOCK_SUPPLIER.phone,
            address: MOCK_SUPPLIER.address,
            city: MOCK_SUPPLIER.city,
            country: MOCK_SUPPLIER.country,
            postalCode: MOCK_SUPPLIER.postalCode || '',
            taxId: MOCK_SUPPLIER.taxId || '',
            paymentTerms: MOCK_SUPPLIER.paymentTerms || '',
            creditLimit: MOCK_SUPPLIER.creditLimit || 0,
            status: MOCK_SUPPLIER.status,
            notes: MOCK_SUPPLIER.notes || '',
          });
        } else {
          throw new Error('Supplier not found');
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load supplier data',
          variant: 'destructive',
        });
        navigate('/inventory/supplier');
      } finally {
        setIsLoading(false);
      }
    };

    if (supplierId) {
      loadSupplier();
    }
  }, [supplierId, form, navigate, toast]);

  // Submit handler
  const onSubmit = async (data: SupplierFormData) => {
    if (viewMode) return;
    
    setIsSubmitting(true);
    try {
      // TODO: Implement API call to update supplier
      console.log('Updating supplier:', { ...data, supplierId });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'Supplier updated successfully',
      });
      
      navigate('/inventory/supplier');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update supplier. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/inventory/supplier');
  };

  const handleViewLedger = () => {
    navigate(`/inventory/supplier/ledger/${supplierId}`);
  };

  const toggleViewMode = () => {
    const currentPath = window.location.pathname;
    if (viewMode) {
      navigate(currentPath.replace('/view/', '/edit/'));
    } else {
      navigate(currentPath.replace('/edit/', '/view/'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
          <span>Loading supplier...</span>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Supplier not found</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {viewMode ? 'View' : 'Edit'} Supplier
            </h1>
            <p className="text-muted-foreground">
              {viewMode ? 'View supplier details' : 'Update supplier information'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={toggleViewMode}>
            <Eye className="mr-2 h-4 w-4" />
            {viewMode ? 'Edit' : 'View'}
          </Button>
          {viewMode && (
            <Button onClick={handleViewLedger}>
              View Ledger
            </Button>
          )}
        </div>
      </div>

      {/* Supplier Summary (View Mode) */}
      {viewMode && (
        <Card>
          <CardHeader>
            <CardTitle>Supplier Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={getSupplierStatusColor(supplier.status)}>
                  {supplier.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className={`font-semibold ${supplier.currentBalance && supplier.currentBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(supplier.currentBalance || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Credit Limit</p>
                <p className="font-semibold">
                  {formatCurrency(supplier.creditLimit || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-semibold">
                  {supplier.createdAt ? formatDate(supplier.createdAt) : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="supplierName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter supplier name" 
                          {...field} 
                          readOnly={viewMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter contact person name" 
                          {...field} 
                          readOnly={viewMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="Enter email address" 
                          {...field} 
                          readOnly={viewMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter phone number" 
                          {...field} 
                          readOnly={viewMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter full address" 
                        {...field} 
                        readOnly={viewMode}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter city" 
                          {...field} 
                          readOnly={viewMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter country" 
                          {...field} 
                          readOnly={viewMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter postal code" 
                          {...field} 
                          readOnly={viewMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax ID</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter tax ID" 
                          {...field} 
                          readOnly={viewMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={viewMode}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={SUPPLIER_STATUS.ACTIVE}>Active</SelectItem>
                          <SelectItem value={SUPPLIER_STATUS.INACTIVE}>Inactive</SelectItem>
                          <SelectItem value={SUPPLIER_STATUS.SUSPENDED}>Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Terms</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Net 30 days" 
                          {...field} 
                          readOnly={viewMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="creditLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credit Limit</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          readOnly={viewMode}
                        />
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
                        placeholder="Additional notes about the supplier" 
                        className="min-h-[100px]"
                        {...field} 
                        readOnly={viewMode}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          {!viewMode && (
            <div className="flex items-center justify-end gap-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Supplier
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default EditSupplier;
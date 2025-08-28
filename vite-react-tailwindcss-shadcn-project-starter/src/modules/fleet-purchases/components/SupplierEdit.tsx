import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Users,
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Building,
  FileText,
  MapPin,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

import {
  useGetSupplierByIdQuery,
  useUpdateSupplierMutation,
  useValidateSupplierTRNQuery,
  useValidateSupplierNameQuery,
} from '../../../stores/api/fleetPurchasesApiSlice';
import { EditButton } from '../../../components/permissions';
import { supplierSchema, type SupplierFormData } from '../schemas';
import { getErrorMessage } from '../utils';
import useRoleBasedNavigation from '@/utils/roleBasedNavigation';

const SupplierEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useRoleBasedNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // API hooks
  const {
    data: supplierResponse,
    isLoading: isLoadingSupplier,
    error: supplierError,
  } = useGetSupplierByIdQuery(id!, {
    skip: !id,
  });
  const supplier = supplierResponse?.suppliers;
  const [updateSupplier] = useUpdateSupplierMutation();
  
  // Form setup
  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
  });
  
  const watchedTRN = form.watch('TRN');
  const watchedName = form.watch('name');
  
  // Validation queries (only run when values are present and different from original)
  const { data: trnValidation } = useValidateSupplierTRNQuery(
    { trn: watchedTRN, excludeId: id },
    { skip: !watchedTRN || watchedTRN.length < 3 || watchedTRN === supplier?.TRN }
  );
  
  const { data: nameValidation } = useValidateSupplierNameQuery(
    { name: watchedName, excludeId: id },
    { skip: !watchedName || watchedName.length < 2 || watchedName === supplier?.name }
  );
  // Initialize form with supplier data
  useEffect(() => {
    if (supplier) {
      const formData: SupplierFormData = {
        name: supplier.name,
        email: supplier.email || '',
        phone: supplier.phone,
        TRN: supplier.TRN,
        detail: supplier.detail || '',
        address: supplier.address || '',
        contactPerson: supplier.contactPerson || '',
        isActive: supplier.isActive,
      };
      
      form.reset(formData);
    }
  }, [supplier, form]);
  
  // Handlers
  const handleSubmit = async (data: SupplierFormData) => {
    if (!id) return;
    
    setIsSubmitting(true);
    
    try {
      await updateSupplier({ id, data }).unwrap();
      toast.success('Supplier updated successfully');
      navigate(`/supplier-fleet/view/${id}`);
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    navigate(`/supplier-fleet/view/${id}`);
  };
  
  // Loading state
  if (isLoadingSupplier) {
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
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }
  
  // Error state
  if (supplierError || !supplier) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {supplierError ? getErrorMessage(supplierError) : 'Supplier not found'}
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
              <Users className="h-8 w-8 mr-3 text-primary" />
              Edit Supplier: {supplier.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Update supplier information and details
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
                <User className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Update the basic details for the supplier
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter supplier name" {...field} />
                      </FormControl>
                      {nameValidation?.exists && (
                        <p className="text-sm text-destructive">
                          A supplier with this name already exists
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="TRN"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TRN (Tax Registration Number) *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter TRN" {...field} />
                      </FormControl>
                      {trnValidation?.exists && (
                        <p className="text-sm text-destructive">
                          A supplier with this TRN already exists
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email address" {...field} />
                      </FormControl>
                      <FormDescription>
                        Optional - Used for communication and notifications
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
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
                      <FormLabel>Contact Person</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contact person name" {...field} />
                      </FormControl>
                      <FormDescription>
                        Primary contact person for this supplier
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>
                          Enable this supplier for new purchase orders
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Address Information
              </CardTitle>
              <CardDescription>
                Update the supplier's address details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter complete address"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Complete address including street, city, and postal code
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Additional Information
              </CardTitle>
              <CardDescription>
                Additional details about the supplier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="detail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description/Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter additional details about the supplier"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Any additional information about the supplier's services, specialties, or notes
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
            <EditButton module="supplier"
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Update Supplier
            </EditButton>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SupplierEdit;
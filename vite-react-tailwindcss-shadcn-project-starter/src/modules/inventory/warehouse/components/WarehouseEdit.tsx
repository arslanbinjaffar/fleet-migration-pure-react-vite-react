import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

// Icons
import { ArrowLeft, Save, Loader2, Eye } from 'lucide-react';

// API and Validation
import {
  useGetSingleWarehouseQuery,
  usePutWarehouseMutation,
} from '@/stores/api/warehouseApiSlice';
import { updateWarehouseSchema, type UpdateWarehouseData } from '../schemas/warehouseSchema';
import {
  WAREHOUSE_STATUS_OPTIONS,
  WAREHOUSE_SUCCESS_MESSAGES,
  WAREHOUSE_ERROR_MESSAGES,
} from '../constants';
import { formatWarehouseForDisplay } from '../utils';

// Types
import type { WarehouseFormData } from '../types';

// Permission hook
import {
  EditButton,
  ViewButton,
  usePermissions,
  PermissionModule,
} from '@/components/permissions';

interface WarehouseEditProps {
  className?: string;
}

const WarehouseEdit: React.FC<WarehouseEditProps> = ({ className }) => {
  const navigate = useNavigate();
  const { warehouseId } = useParams<{ warehouseId: string }>();
  const [isViewMode, setIsViewMode] = useState(false);
  
  // Check if this is a view route
  useEffect(() => {
    const currentPath = window.location.pathname;
    const containsView = currentPath.includes('/view/');
    setIsViewMode(containsView);
  }, []);
  
  // API hooks
  const {
    data: warehouse,
    isLoading: isLoadingWarehouse,
    isError,
    error,
    refetch,
  } = useGetSingleWarehouseQuery(warehouseId!, {
    skip: !warehouseId,
  });
  
  const [putWarehouse, { isLoading: isUpdating }] = usePutWarehouseMutation();
  
  // Permissions
  const permissions = usePermissions();
  const canUpdate = permissions?.warehouse?.update || false;
  const canRead = permissions?.warehouse?.read || false;
  
  // Form setup
  const form = useForm<UpdateWarehouseData>({
    resolver: zodResolver(updateWarehouseSchema),
    defaultValues: {
      warehouseId: '',
      name: '',
      description: '',
      city: '',
      state: '',
      address: '',
      zipCode: '',
      country: '',
      phone: '',
      email: '',
      managerId: '',
      capacity: undefined,
      status: 'active',
    },
  });
  
  // Populate form when warehouse data is loaded
  useEffect(() => {
    if (warehouse?.warehouse) {
      const warehouseData = warehouse.warehouse;
      form.reset({
        warehouseId: warehouseData.warehouseId,
        name: warehouseData.name,
        description: warehouseData.description || '',
        city: warehouseData.city,
        state: warehouseData.state || '',
        address: warehouseData.address,
        zipCode: warehouseData.zipCode || '',
        country: warehouseData.country || '',
        phone: warehouseData.phone || '',
        email: warehouseData.email || '',
        managerId: warehouseData.managerId || '',
        capacity: warehouseData.capacity,
        status: warehouseData.status,
      });
    }
  }, [warehouse, form]);
  
  // Redirect if no permission
  useEffect(() => {
    if (!isViewMode && !canUpdate) {
      navigate('/inventory/warehouse');
    } else if (isViewMode && !canRead) {
      navigate('/inventory/warehouse');
    }
  }, [isViewMode, canUpdate, canRead, navigate]);
  
  // Refetch data on mount
  useEffect(() => {
    if (warehouseId) {
      refetch();
    }
  }, [warehouseId, refetch]);
  
  // Form submission handler
  const onSubmit = async (data: UpdateWarehouseData) => {
    if (isViewMode || !warehouseId) return;
    
    try {
      // Clean up empty strings to undefined for optional fields
      const cleanedData: Partial<WarehouseFormData> = {
        name: data.name,
        description: data.description || undefined,
        city: data.city,
        state: data.state || undefined,
        address: data.address,
        zipCode: data.zipCode || undefined,
        country: data.country || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
        managerId: data.managerId || undefined,
        capacity: data.capacity,
        status: data.status,
      };
      
      const result = await putWarehouse({
        id: warehouseId,
        updatedWarehouse: cleanedData,
      }).unwrap();
      
      toast({
        title: 'Success',
        description: WAREHOUSE_SUCCESS_MESSAGES.UPDATED,
      });
      
      navigate('/inventory/warehouse');
    } catch (error: any) {
      console.error('Error updating warehouse:', error);
      
      const errorMessage = error?.data?.message || 
                          error?.message || 
                          WAREHOUSE_ERROR_MESSAGES.UNKNOWN_ERROR;
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };
  
  const handleCancel = () => {
    navigate('/inventory/warehouse');
  };
  
  const handleEdit = () => {
    navigate(`/inventory/warehouse/edit/${warehouseId}`);
  };
  
  // Loading state
  if (isLoadingWarehouse) {
    return (
      <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Error state
  if (isError || !warehouse?.warehouse) {
    return (
      <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              {isError ? 'Error loading warehouse data. Please try again.' : 'Warehouse not found.'}
            </div>
            <div className="text-center mt-4">
              <Button onClick={handleCancel} variant="outline">
                Back to Warehouses
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const warehouseData = warehouse.warehouse;
  const formattedWarehouse = formatWarehouseForDisplay(warehouseData);
  
  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-2xl font-bold">
                  {isViewMode ? 'View Warehouse' : 'Edit Warehouse'}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {warehouseData.name}
                </p>
              </div>
            </div>
            
            {isViewMode && canUpdate && (
              <Button onClick={handleEdit} size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>
      
      {/* Form */}
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold border-b pb-2 flex-1">Basic Information</h3>
                  {isViewMode && (
                    <Badge
                      variant={warehouseData.status === 'active' ? 'default' : 'secondary'}
                      className="ml-4"
                    >
                      {formattedWarehouse.statusLabel}
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Warehouse Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Warehouse Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter warehouse name"
                            disabled={isViewMode}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Status */}
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={isViewMode}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {WAREHOUSE_STATUS_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter warehouse description (optional)"
                          className="min-h-[100px]"
                          disabled={isViewMode}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Location Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* City */}
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter city"
                            disabled={isViewMode}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* State */}
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter state (optional)"
                            disabled={isViewMode}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Address */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter full address"
                          className="min-h-[80px]"
                          disabled={isViewMode}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ZIP Code */}
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter ZIP code (optional)"
                            disabled={isViewMode}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Country */}
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter country (optional)"
                            disabled={isViewMode}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter phone number (optional)"
                            type="tel"
                            disabled={isViewMode}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter email address (optional)"
                            type="email"
                            disabled={isViewMode}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Additional Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Manager ID */}
                  <FormField
                    control={form.control}
                    name="managerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manager ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter manager ID (optional)"
                            disabled={isViewMode}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Capacity */}
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter capacity (optional)"
                            type="number"
                            min="0"
                            disabled={isViewMode}
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? undefined : Number(value));
                            }}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Metadata (View Mode Only) */}
              {isViewMode && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Created:</span>{' '}
                      {formattedWarehouse.formattedCreatedAt}
                    </div>
                    <div>
                      <span className="font-medium">Last Updated:</span>{' '}
                      {formattedWarehouse.formattedUpdatedAt}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Form Actions */}
              {!isViewMode && (
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                  <Button
                    type="submit"
                    disabled={isUpdating}
                    className="sm:w-auto w-full"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Warehouse
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isUpdating}
                    className="sm:w-auto w-full"
                  >
                    Cancel
                  </Button>
                </div>
              )}
              
              {/* View Mode Actions */}
              {isViewMode && (
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="sm:w-auto w-full"
                  >
                    Back to Warehouses
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WarehouseEdit;
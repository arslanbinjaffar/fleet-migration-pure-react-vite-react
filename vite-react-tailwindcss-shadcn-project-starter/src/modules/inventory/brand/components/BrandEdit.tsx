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
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

// Icons
import { ArrowLeft, Save, Loader2, Edit } from 'lucide-react';

// API and Validation
import {
  useGetSingleBrandQuery,
  usePutBrandMutation,
} from '@/stores/api/brandApiSlice';
import { updateBrandSchema, type UpdateBrandData } from '../schemas/brandSchema';
import {
  BRAND_SUCCESS_MESSAGES,
  BRAND_ERROR_MESSAGES,
  BRAND_FORM_LABELS,
} from '../constants';
import { formatBrandForDisplay } from '../utils';

// Types
import type { BrandFormData } from '../types';

// Permission hook
import { usePermissions } from '@/hooks/usePermissions';

interface BrandEditProps {
  className?: string;
}

const BrandEdit: React.FC<BrandEditProps> = ({ className }) => {
  const navigate = useNavigate();
  const { brandId } = useParams<{ brandId: string }>();
  const [isViewMode, setIsViewMode] = useState(false);
  
  // Get user info from localStorage (similar to original implementation)
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Check if this is a view route
  useEffect(() => {
    const currentPath = window.location.pathname;
    const containsView = currentPath.includes('/view/');
    setIsViewMode(containsView);
  }, []);
  
  // API hooks
  const {
    data: brand,
    isLoading: isLoadingBrand,
    isError,
    error,
    refetch,
  } = useGetSingleBrandQuery(brandId!, {
    skip: !brandId,
  });
  
  const [putBrand, { isLoading: isUpdating }] = usePutBrandMutation();
  
  // Permissions
  const permissions = usePermissions();
  const canUpdate = permissions?.brand?.update || false;
  const canRead = permissions?.brand?.read || false;
  
  // Form setup
  const form = useForm<UpdateBrandData>({
    resolver: zodResolver(updateBrandSchema),
    defaultValues: {
      brandId: '',
      name: '',
      description: '',
      tags: [],
    },
  });
  
  // Populate form when brand data is loaded
  useEffect(() => {
    if (brand?.brands) {
      const brandData = brand.brands;
      form.reset({
        brandId: brandData.brandId,
        name: brandData.name,
        description: brandData.description || '',
        tags: brandData.tags || [],
      });
    }
  }, [brand, form]);
  
  // Redirect if no permission
  useEffect(() => {
    if (!isViewMode && !canUpdate) {
      navigate('/inventory/brand');
    } else if (isViewMode && !canRead) {
      navigate('/inventory/brand');
    }
  }, [isViewMode, canUpdate, canRead, navigate]);
  
  // Refetch data on mount
  useEffect(() => {
    if (brandId) {
      refetch();
    }
  }, [brandId, refetch]);
  
  // Form submission handler
  const onSubmit = async (data: UpdateBrandData) => {
    if (isViewMode || !brandId) return;
    
    try {
      // Clean up empty strings to undefined for optional fields
      const cleanedData: Partial<BrandFormData> = {
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        tags: data.tags?.filter(tag => tag.trim()) || [],
      };
      
      const result = await putBrand({
        id: brandId,
        updatedBrand: cleanedData,
      }).unwrap();
      
      toast({
        title: 'Success',
        description: BRAND_SUCCESS_MESSAGES.UPDATED,
      });
      
      // Navigate back to brand list with user role (similar to original)
      const roleName = user?.Role?.roleName?.toLowerCase() || 'admin';
      navigate(`/${roleName}/brand`);
    } catch (error: any) {
      console.error('Error updating brand:', error);
      
      const errorMessage = error?.data?.message || 
                          error?.message || 
                          BRAND_ERROR_MESSAGES.UNKNOWN_ERROR;
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };
  
  const handleCancel = () => {
    navigate('/inventory/brand');
  };
  
  const handleEdit = () => {
    navigate(`/inventory/brand/edit/${brandId}`);
  };
  
  // Loading state
  if (isLoadingBrand) {
    return (
      <div className={`max-w-2xl mx-auto space-y-6 ${className}`}>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Error state
  if (isError || !brand?.brands) {
    return (
      <div className={`max-w-2xl mx-auto space-y-6 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              {isError ? 'Error loading brand data. Please try again.' : 'Brand not found.'}
            </div>
            <div className="text-center mt-4">
              <Button onClick={handleCancel} variant="outline">
                Back to Brands
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const brandData = brand.brands;
  const formattedBrand = formatBrandForDisplay(brandData);
  
  return (
    <div className={`max-w-2xl mx-auto space-y-6 ${className}`}>
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
                  {isViewMode ? 'View Brand' : 'Edit Brand'}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {brandData.name}
                </p>
              </div>
            </div>
            
            {isViewMode && canUpdate && (
              <Button onClick={handleEdit} size="sm">
                <Edit className="h-4 w-4 mr-2" />
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
              {/* Brand Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{BRAND_FORM_LABELS.NAME} *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={BRAND_FORM_LABELS.NAME_PLACEHOLDER}
                        disabled={isViewMode}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{BRAND_FORM_LABELS.DESCRIPTION}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={BRAND_FORM_LABELS.DESCRIPTION_PLACEHOLDER}
                        className="min-h-[120px]"
                        disabled={isViewMode}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Tags Display */}
              {brandData.tags && brandData.tags.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {BRAND_FORM_LABELS.TAGS}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {brandData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Metadata (View Mode Only) */}
              {isViewMode && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Created:</span>{' '}
                      {formattedBrand.formattedDate}
                    </div>
                    <div>
                      <span className="font-medium">Brand ID:</span>{' '}
                      {brandData.brandId}
                    </div>
                    {brandData.createdBy && (
                      <div>
                        <span className="font-medium">Created By:</span>{' '}
                        {brandData.createdBy}
                      </div>
                    )}
                    {brandData.updatedBy && (
                      <div>
                        <span className="font-medium">Updated By:</span>{' '}
                        {brandData.updatedBy}
                      </div>
                    )}
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
                        Update
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
                    Back to Brands
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

export default BrandEdit;
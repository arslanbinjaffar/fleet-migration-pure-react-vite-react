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
  useGetSingleCategoryQuery,
  usePutCategoryMutation,
} from '@/stores/api/categoryApiSlice';
import { updateCategorySchema, type UpdateCategoryData } from '../schemas/categorySchema';
import {
  CATEGORY_SUCCESS_MESSAGES,
  CATEGORY_ERROR_MESSAGES,
  CATEGORY_FORM_LABELS,
} from '../constants';
import { formatCategoryForDisplay } from '../utils';

// Types
import type { CategoryFormData } from '../types';

// Permission hook
import {
  EditButton,
  ViewButton,
  usePermissions,
  PermissionModule,
} from '@/components/permissions';

interface CategoryEditProps {
  className?: string;
}

const CategoryEdit: React.FC<CategoryEditProps> = ({ className }) => {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const [isViewMode, setIsViewMode] = useState(false);
  
  // Check if this is a view route
  useEffect(() => {
    const currentPath = window.location.pathname;
    const containsView = currentPath.includes('/view/');
    setIsViewMode(containsView);
  }, []);
  
  // API hooks
  const {
    data: category,
    isLoading: isLoadingCategory,
    isError,
    error,
    refetch,
  } = useGetSingleCategoryQuery(categoryId!, {
    skip: !categoryId,
  });
  
  const [putCategory, { isLoading: isUpdating }] = usePutCategoryMutation();
  
  // Permissions
  const permissions = usePermissions();
  const canUpdate = permissions?.category?.update || false;
  const canRead = permissions?.category?.read || false;
  
  // Form setup
  const form = useForm<UpdateCategoryData>({
    resolver: zodResolver(updateCategorySchema),
    defaultValues: {
      categoryId: '',
      name: '',
      description: '',
      tags: [],
    },
  });
  
  // Populate form when category data is loaded
  useEffect(() => {
    if (category?.categories) {
      const categoryData = category.categories;
      form.reset({
        categoryId: categoryData.categoryId,
        name: categoryData.name,
        description: categoryData.description || '',
        tags: categoryData.tags || [],
      });
    }
  }, [category, form]);
  
  // Redirect if no permission
  useEffect(() => {
    if (!isViewMode && !canUpdate) {
      navigate('/inventory/category');
    } else if (isViewMode && !canRead) {
      navigate('/inventory/category');
    }
  }, [isViewMode, canUpdate, canRead, navigate]);
  
  // Refetch data on mount
  useEffect(() => {
    if (categoryId) {
      refetch();
    }
  }, [categoryId, refetch]);
  
  // Form submission handler
  const onSubmit = async (data: UpdateCategoryData) => {
    if (isViewMode || !categoryId) return;
    
    try {
      // Clean up empty strings to undefined for optional fields
      const cleanedData: Partial<CategoryFormData> = {
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        tags: data.tags?.filter(tag => tag.trim()) || [],
      };
      
      const result = await putCategory({
        id: categoryId,
        updatedCategory: cleanedData,
      }).unwrap();
      
      toast({
        title: 'Success',
        description: CATEGORY_SUCCESS_MESSAGES.UPDATED,
      });
      
      // Navigate back to category list
      const currentPath = window.location.pathname;
      const basePath = currentPath.split('/edit')[0];
      navigate(basePath);
    } catch (error: any) {
      console.error('Error updating category:', error);
      
      const errorMessage = error?.data?.message || 
                          error?.message || 
                          CATEGORY_ERROR_MESSAGES.UNKNOWN_ERROR;
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };
  
  const handleCancel = () => {
    navigate('/inventory/category');
  };
  
  const handleEdit = () => {
    navigate(`/inventory/category/edit/${categoryId}`);
  };
  
  // Loading state
  if (isLoadingCategory) {
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
  if (isError || !category?.categories) {
    return (
      <div className={`max-w-2xl mx-auto space-y-6 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              {isError ? 'Error loading category data. Please try again.' : 'Category not found.'}
            </div>
            <div className="text-center mt-4">
              <Button onClick={handleCancel} variant="outline">
                Back to Categories
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const categoryData = category.categories;
  const formattedCategory = formatCategoryForDisplay(categoryData);
  
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
                  {isViewMode ? 'View Category' : 'Edit Category'}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {categoryData.name}
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
              {/* Category Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter a brand name"
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
                    <FormLabel>{CATEGORY_FORM_LABELS.DESCRIPTION}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={CATEGORY_FORM_LABELS.DESCRIPTION_PLACEHOLDER}
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
              {categoryData.tags && categoryData.tags.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {CATEGORY_FORM_LABELS.TAGS}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categoryData.tags.map((tag, index) => (
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
                      {formattedCategory.formattedDate}
                    </div>
                    <div>
                      <span className="font-medium">Category ID:</span>{' '}
                      {categoryData.categoryId}
                    </div>
                    {categoryData.createdBy && (
                      <div>
                        <span className="font-medium">Created By:</span>{' '}
                        {categoryData.createdBy}
                      </div>
                    )}
                    {categoryData.updatedBy && (
                      <div>
                        <span className="font-medium">Updated By:</span>{' '}
                        {categoryData.updatedBy}
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
                    Back to Categories
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

export default CategoryEdit;
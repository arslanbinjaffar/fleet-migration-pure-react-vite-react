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
  useGetSingleModelQuery,
  useUpdateModelMutation,
} from '@/stores/api/modelApiSlice';
import { updateModelSchema, type UpdateModelData } from '../schemas/modelSchema';
import {
  MODEL_SUCCESS_MESSAGES,
  MODEL_ERROR_MESSAGES,
  MODEL_FORM_LABELS,
} from '../constants';
import { formatModelForDisplay } from '../utils';

// Types
import type { ModelFormData } from '../types';

// Permission hook
import {
  EditButton,
  ViewButton,
  usePermissions,
  PermissionModule,
} from '@/components/permissions';

interface ModelEditProps {
  className?: string;
}

const ModelEdit: React.FC<ModelEditProps> = ({ className }) => {
  const navigate = useNavigate();
  const { modelId } = useParams<{ modelId: string }>();
  const [isViewMode, setIsViewMode] = useState(false);
  
  // Check if this is a view route
  useEffect(() => {
    const currentPath = window.location.pathname;
    const containsView = currentPath.includes('/view/');
    setIsViewMode(containsView);
  }, []);
  
  // API hooks
  const {
    data: model,
    isLoading: isLoadingModel,
    isError,
    error,
    refetch,
  } = useGetSingleModelQuery(modelId!, {
    skip: !modelId,
  });
  
  const [putModel, { isLoading: isUpdating }] = useUpdateModelMutation();
  
  // Permissions
  const permissions = usePermissions();
  const canUpdate = permissions?.model?.update || false;
  const canRead = permissions?.model?.read || false;
  
  // Form setup
  const form = useForm<UpdateModelData>({
    resolver: zodResolver(updateModelSchema),
    defaultValues: {
      modelId: '',
      name: '',
      description: '',
      tags: [],
    },
  });
  
  // Populate form when model data is loaded
  useEffect(() => {
    if (model?.model) {
      const modelData = model.model;
      form.reset({
        modelId: modelData.modelId,
        name: modelData.name,
        description: modelData.description || '',
        tags: modelData.tags || [],
      });
    }
  }, [model, form]);
  
  // Redirect if no permission
  useEffect(() => {
    if (!isViewMode && !canUpdate) {
      navigate('/inventory/model');
    } else if (isViewMode && !canRead) {
      navigate('/inventory/model');
    }
  }, [isViewMode, canUpdate, canRead, navigate]);
  
  // Refetch data on mount
  useEffect(() => {
    if (modelId) {
      refetch();
    }
  }, [modelId, refetch]);
  
  // Form submission handler
  const onSubmit = async (data: UpdateModelData) => {
    if (isViewMode || !modelId) return;
    
    try {
      // Clean up empty strings to undefined for optional fields
      const cleanedData: Partial<ModelFormData> = {
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        tags: data.tags?.filter(tag => tag.trim()) || [],
      };
      
      const result = await putModel({
        id: modelId,
        updatedModel: cleanedData,
      }).unwrap();
      
      toast({
        title: 'Success',
        description: MODEL_SUCCESS_MESSAGES.UPDATED,
      });
      
      navigate('/inventory/model');
    } catch (error: any) {
      console.error('Error updating model:', error);
      
      const errorMessage = error?.data?.message || 
                          error?.message || 
                          MODEL_ERROR_MESSAGES.UNKNOWN_ERROR;
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };
  
  const handleCancel = () => {
    navigate('/inventory/model');
  };
  
  const handleEdit = () => {
    navigate(`/inventory/model/edit/${modelId}`);
  };
  
  // Loading state
  if (isLoadingModel) {
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
  if (isError || !model?.model) {
    return (
      <div className={`max-w-2xl mx-auto space-y-6 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              {isError ? 'Error loading model data. Please try again.' : 'Model not found.'}
            </div>
            <div className="text-center mt-4">
              <Button onClick={handleCancel} variant="outline">
                Back to Models
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const modelData = model.model;
  const formattedModel = formatModelForDisplay(modelData);
  
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
                  {isViewMode ? 'View Model' : 'Edit Model'}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {modelData.name}
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
              {/* Model Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{MODEL_FORM_LABELS.NAME} *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={MODEL_FORM_LABELS.NAME_PLACEHOLDER}
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
                    <FormLabel>{MODEL_FORM_LABELS.DESCRIPTION}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={MODEL_FORM_LABELS.DESCRIPTION_PLACEHOLDER}
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
              {modelData.tags && modelData.tags.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {MODEL_FORM_LABELS.TAGS}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {modelData.tags.map((tag, index) => (
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
                      {formattedModel.formattedDate}
                    </div>
                    <div>
                      <span className="font-medium">Model ID:</span>{' '}
                      {modelData.modelId}
                    </div>
                    {modelData.createdBy && (
                      <div>
                        <span className="font-medium">Created By:</span>{' '}
                        {modelData.createdBy}
                      </div>
                    )}
                    {modelData.updatedBy && (
                      <div>
                        <span className="font-medium">Updated By:</span>{' '}
                        {modelData.updatedBy}
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
                        Update Model
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
                    Back to Models
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

export default ModelEdit;
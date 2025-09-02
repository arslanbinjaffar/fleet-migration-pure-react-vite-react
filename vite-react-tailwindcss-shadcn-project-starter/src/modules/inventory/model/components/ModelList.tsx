import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

// Icons
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Tag,
} from 'lucide-react';

// API hooks (assuming they exist based on the old code)
import {
  useGetModelsQuery,
  useCreateModelMutation,
  useDeleteModelMutation,
} from '@/stores/api/modelApiSlice';

// Types and Utils
import { Model } from '../types';
import {
  filterModels,
  sortModels,
  paginateModels,
  formatModelForDisplay,
  debounce,
  validateModelNameUniqueness,
  formatTags,
} from '../utils';
import {
  MODEL_PAGINATION,
  MODEL_SUCCESS_MESSAGES,
  MODEL_ERROR_MESSAGES,
  MODEL_UI,
  MODEL_FORM_LABELS,
} from '../constants';
import { createModelSchema, type CreateModelData } from '../schemas/modelSchema';

// Permission hook
import {
  CreateButton,
  EditButton,
  DeleteButton,
  ViewButton,
  ExportButton,
  ActionsDropdown,
  BulkActionsDropdown,
  usePermissions,
  PermissionModule,
} from '@/components/permissions';

interface ModelListProps {
  className?: string;
}

const ModelList: React.FC<ModelListProps> = ({ className }) => {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModelId, setDeleteModelId] = useState<string | null>(null);
  
  // API hooks
  const {
    data: modelsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetModelsQuery();
  
  const [createModel, { isLoading: isCreating }] = useCreateModelMutation();
  const [deleteModel, { isLoading: isDeleting }] = useDeleteModelMutation();
  
  // Permissions
  const permissions = usePermissions();
  const canCreate = permissions?.model?.create || false;
  const canUpdate = permissions?.model?.update || false;
  const canDelete = permissions?.model?.delete || false;
  
  // Form setup for creating new model
  const form = useForm<CreateModelData>({
    resolver: zodResolver(createModelSchema),
    defaultValues: {
      name: '',
      description: '',
      tags: [],
    },
  });
  
  // Memoized data processing
  const models = modelsResponse?.model || [];
  
  const processedModels = useMemo(() => {
    let filtered = filterModels(models, {
      search: searchTerm,
    });
    
    filtered = sortModels(filtered, 'name', 'asc');
    
    return paginateModels(
      filtered,
      MODEL_PAGINATION.DEFAULT_PAGE,
      MODEL_PAGINATION.DEFAULT_LIMIT
    );
  }, [models, searchTerm]);
  
  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      setSearchTerm(value);
    }, 300),
    []
  );
  
  // Effects
  useEffect(() => {
    refetch();
  }, [refetch]);
  
  // Handlers
  const handleSearch = (value: string) => {
    debouncedSearch(value);
  };
  
  const handleCreateModel = async (data: CreateModelData) => {
    try {
      // Validate name uniqueness
      if (!validateModelNameUniqueness(data.name, models)) {
        toast({
          title: 'Validation Error',
          description: MODEL_ERROR_MESSAGES.DUPLICATE_NAME,
          variant: 'destructive',
        });
        return;
      }
      
      const result = await createModel(data).unwrap();
      
      toast({
        title: 'Success',
        description: result?.message || MODEL_SUCCESS_MESSAGES.CREATED,
      });
      
      // Reset form and refetch data
      form.reset();
      refetch();
    } catch (error: any) {
      console.error('Error creating model:', error);
      
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
  
  const handleDeleteModel = async (modelId: string) => {
    try {
      const result = await deleteModel(modelId).unwrap();
      
      toast({
        title: 'Success',
        description: result?.message || MODEL_SUCCESS_MESSAGES.DELETED,
      });
      
      refetch();
    } catch (error: any) {
      console.error('Error deleting model:', error);
      
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
  
  if (isError) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading models. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-2xl font-bold">Models</CardTitle>
            
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={MODEL_UI.SEARCH_PLACEHOLDER}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Create Form - Left Panel */}
        {canCreate && (
          <div className="lg:col-span-4">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="text-lg">Add New Model</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleCreateModel)} className="space-y-4">
                    {/* Model Name */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{MODEL_FORM_LABELS.NAME}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={MODEL_FORM_LABELS.NAME_PLACEHOLDER}
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
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isCreating}
                      className="w-full"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          {MODEL_UI.ADD_BUTTON}
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Model List - Right Panel */}
        <div className={canCreate ? "lg:col-span-8" : "lg:col-span-12"}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Model List</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden sm:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="w-32">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {processedModels.data.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              {MODEL_UI.NO_RESULTS}
                            </TableCell>
                          </TableRow>
                        ) : (
                          processedModels.data.map((model, index) => {
                            const formattedModel = formatModelForDisplay(model);
                            return (
                              <TableRow key={model.modelId}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell className="font-medium">
                                  {model.name}
                                </TableCell>
                                <TableCell className="max-w-xs truncate">
                                  {model.description || 'No description'}
                                </TableCell>
                                <TableCell>{formattedModel.formattedDate}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {canUpdate && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => {
                                          // Navigate to edit page or open edit modal
                                          console.log('Edit model:', model.modelId);
                                        }}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    )}
                                    
                                    {canDelete && (
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>
                                              {MODEL_ERROR_MESSAGES.DELETE_CONFIRMATION}
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                              {MODEL_ERROR_MESSAGES.DELETE_WARNING}
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() => handleDeleteModel(model.modelId)}
                                              className="bg-red-600 hover:bg-red-700"
                                            >
                                              Delete
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Mobile Card View */}
                  <div className="sm:hidden p-4 space-y-4">
                    {processedModels.data.length === 0 ? (
                      <div className="text-center py-8">
                        {MODEL_UI.NO_RESULTS}
                      </div>
                    ) : (
                      processedModels.data.map((model) => {
                        const formattedModel = formatModelForDisplay(model);
                        return (
                          <Card key={model.modelId}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-3">
                                <h3 className="font-semibold text-lg">{model.name}</h3>
                                <div className="flex gap-2">
                                  {canUpdate && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => {
                                        console.log('Edit model:', model.modelId);
                                      }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )}
                                  
                                  {canDelete && (
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0 text-red-600"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            {MODEL_ERROR_MESSAGES.DELETE_CONFIRMATION}
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            {MODEL_ERROR_MESSAGES.DELETE_WARNING}
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteModel(model.modelId)}
                                            className="bg-red-600 hover:bg-red-700"
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  )}
                                </div>
                              </div>
                              
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="font-medium">Description:</span>{' '}
                                  {model.description || 'No description'}
                                </div>
                                <div>
                                  <span className="font-medium">Created:</span>{' '}
                                  {formattedModel.formattedDate}
                                </div>
                                {model.tags && model.tags.length > 0 && (
                                  <div className="flex items-center gap-2">
                                    <Tag className="h-3 w-3" />
                                    <div className="flex flex-wrap gap-1">
                                      {model.tags.map((tag, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ModelList;
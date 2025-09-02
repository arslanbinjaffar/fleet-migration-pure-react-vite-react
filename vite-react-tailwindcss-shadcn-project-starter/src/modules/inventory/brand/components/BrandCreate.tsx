import React from 'react';
import { useNavigate } from 'react-router-dom';
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
import { toast } from '@/components/ui/use-toast';

// Icons
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

// API and Validation
import { usePostBrandMutation } from '@/stores/api/brandApiSlice';
import { createBrandSchema, type CreateBrandData } from '../schemas/brandSchema';
import {
  BRAND_SUCCESS_MESSAGES,
  BRAND_ERROR_MESSAGES,
  BRAND_FORM_LABELS,
} from '../constants';

// Permission hook
import {
  CreateButton,
  usePermissions,
  PermissionModule,
} from '@/components/permissions';

interface BrandCreateProps {
  className?: string;
}

const BrandCreate: React.FC<BrandCreateProps> = ({ className }) => {
  const navigate = useNavigate();
  
  // Get user info from localStorage (similar to original implementation)
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // API hook
  const [postBrand, { isLoading }] = usePostBrandMutation();
  
  // Permissions
  const permissions = usePermissions();
  const canCreate = permissions?.brand?.create || false;
  
  // Form setup
  const form = useForm<CreateBrandData>({
    resolver: zodResolver(createBrandSchema),
    defaultValues: {
      name: '',
      description: '',
      tags: [],
    },
  });
  
  // Redirect if no permission
  if (!canCreate) {
    navigate('/inventory/brand');
    return null;
  }
  
  // Form submission handler
  const onSubmit = async (data: CreateBrandData) => {
    try {
      // Clean up empty strings to undefined for optional fields
      const cleanedData = {
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        tags: data.tags?.filter(tag => tag.trim()) || [],
      };
      
      const result = await postBrand(cleanedData).unwrap();
      
      toast({
        title: 'Success',
        description: result?.message || BRAND_SUCCESS_MESSAGES.CREATED,
      });
      
      // Navigate back to brand list with user role (similar to original)
      const roleName = user?.Role?.roleName?.toLowerCase() || 'admin';
      navigate(`/${roleName}/brand`);
    } catch (error: any) {
      console.error('Error creating brand:', error);
      
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
  
  return (
    <div className={`max-w-2xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl font-bold">Add Brand</CardTitle>
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
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Tags - Simple implementation for now */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {BRAND_FORM_LABELS.TAGS}
                </label>
                <div className="text-sm text-gray-600">
                  Tags functionality can be added later if needed
                </div>
              </div>
              
              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="sm:w-auto w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Submit
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="sm:w-auto w-full"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandCreate;
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRoleBasedNavigation } from '../../../utils/roleBasedNavigation';
import { ArrowLeft, Save, Loader2, Tag, AlignLeft } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

// API and Types
import { useCreateFleetTypeMutation } from '@/stores/api/fleetTypeApiSlice';
import type { FleetTypeFormData } from '../types';
import { fleetTypeSchema } from '../schemas/fleetTypeSchema';
import {
  FLEET_TYPE_MESSAGES,
  FLEET_TYPE_LABELS,
} from '../constants';

// Utils

interface FleetTypeCreateProps {
  className?: string;
}

const FleetTypeCreate: React.FC<FleetTypeCreateProps> = ({ className }) => {
  const navigate = useRoleBasedNavigation();
  const { toast } = useToast();
  
  // API hooks
  const [createFleetType, { isLoading }] = useCreateFleetTypeMutation();

  // Form setup
  const form = useForm<FleetTypeFormData>({
    resolver: zodResolver(fleetTypeSchema),
    defaultValues: {
      fleetType: '',
      description: '',
    },
  });

  // Event handlers
  const onSubmit = async (data: FleetTypeFormData) => {
    try {
      const result = await createFleetType(data).unwrap();
      
      toast({
        title: 'Success',
        description: result?.message || FLEET_TYPE_MESSAGES.SUCCESS.CREATED,
      });
      
      // Navigate back to fleet types list
      navigate('/fleet-type');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.error || FLEET_TYPE_MESSAGES.ERROR.CREATE_FAILED,
        variant: 'destructive',
      });
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              {FLEET_TYPE_LABELS.ADD_FLEET_TYPE}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Fleet Type Name */}
              <FormField
                control={form.control}
                name="fleetType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      {FLEET_TYPE_LABELS.FLEET_TYPE_NAME}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter fleet type name"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter a unique name for the fleet type (e.g., "Truck", "Van", "Motorcycle")
                    </FormDescription>
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
                    <FormLabel className="flex items-center gap-2">
                      <AlignLeft className="h-4 w-4" />
                      {FLEET_TYPE_LABELS.DESCRIPTION}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter description (optional)"
                        rows={4}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide additional details about this fleet type (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 min-w-[120px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Create Fleet Type
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FleetTypeCreate;
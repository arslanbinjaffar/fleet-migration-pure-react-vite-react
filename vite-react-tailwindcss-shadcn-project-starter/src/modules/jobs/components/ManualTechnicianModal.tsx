import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, X } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useToast } from '@/components/ui/use-toast';

// Store and API
import { useAssignManualTechnicianMutation } from '@/stores/api/jobsApiSlice';
import {
  selectIsManualTechnicianModalOpen,
  selectCurrentJobForTechnician,
  setManualTechnicianModalOpen,
  setCurrentJobForTechnician,
} from '@/stores/slices/jobsSlice';

// Types and validation
import type { ManualTechnicianData } from '../schemas/jobSchema';
import { manualTechnicianSchema } from '../schemas/jobSchema';

const ManualTechnicianModal: React.FC = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Selectors
  const isOpen = useSelector(selectIsManualTechnicianModalOpen);
  const currentJob = useSelector(selectCurrentJobForTechnician);

  // API hooks
  const [assignManualTechnician, { isLoading }] = useAssignManualTechnicianMutation();

  // Form setup
  const form = useForm<ManualTechnicianData>({
    resolver: zodResolver(manualTechnicianSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Pre-fill with existing manual technician data if available
      if (currentJob?.manualTechnician) {
        form.reset({
          name: currentJob.manualTechnician.name || '',
          email: currentJob.manualTechnician.email || '',
        });
      } else {
        form.reset({
          name: '',
          email: '',
        });
      }
    }
  }, [isOpen, currentJob, form]);

  // Handle modal close
  const handleClose = () => {
    dispatch(setManualTechnicianModalOpen(false));
    dispatch(setCurrentJobForTechnician(null));
    form.reset();
  };

  // Handle form submission
  const onSubmit = async (data: ManualTechnicianData) => {
    if (!currentJob) {
      toast({
        title: 'Error',
        description: 'No job selected',
        variant: 'destructive',
      });
      return;
    }

    try {
      await assignManualTechnician({
        jobId: currentJob.jobId,
        manualTechnician: {
          name: data.name || undefined,
          email: data.email || undefined,
        },
      }).unwrap();

      toast({
        title: 'Success',
        description: 'Manual technician assigned successfully',
      });

      handleClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign manual technician',
        variant: 'destructive',
      });
    }
  };

  // Handle form errors
  const onError = (errors: any) => {
    console.error('Form validation errors:', errors);
    toast({
      title: 'Validation Error',
      description: 'Please check the form fields and try again',
      variant: 'destructive',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Add Manual Technician
          </DialogTitle>
          <DialogDescription>
            Add a technician who is not in the system. You can provide either a name, email, or both.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-4">
            <div className="space-y-4">
              {/* Technician Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Technician Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter technician name (optional)"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Technician Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Technician Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter technician email (optional)"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormDescription className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                <strong>Note:</strong> All fields are optional, but at least one field (name or email) must be provided.
                This technician will not have access to the system but will be recorded for this job.
              </FormDescription>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[100px]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Assigning...
                  </div>
                ) : (
                  <>
                    <User className="mr-2 h-4 w-4" />
                    Assign Technician
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ManualTechnicianModal;
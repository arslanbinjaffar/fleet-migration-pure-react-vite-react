import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus,
  Edit,
  X,
  User,
  Users,
  Car,
  Wrench,
  FileText,
  Settings,
} from 'lucide-react';

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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

// Store and API
import {
  useCreateJobMutation,
  useUpdateJobMutation,
} from '@/stores/api/jobsApiSlice';
import {
  useGetCustomersQuery,
} from '@/stores/api/customerApiSlice';
import {
  useGetFleetsQuery,
} from '@/stores/api/fleetApiSlice';
import {
  selectIsCreateJobModalOpen,
  selectIsEditJobModalOpen,
  selectCurrentJob,
  setCreateJobModalOpen,
  setEditJobModalOpen,
  setCurrentJob,
} from '@/stores/slices/jobsSlice';

// Types and validation
import type { JobFormData } from '../schemas/jobSchema';
import { jobSchema } from '../schemas/jobSchema';
import { SELECTION_MODE_OPTIONS } from '../constants';
import { useShiftDetails, type Technician } from '@/utils/useShiftDetails';

const JobModal: React.FC = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { options, isLoading: isShiftDetailsLoading, isError: isShiftDetailsError, refetch: refetchShiftDetails } = useShiftDetails();
  // Selectors
  const isCreateModalOpen = useSelector(selectIsCreateJobModalOpen);
  const isEditModalOpen = useSelector(selectIsEditJobModalOpen);
  const currentJob = useSelector(selectCurrentJob);

  const isOpen = isCreateModalOpen || isEditModalOpen;
  const isEditMode = isEditModalOpen && !!currentJob;

  // API hooks
  const [createJob, { isLoading: isCreating }] = useCreateJobMutation();
  const [updateJob, { isLoading: isUpdating }] = useUpdateJobMutation();
  
  const { data: customersData } = useGetCustomersQuery({ page: 1, limit: 100 });
  const { data: fleetsData } = useGetFleetsQuery({ page: 1, limit: 100 });

  // Get technicians from shift details
  const technicians: Technician[] = options.technician || [];

  const isLoading = isCreating || isUpdating;

  // Handle shift details error
  useEffect(() => {
    if (isShiftDetailsError) {
      toast({
        title: 'Error',
        description: 'Failed to load shift details. Some options may not be available.',
        variant: 'destructive',
      });
    }
  }, [isShiftDetailsError, toast]);

  // Form setup
  const form = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      customerSelectionMode: 'auto',
      machineSelectionMode: 'auto',
      technicianSelectionMode: 'auto',
      customerFirstname: '',
      customerLastname: '',
      customerEmail: '',
      customerPhone: '',
      machineName: '',
      machineType: '',
      machineBrand: '',
      machineModel: '',
      machineChassisNo: '',
      machinePlateNo: '',
      runningHours: '',
      serviceArea: '',
      manualTechnicianName: '',
      manualTechnicianEmail: '',
      reportedIssues: '',
      comments: '',
    },
  });

  // Watch form values for conditional rendering
  const customerSelectionMode = form.watch('customerSelectionMode');
  const machineSelectionMode = form.watch('machineSelectionMode');
  const technicianSelectionMode = form.watch('technicianSelectionMode');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && currentJob) {
        // Pre-fill form with current job data

        const customerMode = currentJob.customerId ? 'auto' : 'manual';
        const machineMode = currentJob.fleetId ? 'auto' : 'manual';
        const technicianMode = currentJob.manualTechnician ? 'manual' : 'auto';

        form.reset({
          customerSelectionMode: customerMode,
          customerId: currentJob.customerId,
          customerFirstname: currentJob.customerJob?.firstname || '',
          customerLastname: currentJob.customerJob?.lastname || '',
          customerEmail: currentJob.customerJob?.email || '',
          customerPhone: currentJob.customerJob?.phone || '',
          
          machineSelectionMode: machineMode,
          fleetId: currentJob.fleetId,
          machineName: currentJob.FleetbyTbcJob?.machineName || '',
          machineType: currentJob.FleetbyTbcJob?.machineType || '',
          machineBrand: currentJob.FleetbyTbcJob?.machineBrand || '',
          machineModel: currentJob.FleetbyTbcJob?.machineModel || '',
          machineChassisNo: currentJob.FleetbyTbcJob?.machineChassisNo || '',
          machinePlateNo: currentJob.FleetbyTbcJob?.machinePlateNo || '',
          runningHours: currentJob.FleetbyTbcJob?.runningHours || '',
          serviceArea: currentJob.FleetbyTbcJob?.servicesArea || '',
          fleetbyTbcJobId: currentJob.fleetbyTbcJobId,
          
          technicianSelectionMode: technicianMode,
          technician: currentJob.technician,
          manualTechnicianName: currentJob.manualTechnician?.name || '',
          manualTechnicianEmail: currentJob.manualTechnician?.email || '',
          
          reportedIssues: currentJob.description || '',
          comments: currentJob.comments || '',
        });
      } else {
        // Reset to default values for create mode
        form.reset();
      }
    }
  }, [isOpen, isEditMode, currentJob, form]);

  // Handle modal close
  const handleClose = () => {
    dispatch(setCreateJobModalOpen(false));
    dispatch(setEditJobModalOpen(false));
    dispatch(setCurrentJob(null));
    form.reset();
  };

  // Handle form submission
  const onSubmit = async (data: JobFormData) => {
    try {
      if (isEditMode && currentJob) {
        await updateJob({
          id: currentJob.jobId,
          data,
        }).unwrap();
        
        toast({
          title: 'Success',
          description: 'Job updated successfully',
        });
      } else {
        console.log(data,"data")
        await createJob(data).unwrap();
        
        toast({
          title: 'Success',
          description: 'Job created successfully',
        });
      }

      handleClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} job`,
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <Edit className="h-5 w-5" />
                Edit Job
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                Create New Job
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the job details below'
              : 'Fill in the details to create a new job'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
            {/* Customer Details Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Customer Selection Mode */}
                <FormField
                  control={form.control}
                  name="customerSelectionMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selection Mode</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex items-center space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="auto" id="customer-auto" />
                            <Label htmlFor="customer-auto">Auto Select</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="manual" id="customer-manual" />
                            <Label htmlFor="customer-manual">Manual Entry</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {customerSelectionMode === 'auto' ? (
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customersData?.customers?.map((customer) => (
                              <SelectItem key={customer.customerId} value={customer.customerId}>
                                {`${customer.firstname} ${customer.lastname}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customerFirstname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter first name (optional)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerLastname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter last name (optional)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter email (optional)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter phone (optional)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {customerSelectionMode === 'manual' && (
                  <FormDescription className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    <strong>Note:</strong> All fields are optional for manual customer entry, but at least one field should be provided.
                  </FormDescription>
                )}
              </CardContent>
            </Card>

            {/* Machine Details Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Car className="h-5 w-5" />
                  Machine Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Machine Selection Mode */}
                <FormField
                  control={form.control}
                  name="machineSelectionMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selection Mode</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex items-center space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="auto" id="machine-auto" />
                            <Label htmlFor="machine-auto">Auto Select</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="manual" id="machine-manual" />
                            <Label htmlFor="machine-manual">Manual Entry</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {machineSelectionMode === 'auto' ? (
                  <FormField
                    control={form.control}
                    name="fleetId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Machine</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select machine" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {fleetsData?.fleets?.map((fleet) => (
                              <SelectItem key={fleet.fleetId} value={fleet.fleetId!}>
                                {`${fleet.vehicleName} (${fleet.plateNumber})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="machineName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Machine Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter machine name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="machineType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Machine Type</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter machine type (optional)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="machineBrand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Machine Brand</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter machine brand (optional)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="machineModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Machine Model</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter machine model (optional)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="machineChassisNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chassis No</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter chassis number (optional)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="machinePlateNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plate No</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter plate number (optional)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="runningHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Running Hours</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter running hours (optional)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="serviceArea"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Area</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter service area (optional)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Technician Assignment Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wrench className="h-5 w-5" />
                  Technician Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Technician Selection Mode */}
                <FormField
                  control={form.control}
                  name="technicianSelectionMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selection Mode</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex items-center space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="auto" id="technician-auto" />
                            <Label htmlFor="technician-auto">Auto Select</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="manual" id="technician-manual" />
                            <Label htmlFor="technician-manual">Manual Entry</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {technicianSelectionMode === 'auto' ? (
                  <FormField
                    control={form.control}
                    name="technician"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned Technician</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={
                                isShiftDetailsLoading 
                                  ? "Loading technicians..." 
                                  : technicians.length === 0 
                                    ? "No technicians available" 
                                    : "Select technician (optional)"
                              } />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isShiftDetailsLoading ? (
                              <SelectItem value="loading" disabled>
                                Loading technicians...
                              </SelectItem>
                            ) : technicians.length === 0 ? (
                              <SelectItem value="no-data" disabled>
                                No technicians available
                              </SelectItem>
                            ) : (
                              technicians.map((technician) => (
                                <SelectItem key={technician.userId} value={technician.userId}>
                                  {`${technician.firstName} ${technician.lastName}`}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="manualTechnicianName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Technician Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter technician name (optional)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manualTechnicianEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Technician Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter technician email (optional)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {technicianSelectionMode === 'manual' && (
                  <FormDescription className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    <strong>Note:</strong> All fields are optional for manual technician entry.
                  </FormDescription>
                )}
              </CardContent>
            </Card>

            {/* Job Details Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Job Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="reportedIssues"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reported Issues</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter reported issues (optional)"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Comments</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter additional comments (optional)"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

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
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  <>
                    {isEditMode ? (
                      <>
                        <Edit className="mr-2 h-4 w-4" />
                        Update Job
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Job
                      </>
                    )}
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

export default JobModal;
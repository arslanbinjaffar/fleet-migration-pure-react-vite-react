import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Save,
  Loader2,
  Clock,
  Users,
  Truck,
  Building,
  Calendar,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

import {
  useGetShiftRelatedDetailsQuery,
  useCreateScheduledShiftMutation,
  useCheckShiftConflictsQuery,
} from '../../../stores/api/timesheetApiSlice';
import { selectCurrentUser } from '../../../stores/slices/authSlice';
import {
  selectTimesheetModals,
  setIsCreateModalOpen,
} from '../../../stores/slices/timesheetSlice';
import {
  timesheetSchema,
  TimesheetFormData,
  timesheetFormSections,
} from '../schemas/timesheetSchema';
import {
  SHIFT_TYPE_OPTIONS,
  TIMESHEET_FORM_STEPS,
} from '../constants';
import {
  getErrorMessage,
  getDisplayLabel,
  validateTimeRange,
} from '../utils';

const FORM_STEPS = [
  {
    id: 'shiftDetails',
    title: 'Shift Details',
    description: 'Select site, fleet, and shift type',
    icon: Building,
  },
  {
    id: 'operatorDetails',
    title: 'Operator Assignment',
    description: 'Assign operators to the shift',
    icon: Users,
  },
  {
    id: 'timeDetails',
    title: 'Time Configuration',
    description: 'Set working hours and schedule',
    icon: Clock,
  },
];

interface TimesheetCreateProps {
  isOpen: boolean;
  onClose: () => void;
}

const TimesheetCreate: React.FC<TimesheetCreateProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [currentStep, setCurrentStep] = useState(0);
  const [conflictCheck, setConflictCheck] = useState<{
    fleetId: string;
    operatorIds: string[];
    startTime: string;
    endTime: string;
  } | null>(null);
  
  // API hooks
  const {
    data: relatedDetails,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = useGetShiftRelatedDetailsQuery();
  
  const [createScheduledShift, { isLoading: isCreating }] = useCreateScheduledShiftMutation();
  
  const {
    data: conflictData,
    isLoading: isCheckingConflicts,
  } = useCheckShiftConflictsQuery(conflictCheck!, {
    skip: !conflictCheck,
  });
  
  // Form setup
  const form = useForm<TimesheetFormData>({
    resolver: zodResolver(timesheetSchema),
    defaultValues: {
      selectedSite: null,
      selectedFleet: null,
      firstOperator: null,
      secondOperator: null,
      shiftType: 'single',
      firstOperatorStartDateTime: '',
      firstOperatorEndDateTime: '',
      secondOperatorStartDateTime: '',
      secondOperatorEndDateTime: '',
      machineStartTime: '',
      machineEndTime: '',
      comment: '',
    },
  });
  
  const { control, handleSubmit, watch, trigger, reset, formState: { errors, isValid } } = form;
  const watchedValues = watch();
  
  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      reset();
      setCurrentStep(0);
      setConflictCheck(null);
    }
  }, [isOpen, reset]);
  
  // Check for conflicts when relevant fields change
  useEffect(() => {
    const { selectedFleet, firstOperator, secondOperator, machineStartTime, machineEndTime } = watchedValues;
    
    if (selectedFleet && machineStartTime && machineEndTime && firstOperator) {
      const operatorIds = [firstOperator.value];
      if (secondOperator) {
        operatorIds.push(secondOperator.value);
      }
      
      setConflictCheck({
        fleetId: selectedFleet.value,
        operatorIds,
        startTime: machineStartTime,
        endTime: machineEndTime,
      });
    } else {
      setConflictCheck(null);
    }
  }, [
    watchedValues.selectedFleet,
    watchedValues.firstOperator,
    watchedValues.secondOperator,
    watchedValues.machineStartTime,
    watchedValues.machineEndTime,
  ]);
  
  const handleClose = () => {
    reset();
    setCurrentStep(0);
    setConflictCheck(null);
    onClose();
  };
  
  const onSubmit = async (data: TimesheetFormData) => {
    try {
      const shiftData = {
        fleetId: data.selectedFleet!.value,
        siteProjectId: data.selectedSite!.value,
        firstOperatorId: data.firstOperator!.value,
        secondOperatorId: data.secondOperator?.value,
        shiftType: data.shiftType,
        scheduledDate: new Date().toISOString().split('T')[0], // Today's date
        firstOperatorStartDateTime: data.firstOperatorStartDateTime,
        firstOperatorEndDateTime: data.firstOperatorEndDateTime,
        secondOperatorStartDateTime: data.secondOperatorStartDateTime,
        secondOperatorEndDateTime: data.secondOperatorEndDateTime,
        comment: data.comment,
      };
      
      const result = await createScheduledShift(shiftData).unwrap();
      toast.success(result.message || 'Shift scheduled successfully');
      handleClose();
    } catch (error: any) {
      console.error('Create error:', error);
      toast.error(getErrorMessage(error));
    }
  };
  
  const nextStep = async () => {
    const currentStepData = FORM_STEPS[currentStep];
    const stepFields = timesheetFormSections[currentStepData.id as keyof typeof timesheetFormSections]?.fields || [];
    
    const isStepValid = await trigger(stepFields as any);
    
    if (isStepValid) {
      setCurrentStep(prev => Math.min(FORM_STEPS.length - 1, prev + 1));
    }
  };
  
  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };
  
  const progressPercentage = ((currentStep + 1) / FORM_STEPS.length) * 100;
  const currentStepData = FORM_STEPS[currentStep];
  const StepIcon = currentStepData.icon;
  
  // Prepare options for selects
  const siteOptions = relatedDetails?.siteProjects?.map(site => ({
    value: site.siteProjectId,
    label: site.projectName,
  })) || [];
  
  const fleetOptions = relatedDetails?.fleets?.map(fleet => ({
    value: fleet.fleetId,
    label: `${fleet.vehicleName} (${fleet.plateNumber})`,
  })) || [];
  
  const operatorOptions = relatedDetails?.operators?.map(operator => ({
    value: operator.userId,
    label: `${operator.firstName} ${operator.lastName}`,
  })) || [];
  
  if (isLoadingDetails) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading form data...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  if (detailsError) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px]">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {getErrorMessage(detailsError)}
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Clock className="h-6 w-6 mr-2 text-primary" />
            Schedule New Shift
          </DialogTitle>
          <DialogDescription>
            Create a new scheduled shift for fleet operations
          </DialogDescription>
        </DialogHeader>
        
        {/* Progress */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <StepIcon className="h-5 w-5 text-primary" />
              <span className="font-medium">
                Step {currentStep + 1} of {FORM_STEPS.length}: {currentStepData.title}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <Progress value={progressPercentage} className="w-full" />
          <p className="text-sm text-muted-foreground">
            {currentStepData.description}
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 0: Shift Details */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <FormField
                  control={control}
                  name="selectedSite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Building className="h-4 w-4 mr-2" />
                        Site Project *
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          const site = siteOptions.find(s => s.value === value);
                          field.onChange(site || null);
                        }}
                        value={field.value?.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a site project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {siteOptions.map((option) => (
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
                
                <FormField
                  control={control}
                  name="selectedFleet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Truck className="h-4 w-4 mr-2" />
                        Fleet *
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          const fleet = fleetOptions.find(f => f.value === value);
                          field.onChange(fleet || null);
                        }}
                        value={field.value?.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a fleet" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {fleetOptions.map((option) => (
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
                
                <FormField
                  control={control}
                  name="shiftType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shift Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select shift type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SHIFT_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Single shift requires one operator, double shift requires two operators
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            {/* Step 1: Operator Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <FormField
                  control={control}
                  name="firstOperator"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        First Operator *
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          const operator = operatorOptions.find(o => o.value === value);
                          field.onChange(operator || null);
                        }}
                        value={field.value?.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select first operator" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {operatorOptions.map((option) => (
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
                
                {watchedValues.shiftType === 'double' && (
                  <FormField
                    control={control}
                    name="secondOperator"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Second Operator *
                        </FormLabel>
                        <Select
                          onValueChange={(value) => {
                            const operator = operatorOptions.find(o => o.value === value);
                            field.onChange(operator || null);
                          }}
                          value={field.value?.value || ''}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select second operator" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {operatorOptions
                              .filter(option => option.value !== watchedValues.firstOperator?.value)
                              .map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Required for double shifts
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}
            
            {/* Step 2: Time Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Machine Time */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium">Machine Operating Hours</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name="machineStartTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time *</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={control}
                      name="machineEndTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time *</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* First Operator Time */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium">First Operator Hours</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name="firstOperatorStartDateTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time *</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={control}
                      name="firstOperatorEndDateTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time *</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Second Operator Time */}
                {watchedValues.shiftType === 'double' && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-medium">Second Operator Hours</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={control}
                        name="secondOperatorStartDateTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time *</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={control}
                        name="secondOperatorEndDateTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Time *</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
                
                {/* Comments */}
                <FormField
                  control={control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Comments
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any additional notes or comments..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            {/* Conflict Warning */}
            {conflictData?.hasConflicts && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Scheduling Conflicts Detected:</p>
                    {conflictData.conflicts.map((conflict, index) => (
                      <div key={index} className="text-sm">
                        • {conflict.message}
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Loading Conflict Check */}
            {isCheckingConflicts && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Checking for scheduling conflicts...</span>
              </div>
            )}
          </form>
        </Form>
        
        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <Button
              type="button"
              variant="outline"
              onClick={currentStep === 0 ? handleClose : prevStep}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep === 0 ? 'Cancel' : 'Previous'}
            </Button>
            
            {currentStep < FORM_STEPS.length - 1 ? (
              <Button type="button" onClick={nextStep}>
                Next
                <CheckCircle className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={isCreating || conflictData?.hasConflicts}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Schedule Shift
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TimesheetCreate;
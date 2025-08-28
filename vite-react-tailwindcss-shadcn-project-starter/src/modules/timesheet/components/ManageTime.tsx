import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Clock,
  Save,
  Loader2,
  Users,
  Truck,
  Calculator,
  AlertTriangle,
  CheckCircle,
  X,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

import { useUpdateTimesheetMutation } from '../../../stores/api/timesheetApiSlice';
import { selectCurrentUser } from '../../../stores/slices/authSlice';
import { updateTimesheetSchema, UpdateTimesheetFormData } from '../schemas/timesheetSchema';
import { ScheduledShift } from '../types';
import {
  formatDateTime,
  formatTime,
  calculateHours,
  calculateMinutes,
  formatDuration,
  getOperatorName,
  getErrorMessage,
  validateTimeRange,
} from '../utils';

interface ManageTimeProps {
  isOpen: boolean;
  onClose: () => void;
  shift: ScheduledShift | null;
}

const ManageTime: React.FC<ManageTimeProps> = ({ isOpen, onClose, shift }) => {
  const user = useSelector(selectCurrentUser);
  const [updateTimesheet, { isLoading: isUpdating }] = useUpdateTimesheetMutation();
  
  // Form setup
  const form = useForm<UpdateTimesheetFormData>({
    resolver: zodResolver(updateTimesheetSchema),
    defaultValues: {
      scheduledFleetId: '',
      machineStartTime: '',
      machineEndTime: '',
      firstOperatorStartDateTime: '',
      firstOperatorEndDateTime: '',
      secondOperatorStartDateTime: '',
      secondOperatorEndDateTime: '',
    },
  });
  
  const { control, handleSubmit, watch, reset, setValue, formState: { errors } } = form;
  const watchedValues = watch();
  
  // Initialize form when shift data is available
  useEffect(() => {
    if (shift && isOpen) {
      reset({
        scheduledFleetId: shift.scheduledFleetId,
        machineStartTime: shift.timesheet?.startTimeMachine || '',
        machineEndTime: shift.timesheet?.endTimeMachine || '',
        firstOperatorStartDateTime: shift.timesheet?.startTimeOperator1 || '',
        firstOperatorEndDateTime: shift.timesheet?.endTimeOperator1 || '',
        secondOperatorStartDateTime: shift.timesheet?.startTimeOperator2 || '',
        secondOperatorEndDateTime: shift.timesheet?.endTimeOperator2 || '',
      });
    }
  }, [shift, isOpen, reset]);
  
  const handleClose = () => {
    reset();
    onClose();
  };
  
  const onSubmit = async (data: UpdateTimesheetFormData) => {
    if (!shift) return;
    
    try {
      // Filter out empty values
      const updateData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value && value.trim() !== '') {
          acc[key as keyof UpdateTimesheetFormData] = value;
        }
        return acc;
      }, {} as Partial<UpdateTimesheetFormData>);
      
      await updateTimesheet(updateData).unwrap();
      toast.success('Timesheet updated successfully');
      handleClose();
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(getErrorMessage(error));
    }
  };
  
  // Calculate hours for display
  const machineHours = calculateHours(watchedValues.machineStartTime, watchedValues.machineEndTime);
  const firstOperatorHours = calculateHours(
    watchedValues.firstOperatorStartDateTime,
    watchedValues.firstOperatorEndDateTime
  );
  const secondOperatorHours = calculateHours(
    watchedValues.secondOperatorStartDateTime,
    watchedValues.secondOperatorEndDateTime
  );
  
  // Validation checks
  const machineTimeValid = validateTimeRange(
    watchedValues.machineStartTime,
    watchedValues.machineEndTime
  );
  const firstOperatorTimeValid = validateTimeRange(
    watchedValues.firstOperatorStartDateTime,
    watchedValues.firstOperatorEndDateTime
  );
  const secondOperatorTimeValid = !watchedValues.secondOperatorStartDateTime || 
    !watchedValues.secondOperatorEndDateTime ||
    validateTimeRange(
      watchedValues.secondOperatorStartDateTime,
      watchedValues.secondOperatorEndDateTime
    );
  
  if (!shift) {
    return null;
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Clock className="h-6 w-6 mr-2 text-primary" />
            Manage Time - {shift.fleet?.vehicleName}
          </DialogTitle>
          <DialogDescription>
            Update working hours and timesheet for this shift
          </DialogDescription>
        </DialogHeader>
        
        {/* Shift Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Shift Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Fleet</Label>
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {shift.fleet?.vehicleName} ({shift.fleet?.plateNumber})
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Project</Label>
                <span className="font-medium">{shift.siteProject?.projectName}</span>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Shift Type</Label>
                <Badge variant="outline" className="capitalize">
                  {shift.shiftType} Shift
                </Badge>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Operators</Label>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{getOperatorName(shift.FirstOperator)}</span>
                  </div>
                  {shift.SecondOperator && (
                    <div className="flex items-center space-x-2">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{getOperatorName(shift.SecondOperator)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Machine Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Truck className="h-5 w-5 mr-2" />
                  Machine Operating Hours
                </CardTitle>
                <CardDescription>
                  Set the actual machine operating time
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="machineStartTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
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
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Machine Hours Summary */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calculator className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Total Machine Hours:</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={machineTimeValid ? 'default' : 'destructive'}>
                      {machineHours > 0 ? `${machineHours.toFixed(1)}h` : 'Not set'}
                    </Badge>
                    {!machineTimeValid && watchedValues.machineStartTime && watchedValues.machineEndTime && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* First Operator Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Users className="h-5 w-5 mr-2" />
                  First Operator Hours
                </CardTitle>
                <CardDescription>
                  {getOperatorName(shift.FirstOperator)} working hours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="firstOperatorStartDateTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
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
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* First Operator Hours Summary */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calculator className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Total Hours:</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={firstOperatorTimeValid ? 'default' : 'destructive'}>
                      {firstOperatorHours > 0 ? `${firstOperatorHours.toFixed(1)}h` : 'Not set'}
                    </Badge>
                    {!firstOperatorTimeValid && watchedValues.firstOperatorStartDateTime && watchedValues.firstOperatorEndDateTime && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Second Operator Hours (if double shift) */}
            {shift.shiftType === 'double' && shift.SecondOperator && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Users className="h-5 w-5 mr-2" />
                    Second Operator Hours
                  </CardTitle>
                  <CardDescription>
                    {getOperatorName(shift.SecondOperator)} working hours
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name="secondOperatorStartDateTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
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
                          <FormLabel>End Time</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Second Operator Hours Summary */}
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Calculator className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Total Hours:</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={secondOperatorTimeValid ? 'default' : 'destructive'}>
                        {secondOperatorHours > 0 ? `${secondOperatorHours.toFixed(1)}h` : 'Not set'}
                      </Badge>
                      {!secondOperatorTimeValid && watchedValues.secondOperatorStartDateTime && watchedValues.secondOperatorEndDateTime && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Current Timesheet Data */}
            {shift.timesheet && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Timesheet Data</CardTitle>
                  <CardDescription>
                    Previously recorded hours for reference
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Machine Hours</Label>
                      <div className="text-lg font-semibold">
                        {shift.timesheet.totalMachineHours?.toFixed(1) || '0.0'}h
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Operator 1 Hours</Label>
                      <div className="text-lg font-semibold">
                        {shift.timesheet.totalOperatorHours1?.toFixed(1) || '0.0'}h
                      </div>
                    </div>
                    
                    {shift.shiftType === 'double' && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Operator 2 Hours</Label>
                        <div className="text-lg font-semibold">
                          {shift.timesheet.totalOperatorHours2?.toFixed(1) || '0.0'}h
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Validation Warnings */}
            {(!machineTimeValid || !firstOperatorTimeValid || !secondOperatorTimeValid) && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Time Validation Issues:</p>
                    {!machineTimeValid && (
                      <p className="text-sm">• Machine end time must be after start time</p>
                    )}
                    {!firstOperatorTimeValid && (
                      <p className="text-sm">• First operator end time must be after start time</p>
                    )}
                    {!secondOperatorTimeValid && (
                      <p className="text-sm">• Second operator end time must be after start time</p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </form>
        </Form>
        
        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <Button type="button" variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={isUpdating || !machineTimeValid || !firstOperatorTimeValid || !secondOperatorTimeValid}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Timesheet
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManageTime;
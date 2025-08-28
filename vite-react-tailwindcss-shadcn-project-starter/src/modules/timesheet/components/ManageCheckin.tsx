import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Calendar,
  Clock,
  Users,
  Truck,
  Building,
  Search,
  Save,
  Loader2,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  MessageSquare,
  Edit,
  Download,
  Filter,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

import {
  useGetScheduledShiftsQuery,
  useGetShiftRelatedDetailsQuery,
  useUpdateTimesheetMutation,
  useUpdateScheduledShiftMutation,
} from '../../../stores/api/timesheetApiSlice';
import { selectCurrentUser } from '../../../stores/slices/authSlice';
import { ScheduledShift, Operator } from '../types';
import {
  formatDate,
  formatTime,
  getOperatorName,
  getStatusConfig,
  getErrorMessage,
} from '../utils';
import { SHIFT_STATUS_OPTIONS } from '../constants';

interface ShiftWithExtras extends ScheduledShift {
  hours1?: string;
  totalMachineHours?: number;
  operatorComment?: string;
}

interface FormErrors {
  [key: string]: string | null;
}

const ManageCheckin: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [search, setSearch] = useState('');
  const [shifts, setShifts] = useState<ShiftWithExtras[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  
  // API hooks
  const {
    data: shiftsResponse,
    isLoading: loadingShifts,
    refetch: refetchShifts,
  } = useGetScheduledShiftsQuery(
    selectedDate ? { from: selectedDate, to: selectedDate } : {},
    {
      refetchOnMountOrArgChange: true,
    }
  );
  
  const {
    data: relatedDetails,
    isLoading: loadingDetails,
  } = useGetShiftRelatedDetailsQuery();
  
  const [updateTimesheet] = useUpdateTimesheetMutation();
  const [updateScheduledShift] = useUpdateScheduledShiftMutation();
  
  // Update shifts when API data changes
  useEffect(() => {
    if (shiftsResponse?.shifts) {
      const shiftsWithExtras = shiftsResponse.shifts.map(shift => {
        const timeSheetEntry = shiftsResponse.timeSheet?.find(
          item => item.scheduledFleetId === shift.scheduledFleetId
        );
        return {
          ...shift,
          hours1: timeSheetEntry?.totalOperatorHours1?.toString() || '',
          totalMachineHours: timeSheetEntry?.totalMachineHours || 0,
          operatorComment: shift.comment || '',
        };
      });
      setShifts(shiftsWithExtras);
    }
  }, [shiftsResponse]);
  
  // Filter shifts based on search
  const filteredShifts = useMemo(() => {
    if (!search.trim()) return shifts;
    
    const term = search.toLowerCase();
    return shifts.filter(shift => {
      const fleetName = shift.fleet?.vehicleName?.toLowerCase() || '';
      const plateNumber = shift.fleet?.plateNumber?.toLowerCase() || '';
      const projectName = shift.siteProject?.projectName?.toLowerCase() || '';
      const operatorName = getOperatorName(shift.FirstOperator).toLowerCase();
      
      return (
        fleetName.includes(term) ||
        plateNumber.includes(term) ||
        projectName.includes(term) ||
        operatorName.includes(term)
      );
    });
  }, [shifts, search]);
  
  // Handle time input changes with validation
  const handleTimeChange = (shiftId: string, field: string, value: string) => {
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setShifts(prevShifts =>
        prevShifts.map(shift =>
          shift.scheduledFleetId === shiftId
            ? { ...shift, [field]: value }
            : shift
        )
      );
      
      setErrors(prev => ({
        ...prev,
        [`${shiftId}-${field}`]: null,
      }));
    } else {
      setErrors(prev => ({
        ...prev,
        [`${shiftId}-${field}`]: 'Please enter a valid number',
      }));
    }
  };
  
  // Handle machine hours change
  const handleHoursChange = (shiftId: string, value: string) => {
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setShifts(prevShifts =>
        prevShifts.map(shift =>
          shift.scheduledFleetId === shiftId
            ? { ...shift, totalMachineHours: parseFloat(value) || 0 }
            : shift
        )
      );
      
      setErrors(prev => ({
        ...prev,
        [`${shiftId}-machineHours`]: null,
      }));
    } else {
      setErrors(prev => ({
        ...prev,
        [`${shiftId}-machineHours`]: 'Please enter a valid number',
      }));
    }
  };
  
  // Handle comment changes
  const handleCommentChange = (shiftId: string, value: string) => {
    setShifts(prevShifts =>
      prevShifts.map(shift =>
        shift.scheduledFleetId === shiftId
          ? { ...shift, operatorComment: value }
          : shift
      )
    );
  };
  
  // Handle operator change
  const handleOperatorChange = (shift: ShiftWithExtras, operatorId: string, isSecondOperator = false) => {
    const selectedOperator = relatedDetails?.operators?.find(o => o.userId === operatorId);
    
    if (isSecondOperator) {
      setShifts(prevShifts =>
        prevShifts.map(s =>
          s.scheduledFleetId === shift.scheduledFleetId
            ? {
                ...s,
                secondOperatorId: operatorId,
                SecondOperator: selectedOperator || {
                  userId: operatorId,
                  firstName: 'Unknown',
                  lastName: 'Operator',
                },
              }
            : s
        )
      );
    } else {
      setShifts(prevShifts =>
        prevShifts.map(s =>
          s.scheduledFleetId === shift.scheduledFleetId
            ? {
                ...s,
                firstOperatorId: operatorId,
                FirstOperator: selectedOperator || {
                  userId: operatorId,
                  firstName: 'Unknown',
                  lastName: 'Operator',
                },
              }
            : s
        )
      );
    }
  };
  
  // Save all changes
  const handleSaveAll = async () => {
    setLoadingSubmit(true);
    try {
      const updatePromises = shifts.map(async (shift) => {
        // Update timesheet if hours changed
        if (shift.hours1 || shift.totalMachineHours) {
          await updateTimesheet({
            scheduledFleetId: shift.scheduledFleetId,
            firstOperatorStartDateTime: shift.timesheet?.startTimeOperator1,
            firstOperatorEndDateTime: shift.timesheet?.endTimeOperator1,
            machineStartTime: shift.timesheet?.startTimeMachine,
            machineEndTime: shift.timesheet?.endTimeMachine,
          });
        }
        
        // Update shift details if operators or comments changed
        await updateScheduledShift({
          scheduledFleetId: shift.scheduledFleetId,
          firstOperatorId: shift.firstOperatorId,
          secondOperatorId: shift.secondOperatorId,
          comment: shift.operatorComment,
        });
      });
      
      await Promise.all(updatePromises);
      toast.success('All changes saved successfully');
      refetchShifts();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoadingSubmit(false);
    }
  };
  
  // Render status badge
  const renderStatusBadge = (status: string) => {
    const config = getStatusConfig(status);
    return (
      <Badge className={`${config.bgColor} ${config.color} border-0`}>
        {status === 'working' && <Play className="h-3 w-3 mr-1" />}
        {status === 'standby' && <Pause className="h-3 w-3 mr-1" />}
        {status === 'Out of service' && <XCircle className="h-3 w-3 mr-1" />}
        {config.label}
      </Badge>
    );
  };
  
  // Operator dropdown component
  const OperatorSelect: React.FC<{
    shift: ShiftWithExtras;
    isSecondOperator?: boolean;
  }> = ({ shift, isSecondOperator = false }) => {
    const currentOperatorId = isSecondOperator ? shift.secondOperatorId : shift.firstOperatorId;
    const currentOperator = isSecondOperator ? shift.SecondOperator : shift.FirstOperator;
    
    return (
      <Select
        value={currentOperatorId || ''}
        onValueChange={(value) => handleOperatorChange(shift, value, isSecondOperator)}
        disabled={isUpdatingStatus}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select operator">
            {currentOperator ? getOperatorName(currentOperator) : 'Unassigned'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Unassigned</SelectItem>
          {relatedDetails?.operators?.map((operator) => (
            <SelectItem key={operator.userId} value={operator.userId}>
              {getOperatorName(operator)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };
  
  if (loadingDetails) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading shift details...</span>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <CheckCircle className="h-8 w-8 mr-3 text-primary" />
            Manage Check-in
          </h1>
          <p className="text-muted-foreground mt-1">
            Update shift details, operator assignments, and working hours
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSaveAll}
            disabled={loadingSubmit || shifts.length === 0}
          >
            {loadingSubmit ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save All Changes
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Select Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Search Shifts</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by fleet, project, or operator..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Shifts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Shift Management</CardTitle>
          <CardDescription>
            {filteredShifts.length} shifts found
            {selectedDate && ` for ${formatDate(selectedDate)}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingShifts ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading shifts...</span>
            </div>
          ) : filteredShifts.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No shifts found</h3>
              <p className="text-muted-foreground">
                {selectedDate
                  ? `No shifts scheduled for ${formatDate(selectedDate)}`
                  : 'Please select a date to view shifts'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredShifts.map((shift) => (
                <Card key={shift.scheduledFleetId} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Truck className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <h3 className="font-semibold">{shift.fleet?.vehicleName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {shift.fleet?.plateNumber}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{shift.siteProject?.projectName}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {renderStatusBadge(shift.status)}
                        <Badge variant="outline" className="capitalize">
                          {shift.shiftType} Shift
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Operator Assignment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          First Operator
                        </Label>
                        <OperatorSelect shift={shift} />
                      </div>
                      
                      {shift.shiftType === 'double' && (
                        <div className="space-y-2">
                          <Label className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            Second Operator
                          </Label>
                          <OperatorSelect shift={shift} isSecondOperator />
                        </div>
                      )}
                    </div>
                    
                    {/* Hours Input */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Operator Hours
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={shift.hours1 || ''}
                          onChange={(e) => handleTimeChange(shift.scheduledFleetId, 'hours1', e.target.value)}
                        />
                        {errors[`${shift.scheduledFleetId}-hours1`] && (
                          <p className="text-sm text-red-600">
                            {errors[`${shift.scheduledFleetId}-hours1`]}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="flex items-center">
                          <Truck className="h-4 w-4 mr-2" />
                          Machine Hours
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={shift.totalMachineHours?.toString() || ''}
                          onChange={(e) => handleHoursChange(shift.scheduledFleetId, e.target.value)}
                        />
                        {errors[`${shift.scheduledFleetId}-machineHours`] && (
                          <p className="text-sm text-red-600">
                            {errors[`${shift.scheduledFleetId}-machineHours`]}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Comments */}
                    <div className="space-y-2">
                      <Label className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Operator Comments
                      </Label>
                      <Textarea
                        placeholder="Add comments about this shift..."
                        value={shift.operatorComment || ''}
                        onChange={(e) => handleCommentChange(shift.scheduledFleetId, e.target.value)}
                        className="min-h-[80px]"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageCheckin;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '../../../stores/slices/authSlice';
import {
  ArrowLeft,
  Save,
  Loader2,
  Truck,
  ClipboardList,
  User,
  FileText,
  AlertCircle,
  Eye,
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { DatePicker } from '@/components/ui/date-picker';

import {
  useGetLPOByIdQuery,
  useUpdateLPOMutation,
  useGetCustomersQuery,
  useGetSiteProjectsQuery,
  useGetAvailableFleetsQuery,
} from '../../../stores/api/lposApiSlice';
import {
  LPO,
  UpdateLPORequest,
  Fleet,
  Customer,
  SiteProject,
  FleetHourlyRate,
} from '../types';
import {
  updateLpoSchema,
  LpoFormData,
} from '../schemas/lpoSchema';
import {
  LPO_STATUS_OPTIONS,
} from '../constants';
import {
  calculateTotalHourlyRate,
  calculateEstimatedCost,
  getErrorMessage,
  isLPOEditable,
  getStatusConfig,
} from '../utils';

// Component implementation starts here

interface FleetSelectionProps {
  allFleets: Fleet[];
  selectedFleetIds: string[];
  fleetHourlyRates: FleetHourlyRate[];
  onFleetSelect: (fleetId: string, selected: boolean) => void;
  onHourlyRateChange: (fleetId: string, rate: number) => void;
  disabled?: boolean;
}

const FleetSelection: React.FC<FleetSelectionProps> = ({
  allFleets,
  selectedFleetIds,
  fleetHourlyRates,
  onFleetSelect,
  onHourlyRateChange,
  disabled = false,
}) => {
  const availableFleets = allFleets.filter(fleet => 
    fleet.status === 'Available' || selectedFleetIds.includes(fleet.fleetId)
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {availableFleets.map((fleet) => {
          const isSelected = selectedFleetIds.includes(fleet.fleetId);
          const hourlyRate = fleetHourlyRates.find(r => r.fleetId === fleet.fleetId)?.hourlyRate || 0;
          
          return (
            <Card key={fleet.fleetId} className={`cursor-pointer transition-colors ${
              isSelected ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
            } ${disabled ? 'opacity-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => !disabled && onFleetSelect(fleet.fleetId, e.target.checked)}
                      disabled={disabled}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <div>
                      <h4 className="font-semibold">{fleet.vehicleName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {fleet.plateNumber} • {fleet.fleetType?.typeName}
                      </p>
                      <Badge variant={fleet.status === 'Available' ? 'default' : 'secondary'} className="mt-1">
                        {fleet.status}
                      </Badge>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`rate-${fleet.fleetId}`} className="text-sm">
                        Hourly Rate:
                      </Label>
                      <Input
                        id={`rate-${fleet.fleetId}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={hourlyRate}
                        onChange={(e) => !disabled && onHourlyRateChange(fleet.fleetId, parseFloat(e.target.value) || 0)}
                        disabled={disabled}
                        className="w-24"
                        placeholder="0.00"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {selectedFleetIds.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Hourly Rate:</span>
              <span className="text-lg font-bold">
                ${calculateTotalHourlyRate(fleetHourlyRates).toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const LposEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  
  // Local state
  const [selectedProject, setSelectedProject] = useState<SiteProject | null>(null);
  
  // API hooks
  const {
    data: lpoResponse,
    isLoading: lpoLoading,
    error: lpoError,
  } = useGetLPOByIdQuery(id!, { skip: !id });
  
  const { data: fleetsData, isLoading: fleetsLoading } = useGetAvailableFleetsQuery();
  const { data: customersData, isLoading: customersLoading } = useGetCustomersQuery();
  const { data: projectsData, isLoading: projectsLoading } = useGetSiteProjectsQuery();
  const [updateLPOMutation, { isLoading: isSubmitting }] = useUpdateLPOMutation();
  
  // Extract data from API responses
  const lpo = lpoResponse?.lpo || null;
  const allFleets = fleetsData?.fleets || [];
  const customers = customersData?.customers || [];
  const projects = projectsData?.projects || [];
  
  // Loading and error states
  const isLoading = lpoLoading || fleetsLoading || customersLoading || projectsLoading;
  const error = lpoError ? getErrorMessage(lpoError) : null;

  // Form setup
  const form = useForm<LpoFormData>({
    resolver: zodResolver(updateLpoSchema),
    mode: 'onChange',
  });

  const { control, handleSubmit, watch, setValue, reset, formState: { errors, isValid, isDirty } } = form;
  const watchedValues = watch();

  // Initialize form when LPO data is loaded
  useEffect(() => {
    if (lpo && !isLoading) {
      reset({
        lpoId: lpo.lpoId,
        fleetIds: lpo.fleetIds,
        fleetHourlyRates: lpo.fleetHourlyRates,
        siteProjectId: lpo.siteProjectId,
        purpose: lpo.purpose,
        lpoStartDate: lpo.lpoStartDate,
        lpoEndDate: lpo.lpoEndDate,
        referenceNumber: lpo.referenceNumber,
        status: lpo.status,
        customerId: lpo.customerId,
        designation: lpo.designation,
        address: lpo.address,
        termsAndCondition: lpo.termsAndCondition,
      });
      
      // Set selected project
      if (lpo.siteProject) {
        setSelectedProject(lpo.siteProject);
      }
    }
  }, [lpo, isLoading, reset]);

  // Show error toast when API error occurs
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Handle project selection
  useEffect(() => {
    if (watchedValues.siteProjectId) {
      const project = projects.find(p => p.siteProjectId === watchedValues.siteProjectId);
      setSelectedProject(project || null);
    }
  }, [watchedValues.siteProjectId, projects]);

  // Fleet selection handlers
  const handleFleetSelect = (fleetId: string, selected: boolean) => {
    const currentFleetIds = watchedValues.fleetIds || [];
    const currentRates = watchedValues.fleetHourlyRates || [];
    
    if (selected) {
      // Add fleet
      const newFleetIds = [...currentFleetIds, fleetId];
      const fleet = allFleets.find(f => f.fleetId === fleetId);
      const newRates = [...currentRates, {
        fleetId,
        hourlyRate: fleet?.hourlyRate || 0,
      }];
      
      setValue('fleetIds', newFleetIds, { shouldDirty: true });
      setValue('fleetHourlyRates', newRates, { shouldDirty: true });
    } else {
      // Remove fleet
      const newFleetIds = currentFleetIds.filter(id => id !== fleetId);
      const newRates = currentRates.filter(rate => rate.fleetId !== fleetId);
      
      setValue('fleetIds', newFleetIds, { shouldDirty: true });
      setValue('fleetHourlyRates', newRates, { shouldDirty: true });
    }
  };

  const handleHourlyRateChange = (fleetId: string, rate: number) => {
    const currentRates = watchedValues.fleetHourlyRates || [];
    const newRates = currentRates.map(r => 
      r.fleetId === fleetId ? { ...r, hourlyRate: rate } : r
    );
    setValue('fleetHourlyRates', newRates, { shouldDirty: true });
  };

  // Form submission
  const onSubmit = async (data: LpoFormData) => {
    if (!lpo) return;
    
    try {
      await updateLPOMutation(data as UpdateLPORequest).unwrap();
      toast.success('LPO updated successfully');
      navigate(`/${user?.Role?.roleName || 'admin'}/lpos/${lpo.lpoId}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading LPO data...</span>
      </div>
    );
  }

  if (error || !lpo) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(`/${user?.Role?.roleName || 'admin'}/lpos`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to LPOs
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'LPO not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const statusConfig = getStatusConfig(lpo.status);
  const isEditable = isLPOEditable(lpo.status);
  const totalHourlyRate = calculateTotalHourlyRate(watchedValues.fleetHourlyRates || []);
  const estimatedCost = watchedValues.lpoStartDate && watchedValues.lpoEndDate 
    ? calculateEstimatedCost(watchedValues.fleetHourlyRates || [], watchedValues.lpoStartDate, watchedValues.lpoEndDate)
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(`/${user?.Role?.roleName || 'admin'}/lpos/${lpo.lpoId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to LPO
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit LPO</h1>
            <p className="text-muted-foreground">
              {lpo.lpoNumber} • Status: <Badge className={`${statusConfig.bgColor} ${statusConfig.color}`}>
                {statusConfig.label}
              </Badge>
            </p>
          </div>
        </div>
        
        <Button variant="outline" onClick={() => navigate(`/${user?.Role?.roleName || 'admin'}/lpos/${lpo.lpoId}`)}>
          <Eye className="h-4 w-4 mr-2" />
          View LPO
        </Button>
      </div>

      {/* Editability Warning */}
      {!isEditable && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This LPO cannot be edited because its status is "{lpo.status}". Only LPOs with "Pending" or "Rejected" status can be modified.
          </AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Fleet Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Truck className="h-5 w-5" />
                <span>Fleet Information</span>
              </CardTitle>
              <CardDescription>
                Select fleets and set their hourly rates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-semibold">Select Fleets</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose the fleets for this LPO and set their hourly rates
                </p>
                
                {allFleets.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No fleets available for selection.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <FleetSelection
                    allFleets={allFleets}
                    selectedFleetIds={watchedValues.fleetIds || []}
                    fleetHourlyRates={watchedValues.fleetHourlyRates || []}
                    onFleetSelect={handleFleetSelect}
                    onHourlyRateChange={handleHourlyRateChange}
                    disabled={!isEditable}
                  />
                )}
              </div>
              
              {errors.fleetIds && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.fleetIds.message}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* LPO Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ClipboardList className="h-5 w-5" />
                <span>LPO Details</span>
              </CardTitle>
              <CardDescription>
                Project, dates, and reference information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={control}
                  name="siteProjectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={!isEditable}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.siteProjectId} value={project.siteProjectId}>
                              {project.projectName} - {project.mainClient}
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
                  name="referenceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference Number *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter reference number" 
                          disabled={!isEditable}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="lpoStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date *</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                          disabled={!isEditable}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="lpoEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date *</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                          disabled={!isEditable}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={!isEditable}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LPO_STATUS_OPTIONS.map((option) => (
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

                <div className="md:col-span-2">
                  <FormField
                    control={control}
                    name="purpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purpose *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the purpose of this LPO"
                            className="min-h-[100px]"
                            disabled={!isEditable}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Project Details */}
                {selectedProject && (
                  <div className="md:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Project Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Project Name</Label>
                            <p className="text-sm text-muted-foreground">{selectedProject.projectName}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Main Client</Label>
                            <p className="text-sm text-muted-foreground">{selectedProject.mainClient}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Location</Label>
                            <p className="text-sm text-muted-foreground">{selectedProject.location}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Status</Label>
                            <Badge variant="outline">{selectedProject.status}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Customer Information</span>
              </CardTitle>
              <CardDescription>
                Customer details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={!isEditable}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.customerId} value={customer.customerId}>
                              {customer.firstname} {customer.lastname} - {customer.email}
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
                  name="designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designation *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter designation" 
                          disabled={!isEditable}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2">
                  <FormField
                    control={control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter customer address"
                            className="min-h-[100px]"
                            disabled={!isEditable}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms & Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Terms & Conditions</span>
              </CardTitle>
              <CardDescription>
                Agreement terms and conditions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={control}
                name="termsAndCondition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terms and Conditions *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter terms and conditions for this LPO"
                        className="min-h-[200px]"
                        disabled={!isEditable}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Specify the terms and conditions that apply to this LPO
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>LPO Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Selected Fleets</Label>
                      <p className="text-sm text-muted-foreground">
                        {watchedValues.fleetIds?.length || 0} fleet(s) selected
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Total Hourly Rate</Label>
                      <p className="text-sm text-muted-foreground">
                        ${totalHourlyRate.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Duration</Label>
                      <p className="text-sm text-muted-foreground">
                        {watchedValues.lpoStartDate && watchedValues.lpoEndDate
                          ? `${new Date(watchedValues.lpoStartDate).toLocaleDateString()} - ${new Date(watchedValues.lpoEndDate).toLocaleDateString()}`
                          : 'Not specified'
                        }
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Estimated Cost (8hrs/day)</Label>
                      <p className="text-sm text-muted-foreground">
                        ${estimatedCost.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/${user?.Role?.roleName || 'admin'}/lpos/${lpo.lpoId}`)}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={!isEditable || !isValid || !isDirty || isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Update LPO
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default LposEdit;
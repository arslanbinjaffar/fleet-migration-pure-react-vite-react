import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '../../../stores/slices/authSlice';
import useRoleNavigation from '../../../utils/useNavigation';
import { NavigationPaths } from '../../../utils/navigationPaths';
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
  UpdateLpoData,
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
  const [selectAll, setSelectAll] = useState(false);
  
  // Include both available fleets AND already selected fleets (like legacy implementation)
  // This ensures selected fleets remain visible even if their status changed
  const availableFleets = allFleets.filter(fleet => 
    fleet.status === 'Available' || selectedFleetIds.includes(fleet.fleetId)
  );
  
  console.log('Fleet selection data:', {
    allFleets: allFleets.length,
    selectedFleetIds,
    availableFleets: availableFleets.length,
    fleetHourlyRates
  });
  
  // Handle select all functionality
  const handleSelectAll = (checked: boolean) => {
    if (disabled) return;
    setSelectAll(checked);
    availableFleets.forEach(fleet => {
      const isCurrentlySelected = selectedFleetIds.includes(fleet.fleetId);
      if (checked && !isCurrentlySelected) {
        onFleetSelect(fleet.fleetId, true);
      } else if (!checked && isCurrentlySelected) {
        onFleetSelect(fleet.fleetId, false);
      }
    });
  };
  
  // Update select all state when individual selections change
  useEffect(() => {
    const allSelected = availableFleets.length > 0 && availableFleets.every(fleet => selectedFleetIds.includes(fleet.fleetId));
    setSelectAll(allSelected);
  }, [selectedFleetIds, availableFleets]);

  return (
    <div className="space-y-4">
      {/* Select All Option */}
      {availableFleets.length > 0 && (
        <Card className={`border-dashed ${disabled ? 'opacity-50' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  disabled={disabled}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <div>
                  <h4 className="font-semibold">Select All Available Fleets</h4>
                  <p className="text-sm text-muted-foreground">
                    {availableFleets.length} available fleet{availableFleets.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <Badge variant="outline">
                {selectedFleetIds.length} / {availableFleets.length} selected
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Individual Fleet Selection */}
      <div className="grid gap-4">
        {availableFleets.map((fleet) => {
          const isSelected = selectedFleetIds.includes(fleet.fleetId);
          const hourlyRate = fleetHourlyRates.find(r => r.fleetId === fleet.fleetId)?.hourlyRate || fleet.hourlyRate || 0;
          
          return (
            <Card key={fleet.fleetId} className={`cursor-pointer transition-all duration-200 ${
              isSelected ? 'ring-2 ring-primary shadow-md' : 'hover:bg-muted/50 hover:shadow-sm'
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
                    <div className="flex-1">
                      <h4 className="font-semibold">{fleet.vehicleName}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{fleet.plateNumber}</span>
                        <span>•</span>
                        <span>{fleet.fleetType?.typeName || 'Unknown Type'}</span>
                        <span>•</span>
                        <Badge variant={fleet.status === 'Available' ? 'default' : 'secondary'} className="text-xs">
                          {fleet.status}
                        </Badge>
                      </div>
                      {fleet.vehicleModel && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {fleet.vehicleModel} • {fleet.color || 'Unknown Color'}
                        </p>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`rate-${fleet.fleetId}`} className="text-sm whitespace-nowrap">
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
                          className="w-28"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Default: ${fleet.hourlyRate?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Summary Card */}
      {selectedFleetIds.length > 0 && (
        <Card className={`bg-primary/5 border-primary/20 ${disabled ? 'opacity-50' : ''}`}>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{selectedFleetIds.length}</div>
                <div className="text-sm text-muted-foreground">Fleet{selectedFleetIds.length !== 1 ? 's' : ''} Selected</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  ${calculateTotalHourlyRate(fleetHourlyRates).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Total Hourly Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  ${(calculateTotalHourlyRate(fleetHourlyRates) * 8).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Daily Rate (8hrs)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  ${(calculateTotalHourlyRate(fleetHourlyRates) * 8 * 30).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Monthly Rate (30 days)</div>
              </div>
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
  const { roleNavigate } = useRoleNavigation();
  
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
  
  // Loading and error states - ensure all data is loaded before proceeding
  const isLoading = lpoLoading || fleetsLoading || customersLoading || projectsLoading;
  const error = lpoError ? getErrorMessage(lpoError) : null;
  
  // Check if all required data is available for form initialization
  // Fixed: Don't require arrays to have content, just that they exist (API calls completed)
  const isDataReady = !isLoading && lpo && fleetsData && customersData && projectsData;

  // Form setup
  const form = useForm<UpdateLpoData>({
    resolver: zodResolver(updateLpoSchema),
    mode: 'onChange',
  });

  const { control, handleSubmit, watch, setValue, reset, formState: { errors, isValid, isDirty } } = form;
  const watchedValues = watch();

  // Initialize form when LPO data is loaded - simplified like legacy pattern
  useEffect(() => {
    if (lpo && !isLoading) {
      // Extract fleet data from siteProjectFleets if available
      const fleetIds = lpoResponse?.siteProjectFleets?.map(item => item.fleetId) || [];
      const fleetHourlyRates = lpoResponse?.siteProjectFleets?.map(item => ({
        fleetId: item.fleetId,
        hourlyRate: item.fleet?.hourlyRate || 0,
      })) || [];
      
      // Ensure fleet data is properly structured like in legacy implementation
      const formData = {
        lpoId: lpo.lpoId,
        fleetIds,
        fleetHourlyRates,
        siteProjectId: lpo.siteProjectId || '',
        purpose: lpo.purpose || '',
        lpoStartDate: lpo.lpoStartDate || '',
        lpoEndDate: lpo.lpoEndDate || '',
        referenceNumber: lpo.referenceNumber || '',
        status: lpo.status || 'Pending',
        customerId: lpo.customerId || '',
        designation: lpo.designation || '',
        address: lpo.address || '',
        termsAndCondition: lpo.termsAndCondition || '',
      };
      
      console.log('Initializing form with LPO data:', formData);
      reset(formData);
      
      // Set selected project after form reset
      if (lpo.siteProject) {
        setSelectedProject(lpo.siteProject);
      } else if (lpo.siteProjectId && projects.length > 0) {
        // Find project from projects list if not included in LPO response
        const project = projects.find((p: SiteProject) => p.siteProjectId === lpo.siteProjectId);
        setSelectedProject(project || null);
      }
    }
  }, [lpo, lpoResponse, isLoading, projects, reset]);

  // Show error toast when API error occurs
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Handle project selection - ensure projects are loaded
  useEffect(() => {
    if (watchedValues.siteProjectId && projects.length > 0) {
      const project = projects.find((p: SiteProject) => p.siteProjectId === watchedValues.siteProjectId);
      setSelectedProject(project || null);
      console.log('Selected project updated:', project);
    } else if (!watchedValues.siteProjectId) {
      setSelectedProject(null);
    }
  }, [watchedValues.siteProjectId, projects]);

  // Fleet selection handlers - enhanced with proper data handling like legacy
  const handleFleetSelect = (fleetId: string, selected: boolean) => {
    const currentFleetIds = watchedValues.fleetIds || [];
    const currentRates = watchedValues.fleetHourlyRates || [];
    
    console.log('Fleet selection change:', { fleetId, selected, currentFleetIds, currentRates });
    
    if (selected) {
      // Add fleet - check if already exists to prevent duplicates
      if (!currentFleetIds.includes(fleetId)) {
        const newFleetIds = [...currentFleetIds, fleetId];
        const fleet = allFleets.find(f => f.fleetId === fleetId);
        
        // Check if rate already exists (for edit mode)
        const existingRate = currentRates.find(r => r.fleetId === fleetId);
        const newRates = existingRate 
          ? currentRates 
          : [...currentRates, {
              fleetId,
              hourlyRate: fleet?.hourlyRate || 0,
            }];
        
        setValue('fleetIds', newFleetIds, { shouldDirty: true });
        setValue('fleetHourlyRates', newRates, { shouldDirty: true });
      }
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
  const onSubmit = async (data: UpdateLpoData) => {
    if (!lpo) return;
    
    try {
      await updateLPOMutation(data as UpdateLPORequest).unwrap();
      toast.success('LPO updated successfully');
      roleNavigate(NavigationPaths.LPO.VIEW(lpo.lpoId));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // Show loading until ALL required data is available (following legacy pattern)
  if (isLoading || !lpo) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading LPO data...</span>
        <div className="ml-4 text-sm text-muted-foreground">
          {lpoLoading && 'Loading LPO...'}
          {fleetsLoading && 'Loading fleets...'}
          {customersLoading && 'Loading customers...'}
          {projectsLoading && 'Loading projects...'}
        </div>
      </div>
    );
  }

  if (error || !lpo) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => roleNavigate(NavigationPaths.LPO.LIST)}>
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
    <div className="w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => roleNavigate(NavigationPaths.LPO.VIEW(lpo.lpoId))}>
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
        
        <Button variant="outline" onClick={() => roleNavigate(NavigationPaths.LPO.VIEW(lpo.lpoId))}>
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
                
                <FleetSelection
                  allFleets={allFleets}
                  selectedFleetIds={watchedValues.fleetIds || []}
                  fleetHourlyRates={watchedValues.fleetHourlyRates || []}
                  onFleetSelect={handleFleetSelect}
                  onHourlyRateChange={handleHourlyRateChange}
                  disabled={!isEditable}
                />
                {allFleets.length === 0 && (
                   <Alert>
                     <AlertCircle className="h-4 w-4" />
                     <AlertDescription>
                       No fleets available for selection.
                     </AlertDescription>
                   </Alert>
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
                          {projects.length > 0 ? (
                            projects.map((project: SiteProject) => (
                              <SelectItem key={project.siteProjectId} value={project.siteProjectId}>
                                {project.projectName}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-projects" disabled>
                              No projects available
                            </SelectItem>
                          )}
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
                            <Label className="text-sm font-medium">Project Owner</Label>
                            <p className="text-sm text-muted-foreground">{selectedProject.projectOwner || 'N/A'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Main Contractor</Label>
                            <p className="text-sm text-muted-foreground">{selectedProject.mainContractor || 'N/A'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Type</Label>
                            <p className="text-sm text-muted-foreground">{selectedProject.typeOfProject || 'N/A'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Zone</Label>
                            <p className="text-sm text-muted-foreground">{selectedProject.zone || 'N/A'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Start Date</Label>
                            <p className="text-sm text-muted-foreground">
                              {selectedProject.startDate ? new Date(selectedProject.startDate).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Expiry Date</Label>
                            <p className="text-sm text-muted-foreground">
                              {selectedProject.expiryDate ? new Date(selectedProject.expiryDate).toLocaleDateString() : 'N/A'}
                            </p>
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
                          {customers.length > 0 ? (
                            customers.map((customer) => (
                              <SelectItem key={customer.customerId} value={customer.customerId}>
                                {customer.firstname} {customer.lastname} - {customer.email}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-customers" disabled>
                              No customers available
                            </SelectItem>
                          )}
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
              onClick={() => roleNavigate(NavigationPaths.LPO.VIEW(lpo.lpoId))}
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
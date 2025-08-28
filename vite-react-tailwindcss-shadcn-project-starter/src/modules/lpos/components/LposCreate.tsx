import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../stores/slices/authSlice';
import useRoleNavigation from '../../../utils/useNavigation';
import { NavigationPaths } from '../../../utils/navigationPaths';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Loader2,
  Truck,
  ClipboardList,
  User,
  FileText,
  Calendar,
  Building,
  DollarSign,
  AlertCircle,
  Check,
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
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { DatePicker } from '@/components/ui/date-picker';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

import {
  useCreateLPOMutation,
  useGetCustomersQuery,
  useGetSiteProjectsQuery,
  useGetAvailableFleetsQuery,
} from '../../../stores/api/lposApiSlice';
import {
  setFormData,
  clearFormData,
} from '../../../stores/slices/lposSlice';
import {
  CreateLPORequest,
  Fleet,
  Customer,
  SiteProject,
  FleetHourlyRate,
} from '../types';
import {
  lpoSchema,
  LpoFormData,
  lpoFormSections,
} from '../schemas/lpoSchema';
import {
  LPO_FORM_STEPS,
  LPO_STATUS_OPTIONS,
  DEFAULT_LPO_VALUES,
} from '../constants';
import {
  generateLPONumber,
  calculateTotalHourlyRate,
  calculateEstimatedCost,
  getErrorMessage,
} from '../utils';

// Component implementation starts here

interface FleetSelectionProps {
  fleets: Fleet[];
  selectedFleetIds: string[];
  fleetHourlyRates: FleetHourlyRate[];
  onFleetSelect: (fleetId: string, selected: boolean) => void;
  onHourlyRateChange: (fleetId: string, rate: number) => void;
}

const FleetSelection: React.FC<FleetSelectionProps> = ({
  fleets,
  selectedFleetIds,
  fleetHourlyRates,
  onFleetSelect,
  onHourlyRateChange,
}) => {
  const [selectAll, setSelectAll] = useState(false);
  
  // Handle select all functionality
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    fleets.forEach(fleet => {
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
    const allSelected = fleets.length > 0 && fleets.every(fleet => selectedFleetIds.includes(fleet.fleetId));
    setSelectAll(allSelected);
  }, [selectedFleetIds, fleets]);
  
  return (
    <div className="space-y-4">
      {/* Select All Option */}
      {fleets.length > 0 && (
        <Card className="border-dashed">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <div>
                  <h4 className="font-semibold">Select All Fleets</h4>
                  <p className="text-sm text-muted-foreground">
                    {fleets.length} available fleet{fleets.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <Badge variant="outline">
                {selectedFleetIds.length} / {fleets.length} selected
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Individual Fleet Selection */}
      <div className="grid gap-4">
        {fleets.map((fleet) => {
          const isSelected = selectedFleetIds.includes(fleet.fleetId);
          const hourlyRate = fleetHourlyRates.find(r => r.fleetId === fleet.fleetId)?.hourlyRate || fleet.hourlyRate || 0;
          
          return (
            <Card key={fleet.fleetId} className={`cursor-pointer transition-all duration-200 ${
              isSelected ? 'ring-2 ring-primary shadow-md' : 'hover:bg-muted/50 hover:shadow-sm'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => onFleetSelect(fleet.fleetId, e.target.checked)}
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
                          onChange={(e) => onHourlyRateChange(fleet.fleetId, parseFloat(e.target.value) || 0)}
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
        <Card className="bg-primary/5 border-primary/20">
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

const LposCreate: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const { roleNavigate } = useRoleNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedProject, setSelectedProject] = useState<SiteProject | null>(null);
  
  // API hooks
  const { data: fleetsData, isLoading: fleetsLoading } = useGetAvailableFleetsQuery();
  const { data: customersData, isLoading: customersLoading } = useGetCustomersQuery();
  const { data: projectsData, isLoading: projectsLoading } = useGetSiteProjectsQuery();
  const [createLPOMutation, { isLoading: isSubmitting }] = useCreateLPOMutation();
  
  // Extract data from API responses
  const fleets = fleetsData?.fleets || [];
  const customers = customersData?.customers || [];
  const projects = projectsData?.siteProjects || [];
  
  // Loading state
  const isLoading = fleetsLoading || customersLoading || projectsLoading;

  // Form setup
  const form = useForm<LpoFormData>({
    resolver: zodResolver(lpoSchema),
    defaultValues: {
      ...DEFAULT_LPO_VALUES,
      referenceNumber: generateLPONumber(),
    },
    mode: 'onChange',
  });

  const { control, handleSubmit, watch, setValue, formState: { errors, isValid } } = form;
  const watchedValues = watch();

  // Clear form data on component mount and unmount
  useEffect(() => {
    dispatch(clearFormData());
    return () => {
      dispatch(clearFormData());
    };
  }, [dispatch]);

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
      const fleet = fleets.find(f => f.fleetId === fleetId);
      const newRates = [...currentRates, {
        fleetId,
        hourlyRate: fleet?.hourlyRate || 0,
      }];
      
      setValue('fleetIds', newFleetIds);
      setValue('fleetHourlyRates', newRates);
    } else {
      // Remove fleet
      const newFleetIds = currentFleetIds.filter(id => id !== fleetId);
      const newRates = currentRates.filter(rate => rate.fleetId !== fleetId);
      
      setValue('fleetIds', newFleetIds);
      setValue('fleetHourlyRates', newRates);
    }
  };

  const handleHourlyRateChange = (fleetId: string, rate: number) => {
    const currentRates = watchedValues.fleetHourlyRates || [];
    const newRates = currentRates.map(r => 
      r.fleetId === fleetId ? { ...r, hourlyRate: rate } : r
    );
    setValue('fleetHourlyRates', newRates);
  };

  // Step navigation
  const nextStep = () => {
    if (currentStep < LPO_FORM_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Form submission
  const onSubmit = async (data: LpoFormData) => {
    try {
      await createLPOMutation(data as CreateLPORequest).unwrap();
      toast.success('LPO created successfully');
      dispatch(clearFormData());
      roleNavigate(NavigationPaths.LPO.LIST);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // Calculate progress
  const progress = ((currentStep + 1) / LPO_FORM_STEPS.length) * 100;

  // Get current step validation
  const getCurrentStepErrors = () => {
    const currentStepId = LPO_FORM_STEPS[currentStep].id;
    const sectionKey = Object.keys(lpoFormSections).find(key => 
      key.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === currentStepId
    );
    
    if (!sectionKey) return [];
    
    const section = lpoFormSections[sectionKey as keyof typeof lpoFormSections];
    return section.fields.filter(field => errors[field as keyof typeof errors]);
  };

  const currentStepErrors = getCurrentStepErrors();
  const canProceed = currentStepErrors.length === 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading form data...</span>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => roleNavigate(NavigationPaths.LPO.LIST)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to LPOs
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create LPO</h1>
            <p className="text-muted-foreground">
              Create a new Local Purchase Order
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {LPO_FORM_STEPS.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            
            {/* Step indicators */}
            <div className="flex items-center justify-between">
              {LPO_FORM_STEPS.map((step, index) => {
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                const hasErrors = index === currentStep && currentStepErrors.length > 0;
                
                return (
                  <div key={step.id} className="flex flex-col items-center space-y-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isCurrent 
                          ? hasErrors 
                            ? 'bg-red-500 text-white'
                            : 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      {isCompleted ? (
                        <Check className="h-4 w-4" />
                      ) : hasErrors ? (
                        <AlertCircle className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-medium">{step.title}</div>
                      <div className="text-xs text-muted-foreground">{step.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {currentStep === 0 && <Truck className="h-5 w-5" />}
                {currentStep === 1 && <ClipboardList className="h-5 w-5" />}
                {currentStep === 2 && <User className="h-5 w-5" />}
                {currentStep === 3 && <FileText className="h-5 w-5" />}
                <span>{LPO_FORM_STEPS[currentStep].title}</span>
              </CardTitle>
              <CardDescription>
                {LPO_FORM_STEPS[currentStep].description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Fleet Information */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold">Select Fleets</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Choose the fleets for this LPO and set their hourly rates
                    </p>
                    
                    {fleets.length === 0 ? (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          No available fleets found. Please ensure fleets are marked as "Available".
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <FleetSelection
                        fleets={fleets}
                        selectedFleetIds={watchedValues.fleetIds || []}
                        fleetHourlyRates={watchedValues.fleetHourlyRates || []}
                        onFleetSelect={handleFleetSelect}
                        onHourlyRateChange={handleHourlyRateChange}
                      />
                    )}
                  </div>
                  
                  {errors.fleetIds && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.fleetIds.message}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Step 2: LPO Details */}
              {currentStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={control}
                    name="siteProjectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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
                          <Input placeholder="Enter reference number" {...field} />
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
                        <Select onValueChange={field.onChange} value={field.value}>
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
                              <Label className="text-sm font-medium">Main Contractor</Label>
                              <p className="text-sm text-muted-foreground">{selectedProject.mainContractor}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Location</Label>
                              <p className="text-sm text-muted-foreground">{selectedProject.zonalSite}</p>
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
              )}

              {/* Step 3: Customer Information */}
              {currentStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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
                          <Input placeholder="Enter designation" {...field} />
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
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Terms & Conditions */}
              {currentStep === 3 && (
                <div className="space-y-6">
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
                            ${calculateTotalHourlyRate(watchedValues.fleetHourlyRates || []).toFixed(2)}
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
                            {watchedValues.lpoStartDate && watchedValues.lpoEndDate
                              ? `$${calculateEstimatedCost(
                                  watchedValues.fleetHourlyRates || [],
                                  watchedValues.lpoStartDate,
                                  watchedValues.lpoEndDate
                                ).toFixed(2)}`
                              : 'Not calculated'
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-2">
              {currentStep < LPO_FORM_STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceed}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  Create LPO
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default LposCreate;
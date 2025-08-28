import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useRoleBasedNavigation } from '../../../utils/roleBasedNavigation';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Save,
  Loader2,
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Globe,
  FileText,
  CheckCircle,
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
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

import {
  useGetCustomerByIdQuery,
  useUpdateCustomerMutation,
} from '../../../stores/api/customerApiSlice';
import { selectCurrentUser } from '../../../stores/slices/authSlice';
import {
  customerSchema,
  CustomerFormData,
} from '../schemas/customerSchema';
import {
  CUSTOMER_FORM_STEPS,
  CUSTOMER_PREFIX_OPTIONS,
  COUNTRIES,
  UAE_EMIRATES,
} from '../constants';
import {
  getErrorMessage,
  getCustomerFullName,
} from '../utils';

const CustomerEdit: React.FC = () => {
  const navigate = useRoleBasedNavigation();
  const { customerId } = useParams<{ customerId: string }>();
  const user = useSelector(selectCurrentUser);
  const [currentStep, setCurrentStep] = useState(0);
  
  // API hooks
  const {
    data: customerResponse,
    isLoading: customerLoading,
    error: customerError,
  } = useGetCustomerByIdQuery(customerId!, { skip: !customerId });
  
  const [updateCustomer, { isLoading: isSubmitting }] = useUpdateCustomerMutation();
  
  // Extract customer data
  const customer = customerResponse?.customers;
  
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      firstname: '',
      lastname: '',
      prefixName: 'Mr',
      prefix: 'Mr',
      organization: '',
      title: '',
      email: '',
      phone: '',
      TRN: '',
      city: '',
      stateOrProvince: '',
      area: '',
      mailingAddress: '',
      country: '',
      webSite: '',
      postalCode: '',
    },
  });
  
  const { control, handleSubmit, watch, trigger, reset, formState: { errors, isValid } } = form;
  const watchedValues = watch();
  
  // Initialize form when customer data is loaded
  useEffect(() => {
    if (customer && !customerLoading) {
      reset({
        firstname: customer.firstname || '',
        lastname: customer.lastname || '',
        prefixName: customer.prefixName || customer.prefix || 'Mr',
        prefix: customer.prefix || customer.prefixName || 'Mr',
        organization: customer.organization || '',
        title: customer.title || '',
        email: customer.email || '',
        phone: customer.phone || '',
        TRN: customer.TRN || '',
        city: customer.city || '',
        stateOrProvince: customer.stateOrProvince || '',
        area: customer.area || '',
        mailingAddress: customer.mailingAddress || '',
        country: customer.country || '',
        webSite: customer.webSite || '',
        postalCode: customer.postalCode || '',
      });
    }
  }, [customer, customerLoading, reset]);
  
  // Show error toast when API error occurs
  useEffect(() => {
    if (customerError) {
      toast.error(getErrorMessage(customerError));
    }
  }, [customerError]);
  
  const handleBack = () => {
    const role = user?.Role?.roleName?.toLowerCase() || 'admin';
    navigate('/customer');
  };
  
  const onSubmit = async (data: CustomerFormData) => {
    if (!customerId) return;
    
    try {
      const result = await updateCustomer({
        customerId,
        ...data,
      }).unwrap();
      toast.success(result.message || 'Customer updated successfully');
      navigate(`/${user?.Role?.roleName?.toLowerCase() || 'admin'}/customer/view/${customerId}`);
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(getErrorMessage(error));
    }
  };
  
  const nextStep = async () => {
    const currentStepFields = CUSTOMER_FORM_STEPS[currentStep].fields;
    const isStepValid = await trigger(currentStepFields as any);
    
    if (isStepValid) {
      setCurrentStep(prev => Math.min(CUSTOMER_FORM_STEPS.length - 1, prev + 1));
    }
  };
  
  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };
  
  const progressPercentage = ((currentStep + 1) / CUSTOMER_FORM_STEPS.length) * 100;
  const currentStepData = CUSTOMER_FORM_STEPS[currentStep];
  
  if (customerLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading customer data...</span>
      </div>
    );
  }
  
  if (customerError || !customer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            {getErrorMessage(customerError) || 'Customer not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={handleBack} variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <User className="h-8 w-8 mr-3 text-primary" />
              Edit Customer
            </h1>
            <p className="text-muted-foreground mt-1">
              Update {getCustomerFullName(customer)}'s information
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/${user?.Role?.roleName?.toLowerCase() || 'admin'}/customer/view/${customerId}`)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Customer
          </Button>
        </div>
      </div>
      
      {/* Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-lg">
              Step {currentStep + 1} of {CUSTOMER_FORM_STEPS.length}: {currentStepData.title}
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <Progress value={progressPercentage} className="w-full" />
          <CardDescription className="mt-2">
            {currentStepData.description}
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Step 0: Personal Information */}
          {currentStep === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Basic customer details and identification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={control}
                    name="prefixName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prefix</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select prefix" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CUSTOMER_PREFIX_OPTIONS.map((option) => (
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
                    name="firstname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={control}
                    name="lastname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={control}
                    name="organization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Building className="h-4 w-4 mr-2" />
                          Organization
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter organization name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter job title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Step 1: Contact Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  Email, phone, and business details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          Email Address *
                        </FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={control}
                  name="TRN"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        TRN Number
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter TRN number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Tax Registration Number (if applicable)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}
          
          {/* Step 2: Address Information */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Address Information
                </CardTitle>
                <CardDescription>
                  Location and address details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {COUNTRIES.map((country) => (
                              <SelectItem key={country.value} value={country.label}>
                                {country.label}
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
                    name="stateOrProvince"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province</FormLabel>
                        {watchedValues.country === 'United Arab Emirates' ? (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select emirate" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {UAE_EMIRATES.map((emirate) => (
                                <SelectItem key={emirate.value} value={emirate.value}>
                                  {emirate.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <FormControl>
                            <Input placeholder="Enter state or province" {...field} />
                          </FormControl>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Area</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter area" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter postal code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={control}
                  name="mailingAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mailing Address</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter complete mailing address"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name="webSite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Globe className="h-4 w-4 mr-2" />
                        Website
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}
          
          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={currentStep === 0 ? handleBack : prevStep}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep === 0 ? 'Cancel' : 'Previous'}
            </Button>
            
            {currentStep < CUSTOMER_FORM_STEPS.length - 1 ? (
              <Button type="button" onClick={nextStep}>
                Next
                <CheckCircle className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Customer
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CustomerEdit;
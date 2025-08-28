import React from 'react';
import { useParams } from 'react-router-dom';
import { useRoleBasedNavigation } from '../../../utils/roleBasedNavigation';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
  Edit,
  Loader2,
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Globe,
  FileText,
  Calendar,
  Shield,
  Activity,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useGetCustomerByIdQuery } from '../../../stores/api/customerApiSlice';
import { selectCurrentUser } from '../../../stores/slices/authSlice';
import {
  formatDate,
  getStatusConfig,
  getCustomerFullName,
  getCustomerDisplayName,
  getErrorMessage,
} from '../utils';
import {
  EditButton,
  ViewButton,
  PermissionModule,
  useModulePermissions,
} from '../../../components/permissions';
import { PERMISSIONS } from '../constants';

const CustomerView: React.FC = () => {
  const navigate = useRoleBasedNavigation();
  const { customerId } = useParams<{ customerId: string }>();
  const user = useSelector(selectCurrentUser);
  
  // API hooks
  const {
    data: customerResponse,
    isLoading,
    error: customerError,
  } = useGetCustomerByIdQuery(customerId!, { skip: !customerId });
  
  // Extract customer data
  const customer = customerResponse?.customers;
  // Permission checks using new system
  const customerPermissions = useModulePermissions(PermissionModule.Customers);
  
  const handleBack = () => {
    const role = user?.Role?.roleName?.toLowerCase() || 'admin';
    navigate('/customer');
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading customer details...</span>
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
  
  const statusConfig = getStatusConfig(customer.status);
  
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
              {getCustomerFullName(customer)}
            </h1>
            <p className="text-muted-foreground mt-1">
              Customer Details and Information
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ViewButton 
            module={PermissionModule.Customers}
            action="ledger"
            variant="outline"
            onClick={() => navigate(`/${user?.Role?.roleName?.toLowerCase() || 'admin'}/customer/ledger/${customerId}`)}
          >
            <FileText className="h-4 w-4 mr-2" />
            View Ledger
          </ViewButton>
          <EditButton 
            module={PermissionModule.Customers}
            onClick={() => navigate(`/${user?.Role?.roleName?.toLowerCase() || 'admin'}/customer/edit/${customerId}`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Customer
          </EditButton>
        </div>
      </div>
      
      {/* Status and Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{getCustomerDisplayName(customer)}</CardTitle>
              <CardDescription className="mt-1">
                Customer ID: {customer.customerId}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={`${statusConfig.bgColor} ${statusConfig.color}`}>
                <Activity className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Prefix</Label>
                <p className="text-sm">{customer.prefixName || customer.prefix || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">First Name</Label>
                <p className="text-sm font-medium">{customer.firstname}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Last Name</Label>
                <p className="text-sm font-medium">{customer.lastname}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Job Title</Label>
                <p className="text-sm">{customer.title || 'N/A'}</p>
              </div>
            </div>
            
            {customer.organization && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground flex items-center">
                  <Building className="h-3 w-3 mr-1" />
                  Organization
                </Label>
                <p className="text-sm font-medium">{customer.organization}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground flex items-center">
                <Mail className="h-3 w-3 mr-1" />
                Email Address
              </Label>
              <p className="text-sm font-medium">
                <a href={`mailto:${customer.email}`} className="text-primary hover:underline">
                  {customer.email}
                </a>
              </p>
            </div>
            
            {customer.phone && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground flex items-center">
                  <Phone className="h-3 w-3 mr-1" />
                  Phone Number
                </Label>
                <p className="text-sm font-medium">
                  <a href={`tel:${customer.phone}`} className="text-primary hover:underline">
                    {customer.phone}
                  </a>
                </p>
              </div>
            )}
            
            {customer.webSite && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground flex items-center">
                  <Globe className="h-3 w-3 mr-1" />
                  Website
                </Label>
                <p className="text-sm font-medium">
                  <a 
                    href={customer.webSite.startsWith('http') ? customer.webSite : `https://${customer.webSite}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary hover:underline"
                  >
                    {customer.webSite}
                  </a>
                </p>
              </div>
            )}
            
            {customer.TRN && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground flex items-center">
                  <FileText className="h-3 w-3 mr-1" />
                  TRN Number
                </Label>
                <p className="text-sm font-medium">{customer.TRN}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Address Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {customer.country && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Country</Label>
                <p className="text-sm font-medium">{customer.country}</p>
              </div>
            )}
            
            {customer.stateOrProvince && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">State/Province</Label>
                <p className="text-sm font-medium">{customer.stateOrProvince}</p>
              </div>
            )}
            
            {customer.city && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">City</Label>
                <p className="text-sm font-medium">{customer.city}</p>
              </div>
            )}
            
            {customer.area && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Area</Label>
                <p className="text-sm font-medium">{customer.area}</p>
              </div>
            )}
          </div>
          
          {customer.postalCode && (
            <div className="mt-4">
              <Label className="text-sm font-medium text-muted-foreground">Postal Code</Label>
              <p className="text-sm font-medium">{customer.postalCode}</p>
            </div>
          )}
          
          {customer.mailingAddress && (
            <div className="mt-4">
              <Label className="text-sm font-medium text-muted-foreground">Mailing Address</Label>
              <p className="text-sm whitespace-pre-wrap">{customer.mailingAddress}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Created Date
              </Label>
              <p className="text-sm font-medium">{formatDate(customer.createdAt)}</p>
            </div>
            
            {customer.updatedAt && customer.updatedAt !== customer.createdAt && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Last Updated
                </Label>
                <p className="text-sm font-medium">{formatDate(customer.updatedAt)}</p>
              </div>
            )}
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customer.createdBy && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Created By</Label>
                <p className="text-sm">{customer.createdBy}</p>
              </div>
            )}
            
            {customer.updatedBy && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Updated By</Label>
                <p className="text-sm">{customer.updatedBy}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper component for labels
const Label: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <label className={`block ${className}`}>{children}</label>
);

export default CustomerView;
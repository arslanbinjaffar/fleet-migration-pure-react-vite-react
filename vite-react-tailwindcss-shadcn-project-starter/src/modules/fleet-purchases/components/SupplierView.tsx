import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  ArrowLeft,
  Edit,
  FileText,
  CreditCard,
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  DollarSign,
  Package,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

import {
  useGetSupplierByIdQuery,
  useUpdateSupplierMutation,
} from '../../../stores/api/fleetPurchasesApiSlice';
import {
  EditButton,
  ViewButton,
  CreateButton,
  PermissionModule,
} from '../../../components/permissions';
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  getErrorMessage,
} from '../utils';
import type { FleetSupplier } from '../types';

const SupplierView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  // API hooks
  const {
    data: supplier,
    isLoading,
    error,
    refetch,
  } = useGetSupplierByIdQuery(id!, {
    skip: !id,
  });
  
  const [updateSupplier] = useUpdateSupplierMutation();
  
  // Handlers
  const handleBack = () => {
    navigate('/supplier-fleet');
  };
  
  const handleEdit = () => {
    navigate(`/supplier-fleet/edit/${id}`);
  };
  
  const handleViewLedger = () => {
    navigate(`/supplier-fleet/ledger/${id}`);
  };
  
  const handleAddPayment = () => {
    navigate(`/add-payment/supplier/create/fleet?supplierId=${id}`);
  };
  
  const handleToggleStatus = async () => {
    if (!supplier) return;
    
    setIsUpdatingStatus(true);
    try {
      await updateSupplier({
        id: supplier.fleetSupplierId,
        data: { isActive: !supplier.isActive },
      }).unwrap();
      toast.success(`Supplier ${supplier.isActive ? 'deactivated' : 'activated'} successfully`);
      refetch();
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-20" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !supplier) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error ? getErrorMessage(error) : 'Supplier not found'}
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
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <Users className="h-8 w-8 mr-3 text-primary" />
              {supplier.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              TRN: {supplier.TRN} • Created on {formatDateTime(supplier.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={supplier.isActive ? 'destructive' : 'default'}
            onClick={handleToggleStatus}
            disabled={isUpdatingStatus}
          >
            {isUpdatingStatus && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {supplier.isActive ? (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </Button>
          <EditButton
            module={PermissionModule.SupplierFleet}
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </EditButton>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Supplier Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Supplier Information
                </CardTitle>
                <Badge variant={supplier.isActive ? 'default' : 'secondary'}>
                  {supplier.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Company Name:</span>
                  </div>
                  <div className="ml-6">
                    <p className="font-medium">{supplier.name}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">TRN:</span>
                  </div>
                  <div className="ml-6">
                    <p className="font-mono">{supplier.TRN}</p>
                  </div>
                </div>
                
                {supplier.email && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Email:</span>
                    </div>
                    <div className="ml-6">
                      <p>{supplier.email}</p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Phone:</span>
                  </div>
                  <div className="ml-6">
                    <p>{supplier.phone}</p>
                  </div>
                </div>
                
                {supplier.contactPerson && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Contact Person:</span>
                    </div>
                    <div className="ml-6">
                      <p>{supplier.contactPerson}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Address Information */}
          {supplier.address && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{supplier.address}</p>
              </CardContent>
            </Card>
          )}
          
          {/* Additional Details */}
          {supplier.detail && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Additional Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{supplier.detail}</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ViewButton
                module={PermissionModule.SupplierFleet}
                action="ledger"
                onClick={handleViewLedger}
                className="w-full justify-start"
              >
                <FileText className="h-4 w-4 mr-2" />
                View Ledger
              </ViewButton>
              
              <CreateButton
                module={PermissionModule.SupplierFleet}
                onClick={handleAddPayment}
                variant="outline"
                className="w-full justify-start"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Add Payment
              </CreateButton>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/purchase-order-fleet/create?supplierId=' + id)}
              >
                <Package className="h-4 w-4 mr-2" />
                Create Purchase Order
              </Button>
            </CardContent>
          </Card>
          
          {/* Supplier Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Total Purchase Orders:</span>
                <span className="font-medium">0</span> {/* TODO: Calculate from API */}
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Purchase Amount:</span>
                <span className="font-medium">{formatCurrency(0)}</span> {/* TODO: Calculate from API */}
              </div>
              <div className="flex justify-between text-sm">
                <span>Outstanding Balance:</span>
                <span className="font-medium">{formatCurrency(0)}</span> {/* TODO: Calculate from API */}
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span>Last Purchase:</span>
                <span className="text-muted-foreground">N/A</span> {/* TODO: Get from API */}
              </div>
            </CardContent>
          </Card>
          
          {/* Supplier Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Supplier Created</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(supplier.createdAt)}
                  </p>
                </div>
              </div>
              
              {supplier.updatedAt !== supplier.createdAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-muted rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(supplier.updatedAt)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Status Information */}
          <Card>
            <CardHeader>
              <CardTitle>Status Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Account Status:</span>
                <Badge variant={supplier.isActive ? 'default' : 'secondary'}>
                  {supplier.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Can Create Orders:</span>
                <Badge variant={supplier.isActive ? 'default' : 'secondary'}>
                  {supplier.isActive ? 'Yes' : 'No'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Payment Terms:</span>
                <span className="text-sm text-muted-foreground">Standard</span> {/* TODO: Add to supplier model */}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SupplierView;
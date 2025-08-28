import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  Printer,
  StopCircle,
  Calendar,
  Building,
  User,
  Truck,
  FileText,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

import { selectCurrentUser } from '../../../stores/slices/authSlice';
import { LPO, Fleet } from '../types';
import { PERMISSIONS } from '../constants';
import {
  formatDate,
  formatDateTime,
  getStatusConfig,
  getCustomerFullName,
  getProjectDisplayName,
  calculateTotalHourlyRate,
  calculateEstimatedCost,
  getDaysDifference,
  isLPOEditable,
  isLPOStoppable,
  getErrorMessage,
} from '../utils';
import {usePermissionSet } from '../../../utils/role';

// Mock API functions - replace with actual API calls
const fetchLPO = async (lpoId: string): Promise<{ lpo: LPO; fleets: Fleet[] }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Mock data - replace with actual API call
      const mockLPO: LPO = {
        lpoId,
        lpoNumber: 'LPO-2024-001',
        fleetIds: ['fleet-1', 'fleet-2'],
        fleetHourlyRates: [
          { fleetId: 'fleet-1', hourlyRate: 25.00 },
          { fleetId: 'fleet-2', hourlyRate: 30.00 },
        ],
        siteProjectId: 'project-1',
        purpose: 'Transportation services for construction project',
        lpoStartDate: '2024-01-15',
        lpoEndDate: '2024-02-15',
        referenceNumber: 'REF-2024-001',
        status: 'Approved',
        customerId: 'customer-1',
        designation: 'Project Manager',
        address: '123 Construction Site, Dubai, UAE',
        termsAndCondition: 'Standard terms and conditions apply...',
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-12T15:30:00Z',
        customer: {
          customerId: 'customer-1',
          firstname: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          phone: '+971-50-123-4567',
          address: '456 Business District, Dubai, UAE',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        siteProject: {
          siteProjectId: 'project-1',
          projectName: 'Dubai Marina Tower',
          mainClient: 'ABC Construction',
          location: 'Dubai Marina, Dubai, UAE',
          description: 'High-rise residential tower construction',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          status: 'Active',
          createdAt: '2023-12-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      };
      
      const mockFleets: Fleet[] = [
        {
          fleetId: 'fleet-1',
          vehicleName: 'Toyota Hiace',
          plateNumber: 'DXB-12345',
          plateType: 'Private',
          status: 'In Use',
          hourlyRate: 25.00,
          fleetType: {
            fleetTypeId: 'type-1',
            typeName: 'Van',
            description: 'Passenger van',
          },
          createdAt: '2023-12-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          fleetId: 'fleet-2',
          vehicleName: 'Ford Transit',
          plateNumber: 'DXB-67890',
          plateType: 'Commercial',
          status: 'In Use',
          hourlyRate: 30.00,
          fleetType: {
            fleetTypeId: 'type-2',
            typeName: 'Truck',
            description: 'Light truck',
          },
          createdAt: '2023-12-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];
      
      resolve({ lpo: mockLPO, fleets: mockFleets });
    }, 1000);
  });
};

const deleteLPO = async (lpoId: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
};

const stopLPO = async (lpoId: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
};

const LposView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  
  // State
  const [lpo, setLpo] = useState<LPO | null>(null);
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stopDialogOpen, setStopDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  // Load LPO data
  useEffect(() => {
    if (id) {
      loadLPO(id);
    }
  }, [id]);

  const loadLPO = async (lpoId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchLPO(lpoId);
      setLpo(response.lpo);
      setFleets(response.fleets);
    } catch (error) {
      setError(getErrorMessage(error));
      toast.error('Failed to load LPO details');
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers
  const handleDelete = async () => {
    if (!lpo) return;
    
    try {
      setIsDeleting(true);
      await deleteLPO(lpo.lpoId);
      toast.success('LPO deleted successfully');
      navigate('/lpos');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleStop = async () => {
    if (!lpo) return;
    
    try {
      setIsStopping(true);
      await stopLPO(lpo.lpoId);
      setLpo({ ...lpo, status: 'Stopped' });
      toast.success('LPO stopped successfully');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsStopping(false);
      setStopDialogOpen(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Implement export functionality
    toast.success('Export functionality will be implemented');
  };

  // Permission checks
  const canCreate = usePermissionSet(PERMISSIONS.CREATE_LPO);
  const canEdit = usePermissionSet( PERMISSIONS.EDIT_LPO);
  const canDelete = usePermissionSet( PERMISSIONS.DELETE_LPO);
  const canStop = usePermissionSet( PERMISSIONS.STOP_LPO);
  const canExport = usePermissionSet( PERMISSIONS.EXPORT_LPO);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading LPO details...</span>
      </div>
    );
  }

  if (error || !lpo) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/lpos')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to LPOs
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error || 'LPO not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const statusConfig = getStatusConfig(lpo.status);
  const totalHourlyRate = calculateTotalHourlyRate(lpo.fleetHourlyRates);
  const estimatedCost = calculateEstimatedCost(lpo.fleetHourlyRates, lpo.lpoStartDate, lpo.lpoEndDate);
  const duration = getDaysDifference(lpo.lpoStartDate, lpo.lpoEndDate) + 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/lpos')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to LPOs
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{lpo.lpoNumber}</h1>
            <p className="text-muted-foreground">
              Created on {formatDate(lpo.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {canExport && (
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          {canEdit && isLPOEditable(lpo.status) && (
            <Button onClick={() => navigate(`/lpos/${lpo.lpoId}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {canStop && isLPOStoppable(lpo.status) && (
            <Button variant="outline" onClick={() => setStopDialogOpen(true)}>
              <StopCircle className="h-4 w-4 mr-2" />
              Stop
            </Button>
          )}
          {canDelete && (
            <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Status and Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              {lpo.status === 'Approved' && <CheckCircle className="h-5 w-5 text-green-500" />}
              {lpo.status === 'Pending' && <Clock className="h-5 w-5 text-yellow-500" />}
              {lpo.status === 'Rejected' && <XCircle className="h-5 w-5 text-red-500" />}
              {lpo.status === 'Stopped' && <StopCircle className="h-5 w-5 text-gray-500" />}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge className={`${statusConfig.bgColor} ${statusConfig.color}`}>
                  {statusConfig.label}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fleets</p>
                <p className="text-2xl font-bold">{lpo.fleetIds.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Rate/Hour</p>
                <p className="text-2xl font-bold">${totalHourlyRate.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Duration</p>
                <p className="text-2xl font-bold">{duration} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LPO Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>LPO Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">LPO Number</label>
                <p className="font-medium">{lpo.lpoNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Reference Number</label>
                <p className="font-medium">{lpo.referenceNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                <p className="font-medium">{formatDate(lpo.lpoStartDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">End Date</label>
                <p className="font-medium">{formatDate(lpo.lpoEndDate)}</p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Purpose</label>
              <p className="mt-1">{lpo.purpose}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Estimated Cost (8hrs/day)</label>
              <p className="text-lg font-bold text-green-600">${estimatedCost.toFixed(2)}</p>
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
          </CardHeader>
          <CardContent className="space-y-4">
            {lpo.customer && (
              <>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Customer Name</label>
                  <p className="font-medium">{getCustomerFullName(lpo.customer)}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{lpo.customer.email}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{lpo.customer.phone}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Designation</label>
                  <p className="font-medium">{lpo.designation}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p>{lpo.address}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Project Information */}
      {lpo.siteProject && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Project Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Project Name</label>
                <p className="font-medium">{lpo.siteProject.projectName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Main Client</label>
                <p className="font-medium">{lpo.siteProject.mainClient}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <p className="font-medium">{lpo.siteProject.location}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Project Status</label>
                <Badge variant="outline">{lpo.siteProject.status}</Badge>
              </div>
            </div>
            
            {lpo.siteProject.description && (
              <>
                <Separator className="my-4" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="mt-1">{lpo.siteProject.description}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Fleet Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Truck className="h-5 w-5" />
            <span>Fleet Information</span>
          </CardTitle>
          <CardDescription>
            Fleets assigned to this LPO
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Plate Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Hourly Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fleets.map((fleet) => {
                const hourlyRate = lpo.fleetHourlyRates.find(r => r.fleetId === fleet.fleetId)?.hourlyRate || 0;
                return (
                  <TableRow key={fleet.fleetId}>
                    <TableCell className="font-medium">{fleet.vehicleName}</TableCell>
                    <TableCell>{fleet.plateNumber}</TableCell>
                    <TableCell>{fleet.fleetType?.typeName || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={fleet.status === 'Available' ? 'default' : 'secondary'}>
                        {fleet.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${hourlyRate.toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Hourly Rate:</span>
              <span className="text-lg font-bold">${totalHourlyRate.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card>
        <CardHeader>
          <CardTitle>Terms and Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{lpo.termsAndCondition}</p>
          </div>
        </CardContent>
      </Card>

      {/* Audit Information */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created At</label>
              <p className="font-medium">{formatDateTime(lpo.createdAt)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
              <p className="font-medium">{formatDateTime(lpo.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete LPO</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this LPO? This action cannot be undone and will permanently remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete LPO
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stop Dialog */}
      <AlertDialog open={stopDialogOpen} onOpenChange={setStopDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop LPO</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to stop this LPO? This will change its status to "Stopped" and may affect ongoing operations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStop}
              disabled={isStopping}
              className="bg-yellow-600 text-white hover:bg-yellow-700"
            >
              {isStopping && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Stop LPO
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LposView;
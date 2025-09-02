import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../stores/slices/authSlice';
import useRoleNavigation from '../../../utils/useNavigation';
import { NavigationPaths } from '../../../utils/navigationPaths';
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
  ZoomIn,
  ZoomOut,
  RotateCw,
  AlertCircle,
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

import {
  useGetLPOByIdQuery,
  useDeleteLPOMutation,
  useStopLPOMutation,
} from '../../../stores/api/lposApiSlice';
import { LPO, Fleet } from '../types';
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
import {
  EditButton,
  DeleteButton,
  ViewButton,
  PermissionModule,
  ExportButton,
  ManageButton,
} from '../../../components/permissions';
import { useModulePermissions } from '../../../contexts/PermissionContext';
import LpoPdfView from './LpoPdfView';

// PDF Generation utility
const generatePDF = async (lpo: LPO, fleets: { fleetId: string; plateNumber: string; vehicleName: string; hourlyRate: number }[]) => {
  // Dynamic import for html2pdf to avoid SSR issues
  const html2pdf = (await import('html2pdf.js')).default;
  
  const element = document.getElementById('lpo-agreement-content');
  if (!element) {
    throw new Error('PDF content not found');
  }

  // Apply print styles
  element.style.color = '#000';
  element.style.fontFamily = 'Times New Roman, serif';

  const options = {
    margin: [10, 5, 0, 5],
    filename: `LPO_${lpo.lpoNumber}_${lpo.purpose?.replace(/[^a-zA-Z0-9]/g, '_') || 'Document'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    },
    pagebreak: { mode: ['css', 'legacy'] },
  };

  try {
    const pdf = await html2pdf().set(options).from(element).toPdf().get('pdf');
    pdf.setTextColor(0, 0, 0);
    await pdf.save();
    return true;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
};

const LposView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const { roleNavigate } = useRoleNavigation();
  
  // Local state
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfZoom, setPdfZoom] = useState(100);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stopDialogOpen, setStopDialogOpen] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  
  // Permission checks using new system
  const lposPermissions = useModulePermissions(PermissionModule.LPOS);
  
  // API hooks
  const {
    data: lpoResponse,
    isLoading,
    error: lpoError,
  } = useGetLPOByIdQuery(id!, { skip: !id });
  
  const [deleteLPOMutation, { isLoading: isDeleting }] = useDeleteLPOMutation();
  const [stopLPOMutation, { isLoading: isStopping }] = useStopLPOMutation();
  
  // Extract data from API response
  const lpo = lpoResponse?.lpo || null;
  const fleets = lpoResponse?.siteProjectFleets || [];
  
  // Error handling
  const error = lpoError ? getErrorMessage(lpoError) : null;

  // Auto-download on mobile
  useEffect(() => {
    const isMobile = window.innerWidth <= 767;
    if (!isLoading && lpo && isMobile) {
      handleDownloadPDF();
    }
  }, [isLoading, lpo]);

  // Handlers
  const handleBack = () => {
    roleNavigate(NavigationPaths.LPO.LIST);
  };

  const handleEdit = () => {
    if (lpo) {
      roleNavigate(NavigationPaths.LPO.EDIT(lpo.lpoId));
    }
  };

  const handleDownloadPDF = async () => {
    if (!lpo) return;
    
    setIsGeneratingPDF(true);
    try {
      await generatePDF(lpo, fleets.map(item => ({
        fleetId: item.fleet.fleetId,
        plateNumber: item.fleet.plateNumber,
        vehicleName: item.fleet.vehicleName,
        hourlyRate: item.fleet.hourlyRate
      })));
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error('PDF generation failed:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDelete = async () => {
    if (!lpo) return;
    
    try {
      await deleteLPOMutation(lpo.lpoId).unwrap();
      toast.success('LPO deleted successfully');
      roleNavigate(NavigationPaths.LPO.LIST);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleStop = async () => {
    if (!lpo) return;
    
    try {
      await stopLPOMutation(lpo.lpoId).unwrap();
      toast.success('LPO stopped successfully');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setStopDialogOpen(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleZoomIn = () => {
    setPdfZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setPdfZoom(prev => Math.max(prev - 25, 50));
  };



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
          <Button variant="ghost" onClick={handleBack}>
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
  const totalHourlyRate = calculateTotalHourlyRate(fleets.map(item => ({ fleetId: item.fleetId, hourlyRate: item.fleet.hourlyRate })));
  const estimatedCost = calculateEstimatedCost(fleets.map(item => ({ fleetId: item.fleetId, hourlyRate: item.fleet.hourlyRate })), lpo.lpoStartDate, lpo.lpoEndDate);
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
          {/* PDF Controls */}
          <div className="flex items-center gap-1 border rounded-md p-1">
            <Button variant="ghost" size="sm" onClick={handleZoomOut} disabled={pdfZoom <= 50}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm px-2">{pdfZoom}%</span>
            <Button variant="ghost" size="sm" onClick={handleZoomIn} disabled={pdfZoom >= 200}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Print and PDF actions - not permission controlled */}
          <Button variant="outline" onClick={() => setShowPdfPreview(true)}>
            <FileText className="h-4 w-4 mr-2" />
            PDF Preview
          </Button>
          
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
          </Button>
          
          {/* Permission-controlled actions */}
          <EditButton 
            module={PermissionModule.LPOS} 
            onClick={handleEdit}
            disabled={!isLPOEditable(lpo.status)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit LPO
          </EditButton>
          
          <ManageButton 
            module={PermissionModule.LPOS} 
            onClick={() => setStopDialogOpen(true)}
            disabled={!isLPOStoppable(lpo.status)}
            variant="outline"
          >
            <StopCircle className="h-4 w-4 mr-2" />
            Stop LPO
          </ManageButton>
          
          <DeleteButton 
            module={PermissionModule.LPOS} 
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete LPO
          </DeleteButton>
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
                <p className="text-2xl font-bold">{fleets?.length || 0}</p>
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
                <p className="font-medium">{lpo.siteProject.projectOwner}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Main Client</label>
                <p className="font-medium">{lpo.siteProject.mainContractor}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <p className="font-medium">{lpo.siteProject.zonalSite}</p>
              </div>
              {/* <div>
                <label className="text-sm font-medium text-muted-foreground">Project Status</label>
                <Badge variant="outline">{lpo.siteProject.status}</Badge>
              </div> */}
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
                {/* <TableHead>Type</TableHead> */}
                {/* <TableHead>Status</TableHead> */}
                <TableHead className="text-right">Hourly Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fleets.map((item) => {
                return (
                  <TableRow key={item.fleet.fleetId}>
                    <TableCell className="font-medium">{item.fleet.vehicleName}</TableCell>
                    <TableCell>{item.fleet.plateNumber}</TableCell>
                    {/* <TableCell>{item.fleet.fleetType?.typeName || 'N/A'}</TableCell> */}
                    {/* <TableCell>
                      <Badge variant={item.fleet.status === 'Available' ? 'default' : 'secondary'}>
                        {item.fleet.status}
                      </Badge>
                    </TableCell> */}
                    <TableCell className="text-right font-medium">
                      ${item.fleet.hourlyRate.toFixed(2)}
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

      {/* Hidden PDF Content for Generation */}
      <div id="lpo-agreement-content" className="hidden print:block" style={{ fontFamily: 'Times New Roman, serif' }}>
        {/* Header */}
        <div className="text-center border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold mb-2">IMPRESSIVE TRADING & CONTRACTING CO.</h1>
          <p className="text-sm">P.O. Box-30961, DOHA – QATAR</p>
          <p className="text-sm">Mob. No.: 55855163</p>
        </div>

        {/* Reference and Registration */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <strong>Ref. No: <span className="underline">{lpo.referenceNumber}</span></strong>
          </div>
          <div>
            <strong>REGN# 
              {fleets.map((item, index) => (
                <span key={index}>({item.fleet.plateNumber})</span>
              ))}
            </strong>
          </div>
        </div>

        {/* Agreement Content */}
        <div className="space-y-4 text-justify">
          <p>
            This Hire Agreement made and entered onto as of this{' '}
            <strong>{formatDate(lpo.createdAt)}</strong>
          </p>

          <p className="font-bold text-center">BY AND BETWEEN</p>

          <p>
            <strong className="underline">{lpo.customer?.firstname || ''} {lpo.customer?.lastname || ''}</strong>{' '}
            with its offices at <strong>{lpo.address}</strong>
            <br />
            Represented by{' '}
            <strong className="underline">
              {lpo.customer ? `${lpo.customer.firstname} ${lpo.customer.lastname}` : 'N/A'}, ({lpo.designation})
            </strong>{' '}
            hereinafter called FIRST PARTY.
          </p>

          <p className="font-bold text-center">AND</p>

          <p>
            <strong className="underline">IMPRESSIVE TRADING & CONTRACTING CO.</strong>{' '}
            with its offices at P.O. Box-30961,{' '}
            <strong className="underline">DOHA – QATAR</strong>
            <br />
            Mob. No.: 55855163
            <br />
            Represented by{' '}
            <strong className="underline">MUHAMMAD YOUSAF MANZOOR, (MANAGER)</strong>{' '}
            hereinafter called SECOND PARTY.
          </p>

          <p>
            <strong>WHEREAS</strong> the First Party has agreed to hire,{' '}
            {fleets.map((item, index) => {
              return (
                <strong key={index}>
                  {item.fleet.vehicleName}-{item.fleet.plateNumber}@{item.fleet.hourlyRate}/Hr{' '}
                </strong>
              );
            })}
            W/ OPERATOR from Second Party for use{' '}
            <strong className="underline">{lpo.purpose}</strong>
            <br />
            under the following conditions :-
          </p>

          {/* Terms and Conditions */}
          <div className="border-t pt-4">
            {lpo.termsAndCondition ? (
              <div 
                dangerouslySetInnerHTML={{ __html: lpo.termsAndCondition }}
                className="prose max-w-none"
              />
            ) : (
              <p>No terms and conditions specified.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-6 mt-8">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="font-bold">FIRST PARTY</p>
              <div className="mt-8">
                <div className="border-b border-black w-48 mb-2"></div>
                <p className="text-sm">Signature & Stamp</p>
              </div>
            </div>
            <div>
              <p className="font-bold">SECOND PARTY</p>
              <div className="mt-8">
                <div className="border-b border-black w-48 mb-2"></div>
                <p className="text-sm">Signature & Stamp</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {showPdfPreview && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-7xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">PDF Preview - {lpo.lpoNumber}</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowPdfPreview(false)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-full overflow-auto">
              <LpoPdfView lpoId={lpo.lpoId} />
            </div>
          </div>
        </div>
      )}

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
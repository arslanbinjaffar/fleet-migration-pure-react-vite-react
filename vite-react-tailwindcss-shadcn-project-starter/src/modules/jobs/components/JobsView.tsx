import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  User,
  Car,
  Wrench,

  Receipt,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  CheckCircle,
  Download,
  Eye,
  ClipboardCheck,
  DollarSign,
} from 'lucide-react';
import {FaFileInvoice} from "react-icons/fa"
// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';

// Store and API
import { useGetJobDetailsQuery } from '@/stores/api/jobsApiSlice';

// Types and utilities
import type { Job, InspectionDocument, JobProduct } from '../types';
import {
  getJobStatusStyle,
  getPaymentStatusStyle,
  getStatusBadgeVariant,
  getTechnicianDisplayName,
  getCustomerDisplayName,
  getMachineDisplayName,
  getMachinePlateNumber,
  formatDate,
  formatDateTime,
  formatCurrency,
  calculateBalance,
  parseArrayInput,
} from '../utils';

interface JobsViewProps {
  className?: string;
}

const JobsView: React.FC<JobsViewProps> = ({ className }) => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // API hooks
  const {
    data: jobDetailsData,
    isLoading,
    error,
    refetch,
  } = useGetJobDetailsQuery(jobId!, {
    skip: !jobId,
  });

  const jobData = jobDetailsData?.jobData;
  const job = jobData?.job;
  const inspectionJob = jobData?.inspectionJob;
  const diagnosisJobWithJobProducts = jobData?.diagnosisJobWithJobProducts;
  const diagnosisJob = diagnosisJobWithJobProducts?.diagnosisJob;
  const jobProducts = diagnosisJobWithJobProducts?.JobProducts;

  // Parse inspection documents
  const inspectionDocuments = parseArrayInput(inspectionJob?.documents);

  // Parse job products
  const parsedProducts = parseArrayInput(
    jobProducts?.[0]?.products ?? diagnosisJob?.jobProducts
  );

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  // Render status badge
  const renderStatusBadge = (status?: string, type: 'job' | 'payment' = 'job') => {
    const variant = getStatusBadgeVariant(status);
    const style = type === 'job' ? getJobStatusStyle(status as any) : getPaymentStatusStyle(status as any);
    
    return (
      <Badge 
        variant={variant as any}
        style={{
          backgroundColor: style.backgroundColor,
          color: style.color,
          borderColor: style.color,
        }}
        className="text-sm px-3 py-1"
      >
        {status || (type === 'job' ? 'New' : 'Not Invoiced')}
      </Badge>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (error || !job) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-destructive text-lg font-medium">
          Failed to load job details
        </div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Job Details: {job.jobNumber}
            </h1>
            <p className="text-muted-foreground">
              Created on {formatDate(job.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">Job Status</div>
              {renderStatusBadge(job.status)}
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">Secondary Status</div>
              {renderStatusBadge(job.secondaryStatus)}
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">Invoice Status</div>
              {renderStatusBadge(job.invoice?.paymentStatus, 'payment')}
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">Created Date</div>
              <div className="flex items-center justify-center gap-1 font-medium">
                <Calendar className="h-4 w-4" />
                {formatDate(job.createdAt)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="basic-info" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic-info">Basic Information</TabsTrigger>
          <TabsTrigger value="inspection">Inspection</TabsTrigger>
          <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
          <TabsTrigger value="quotation">Quotation</TabsTrigger>
          <TabsTrigger value="invoice">Invoice</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic-info" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm text-muted-foreground">Name</div>
                  <div className="col-span-2 font-medium">
                    {getCustomerDisplayName(job)}
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Phone
                  </div>
                  <div className="col-span-2">
                    {job.customer?.phone || job.customerJob?.phone || 'N/A'}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </div>
                  <div className="col-span-2">
                    {job.customer?.email || job.customerJob?.email || 'N/A'}
                  </div>
                </div>
                {job.customer?.organization && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm text-muted-foreground">Organization</div>
                    <div className="col-span-2">{job.customer.organization}</div>
                  </div>
                )}
                {job.customer?.mailingAddress && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Address
                    </div>
                    <div className="col-span-2">
                      {`${job.customer.mailingAddress}, ${job.customer.city}, ${job.customer.stateOrProvince}, ${job.customer.area}, ${job.customer.country}`}
                    </div>
                  </div>
                )}
                {job.customer?.TRN && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm text-muted-foreground">TRN</div>
                    <div className="col-span-2">{job.customer.TRN}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vehicle Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  Vehicle Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm text-muted-foreground">Vehicle Name</div>
                  <div className="col-span-2 font-medium">
                    {getMachineDisplayName(job)}
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm text-muted-foreground">Plate Number</div>
                  <div className="col-span-2">{getMachinePlateNumber(job)}</div>
                </div>
                {job.fleet && (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-sm text-muted-foreground">Model</div>
                      <div className="col-span-2">{job.fleet.vehicleModel}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-sm text-muted-foreground">Made In</div>
                      <div className="col-span-2">{job.fleet.madeIn}</div>
                    </div>
                    {job.fleet.productionDate && (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-sm text-muted-foreground">Production Date</div>
                        <div className="col-span-2">{formatDate(job.fleet.productionDate)}</div>
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-sm text-muted-foreground">Chassis Number</div>
                      <div className="col-span-2">{job.fleet.chassisNumber}</div>
                    </div>
                  </>
                )}
                {job.FleetbyTbcJob && (
                  <>
                    {job.FleetbyTbcJob.machineType && (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-sm text-muted-foreground">Type</div>
                        <div className="col-span-2">{job.FleetbyTbcJob.machineType}</div>
                      </div>
                    )}
                    {job.FleetbyTbcJob.machineBrand && (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-sm text-muted-foreground">Brand</div>
                        <div className="col-span-2">{job.FleetbyTbcJob.machineBrand}</div>
                      </div>
                    )}
                    {job.FleetbyTbcJob.runningHours && (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-sm text-muted-foreground">Running Hours</div>
                        <div className="col-span-2">{job.FleetbyTbcJob.runningHours}</div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Technician Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-primary" />
                  Technician Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm text-muted-foreground">Name</div>
                  <div className="col-span-2 font-medium">
                    {getTechnicianDisplayName(job)}
                  </div>
                </div>
                {job.technician_Detail && (
                  <>
                    <Separator />
                    {job.technician_Detail.employeeNumber && (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-sm text-muted-foreground">Employee Number</div>
                        <div className="col-span-2">{job.technician_Detail.employeeNumber}</div>
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" /> Email
                      </div>
                      <div className="col-span-2">{job.technician_Detail.email}</div>
                    </div>
                    {job.technician_Detail.localMobileNo && (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" /> Phone
                        </div>
                        <div className="col-span-2">{job.technician_Detail.localMobileNo}</div>
                      </div>
                    )}
                    {job.technician_Detail.idProfession && (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-sm text-muted-foreground">Profession</div>
                        <div className="col-span-2">{job.technician_Detail.idProfession}</div>
                      </div>
                    )}
                  </>
                )}
                {job.manualTechnician && (
                  <>
                    <Separator />
                    <div className="bg-blue-50 p-3 rounded-md">
                      <div className="text-sm text-blue-600 font-medium mb-1">Manual Technician</div>
                      {job.manualTechnician.email && (
                        <div className="text-sm text-blue-600">
                          Email: {job.manualTechnician.email}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Invoice Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaFileInvoice className="h-5 w-5 text-primary" />
                  Invoice Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm text-muted-foreground">Invoice Number</div>
                  <div className="col-span-2 font-medium">
                    {job.invoice?.invoiceNo || 'Not Invoiced'}
                  </div>
                </div>
                {job.invoice && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-sm text-muted-foreground">Invoice Date</div>
                      <div className="col-span-2">
                        {job.invoice.invoiceDate ? formatDate(job.invoice.invoiceDate) : 'N/A'}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-sm text-muted-foreground">Payment Status</div>
                      <div className="col-span-2">
                        {renderStatusBadge(job.invoice.paymentStatus, 'payment')}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-sm text-muted-foreground">Payment Method</div>
                      <div className="col-span-2">{job.invoice.paymentMode || 'N/A'}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-sm text-muted-foreground">Total Amount</div>
                      <div className="col-span-2 font-bold">
                        {formatCurrency(job.invoice.totalAmount)}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-sm text-muted-foreground">Paid Amount</div>
                      <div className="col-span-2 font-bold text-green-600">
                        {formatCurrency(job.invoice.paidAmount)}
                      </div>
                    </div>
                    {job.invoice.paidAmount !== job.invoice.totalAmount && (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-sm text-muted-foreground">Balance</div>
                        <div className="col-span-2 font-bold text-red-600">
                          {formatCurrency(calculateBalance(job.invoice.totalAmount, job.invoice.paidAmount))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Inspection Tab */}
        <TabsContent value="inspection">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                Inspection Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inspectionDocuments && inspectionDocuments.length > 0 ? (
                <div className="space-y-4">
                  <h6 className="font-medium">Inspection Documents</h6>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Document</TableHead>
                        <TableHead>Comments</TableHead>
                        <TableHead className="w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inspectionDocuments.map((doc: InspectionDocument, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            {doc.fileUrl ? (
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Inspection Document {index + 1}
                              </a>
                            ) : (
                              'No document attached'
                            )}
                          </TableCell>
                          <TableCell>{doc.comment || 'No comments'}</TableCell>
                          <TableCell>
                            {doc.fileUrl && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={doc.fileUrl} download>
                                  <Download className="mr-1 h-3 w-3" />
                                  Download
                                </a>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No inspection documents available.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Diagnosis Tab */}
        <TabsContent value="diagnosis">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary" />
                Diagnosis Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {diagnosisJob ? (
                <div className="space-y-6">
                  {/* Cost Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <div className="text-sm text-muted-foreground mb-1">Labor Charges</div>
                        <div className="text-lg font-bold">
                          {formatCurrency(diagnosisJob.laborCharges)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <div className="text-sm text-muted-foreground mb-1">Subtotal</div>
                        <div className="text-lg font-bold">
                          {formatCurrency(diagnosisJob.subtotal)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <div className="text-sm text-muted-foreground mb-1">VAT</div>
                        <div className="text-lg font-bold">
                          {formatCurrency(diagnosisJob.VAT)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <div className="text-sm text-muted-foreground mb-1">Total Charges</div>
                        <div className="text-lg font-bold text-primary">
                          {formatCurrency(diagnosisJob.totalCharges)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Parts & Products */}
                  <div>
                    <h6 className="font-medium mb-4">Parts & Products</h6>
                    {parsedProducts && parsedProducts.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">#</TableHead>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Unit Price</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Discount</TableHead>
                            <TableHead>Subtotal</TableHead>
                            <TableHead>Details</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parsedProducts.map((product: JobProduct, index: number) => (
                            <TableRow key={index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{product.subService?.name || 'N/A'}</TableCell>
                              <TableCell>{formatCurrency(product.startRangePrice)}</TableCell>
                              <TableCell>{product.quantity || 1}</TableCell>
                              <TableCell>{formatCurrency(product.discount)}</TableCell>
                              <TableCell>{formatCurrency(product.subTotal)}</TableCell>
                              <TableCell>{product.detail || 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No products or parts listed.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No diagnosis information available.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quotation Tab */}
        <TabsContent value="quotation">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Quotation Details
              </CardTitle>
              {job.quotaion && (
                <Button variant="outline" size="sm">
                  <Eye className="mr-1 h-4 w-4" />
                  View Full
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {job.quotaion ? (
                <div className="space-y-6">
                  {/* Quotation Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-sm text-muted-foreground mb-1">Quotation Number</div>
                        <div className="font-bold">{job.quotaion.quotationNo}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-sm text-muted-foreground mb-1">Subject</div>
                        <div className="font-medium">{job.quotaion.subject || 'N/A'}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-sm text-muted-foreground mb-1">Status</div>
                        <div>{renderStatusBadge(job.quotaion.status)}</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Validity Period */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-sm text-muted-foreground mb-1">Valid From</div>
                        <div className="font-medium">
                          {job.quotaion.startDate ? formatDate(job.quotaion.startDate) : 'Not specified'}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-sm text-muted-foreground mb-1">Valid Until</div>
                        <div className="font-medium">
                          {job.quotaion.endDate ? formatDate(job.quotaion.endDate) : 'Not specified'}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Description */}
                  {job.quotaion.discription && (
                    <Accordion type="single" collapsible>
                      <AccordionItem value="description">
                        <AccordionTrigger>Quotation Description</AccordionTrigger>
                        <AccordionContent>
                          <div 
                            dangerouslySetInnerHTML={{ 
                              __html: job.quotaion.discription 
                            }} 
                            className="prose max-w-none"
                          />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}

                  {/* Products & Services */}
                  <div>
                    <h6 className="font-medium mb-4">Products & Services</h6>
                    {job.quotaion.subSeriviceList && job.quotaion.subSeriviceList.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">#</TableHead>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Unit Price</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Discount</TableHead>
                            <TableHead>Subtotal</TableHead>
                            <TableHead>Details</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {job.quotaion.subSeriviceList.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{item.product?.name || 'N/A'}</TableCell>
                              <TableCell>{formatCurrency(item.startRangePrice)}</TableCell>
                              <TableCell>{item.quantity || 1}</TableCell>
                              <TableCell>{formatCurrency(item.discount)}</TableCell>
                              <TableCell>{formatCurrency(item.subTotal)}</TableCell>
                              <TableCell>
                                {item.detail || item.otherChargesDescription || 'N/A'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No products or services listed.
                      </div>
                    )}
                  </div>

                  {/* Total Calculation */}
                  {job.quotaion.pricesCalculation && (
                    <div className="flex justify-end">
                      <Card className="w-full max-w-md">
                        <CardContent className="pt-4">
                          <Table>
                            <TableBody>
                              <TableRow>
                                <TableCell className="font-medium">Subtotal</TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(job.quotaion.pricesCalculation.subtotal)}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">Discount</TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(job.quotaion.pricesCalculation.totalDiscount)}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  VAT ({job.quotaion.salesTaxs || 0}%)
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(job.quotaion.pricesCalculation.EstimatedTax)}
                                </TableCell>
                              </TableRow>
                              <TableRow className="border-t-2">
                                <TableCell className="font-bold">Total</TableCell>
                                <TableCell className="text-right font-bold text-primary">
                                  {formatCurrency(job.quotaion.pricesCalculation.total)}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No quotation information available.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoice Tab */}
        <TabsContent value="invoice">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                Invoice Details
              </CardTitle>
              {job.invoice && (
                <Button variant="outline" size="sm">
                  <Eye className="mr-1 h-4 w-4" />
                  View Full
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {job.invoice ? (
                <div className="space-y-6">
                  {/* Invoice Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-sm text-muted-foreground mb-1">Invoice Number</div>
                        <div className="font-bold">{job.invoice.invoiceNo}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-sm text-muted-foreground mb-1">Invoice Date</div>
                        <div className="font-medium">
                          {job.invoice.invoiceDate ? formatDate(job.invoice.invoiceDate) : 'Not specified'}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-sm text-muted-foreground mb-1">Due Date</div>
                        <div className="font-medium">
                          {job.invoice.invoiceDue ? formatDate(job.invoice.invoiceDue) : 'Not specified'}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-sm text-muted-foreground mb-1">Payment Status</div>
                        <div>{renderStatusBadge(job.invoice.paymentStatus, 'payment')}</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Payment Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-sm text-muted-foreground mb-1">Payment Method</div>
                        <div className="font-medium">{job.invoice.paymentMode || 'Not specified'}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-sm text-muted-foreground mb-1">TRN</div>
                        <div className="font-medium">{job.invoice.TRN || 'Not specified'}</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Description */}
                  {job.invoice.description && (
                    <Accordion type="single" collapsible>
                      <AccordionItem value="description">
                        <AccordionTrigger>Invoice Description</AccordionTrigger>
                        <AccordionContent>
                          <div 
                            dangerouslySetInnerHTML={{ 
                              __html: job.invoice.description 
                            }} 
                            className="prose max-w-none"
                          />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}

                  {/* Products & Services */}
                  <div>
                    <h6 className="font-medium mb-4">Products & Services</h6>
                    {job.invoice.subSeriviceList ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">#</TableHead>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Unit Price</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Discount</TableHead>
                            <TableHead>Subtotal</TableHead>
                            <TableHead>Details</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parseArrayInput(job.invoice.subSeriviceList).map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{item.subService?.name || 'N/A'}</TableCell>
                              <TableCell>{formatCurrency(item.startRangePrice)}</TableCell>
                              <TableCell>{item.quantity || 1}</TableCell>
                              <TableCell>{formatCurrency(item.discount)}</TableCell>
                              <TableCell>{formatCurrency(item.subTotal)}</TableCell>
                              <TableCell>{item.detail || 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No products or services listed.
                      </div>
                    )}
                  </div>

                  {/* Total Calculation */}
                  <div className="flex justify-end">
                    <Card className="w-full max-w-md">
                      <CardContent className="pt-4">
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">Subtotal</TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(job.invoice.subTotal)}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Discount</TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(job.invoice.itemDiscounts)}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">VAT</TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(job.invoice.estimatedTax)}
                              </TableCell>
                            </TableRow>
                            <TableRow className="border-t-2">
                              <TableCell className="font-bold">Total Amount</TableCell>
                              <TableCell className="text-right font-bold text-primary">
                                {formatCurrency(job.invoice.totalAmount)}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-bold">Paid Amount</TableCell>
                              <TableCell className="text-right font-bold text-green-600">
                                {formatCurrency(job.invoice.paidAmount)}
                              </TableCell>
                            </TableRow>
                            {job.invoice.paidAmount !== job.invoice.totalAmount && (
                              <TableRow>
                                <TableCell className="font-bold">Balance</TableCell>
                                <TableCell className="text-right font-bold text-red-600">
                                  {formatCurrency(calculateBalance(job.invoice.totalAmount, job.invoice.paidAmount))}
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Payment Completed Status */}
                  {job.invoice.paymentStatus === 'Paid' && (
                    <div className="text-center py-6">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                      <h4 className="text-lg font-semibold text-green-600 mb-1">Payment Completed</h4>
                      <p className="text-muted-foreground">
                        This invoice has been fully paid on{' '}
                        {job.invoice.updatedAt ? formatDate(job.invoice.updatedAt) : 'an unknown date'}.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No invoice information available.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JobsView;
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FaDownload,
  FaSpinner,
  FaArrowLeft,
  FaTools,
  FaFileAlt,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCarAlt,
  FaIdCard,
  FaCalendarAlt,
  FaClipboardList,
  FaMoneyBillWave,
  FaPlus,
  FaTrashAlt,
  FaSave,
  FaInfoCircle,
  FaCheckCircle,
} from 'react-icons/fa';

// shadcn UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

// Internal imports
import { selectCurrentUser } from '@/stores/slices/authSlice';
import {
  useGetRepairJobDetailsQuery,
  useUpdateRepairJobMutation,
} from '@/stores/api/repairsApiSlice';
import { useGetProductsQuery } from '@/stores/api/productApiSlice'; // Assuming products API is in jobs
import {
  RepairJob,
  RepairStatus,
  InspectionData,
  DiagnosisProduct,
  DiagnosisService,
  RepairEditProps,
} from '../types';
import {
  JobStatus,
  STATUS_OPTIONS,
  FILE_UPLOAD,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '../constants';
import {
  repairFormSchema,
  RepairFormType,
} from '../schemas';
import {
  getStatusStyle,
  getStatusIcon,
  formatDate,
  validateFileSize,
  getFilenameFromUrl,
  calculateSubtotal,
  calculateDiagnosisTotal,
} from '../utils';

// Status Badge Component
interface StatusBadgeProps {
  status: RepairStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <Badge
      variant="outline"
      className="inline-flex items-center gap-1"
      style={getStatusStyle(status)}
    >
      {getStatusIcon(status)}
      {status || 'Unknown'}
    </Badge>
  );
};

// Progress Steps Component
interface ProgressStepsProps {
  currentStatus: RepairStatus;
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ currentStatus }) => {
  const steps = ['Inspection', 'Diagnosis', 'RepairInProgress', 'Completed'];
  const currentIndex = steps.findIndex(step => step === currentStatus);

  return (
    <div className="flex justify-center items-center gap-4 py-4">
      {steps.map((step, index) => {
        const isActive = currentIndex >= index;
        const isCurrent = currentStatus === step;

        return (
          <div
            key={step}
            className={`flex flex-col items-center ${
              isActive ? 'opacity-100' : 'opacity-50'
            } ${
              isCurrent ? 'scale-110' : ''
            } transition-all duration-300`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              } ${
                isCurrent ? 'ring-4 ring-primary/30' : ''
              }`}
            >
              {currentIndex > index ? '✓' : index + 1}
            </div>
            <span className="text-xs mt-1 text-center max-w-20">{step}</span>
          </div>
        );
      })}
    </div>
  );
};

// Main RepairsEdit Component
const RepairsEdit: React.FC<RepairEditProps> = () => {
  const { repairId } = useParams<{ repairId: string }>();
  const navigate = useNavigate();
  const userInfo = useSelector(selectCurrentUser);
  const { toast } = useToast();

  // API queries and mutations
  const {
    data: jobDetailsData,
    isLoading,
    error,
    refetch,
  } = useGetRepairJobDetailsQuery(repairId!);

  const { data: productsData } = useGetProductsQuery();
  const [updateRepairJob, { isLoading: isUpdating }] = useUpdateRepairJobMutation();

  // Local state
  const [activeTab, setActiveTab] = useState('products');
  const [inspectionData, setInspectionData] = useState<InspectionData[]>([]);
  const [items, setItems] = useState<DiagnosisProduct[]>([]);
  const [services, setServices] = useState<DiagnosisService[]>([]);
  const [laborCharges, setLaborCharges] = useState(0);
  const [downloadingFiles, setDownloadingFiles] = useState<Record<string, boolean>>({});

  const job = jobDetailsData?.jobData?.job;
  const inspectionJob = jobDetailsData?.jobData?.inspectionJob;
  const diagnosisJob = jobDetailsData?.jobData?.diagnosisJob;

  // Form setup
  const form = useForm<RepairFormType>({
    resolver: zodResolver(repairFormSchema),
    defaultValues: {
      status: job?.status || 'Inspection',
    },
  });

  const watchedStatus = form.watch('status');

  // Initialize data when job loads
  useEffect(() => {
    if (!job) return;

    form.reset({
      status: job.status,
    });

    // Initialize inspection data
    if (job.status === 'Inspection' || inspectionJob) {
      const attachments = inspectionJob?.JobDocuments || [];
      const inspectionAttachments = attachments.map((att: any) => ({
        attachment: null,
        description: att.description || att.comment || '',
        url: att.fileUrl || '',
      }));
      setInspectionData(inspectionAttachments.length > 0 ? inspectionAttachments : [{ attachment: null, description: '', url: '' }]);
    }

    // Initialize diagnosis data
    if ((job.status === 'Diagnosis' || diagnosisJob) && diagnosisJob) {
      setLaborCharges(diagnosisJob.laborCharges || 0);

      if (diagnosisJob.spareParts?.length > 0) {
        const formattedItems = diagnosisJob.spareParts.map((item: any, index: number) => ({
          id: index + 1,
          productId: item.productId,
          description: item.description || '',
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || 0,
          subTotal: item.unitPrice * item.quantity - (item.discount || 0),
          discount: item.discount || 0,
        }));
        setItems(formattedItems);
      }

      if (diagnosisJob.services?.length > 0) {
        const formattedServices = diagnosisJob.services.map((service: any, index: number) => ({
          id: index + 1,
          serviceName: service.serviceName || '',
          description: service.description || '',
          quantity: service.quantity || 1,
          unitPrice: service.unitPrice || 0,
          subTotal: service.subTotal || service.unitPrice * service.quantity - (service.discount || 0),
          discount: service.discount || 0,
        }));
        setServices(formattedServices);
      }
    }
  }, [job, inspectionJob, diagnosisJob, form]);

  // Calculated totals
  const totals = useMemo(() => {
    return calculateDiagnosisTotal(items, services, laborCharges);
  }, [items, services, laborCharges]);

  // Event handlers
  const addInspectionField = () => {
    setInspectionData([...inspectionData, { attachment: null, description: '', url: '' }]);
  };

  const removeInspectionField = (index: number) => {
    const updatedData = [...inspectionData];
    updatedData.splice(index, 1);
    setInspectionData(updatedData);
  };

  const handleInspectionChange = (index: number, field: string, value: any) => {
    const updatedData = [...inspectionData];
    if (field === 'attachment' && value && !validateFileSize(value)) {
      toast({
        title: 'Error',
        description: ERROR_MESSAGES.FILE_SIZE_EXCEEDED(FILE_UPLOAD.MAX_FILE_SIZE_MB),
        variant: 'destructive',
      });
      return;
    }
    updatedData[index] = { ...updatedData[index], [field]: value };
    setInspectionData(updatedData);
  };

  const addItem = () => {
    const newItem: DiagnosisProduct = {
      id: items.length + 1,
      productId: '',
      quantity: 1,
      subTotal: 0,
      discount: 0,
      description: '',
      unitPrice: 0,
    };
    setItems([...items, newItem]);
  };

  const deleteItem = (id: number) => {
    const updatedItems = items.filter(item => item.id !== id);
    const reindexedItems = updatedItems.map((item, index) => ({ ...item, id: index + 1 }));
    setItems(reindexedItems);
  };

  const addService = () => {
    const newService: DiagnosisService = {
      id: services.length + 1,
      serviceName: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      subTotal: 0,
      description: '',
    };
    setServices([...services, newService]);
  };

  const deleteService = (id: number) => {
    const updatedServices = services.filter(service => service.id !== id);
    const reindexedServices = updatedServices.map((service, index) => ({ ...service, id: index + 1 }));
    setServices(reindexedServices);
  };

  const handleProductChange = (itemId: number, productId: string) => {
    const selectedProduct = productsData?.products?.find((product: any) => product.productId === productId);
    if (selectedProduct) {
      const itemIndex = items.findIndex(item => item.id === itemId);
      const updatedItems = [...items];
      const quantity = updatedItems[itemIndex]?.quantity || 1;
      const discount = updatedItems[itemIndex]?.discount || 0;
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        productId: selectedProduct.productId,
        description: selectedProduct.description || '',
        unitPrice: selectedProduct.price || 0,
        subTotal: calculateSubtotal(selectedProduct.price || 0, quantity, discount),
      };
      setItems(updatedItems);
    }
  };

  const updateItemField = (itemId: number, field: keyof DiagnosisProduct, value: any) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
          updatedItem.subTotal = calculateSubtotal(
            updatedItem.unitPrice,
            updatedItem.quantity,
            updatedItem.discount
          );
        }
        return updatedItem;
      }
      return item;
    });
    setItems(updatedItems);
  };

  const updateServiceField = (serviceId: number, field: keyof DiagnosisService, value: any) => {
    const updatedServices = services.map(service => {
      if (service.id === serviceId) {
        const updatedService = { ...service, [field]: value };
        if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
          updatedService.subTotal = calculateSubtotal(
            updatedService.unitPrice,
            updatedService.quantity,
            updatedService.discount
          );
        }
        return updatedService;
      }
      return service;
    });
    setServices(updatedServices);
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    if (!fileUrl || downloadingFiles[fileName]) return;

    setDownloadingFiles(prev => ({ ...prev, [fileName]: true }));
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download file',
        variant: 'destructive',
      });
      window.open(fileUrl, '_blank');
    } finally {
      setDownloadingFiles(prev => ({ ...prev, [fileName]: false }));
    }
  };

  const onSubmit = async (data: RepairFormType) => {
    if (!repairId) return;

    try {
      const formData = new FormData();

      if (data.status === 'Inspection') {
        inspectionData.forEach((item, index) => {
          if (item.attachment) {
            formData.append(`attachments[${index}][file]`, item.attachment);
            formData.append(`attachments[${index}][comment]`, item.description || '');
          }
        });
      }

      if (data.status === 'Diagnosis') {
        const validProducts = items.filter(item => item.productId && item.productId.trim() !== '');
        const validServices = services.filter(service => service.serviceName && service.serviceName.trim() !== '');

        formData.append('laborCharges', String(laborCharges || 0));

        if (validProducts.length > 0) {
          const productsData = validProducts.map(item => ({
            productId: item.productId,
            description: item.description || '',
            quantity: Number(item.quantity) || 1,
            unitPrice: Number(item.unitPrice) || 0,
            subTotal: Number(item.subTotal) || 0,
            discount: Number(item.discount) || 0,
          }));
          formData.append('products', JSON.stringify(productsData));
        }

        if (validServices.length > 0) {
          const servicesData = validServices.map(service => ({
            serviceName: service.serviceName || '',
            description: service.description || '',
            quantity: Number(service.quantity) || 1,
            unitPrice: Number(service.unitPrice) || 0,
            subTotal: Number(service.subTotal) || 0,
            discount: Number(service.discount) || 0,
          }));
          formData.append('services', JSON.stringify(servicesData));
        }

        const totalQuantity = validProducts.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) +
                             validServices.reduce((sum, service) => sum + (Number(service.quantity) || 0), 0);
        formData.append('quantity', String(totalQuantity));
      }

      if (data.repairDetails) {
        formData.append('repairDetails', data.repairDetails);
      }

      if (data.completionNotes) {
        formData.append('completionNotes', data.completionNotes);
      }

      await updateRepairJob({
        jobId: repairId,
        status: data.status,
        formData,
      }).unwrap();

      toast({
        title: 'Success',
        description: SUCCESS_MESSAGES.JOB_UPDATED,
      });

      navigate(`/${userInfo?.Role?.roleName?.toLowerCase()}/repairs`);
    } catch (error) {
      console.error('Error updating job:', error);
      toast({
        title: 'Error',
        description: ERROR_MESSAGES.UPDATE_JOB_FAILED,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {ERROR_MESSAGES.FETCH_JOB_DETAILS_FAILED}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <FaArrowLeft className="mr-2" /> Back to List
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit Job</h1>
              <p className="text-blue-100">{job.jobNumber}</p>
            </div>
          </div>
          <StatusBadge status={job.status} />
        </div>
        <ProgressSteps currentStatus={job.status} />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Job Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FaInfoCircle className="text-primary" />
                Job Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <FaIdCard className="text-primary" /> Job Number
                  </Label>
                  <Input value={job.jobNumber || ''} readOnly className="bg-muted" />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <FaCalendarAlt className="text-primary" /> Created Date
                  </Label>
                  <Input value={formatDate(job.createdAt)} readOnly className="bg-muted" />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <FaCarAlt className="text-primary" /> Vehicle Name
                  </Label>
                  <Input
                    value={job.fleet?.vehicleName || job.FleetbyTbcJob?.machineName || ''}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <FaIdCard className="text-primary" /> Plate Number
                  </Label>
                  <Input
                    value={job.fleet?.plateNumber || job.FleetbyTbcJob?.machinePlateNo || ''}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <FaUser className="text-primary" /> Customer Name
                  </Label>
                  <Input
                    value={`${job.customer?.firstname || ''} ${job.customer?.lastname || ''}`.trim()}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <FaPhone className="text-primary" /> Customer Phone
                  </Label>
                  <Input value={job.customer?.phone || ''} readOnly className="bg-muted" />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <FaEnvelope className="text-primary" /> Customer Email
                  </Label>
                  <Input value={job.customer?.email || ''} readOnly className="bg-muted" />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <FaUser className="text-primary" /> Technician Name
                  </Label>
                  <Input
                    value={`${job.technician_Detail?.firstName || ''} ${job.technician_Detail?.lastName || ''}`.trim()}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Repair Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FaTools className="text-primary" />
                Repair Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Status Selection */}
              <div className="mb-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FaClipboardList className="text-primary" /> Status
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full md:w-64">
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STATUS_OPTIONS
                            .filter(opt => opt.value !== 'all')
                            .map((option) => (
                              <SelectItem key={option.value} value={option.value as string}>
                                <div className="flex items-center gap-2">
                                  {option.icon}
                                  {option.label}
                                </div>
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Status-specific content */}
              {watchedStatus === 'Inspection' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FaClipboardList className="text-primary" />
                    Inspection Details
                  </h3>
                  {inspectionData.map((data, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                      <div className="md:col-span-2">
                        {index === 0 && (
                          <Label className="flex items-center gap-2 mb-2">
                            <FaFileAlt className="text-primary" /> Attachment
                          </Label>
                        )}
                        {data.url ? (
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(data.url!, getFilenameFromUrl(data.url!))}
                              disabled={downloadingFiles[getFilenameFromUrl(data.url!)]}
                            >
                              {downloadingFiles[getFilenameFromUrl(data.url!)] ? (
                                <FaSpinner className="animate-spin" />
                              ) : (
                                <FaDownload />
                              )}
                            </Button>
                            <span className="text-sm truncate">{getFilenameFromUrl(data.url!)}</span>
                          </div>
                        ) : (
                          <Input
                            type="file"
                            onChange={(e) => handleInspectionChange(index, 'attachment', e.target.files?.[0])}
                            accept={FILE_UPLOAD.ALLOWED_FILE_TYPES.join(',')}
                          />
                        )}
                      </div>
                      <div className="md:col-span-2">
                        {index === 0 && (
                          <Label className="flex items-center gap-2 mb-2">
                            <FaInfoCircle className="text-primary" /> Comment
                          </Label>
                        )}
                        <Textarea
                          value={data.description}
                          onChange={(e) => handleInspectionChange(index, 'description', e.target.value)}
                          placeholder="Enter comment"
                        />
                      </div>
                      <div className="flex items-end">
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeInspectionField(index)}
                          >
                            <FaTrashAlt />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addInspectionField}>
                    <FaPlus className="mr-2" /> Add More
                  </Button>
                </div>
              )}

              {watchedStatus === 'Diagnosis' && (
                <div className="space-y-6">
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <FaMoneyBillWave className="text-primary" /> Labor Charges
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={laborCharges}
                        onChange={(e) => setLaborCharges(Number(e.target.value) || 0)}
                        placeholder="Enter labor charges"
                        className="w-64"
                      />
                      <span className="text-sm text-muted-foreground">QAR</span>
                    </div>
                  </div>

                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                      <TabsTrigger value="products" className="flex items-center gap-2">
                        <FaClipboardList /> Products
                      </TabsTrigger>
                      <TabsTrigger value="services" className="flex items-center gap-2">
                        <FaTools /> Services
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="products" className="space-y-4">
                      <Alert>
                        <FaClipboardList className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Product Information</strong>
                        </AlertDescription>
                      </Alert>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Unit Price</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Discount</TableHead>
                            <TableHead>Line Total</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.length > 0 ? (
                            items.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="w-64">
                                  <Select
                                    value={item.productId}
                                    onValueChange={(value) => handleProductChange(item.id, value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select Product" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {productsData?.products?.map((product: any) => (
                                        <SelectItem key={product.productId} value={product.productId}>
                                          {product.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Input
                                      type="number"
                                      value={item.unitPrice}
                                      onChange={(e) => updateItemField(item.id, 'unitPrice', Number(e.target.value) || 0)}
                                      className="w-24"
                                    />
                                    <span className="text-xs">QAR</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => updateItemField(item.id, 'quantity', Number(e.target.value) || 1)}
                                    className="w-20"
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Input
                                      type="number"
                                      value={item.discount}
                                      onChange={(e) => updateItemField(item.id, 'discount', Number(e.target.value) || 0)}
                                      className="w-24"
                                    />
                                    <span className="text-xs">QAR</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Input value={item.subTotal.toFixed(2)} readOnly className="w-24 bg-muted" />
                                    <span className="text-xs">QAR</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={item.description}
                                    onChange={(e) => updateItemField(item.id, 'description', e.target.value)}
                                    placeholder="Description"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => deleteItem(item.id)}
                                  >
                                    <FaTrashAlt />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8">
                                <div className="text-muted-foreground">
                                  <FaClipboardList size={24} className="mx-auto mb-2" />
                                  <p>No products added yet. Click "Add Product" to get started.</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      <Button type="button" variant="outline" onClick={addItem}>
                        <FaPlus className="mr-2" /> Add Product
                      </Button>
                    </TabsContent>

                    <TabsContent value="services" className="space-y-4">
                      <Alert>
                        <FaTools className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Service Information</strong>
                        </AlertDescription>
                      </Alert>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Service Name</TableHead>
                            <TableHead>Unit Price</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Discount</TableHead>
                            <TableHead>Line Total</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {services.length > 0 ? (
                            services.map((service) => (
                              <TableRow key={service.id}>
                                <TableCell>
                                  <Input
                                    value={service.serviceName}
                                    onChange={(e) => updateServiceField(service.id, 'serviceName', e.target.value)}
                                    placeholder="Enter service name"
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Input
                                      type="number"
                                      value={service.unitPrice}
                                      onChange={(e) => updateServiceField(service.id, 'unitPrice', Number(e.target.value) || 0)}
                                      className="w-24"
                                    />
                                    <span className="text-xs">QAR</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    value={service.quantity}
                                    onChange={(e) => updateServiceField(service.id, 'quantity', Number(e.target.value) || 1)}
                                    className="w-20"
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Input
                                      type="number"
                                      value={service.discount}
                                      onChange={(e) => updateServiceField(service.id, 'discount', Number(e.target.value) || 0)}
                                      className="w-24"
                                    />
                                    <span className="text-xs">QAR</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Input value={service.subTotal.toFixed(2)} readOnly className="w-24 bg-muted" />
                                    <span className="text-xs">QAR</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={service.description}
                                    onChange={(e) => updateServiceField(service.id, 'description', e.target.value)}
                                    placeholder="Description"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => deleteService(service.id)}
                                  >
                                    <FaTrashAlt />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8">
                                <div className="text-muted-foreground">
                                  <FaTools size={24} className="mx-auto mb-2" />
                                  <p>No services added yet. Click "Add Service" to get started.</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      <Button type="button" variant="outline" onClick={addService}>
                        <FaPlus className="mr-2" /> Add Service
                      </Button>
                    </TabsContent>
                  </Tabs>

                  {/* Totals Summary */}
                  <Alert>
                    <FaMoneyBillWave className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Total Summary (Products + Services)</strong>
                    </AlertDescription>
                  </Alert>
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>Products Subtotal:</span>
                      <span className="font-medium">{totals.productSubtotal.toFixed(2)} QAR</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Services Subtotal:</span>
                      <span className="font-medium">{totals.serviceSubtotal.toFixed(2)} QAR</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Discount:</span>
                      <span className="font-medium">{totals.totalDiscount.toFixed(2)} QAR</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Labor Charges:</span>
                      <span className="font-medium">{totals.laborCharges.toFixed(2)} QAR</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 text-lg font-bold">
                      <span>Grand Total:</span>
                      <span>{totals.grandTotal.toFixed(2)} QAR</span>
                    </div>
                  </div>
                </div>
              )}

              {watchedStatus === 'RepairInProgress' && (
                <FormField
                  control={form.control}
                  name="repairDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FaTools className="text-primary" /> Repair Details
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter repair details"
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {watchedStatus === 'Completed' && (
                <FormField
                  control={form.control}
                  name="completionNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FaCheckCircle className="text-primary" /> Completion Notes
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter completion notes"
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isUpdating} size="lg">
              {isUpdating ? (
                <>
                  <FaSpinner className="mr-2 animate-spin" /> Updating...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" /> Update {watchedStatus || 'Job'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default RepairsEdit;
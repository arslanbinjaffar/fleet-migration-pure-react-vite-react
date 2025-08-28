import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRoleBasedNavigation } from '../../../utils/roleBasedNavigation';
import { useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Car,
  Save,
  Loader2,
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  FileText,
  Calendar,
  Info,
  Download,
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

import {
  useGetFleetByIdQuery,
  useGetFleetTypesQuery,
  useUpdateFleetMutation,
  useDeleteFleetAttachmentMutation,
} from '../../../stores/api/fleetApiSlice';
import { selectCurrentUser } from '../../../stores/slices/authSlice';
import {
  formatDateForPicker,
  validateFileSize,
  getFilenameFromUrl,
  handleDownload,
  getDisplayLabel,
  isDateField,
  isNumberField,
  MAX_FILE_SIZE_MB,
} from '../utils';
import { FLEET_SECTIONS, FLEET_SELECT_OPTIONS } from '../constants';
import { fleetSchema } from '../schemas/fleetSchema';
import type { Fleet, FleetAttachment, FleetSticker } from '../types';

interface FleetFormData {
  [key: string]: any;
}

const FleetEdit: React.FC = () => {
  const { fleetId } = useParams<{ fleetId: string }>();
  const navigate = useRoleBasedNavigation();
  const user = useSelector(selectCurrentUser);
  const [attachments, setAttachments] = useState<FleetAttachment[]>([]);
  const [stickers, setStickers] = useState<FleetSticker[]>([]);
  const [downloadingFiles, setDownloadingFiles] = useState<Record<string, boolean>>({});
  const [isAddingNewSticker, setIsAddingNewSticker] = useState(false);
  console.log(fleetId,"id")
  const {
    data: fleetResponse,
    isLoading: isLoadingFleet,
    error: fleetError,
  } = useGetFleetByIdQuery(fleetId!, { skip: !fleetId });

  const { data: fleetTypesResponse, isLoading: isLoadingTypes } = useGetFleetTypesQuery();
  const [updateFleet, { isLoading: isUpdating }] = useUpdateFleetMutation();
  const [deleteAttachment] = useDeleteFleetAttachmentMutation();

  const fleet = fleetResponse?.fleet;
  const fleetTypes = fleetTypesResponse?.fleetTypes || [];

  const form = useForm<FleetFormData>({
    resolver: zodResolver(fleetSchema),
    defaultValues: {},
  });

  // Initialize form data when fleet is loaded
  useEffect(() => {
    if (fleet) {
      const formData: FleetFormData = {
        fleetType: fleet.fleetType || '',
        plateNumber: fleet.plateNumber || '',
        plateType: fleet.plateType || '',
        ownerName: fleet.ownerName || '',
        ownerID: fleet.ownerID || '',
        nationality: fleet.nationality || '',
        hourlyRate: fleet.hourlyRate || '',
        firstRegistrationDate: formatDateForPicker(fleet.firstRegistrationDate),
        registrationRenewalDate: formatDateForPicker(fleet.registrationRenewalDate),
        registrationExpiryDate: formatDateForPicker(fleet.registrationExpiryDate),
        fahesDate: formatDateForPicker(fleet.fahesDate),
        fahesReportUrl: fleet.fahesReportUrl || '',
        vehicleName: fleet.vehicleName || '',
        vehicleModel: fleet.vehicleModel || '',
        madeIn: fleet.madeIn || '',
        productionDate: formatDateForPicker(fleet.productionDate),
        shape: fleet.shape || '',
        noOfCylinders: fleet.noOfCylinders || '',
        numberOfDoors: fleet.numberOfDoors || '',
        weight: fleet.weight || '',
        grossWeight: fleet.grossWeight || '',
        color: fleet.color || '',
        subColor: fleet.subColor || '',
        chassisNumber: fleet.chassisNumber || '',
        engineNumber: fleet.engineNumber || '',
        insurer: fleet.insurer || '',
        insurancePolicy: fleet.insurancePolicy || '',
        insuranceExpiryDate: formatDateForPicker(fleet.insuranceExpiryDate),
        ownershipType: fleet.ownershipType || '',
        insuranceType: fleet.insuranceType || '',
        tpcInspectionAs: fleet.tpcInspectionAs || '',
        tpcExpiryDate: formatDateForPicker(fleet.tpcExpiryDate),
        thirdPartyCertificateCo: fleet.thirdPartyCertificateCo || '',
        inspectionDate: formatDateForPicker(fleet.inspectionDate),
        inspectionExpiryDate: formatDateForPicker(fleet.inspectionExpiryDate),
        inspectionType: fleet.inspectionType || '',
        dateOfLastExamination: formatDateForPicker(fleet.dateOfLastExamination),
        dateOfNextExamination: formatDateForPicker(fleet.dateOfNextExamination),
      };

      form.reset(formData);

      // Initialize attachments
      const initialAttachments = fleet.fleetAttachments?.map((att) => ({
        file: null,
        comment: att.comment || '',
        url: att.fileUrl || '',
        attachmentId: att.id || '',
      })) || [];
      setAttachments(initialAttachments);

      // Initialize stickers
      const initialStickers = fleet.stickers?.map((sticker) => ({
        siteInspectionStickerIssueDate: formatDateForPicker(sticker.siteInspectionStickerIssueDate),
        siteInspectionStickerExpiryDate: formatDateForPicker(sticker.siteInspectionStickerExpiryDate),
        siteInspectionStickerAttachment: null,
        siteInspectionStickerAttachmentUrl: sticker.fileUrl || '',
        siteInspectionStickerAttachmentName: sticker.fileName || '',
        isCreated: true,
        stickerId: sticker.id || '',
      })) || [];
      setStickers(initialStickers);
    }
  }, [fleet, form]);

  const handleBack = () => {
    navigate('/fleet');
  };

  const onSubmit = async (data: FleetFormData) => {
    try {
      const formData = new FormData();

      // Add form fields
      Object.keys(data).forEach((key) => {
        if (key !== 'fahesReport' && key !== 'fahesReportUrl') {
          if (isNumberField(key)) {
            formData.append(key, data[key] ? parseFloat(data[key]).toString() : '');
          } else {
            formData.append(key, data[key] || '');
          }
        }
      });

      // Add file if uploaded
      if (data.fahesReport) {
        formData.append('fahesReport', data.fahesReport);
      }

      // Add attachments
      attachments.forEach((attachment, index) => {
        if (attachment.file) {
          formData.append(`attachments[${index}][file]`, attachment.file);
          formData.append(`attachments[${index}][comment]`, attachment.comment || '');
        } else if (attachment.url) {
          formData.append(`existingAttachments[${index}][url]`, attachment.url);
          formData.append(`existingAttachments[${index}][comment]`, attachment.comment || '');
          if (attachment.attachmentId) {
            formData.append(`existingAttachments[${index}][attachmentId]`, attachment.attachmentId);
          }
        }
      });

      // Add stickers
      stickers.forEach((sticker, index) => {
        if (sticker.siteInspectionStickerAttachment) {
          formData.append(`stickers[${index}][file]`, sticker.siteInspectionStickerAttachment);
        } else if (sticker.siteInspectionStickerAttachmentUrl) {
          formData.append(`stickers[${index}][url]`, sticker.siteInspectionStickerAttachmentUrl);
        }
        formData.append(`stickers[${index}][siteInspectionStickerIssueDate]`, sticker.siteInspectionStickerIssueDate || '');
        formData.append(`stickers[${index}][siteInspectionStickerExpiryDate]`, sticker.siteInspectionStickerExpiryDate || '');
        formData.append(`stickers[${index}][isCreated]`, (index === stickers.length - 1 && isAddingNewSticker) ? 'true' : (sticker.isCreated ? 'true' : 'false'));
        if (sticker.stickerId) {
          formData.append(`stickers[${index}][stickerId]`, sticker.stickerId);
        }
      });

      const result = await updateFleet({ id: id!, data: formData }).unwrap();
      toast.success(result.message || 'Fleet updated successfully');
      handleBack();
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error?.data?.error || 'Failed to update fleet');
    }
  };

  const handleAttachmentChange = (index: number, file: File | null) => {
    if (file && !validateFileSize(file)) return;
    
    setAttachments(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], file, url: '', attachmentId: '' };
      return updated;
    });
  };

  const handleAttachmentCommentChange = (index: number, comment: string) => {
    setAttachments(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], comment };
      return updated;
    });
  };

  const addAttachment = () => {
    setAttachments(prev => [...prev, { file: null, comment: '', url: '', attachmentId: '' }]);
  };

  const removeAttachment = async (index: number) => {
    const attachment = attachments[index];
    if (attachment.attachmentId) {
      try {
        await deleteAttachment(attachment.attachmentId).unwrap();
        toast.success('Attachment removed successfully');
      } catch (error: any) {
        toast.error(error?.data?.error || 'Failed to remove attachment');
        return;
      }
    }
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleStickerChange = (index: number, field: keyof FleetSticker, value: any) => {
    if (field === 'siteInspectionStickerAttachment' && value && !validateFileSize(value)) {
      return;
    }
    
    setStickers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === 'siteInspectionStickerAttachment' && value) {
        updated[index].siteInspectionStickerAttachmentName = value.name;
      }
      return updated;
    });
  };

  const addSticker = () => {
    setIsAddingNewSticker(true);
    setStickers(prev => [...prev, {
      siteInspectionStickerIssueDate: '',
      siteInspectionStickerExpiryDate: '',
      siteInspectionStickerAttachment: null,
      siteInspectionStickerAttachmentUrl: '',
      siteInspectionStickerAttachmentName: '',
      isCreated: true,
    }]);
  };

  if (isLoadingFleet || isLoadingTypes) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading fleet data...</span>
        </div>
      </div>
    );
  }

  if (fleetError || !fleet) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Failed to load fleet data. Please try again.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={handleBack} variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Fleet List
          </Button>
        </div>
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
              <Car className="h-8 w-8 mr-3 text-primary" />
              Edit Fleet
            </h1>
            <p className="text-muted-foreground mt-1">
              Update fleet information and manage attachments
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Fleet Information Sections */}
          {Object.entries(FLEET_SECTIONS).map(([sectionName, fields]) => (
            <Card key={sectionName}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  {sectionName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {fields.map((fieldName) => (
                    <FormField
                      key={fieldName}
                      control={form.control}
                      name={fieldName}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            {isDateField(fieldName) && <Calendar className="h-4 w-4 mr-2" />}
                            {getDisplayLabel(fieldName)}
                          </FormLabel>
                          <FormControl>
                            {fieldName === 'fleetType' ? (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select fleet type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {fleetTypes.map((type) => (
                                    <SelectItem key={type.fleetTypeId} value={type.fleetTypeId}>
                                      {type.fleetType}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : fieldName === 'insuranceType' ? (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select insurance type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {FLEET_SELECT_OPTIONS.insuranceType.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : fieldName === 'thirdPartyCertificateCo' ? (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select certificate company" />
                                </SelectTrigger>
                                <SelectContent>
                                  {FLEET_SELECT_OPTIONS.thirdPartyCertificateCo.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : fieldName === 'inspectionType' ? (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select inspection type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {FLEET_SELECT_OPTIONS.inspectionType.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : fieldName === 'fahesReport' ? (
                              <div className="space-y-2">
                                <Input
                                  type="file"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file && validateFileSize(file)) {
                                      field.onChange(file);
                                    } else {
                                      e.target.value = '';
                                    }
                                  }}
                                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                />
                                <FormDescription>
                                  Max file size: {MAX_FILE_SIZE_MB}MB
                                </FormDescription>
                                {form.getValues('fahesReportUrl') && (
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDownload(form.getValues('fahesReportUrl'), 'fahes-report', setDownloadingFiles, 'fahes')}
                                      disabled={downloadingFiles.fahes}
                                    >
                                      {downloadingFiles.fahes ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Download className="h-4 w-4" />
                                      )}
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                      {getFilenameFromUrl(form.getValues('fahesReportUrl'))}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <Input
                                {...field}
                                type={isDateField(fieldName) ? 'date' : isNumberField(fieldName) ? 'number' : 'text'}
                                placeholder={`Enter ${getDisplayLabel(fieldName).toLowerCase()}`}
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Stickers Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Stickers
                </div>
                <Button type="button" onClick={addSticker} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sticker
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {stickers.map((sticker, index) => (
                <Card key={index} className="border-2 border-dashed">
                  <CardHeader>
                    <CardTitle className="text-lg">Sticker {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Issue Date</Label>
                        <Input
                          type="date"
                          value={sticker.siteInspectionStickerIssueDate}
                          onChange={(e) => handleStickerChange(index, 'siteInspectionStickerIssueDate', e.target.value)}
                          disabled={sticker.isCreated && index < stickers.length - 1}
                        />
                      </div>
                      <div>
                        <Label>Expiry Date</Label>
                        <Input
                          type="date"
                          value={sticker.siteInspectionStickerExpiryDate}
                          onChange={(e) => handleStickerChange(index, 'siteInspectionStickerExpiryDate', e.target.value)}
                          disabled={sticker.isCreated && index < stickers.length - 1}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Sticker Attachment</Label>
                        <Input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleStickerChange(index, 'siteInspectionStickerAttachment', file);
                            }
                          }}
                          disabled={sticker.isCreated && index < stickers.length - 1}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                        {sticker.siteInspectionStickerAttachmentUrl && (
                          <div className="flex items-center space-x-2 mt-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(
                                sticker.siteInspectionStickerAttachmentUrl!,
                                sticker.siteInspectionStickerAttachmentName || 'sticker',
                                setDownloadingFiles,
                                `sticker-${index}`
                              )}
                              disabled={downloadingFiles[`sticker-${index}`]}
                            >
                              {downloadingFiles[`sticker-${index}`] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </Button>
                            <span className="text-sm text-muted-foreground">
                              {getFilenameFromUrl(sticker.siteInspectionStickerAttachmentUrl, sticker.siteInspectionStickerAttachmentName)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Attachments Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Attachments
                </div>
                <Button type="button" onClick={addAttachment} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Attachment
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {attachments.map((attachment, index) => (
                <Card key={index} className="border-2 border-dashed">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                      <div>
                        <Label>File</Label>
                        <Input
                          type="file"
                          onChange={(e) => handleAttachmentChange(index, e.target.files?.[0] || null)}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                        {attachment.url && (
                          <div className="flex items-center space-x-2 mt-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(attachment.url!, getFilenameFromUrl(attachment.url!), setDownloadingFiles, `attachment-${index}`)}
                              disabled={downloadingFiles[`attachment-${index}`]}
                            >
                              {downloadingFiles[`attachment-${index}`] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </Button>
                            <span className="text-sm text-muted-foreground">
                              {getFilenameFromUrl(attachment.url!)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={attachment.comment}
                          onChange={(e) => handleAttachmentCommentChange(index, e.target.value)}
                          placeholder="Enter description"
                          rows={2}
                        />
                      </div>
                      <div>
                        <Button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button type="button" onClick={handleBack} variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating} className="bg-primary hover:bg-primary/90">
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Fleet
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default FleetEdit;
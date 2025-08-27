import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
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
import { toast } from 'sonner';

import {
  useGetFleetTypesQuery,
  useCreateFleetMutation,
} from '../../../stores/api/fleetApiSlice';
import { selectCurrentUser } from '../../../stores/slices/authSlice';
import {
  validateFileSize,
  getDisplayLabel,
  isDateField,
  isNumberField,
  MAX_FILE_SIZE_MB,
} from '../utils';
import { FLEET_SECTIONS, FLEET_SELECT_OPTIONS } from '../constants';
import { fleetSchema } from '../schemas/fleetSchema';
import type { FleetAttachment, FleetSticker } from '../types';

interface FleetFormData {
  [key: string]: any;
}

const FleetCreate: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [attachments, setAttachments] = useState<FleetAttachment[]>([]);
  const [stickers, setStickers] = useState<FleetSticker[]>([]);

  const { data: fleetTypesResponse, isLoading: isLoadingTypes } = useGetFleetTypesQuery();
  const [createFleet, { isLoading: isCreating }] = useCreateFleetMutation();

  const fleetTypes = fleetTypesResponse?.fleetTypes || [];

  const form = useForm<FleetFormData>({
    resolver: zodResolver(fleetSchema),
    defaultValues: {
      fleetType: '',
      plateNumber: '',
      plateType: '',
      ownerName: '',
      ownerID: '',
      nationality: '',
      hourlyRate:0,
      firstRegistrationDate: '',
      registrationRenewalDate: '',
      registrationExpiryDate: '',
      fahesDate: '',
      fahesReportUrl: '',
      vehicleName: '',
      vehicleModel: '',
      madeIn: '',
      productionDate: '',
      shape: '',
      noOfCylinders: '',
      numberOfDoors: '',
      weight: '',
      grossWeight: '',
      color: '',
      subColor: '',
      chassisNumber: '',
      engineNumber: '',
      insurer: '',
      insurancePolicy: '',
      insuranceExpiryDate: '',
      ownershipType: '',
      insuranceType: '',
      tpcInspectionAs: '',
      tpcExpiryDate: '',
      thirdPartyCertificateCo: '',
      inspectionDate: '',
      inspectionExpiryDate: '',
      inspectionType: '',
      dateOfLastExamination: '',
      dateOfNextExamination: '',
    },
  });

  const handleBack = () => {
    const role = user?.Role?.roleName?.toLowerCase() || 'administrative';
    navigate(`/${role}/fleet`);
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
        }
      });

      // Add stickers
      stickers.forEach((sticker, index) => {
        if (sticker.siteInspectionStickerAttachment) {
          formData.append(`stickers[${index}][file]`, sticker.siteInspectionStickerAttachment);
        }
        formData.append(`stickers[${index}][siteInspectionStickerIssueDate]`, sticker.siteInspectionStickerIssueDate || '');
        formData.append(`stickers[${index}][siteInspectionStickerExpiryDate]`, sticker.siteInspectionStickerExpiryDate || '');
      });

      const result = await createFleet(formData).unwrap();
      toast.success(result.message || 'Fleet created successfully');
      handleBack();
    } catch (error: any) {
      console.error('Create error:', error);
      toast.error(error?.data?.error || 'Failed to create fleet');
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

  const removeAttachment = (index: number) => {
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
    setStickers(prev => [...prev, {
      siteInspectionStickerIssueDate: '',
      siteInspectionStickerExpiryDate: '',
      siteInspectionStickerAttachment: null,
      siteInspectionStickerAttachmentUrl: '',
      siteInspectionStickerAttachmentName: '',
      isCreated: false,
    }]);
  };

  const removeSticker = (index: number) => {
    setStickers(prev => prev.filter((_, i) => i !== index));
  };

  if (isLoadingTypes) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading fleet types...</span>
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
              Create New Fleet
            </h1>
            <p className="text-muted-foreground mt-1">
              Add new fleet information and manage attachments
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
                    <CardTitle className="text-lg flex items-center justify-between">
                      Sticker {index + 1}
                      <Button
                        type="button"
                        onClick={() => removeSticker(index)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Issue Date</Label>
                        <Input
                          type="date"
                          value={sticker.siteInspectionStickerIssueDate}
                          onChange={(e) => handleStickerChange(index, 'siteInspectionStickerIssueDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Expiry Date</Label>
                        <Input
                          type="date"
                          value={sticker.siteInspectionStickerExpiryDate}
                          onChange={(e) => handleStickerChange(index, 'siteInspectionStickerExpiryDate', e.target.value)}
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
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
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
            <Button type="submit" disabled={isCreating} className="bg-primary hover:bg-primary/90">
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Fleet
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default FleetCreate;
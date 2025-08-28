import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRoleBasedNavigation } from '../../../utils/roleBasedNavigation';
import { useSelector } from 'react-redux';
import {
  Car,
  IdCard,
  Calendar,
  FileText,
  Download,
  Info,
  Upload,
  DollarSign,
  File,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

import { useGetFleetByIdQuery, useGetFleetTypesQuery } from '../../../stores/api/fleetApiSlice';
import {
  EditButton,
  PermissionModule,
} from '../../../components/permissions';
import { selectCurrentUser } from '../../../stores/slices/authSlice';
import { formatDate, getFilenameFromUrl, handleDownload } from '../utils';
import {
  INSURANCE_TYPE_LABELS,
  THIRD_PARTY_CERTIFICATE_LABELS,
  TPC_INSPECTION_LABELS,
} from '../constants';
import type { Fleet, FleetType } from '../types';

const FleetView: React.FC = () => {
  const { fleetId } = useParams<{ fleetId: string }>();
  const navigate = useRoleBasedNavigation();
  const user = useSelector(selectCurrentUser);
  const [downloadingFiles, setDownloadingFiles] = useState<Record<string, boolean>>({});

  const {
    data: fleetResponse,
    isLoading,
    error,
    refetch,
  } = useGetFleetByIdQuery(fleetId!, {
    skip: !fleetId,
  });

  const { data: fleetTypesResponse } = useGetFleetTypesQuery();

  const fleet = fleetResponse?.fleet;
  const fleetTypes = fleetTypesResponse?.fleetTypes || [];

  useEffect(() => {
    if (error) {
      toast.error('Failed to load fleet details');
    }
  }, [error]);

  const getFleetTypeLabel = (fleetTypeId?: string): string => {
    if (!fleetTypeId) return 'N/A';
    const fleetType = fleetTypes.find((type: FleetType) => type.fleetTypeId === fleetTypeId);
    return fleetType ? fleetType.fleetType : 'N/A';
  };

  const handleDownloadSticker = async (fileUrl: string, fileName: string) => {
    try {
      await handleDownload(fileUrl, fileName, setDownloadingFiles, `sticker-${fileName}`);
    } catch (error) {
      console.error('Failed to download sticker:', error);
      toast.error('Failed to download sticker');
    }
  };

  const handleBack = () => {
    navigate('/fleet');
  };

  const handleEdit = () => {
    navigate(`/fleet/edit/${fleetId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading fleet details...</span>
        </div>
      </div>
    );
  }

  if (error || !fleet) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Failed to load fleet details. Please try again.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
          <Button onClick={handleBack} variant="ghost" className="ml-2">
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
              Fleet Details
            </h1>
            <p className="text-muted-foreground mt-1">
              View comprehensive information about {fleet.vehicleName || 'this fleet'}
            </p>
          </div>
        </div>
        <EditButton module={PermissionModule.Fleet} onClick={handleEdit} className="bg-primary hover:bg-primary/90">
          Edit Fleet
        </EditButton>
      </div>

      {/* Fleet Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fleet Profile */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="h-5 w-5 mr-2" />
              Fleet Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-sm font-semibold">{fleet.vehicleName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Model</label>
                <p className="text-sm">{fleet.vehicleModel || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Type</label>
                <p className="text-sm">{getFleetTypeLabel(fleet.fleetTypeId)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Badge variant={fleet.status === 'active' ? 'default' : 'secondary'}>
                  {fleet.status || 'N/A'}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Plate Number</label>
                <p className="text-sm font-mono">{fleet.plateNumber || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Owner</label>
                <p className="text-sm">{fleet.ownerName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nationality</label>
                <p className="text-sm">{fleet.nationality || 'N/A'}</p>
              </div>
              {fleet.hourlyRate && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Hourly Rate</label>
                  <p className="text-sm font-semibold flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {fleet.hourlyRate}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="h-5 w-5 mr-2" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Registration Date</label>
                  <p className="text-sm flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(fleet.firstRegistrationDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Renewal Date</label>
                  <p className="text-sm flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(fleet.registrationRenewalDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Expiry Date</label>
                  <p className="text-sm flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(fleet.registrationExpiryDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Production Date</label>
                  <p className="text-sm flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(fleet.productionDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Shape</label>
                  <p className="text-sm">{fleet.shape || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Color</label>
                  <p className="text-sm">{fleet.color || 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sub Color</label>
                  <p className="text-sm">{fleet.subColor || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Chassis Number</label>
                  <p className="text-sm font-mono">{fleet.chassisNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Engine Number</label>
                  <p className="text-sm font-mono">{fleet.engineNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Insurance Type</label>
                  <p className="text-sm">
                    {fleet.insuranceType ? INSURANCE_TYPE_LABELS[fleet.insuranceType as keyof typeof INSURANCE_TYPE_LABELS] || fleet.insuranceType : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Insurance Expiry</label>
                  <p className="text-sm flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(fleet.insuranceExpiryDate)}
                  </p>
                </div>
                {fleet.weight && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Weight</label>
                    <p className="text-sm">{fleet.weight} kg</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attachments */}
      {fleet.fleetAttachments && fleet.fleetAttachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Attachments
            </CardTitle>
            <CardDescription>
              Documents and files related to this fleet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fleet.fleetAttachments.map((attachment, index) => (
                <Card key={index} className="border-2 border-dashed border-muted hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-primary" />
                        <span className="text-sm font-medium">Attachment {index + 1}</span>
                      </div>
                    </div>
                    {attachment.fileUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mb-2"
                        onClick={() => window.open(attachment.fileUrl, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {getFilenameFromUrl(attachment.fileUrl)}
                      </Button>
                    )}
                    {attachment.comment && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Description</label>
                        <p className="text-sm text-muted-foreground mt-1">{attachment.comment}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stickers */}
      {fleet.stickers && fleet.stickers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <File className="h-5 w-5 mr-2" />
              Stickers
            </CardTitle>
            <CardDescription>
              Site inspection stickers and certificates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fleet.stickers.map((sticker, index) => (
                <Card key={sticker.id || index} className="border-2 border-dashed border-muted hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <File className="h-4 w-4 mr-2 text-primary" />
                        <span className="text-sm font-medium">{sticker.fileName || 'Unknown'}</span>
                      </div>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Issue Date</label>
                        <p className="text-sm">{formatDate(sticker.siteInspectionStickerIssueDate)}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Expiry Date</label>
                        <p className="text-sm">{formatDate(sticker.siteInspectionStickerExpiryDate)}</p>
                      </div>
                    </div>
                    {sticker.fileUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleDownloadSticker(sticker.fileUrl!, sticker.fileName || 'sticker')}
                        disabled={downloadingFiles[`sticker-${sticker.fileName}`]}
                      >
                        {downloadingFiles[`sticker-${sticker.fileName}`] ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Download
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No attachments or stickers message */}
      {(!fleet.fleetAttachments || fleet.fleetAttachments.length === 0) &&
        (!fleet.stickers || fleet.stickers.length === 0) && (
          <Card>
            <CardContent className="p-8 text-center">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No attachments or stickers</h3>
              <p className="text-muted-foreground mb-4">
                This fleet doesn't have any attachments or stickers uploaded yet.
              </p>
              <Button onClick={handleEdit} variant="outline">
                Add Attachments
              </Button>
            </CardContent>
          </Card>
        )}
    </div>
  );
};

export default FleetView;
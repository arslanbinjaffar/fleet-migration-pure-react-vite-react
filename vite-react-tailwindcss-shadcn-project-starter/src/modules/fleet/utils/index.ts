// Fleet utility functions
import { toast } from 'sonner';

export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const formatDateForPicker = (date?: string | Date): string => {
  if (!date) return '';
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return '';
    return parsedDate.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

export const formatDate = (date?: string | Date): string => {
  if (!date) return 'N/A';
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return 'N/A';
    return parsedDate.toLocaleDateString();
  } catch {
    return 'N/A';
  }
};

export const validateFileSize = (file: File): boolean => {
  if (file && file.size > MAX_FILE_SIZE_BYTES) {
    toast.error(`File size should be less than ${MAX_FILE_SIZE_MB}MB`);
    return false;
  }
  return true;
};

export const getFilenameFromUrl = (url?: string, fallback?: string): string => {
  if (!url) return fallback || 'N/A';
  try {
    const decodedUrl = decodeURIComponent(url);
    return decodedUrl.split('/').pop() || fallback || 'Unknown';
  } catch {
    return url.split('/').pop() || fallback || 'Unknown';
  }
};

export const handleDownload = async (
  fileUrl: string,
  filename?: string,
  setDownloadingFiles?: (fn: (prev: Record<string, boolean>) => Record<string, boolean>) => void,
  fileType?: string
): Promise<void> => {
  if (!fileUrl) return;

  const downloadFilename = filename || getFilenameFromUrl(fileUrl);
  
  if (setDownloadingFiles && fileType) {
    setDownloadingFiles((prev) => ({ ...prev, [fileType]: true }));
  }

  try {
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error('Download failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', downloadFilename);
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('Download error:', error);
    toast.error('Failed to download file');
    // Fallback to opening in new tab
    window.open(fileUrl, '_blank');
  } finally {
    if (setDownloadingFiles && fileType) {
      setDownloadingFiles((prev) => ({ ...prev, [fileType]: false }));
    }
  }
};

export const getDisplayLabel = (key: string): string => {
  const labelMap: Record<string, string> = {
    vehicleName: 'Fleet Name',
    vehicleModel: 'Fleet Model',
    hourlyRate: 'Avg. Hourly Rate',
    tpcInspectionAs: 'TPC Inspection As',
    tpcExpiryDate: 'TPC Expiry Date',
    thirdPartyCertificateCo: 'Third Party Certificate Co',
    siteInspectionStickerIssueDate: 'Site Inspection Sticker Issue Date',
    siteInspectionStickerExpiryDate: 'Site Inspection Sticker Expiry Date',
    siteInspectionStickerAttachment: 'Site Inspection Sticker Attachment',
  };

  return labelMap[key] || key.replace(/([A-Z])/g, ' $1').trim();
};

export const checkDateField = /^(date.*|.*date)$/i;

export const isDateField = (key: string): boolean => {
  return checkDateField.test(key) || key === 'productionDate';
};

export const isNumberField = (key: string): boolean => {
  return ['noOfCylinders', 'numberOfDoors', 'weight', 'grossWeight', 'hourlyRate'].includes(key);
};
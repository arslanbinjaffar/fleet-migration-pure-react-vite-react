import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../stores/slices/authSlice';
import useRoleNavigation from '../../../utils/useNavigation';
import { NavigationPaths } from '../../../utils/navigationPaths';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  ArrowLeft,
  Download,
  Loader2,
  FileText,
  Building,
  Calendar,
  User,
  AlertCircle,
  Sun,
  Moon,
  Palette,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

import {
  useGetLPOByIdQuery,
} from '../../../stores/api/lposApiSlice';
import { LPO, Fleet } from '../types';
import {
  formatDate,
  getStatusConfig,
  getErrorMessage,
} from '../utils';

// PDF Generation utility
const generatePDF = async (lpo: LPO, fleets: Fleet[]) => {
  // Dynamic import for html2pdf to avoid SSR issues
  const html2pdf = (await import('html2pdf.js')).default;
  
  const element = document.getElementById('agreement-content');
  if (!element) {
    throw new Error('Agreement content not found');
  }

  // Store original styles
  const originalStyles = {
    backgroundColor: element.style.backgroundColor,
    color: element.style.color,
    borderColor: element.style.borderColor,
  };

  // Apply standard PDF styles (always white background, black text)
  element.style.backgroundColor = '#ffffff';
  element.style.color = '#000000';
  element.style.fontFamily = 'Times New Roman';
  
  // Ensure all child elements have proper PDF styling
  const allElements = element.querySelectorAll('*');
  const originalChildStyles: Array<{ element: HTMLElement; styles: any }> = [];
  
  allElements.forEach((child) => {
    const htmlChild = child as HTMLElement;
    originalChildStyles.push({
      element: htmlChild,
      styles: {
        color: htmlChild.style.color,
        backgroundColor: htmlChild.style.backgroundColor,
        borderColor: htmlChild.style.borderColor,
      }
    });
    
    // Apply PDF-friendly styles
    htmlChild.style.color = '#000000';
    htmlChild.style.backgroundColor = 'transparent';
    htmlChild.style.borderColor = '#000000';
  });

  const options = {
    margin: [10, 5, 0, 5],
    filename: `LPO_${lpo.lpoNumber}_${lpo.purpose?.replace(/[^a-zA-Z0-9]/g, '_') || 'Document'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true,
      backgroundColor: '#ffffff'
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
    
    // Restore original styles
    element.style.backgroundColor = originalStyles.backgroundColor;
    element.style.color = originalStyles.color;
    element.style.borderColor = originalStyles.borderColor;
    
    // Restore child element styles
    originalChildStyles.forEach(({ element: child, styles }) => {
      child.style.color = styles.color;
      child.style.backgroundColor = styles.backgroundColor;
      child.style.borderColor = styles.borderColor;
    });
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Restore original styles even on error
    element.style.backgroundColor = originalStyles.backgroundColor;
    element.style.color = originalStyles.color;
    element.style.borderColor = originalStyles.borderColor;
    
    originalChildStyles.forEach(({ element: child, styles }) => {
      child.style.color = styles.color;
      child.style.backgroundColor = styles.backgroundColor;
      child.style.borderColor = styles.borderColor;
    });
    
    throw error;
  }
};



interface LpoPdfViewProps {
  lpoId?: string;
}

const LpoPdfView: React.FC<LpoPdfViewProps> = ({ lpoId: propLpoId }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const { roleNavigate } = useRoleNavigation();
  const { theme, toggleTheme } = useTheme();
  
  // Use prop lpoId or URL param
  const lpoId = propLpoId || id;
  
  // Local state
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('light');
  
  // API hooks
  const {
    data: lpoResponse,
    isLoading,
    error: lpoError,
  } = useGetLPOByIdQuery(lpoId!, { skip: !lpoId });
  
  // Extract data from API response
  const lpo = lpoResponse?.lpo || null;
  const fleets = lpoResponse?.fleets || [];
  
  // Error handling
  const error = lpoError ? getErrorMessage(lpoError) : null;

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-download on mobile after data is loaded
  useEffect(() => {
    if (!isLoading && lpo && isMobile) {
      handleDownloadPDF();
    }
  }, [isLoading, lpo, isMobile]);

  // Handlers
  const handleBack = () => {
    if (propLpoId) {
      // If used as embedded component, go back to LPO view
      roleNavigate(NavigationPaths.LPO.VIEW(propLpoId));
    } else {
      // If standalone page, go back to list
      roleNavigate(NavigationPaths.LPO.LIST);
    }
  };

  const handleDownloadPDF = async () => {
    if (!lpo) return;
    
    setIsGeneratingPDF(true);
    try {
      await generatePDF(lpo, fleets);
      toast.success('PDF downloaded successfully');
      
      // Navigate back on mobile after download
      if (isMobile) {
        handleBack();
      }
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error('PDF generation failed:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
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
            Back
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'LPO not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const statusConfig = getStatusConfig(lpo.status);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      previewTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header - Only show download button on non-mobile devices */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className={`text-2xl font-bold ${
                previewTheme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>{lpo.lpoNumber}</h1>
              <p className={`${
                previewTheme === 'dark' ? 'text-gray-300' : 'text-muted-foreground'
              }`}>
                PDF Preview & Download
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <div className="flex items-center space-x-1 border rounded-md p-1">
              <Button
                variant={previewTheme === 'light' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewTheme('light')}
                className="h-8 w-8 p-0"
              >
                <Sun className="h-4 w-4" />
              </Button>
              <Button
                variant={previewTheme === 'dark' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewTheme('dark')}
                className="h-8 w-8 p-0"
              >
                <Moon className="h-4 w-4" />
              </Button>
            </div>
            
            {!isMobile && (
              <Button 
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isGeneratingPDF ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isGeneratingPDF ? 'Generating...' : 'Download as PDF'}
              </Button>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          <Badge className={`${statusConfig.bgColor} ${statusConfig.color}`}>
            {statusConfig.label}
          </Badge>
        </div>

        {/* PDF Content Card */}
        <Card className={`shadow-lg transition-colors duration-200 ${
          previewTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'
        }`}>
          <CardContent className="p-8">
            {/* PDF Preview Container */}
            <div className={`rounded-lg p-6 transition-colors duration-200 ${
              previewTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Palette className="h-4 w-4" />
                  <span className={`text-sm font-medium ${
                    previewTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Preview Mode: {previewTheme === 'dark' ? 'Dark' : 'Light'}
                  </span>
                </div>
                <span className={`text-xs ${
                  previewTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  PDF will always download in standard format
                </span>
              </div>
              
              {/* Actual PDF Content - Always white background for PDF generation */}
              <div 
                id="agreement-content" 
                className={`transition-all duration-200 p-8 rounded shadow-inner ${
                  previewTheme === 'dark' 
                    ? 'bg-gray-800 text-gray-100 border border-gray-600' 
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
                style={{ fontFamily: 'Times New Roman' }}
              >
                {/* Header */}
                <div className="text-center border-b-2 border-current pb-4 mb-6">
                  <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Times New Roman' }}>
                    IMPRESSIVE TRADING & CONTRACTING CO.
                  </h1>
                  <p className="text-sm" style={{ fontFamily: 'Times New Roman' }}>
                    P.O. Box-30961, DOHA – QATAR
                  </p>
                  <p className="text-sm" style={{ fontFamily: 'Times New Roman' }}>
                    Mob. No.: 55855163
                  </p>
                </div>
              
                {/* Reference and Registration Numbers */}
                <div className="flex justify-between items-center mb-6">
                  <p className="font-bold" style={{ fontFamily: 'Times New Roman' }}>
                    Ref. No:
                    <span className="underline ml-2">
                      {lpo.referenceNumber}
                    </span>
                  </p>
                  <p className="font-bold" style={{ fontFamily: 'Times New Roman' }}>
                    REGN#
                    {fleets?.map((fleet, index) => (
                      <span key={index}> ({fleet.plateNumber})</span>
                    ))}
                  </p>
                </div>

                {/* Agreement Content */}
                <div className="space-y-4 text-justify" style={{ fontFamily: 'Times New Roman' }}>
                <p>
                  This Hire Agreement made and entered onto as of this
                  <strong> {formatDate(lpo.createdAt)}</strong>
                </p>

                <p className="font-bold text-center">
                  BY AND BETWEEN
                </p>

                <p>
                  <strong className="underline">
                    {lpo.customer?.firstname} {lpo.customer?.lastname}
                  </strong>{' '}
                  with its offices at <strong>{lpo.address}</strong>
                  <br />
                  Represented by
                  <strong className="underline ml-1">
                    {lpo.customer?.firstname} {lpo.customer?.lastname}, ({lpo.designation})
                  </strong>{' '}
                  hereinafter called FIRST PARTY.
                </p>

                <p className="font-bold text-center">
                  AND
                </p>

                <p>
                  <strong className="underline">
                    IMPRESSIVE TRADING & CONTRACTING CO.
                  </strong>{' '}
                  with its offices at P.O. Box-30961,
                  <strong className="underline"> DOHA – QATAR</strong>
                  <br />
                  <span className="block mt-2">
                    Mob. No.: 55855163 <br /> Represented by
                    <strong className="underline ml-1">
                      MUHAMMAD YOUSAF MANZOOR, (MANAGER)
                    </strong>
                    {' '}hereinafter called SECOND PARTY.
                  </span>
                </p>

                <p>
                  <strong>WHEREAS</strong> the First Party has agreed to hire,
                  {fleets?.map((fleet, index) => {
                    const hourlyRate = lpo.fleetHourlyRates?.find(r => r.fleetId === fleet.fleetId)?.hourlyRate || fleet.hourlyRate || 0;
                    return (
                      <strong key={index}>
                        {' '}{fleet.vehicleName}-{fleet.plateNumber}@{hourlyRate}/Hr
                      </strong>
                    );
                  })}
                  {' '}W/ OPERATOR
                  <span className="block mt-2">
                    from Second Party for use
                    <strong className="underline ml-1">{lpo.purpose}</strong>
                    <br />
                    under the following conditions :-
                  </span>
                </p>

                  {/* Terms and Conditions */}
                  <div className="border-t-2 border-current pt-4 mt-6">
                    {lpo.termsAndCondition ? (
                      <div 
                        dangerouslySetInnerHTML={{ __html: lpo.termsAndCondition }}
                        className={`prose max-w-none ${
                          previewTheme === 'dark' ? 'prose-invert' : ''
                        }`}
                        style={{ fontFamily: 'Times New Roman' }}
                      />
                    ) : (
                      <p style={{ fontFamily: 'Times New Roman' }}>
                        No terms and conditions available.
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Footer */}
                <div className="border-t-2 border-current pt-6 mt-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="font-bold mb-8" style={{ fontFamily: 'Times New Roman' }}>
                        FIRST PARTY
                      </p>
                      <div className="mt-16">
                        <div className="border-b-2 border-current w-48 mb-2"></div>
                        <p className="text-sm" style={{ fontFamily: 'Times New Roman' }}>
                          Signature & Stamp
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="font-bold mb-8" style={{ fontFamily: 'Times New Roman' }}>
                        SECOND PARTY
                      </p>
                      <div className="mt-16">
                        <div className="border-b-2 border-current w-48 mb-2"></div>
                        <p className="text-sm" style={{ fontFamily: 'Times New Roman' }}>
                          Signature & Stamp
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card className={`transition-colors duration-200 ${
            previewTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'
          }`}>
            <CardHeader className="pb-3">
              <CardTitle className={`flex items-center text-sm ${
                previewTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
              }`}>
                <FileText className="h-4 w-4 mr-2" />
                LPO Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={previewTheme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}>
                    Number:
                  </span>
                  <span className={`font-medium ${
                    previewTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                  }`}>{lpo.lpoNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className={previewTheme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}>
                    Reference:
                  </span>
                  <span className={`font-medium ${
                    previewTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                  }`}>{lpo.referenceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className={previewTheme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}>
                    Status:
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {lpo.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`transition-colors duration-200 ${
            previewTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'
          }`}>
            <CardHeader className="pb-3">
              <CardTitle className={`flex items-center text-sm ${
                previewTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
              }`}>
                <Calendar className="h-4 w-4 mr-2" />
                Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={previewTheme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}>
                    Start:
                  </span>
                  <span className={`font-medium ${
                    previewTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                  }`}>{formatDate(lpo.lpoStartDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={previewTheme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}>
                    End:
                  </span>
                  <span className={`font-medium ${
                    previewTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                  }`}>{formatDate(lpo.lpoEndDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={previewTheme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}>
                    Created:
                  </span>
                  <span className={`font-medium ${
                    previewTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                  }`}>{formatDate(lpo.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`transition-colors duration-200 ${
            previewTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'
          }`}>
            <CardHeader className="pb-3">
              <CardTitle className={`flex items-center text-sm ${
                previewTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
              }`}>
                <User className="h-4 w-4 mr-2" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className={previewTheme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}>
                    Name:
                  </span>
                  <p className={`font-medium ${
                    previewTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    {lpo.customer?.firstname} {lpo.customer?.lastname}
                  </p>
                </div>
                <div>
                  <span className={previewTheme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}>
                    Designation:
                  </span>
                  <p className={`font-medium ${
                    previewTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                  }`}>{lpo.designation}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LpoPdfView;
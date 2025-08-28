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
  const html2pdf = (await import('html2pdf.js')).default;
  
  const element = document.getElementById('agreement-content');
  if (!element) {
    throw new Error('Agreement content not found');
  }

  // Store original styles
  const originalStyles = {
    backgroundColor: element.style.backgroundColor,
    color: element.style.color,
    fontFamily: element.style.fontFamily,
  };

  // Apply PDF styles to match old project
  element.style.backgroundColor = '#ffffff';
  element.style.color = '#000000';
  element.style.fontFamily = 'Times New Roman, Times, serif';

  // Ensure all child elements inherit the font and color
  const allElements = element.querySelectorAll('*');
  const originalChildStyles: Array<{ element: HTMLElement; styles: any }> = [];
  
  allElements.forEach((child) => {
    const htmlChild = child as HTMLElement;
    originalChildStyles.push({
      element: htmlChild,
      styles: {
        color: htmlChild.style.color,
        backgroundColor: htmlChild.style.backgroundColor,
        fontFamily: htmlChild.style.fontFamily,
      },
    });
    
    htmlChild.style.color = '#000000';
    htmlChild.style.backgroundColor = 'transparent';
    htmlChild.style.fontFamily = 'Times New Roman, Times, serif';
  });

  const options = {
    margin: [10, 5, 0, 5],
    filename: `${lpo.purpose || 'LPO_Document'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
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
    element.style.fontFamily = originalStyles.fontFamily;
    
    originalChildStyles.forEach(({ element: child, styles }) => {
      child.style.color = styles.color;
      child.style.backgroundColor = styles.backgroundColor;
      child.style.fontFamily = styles.fontFamily;
    });
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Restore original styles on error
    element.style.backgroundColor = originalStyles.backgroundColor;
    element.style.color = originalStyles.color;
    element.style.fontFamily = originalStyles.fontFamily;
    
    originalChildStyles.forEach(({ element: child, styles }) => {
      child.style.color = styles.color;
      child.style.backgroundColor = styles.backgroundColor;
      child.style.fontFamily = styles.fontFamily;
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
  
  const lpoId = propLpoId || id;
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('light');
  
  const {
    data: lpoResponse,
    isLoading,
    error: lpoError,
  } = useGetLPOByIdQuery(lpoId!, { skip: !lpoId });
  
  const lpo = lpoResponse?.lpo || null;
  const fleets = lpoResponse?.siteProjectFleets || [];
  const error = lpoError ? getErrorMessage(lpoError) : null;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isLoading && lpo && isMobile) {
      handleDownloadPDF();
    }
  }, [isLoading, lpo, isMobile]);

  const handleBack = () => {
    if (propLpoId) {
      roleNavigate(NavigationPaths.LPO.VIEW(propLpoId));
    } else {
      roleNavigate(NavigationPaths.LPO.LIST);
    }
  };

  const handleDownloadPDF = async () => {
    if (!lpo) return;
    
    setIsGeneratingPDF(true);
    try {
      await generatePDF(lpo, fleets);
      toast.success('PDF downloaded successfully');
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
    <div className={`min-h-screen transition-colors duration-200 ${previewTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className={`text-2xl font-bold ${previewTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {lpo.lpoNumber}
              </h1>
              <p className={`${previewTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                PDF Preview & Download
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
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

        <div className="mb-6">
          <Badge className={`${statusConfig.bgColor} ${statusConfig.color}`}>
            {statusConfig.label}
          </Badge>
        </div>

        <Card className={`shadow-lg transition-colors duration-200 ${previewTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardContent className="p-8">
            <div className={`rounded-lg p-6 transition-colors duration-200 ${previewTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Palette className="h-4 w-4" />
                  <span className={`text-sm font-medium ${previewTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    Preview Mode: {previewTheme === 'dark' ? 'Dark' : 'Light'}
                  </span>
                </div>
                <span className={`text-xs ${previewTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  PDF will always download in standard format
                </span>
              </div>
              
              <div 
                id="agreement-content" 
                className={`p-8 rounded shadow-inner ${previewTheme === 'dark' ? 'bg-gray-800 text-gray-100 border border-gray-600' : 'bg-white text-gray-900 border border-gray-200'}`}
                style={{ fontFamily: 'Times New Roman, Times, serif' }}
              >
                <div className='relative' style={{ textAlign: 'center', marginBottom: '20px', fontFamily: 'Times New Roman, Times, serif' }}>
                  <h1 style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'Times New Roman, Times, serif' }}>
                    IMPRESSIVE TRADING & CONTRACTING CO.
                  </h1>
                  <p style={{ fontSize: '14px', fontFamily: 'Times New Roman, Times, serif' }}>
                    P.O. Box-30961, DOHA – QATAR
                  </p>
                  <p style={{ fontSize: '14px', fontFamily: 'Times New Roman, Times, serif' }}>
                    Mob. No.: 55855163
                  </p>
                  <img className='absolute top-3 right-0' src="/assets/logos/agreement2.png" alt="Agreement Logo" style={{ width: '100px', height: 'auto' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', fontFamily: 'Times New Roman, Times, serif' }}>
                  <p style={{ fontWeight: 'bold', fontFamily: 'Times New Roman, Times, serif' }}>
                    Ref. No: <span style={{ textDecoration: 'underline' }}>{lpo.referenceNumber}</span>
                  </p>
                  <p style={{ fontWeight: 'bold', fontFamily: 'Times New Roman, Times, serif' }}>
                    REGN#
                    {fleets?.map((item, index) => (
                      <span key={index}>{` (${item?.fleet.plateNumber})`}</span>
                    ))}
                  </p>
                </div>

                <p style={{ marginTop: '20px', fontFamily: 'Times New Roman, Times, serif' }}>
                  This Hire Agreement made and entered onto as of this
                  <strong> {formatDate(lpo.createdAt)}</strong>
                </p>

                <p style={{ marginTop: '20px', fontWeight: 'bold', textAlign: 'center', fontFamily: 'Times New Roman, Times, serif' }}>
                  BY AND BETWEEN
                </p>

                <p style={{ marginTop: '20px', fontFamily: 'Times New Roman, Times, serif' }}>
                  <strong style={{ textDecoration: 'underline' }}>{lpo.customer?.title}</strong> with its offices at <strong>{lpo.address}</strong>
                  <br />
                  Represented by
                  <strong style={{ textDecoration: 'underline' }}>
                    {lpo.customer?.firstname} {lpo.customer?.lastname}, ({lpo.designation})
                  </strong> here in after called FIRST PARTY.
                </p>

                <p style={{ marginTop: '20px', fontWeight: 'bold', textAlign: 'center', fontFamily: 'Times New Roman, Times, serif' }}>
                  AND
                </p>

                <p style={{ marginTop: '20px', fontFamily: 'Times New Roman, Times, serif' }}>
                  <strong style={{ textDecoration: 'underline' }}>IMPRESSIVE TRADING & CONTRACTING CO.</strong> with its offices at P.O. Box-30961,
                  <strong style={{ textDecoration: 'underline' }}>DOHA – QATAR</strong>
                  <p style={{ fontFamily: 'Times New Roman, Times, serif' }}>
                    Mob. No.: 55855163 <br />
                    Represented by
                    <strong style={{ textDecoration: 'underline' }}>MUHAMMAD YOUSAF MANZOOR, (MANAGER)</strong>
                    hereinafter called SECOND PARTY.
                  </p>
                </p>

                <p style={{ marginTop: '20px', fontFamily: 'Times New Roman, Times, serif' }}>
                  <strong>WHEREAS</strong> the First Party has agreed to hire,
                  {fleets?.map((item, index) => {
                    const hourlyRate = lpo.fleetHourlyRates?.find(r => r.fleetId === item?.fleet.fleetId)?.hourlyRate || item?.fleet.hourlyRate || 0;
                    return (
                      <strong key={index}>
                        {item?.fleet.vehicleName}-{item?.fleet.plateNumber}@{hourlyRate}/Hr
                      </strong>
                    );
                  })}
                  W/ OPERATOR
                  <p style={{ fontFamily: 'Times New Roman, Times, serif' }}>
                    from Second Party for use
                    <strong style={{ textDecoration: 'underline' }}>{lpo.purpose}</strong>
                    <br />
                    under the following conditions :-
                  </p>
                </p>

                {lpo.termsAndCondition ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: lpo.termsAndCondition }}
                    style={{ marginTop: '20px', fontFamily: 'Times New Roman, Times, serif' }}
                  />
                ) : (
                  <p style={{ fontFamily: 'Times New Roman, Times, serif' }}>
                    No terms and conditions available.
                  </p>
                )}

                <div style={{ marginTop: '40px', fontFamily: 'Times New Roman, Times, serif' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontWeight: 'bold', marginBottom: '60px', fontFamily: 'Times New Roman, Times, serif' }}>For and on behalf of</p>
                      <div style={{ borderBottom: '2px solid black', width: '200px', marginBottom: '10px' }}>CONSOLIDATED CONTRACTORS' GROUP S.A.L</div>
                      
                      <p style={{ fontSize: '12px', fontFamily: 'Times New Roman, Times, serif' }}>Signature & Stamp</p>
                    </div>
                    <div>
                      <p style={{ fontWeight: 'bold', marginBottom: '60px', fontFamily: 'Times New Roman, Times, serif' }}>For and on behalf of</p>
                      <div style={{ borderBottom: '2px solid black', width: '200px', marginBottom: '10px' }}>IMPRESSIVE TRADING & CONSTRUCTING CO.</div>
                      <p style={{ fontSize: '12px', fontFamily: 'Times New Roman, Times, serif' }}>Signature & Stamp</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card className={`shadow-lg transition-colors duration-200 ${previewTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardHeader className="pb-3">
              <CardTitle className={`flex items-center text-sm ${previewTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                <FileText className="h-4 w-4 mr-2" />
                LPO Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={previewTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Number:</span>
                  <span className={`font-medium ${previewTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{lpo.lpoNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className={previewTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Reference:</span>
                  <span className={`font-medium ${previewTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{lpo.referenceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className={previewTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Status:</span>
                  <Badge variant="outline" className="text-xs">{lpo.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`shadow-lg transition-colors duration-200 ${previewTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardHeader className="pb-3">
              <CardTitle className={`flex items-center text-sm ${previewTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                <Calendar className="h-4 w-4 mr-2" />
                Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={previewTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Start:</span>
                  <span className={`font-medium ${previewTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{formatDate(lpo.lpoStartDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={previewTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>End:</span>
                  <span className={`font-medium ${previewTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{formatDate(lpo.lpoEndDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={previewTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Created:</span>
                  <span className={`font-medium ${previewTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{formatDate(lpo.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`shadow-lg transition-colors duration-200 ${previewTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardHeader className="pb-3">
              <CardTitle className={`flex items-center text-sm ${previewTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                <User className="h-4 w-4 mr-2" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className={previewTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Name:</span>
                  <p className={`font-medium ${previewTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                    {lpo.customer?.firstname} {lpo.customer?.lastname}
                  </p>
                </div>
                <div>
                  <span className={previewTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Designation:</span>
                  <p className={`font-medium ${previewTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{lpo.designation}</p>
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
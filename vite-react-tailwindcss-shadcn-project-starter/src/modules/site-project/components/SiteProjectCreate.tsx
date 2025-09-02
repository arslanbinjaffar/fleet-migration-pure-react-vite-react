import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRoleBasedNavigation } from '../../../utils/roleBasedNavigation';
import {
  ArrowLeft,
  Save,
  Loader2,
  Building,
  Calendar,
  User,
  Users,
  MapPin,
  Palette,
  AlertCircle,
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// API and Types
import {
  useGetSiteProjectByIdQuery,
  useCreateSiteProjectMutation,
  useUpdateSiteProjectMutation,
} from '@/stores/api/siteProjectApiSlice';
import type { SiteProjectFormData } from '../types';
import { siteProjectSchema } from '../schemas/siteProjectSchema';
import {
  SITE_PROJECT_MESSAGES,
  SITE_PROJECT_LABELS,
  PROJECT_TYPE_OPTIONS,
  ZONE_OPTIONS,
  FORM_SECTIONS,
  UI_CONSTANTS,
} from '../constants';

// Utils

interface SiteProjectCreateProps {
  className?: string;
}

const SiteProjectCreate: React.FC<SiteProjectCreateProps> = ({ className }) => {
  const navigate = useRoleBasedNavigation();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('id');
  const isEditMode = Boolean(projectId);

  // API hooks
  const {
    data: projectResponse,
    isLoading: projectLoading,
    error: projectError,
  } = useGetSiteProjectByIdQuery(projectId!, { skip: !projectId });

  const [createSiteProject, { isLoading: isCreating }] = useCreateSiteProjectMutation();
  const [updateSiteProject, { isLoading: isUpdating }] = useUpdateSiteProjectMutation();

  const isSubmitting = isCreating || isUpdating;
  const project = projectResponse;

  // Form setup
  const form = useForm<SiteProjectFormData>({
    resolver: zodResolver(siteProjectSchema),
    defaultValues: {
      projectName: project?.projectName || '',
      typeOfProject: project?.typeOfProject || '',
      projectOwner: project?.projectOwner || '',
      mainContractor: project?.mainContractor || '',
      subContractor: project?.subContractor || '',
      serviceProvider: project?.serviceProvider || '',
      mainClient: project?.mainClient || '',
      startDate: project?.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      expiryDate: project?.expiryDate ? new Date(project.expiryDate).toISOString().split('T')[0] : '',
      subProject: project?.subProject || '',
      subProjectName: project?.subProjectName || '',
      zone: project?.zone || '',
      zonalSite: project?.zonalSite || '',
      projectColor: project?.projectColor || UI_CONSTANTS.DEFAULT_PROJECT_COLOR,
    },
  });

  // Initialize form with project data in edit mode
  useEffect(() => {
    if (isEditMode && project) {
      const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
      };

      form.reset({
        projectName: project.projectName || '',
        typeOfProject: project.typeOfProject || '',
        projectOwner: project.projectOwner || '',
        mainContractor: project.mainContractor || '',
        subContractor: project.subContractor || '',
        serviceProvider: project.serviceProvider || '',
        mainClient: project.mainClient || '',
        startDate: formatDate(project.startDate),
        expiryDate: formatDate(project.expiryDate),
        subProject: project.subProject || '',
        subProjectName: project.subProjectName || '',
        zone: project.zone || '',
        zonalSite: project.zonalSite || '',
        projectColor: project.projectColor || UI_CONSTANTS.DEFAULT_PROJECT_COLOR,
      });
    }
  }, [isEditMode, project, form]);

  // Event handlers
  const onSubmit = async (data: SiteProjectFormData) => {
    try {
      if (isEditMode && projectId) {
        const result = await updateSiteProject({ id: projectId, data }).unwrap();
        toast({
          title: 'Success',
          description: result?.message || SITE_PROJECT_MESSAGES.SUCCESS.UPDATED,
        });
      } else {
        const result = await createSiteProject(data).unwrap();
        toast({
          title: 'Success',
          description: result?.message || SITE_PROJECT_MESSAGES.SUCCESS.CREATED,
        });
      }
      
      // Navigate back to site projects list
      navigate('/site-project');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.error || 
          (isEditMode ? SITE_PROJECT_MESSAGES.ERROR.UPDATE_FAILED : SITE_PROJECT_MESSAGES.ERROR.CREATE_FAILED),
        variant: 'destructive',
      });
    }
  };

  const handleBack = () => {
    navigate('/site-project');
  };

  // Helper function to get icon for field
  const getFieldIcon = (key: string) => {
    if (key.includes('Date')) return <Calendar className="h-4 w-4" />;
    if (key.includes('project') || key.includes('Project')) return <Building className="h-4 w-4" />;
    if (key.includes('contractor') || key.includes('provider') || key.includes('client')) return <Users className="h-4 w-4" />;
    if (key.includes('owner') || key.includes('Owner')) return <User className="h-4 w-4" />;
    if (key.includes('zone') || key.includes('Zone')) return <MapPin className="h-4 w-4" />;
    if (key.includes('color') || key.includes('Color')) return <Palette className="h-4 w-4" />;
    return <Building className="h-4 w-4" />;
  };

  // Helper function to format field label
  const formatFieldLabel = (key: string): string => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
  };

  // Loading state
  if (isEditMode && projectLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isEditMode && projectError) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Project</h3>
          <p className="text-muted-foreground mb-4">
            {SITE_PROJECT_MESSAGES.ERROR.FETCH_DETAILS_FAILED}
          </p>
          <Button onClick={handleBack} variant="outline">
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {isEditMode ? SITE_PROJECT_LABELS.EDIT_SITE_PROJECT : SITE_PROJECT_LABELS.ADD_SITE_PROJECT}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Form Sections */}
              {Object.entries(FORM_SECTIONS).map(([sectionName, fields]) => (
                <div key={sectionName} className="space-y-6">
                  <div className="border-b pb-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Building className="h-5 w-5 text-primary" />
                      {sectionName}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {fields.map((fieldKey) => {
                      const fieldName = fieldKey as keyof SiteProjectFormData;
                      const label = formatFieldLabel(fieldKey);
                      const icon = getFieldIcon(fieldKey);

                      return (
                        <FormField
                          key={fieldKey}
                          control={form.control}
                          name={fieldName}
                          render={({ field }) => (
                            <FormItem className={fieldKey === 'projectColor' ? 'md:col-span-2' : ''}>
                              <FormLabel className="flex items-center gap-2">
                                <span className="text-primary">{icon}</span>
                                {label}
                                {/* Required field indicator - exclude optional fields */}
                                {fieldKey !== 'mainClient' && fieldKey !== 'subProject' ? (
                                  <span className="text-destructive">*</span>
                                ) : null}
                              </FormLabel>
                              <FormControl>
                                {fieldKey === 'typeOfProject' ? (
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select project type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {PROJECT_TYPE_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : fieldKey === 'zone' ? (
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select zone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {ZONE_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : fieldKey === 'projectColor' ? (
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                      <Input
                                        type="color"
                                        {...field}
                                        className="w-16 h-10 p-1 border rounded cursor-pointer"
                                      />
                                      <Input
                                        type="text"
                                        value={field.value}
                                        onChange={field.onChange}
                                        className="w-32"
                                        placeholder="#32CD32"
                                      />
                                    </div>
                                    <div
                                      className="w-8 h-8 rounded border"
                                      style={{ backgroundColor: field.value }}
                                    />
                                  </div>
                                ) : fieldKey.includes('Date') ? (
                                  <Input
                                    type="date"
                                    {...field}
                                    disabled={isSubmitting}
                                  />
                                ) : (fieldKey === 'subProject' || fieldKey === 'mainClient') ? (
                                  <Textarea
                                    placeholder={`Enter ${label.toLowerCase()}`}
                                    {...field}
                                    disabled={isSubmitting}
                                    rows={3}
                                  />
                                ) : (
                                  <Input
                                    placeholder={`Enter ${label.toLowerCase()}`}
                                    {...field}
                                    disabled={isSubmitting}
                                  />
                                )}
                              </FormControl>
                              {fieldKey === 'projectColor' && (
                                <FormDescription>
                                  Choose a color to represent this project in the system
                                </FormDescription>
                              )}
                              {fieldKey === 'startDate' && (
                                <FormDescription>
                                  Project start date
                                </FormDescription>
                              )}
                              {fieldKey === 'expiryDate' && (
                                <FormDescription>
                                  Project end/expiry date (must be after start date)
                                </FormDescription>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Project Preview */}
              {form.watch('projectColor') && (
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Palette className="h-5 w-5 text-primary" />
                      Project Preview
                    </h3>
                  </div>
                  <Card 
                    className="border-2" 
                    style={{ 
                      borderColor: form.watch('projectColor'),
                      backgroundColor: form.watch('projectColor') + '10'
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: form.watch('projectColor') }}
                        />
                        <div>
                          <h4 className="font-semibold">
                            {form.watch('projectName') || 'Project Name'}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {form.watch('typeOfProject') || 'Project Type'} • {form.watch('zone') || 'Zone'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 min-w-[140px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {isEditMode ? 'Update Project' : 'Create Project'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteProjectCreate;
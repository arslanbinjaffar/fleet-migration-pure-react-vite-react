import React from 'react';
import { useParams } from 'react-router-dom';
import { useRoleBasedNavigation } from '../../../utils/roleBasedNavigation';
import {
  ArrowLeft,
  Edit,
  Building,
  Calendar,
  User,
  Users,
  MapPin,
  Palette,
  AlertCircle,
  Truck,
  Info,
  Factory,
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

// API and Types
import {
  useGetSiteProjectByIdQuery,
  useGetSiteProjectFleetsQuery,
} from '@/stores/api/siteProjectApiSlice';
import type { SiteProject, AssignedFleet } from '../types';
import {
  SITE_PROJECT_MESSAGES,
  SITE_PROJECT_LABELS,
} from '../constants';

// Utils
import { formatDate } from '@/lib/utils';

interface SiteProjectViewProps {
  className?: string;
}

const SiteProjectView: React.FC<SiteProjectViewProps> = ({ className }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useRoleBasedNavigation();

  // API hooks
  const {
    data: projectResponse,
    isLoading: projectLoading,
    error: projectError,
  } = useGetSiteProjectByIdQuery(id!, { skip: !id });

  const {
    data: fleetsResponse,
    isLoading: fleetsLoading,
    error: fleetsError,
  } = useGetSiteProjectFleetsQuery(id!, { skip: !id });

  const project = projectResponse;
  const assignedFleets = fleetsResponse?.assignedfleets || [];

  // Display fields configuration
  const displayFields = [
    {
      label: SITE_PROJECT_LABELS.PROJECT_NAME,
      key: 'projectName' as keyof SiteProject,
      icon: <Building className="h-4 w-4 text-primary" />,
    },
    {
      label: SITE_PROJECT_LABELS.TYPE_OF_PROJECT,
      key: 'typeOfProject' as keyof SiteProject,
      icon: <Factory className="h-4 w-4 text-primary" />,
      renderValue: (value: string) => (
        <Badge variant="secondary">{value}</Badge>
      ),
    },
    {
      label: SITE_PROJECT_LABELS.PROJECT_OWNER,
      key: 'projectOwner' as keyof SiteProject,
      icon: <User className="h-4 w-4 text-primary" />,
    },
    {
      label: SITE_PROJECT_LABELS.MAIN_CONTRACTOR,
      key: 'mainContractor' as keyof SiteProject,
      icon: <Users className="h-4 w-4 text-primary" />,
    },
    {
      label: SITE_PROJECT_LABELS.SUB_CONTRACTOR,
      key: 'subContractor' as keyof SiteProject,
      icon: <Users className="h-4 w-4 text-primary" />,
    },
    {
      label: SITE_PROJECT_LABELS.SERVICE_PROVIDER,
      key: 'serviceProvider' as keyof SiteProject,
      icon: <Users className="h-4 w-4 text-primary" />,
    },
    {
      label: SITE_PROJECT_LABELS.START_DATE,
      key: 'startDate' as keyof SiteProject,
      icon: <Calendar className="h-4 w-4 text-primary" />,
      renderValue: (value: string) => formatDate(value),
    },
    {
      label: SITE_PROJECT_LABELS.EXPIRY_DATE,
      key: 'expiryDate' as keyof SiteProject,
      icon: <Calendar className="h-4 w-4 text-primary" />,
      renderValue: (value: string) => formatDate(value),
    },
    {
      label: SITE_PROJECT_LABELS.SUB_PROJECT_NAME,
      key: 'subProjectName' as keyof SiteProject,
      icon: <Building className="h-4 w-4 text-primary" />,
    },
    {
      label: SITE_PROJECT_LABELS.ZONE,
      key: 'zone' as keyof SiteProject,
      icon: <MapPin className="h-4 w-4 text-primary" />,
    },
    {
      label: SITE_PROJECT_LABELS.ZONAL_SITE,
      key: 'zonalSite' as keyof SiteProject,
      icon: <MapPin className="h-4 w-4 text-primary" />,
    },
    {
      label: SITE_PROJECT_LABELS.PROJECT_COLOR,
      key: 'projectColor' as keyof SiteProject,
      icon: <Palette className="h-4 w-4 text-primary" />,
      isColor: true,
    },
  ];

  // Helper function to get fleet status style
  const getFleetStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return { backgroundColor: '#10b981', color: 'white' };
      case 'in-use':
      case 'in use':
        return { backgroundColor: '#f59e0b', color: 'white' };
      case 'maintenance':
        return { backgroundColor: '#ef4444', color: 'white' };
      case 'out-of-service':
        return { backgroundColor: '#6b7280', color: 'white' };
      default:
        return { backgroundColor: '#e5e7eb', color: '#374151' };
    }
  };

  // Loading state
  if (projectLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Project info skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-4">
                <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </div>
              <div className="md:col-span-2 space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ))}
              </div>
            </div>
            {/* Fleets skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (projectError || !project) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Project</h3>
          <p className="text-muted-foreground mb-4">
            {SITE_PROJECT_MESSAGES.ERROR.FETCH_DETAILS_FAILED}
          </p>
          <Button variant="outline" onClick={() => navigate('/site-project')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
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
              <Info className="h-5 w-5" />
              {SITE_PROJECT_LABELS.PROJECT_DETAILS}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={() => navigate(`/site-project/create?id=${project.siteProjectId}`)}
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={() => navigate('/site-project')}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-8">
            {/* Project Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Project Avatar */}
              <div className="text-center space-y-4">
                <div 
                  className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold"
                  style={{ backgroundColor: project.projectColor }}
                >
                  {project.projectName?.charAt(0)?.toUpperCase() || 'P'}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{project.projectName}</h2>
                  <p className="text-muted-foreground">{project.typeOfProject}</p>
                </div>
              </div>

              {/* Project Details Grid */}
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {displayFields.map((field) => {
                    const value = project[field.key];
                    if (!value && field.key !== 'projectColor') return null;

                    return (
                      <div key={field.key} className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          {field.icon}
                          {field.label}
                        </div>
                        <div className="pl-6">
                          {field.isColor ? (
                            <div className="flex items-center gap-3">
                              <div
                                className="w-6 h-6 rounded border"
                                style={{ backgroundColor: value as string }}
                              />
                              <span className="font-mono text-sm">{value}</span>
                            </div>
                          ) : field.renderValue ? (
                            field.renderValue(value as string)
                          ) : (
                            <p className="text-foreground">{value || 'N/A'}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <hr className="my-8" />

            {/* Assigned Fleets Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  {SITE_PROJECT_LABELS.ASSIGNED_FLEETS}
                </h3>
                <Badge variant="outline">
                  {assignedFleets.length} Fleet{assignedFleets.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              {fleetsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : fleetsError ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {SITE_PROJECT_MESSAGES.ERROR.FETCH_FLEETS_FAILED}
                  </AlertDescription>
                </Alert>
              ) : assignedFleets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assignedFleets.map((item: AssignedFleet) => (
                    <Card key={item.fleet.fleetId} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Truck className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">
                                {item.fleet.vehicleName || 'N/A'}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {item.fleet.fleetType?.fleetType || 'Unknown Type'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{SITE_PROJECT_LABELS.STATUS}:</span>
                              <Badge 
                                className="text-xs"
                                style={getFleetStatusStyle(item.fleet.status)}
                              >
                                {item.fleet.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{SITE_PROJECT_LABELS.NO_ASSIGNED_FLEETS}</p>
                </div>
              )}
            </div>

            {/* Project Timeline */}
            {(project.startDate || project.expiryDate) && (
              <>
                <hr className="my-8" />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Project Timeline
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {project.startDate && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                              <Calendar className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Start Date</p>
                              <p className="font-semibold">{formatDate(project.startDate)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    {project.expiryDate && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                              <Calendar className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">End Date</p>
                              <p className="font-semibold">{formatDate(project.expiryDate)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteProjectView;
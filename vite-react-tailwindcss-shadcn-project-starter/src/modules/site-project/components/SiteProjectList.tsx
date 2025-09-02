import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Edit,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  Building,
  AlertCircle,
  Filter,
  Calendar,
  MapPin,
  User,
  Factory,
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// API and Types
import {
  useGetSiteProjectsQuery,
  useDeleteSiteProjectMutation,
} from '@/stores/api/siteProjectApiSlice';
import type { SiteProject } from '../types';
import {
  SITE_PROJECT_MESSAGES,
  SITE_PROJECT_LABELS,
  UI_CONSTANTS,
  PROJECT_TYPE_OPTIONS,
} from '../constants';

// Utils
import { formatDate } from '@/lib/utils';
import { exportToCSV } from '@/lib/export';
import { useRoleBasedNavigation } from '../../../utils/roleBasedNavigation';

interface SiteProjectListProps {
  className?: string;
}

const SiteProjectList: React.FC<SiteProjectListProps> = ({ className }) => {
  const { toast } = useToast();
  const navigate = useRoleBasedNavigation();
  
  // Local state
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    from: '',
    to: '',
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSiteProject, setSelectedSiteProject] = useState<SiteProject | null>(null);

  // API hooks
  const {
    data: siteProjectsResponse,
    isLoading,
    error,
    refetch,
  } = useGetSiteProjectsQuery({
    search: search || undefined,
    typeFilter: typeFilter !== 'all' ? typeFilter : undefined,
    dateFrom: dateRange.from || undefined,
    dateTo: dateRange.to || undefined,
    page: currentPage,
    limit: UI_CONSTANTS.RECORDS_PER_PAGE,
    sortBy: UI_CONSTANTS.DEFAULT_SORT_BY,
    sortOrder: UI_CONSTANTS.DEFAULT_SORT_ORDER,
  });

  const [deleteSiteProject, { isLoading: isDeleting }] = useDeleteSiteProjectMutation();

  // Computed values
  const siteProjects = siteProjectsResponse?.siteProjects || [];
  const totalRecords = siteProjectsResponse?.total || 0;
  const totalPages = Math.ceil(totalRecords / UI_CONSTANTS.RECORDS_PER_PAGE);

  // Project type options for filter
  const projectTypeOptions = [
    { value: 'all', label: SITE_PROJECT_LABELS.ALL_TYPES },
    ...PROJECT_TYPE_OPTIONS,
  ];

  // Pagination numbers
  const paginationNumbers = useMemo(() => {
    const numbers = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      numbers.push(i);
    }
    return numbers;
  }, [currentPage, totalPages]);

  // Event handlers
  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleTypeFilter = (value: string) => {
    setTypeFilter(value);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (type: 'from' | 'to', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [type]: value,
    }));
    setCurrentPage(1);
  };

  const handleDeleteClick = (siteProject: SiteProject) => {
    setSelectedSiteProject(siteProject);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSiteProject) return;

    try {
      await deleteSiteProject(selectedSiteProject.siteProjectId).unwrap();
      toast({
        title: 'Success',
        description: SITE_PROJECT_MESSAGES.SUCCESS.DELETED,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || SITE_PROJECT_MESSAGES.ERROR.DELETE_FAILED,
        variant: 'destructive',
      });
    } finally {
      setShowDeleteDialog(false);
      setSelectedSiteProject(null);
    }
  };

  const handleExportCSV = () => {
    const csvData = siteProjects.map((project, index) => ({
      '#': index + 1,
      'Project Name': project.projectName,
      'Type of Project': project.typeOfProject,
      'Sub Project': project.subProjectName,
      'Project Owner': project.projectOwner,
      'Main Contractor': project.mainContractor,
      'Zone': project.zone,
      'Start Date': formatDate(project.startDate),
      'Created Date': formatDate(project.createdAt),
    }));

    exportToCSV(csvData, 'site-projects.csv');
    toast({
      title: 'Success',
      description: 'Site projects exported successfully',
    });
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Site Projects</h3>
          <p className="text-muted-foreground mb-4">Failed to load site projects. Please try again.</p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }



  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {SITE_PROJECT_LABELS.SITE_PROJECTS}
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleExportCSV}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                disabled={siteProjects.length === 0}
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters and Stats */}
          <div className="flex flex-col gap-4 mb-6">
            <Badge variant="secondary" className="text-sm w-fit">
              Total: {totalRecords}
            </Badge>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={SITE_PROJECT_LABELS.SEARCH_PLACEHOLDER}
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={handleTypeFilter}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {projectTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date From */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => handleDateRangeChange('from', e.target.value)}
                  className="pl-10"
                  placeholder="From Date"
                />
              </div>

              {/* Date To */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => handleDateRangeChange('to', e.target.value)}
                  className="pl-10"
                  placeholder="To Date"
                  min={dateRange.from}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                className="flex items-center gap-2"
                onClick={() => navigate('/site-project/create')}
              >
                <Plus className="h-4 w-4" />
                {SITE_PROJECT_LABELS.ADD_SITE_PROJECT}
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center">#</TableHead>
                  <TableHead>{SITE_PROJECT_LABELS.PROJECT_NAME}</TableHead>
                  <TableHead>{SITE_PROJECT_LABELS.TYPE_OF_PROJECT}</TableHead>
                  <TableHead>{SITE_PROJECT_LABELS.SUB_PROJECT_NAME}</TableHead>
                  <TableHead>{SITE_PROJECT_LABELS.PROJECT_OWNER}</TableHead>
                  <TableHead>{SITE_PROJECT_LABELS.MAIN_CONTRACTOR}</TableHead>
                  <TableHead>{SITE_PROJECT_LABELS.ZONE}</TableHead>
                  <TableHead>{SITE_PROJECT_LABELS.START_DATE}</TableHead>
                  <TableHead className="w-32 text-center">{SITE_PROJECT_LABELS.ACTIONS}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {siteProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Building className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">{SITE_PROJECT_LABELS.NO_SITE_PROJECTS}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  siteProjects.map((project, index) => {
                    const globalIndex = (currentPage - 1) * UI_CONSTANTS.RECORDS_PER_PAGE + index + 1;
                    return (
                      <TableRow 
                        key={project.siteProjectId}
                        style={{ backgroundColor: project.projectColor + '20' }}
                      >
                        <TableCell className="text-center font-medium">
                          {globalIndex}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-primary" />
                            <span className="font-medium">{project.projectName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {project.typeOfProject}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {project.subProjectName || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{project.projectOwner}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Factory className="h-4 w-4 text-muted-foreground" />
                            <span>{project.mainContractor}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{project.zone}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(project.startDate)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => navigate(`/site-project/create?id=${project.siteProjectId}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => navigate(`/site-project/view/${project.siteProjectId}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(project)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * UI_CONSTANTS.RECORDS_PER_PAGE) + 1} to{' '}
                {Math.min(currentPage * UI_CONSTANTS.RECORDS_PER_PAGE, totalRecords)} of{' '}
                {totalRecords} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex gap-1">
                  {paginationNumbers.map((number) => (
                    <Button
                      key={number}
                      variant={currentPage === number ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(number)}
                      className="w-8 h-8 p-0"
                    >
                      {number}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Site Project</AlertDialogTitle>
            <AlertDialogDescription>
              {SITE_PROJECT_MESSAGES.CONFIRM.DELETE}
              <br />
              <span className="font-medium">"{selectedSiteProject?.projectName}"</span>
              <br />
              {SITE_PROJECT_MESSAGES.CONFIRM.DELETE_WARNING}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SiteProjectList;
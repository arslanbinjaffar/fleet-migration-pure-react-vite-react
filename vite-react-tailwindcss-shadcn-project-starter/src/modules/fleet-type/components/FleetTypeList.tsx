import React, { useState, useMemo } from 'react';
import { useRoleBasedNavigation } from '../../../utils/roleBasedNavigation';
import {
  Plus,
  Search,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  List,
  AlertCircle,
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
  useGetFleetTypesQuery,
  useDeleteFleetTypeMutation,
} from '@/stores/api/fleetTypeApiSlice';
import type { FleetType } from '../types';
import {
  FLEET_TYPE_MESSAGES,
  FLEET_TYPE_LABELS,
  UI_CONSTANTS,
} from '../constants';

// Utils
import { formatDate } from '@/lib/utils';
import { exportToCSV } from '@/lib/export';

interface FleetTypeListProps {
  className?: string;
}

const FleetTypeList: React.FC<FleetTypeListProps> = ({ className }) => {
  const { toast } = useToast();
  const navigate = useRoleBasedNavigation();
  
  // Local state
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedFleetType, setSelectedFleetType] = useState<FleetType | null>(null);

  // API hooks
  const {
    data: fleetTypesResponse,
    isLoading,
    error,
    refetch,
  } = useGetFleetTypesQuery({
    search: search || undefined,
    page: currentPage,
    limit: UI_CONSTANTS.RECORDS_PER_PAGE,
    sortBy: UI_CONSTANTS.DEFAULT_SORT_BY,
    sortOrder: UI_CONSTANTS.DEFAULT_SORT_ORDER,
  });

  const [deleteFleetType, { isLoading: isDeleting }] = useDeleteFleetTypeMutation();

  // Computed values
  const fleetTypes = fleetTypesResponse?.fleetTypes || [];
  const totalRecords = fleetTypesResponse?.total || 0;
  const totalPages = Math.ceil(totalRecords / UI_CONSTANTS.RECORDS_PER_PAGE);

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

  const handleDeleteClick = (fleetType: FleetType) => {
    setSelectedFleetType(fleetType);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedFleetType) return;

    try {
      await deleteFleetType(selectedFleetType.fleetTypeId).unwrap();
      toast({
        title: 'Success',
        description: FLEET_TYPE_MESSAGES.SUCCESS.DELETED,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || FLEET_TYPE_MESSAGES.ERROR.DELETE_FAILED,
        variant: 'destructive',
      });
    } finally {
      setShowDeleteDialog(false);
      setSelectedFleetType(null);
    }
  };

  const handleExportCSV = () => {
    const csvData = fleetTypes.map((fleetType, index) => ({
      '#': index + 1,
      'Fleet Type': fleetType.fleetType,
      'Description': fleetType.description || '-',
      'Created Date': formatDate(fleetType.createdAt),
    }));

    exportToCSV(csvData, 'fleet-types.csv');
    toast({
      title: 'Success',
      description: 'Fleet types exported successfully',
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
              <Skeleton key={i} className="h-12 w-full" />
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
          <h3 className="text-lg font-semibold mb-2">Error Loading Fleet Types</h3>
          <p className="text-muted-foreground mb-4">Failed to load fleet types. Please try again.</p>
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
              <List className="h-5 w-5" />
              {FLEET_TYPE_LABELS.FLEET_TYPES}
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleExportCSV}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                disabled={fleetTypes.length === 0}
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search and Stats */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <Badge variant="secondary" className="text-sm">
              Total: {totalRecords}
            </Badge>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={FLEET_TYPE_LABELS.SEARCH_PLACEHOLDER}
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Button 
                className="flex items-center gap-2 w-full sm:w-auto"
                onClick={() => navigate('/fleet-type/create')}
              >
                <Plus className="h-4 w-4" />
                {FLEET_TYPE_LABELS.ADD_FLEET_TYPE}
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center">#</TableHead>
                  <TableHead>{FLEET_TYPE_LABELS.FLEET_TYPE_NAME}</TableHead>
                  <TableHead>{FLEET_TYPE_LABELS.DESCRIPTION}</TableHead>
                  <TableHead>{FLEET_TYPE_LABELS.CREATED_AT}</TableHead>
                  <TableHead className="w-24 text-center">{FLEET_TYPE_LABELS.ACTIONS}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fleetTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <List className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">{FLEET_TYPE_LABELS.NO_FLEET_TYPES}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  fleetTypes.map((fleetType, index) => {
                    const globalIndex = (currentPage - 1) * UI_CONSTANTS.RECORDS_PER_PAGE + index + 1;
                    return (
                      <TableRow key={fleetType.fleetTypeId}>
                        <TableCell className="text-center font-medium">
                          {globalIndex}
                        </TableCell>
                        <TableCell className="font-medium">
                          {fleetType.fleetType}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {fleetType.description || '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(fleetType.createdAt)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(fleetType)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              {FLEET_TYPE_MESSAGES.CONFIRM.DELETE}
              <br />
              <span className="font-medium">"{selectedFleetType?.fleetType}"</span>
              <br />
              {FLEET_TYPE_MESSAGES.CONFIRM.DELETE_WARNING}
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

export default FleetTypeList;
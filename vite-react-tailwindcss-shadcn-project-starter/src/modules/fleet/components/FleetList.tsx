import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Car,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  MoreHorizontal,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

import {
  useGetFleetsQuery,
  useGetFleetTypesQuery,
  useDeleteFleetMutation,
  useBulkDeleteFleetsMutation,
  useExportFleetsMutation,
} from '../../../stores/api/fleetApiSlice';
import { selectCurrentUser } from '../../../stores/slices/authSlice';
import {
  selectSearchQuery,
  selectFilters,
  selectCurrentPage,
  selectPageSize,
  selectSelectedFleetIds,
  selectViewMode,
  setSearchQuery,
  setFilters,
  setCurrentPage,
  setPageSize,
  setSelectedFleetIds,
  toggleFleetSelection,
  selectAllFleets,
  clearSelection,
  setViewMode,
} from '../../../stores/slices/fleetSlice';
import { formatDate } from '../utils';
import type { Fleet, FleetType } from '../types';

const FleetList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const searchQuery = useSelector(selectSearchQuery);
  const filters = useSelector(selectFilters);
  const currentPage = useSelector(selectCurrentPage);
  const pageSize = useSelector(selectPageSize);
  const selectedFleetIds = useSelector(selectSelectedFleetIds);
  const viewMode = useSelector(selectViewMode);

  const [showFilters, setShowFilters] = useState(false);

  const {
    data: fleetsResponse,
    isLoading,
    error,
    refetch,
  } = useGetFleetsQuery({
    page: currentPage,
    limit: pageSize,
    search: searchQuery,
    ...filters,
  });

  const { data: fleetTypesResponse } = useGetFleetTypesQuery();
  const [deleteFleet] = useDeleteFleetMutation();
  const [bulkDeleteFleets] = useBulkDeleteFleetsMutation();
  const [exportFleets, { isLoading: isExporting }] = useExportFleetsMutation();

  const fleets = fleetsResponse?.fleets || [];
  const totalFleets = fleetsResponse?.total || 0;
  const fleetTypes = fleetTypesResponse?.fleetTypes || [];
  const totalPages = Math.ceil(totalFleets / pageSize);

  const role = user?.Role?.roleName?.toLowerCase() || 'administrative';

  useEffect(() => {
    if (error) {
      toast.error('Failed to load fleets');
    }
  }, [error]);

  const handleSearch = (value: string) => {
    dispatch(setSearchQuery(value));
  };

  const handleFilterChange = (key: string, value: string) => {
    dispatch(setFilters({ [key]: value || undefined }));
  };

  const clearFilters = () => {
    dispatch(setFilters({}));
    dispatch(setSearchQuery(''));
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  const handlePageSizeChange = (size: string) => {
    dispatch(setPageSize(parseInt(size)));
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    dispatch(setViewMode(mode));
  };

  const handleSelectAll = () => {
    if (selectedFleetIds.length === fleets.length) {
      dispatch(clearSelection());
    } else {
      dispatch(selectAllFleets());
    }
  };

  const handleSelectFleet = (fleetId: string) => {
    dispatch(toggleFleetSelection(fleetId));
  };

  const handleView = (fleetId: string) => {
    navigate(`/${role}/fleet/view/${fleetId}`);
  };

  const handleEdit = (fleetId: string) => {
    navigate(`/${role}/fleet/edit/${fleetId}`);
  };

  const handleDelete = async (fleetId: string) => {
    if (window.confirm('Are you sure you want to delete this fleet?')) {
      try {
        await deleteFleet(fleetId).unwrap();
        toast.success('Fleet deleted successfully');
        dispatch(clearSelection());
      } catch (error: any) {
        toast.error(error?.data?.error || 'Failed to delete fleet');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFleetIds.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedFleetIds.length} fleet(s)?`)) {
      try {
        await bulkDeleteFleets(selectedFleetIds).unwrap();
        toast.success(`${selectedFleetIds.length} fleet(s) deleted successfully`);
        dispatch(clearSelection());
      } catch (error: any) {
        toast.error(error?.data?.error || 'Failed to delete fleets');
      }
    }
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const blob = await exportFleets({ format, filters: { ...filters, search: searchQuery } }).unwrap();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fleets.${format === 'csv' ? 'csv' : 'xlsx'}`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Fleets exported as ${format.toUpperCase()}`);
    } catch (error: any) {
      toast.error(error?.data?.error || 'Failed to export fleets');
    }
  };

  const handleCreate = () => {
    navigate(`/${role}/fleet/create`);
  };

  const getFleetTypeLabel = (fleetTypeId?: string): string => {
    if (!fleetTypeId) return 'N/A';
    const fleetType = fleetTypes.find((type: FleetType) => type.fleetTypeId === fleetTypeId);
    return fleetType ? fleetType.fleetType : 'N/A';
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {fleets.map((fleet) => (
        <Card key={fleet.fleetId} className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedFleetIds.includes(fleet.fleetId!)}
                  onCheckedChange={() => handleSelectFleet(fleet.fleetId!)}
                  onClick={(e) => e.stopPropagation()}
                />
                <Car className="h-5 w-5 text-primary" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleView(fleet.fleetId!)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEdit(fleet.fleetId!)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDelete(fleet.fleetId!)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div onClick={() => handleView(fleet.fleetId!)}>
              <CardTitle className="text-lg">{fleet.vehicleName}</CardTitle>
              <CardDescription>{fleet.vehicleModel}</CardDescription>
            </div>
          </CardHeader>
          <CardContent onClick={() => handleView(fleet.fleetId!)}>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Plate Number</span>
                <Badge variant="outline" className="font-mono">
                  {fleet.plateNumber}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Type</span>
                <span className="text-sm">{getFleetTypeLabel(fleet.fleetTypeId)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={fleet.status === 'active' ? 'default' : 'secondary'}>
                  {fleet.status || 'N/A'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Owner</span>
                <span className="text-sm truncate">{fleet.ownerName}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderListView = () => (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedFleetIds.length === fleets.length && fleets.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Fleet Name</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Plate Number</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Registration Expiry</TableHead>
            <TableHead className="w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fleets.map((fleet) => (
            <TableRow key={fleet.fleetId} className="hover:bg-muted/50">
              <TableCell>
                <Checkbox
                  checked={selectedFleetIds.includes(fleet.fleetId!)}
                  onCheckedChange={() => handleSelectFleet(fleet.fleetId!)}
                />
              </TableCell>
              <TableCell className="font-medium">{fleet.vehicleName}</TableCell>
              <TableCell>{fleet.vehicleModel}</TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono">
                  {fleet.plateNumber}
                </Badge>
              </TableCell>
              <TableCell>{getFleetTypeLabel(fleet.fleetTypeId)}</TableCell>
              <TableCell>{fleet.ownerName}</TableCell>
              <TableCell>
                <Badge variant={fleet.status === 'active' ? 'default' : 'secondary'}>
                  {fleet.status || 'N/A'}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(fleet.registrationExpiryDate)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleView(fleet.fleetId!)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(fleet.fleetId!)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(fleet.fleetId!)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading fleets...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Car className="h-8 w-8 mr-3 text-primary" />
            Fleet Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your fleet vehicles, registrations, and documentation
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Fleet
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search fleets by name, plate number, or owner..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-muted' : ''}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExport('csv')} disabled={isExporting}>
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('excel')} disabled={isExporting}>
                    Export as Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {showFilters && (
            <>
              <Separator className="my-4" />
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium">Fleet Type</Label>
                  <Select
                    value={filters.fleetType || ''}
                    onValueChange={(value) => handleFilterChange('fleetType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      {fleetTypes.map((type) => (
                        <SelectItem key={type.fleetTypeId} value={type.fleetTypeId}>
                          {type.fleetType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Select
                    value={filters.status || ''}
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Owner</Label>
                  <Input
                    placeholder="Filter by owner"
                    value={filters.ownerName || ''}
                    onChange={(e) => handleFilterChange('ownerName', e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={clearFilters} variant="outline" className="w-full">
                    Clear Filters
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedFleetIds.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedFleetIds.length} fleet(s) selected
              </span>
              <div className="flex gap-2">
                <Button onClick={handleBulkDelete} variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
                <Button onClick={() => dispatch(clearSelection())} variant="outline" size="sm">
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Mode Toggle and Results */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Showing {fleets.length} of {totalFleets} fleets
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 border rounded-md">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Fleet List/Grid */}
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load fleets. Please try again.
          </AlertDescription>
        </Alert>
      ) : fleets.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No fleets found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || Object.keys(filters).length > 0
                ? 'No fleets match your search criteria.'
                : 'Get started by adding your first fleet vehicle.'}
            </p>
            {!searchQuery && Object.keys(filters).length === 0 && (
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Fleet
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        renderGridView()
      ) : (
        renderListView()
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Rows per page:</span>
                <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FleetList;
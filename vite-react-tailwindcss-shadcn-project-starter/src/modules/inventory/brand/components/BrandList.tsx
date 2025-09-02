import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

// Shadcn UI Components
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';

// Icons
import {
  Plus,
  Search,
  FileDown,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// API and State
import {
  useGetBrandsQuery,
  usePutBrandMutation,
} from '@/stores/api/brandApiSlice';

// Types and Utils
import { Brand } from '../types';
import {
  filterBrands,
  sortBrands,
  paginateBrands,
  generateBrandCSVData,
  formatBrandForDisplay,
  debounce,
} from '../utils';
import {
  BRAND_PAGINATION,
  BRAND_SUCCESS_MESSAGES,
  BRAND_ERROR_MESSAGES,
  BRAND_UI,
} from '../constants';

// Permission hook
import {
  CreateButton,
  EditButton,
  DeleteButton,
  ViewButton,
  ExportButton,
  ActionsDropdown,
  BulkActionsDropdown,
  usePermissions,
  PermissionModule,
} from '@/components/permissions';

interface BrandListProps {
  className?: string;
}

const BrandList: React.FC<BrandListProps> = ({ className }) => {
  const navigate = useNavigate();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // API hooks
  const {
    data: brandsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetBrandsQuery();
  
  const [putBrand, { isLoading: isDeleting }] = usePutBrandMutation();
  
  // Permissions
  const permissions = usePermissions();
  const canCreate = permissions?.brand?.create || false;
  const canRead = permissions?.brand?.read || false;
  const canUpdate = permissions?.brand?.update || false;
  const canDelete = permissions?.brand?.delete || false;
  
  // Memoized data processing
  const brands = brandsResponse?.brands || [];
  
  const processedBrands = useMemo(() => {
    let filtered = filterBrands(brands, {
      search: searchTerm,
    });
    
    filtered = sortBrands(filtered, 'name', 'asc');
    
    return paginateBrands(
      filtered,
      currentPage,
      BRAND_PAGINATION.DEFAULT_LIMIT
    );
  }, [brands, searchTerm, currentPage]);
  
  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      setSearchTerm(value);
      setCurrentPage(1); // Reset to first page when searching
    }, 300),
    []
  );
  
  // Effects
  useEffect(() => {
    refetch();
  }, [refetch]);
  
  // Handlers
  const handleSearch = (value: string) => {
    debouncedSearch(value);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleView = (brand: Brand) => {
    navigate(`/inventory/brand/view/${brand.brandId}`);
  };
  
  const handleEdit = (brand: Brand) => {
    navigate(`/inventory/brand/edit/${brand.brandId}`);
  };
  
  const handleDelete = async (brandId: string) => {
    try {
      const brand = brands.find(b => b.brandId === brandId);
      if (!brand) return;
      
      const updatedBrand = {
        ...brand,
        isDeleted: true,
      };
      
      await putBrand({
        id: brandId,
        updatedBrand,
      }).unwrap();
      
      toast({
        title: 'Success',
        description: BRAND_SUCCESS_MESSAGES.DELETED,
      });
      
      refetch();
    } catch (error: any) {
      console.error('Error deleting brand:', error);
      
      const errorMessage = error?.data?.message || 
                          error?.message || 
                          BRAND_ERROR_MESSAGES.UNKNOWN_ERROR;
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };
  
  // CSV Export
  const handleExport = () => {
    const csvData = generateBrandCSVData(processedBrands.data);
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brands_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };
  
  // Pagination helpers
  const totalPages = processedBrands.pagination.totalPages;
  const hasNextPage = processedBrands.pagination.hasNextPage;
  const hasPreviousPage = processedBrands.pagination.hasPreviousPage;
  
  const renderPaginationNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="h-8 w-8 p-0"
        >
          {i}
        </Button>
      );
    }
    
    return pages;
  };
  
  if (isError) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading brands. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-2xl font-bold">Brands</CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={BRAND_UI.SEARCH_PLACEHOLDER}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              {/* Export Button */}
              {processedBrands.data.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="whitespace-nowrap"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  {BRAND_UI.EXPORT_BUTTON}
                </Button>
              )}
              
              {/* Add Brand Button */}
              {canCreate && (
                <Button size="sm" asChild className="whitespace-nowrap">
                  <Link to="/inventory/brand/create">
                    <Plus className="h-4 w-4 mr-2" />
                    {BRAND_UI.ADD_BUTTON}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Desktop Table View */}
      <Card className="hidden sm:block">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Brand Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                    <TableHead className="w-32">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedBrands.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        {BRAND_UI.NO_RESULTS}
                      </TableCell>
                    </TableRow>
                  ) : (
                    processedBrands.data.map((brand, index) => {
                      const formattedBrand = formatBrandForDisplay(brand);
                      return (
                        <TableRow key={brand.brandId}>
                          <TableCell>
                            {(currentPage - 1) * BRAND_PAGINATION.DEFAULT_LIMIT + index + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            {brand.name}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {brand.description || 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            {formattedBrand.formattedDate}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {canRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleView(brand)}
                                  className="h-8 w-8 p-0 text-blue-600"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                              
                              {canUpdate && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(brand)}
                                  className="h-8 w-8 p-0 text-green-600"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              
                              {canDelete && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        {BRAND_ERROR_MESSAGES.DELETE_CONFIRMATION}
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {BRAND_ERROR_MESSAGES.DELETE_WARNING}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(brand.brandId)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * BRAND_PAGINATION.DEFAULT_LIMIT + 1} to{' '}
                    {Math.min(currentPage * BRAND_PAGINATION.DEFAULT_LIMIT, processedBrands.pagination.totalItems)} of{' '}
                    {processedBrands.pagination.totalItems} entries
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!hasPreviousPage}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    {renderPaginationNumbers()}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!hasNextPage}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Mobile Card View */}
      <div className="sm:hidden space-y-4">
        {/* Mobile Header */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-lg">Brands</h4>
              {canCreate && (
                <Button size="sm" asChild>
                  <Link to="/inventory/brand/create">
                    <Plus className="h-4 w-4 mr-2" />
                    {BRAND_UI.ADD_BUTTON}
                  </Link>
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              <Input
                placeholder={BRAND_UI.SEARCH_PLACEHOLDER}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
              />
              
              {processedBrands.data.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="w-full"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  {BRAND_UI.EXPORT_BUTTON}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))
        ) : processedBrands.data.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              {BRAND_UI.NO_RESULTS}
            </CardContent>
          </Card>
        ) : (
          processedBrands.data.map((brand) => {
            const formattedBrand = formatBrandForDisplay(brand);
            return (
              <Card key={brand.brandId}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg">{brand.name}</h3>
                    <Badge variant="secondary">
                      {formattedBrand.formattedDate}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <div>
                      <span className="font-medium">Description:</span>{' '}
                      {brand.description || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {canRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(brand)}
                        className="text-blue-600"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    )}
                    
                    {canUpdate && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(brand)}
                        className="text-green-600"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                    
                    {canDelete && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {BRAND_ERROR_MESSAGES.DELETE_CONFIRMATION}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {BRAND_ERROR_MESSAGES.DELETE_WARNING}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(brand.brandId)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
        
        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!hasPreviousPage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasNextPage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BrandList;
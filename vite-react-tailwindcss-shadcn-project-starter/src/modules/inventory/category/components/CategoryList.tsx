import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
  useGetCategoriesQuery,
  usePutCategoryMutation,
} from '@/stores/api/categoryApiSlice';

// Types and Utils
import { Category } from '../types';
import {
  filterCategories,
  sortCategories,
  paginateCategories,
  generateCategoryCSVData,
  formatCategoryForDisplay,
  debounce,
} from '../utils';
import {
  CATEGORY_PAGINATION,
  CATEGORY_SUCCESS_MESSAGES,
  CATEGORY_ERROR_MESSAGES,
  CATEGORY_UI,
} from '../constants';

// Permission hook
import { usePermissions } from '@/hooks/usePermissions';

interface CategoryListProps {
  className?: string;
}

const CategoryList: React.FC<CategoryListProps> = ({ className }) => {
  const navigate = useNavigate();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  
  // API hooks
  const {
    data: categoriesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetCategoriesQuery();
  
  const [putCategory, { isLoading: isDeleting }] = usePutCategoryMutation();
  
  // Permissions
  const permissions = usePermissions();
  const canCreate = permissions?.category?.create || false;
  const canRead = permissions?.category?.read || false;
  const canUpdate = permissions?.category?.update || false;
  const canDelete = permissions?.category?.delete || false;
  
  // Memoized data processing
  const categories = categoriesResponse?.categories || [];
  
  const processedCategories = useMemo(() => {
    let filtered = filterCategories(categories, {
      search: searchTerm,
    });
    
    filtered = sortCategories(filtered, 'name', 'asc');
    
    return paginateCategories(
      filtered,
      currentPage,
      CATEGORY_PAGINATION.DEFAULT_LIMIT
    );
  }, [categories, searchTerm, currentPage]);
  
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
  
  const handleView = (category: Category) => {
    navigate(`/inventory/category/view/${category.categoryId}`);
  };
  
  const handleEdit = (category: Category) => {
    navigate(`/inventory/category/edit/${category.categoryId}`);
  };
  
  const handleDelete = async (categoryId: string) => {
    try {
      const category = categories.find(c => c.categoryId === categoryId);
      if (!category) return;
      
      const updatedCategory = {
        ...category,
        isDeleted: true,
        // updatedBy: user?.userId, // Add when user context is available
      };
      
      await putCategory({
        id: categoryId,
        updatedCategory,
      }).unwrap();
      
      toast({
        title: 'Success',
        description: CATEGORY_SUCCESS_MESSAGES.DELETED,
      });
      
      refetch();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      
      const errorMessage = error?.data?.message || 
                          error?.message || 
                          CATEGORY_ERROR_MESSAGES.UNKNOWN_ERROR;
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };
  
  // CSV Export
  const handleExport = () => {
    const csvData = generateCategoryCSVData(processedCategories.data);
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'categories_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };
  
  // Pagination helpers
  const totalPages = processedCategories.pagination.totalPages;
  const hasNextPage = processedCategories.pagination.hasNextPage;
  const hasPreviousPage = processedCategories.pagination.hasPreviousPage;
  
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
            Error loading categories. Please try again.
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
            <CardTitle className="text-2xl font-bold">Categories</CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={CATEGORY_UI.SEARCH_PLACEHOLDER}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              {/* Export Button */}
              {processedCategories.data.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="whitespace-nowrap"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  {CATEGORY_UI.EXPORT_BUTTON}
                </Button>
              )}
              
              {/* Add Category Button */}
              {canCreate && (
                <Button size="sm" asChild className="whitespace-nowrap">
                  <Link to="/inventory/category/create">
                    <Plus className="h-4 w-4 mr-2" />
                    {CATEGORY_UI.ADD_BUTTON}
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
                    <TableHead>Category Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                    <TableHead className="w-32">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedCategories.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        {CATEGORY_UI.NO_RESULTS}
                      </TableCell>
                    </TableRow>
                  ) : (
                    processedCategories.data.map((category, index) => {
                      const formattedCategory = formatCategoryForDisplay(category);
                      return (
                        <TableRow key={category.categoryId}>
                          <TableCell>
                            {(currentPage - 1) * CATEGORY_PAGINATION.DEFAULT_LIMIT + index + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            {category.name}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {category.description || 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            {formattedCategory.formattedDate}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {canRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleView(category)}
                                  className="h-8 w-8 p-0 text-blue-600"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                              
                              {canUpdate && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(category)}
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
                                        {CATEGORY_ERROR_MESSAGES.DELETE_CONFIRMATION}
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {CATEGORY_ERROR_MESSAGES.DELETE_WARNING}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(category.categoryId)}
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
                    Showing {(currentPage - 1) * CATEGORY_PAGINATION.DEFAULT_LIMIT + 1} to{' '}
                    {Math.min(currentPage * CATEGORY_PAGINATION.DEFAULT_LIMIT, processedCategories.pagination.totalItems)} of{' '}
                    {processedCategories.pagination.totalItems} entries
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
              <h4 className="font-semibold text-lg">Categories</h4>
              {canCreate && (
                <Button size="sm" asChild>
                  <Link to="/inventory/category/create">
                    <Plus className="h-4 w-4 mr-2" />
                    {CATEGORY_UI.ADD_BUTTON}
                  </Link>
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              <Input
                placeholder={CATEGORY_UI.SEARCH_PLACEHOLDER}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
              />
              
              {processedCategories.data.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="w-full"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  {CATEGORY_UI.EXPORT_BUTTON}
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
        ) : processedCategories.data.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              {CATEGORY_UI.NO_RESULTS}
            </CardContent>
          </Card>
        ) : (
          processedCategories.data.map((category) => {
            const formattedCategory = formatCategoryForDisplay(category);
            return (
              <Card key={category.categoryId}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    <Badge variant="secondary">
                      {formattedCategory.formattedDate}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <div>
                      <span className="font-medium">Description:</span>{' '}
                      {category.description || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {canRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(category)}
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
                        onClick={() => handleEdit(category)}
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
                              {CATEGORY_ERROR_MESSAGES.DELETE_CONFIRMATION}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {CATEGORY_ERROR_MESSAGES.DELETE_WARNING}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(category.categoryId)}
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

export default CategoryList;
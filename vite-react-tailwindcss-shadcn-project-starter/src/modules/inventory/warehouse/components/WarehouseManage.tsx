import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSelector } from 'react-redux';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

// Icons
import {
  ArrowLeft,
  ArrowRight,
  Package,
  Loader2,
  AlertCircle,
} from 'lucide-react';

// API and State
import {
  useGetWarehousesQuery,
} from '@/stores/api/warehouseApiSlice';
import {
  useGetWarehouseProductsQuery,
} from '@/stores/api/warehouseProductsApiSlice';
import { selectCurrentUser } from '@/stores/slices/authSlice';

// Types and Validation
import { stockTransferSchema, type StockTransferData } from '../schemas/warehouseSchema';
import {
  validateStockTransferItems,
  calculateTransferTotal,
  generateWarehouseOptions,
} from '../utils';
import {
  WAREHOUSE_SUCCESS_MESSAGES,
  WAREHOUSE_ERROR_MESSAGES,
  STOCK_TRANSFER,
} from '../constants';

// Permission hook
import { usePermissions } from '@/hooks/usePermissions';

// Types
interface ProductTransferItem {
  productId: string;
  productName: string;
  brand?: string;
  model?: string;
  availableQuantity: number;
  transferQuantity: number;
  selected: boolean;
}

interface WarehouseManageProps {
  className?: string;
}

const WarehouseManage: React.FC<WarehouseManageProps> = ({ className }) => {
  const navigate = useNavigate();
  const userInfo = useSelector(selectCurrentUser);
  
  // State
  const [fromWarehouseId, setFromWarehouseId] = useState<string>('');
  const [toWarehouseId, setToWarehouseId] = useState<string>('');
  const [transferItems, setTransferItems] = useState<ProductTransferItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // API hooks
  const {
    data: warehousesResponse,
    isLoading: isLoadingWarehouses,
  } = useGetWarehousesQuery({});
  
  const {
    data: warehouseProductsResponse,
    isLoading: isLoadingProducts,
    refetch: refetchWarehouseProducts,
  } = useGetWarehouseProductsQuery(fromWarehouseId, {
    skip: !fromWarehouseId,
  });
  
  // Permissions
  const permissions = usePermissions();
  const canManageStock = permissions?.stock?.create || permissions?.stock?.update || false;
  
  // Form setup
  const form = useForm<StockTransferData>({
    resolver: zodResolver(stockTransferSchema),
    defaultValues: {
      fromWarehouseId: '',
      toWarehouseId: '',
      products: [],
      notes: '',
    },
  });
  
  // Redirect if no permission
  if (!canManageStock) {
    navigate('/inventory/warehouse');
    return null;
  }
  
  // Memoized warehouse options
  const warehouses = warehousesResponse?.warehouse || [];
  const warehouseOptions = useMemo(() => generateWarehouseOptions(warehouses), [warehouses]);
  
  const availableToWarehouses = useMemo(() => {
    return warehouseOptions.filter(option => option.value !== fromWarehouseId);
  }, [warehouseOptions, fromWarehouseId]);
  
  // Update transfer items when warehouse products change
  useEffect(() => {
    if (warehouseProductsResponse?.products) {
      const items: ProductTransferItem[] = warehouseProductsResponse.products.map((product: any) => ({
        productId: product.product?.productId || '',
        productName: product.product?.name || '',
        brand: product.product?.brand?.name || '',
        model: product.product?.model?.name || '',
        availableQuantity: product.quantity || 0,
        transferQuantity: 0,
        selected: false,
      }));
      setTransferItems(items);
    } else {
      setTransferItems([]);
    }
  }, [warehouseProductsResponse]);
  
  // Handlers
  const handleFromWarehouseChange = (warehouseId: string) => {
    setFromWarehouseId(warehouseId);
    setToWarehouseId(''); // Reset destination when source changes
    setTransferItems([]);
    form.setValue('fromWarehouseId', warehouseId);
    form.setValue('toWarehouseId', '');
  };
  
  const handleToWarehouseChange = (warehouseId: string) => {
    setToWarehouseId(warehouseId);
    form.setValue('toWarehouseId', warehouseId);
  };
  
  const handleItemSelectionChange = (index: number, selected: boolean) => {
    const updatedItems = [...transferItems];
    updatedItems[index].selected = selected;
    if (!selected) {
      updatedItems[index].transferQuantity = 0;
    }
    setTransferItems(updatedItems);
  };
  
  const handleQuantityChange = (index: number, quantity: number) => {
    const updatedItems = [...transferItems];
    updatedItems[index].transferQuantity = Math.max(0, quantity);
    setTransferItems(updatedItems);
  };
  
  // Form submission
  const onSubmit = async (data: StockTransferData) => {
    setIsSubmitting(true);
    
    try {
      // Prepare transfer data
      const selectedItems = transferItems
        .filter(item => item.selected && item.transferQuantity > 0)
        .map(item => ({
          productId: item.productId,
          productName: item.productName,
          product_quantity: item.availableQuantity,
          transfer_quantity: item.transferQuantity,
          checkbox: true,
        }));
      
      // Validate transfer items
      const validation = validateStockTransferItems(selectedItems);
      if (!validation.isValid) {
        validation.errors.forEach(error => {
          toast({
            title: 'Validation Error',
            description: error,
            variant: 'destructive',
          });
        });
        return;
      }
      
      // Check for invalid quantities
      const invalidItem = selectedItems.find(
        item => item.transfer_quantity > item.product_quantity
      );
      
      if (invalidItem) {
        toast({
          title: 'Invalid Quantity',
          description: `Transfer quantity exceeds available quantity for product: ${invalidItem.productName}`,
          variant: 'destructive',
        });
        return;
      }
      
      if (selectedItems.length === 0) {
        toast({
          title: 'No Items Selected',
          description: 'Please select at least one product with a valid quantity to transfer.',
          variant: 'destructive',
        });
        return;
      }
      
      // Prepare API payload
      const transferPayload = {
        warehouseIdFrom: fromWarehouseId,
        warehouseIdTo: toWarehouseId,
        products: selectedItems,
      };
      
      // TODO: Replace with actual API call when available
      // const result = await postStockList(transferPayload).unwrap();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Success',
        description: 'Stock transferred successfully',
      });
      
      // Navigate to stock list or warehouse list
      navigate('/inventory/warehouse');
      
    } catch (error: any) {
      console.error('Error transferring stock:', error);
      
      const errorMessage = error?.data?.message || 
                          error?.message || 
                          WAREHOUSE_ERROR_MESSAGES.UNKNOWN_ERROR;
      
      toast({
        title: 'Transfer Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/inventory/warehouse');
  };
  
  // Calculate totals
  const selectedItemsCount = transferItems.filter(item => item.selected).length;
  const totalTransferQuantity = calculateTransferTotal(
    transferItems.map(item => ({
      productId: item.productId,
      productName: item.productName,
      product_quantity: item.availableQuantity,
      transfer_quantity: item.transferQuantity,
      checkbox: item.selected,
    }))
  );
  
  return (
    <div className={`max-w-6xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-2xl font-bold">Manage Warehouse Stock</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Transfer products between warehouses
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Transfer Form */}
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Warehouse Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* From Warehouse */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">From Warehouse *</label>
                  {isLoadingWarehouses ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select
                      value={fromWarehouseId}
                      onValueChange={handleFromWarehouseChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select source warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouseOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex flex-col">
                              <span>{option.label}</span>
                              <span className="text-xs text-gray-500">{option.city}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                
                {/* To Warehouse */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">To Warehouse *</label>
                  <Select
                    value={toWarehouseId}
                    onValueChange={handleToWarehouseChange}
                    disabled={!fromWarehouseId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableToWarehouses.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col">
                            <span>{option.label}</span>
                            <span className="text-xs text-gray-500">{option.city}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Transfer Arrow */}
              {fromWarehouseId && toWarehouseId && (
                <div className="flex justify-center">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package className="h-4 w-4" />
                    <ArrowRight className="h-4 w-4" />
                    <Package className="h-4 w-4" />
                  </div>
                </div>
              )}
              
              {/* Products Selection */}
              {fromWarehouseId && toWarehouseId && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Select Products to Transfer</h3>
                    {selectedItemsCount > 0 && (
                      <Badge variant="secondary">
                        {selectedItemsCount} items selected • {totalTransferQuantity} total quantity
                      </Badge>
                    )}
                  </div>
                  
                  {isLoadingProducts ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : transferItems.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No products available in the selected warehouse</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      {/* Desktop Table View */}
                      <Card className="hidden md:block">
                        <CardContent className="p-0">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-12">Select</TableHead>
                                <TableHead>Product Name</TableHead>
                                <TableHead>Brand</TableHead>
                                <TableHead>Model</TableHead>
                                <TableHead className="text-right">Available</TableHead>
                                <TableHead className="text-right">Transfer Qty</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {transferItems.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    <Checkbox
                                      checked={item.selected}
                                      onCheckedChange={(checked) => 
                                        handleItemSelectionChange(index, checked as boolean)
                                      }
                                    />
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    {item.productName}
                                  </TableCell>
                                  <TableCell>{item.brand || '-'}</TableCell>
                                  <TableCell>{item.model || '-'}</TableCell>
                                  <TableCell className="text-right">
                                    <Badge variant="outline">
                                      {item.availableQuantity}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Input
                                      type="number"
                                      min="0"
                                      max={item.availableQuantity}
                                      value={item.transferQuantity || ''}
                                      onChange={(e) => 
                                        handleQuantityChange(index, Number(e.target.value))
                                      }
                                      disabled={!item.selected}
                                      placeholder="0"
                                      className="w-24 text-right"
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                      
                      {/* Mobile Card View */}
                      <div className="md:hidden space-y-4">
                        {transferItems.map((item, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium">{item.productName}</h4>
                                <Checkbox
                                  checked={item.selected}
                                  onCheckedChange={(checked) => 
                                    handleItemSelectionChange(index, checked as boolean)
                                  }
                                />
                              </div>
                              
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Brand:</span>
                                  <span>{item.brand || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Model:</span>
                                  <span>{item.model || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Available:</span>
                                  <Badge variant="outline">{item.availableQuantity}</Badge>
                                </div>
                              </div>
                              
                              <div className="mt-4">
                                <label className="text-sm font-medium mb-2 block">
                                  Quantity to Transfer
                                </label>
                                <Input
                                  type="number"
                                  min="0"
                                  max={item.availableQuantity}
                                  value={item.transferQuantity || ''}
                                  onChange={(e) => 
                                    handleQuantityChange(index, Number(e.target.value))
                                  }
                                  disabled={!item.selected}
                                  placeholder="Enter quantity"
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Add any notes about this transfer..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <Button
                  type="submit"
                  disabled={isSubmitting || !fromWarehouseId || !toWarehouseId || selectedItemsCount === 0}
                  className="sm:w-auto w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Transferring Stock...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Transfer Stock
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="sm:w-auto w-full"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WarehouseManage;
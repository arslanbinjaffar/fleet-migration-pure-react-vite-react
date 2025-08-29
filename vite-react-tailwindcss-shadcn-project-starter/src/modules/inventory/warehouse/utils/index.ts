import { format, parseISO } from 'date-fns';
import { Warehouse, WarehouseSearchParams, StockTransferItem } from '../types';
import { WAREHOUSE_STATUS } from '../constants';

// Format warehouse data for display
export const formatWarehouseForDisplay = (warehouse: Warehouse) => {
  return {
    ...warehouse,
    formattedCreatedAt: format(parseISO(warehouse.createdAt), 'MMM dd, yyyy'),
    formattedUpdatedAt: format(parseISO(warehouse.updatedAt), 'MMM dd, yyyy'),
    fullAddress: `${warehouse.address}, ${warehouse.city}${warehouse.state ? `, ${warehouse.state}` : ''}${warehouse.zipCode ? ` ${warehouse.zipCode}` : ''}`,
    statusLabel: warehouse.status === WAREHOUSE_STATUS.ACTIVE ? 'Active' : 'Inactive',
    capacityFormatted: warehouse.capacity ? warehouse.capacity.toLocaleString() : 'N/A',
  };
};

// Filter warehouses based on search criteria
export const filterWarehouses = (warehouses: Warehouse[], searchParams: WarehouseSearchParams) => {
  let filtered = [...warehouses];

  // Search filter
  if (searchParams.search) {
    const searchTerm = searchParams.search.toLowerCase();
    filtered = filtered.filter(warehouse => 
      warehouse.name.toLowerCase().includes(searchTerm) ||
      warehouse.description?.toLowerCase().includes(searchTerm) ||
      warehouse.city.toLowerCase().includes(searchTerm) ||
      warehouse.address.toLowerCase().includes(searchTerm)
    );
  }

  // Status filter
  if (searchParams.status && searchParams.status !== 'all') {
    filtered = filtered.filter(warehouse => warehouse.status === searchParams.status);
  }

  // City filter
  if (searchParams.city) {
    filtered = filtered.filter(warehouse => 
      warehouse.city.toLowerCase().includes(searchParams.city!.toLowerCase())
    );
  }

  // State filter
  if (searchParams.state) {
    filtered = filtered.filter(warehouse => 
      warehouse.state?.toLowerCase().includes(searchParams.state!.toLowerCase())
    );
  }

  return filtered;
};

// Sort warehouses
export const sortWarehouses = (warehouses: Warehouse[], sortBy: string, sortOrder: 'asc' | 'desc') => {
  return [...warehouses].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'city':
        aValue = a.city.toLowerCase();
        bValue = b.city.toLowerCase();
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'capacity':
        aValue = a.capacity || 0;
        bValue = b.capacity || 0;
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }

    if (aValue < bValue) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

// Paginate warehouses
export const paginateWarehouses = (warehouses: Warehouse[], page: number, limit: number) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    data: warehouses.slice(startIndex, endIndex),
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(warehouses.length / limit),
      totalItems: warehouses.length,
      itemsPerPage: limit,
      hasNextPage: endIndex < warehouses.length,
      hasPreviousPage: page > 1,
    },
  };
};

// Generate CSV data for export
export const generateWarehouseCSVData = (warehouses: Warehouse[]) => {
  const headers = [
    'Name',
    'Description',
    'City',
    'State',
    'Address',
    'ZIP Code',
    'Country',
    'Phone',
    'Email',
    'Capacity',
    'Status',
    'Created At',
    'Updated At',
  ];

  const data = warehouses.map(warehouse => [
    warehouse.name,
    warehouse.description || '',
    warehouse.city,
    warehouse.state || '',
    warehouse.address,
    warehouse.zipCode || '',
    warehouse.country || '',
    warehouse.phone || '',
    warehouse.email || '',
    warehouse.capacity?.toString() || '',
    warehouse.status,
    format(parseISO(warehouse.createdAt), 'yyyy-MM-dd HH:mm:ss'),
    format(parseISO(warehouse.updatedAt), 'yyyy-MM-dd HH:mm:ss'),
  ]);

  return [headers, ...data];
};

// Validate stock transfer items
export const validateStockTransferItems = (items: StockTransferItem[]) => {
  const errors: string[] = [];
  const selectedItems = items.filter(item => item.checkbox);

  if (selectedItems.length === 0) {
    errors.push('At least one product must be selected for transfer');
  }

  selectedItems.forEach((item, index) => {
    if (item.transfer_quantity <= 0) {
      errors.push(`Transfer quantity for ${item.productName} must be greater than 0`);
    }
    if (item.transfer_quantity > item.product_quantity) {
      errors.push(`Transfer quantity for ${item.productName} cannot exceed available quantity (${item.product_quantity})`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    selectedItems,
  };
};

// Calculate total transfer value
export const calculateTransferTotal = (items: StockTransferItem[]) => {
  return items
    .filter(item => item.checkbox)
    .reduce((total, item) => total + item.transfer_quantity, 0);
};

// Format warehouse status for display
export const formatWarehouseStatus = (status: string) => {
  return status === WAREHOUSE_STATUS.ACTIVE ? 'Active' : 'Inactive';
};

// Get warehouse status color
export const getWarehouseStatusColor = (status: string) => {
  return status === WAREHOUSE_STATUS.ACTIVE ? 'success' : 'destructive';
};

// Generate warehouse options for select components
export const generateWarehouseOptions = (warehouses: Warehouse[]) => {
  return warehouses
    .filter(warehouse => warehouse.status === WAREHOUSE_STATUS.ACTIVE)
    .map(warehouse => ({
      value: warehouse.warehouseId,
      label: warehouse.name,
      city: warehouse.city,
      address: warehouse.address,
    }));
};

// Debounce function for search
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Format phone number for display
export const formatPhoneNumber = (phone: string) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX for US numbers
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Return original if not a standard format
  return phone;
};

// Validate warehouse form data
export const validateWarehouseForm = (data: any) => {
  const errors: Record<string, string> = {};

  if (!data.name?.trim()) {
    errors.name = 'Warehouse name is required';
  }

  if (!data.city?.trim()) {
    errors.city = 'City is required';
  }

  if (!data.address?.trim()) {
    errors.address = 'Address is required';
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (data.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(data.phone.replace(/\D/g, ''))) {
    errors.phone = 'Please enter a valid phone number';
  }

  if (data.capacity && (isNaN(data.capacity) || data.capacity < 0)) {
    errors.capacity = 'Capacity must be a positive number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Export all utilities
export {
  formatWarehouseForDisplay,
  filterWarehouses,
  sortWarehouses,
  paginateWarehouses,
  generateWarehouseCSVData,
  validateStockTransferItems,
  calculateTransferTotal,
  formatWarehouseStatus,
  getWarehouseStatusColor,
  generateWarehouseOptions,
  debounce,
  formatPhoneNumber,
  validateWarehouseForm,
};
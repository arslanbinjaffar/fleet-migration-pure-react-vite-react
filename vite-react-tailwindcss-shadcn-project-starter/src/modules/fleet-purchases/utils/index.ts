import { format, parseISO, isValid } from 'date-fns';
import {
  FleetPurchaseOrder,
  FleetSupplier,
  FleetPurchase,
  SupplierLedger,
  PurchaseOrderItem,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  ItemCondition,
  TransactionType,
} from '../types';
import {
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  ITEM_CONDITION_OPTIONS,
  TRANSACTION_TYPE_OPTIONS,
  STATUS_COLORS,
  CURRENCY_SYMBOL,
  CURRENCY_DECIMAL_PLACES,
  DATE_FORMAT,
  DATETIME_FORMAT,
} from '../constants';

// Date formatting functions
export const formatDate = (date: string | Date): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid Date';
    return format(dateObj, 'dd/MM/yyyy');
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatDateTime = (date: string | Date): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid Date';
    return format(dateObj, 'dd/MM/yyyy HH:mm');
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatTime = (date: string | Date): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid Time';
    return format(dateObj, 'HH:mm');
  } catch (error) {
    return 'Invalid Time';
  }
};

// Currency formatting functions
export const formatCurrency = (amount: number): string => {
  if (typeof amount !== 'number' || isNaN(amount)) return `${CURRENCY_SYMBOL} 0.00`;
  
  return `${CURRENCY_SYMBOL} ${amount.toLocaleString('en-US', {
    minimumFractionDigits: CURRENCY_DECIMAL_PLACES,
    maximumFractionDigits: CURRENCY_DECIMAL_PLACES,
  })}`;
};

export const parseCurrency = (currencyString: string): number => {
  if (!currencyString) return 0;
  
  const numericString = currencyString.replace(/[^0-9.-]/g, '');
  const amount = parseFloat(numericString);
  
  return isNaN(amount) ? 0 : amount;
};

// Calculation functions
export const calculateItemTotal = (quantity: number, unitPrice: number): number => {
  return quantity * unitPrice;
};

export const calculateSubtotal = (items: PurchaseOrderItem[]): number => {
  return items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
};

export const calculateTotal = (
  subtotal: number,
  taxAmount: number = 0,
  discountAmount: number = 0
): number => {
  return Math.max(0, subtotal + taxAmount - discountAmount);
};

export const calculateTaxAmount = (subtotal: number, taxRate: number): number => {
  return (subtotal * taxRate) / 100;
};

export const calculateDiscountAmount = (subtotal: number, discountRate: number): number => {
  return (subtotal * discountRate) / 100;
};

export const calculateRemainingAmount = (total: number, paidAmount: number): number => {
  return Math.max(0, total - paidAmount);
};

export const calculatePaymentPercentage = (paidAmount: number, total: number): number => {
  if (total === 0) return 0;
  return Math.min(100, (paidAmount / total) * 100);
};

// Status configuration functions
export const getOrderStatusConfig = (status: OrderStatus) => {
  const statusOption = ORDER_STATUS_OPTIONS.find(option => option.value === status);
  return {
    label: statusOption?.label || status,
    color: statusOption?.color || 'bg-gray-100 text-gray-800',
    ...STATUS_COLORS[status] || STATUS_COLORS.pending,
  };
};

export const getPaymentStatusConfig = (status: PaymentStatus) => {
  const statusOption = PAYMENT_STATUS_OPTIONS.find(option => option.value === status);
  return {
    label: statusOption?.label || status,
    color: statusOption?.color || 'bg-gray-100 text-gray-800',
    ...STATUS_COLORS[status] || STATUS_COLORS.pending,
  };
};

export const getPaymentMethodConfig = (method: PaymentMethod) => {
  const methodOption = PAYMENT_METHOD_OPTIONS.find(option => option.value === method);
  return {
    label: methodOption?.label || method,
    icon: methodOption?.icon || '💳',
  };
};

export const getItemConditionConfig = (condition: ItemCondition) => {
  const conditionOption = ITEM_CONDITION_OPTIONS.find(option => option.value === condition);
  return {
    label: conditionOption?.label || condition,
    color: conditionOption?.color || 'bg-gray-100 text-gray-800',
    ...STATUS_COLORS[condition] || STATUS_COLORS.good,
  };
};

export const getTransactionTypeConfig = (type: TransactionType) => {
  const typeOption = TRANSACTION_TYPE_OPTIONS.find(option => option.value === type);
  return {
    label: typeOption?.label || type,
    color: typeOption?.color || 'bg-gray-100 text-gray-800',
    ...STATUS_COLORS[type] || STATUS_COLORS.purchase,
  };
};

// Search and filter functions
export const searchPurchaseOrders = (orders: FleetPurchaseOrder[], searchTerm: string): FleetPurchaseOrder[] => {
  if (!searchTerm.trim()) return orders;
  
  const term = searchTerm.toLowerCase();
  
  return orders.filter(order => 
    order.orderNumber.toLowerCase().includes(term) ||
    order.FleetSupplier?.name.toLowerCase().includes(term) ||
    order.FleetSupplier?.TRN.toLowerCase().includes(term) ||
    order.warehouse?.name.toLowerCase().includes(term) ||
    order.total.toString().includes(term) ||
    formatDate(order.orderDate).toLowerCase().includes(term)
  );
};

export const searchSuppliers = (suppliers: FleetSupplier[], searchTerm: string): FleetSupplier[] => {
  if (!searchTerm.trim()) return suppliers;
  
  const term = searchTerm.toLowerCase();
  
  return suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(term) ||
    supplier.email.toLowerCase().includes(term) ||
    supplier.phone.toLowerCase().includes(term) ||
    supplier.TRN.toLowerCase().includes(term) ||
    supplier.detail?.toLowerCase().includes(term) ||
    supplier.contactPerson?.toLowerCase().includes(term)
  );
};

export const searchPurchases = (purchases: FleetPurchase[], searchTerm: string): FleetPurchase[] => {
  if (!searchTerm.trim()) return purchases;
  
  const term = searchTerm.toLowerCase();
  
  return purchases.filter(purchase => 
    purchase.invoiceNumber.toLowerCase().includes(term) ||
    purchase.fleetPurchaseOrder?.FleetSupplier?.name.toLowerCase().includes(term) ||
    purchase.fleetPurchaseOrder?.orderNumber.toLowerCase().includes(term) ||
    formatDate(purchase.invoiceDate).toLowerCase().includes(term)
  );
};

// Filter functions
export const filterPurchaseOrdersByStatus = (orders: FleetPurchaseOrder[], status: string): FleetPurchaseOrder[] => {
  if (!status || status === 'all') return orders;
  return orders.filter(order => order.orderStatus === status);
};

export const filterPurchaseOrdersBySupplier = (orders: FleetPurchaseOrder[], supplierId: string): FleetPurchaseOrder[] => {
  if (!supplierId || supplierId === 'all') return orders;
  return orders.filter(order => order.fleetSupplierId === supplierId);
};

export const filterPurchaseOrdersByWarehouse = (orders: FleetPurchaseOrder[], warehouseId: string): FleetPurchaseOrder[] => {
  if (!warehouseId || warehouseId === 'all') return orders;
  return orders.filter(order => order.warehouseId === warehouseId);
};

export const filterPurchaseOrdersByDateRange = (
  orders: FleetPurchaseOrder[],
  startDate: string,
  endDate: string
): FleetPurchaseOrder[] => {
  if (!startDate || !endDate) return orders;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return orders.filter(order => {
    const orderDate = new Date(order.orderDate);
    return orderDate >= start && orderDate <= end;
  });
};

export const filterSuppliersByStatus = (suppliers: FleetSupplier[], isActive: boolean | null): FleetSupplier[] => {
  if (isActive === null) return suppliers;
  return suppliers.filter(supplier => supplier.isActive === isActive);
};

// Sorting functions
export const sortPurchaseOrders = (
  orders: FleetPurchaseOrder[],
  sortBy: string,
  sortOrder: 'asc' | 'desc'
): FleetPurchaseOrder[] => {
  return [...orders].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sortBy) {
      case 'orderNumber':
        aValue = a.orderNumber;
        bValue = b.orderNumber;
        break;
      case 'supplier':
        aValue = a.FleetSupplier?.name || '';
        bValue = b.FleetSupplier?.name || '';
        break;
      case 'warehouse':
        aValue = a.warehouse?.name || '';
        bValue = b.warehouse?.name || '';
        break;
      case 'total':
        aValue = a.total;
        bValue = b.total;
        break;
      case 'orderDate':
        aValue = new Date(a.orderDate);
        bValue = new Date(b.orderDate);
        break;
      case 'status':
        aValue = a.orderStatus;
        bValue = b.orderStatus;
        break;
      default:
        aValue = a.createdAt;
        bValue = b.createdAt;
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};

export const sortSuppliers = (
  suppliers: FleetSupplier[],
  sortBy: string,
  sortOrder: 'asc' | 'desc'
): FleetSupplier[] => {
  return [...suppliers].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'email':
        aValue = a.email;
        bValue = b.email;
        break;
      case 'phone':
        aValue = a.phone;
        bValue = b.phone;
        break;
      case 'TRN':
        aValue = a.TRN;
        bValue = b.TRN;
        break;
      case 'isActive':
        aValue = a.isActive;
        bValue = b.isActive;
        break;
      default:
        aValue = a.createdAt;
        bValue = b.createdAt;
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};

// Pagination functions
export const paginateData = <T>(data: T[], page: number, pageSize: number): T[] => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return data.slice(startIndex, endIndex);
};

export const calculateTotalPages = (totalItems: number, pageSize: number): number => {
  return Math.ceil(totalItems / pageSize);
};

// Export preparation functions
export const preparePurchaseOrdersForExport = (orders: FleetPurchaseOrder[]) => {
  return orders.map((order, index) => ({
    '#': index + 1,
    'Order Number': order.orderNumber,
    'Supplier Name': order.FleetSupplier?.name || 'N/A',
    'Supplier TRN': order.FleetSupplier?.TRN || 'N/A',
    'Warehouse': order.warehouse?.name || 'N/A',
    'Total Amount': formatCurrency(order.total),
    'Status': getOrderStatusConfig(order.orderStatus).label,
    'Order Date': formatDate(order.orderDate),
    'Expected Delivery': order.expectedDeliveryDate ? formatDate(order.expectedDeliveryDate) : 'N/A',
    'Created Date': formatDateTime(order.createdAt),
  }));
};

export const prepareSuppliersForExport = (suppliers: FleetSupplier[]) => {
  return suppliers.map((supplier, index) => ({
    '#': index + 1,
    'Supplier Name': supplier.name,
    'Email': supplier.email || 'N/A',
    'Phone': supplier.phone,
    'TRN': supplier.TRN,
    'Contact Person': supplier.contactPerson || 'N/A',
    'Address': supplier.address || 'N/A',
    'Status': supplier.isActive ? 'Active' : 'Inactive',
    'Created Date': formatDateTime(supplier.createdAt),
  }));
};

export const preparePurchasesForExport = (purchases: FleetPurchase[]) => {
  return purchases.map((purchase, index) => ({
    '#': index + 1,
    'Invoice Number': purchase.invoiceNumber,
    'Order Number': purchase.fleetPurchaseOrder?.orderNumber || 'N/A',
    'Supplier Name': purchase.fleetPurchaseOrder?.FleetSupplier?.name || 'N/A',
    'Total Amount': formatCurrency(purchase.fleetPurchaseOrder?.total || 0),
    'Paid Amount': formatCurrency(purchase.paidAmount),
    'Remaining Amount': formatCurrency(purchase.remainingAmount),
    'Payment Status': getPaymentStatusConfig(purchase.paymentStatus).label,
    'Invoice Date': formatDate(purchase.invoiceDate),
    'Created Date': formatDateTime(purchase.createdAt),
  }));
};

// Validation functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[0-9\s-()]+$/;
  return phoneRegex.test(phone);
};

export const validateTRN = (trn: string): boolean => {
  return trn.length >= 3 && trn.length <= 20;
};

export const validateAmount = (amount: number): boolean => {
  return amount >= 0 && amount <= 10000000;
};

export const validateQuantity = (quantity: number): boolean => {
  return quantity > 0 && quantity <= 10000;
};

// Error handling functions
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.data?.message) return error.data.message;
  if (error?.data?.error) return error.data.error;
  return 'An unexpected error occurred';
};

// Statistics calculation functions
export const calculatePurchaseOrderStats = (orders: FleetPurchaseOrder[]) => {
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.orderStatus === 'pending').length;
  const approvedOrders = orders.filter(order => order.orderStatus === 'approved').length;
  const completedOrders = orders.filter(order => order.orderStatus === 'completed').length;
  const totalAmount = orders.reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;
  
  return {
    totalOrders,
    pendingOrders,
    approvedOrders,
    completedOrders,
    totalAmount,
    averageOrderValue,
  };
};

export const calculateSupplierStats = (suppliers: FleetSupplier[], purchases: FleetPurchase[]) => {
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(supplier => supplier.isActive).length;
  const totalPurchaseAmount = purchases.reduce((sum, purchase) => sum + (purchase.fleetPurchaseOrder?.total || 0), 0);
  const averagePurchaseAmount = purchases.length > 0 ? totalPurchaseAmount / purchases.length : 0;
  
  return {
    totalSuppliers,
    activeSuppliers,
    totalPurchaseAmount,
    averagePurchaseAmount,
  };
};

// Ledger calculation functions
export const calculateRunningBalance = (ledgerEntries: SupplierLedger[]): SupplierLedger[] => {
  let runningBalance = 0;
  
  return ledgerEntries.map(entry => {
    runningBalance += entry.debitAmount - entry.creditAmount;
    return {
      ...entry,
      balance: runningBalance,
    };
  });
};

export const calculateTotalBalance = (ledgerEntries: SupplierLedger[]): number => {
  return ledgerEntries.reduce((balance, entry) => balance + entry.debitAmount - entry.creditAmount, 0);
};

// Display helper functions
export const getSupplierDisplayName = (supplier: FleetSupplier): string => {
  return `${supplier.name} (${supplier.TRN})`;
};

export const getOrderDisplayNumber = (order: FleetPurchaseOrder): string => {
  return `#${order.orderNumber}`;
};

export const getPurchaseDisplayNumber = (purchase: FleetPurchase): string => {
  return `${purchase.invoiceNumber}`;
};

// Generate filter options
export const generateSupplierOptions = (suppliers: FleetSupplier[]) => {
  return suppliers
    .filter(supplier => supplier.isActive)
    .map(supplier => ({
      value: supplier.fleetSupplierId,
      label: getSupplierDisplayName(supplier),
    }));
};

export const generateWarehouseOptions = (warehouses: any[]) => {
  return warehouses.map(warehouse => ({
    value: warehouse.warehouseId,
    label: warehouse.name,
  }));
};

export const generateCategoryOptions = (categories: any[]) => {
  return categories.map(category => ({
    value: category.categoryId,
    label: category.name,
  }));
};
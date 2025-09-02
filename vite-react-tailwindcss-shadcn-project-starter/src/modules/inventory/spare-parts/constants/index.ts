// Spare Parts module constants

// API endpoints
export const SPARE_PART_ENDPOINTS = {
  LIST: '/api/spare-parts',
  CREATE: '/api/spare-parts',
  UPDATE: (id: string) => `/api/spare-parts/${id}`,
  DELETE: (id: string) => `/api/spare-parts/${id}`,
  GET_BY_ID: (id: string) => `/api/spare-parts/${id}`,
  STOCK_MOVEMENTS: (id: string) => `/api/spare-parts/${id}/movements`,
  ADJUST_STOCK: (id: string) => `/api/spare-parts/${id}/adjust-stock`,
  CATEGORIES: '/api/spare-parts/categories',
  BULK_IMPORT: '/api/spare-parts/bulk-import',
  EXPORT: '/api/spare-parts/export',
  LOW_STOCK: '/api/spare-parts/low-stock',
  REORDER_REPORT: '/api/spare-parts/reorder-report',
} as const;

// Default pagination settings
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  maxLimit: 100,
} as const;

// Spare part status options
export const SPARE_PART_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DISCONTINUED: 'discontinued',
} as const;

// Unit options
export const UNITS = {
  PIECE: 'piece',
  PAIR: 'pair',
  SET: 'set',
  KILOGRAM: 'kg',
  GRAM: 'g',
  LITER: 'liter',
  MILLILITER: 'ml',
  METER: 'meter',
  CENTIMETER: 'cm',
  BOX: 'box',
  PACK: 'pack',
} as const;

// Stock movement types
export const MOVEMENT_TYPES = {
  IN: 'in',
  OUT: 'out',
  ADJUSTMENT: 'adjustment',
  TRANSFER: 'transfer',
} as const;

// Stock adjustment types
export const ADJUSTMENT_TYPES = {
  INCREASE: 'increase',
  DECREASE: 'decrease',
  SET: 'set',
} as const;

// Stock level types
export const STOCK_LEVELS = {
  ALL: 'all',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
  OVERSTOCK: 'overstock',
} as const;

// Sort options
export const SORT_OPTIONS = {
  PART_NAME: 'partName',
  PART_NUMBER: 'partNumber',
  QUANTITY_IN_STOCK: 'quantityInStock',
  UNIT_PRICE: 'unitPrice',
  CREATED_AT: 'createdAt',
} as const;

// Sort orders
export const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

// Field limits
export const FIELD_LIMITS = {
  PART_NUMBER: { min: 1, max: 50 },
  PART_NAME: { min: 1, max: 100 },
  DESCRIPTION: { max: 500 },
  BRAND: { min: 1, max: 50 },
  MODEL: { max: 50 },
  LOCATION: { max: 100 },
  BARCODE: { max: 50 },
  SKU: { max: 50 },
  SUPPLIER_PART_NUMBER: { max: 50 },
  NOTES: { max: 1000 },
  CATEGORY_NAME: { min: 1, max: 50 },
  CATEGORY_DESCRIPTION: { max: 200 },
  MOVEMENT_REASON: { min: 1, max: 200 },
  MOVEMENT_NOTES: { max: 500 },
} as const;

// Default values
export const DEFAULT_VALUES = {
  STATUS: SPARE_PART_STATUS.ACTIVE,
  UNIT: UNITS.PIECE,
  QUANTITY_IN_STOCK: 0,
  MINIMUM_STOCK: 0,
  REORDER_LEVEL: 0,
  UNIT_PRICE: 0,
  COST_PRICE: 0,
  WARRANTY_PERIOD: 0,
} as const;

// Stock level thresholds
export const STOCK_THRESHOLDS = {
  CRITICAL_PERCENTAGE: 0.1, // 10% of minimum stock
  LOW_PERCENTAGE: 0.2,      // 20% of minimum stock
  OVERSTOCK_MULTIPLIER: 1.5, // 150% of maximum stock
} as const;

// Currency settings
export const CURRENCY_SETTINGS = {
  DEFAULT_CURRENCY: 'USD',
  DECIMAL_PLACES: 2,
} as const;

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy HH:mm',
} as const;

// Table column keys
export const TABLE_COLUMNS = {
  PART_NUMBER: 'partNumber',
  PART_NAME: 'partName',
  CATEGORY: 'category',
  BRAND: 'brand',
  QUANTITY_IN_STOCK: 'quantityInStock',
  UNIT_PRICE: 'unitPrice',
  STATUS: 'status',
  STOCK_LEVEL: 'stockLevel',
  CREATED_AT: 'createdAt',
  ACTIONS: 'actions',
} as const;

// Stock movement column keys
export const MOVEMENT_COLUMNS = {
  DATE: 'date',
  MOVEMENT_TYPE: 'movementType',
  QUANTITY: 'quantity',
  REASON: 'reason',
  REFERENCE: 'referenceNumber',
  PERFORMED_BY: 'performedBy',
  PREVIOUS_STOCK: 'previousStock',
  NEW_STOCK: 'newStock',
} as const;

// Default spare part categories
export const DEFAULT_CATEGORIES = [
  {
    name: 'Engine Parts',
    subcategories: ['Pistons', 'Valves', 'Gaskets', 'Belts', 'Spark Plugs']
  },
  {
    name: 'Transmission',
    subcategories: ['Gears', 'Clutch', 'Torque Converter', 'Seals']
  },
  {
    name: 'Brakes',
    subcategories: ['Brake Pads', 'Brake Discs', 'Brake Fluid', 'Calipers']
  },
  {
    name: 'Suspension',
    subcategories: ['Shock Absorbers', 'Springs', 'Struts', 'Bushings']
  },
  {
    name: 'Electrical',
    subcategories: ['Batteries', 'Alternators', 'Starters', 'Wiring', 'Fuses']
  },
  {
    name: 'Body Parts',
    subcategories: ['Bumpers', 'Doors', 'Mirrors', 'Glass', 'Trim']
  },
  {
    name: 'Interior',
    subcategories: ['Seats', 'Dashboard', 'Carpets', 'Controls']
  },
  {
    name: 'Filters',
    subcategories: ['Air Filter', 'Oil Filter', 'Fuel Filter', 'Cabin Filter']
  },
  {
    name: 'Fluids & Oils',
    subcategories: ['Engine Oil', 'Transmission Fluid', 'Coolant', 'Brake Fluid']
  },
  {
    name: 'Tires & Wheels',
    subcategories: ['Tires', 'Rims', 'Wheel Bolts', 'Valve Stems']
  },
] as const;

// Popular brands
export const POPULAR_BRANDS = [
  'Bosch',
  'Denso',
  'Continental',
  'Delphi',
  'Valeo',
  'Mahle',
  'NGK',
  'Champion',
  'Febi',
  'Gates',
  'Mann-Filter',
  'Hella',
  'TRW',
  'Sachs',
  'Bilstein',
] as const;

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_NUMBER: 'Please enter a valid number',
  NEGATIVE_NUMBER: 'Value cannot be negative',
  ZERO_QUANTITY: 'Quantity must be greater than zero',
  DUPLICATE_PART_NUMBER: 'A spare part with this part number already exists',
  INVALID_STOCK_LEVEL: 'Invalid stock level configuration',
  NETWORK_ERROR: 'Network error. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred',
  FILE_TOO_LARGE: 'File size is too large',
  INVALID_FILE_TYPE: 'Invalid file type',
  IMPORT_FAILED: 'Import failed. Please check your file format.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  SPARE_PART_CREATED: 'Spare part created successfully',
  SPARE_PART_UPDATED: 'Spare part updated successfully',
  SPARE_PART_DELETED: 'Spare part deleted successfully',
  STOCK_ADJUSTED: 'Stock level adjusted successfully',
  BULK_IMPORT_SUCCESS: 'Spare parts imported successfully',
  EXPORT_SUCCESS: 'Data exported successfully',
  CATEGORY_CREATED: 'Category created successfully',
  CATEGORY_UPDATED: 'Category updated successfully',
  CATEGORY_DELETED: 'Category deleted successfully',
} as const;

// Loading states
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

// Modal types
export const MODAL_TYPES = {
  CREATE_SPARE_PART: 'createSparePart',
  EDIT_SPARE_PART: 'editSparePart',
  DELETE_SPARE_PART: 'deleteSparePart',
  ADJUST_STOCK: 'adjustStock',
  VIEW_MOVEMENTS: 'viewMovements',
  BULK_IMPORT: 'bulkImport',
  CREATE_CATEGORY: 'createCategory',
} as const;

// File upload settings
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['.csv', '.xlsx', '.xls'],
  MIME_TYPES: [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
} as const;

// Export formats
export const EXPORT_FORMATS = {
  CSV: 'csv',
  EXCEL: 'xlsx',
  PDF: 'pdf',
} as const;

// Report types
export const REPORT_TYPES = {
  STOCK_REPORT: 'stock_report',
  LOW_STOCK_REPORT: 'low_stock_report',
  REORDER_REPORT: 'reorder_report',
  MOVEMENT_REPORT: 'movement_report',
  VALUATION_REPORT: 'valuation_report',
} as const;

// Dashboard metrics
export const DASHBOARD_METRICS = {
  TOTAL_PARTS: 'total_parts',
  TOTAL_VALUE: 'total_value',
  LOW_STOCK_COUNT: 'low_stock_count',
  OUT_OF_STOCK_COUNT: 'out_of_stock_count',
  REORDER_COUNT: 'reorder_count',
  RECENT_MOVEMENTS: 'recent_movements',
} as const;
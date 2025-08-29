// Export all warehouse components
export { default as WarehouseList } from './WarehouseList';
export { default as WarehouseCreate } from './WarehouseCreate';
export { default as WarehouseEdit } from './WarehouseEdit';
export { default as WarehouseManage } from './WarehouseManage';

// Re-export types for convenience
export type {
  Warehouse,
  WarehouseFormData,
  WarehousesResponse,
  WarehouseResponse,
  WarehouseSearchParams,
  StockTransferItem,
  StockTransferData,
  WarehouseStats,
  WarehousePermissions,
  StockPermissions,
  WarehouseUIState,
} from '../types';
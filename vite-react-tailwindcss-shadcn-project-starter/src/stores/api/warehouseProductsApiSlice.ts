import { apiSlice } from './apiSlice';
import { Product } from './productsApiSlice';

// Warehouse Product Types
export interface WarehouseProduct {
  warehouseProductId: string;
  warehouseId: string;
  productId: string;
  quantity: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderPoint?: number;
  location?: string;
  aisle?: string;
  shelf?: string;
  bin?: string;
  lastRestocked?: string;
  createdAt: string;
  updatedAt: string;
  // Related data
  product?: Product;
  warehouseName?: string;
}

export interface WarehouseProductsResponse {
  warehouseProducts: WarehouseProduct[];
  total: number;
  page: number;
  limit: number;
  warehouseId: string;
  warehouseName?: string;
}

export interface WarehouseProductFormData {
  productId: string;
  quantity: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderPoint?: number;
  location?: string;
  aisle?: string;
  shelf?: string;
  bin?: string;
}

export interface StockMovement {
  movementId: string;
  warehouseProductId: string;
  movementType: 'in' | 'out' | 'transfer' | 'adjustment';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason?: string;
  reference?: string;
  userId?: string;
  userName?: string;
  createdAt: string;
}

export interface StockMovementResponse {
  movements: StockMovement[];
  total: number;
  page: number;
  limit: number;
}

export interface WarehouseProductSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  lowStock?: boolean;
  outOfStock?: boolean;
}

export const warehouseProductsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get products in a specific warehouse
    getWarehouseProducts: builder.query<WarehouseProductsResponse, { warehouseId: string } & WarehouseProductSearchParams>({
      query: ({ warehouseId, page = 1, limit = 10, search = '', categoryId, lowStock, outOfStock }) => ({
        url: `/warehouseproducts/${warehouseId}`,
        params: {
          page,
          limit,
          search,
          ...(categoryId && { categoryId }),
          ...(lowStock !== undefined && { lowStock }),
          ...(outOfStock !== undefined && { outOfStock }),
        },
      }),
      providesTags: (result, error, { warehouseId }) => [
        { type: 'WarehouseProduct', id: `WAREHOUSE-${warehouseId}` },
        { type: 'WarehouseProduct', id: 'LIST' },
      ],
    }),

    // Get single warehouse product
    getSingleWarehouseProduct: builder.query<WarehouseProduct, string>({
      query: (warehouseProductId) => `/warehouseproducts/item/${warehouseProductId}`,
      providesTags: (result, error, id) => [{ type: 'WarehouseProduct', id }],
    }),

    // Add product to warehouse
    addProductToWarehouse: builder.mutation<WarehouseProduct, { warehouseId: string } & WarehouseProductFormData>({
      query: ({ warehouseId, ...productData }) => ({
        url: `/warehouseproducts/${warehouseId}`,
        method: 'POST',
        body: productData,
      }),
      invalidatesTags: (result, error, { warehouseId }) => [
        { type: 'WarehouseProduct', id: `WAREHOUSE-${warehouseId}` },
        { type: 'WarehouseProduct', id: 'LIST' },
      ],
    }),

    // Update warehouse product
    updateWarehouseProduct: builder.mutation<WarehouseProduct, { warehouseProductId: string; data: Partial<WarehouseProductFormData> }>({
      query: ({ warehouseProductId, data }) => ({
        url: `/warehouseproducts/item/${warehouseProductId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { warehouseProductId }) => [
        { type: 'WarehouseProduct', id: warehouseProductId },
        { type: 'WarehouseProduct', id: 'LIST' },
      ],
    }),

    // Remove product from warehouse
    removeProductFromWarehouse: builder.mutation<{ message: string }, string>({
      query: (warehouseProductId) => ({
        url: `/warehouseproducts/item/${warehouseProductId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, warehouseProductId) => [
        { type: 'WarehouseProduct', id: warehouseProductId },
        { type: 'WarehouseProduct', id: 'LIST' },
      ],
    }),

    // Update stock quantity
    updateStock: builder.mutation<WarehouseProduct, { warehouseProductId: string; quantity: number; movementType: 'in' | 'out' | 'adjustment'; reason?: string }>({
      query: ({ warehouseProductId, quantity, movementType, reason }) => ({
        url: `/warehouseproducts/item/${warehouseProductId}/stock`,
        method: 'PUT',
        body: { quantity, movementType, reason },
      }),
      invalidatesTags: (result, error, { warehouseProductId }) => [
        { type: 'WarehouseProduct', id: warehouseProductId },
        { type: 'WarehouseProduct', id: 'LIST' },
        { type: 'StockMovement', id: 'LIST' },
      ],
    }),

    // Transfer stock between warehouses
    transferStock: builder.mutation<{ message: string }, { fromWarehouseId: string; toWarehouseId: string; productId: string; quantity: number; reason?: string }>({
      query: ({ fromWarehouseId, toWarehouseId, productId, quantity, reason }) => ({
        url: '/warehouseproducts/transfer',
        method: 'POST',
        body: { fromWarehouseId, toWarehouseId, productId, quantity, reason },
      }),
      invalidatesTags: [
        { type: 'WarehouseProduct', id: 'LIST' },
        { type: 'StockMovement', id: 'LIST' },
      ],
    }),

    // Get stock movements for a warehouse product
    getStockMovements: builder.query<StockMovementResponse, { warehouseProductId: string; page?: number; limit?: number }>({
      query: ({ warehouseProductId, page = 1, limit = 10 }) => ({
        url: `/warehouseproducts/item/${warehouseProductId}/movements`,
        params: { page, limit },
      }),
      providesTags: (result, error, { warehouseProductId }) => [
        { type: 'StockMovement', id: `PRODUCT-${warehouseProductId}` },
      ],
    }),

    // Get low stock products across all warehouses
    getLowStockProducts: builder.query<WarehouseProductsResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: '/warehouseproducts/low-stock',
        params: { page, limit },
      }),
      providesTags: [{ type: 'WarehouseProduct', id: 'LOW-STOCK' }],
    }),

    // Get out of stock products
    getOutOfStockProducts: builder.query<WarehouseProductsResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: '/warehouseproducts/out-of-stock',
        params: { page, limit },
      }),
      providesTags: [{ type: 'WarehouseProduct', id: 'OUT-OF-STOCK' }],
    }),

    // Get warehouse inventory report
    getWarehouseInventoryReport: builder.query<any, string>({
      query: (warehouseId) => `/warehouseproducts/${warehouseId}/report`,
      providesTags: (result, error, warehouseId) => [
        { type: 'WarehouseProduct', id: `REPORT-${warehouseId}` },
      ],
    }),

    // Search products across warehouses
    searchWarehouseProducts: builder.query<WarehouseProductsResponse, { query: string; warehouseId?: string; filters?: any }>({
      query: ({ query, warehouseId, filters = {} }) => ({
        url: '/warehouseproducts/search',
        params: {
          q: query,
          ...(warehouseId && { warehouseId }),
          ...filters,
        },
      }),
      providesTags: [{ type: 'WarehouseProduct', id: 'SEARCH' }],
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetWarehouseProductsQuery,
  useGetSingleWarehouseProductQuery,
  useAddProductToWarehouseMutation,
  useUpdateWarehouseProductMutation,
  useRemoveProductFromWarehouseMutation,
  useUpdateStockMutation,
  useTransferStockMutation,
  useGetStockMovementsQuery,
  useGetLowStockProductsQuery,
  useGetOutOfStockProductsQuery,
  useGetWarehouseInventoryReportQuery,
  useSearchWarehouseProductsQuery,
} = warehouseProductsApiSlice;

// Export endpoints for use in other slices
export const {
  endpoints: {
    getWarehouseProducts,
    getSingleWarehouseProduct,
    addProductToWarehouse,
    updateWarehouseProduct,
    removeProductFromWarehouse,
    updateStock,
    transferStock,
    getStockMovements,
    getLowStockProducts,
    getOutOfStockProducts,
    getWarehouseInventoryReport,
    searchWarehouseProducts,
  },
} = warehouseProductsApiSlice;
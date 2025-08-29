import { apiSlice } from './apiSlice';

// Warehouse Types
export interface Warehouse {
  warehouseId: string;
  name: string;
  location?: string;
  address?: string;
  capacity?: number;
  managerId?: string;
  managerName?: string;
  phone?: string;
  email?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface WarehouseResponse {
  warehouses: Warehouse[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface WarehouseFormData {
  name: string;
  location?: string;
  address?: string;
  capacity?: number;
  managerId?: string;
  phone?: string;
  email?: string;
  status?: 'active' | 'inactive';
}

export const warehouseApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all warehouses
    getWarehouses: builder.query<WarehouseResponse, void>({
      query: () => 'warehouse',
      keepUnusedDataFor: 5,
      providesTags: (result) =>
        result?.warehouses
          ? [
              ...result.warehouses.map(({ warehouseId }) => ({ type: 'Warehouse' as const, id: warehouseId })),
              { type: 'Warehouse', id: 'LIST' },
            ]
          : [{ type: 'Warehouse', id: 'LIST' }],
    }),

    // Get single warehouse by ID
    getSingleWarehouse: builder.query<Warehouse, string>({
      query: (id) => `warehouse/${id}`,
      providesTags: (result, error, id) => [{ type: 'Warehouse', id }],
    }),

    // Create new warehouse
    postWarehouse: builder.mutation<Warehouse, WarehouseFormData>({
      query: (newWarehouse) => ({
        url: 'warehouse',
        method: 'POST',
        body: newWarehouse,
      }),
      invalidatesTags: [{ type: 'Warehouse', id: 'LIST' }],
    }),

    // Update existing warehouse
    putWarehouse: builder.mutation<Warehouse, { id: string; updatedWarehouse: Partial<WarehouseFormData> }>({
      query: ({ id, updatedWarehouse }) => ({
        url: `warehouse/${id}`,
        method: 'PUT',
        body: updatedWarehouse,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Warehouse', id },
        { type: 'Warehouse', id: 'LIST' },
      ],
    }),

    // Delete warehouse
    deleteWarehouse: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `warehouse/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Warehouse', id },
        { type: 'Warehouse', id: 'LIST' },
      ],
    }),

    // Get warehouse statistics
    getWarehouseStats: builder.query<any, string>({
      query: (warehouseId) => `warehouse/${warehouseId}/stats`,
      providesTags: (result, error, warehouseId) => [
        { type: 'Warehouse', id: `${warehouseId}-stats` },
      ],
    }),

    // Search warehouses
    searchWarehouses: builder.query<WarehouseResponse, { query: string; filters?: any }>({
      query: ({ query, filters = {} }) => ({
        url: 'warehouse/search',
        params: {
          q: query,
          ...filters,
        },
      }),
      providesTags: [{ type: 'Warehouse', id: 'SEARCH' }],
    }),

    // Get warehouses by status
    getWarehousesByStatus: builder.query<WarehouseResponse, 'active' | 'inactive'>({
      query: (status) => `warehouse/status/${status}`,
      providesTags: (result, error, status) => [
        { type: 'Warehouse', id: `STATUS-${status}` },
      ],
    }),

    // Get warehouse capacity report
    getWarehouseCapacityReport: builder.query<any, void>({
      query: () => 'warehouse/capacity-report',
      providesTags: [{ type: 'Warehouse', id: 'CAPACITY-REPORT' }],
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetWarehousesQuery,
  useGetSingleWarehouseQuery,
  usePostWarehouseMutation,
  usePutWarehouseMutation,
  useDeleteWarehouseMutation,
  useGetWarehouseStatsQuery,
  useSearchWarehousesQuery,
  useGetWarehousesByStatusQuery,
  useGetWarehouseCapacityReportQuery,
} = warehouseApiSlice;

// Export endpoints for use in other slices
export const {
  endpoints: {
    getWarehouses,
    getSingleWarehouse,
    postWarehouse,
    putWarehouse,
    deleteWarehouse,
    getWarehouseStats,
    searchWarehouses,
    getWarehousesByStatus,
    getWarehouseCapacityReport,
  },
} = warehouseApiSlice;
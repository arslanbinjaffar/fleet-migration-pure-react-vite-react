import { apiSlice } from './apiSlice';

// Product Types
export interface Product {
  productId: string;
  name: string;
  description?: string;
  price: number;
  categoryId?: string;
  warehouseId?: string;
  quantity?: number;
  sku?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductsResponse {
  products: Product[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  categoryId?: string;
  warehouseId?: string;
  quantity?: number;
  sku?: string;
}

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all products
    getProducts: builder.query<ProductsResponse, void>({
      query: () => 'products',
      keepUnusedDataFor: 5,
      providesTags: (result) =>
        result?.products
          ? [
              ...result.products.map(({ productId }) => ({ type: 'Product' as const, id: productId })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    // Get single product by ID
    getSingleProduct: builder.query<Product, string>({
      query: (id) => `products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    // Create new product
    postProduct: builder.mutation<Product, ProductFormData>({
      query: (newProduct) => ({
        url: 'products',
        method: 'POST',
        body: newProduct,
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    // Update existing product
    putProduct: builder.mutation<Product, { id: string; updatedProduct: Partial<ProductFormData> }>({
      query: ({ id, updatedProduct }) => ({
        url: `products/${id}`,
        method: 'PUT',
        body: updatedProduct,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    // Delete product
    deleteProduct: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    // Upload product image
    uploadProductImage: builder.mutation<{ imageUrl: string }, FormData>({
      query: (formData) => ({
        url: 'products/upload-image',
        method: 'POST',
        body: formData,
      }),
    }),

    // Search products
    searchProducts: builder.query<ProductsResponse, { query: string; filters?: any }>({
      query: ({ query, filters = {} }) => ({
        url: 'products/search',
        params: {
          q: query,
          ...filters,
        },
      }),
      providesTags: [{ type: 'Product', id: 'SEARCH' }],
    }),

    // Get products by category
    getProductsByCategory: builder.query<ProductsResponse, string>({
      query: (categoryId) => `products/category/${categoryId}`,
      providesTags: (result, error, categoryId) => [
        { type: 'Product', id: `CATEGORY-${categoryId}` },
      ],
    }),

    // Get products by warehouse
    getProductsByWarehouse: builder.query<ProductsResponse, string>({
      query: (warehouseId) => `products/warehouse/${warehouseId}`,
      providesTags: (result, error, warehouseId) => [
        { type: 'Product', id: `WAREHOUSE-${warehouseId}` },
      ],
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetProductsQuery,
  useGetSingleProductQuery,
  usePostProductMutation,
  usePutProductMutation,
  useDeleteProductMutation,
  useUploadProductImageMutation,
  useSearchProductsQuery,
  useGetProductsByCategoryQuery,
  useGetProductsByWarehouseQuery,
} = productApiSlice;

// Export endpoints for use in other slices
export const {
  endpoints: {
    getProducts,
    getSingleProduct,
    postProduct,
    putProduct,
    deleteProduct,
    uploadProductImage,
    searchProducts,
    getProductsByCategory,
    getProductsByWarehouse,
  },
} = productApiSlice;
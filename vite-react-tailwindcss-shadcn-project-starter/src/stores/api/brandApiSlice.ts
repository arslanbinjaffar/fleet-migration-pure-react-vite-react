import type {
  Brand,
  BrandFormData,
  BrandsResponse,
  BrandResponse,
} from '../../modules/inventory/brand/types';
import { apiSlice } from './apiSlice';


// Brand API slice
export const brandApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all brands
    getBrands: builder.query<BrandsResponse, void>({
      query: () => 'brand',
      providesTags: ['Brand'],
      keepUnusedDataFor: 5,
    }),

    // Get single brand by ID
    getSingleBrand: builder.query<BrandResponse, string>({
      query: (id) => `brand/${id}`,
      providesTags: (result, error, id) => [{ type: 'Brand', id }],
    }),

    // Create new brand
    postBrand: builder.mutation<BrandResponse, BrandFormData>({
      query: (newBrand) => ({
        url: 'brand',
        method: 'POST',
        body: newBrand,
      }),
      invalidatesTags: ['Brand'],
    }),

    // Update existing brand
    putBrand: builder.mutation<
      BrandResponse,
      { id: string; updatedBrand: Partial<BrandFormData> }
    >({
      query: ({ id, updatedBrand }) => ({
        url: `brand/${id}`,
        method: 'PUT',
        body: updatedBrand,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Brand', id }, 'Brand'],
    }),

    // Delete brand (soft delete)
    deleteBrand: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (id) => ({
        url: `brand/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Brand'],
    }),

    // Bulk delete brands
    bulkDeleteBrands: builder.mutation<
      { success: boolean; message?: string },
      { ids: string[] }
    >({
      query: ({ ids }) => ({
        url: 'brand/bulk-delete',
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: ['Brand'],
    }),

    // Search brands
    searchBrands: builder.query<
      BrandsResponse,
      {
        search?: string;
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
      }
    >({
      query: ({ search, page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc' }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          sortBy,
          sortOrder,
        });
        
        if (search) {
          params.append('search', search);
        }
        
        return `brand/search?${params.toString()}`;
      },
      providesTags: ['Brand'],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetBrandsQuery,
  useGetSingleBrandQuery,
  usePostBrandMutation,
  usePutBrandMutation,
  useDeleteBrandMutation,
  useBulkDeleteBrandsMutation,
  useSearchBrandsQuery,
} = brandApiSlice;

// Export the reducer
export default brandApiSlice.reducer;
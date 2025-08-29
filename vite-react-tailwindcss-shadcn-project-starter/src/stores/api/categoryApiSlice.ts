import { apiSlice } from './apiSlice';

// Category Types
export interface Category {
  categoryId: string;
  name: string;
  description?: string;
  parentCategoryId?: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
  // Related data
  parentCategory?: Category;
  subCategories?: Category[];
  productCount?: number;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  parentCategoryId?: string;
  imageUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface CategoriesResponse {
  categories: Category[];
  total: number;
  page: number;
  limit: number;
}

export interface SingleCategoryResponse {
  category: Category;
}

export interface CategorySearchParams {
  page?: number;
  limit?: number;
  search?: string;
  parentCategoryId?: string;
  isActive?: boolean;
  includeSubCategories?: boolean;
}

export interface CategoryTreeNode {
  categoryId: string;
  name: string;
  description?: string;
  isActive: boolean;
  productCount: number;
  children: CategoryTreeNode[];
}

export const categoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all categories
    getCategories: builder.query<CategoriesResponse, CategorySearchParams>({
      query: ({ page = 1, limit = 10, search = '', parentCategoryId, isActive, includeSubCategories } = {}) => ({
        url: '/category',
        params: {
          page,
          limit,
          search,
          ...(parentCategoryId && { parentCategoryId }),
          ...(isActive !== undefined && { isActive }),
          ...(includeSubCategories !== undefined && { includeSubCategories }),
        },
      }),
      keepUnusedDataFor: 5,
      providesTags: (result) =>
        result?.categories
          ? [
              ...result.categories.map(({ categoryId }) => ({ type: 'Category' as const, id: categoryId })),
              { type: 'Category', id: 'LIST' },
            ]
          : [{ type: 'Category', id: 'LIST' }],
    }),

    // Get single category by ID
    getSingleCategory: builder.query<SingleCategoryResponse, string>({
      query: (id) => `/category/${id}`,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),

    // Create new category
    postCategory: builder.mutation<SingleCategoryResponse, CategoryFormData>({
      query: (newCategory) => ({
        url: '/category',
        method: 'POST',
        body: newCategory,
      }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),

    // Update category
    putCategory: builder.mutation<SingleCategoryResponse, { id: string; updatedCategory: Partial<CategoryFormData> }>({
      query: ({ id, updatedCategory }) => ({
        url: `/category/${id}`,
        method: 'PUT',
        body: updatedCategory,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
      ],
    }),

    // Delete category
    deleteCategory: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/category/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
      ],
    }),

    // Get category tree (hierarchical structure)
    getCategoryTree: builder.query<CategoryTreeNode[], void>({
      query: () => '/category/tree',
      providesTags: [{ type: 'Category', id: 'TREE' }],
    }),

    // Get root categories (categories without parent)
    getRootCategories: builder.query<CategoriesResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: '/category/root',
        params: { page, limit },
      }),
      providesTags: [{ type: 'Category', id: 'ROOT' }],
    }),

    // Get subcategories of a parent category
    getSubCategories: builder.query<CategoriesResponse, { parentId: string; page?: number; limit?: number }>({
      query: ({ parentId, page = 1, limit = 10 }) => ({
        url: `/category/${parentId}/subcategories`,
        params: { page, limit },
      }),
      providesTags: (result, error, { parentId }) => [
        { type: 'Category', id: `SUBCATEGORIES-${parentId}` },
      ],
    }),

    // Search categories
    searchCategories: builder.query<CategoriesResponse, { query: string; filters?: Partial<CategorySearchParams> }>({
      query: ({ query, filters = {} }) => ({
        url: '/category/search',
        params: {
          q: query,
          ...filters,
        },
      }),
      providesTags: [{ type: 'Category', id: 'SEARCH' }],
    }),

    // Get categories with product count
    getCategoriesWithProductCount: builder.query<CategoriesResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: '/category/with-product-count',
        params: { page, limit },
      }),
      providesTags: [{ type: 'Category', id: 'WITH-COUNT' }],
    }),

    // Reorder categories
    reorderCategories: builder.mutation<{ message: string }, { categoryId: string; newSortOrder: number }[]>({
      query: (reorderData) => ({
        url: '/category/reorder',
        method: 'PUT',
        body: { reorderData },
      }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),

    // Bulk operations
    bulkDeleteCategories: builder.mutation<{ message: string }, string[]>({
      query: (categoryIds) => ({
        url: '/category/bulk-delete',
        method: 'DELETE',
        body: { categoryIds },
      }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),

    // Upload category image
    uploadCategoryImage: builder.mutation<{ imageUrl: string }, FormData>({
      query: (formData) => ({
        url: '/category/upload-image',
        method: 'POST',
        body: formData,
      }),
    }),

    // Get category statistics
    getCategoryStatistics: builder.query<any, void>({
      query: () => '/category/statistics',
      providesTags: [{ type: 'Category', id: 'STATISTICS' }],
    }),

    // Move category to different parent
    moveCategoryToParent: builder.mutation<SingleCategoryResponse, { categoryId: string; newParentId?: string }>({
      query: ({ categoryId, newParentId }) => ({
        url: `/category/${categoryId}/move`,
        method: 'PUT',
        body: { newParentId },
      }),
      invalidatesTags: (result, error, { categoryId }) => [
        { type: 'Category', id: categoryId },
        { type: 'Category', id: 'LIST' },
        { type: 'Category', id: 'TREE' },
      ],
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetCategoriesQuery,
  useGetSingleCategoryQuery,
  usePostCategoryMutation,
  usePutCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoryTreeQuery,
  useGetRootCategoriesQuery,
  useGetSubCategoriesQuery,
  useSearchCategoriesQuery,
  useGetCategoriesWithProductCountQuery,
  useReorderCategoriesMutation,
  useBulkDeleteCategoriesMutation,
  useUploadCategoryImageMutation,
  useGetCategoryStatisticsQuery,
  useMoveCategoryToParentMutation,
} = categoryApiSlice;

// Export endpoints for use in other slices
export const {
  endpoints: {
    getCategories,
    getSingleCategory,
    postCategory,
    putCategory,
    deleteCategory,
    getCategoryTree,
    getRootCategories,
    getSubCategories,
    searchCategories,
    getCategoriesWithProductCount,
    reorderCategories,
    bulkDeleteCategories,
    uploadCategoryImage,
    getCategoryStatistics,
    moveCategoryToParent,
  },
} = categoryApiSlice;
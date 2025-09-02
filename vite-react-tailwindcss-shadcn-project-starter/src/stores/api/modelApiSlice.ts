import { apiSlice } from './apiSlice';
import type {
  Model,
  ModelFormData,
  ModelsResponse,
  ModelResponse,
  ModelSearchParams,
} from '../../modules/inventory/model/types';

// Model API slice
export const modelApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all models
    getModels: builder.query<ModelsResponse, ModelSearchParams | void>({
      query: (params = {}) => ({
        url: 'model',
        params,
      }),
      keepUnusedDataFor: 5,
      providesTags: (result) =>
        result?.model
          ? [
              ...result.model.map(({ modelId }) => ({ type: 'Model' as const, id: modelId })),
              { type: 'Model', id: 'LIST' },
            ]
          : [{ type: 'Model', id: 'LIST' }],
    }),

    // Get single model by ID
    getSingleModel: builder.query<ModelResponse, string>({
      query: (id) => `model/${id}`,
      providesTags: (result, error, id) => [{ type: 'Model', id }],
    }),

    // Create new model
    createModel: builder.mutation<ModelResponse, ModelFormData>({
      query: (newModel) => ({
        url: 'model',
        method: 'POST',
        body: newModel,
      }),
      invalidatesTags: [{ type: 'Model', id: 'LIST' }],
      transformResponse: (response: any) => {
        // Handle success response
        return {
          model: response.model || response,
          message: response.message || 'Model created successfully',
        };
      },
    }),

    // Update existing model
    updateModel: builder.mutation<ModelResponse, { id: string; updateModel: Partial<ModelFormData> }>({
      query: ({ id, updateModel }) => ({
        url: `model/${id}`,
        method: 'PUT',
        body: updateModel,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Model', id },
        { type: 'Model', id: 'LIST' },
      ],
      transformResponse: (response: any) => {
        // Handle success response
        return {
          model: response.model || response,
          message: response.message || 'Model updated successfully',
        };
      },
    }),

    // Delete model
    deleteModel: builder.mutation<{ message: string }, string>({
      query: (modelId) => ({
        url: `model/${modelId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, modelId) => [
        { type: 'Model', id: modelId },
        { type: 'Model', id: 'LIST' },
      ],
      transformResponse: (response: any) => {
        return {
          message: response.message || 'Model deleted successfully',
        };
      },
    }),

    // Search models (if needed for advanced search)
    searchModels: builder.query<ModelsResponse, ModelSearchParams>({
      query: (searchParams) => ({
        url: 'model/search',
        params: searchParams,
      }),
      providesTags: [{ type: 'Model', id: 'SEARCH' }],
    }),

    // Get model statistics (if needed)
    getModelStats: builder.query<any, void>({
      query: () => 'model/stats',
      providesTags: [{ type: 'Model', id: 'STATS' }],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetModelsQuery,
  useGetSingleModelQuery,
  useCreateModelMutation,
  useUpdateModelMutation,
  useDeleteModelMutation,
  useSearchModelsQuery,
  useGetModelStatsQuery,
} = modelApiSlice;

// Export endpoints for use in other slices if needed
export const {
  endpoints: {
    getModels,
    getSingleModel,
    createModel,
    updateModel,
    deleteModel,
    searchModels,
    getModelStats,
  },
} = modelApiSlice;
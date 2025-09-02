import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define the base URL for your API
const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Define a service using a base URL and expected endpoints
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState, endpoint, type, extraOptions }) => {
      // Add auth token if available
      const token = (getState() as any).user?.token;
      if (token) {
        headers.set('authorization', `${token}`);
      }
      
      // Don't set content-type for FormData (let browser set it with boundary)
      // if (!(extraOptions as any)?.formData) {
      //   headers.set('content-type', 'application/json');
      // }
      
      return headers;
    },
  }),
  tagTypes: ['User', 'Dashboard', 'HRM', 'MRM', 'Finance', 'GOM', 'Roles', 'Model','Notification', 'Brand'],
  endpoints: (builder) => ({
    // Example endpoint - you can add more as needed
    getUsers: builder.query<any[], void>({
      query: () => '/users',
      providesTags: ['User'],
    }),
    getUserById: builder.query<any, string>({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    createUser: builder.mutation<any, Partial<any>>({
      query: (newUser) => ({
        url: '/users',
        method: 'POST',
        body: newUser,
      }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation<any, { id: string; data: Partial<any> }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = apiSlice;
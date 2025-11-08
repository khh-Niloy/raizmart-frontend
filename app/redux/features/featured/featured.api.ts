import { baseApi } from "../../baseApi";

interface ApiResponse<T> {
  data?: T;
}

export const featuredApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Featured Items
    getFeaturedItems: builder.query({
      query: () => ({
        url: "/featured-items",
        method: "GET",
      }),
      transformResponse: <T,>(response: unknown): T => {
        const apiResponse = response as ApiResponse<T>;
        return (apiResponse && 'data' in apiResponse ? apiResponse.data : apiResponse) as T;
      },
      providesTags: ["FEATURED_ITEMS"],
    }),

    createFeaturedItem: builder.mutation({
      query: (payload: Record<string, unknown>) => ({
        url: "/featured-items",
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["FEATURED_ITEMS"],
    }),

    updateFeaturedItem: builder.mutation({
      query: ({ id, ...payload }: { id: string; [key: string]: unknown }) => ({
        url: `/featured-items/${id}`,
        method: "PUT",
        data: payload,
      }),
      invalidatesTags: ["FEATURED_ITEMS"],
    }),

    deleteFeaturedItem: builder.mutation({
      query: (id: string) => ({
        url: `/featured-items/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FEATURED_ITEMS"],
    }),
  }),
});

export const {
  useGetFeaturedItemsQuery,
  useCreateFeaturedItemMutation,
  useUpdateFeaturedItemMutation,
  useDeleteFeaturedItemMutation,
} = featuredApi;

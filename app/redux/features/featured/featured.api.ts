import { baseApi } from "../../baseApi";

export const featuredApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Featured Items
    getFeaturedItems: builder.query({
      query: () => ({
        url: "/featured-items",
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ["FEATURED_ITEMS"],
    }),

    createFeaturedItem: builder.mutation({
      query: (payload) => ({
        url: "/featured-items",
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["FEATURED_ITEMS"],
    }),

    updateFeaturedItem: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/featured-items/${id}`,
        method: "PUT",
        data: payload,
      }),
      invalidatesTags: ["FEATURED_ITEMS"],
    }),

    deleteFeaturedItem: builder.mutation({
      query: (id) => ({
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

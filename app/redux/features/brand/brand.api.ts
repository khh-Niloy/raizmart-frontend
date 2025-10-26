import { baseApi } from "../../baseApi"

export const brandApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create Brand
    createBrand: builder.mutation({
      query: (payload) => ({
        url: "/brands",
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["BRANDS"],
    }),

    // Get Brands
    getBrands: builder.query({
      query: () => ({
        url: "/brands",
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ["BRANDS"],
    }),

    // Update Brand
    updateBrand: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/brands/${id}`,
        method: "PATCH",
        data: payload,
      }),
      invalidatesTags: ["BRANDS"],
    }),
  }),
})

export const {
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useGetBrandsQuery,
} = brandApi

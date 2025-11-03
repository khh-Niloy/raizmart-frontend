import { baseApi } from "../../baseApi"

export const brandApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create Brand
    createBrand: builder.mutation({
      query: (formData) => ({
        url: "/brands",
        method: "POST",
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
      query: ({ id, formData }) => ({
        url: `/brands/${id}`,
        method: "PATCH",
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: ["BRANDS"],
    }),

    // Get products by brand name
    getBrandProducts: builder.query({
      query: ({ brand, page = 1, limit = 12, sort = "newest" }: { brand: string; page?: number; limit?: number; sort?: string }) => ({
        url: `/brands/${encodeURIComponent(brand)}?page=${page}&limit=${limit}&sort=${sort}`,
        method: "GET",
      }),
      transformResponse: (response: any) => response,
      providesTags: ["PRODUCTS", "BRANDS"],
    }),
  }),
})

export const {
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useGetBrandsQuery,
  useGetBrandProductsQuery,
} = brandApi

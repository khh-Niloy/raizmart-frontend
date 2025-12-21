import { baseApi } from "../../baseApi"

interface ApiResponse<T> {
  data?: T;
}

export const brandApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create Brand
    createBrand: builder.mutation({
      query: (formData: FormData) => ({
        url: "/brands",
        method: "POST",
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: ["BRANDS"],
    }),

    // Get All Brands (No pagination)
    getBrands: builder.query({
      query: () => ({
        url: "/brands",
        method: "GET",
      }),
      transformResponse: (response: any) => {
        return response?.data || response?.items || [];
      },
      providesTags: ["BRANDS"],
    }),

    // Update Brand
    updateBrand: builder.mutation({
      query: ({ id, formData }: { id: string; formData: FormData }) => ({
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
      transformResponse: <T,>(response: unknown): T => response as T,
      providesTags: ["PRODUCTS", "BRANDS"],
    }),

    // Delete Brand
    deleteBrand: builder.mutation({
      query: (id: string) => ({
        url: `/brands/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BRANDS"],
    }),
  }),
})

export const {
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useGetBrandsQuery,
  useGetBrandProductsQuery,
  useDeleteBrandMutation,
} = brandApi

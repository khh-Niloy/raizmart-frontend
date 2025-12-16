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

    // Get Brands (with pagination)
    getBrands: builder.query({
      query: (params?: {
        page?: number;
        limit?: number;
        sort?: string;
      }) => {
        const qs = new URLSearchParams(
          Object.entries(params || {}).reduce((acc, [k, v]) => {
            if (v !== undefined && v !== null && v !== "") acc[k] = String(v);
            return acc;
          }, {} as Record<string, string>)
        ).toString();
        return {
          url: `/brands${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      transformResponse: <T,>(response: unknown): T => {
        // Backend now returns { items, meta } format
        const apiResponse = response as ApiResponse<T> | { items: T[]; meta: unknown };
        if (apiResponse && 'items' in apiResponse) {
          return apiResponse as T;
        }
        return (apiResponse && 'data' in apiResponse ? apiResponse.data : apiResponse) as T;
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

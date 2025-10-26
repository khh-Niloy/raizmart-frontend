import { baseApi } from "../../baseApi"

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create Product
    createProduct: builder.mutation({
      query: (formData) => ({
        url: "/products",
        method: "POST",
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: ["PRODUCTS"],
    }),

    // Get All Products
    getProducts: builder.query({
      query: () => ({
        url: "/products",
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ["PRODUCTS"],
    }),

    // Get Featured Products
    getFeaturedProducts: builder.query({
      query: () => ({
        url: "/products/featured",
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ["PRODUCTS"],
    }),

    // Update Product
    updateProduct: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: ["PRODUCTS"],
    }),

    // Toggle Featured Status
    toggleFeatured: builder.mutation({
      query: ({ id, isFeatured }) => ({
        url: `/products/${id}/featured`,
        method: "PATCH",
        data: { isFeatured },
      }),
      invalidatesTags: ["PRODUCTS"],
    }),
  }),
})

export const {
  useCreateProductMutation,
  useGetProductsQuery,
  useGetFeaturedProductsQuery,
  useUpdateProductMutation,
  useToggleFeaturedMutation,
} = productApi

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

    // Get Single Product by ID
    getProductById: builder.query({
      query: (id: string) => ({
        url: `/products/${id}`,
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

    // Get Products by hierarchical slugs (category/subcategory/subsubcategory)
    getProductsBySlugs: builder.query({
      query: (params: {
        category?: string;
        subcategory?: string;
        subsubcategory?: string;
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
          url: `/products/by-slugs?${qs}`,
          method: "GET",
        };
      },
      // backend already returns the full envelope we need
      transformResponse: (response: any) => response,
      providesTags: ["PRODUCTS"],
    }),

    // Get single product by slug (for PDP)
    getProductBySlug: builder.query({
      query: (slug: string) => ({
        url: `/products/by-slug?slug=${encodeURIComponent(slug)}`,
        method: "GET",
      }),
      transformResponse: (response: any) => response,
      providesTags: ["PRODUCTS"],
    }),
  }),
})

export const {
  useCreateProductMutation,
  useGetProductsQuery,
  useGetFeaturedProductsQuery,
  useGetProductByIdQuery,
  useUpdateProductMutation,
  useToggleFeaturedMutation,
  useGetProductsBySlugsQuery,
  useGetProductBySlugQuery,
} = productApi

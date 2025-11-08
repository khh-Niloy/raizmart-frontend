import { baseApi } from "../../baseApi"

interface ApiResponse<T> {
  data?: T;
}

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create Product
    createProduct: builder.mutation({
      query: (formData: FormData) => ({
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
      transformResponse: <T,>(response: unknown): T => {
        const apiResponse = response as ApiResponse<T>;
        return (apiResponse && 'data' in apiResponse ? apiResponse.data : apiResponse) as T;
      },  
      providesTags: ["PRODUCTS"],
    }),

    // Get Featured Products
    getFeaturedProducts: builder.query({
      query: () => ({
        url: "/products/featured",
        method: "GET",
      }),
      transformResponse: <T,>(response: unknown): T => {
        const apiResponse = response as ApiResponse<T>;
        return (apiResponse && 'data' in apiResponse ? apiResponse.data : apiResponse) as T;
      },
      providesTags: ["PRODUCTS"],
    }),

    // Get Single Product by ID
    getProductById: builder.query({
      query: (id: string) => ({
        url: `/products/${id}`,
        method: "GET",
      }),
      transformResponse: <T,>(response: unknown): T => {
        const apiResponse = response as ApiResponse<T>;
        return (apiResponse && 'data' in apiResponse ? apiResponse.data : apiResponse) as T;
      },
      providesTags: ["PRODUCTS"],
    }),

    // Update Product
    updateProduct: builder.mutation({
      query: ({ id, formData }: { id: string; formData: FormData }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: ["PRODUCTS"],
    }),

    // Toggle Free Delivery Status
    toggleFreeDelivery: builder.mutation({
      query: ({ id, isFreeDelivery }: { id: string; isFreeDelivery: boolean }) => ({
        url: `/products/${id}/free-delivery`,
        method: "PATCH",
        data: { isFreeDelivery },
      }),
      invalidatesTags: ["PRODUCTS"],
    }),

    // Toggle Featured Status
    toggleFeatured: builder.mutation({
      query: ({ id, isFeatured }: { id: string; isFeatured: boolean }) => ({
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
      transformResponse: <T,>(response: unknown): T => response as T,
      providesTags: ["PRODUCTS"],
    }),

    // Get single product by slug (for PDP)
    getProductBySlug: builder.query({
      query: (slug: string) => ({
        url: `/products/by-slug?slug=${encodeURIComponent(slug)}`,
        method: "GET",
      }),
      transformResponse: <T,>(response: unknown): T => response as T,
      providesTags: ["PRODUCTS"],
    }),

    // Get All Products Stock
    getAllProductsStock: builder.query({
      query: () => ({
        url: "/products/stock",
        method: "GET",
      }),
      transformResponse: <T,>(response: unknown): T => {
        const apiResponse = response as ApiResponse<T>;
        return (apiResponse && 'data' in apiResponse ? apiResponse.data : apiResponse) as T;
      },
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
  useToggleFreeDeliveryMutation,
  useGetProductsBySlugsQuery,
  useGetProductBySlugQuery,
  useGetAllProductsStockQuery,
} = productApi

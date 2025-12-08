import { baseApi } from "../../baseApi"

interface ApiResponse<T> {
  data?: T;
}

export interface ProductVariantOrderSummary {
  sku?: string;
  attributes?: Array<{
    attributeName?: string;
    attributeLabel?: string;
  }>;
  totalQuantity: number;
  totalOrders: number;
  customers: Array<{
    name?: string;
    email?: string;
    phone?: string;
  }>;
}

export interface ProductOrderSummary {
  _id?: string;
  productName?: string;
  productSlug?: string;
  images?: string[];
  totalQuantity: number;
  totalOrders: number;
  variants: ProductVariantOrderSummary[];
  customers: Array<{
    name?: string;
    email?: string;
    phone?: string;
  }>;
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

    // Get Trending Products
    getTrendingProducts: builder.query({
      query: () => ({
        url: "/products/trend",
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

    // Get New Arrivals (last 7 days)
    getNewArrivals: builder.query({
      query: () => ({
        url: "/products/new-arrivals",
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

    // Delete Product (soft delete -> set inactive)
    deleteProduct: builder.mutation({
      query: (id: string) => ({
        url: `/products/${id}`,
        method: "DELETE",
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

    // Toggle Trending Status
    toggleTrending: builder.mutation({
      query: ({ id, isTrending }: { id: string; isTrending: boolean }) => ({
        url: `/products/${id}/trends`,
        method: "PATCH",
        data: { isTrending },
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
    getProductOrderSummary: builder.query<
      ProductOrderSummary[],
      {
        productId?: string;
        limit?: number;
        period?: "day" | "week" | "month";
        startDate?: string;
        endDate?: string;
        status?: string;
      } | void
    >({
      query: (params) => ({
        url: "/products/order-summary",
        method: "GET",
        params: params
          ? Object.entries(params).reduce((acc, [key, value]) => {
              if (value !== undefined && value !== null && value !== "") {
                acc[key] = value;
              }
              return acc;
            }, {} as Record<string, unknown>)
          : undefined,
      }),
      transformResponse: (response: unknown): ProductOrderSummary[] => {
        const apiResponse = response as ApiResponse<ProductOrderSummary[]> | ProductOrderSummary[];
        if (Array.isArray(apiResponse)) {
          return apiResponse;
        }
        if (apiResponse && "data" in apiResponse) {
          return Array.isArray(apiResponse.data) ? apiResponse.data : [];
        }
        return [];
      },
      providesTags: ["PRODUCTS"],
    }),
  }),
})

export const {
  useCreateProductMutation,
  useGetProductsQuery,
  useGetFeaturedProductsQuery,
  useGetNewArrivalsQuery,
  useGetTrendingProductsQuery,
  useGetProductByIdQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useToggleFeaturedMutation,
  useToggleTrendingMutation,
  useToggleFreeDeliveryMutation,
  useGetProductsBySlugsQuery,
  useGetProductBySlugQuery,
  useGetAllProductsStockQuery,
  useGetProductOrderSummaryQuery,
} = productApi

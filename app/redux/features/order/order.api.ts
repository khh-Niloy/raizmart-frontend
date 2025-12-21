import { baseApi } from "../../baseApi";

interface Order {
  _id: string;
  orderNumber?: string;
  user?: string;
  items?: OrderItem[];
  total?: number;
  status?: string;
  createdAt?: string;
  [key: string]: unknown;
}

interface OrderItem {
  product?: string;
  variant?: string;
  quantity?: number;
  price?: number;
  [key: string]: unknown;
}

interface OrderResponse {
  items?: Order[];
  data?: Order;
}

interface OrderMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

interface SearchOrdersResponse {
  items: Order[];
  users: unknown[];
  meta: OrderMeta;
}

export interface UserOrderSummaryProduct {
  productId?: string;
  productName?: string;
  productSlug?: string;
  sku?: string;
  images?: string[];
  attributes?: Array<{
    attributeName?: string;
    attributeLabel?: string;
  }>;
  totalQuantity: number;
  totalAmount: number;
}

export interface UserOrderSummary {
  user?: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
    picture?: string;
    role?: string;
    createdAt?: string;
  };
  totalSpent: number;
  orderedProducts: UserOrderSummaryProduct[];
  orderHistory?: Array<{
    orderId?: string;
    orderSlug?: string;
    createdAt?: string;
    grandTotal?: number;
  }>;
}

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyOrders: builder.query<Order[], void>({
      query: () => ({
        url: "/orders/my",
        method: "GET",
      }),
      transformResponse: (response: unknown): Order[] => {
        console.log("response", response);
        const orderResponse = response as OrderResponse | Order[];
        const data = (orderResponse && 'items' in orderResponse ? orderResponse.items : orderResponse) as Order[] | undefined;
        return Array.isArray(data) ? data : [];
      },
      providesTags: ["ORDERS"],
    }),
    getOrderById: builder.query<Order, string>({
      query: (id) => ({
        url: `/orders/${id}`,
        method: "GET",
      }),
      transformResponse: (response: unknown): Order => {
        const orderResponse = response as OrderResponse | Order;
        return (orderResponse && 'data' in orderResponse ? orderResponse.data : orderResponse) as Order;
      },
      providesTags: ["ORDERS"],
    }),
    getOrderBySlug: builder.query<Order, string>({
      query: (slug) => ({
        url: `/orders/slug/${slug}`,
        method: "GET",
      }),
      transformResponse: (response: unknown): Order => {
        const orderResponse = response as OrderResponse | Order;
        return (orderResponse && 'data' in orderResponse ? orderResponse.data : orderResponse) as Order;
      },
      providesTags: ["ORDERS"],
    }),
    createOrder: builder.mutation<{ success: boolean; data?: Order }, Record<string, unknown>>({
      query: (payload: Record<string, unknown>) => ({
        url: "/orders",
        method: "POST",
        data: payload,
      }),
    }),
    // Admin: Get all orders without pagination (returns { items })
    getAllOrdersAdmin: builder.query<
      { items: Order[] },
      { sort?: string; status?: string; startDate?: string; endDate?: string }
    >({
      query: (params) => ({
        url: "/orders",
        method: "GET",
        params,
      }),
      transformResponse: (response: unknown): { items: Order[] } => {
        const orderResponse = response as OrderResponse;
        return {
          items: orderResponse?.items ?? [],
        };
      },
      providesTags: ["ORDERS"],
    }),
    // Admin: Search orders by user info (kept as before)
    searchOrdersByUserAdmin: builder.query<
      SearchOrdersResponse,
      { searchTerm: string; page?: number; limit?: number; sort?: string; status?: string }
    >({
      query: (params) => ({
        url: "/orders/search",
        method: "GET",
        params,
      }),
      transformResponse: (response: unknown): SearchOrdersResponse => {
        const searchResponse = response as Partial<SearchOrdersResponse>;
        return {
          items: searchResponse?.items ?? [],
          users: searchResponse?.users ?? [],
          meta: searchResponse?.meta ?? { page: 1, limit: 10, total: 0, totalPage: 0 },
        };
      },
      providesTags: ["ORDERS"],
    }),
    // Admin: Download orders as PDF
    downloadOrdersPDF: builder.query<
      Blob,
      { startDate: string; endDate: string; sort?: string; status?: string }
    >({
      queryFn: async (params) => {
        try {
          const { axiosInstance } = await import("@/lib/axios");
          const response = await axiosInstance.get("/orders/download-pdf", {
            params,
            responseType: "blob",
          });
          return { data: response.data as Blob };
        } catch (error: unknown) {
          const axiosError = error as { response?: { status?: number; data?: unknown }; message?: string };
          return {
            error: {
              status: axiosError.response?.status,
              data: axiosError.response?.data || axiosError.message,
            },
          };
        }
      },
    }),
    getUsersOrderSummary: builder.query<
      UserOrderSummary[],
      {
        top?: number;
        period?: "day" | "week" | "month";
        startDate?: string;
        endDate?: string;
      } | void
    >({
      query: (args) => ({
        url: "/user/order-summary",
        method: "GET",
        params:
          args && typeof args === "object"
            ? Object.entries(args).reduce((acc, [key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                  acc[key] = value;
                }
                return acc;
              }, {} as Record<string, unknown>)
            : undefined,
      }),
      transformResponse: (response: unknown): UserOrderSummary[] => {
        const wrapped = response as { data?: UserOrderSummary[] } | UserOrderSummary[];
        if (Array.isArray(wrapped)) {
          return wrapped;
        }
        if (wrapped && typeof wrapped === "object" && "data" in wrapped) {
          const data = (wrapped as { data?: UserOrderSummary[] }).data;
          return Array.isArray(data) ? data : [];
        }
        return [];
      },
      providesTags: ["ORDERS"],
    }),
    // Admin: Update order status
    updateOrderStatus: builder.mutation<
      { success: boolean; data?: Order },
      { orderId: string; status: string }
    >({
      query: ({ orderId, status }) => ({
        url: `/orders/${orderId}/status`,
        method: "PATCH",
        data: { status },
      }),
      invalidatesTags: ["ORDERS"],
    }),
    // Admin: Bulk update order status
    bulkUpdateOrderStatus: builder.mutation<
      { success: boolean; message?: string; data?: { successCount: number; errorCount: number } },
      { orderIds: string[]; status: string }
    >({
      query: ({ orderIds, status }) => ({
        url: `/orders/bulk-update-status`,
        method: "PATCH",
        data: { orderIds, status },
      }),
      invalidatesTags: ["ORDERS"],
    }),
  }),
});

export const { 
  useCreateOrderMutation, 
  useGetMyOrdersQuery, 
  useGetOrderByIdQuery, 
  useGetOrderBySlugQuery,
  useGetAllOrdersAdminQuery,
  useSearchOrdersByUserAdminQuery,
  useLazyDownloadOrdersPDFQuery,
  useGetUsersOrderSummaryQuery,
  useUpdateOrderStatusMutation,
  useBulkUpdateOrderStatusMutation,
} = orderApi;



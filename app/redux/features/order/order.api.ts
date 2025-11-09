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
      { searchTerm: string; page?: number; limit?: number; sort?: string }
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
        } catch (error: any) {
          return {
            error: {
              status: error.response?.status,
              data: error.response?.data || error.message,
            },
          };
        }
      },
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
} = orderApi;



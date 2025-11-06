import { baseApi } from "../../baseApi";

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyOrders: builder.query<any[], void>({
      query: () => ({
        url: "/orders/my",
        method: "GET",
      }),
      transformResponse: (response: any) => {
        console.log("response", response);
        const data = response?.items ?? response;
        return Array.isArray(data) ? data : [];
      },
      providesTags: ["ORDERS" as any],
    }),
    getOrderById: builder.query<any, string>({
      query: (id) => ({
        url: `/orders/${id}`,
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ["ORDERS" as any],
    }),
    getOrderBySlug: builder.query<any, string>({
      query: (slug) => ({
        url: `/orders/slug/${slug}`,
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ["ORDERS" as any],
    }),
    createOrder: builder.mutation<{ success: boolean; data?: any }, any>({
      query: (payload) => ({
        url: "/orders",
        method: "POST",
        data: payload,
      }),
    }),
    // Admin: Get all orders without pagination (returns { items })
    getAllOrdersAdmin: builder.query<
      { items: any[] },
      { sort?: string; status?: string; startDate?: string; endDate?: string }
    >({
      query: (params) => ({
        url: "/orders",
        method: "GET",
        params,
      }),
      transformResponse: (response: any) => ({
        items: response?.items ?? [],
      }),
      providesTags: ["ORDERS" as any],
    }),
    // Admin: Search orders by user info (kept as before)
    searchOrdersByUserAdmin: builder.query<
      { items: any[]; users: any[]; meta: any },
      { searchTerm: string; page?: number; limit?: number; sort?: string }
    >({
      query: (params) => ({
        url: "/orders/search",
        method: "GET",
        params,
      }),
      transformResponse: (response: any) => ({
        items: response?.items ?? [],
        users: response?.users ?? [],
        meta: response?.meta ?? { page: 1, limit: 10, total: 0, totalPage: 0 },
      }),
      providesTags: ["ORDERS" as any],
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
} = orderApi;



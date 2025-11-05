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
  }),
});

export const { useCreateOrderMutation, useGetMyOrdersQuery, useGetOrderByIdQuery, useGetOrderBySlugQuery } = orderApi;



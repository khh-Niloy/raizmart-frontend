import { baseApi } from "../../baseApi"

export const couponApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create coupon
    createCoupon: builder.mutation({
      query: (payload) => ({
        url: "/coupons",
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["COUPONS"],
    }),

    // Get all coupons
    getCoupons: builder.query({
      query: () => ({
        url: "/coupons",
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ["COUPONS"],
    }),

    // Get coupon by id
    getCouponById: builder.query({
      query: (id: string) => ({
        url: `/coupons/${id}`,
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ["COUPONS"],
    }),

    // Update coupon
    updateCoupon: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `/coupons/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["COUPONS"],
    }),

    // Toggle active status
    toggleCouponStatus: builder.mutation({
      query: ({ id, isActive }: { id: string; isActive: boolean }) => ({
        url: `/coupons/${id}/status`,
        method: "PATCH",
        data: { isActive },
      }),
      invalidatesTags: ["COUPONS"],
    }),

    // Delete coupon
    deleteCoupon: builder.mutation({
      query: (id: string) => ({
        url: `/coupons/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["COUPONS"],
    }),
  }),
})

export const {
  useCreateCouponMutation,
  useGetCouponsQuery,
  useGetCouponByIdQuery,
  useUpdateCouponMutation,
  useToggleCouponStatusMutation,
  useDeleteCouponMutation,
} = couponApi



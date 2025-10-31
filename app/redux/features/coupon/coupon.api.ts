import { baseApi } from "../../baseApi"

export const couponApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create coupon
    createCoupon: builder.mutation({
      query: (payload) => {
        // Adapt frontend payload to backend schema
        const adapted = {
          ...payload,
          discountType: (payload?.discountType ?? '').toString().toLowerCase(), // PERCENT|FIXED -> percentage|fixed
          status: typeof payload?.isActive === 'boolean'
            ? (payload.isActive ? 'active' : 'inactive')
            : payload?.status,
        };
        delete (adapted as any).isActive;
        return ({
        url: "/coupons",
        method: "POST",
        data: adapted,
      });
      },
      invalidatesTags: ["COUPONS"],
    }),

    // Get all coupons
    getCoupons: builder.query({
      query: () => ({
        url: "/coupons",
        method: "GET",
      }),
      transformResponse: (response: any) => {
        const items = (response?.data ?? response) as any[];
        if (!Array.isArray(items)) return items;
        return items.map((c: any) => ({
          ...c,
          // Backend uses percentage|fixed and status active|inactive
          discountType: (c?.discountType ?? c?.type ?? '').toString().toUpperCase(), // -> PERCENT|FIXED
          isActive: typeof c?.isActive === 'boolean' ? c.isActive : (c?.status === 'active'),
        }));
      },
      providesTags: ["COUPONS"],
    }),

    // Get coupon by id
    getCouponById: builder.query({
      query: (id: string) => ({
        url: `/coupons/${id}`,
        method: "GET",
      }),
      transformResponse: (response: any) => {
        const c = (response?.data ?? response) as any;
        if (!c) return c;
        return {
          ...c,
          discountType: (c?.discountType ?? c?.type ?? '').toString().toUpperCase(),
          isActive: typeof c?.isActive === 'boolean' ? c.isActive : (c?.status === 'active'),
        };
      },
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



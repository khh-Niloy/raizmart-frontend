import { baseApi } from "../../baseApi";

interface CouponPayload {
  code?: string;
  discountType?: string;
  discountValue?: number;
  minPurchase?: number;
  maxDiscount?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  status?: string;
  usageLimit?: number;
  usedCount?: number;
}

export interface CouponResponse {
  _id: string;
  code: string;
  discountType?: string;
  type?: string;
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  status?: string;
  usageLimit?: number;
  usedCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  data?: T;
}

export const couponApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create coupon
    createCoupon: builder.mutation({
      query: (payload: CouponPayload) => {
        // Adapt frontend payload to backend schema
        const discountType = (payload?.discountType ?? "").toString().toLowerCase();
        const adapted: Record<string, unknown> = {
          ...payload,
          discountType: discountType === "free_delivery" ? "free_delivery" : discountType, // PERCENT|FIXED|FREE_DELIVERY -> percentage|fixed|free_delivery
          status:
            typeof payload?.isActive === "boolean"
              ? payload.isActive
                ? "active"
                : "inactive"
              : payload?.status,
        };
        delete adapted.isActive;
        return {
          url: "/coupons",
          method: "POST",
          data: adapted,
        };
      },
      invalidatesTags: ["COUPONS"],
    }),

    // Get all coupons
    getCoupons: builder.query({
      query: () => ({
        url: "/coupons",
        method: "GET",
      }),
      transformResponse: (response: unknown): CouponResponse[] => {
        const apiResponse = response as
          | ApiResponse<CouponResponse[]>
          | CouponResponse[];
        const items = (
          apiResponse && "data" in apiResponse ? apiResponse.data : apiResponse
        ) as CouponResponse[];
        if (!Array.isArray(items)) return items;
        return items.map((c: CouponResponse) => ({
          ...c,
          // Backend uses percentage|fixed|free_delivery and status active|inactive
          discountType: (c?.discountType ?? c?.type ?? "")
            .toString()
            .toUpperCase(), // -> PERCENT|FIXED|FREE_DELIVERY
          isActive:
            typeof c?.isActive === "boolean"
              ? c.isActive
              : c?.status === "active",
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
      transformResponse: (response: unknown): CouponResponse | null => {
        const apiResponse = response as
          | ApiResponse<CouponResponse>
          | CouponResponse;
        const c = (
          apiResponse && "data" in apiResponse ? apiResponse.data : apiResponse
        ) as CouponResponse | null;
        if (!c) return c;
        return {
          ...c,
          discountType: (c?.discountType ?? c?.type ?? "")
            .toString()
            .toUpperCase(),
          isActive:
            typeof c?.isActive === "boolean"
              ? c.isActive
              : c?.status === "active",
        };
      },
      providesTags: ["COUPONS"],
    }),

    // Update coupon
    updateCoupon: builder.mutation({
      query: ({ id, data }: { id: string; data: Partial<CouponPayload> }) => {
        // Adapt frontend payload to backend schema (all fields optional)
        const adapted: Record<string, unknown> = { ...data };

        // Transform discountType if provided (PERCENT|FIXED|FREE_DELIVERY -> percentage|fixed|free_delivery)
        if (adapted.discountType !== undefined) {
          const type = adapted.discountType?.toString().toLowerCase();
          // Handle FREE_DELIVERY -> free_delivery
          adapted.discountType = type === "free_delivery" ? "free_delivery" : type;
        }

        // Transform isActive to status if provided
        if (typeof adapted.isActive === "boolean") {
          adapted.status = adapted.isActive ? "active" : "inactive";
          delete adapted.isActive;
        } else if (
          adapted.isActive === undefined &&
          adapted.status === undefined
        ) {
          // If neither isActive nor status is provided, don't include status
        }

        // Remove undefined values to send only provided fields
        Object.keys(adapted).forEach((key) => {
          if (adapted[key] === undefined) {
            delete adapted[key];
          }
        });

        return {
          url: `/coupons/${id}`,
          method: "PATCH",
          data: adapted,
        };
      },
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

    // Validate coupon
    validateCoupon: builder.mutation({
      query: (code: string) => ({
        url: "/coupons/validate",
        method: "POST",
        data: { code },
      }),
      transformResponse: (response: unknown): { discountType: string; discountValue?: number } | null => {
        const apiResponse = response as
          | ApiResponse<{ discountType: string; discountValue?: number }>
          | { success?: boolean; data?: { discountType: string; discountValue?: number } };
        
        // Handle both response formats: { data: {...} } or { success: true, data: {...} }
        const data = (
          apiResponse && "data" in apiResponse ? apiResponse.data : null
        ) as { discountType: string; discountValue?: number } | null;
        
        if (!data || !data.discountType) return null;
        
        const discountType = (data.discountType ?? "").toString().toUpperCase();
        
        // For FREE_DELIVERY, return only discountType
        if (discountType === "FREE_DELIVERY") {
          return {
            discountType: discountType,
          };
        }
        
        // For PERCENT and FIXED, require discountValue
        if (!data.discountValue) return null;
        
        return {
          discountType: discountType, // percentage|fixed -> PERCENT|FIXED
          discountValue: Number(data.discountValue ?? 0),
        };
      },
    }),
  }),
});

export const {
  useCreateCouponMutation,
  useGetCouponsQuery,
  useGetCouponByIdQuery,
  useUpdateCouponMutation,
  useToggleCouponStatusMutation,
  useDeleteCouponMutation,
  useValidateCouponMutation,
} = couponApi;

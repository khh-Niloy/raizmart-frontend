"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { useGetCouponByIdQuery, useUpdateCouponMutation } from "@/app/redux/features/coupon/coupon.api";
import { toast } from "sonner";

// Schema with all fields optional for easy partial updates
const couponSchema = z
  .object({
    code: z
      .string()
      .optional()
      .transform((v) => v ? v.trim().toUpperCase() : v),
    discountType: z.enum(["PERCENT", "FIXED", "FREE_DELIVERY"]).optional(),
    discountValue: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) => {
        if (val === undefined || val === "") return undefined;
        return typeof val === "string" ? Number(val) : val;
      })
      .refine((v) => v === undefined || (!Number.isNaN(v) && v >= 0), {
        message: "Discount value must be a non-negative number",
      }),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isActive: z.boolean().optional(),
    description: z.string().optional(),
  })
  .refine(
    (data) => {
      // Only validate dates if both are provided
      if (data.startDate && data.endDate) {
        const starts = new Date(data.startDate).getTime();
        const ends = new Date(data.endDate).getTime();
        if (Number.isFinite(starts) && Number.isFinite(ends)) {
          return ends >= starts;
        }
      }
      return true;
    },
    { message: "End date must be after start date", path: ["endDate"] }
  )
  .refine(
    (data) => {
      // Only validate percentage if discountType is PERCENT and value is provided
      if (data.discountType === "PERCENT" && data.discountValue !== undefined) {
        return Number(data.discountValue) <= 100;
      }
      return true;
    },
    { message: "Percentage discount cannot exceed 100%", path: ["discountValue"] }
  )
  .refine(
    (data) => {
      // FREE_DELIVERY should have discountValue of 0 or undefined
      if (data.discountType === "FREE_DELIVERY" && data.discountValue !== undefined) {
        return Number(data.discountValue) === 0;
      }
      return true;
    },
    { message: "FREE_DELIVERY coupons should have discountValue of 0", path: ["discountValue"] }
  );

type CouponFormData = z.infer<typeof couponSchema>;

export default function EditCouponPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || "";
  interface CouponData {
    code?: string;
    discountType?: string;
    type?: string;
    discountValue?: number;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
    description?: string;
  }

  const { data, isFetching } = useGetCouponByIdQuery(id, { skip: !id });
  // transformResponse already extracts data, so data should be the CouponResponse
  const coupon = data as CouponData | undefined;
  const [updateCoupon, { isLoading }] = useUpdateCouponMutation();

  const { register, handleSubmit, control, formState: { errors }, setValue } = useForm<CouponFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(couponSchema) as any,
    defaultValues: {
      code: undefined,
      discountType: undefined,
      discountValue: undefined,
      startDate: undefined,
      endDate: undefined,
      isActive: undefined,
      description: undefined,
    }
  });

  useEffect(() => {
    if (coupon) {
      // Normalize to datetime-local value (YYYY-MM-DDTHH:mm)
      const toLocalInput = (d?: string) => {
        if (!d) return "";
        try {
          const dt = new Date(d);
          if (isNaN(dt.getTime())) return "";
          const pad = (n: number) => String(n).padStart(2, "0");
          return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
        } catch {
          return "";
        }
      };

      if (coupon.code) setValue("code", coupon.code);
      if (coupon.discountType || coupon.type) {
        const discountType = (coupon.discountType ?? coupon.type ?? "PERCENT").toString().toUpperCase();
        setValue("discountType", discountType as "PERCENT" | "FIXED" | "FREE_DELIVERY");
      }
      if (coupon.discountValue !== undefined) {
        setValue("discountValue", Number(coupon.discountValue));
      }
      if (coupon.startDate) setValue("startDate", toLocalInput(coupon.startDate));
      if (coupon.endDate) setValue("endDate", toLocalInput(coupon.endDate));
      if (coupon.isActive !== undefined) {
        setValue("isActive", Boolean(coupon.isActive));
      }
      if (coupon.description) setValue("description", coupon.description);
    }
  }, [coupon, setValue]);

  const toISOString = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toISOString();
  };

  const onSubmit = async (data: CouponFormData) => {
    try {
      if (!id) {
        toast.error("Missing coupon id");
        router.push("/admin/dashboard/all-coupons");
        return;
      }

      // Build payload with only provided fields
      const payload: Record<string, unknown> = {};

      if (data.code !== undefined && data.code !== "") {
        payload.code = data.code.trim();
      }
      if (data.discountType !== undefined) {
        payload.discountType = data.discountType;
        // For FREE_DELIVERY, set discountValue to 0
        if (data.discountType === "FREE_DELIVERY") {
          payload.discountValue = 0;
        }
      }
      if (data.discountValue !== undefined && data.discountValue !== null && data.discountType !== "FREE_DELIVERY") {
        if (typeof data.discountValue === 'string' && data.discountValue !== "") {
          payload.discountValue = Number(data.discountValue);
        } else if (typeof data.discountValue === 'number') {
          payload.discountValue = data.discountValue;
        }
      }
      if (data.startDate !== undefined && data.startDate !== "") {
        payload.startDate = toISOString(data.startDate);
      }
      if (data.endDate !== undefined && data.endDate !== "") {
        payload.endDate = toISOString(data.endDate);
      }
      if (data.isActive !== undefined) {
        payload.isActive = data.isActive;
      }
      if (data.description !== undefined) {
        payload.description = data.description;
      }

      // Validate date range if both dates are provided
      if (payload.startDate && payload.endDate) {
        const starts = new Date(payload.startDate as string).getTime();
        const ends = new Date(payload.endDate as string).getTime();
        if (Number.isFinite(starts) && Number.isFinite(ends) && ends < starts) {
          toast.error("End date must be after start date");
          return;
        }
      }

      // Only submit if at least one field is provided
      if (Object.keys(payload).length === 0) {
        toast.error("Please update at least one field");
        return;
      }

      await updateCoupon({ id, data: payload }).unwrap();
      toast.success("Coupon updated successfully");
      router.push("/admin/dashboard/all-coupons");
    } catch (e: unknown) {
      const errorData = e as { data?: { message?: string }; message?: string };
      const errorMessage = errorData?.data?.message || errorData?.message || "Failed to update coupon";
      toast.error(errorMessage);
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">Edit Coupon</h1>
            <p className="text-gray-600 mt-1">Update promotion code. All fields are optional - only update what you need to change.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6 space-y-6">
            {/* Primary fields in a balanced two-column grid - matching create page */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code</Label>
                <Input 
                  placeholder="e.g., SAVE10" 
                  {...register("code")} 
                  disabled={isFetching}
                  defaultValue={coupon?.code || ""}
                />
                {errors.code && <p className="text-sm text-red-600">{errors.code.message}</p>}
                <p className="text-xs text-gray-500">Leave empty to keep current value</p>
              </div>

              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Controller
                  control={control}
                  name="discountType"
                  render={({ field }) => (
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || coupon?.discountType || ""}
                      disabled={isFetching}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENT">Percentage (%)</SelectItem>
                        <SelectItem value="FIXED">Fixed amount</SelectItem>
                        <SelectItem value="FREE_DELIVERY">Free Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.discountType && <p className="text-sm text-red-600">{errors.discountType.message as string}</p>}
                <p className="text-xs text-gray-500">Leave unchanged to keep current value</p>
              </div>

              <div className="space-y-2">
                <Controller
                  control={control}
                  name="discountType"
                  render={({ field: typeField }) => (
                    <>
                      <Label>Discount Value</Label>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        {...register("discountValue")} 
                        disabled={isFetching || typeField.value === "FREE_DELIVERY"}
                        defaultValue={coupon?.discountValue || ""}
                        placeholder={typeField.value === "FREE_DELIVERY" ? "Not required for Free Delivery" : ""}
                      />
                      {errors.discountValue && <p className="text-sm text-red-600">{errors.discountValue.message}</p>}
                      <p className="text-xs text-gray-500">
                        {typeField.value === "FREE_DELIVERY" 
                          ? "Free Delivery coupons don't require a discount value" 
                          : "Leave empty to keep current value"}
                      </p>
                    </>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Controller
                  control={control}
                  name="startDate"
                  render={({ field }) => (
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isFetching}
                      placeholder="Select date"
                      dateLabel="Start Date"
                      timeLabel="Time"
                    />
                  )}
                />
                {errors.startDate && <p className="text-sm text-red-600">{errors.startDate.message}</p>}
                <p className="text-xs text-gray-500">Leave empty to keep current value</p>
              </div>

              <div className="space-y-2">
                <Controller
                  control={control}
                  name="endDate"
                  render={({ field }) => (
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isFetching}
                      placeholder="Select date"
                      dateLabel="End Date"
                      timeLabel="Time"
                    />
                  )}
                />
                {errors.endDate && <p className="text-sm text-red-600">{errors.endDate.message}</p>}
                <p className="text-xs text-gray-500">Leave empty to keep current value</p>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input 
                  placeholder="Optional short description" 
                  {...register("description")} 
                  disabled={isFetching}
                  defaultValue={coupon?.description || ""}
                />
                <p className="text-xs text-gray-500">Leave empty to keep current value</p>
              </div>
            </div>

            {/* Status + submit in a single row - matching create page */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-2">
              {/* <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center gap-3">
                  <Controller
                    control={control}
                    name="isActive"
                    render={({ field }) => (
                      <Switch 
                        checked={field.value !== undefined ? field.value : (coupon?.isActive ?? true)} 
                        onCheckedChange={field.onChange} 
                        disabled={isFetching}
                      />
                    )}
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </div>
                <p className="text-xs text-gray-500">Toggle to change status</p>
              </div> */}

              <div className="flex justify-end md:justify-start">
                <Button type="submit" disabled={isLoading || isFetching} className="px-8">
                  {isLoading ? "Updating..." : "Update Coupon"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

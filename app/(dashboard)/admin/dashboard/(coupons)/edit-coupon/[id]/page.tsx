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
import { Switch } from "@/components/ui/switch";
import { useGetCouponByIdQuery, useUpdateCouponMutation } from "@/app/redux/features/coupon/coupon.api";
import { toast } from "sonner";
 
 

const couponSchema = z
  .object({
    code: z
      .string()
      .min(1, "Code is required")
      .transform((v) => v.toUpperCase()),
    discountType: z.enum(["PERCENT", "FIXED"], { message: "Discount type is required" }),
    discountValue: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "string" ? Number(val) : val))
      .refine((v) => !Number.isNaN(v) && v >= 0, {
        message: "Discount value must be a non-negative number",
      }),
    minOrderAmount: z.coerce.number().nonnegative().default(0),
    usageLimit: z.coerce.number().int().nonnegative().default(0),
    usageLimitPerUser: z.coerce.number().int().nonnegative().default(0),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    isActive: z.boolean().default(true),
    description: z.string().optional(),
  })
  .refine(
    (data) => {
      const starts = new Date(data.startDate).getTime();
      const ends = new Date(data.endDate).getTime();
      if (Number.isFinite(starts) && Number.isFinite(ends)) {
        return ends >= starts;
      }
      return true;
    },
    { message: "End date must be after start date", path: ["endDate"] }
  )
  .refine(
    (data) => {
      if (data.discountType === "PERCENT") {
        return Number(data.discountValue) <= 100;
      }
      return true;
    },
    { message: "Percentage discount cannot exceed 100%", path: ["discountValue"] }
  );

type CouponFormData = z.infer<typeof couponSchema>;

export default function EditCouponPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || "";
  const { data, isFetching } = useGetCouponByIdQuery(id, { skip: !id });
  const coupon: any = (data?.data ?? data) as any;
  const [updateCoupon, { isLoading }] = useUpdateCouponMutation();

  const { register, handleSubmit, control, formState: { errors }, reset, setValue } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema) as any,
    defaultValues: {
      code: "",
      discountType: "PERCENT",
      discountValue: 10,
      minOrderAmount: 0,
      usageLimit: 0,
      usageLimitPerUser: 0,
      startDate: "",
      endDate: "",
      isActive: true,
      description: "",
    }
  });

  useEffect(() => {
    if (coupon) {
      setValue("code", coupon.code || "");
      setValue("discountType", (coupon.discountType ?? coupon.type ?? "PERCENT").toString().toUpperCase() as any);
      setValue("discountValue", Number(coupon.discountValue ?? 0));
      setValue("minOrderAmount", Number(coupon.minOrderAmount ?? 0));
      setValue("usageLimit", Number(coupon.usageLimit ?? 0));
      setValue("usageLimitPerUser", Number(coupon.usageLimitPerUser ?? 0));
      // Normalize to datetime-local value (YYYY-MM-DDTHH:mm)
      const toLocalInput = (d?: string) => {
        if (!d) return "";
        const dt = new Date(d);
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
      };
      setValue("startDate", toLocalInput(coupon.startDate));
      setValue("endDate", toLocalInput(coupon.endDate));
      setValue("isActive", Boolean(coupon.isActive));
      setValue("description", coupon.description || "");
    }
  }, [coupon, setValue]);

  const onSubmit = async (data: CouponFormData) => {
    try {
      if (!id) {
        toast.error("Missing coupon id");
        router.push("/admin/dashboard/all-coupons");
        return;
      }
      const starts = new Date(data.startDate).getTime();
      const ends = new Date(data.endDate).getTime();
      if (Number.isFinite(starts) && Number.isFinite(ends) && ends < starts) {
        toast.error("End date must be after start date");
        return;
      }

      const payload = {
        code: data.code.trim(),
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderAmount: data.minOrderAmount,
        usageLimit: data.usageLimit,
        usageLimitPerUser: data.usageLimitPerUser,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive,
        description: data.description || "",
      };

      await updateCoupon({ id, data: payload }).unwrap();
      toast.success("Coupon updated");
      router.push("/admin/dashboard/all-coupons");
    } catch (e) {
      toast.error("Failed to update coupon");
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">Edit Coupon</h1>
            <p className="text-gray-600 mt-1">Update promotion code details</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input placeholder="e.g., SAVE10" {...register("code")} disabled={isFetching} />
                {errors.code && <p className="text-sm text-red-600">{errors.code.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Discount Type *</Label>
                <Controller
                  control={control}
                  name="discountType"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} disabled={isFetching}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENT">Percentage (%)</SelectItem>
                        <SelectItem value="FIXED">Fixed amount</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.discountType && <p className="text-sm text-red-600">{errors.discountType.message as string}</p>}
              </div>

              <div className="space-y-2">
                <Label>Discount Value *</Label>
                <Input type="number" step="0.01" min="0" {...register("discountValue")} disabled={isFetching} />
                {errors.discountValue && <p className="text-sm text-red-600">{errors.discountValue.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Minimum Order Amount</Label>
                <Input type="number" step="0.01" min="0" {...register("minOrderAmount")} disabled={isFetching} />
                {errors.minOrderAmount && <p className="text-sm text-red-600">{errors.minOrderAmount.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Usage Limit (0 = unlimited)</Label>
                <Input type="number" min="0" {...register("usageLimit")} disabled={isFetching} />
                {errors.usageLimit && <p className="text-sm text-red-600">{errors.usageLimit.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Usage Limit Per User (0 = unlimited)</Label>
                <Input type="number" min="0" {...register("usageLimitPerUser")} disabled={isFetching} />
                {errors.usageLimitPerUser && <p className="text-sm text-red-600">{errors.usageLimitPerUser.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input type="datetime-local" {...register("startDate")} disabled={isFetching} />
                {errors.startDate && <p className="text-sm text-red-600">{errors.startDate.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>End Date *</Label>
                <Input type="datetime-local" {...register("endDate")} disabled={isFetching} />
                {errors.endDate && <p className="text-sm text-red-600">{errors.endDate.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center gap-3">
                  <Controller
                    control={control}
                    name="isActive"
                    render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isFetching} />
                    )}
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Optional short description" {...register("description")} disabled={isFetching} />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isLoading} className="px-8">
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}



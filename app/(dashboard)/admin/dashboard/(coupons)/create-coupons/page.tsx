"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCreateCouponMutation } from "@/app/redux/features/coupon/coupon.api";
import { toast } from "sonner";

const couponSchema = z.object({
  code: z.string().min(3, "Code is required"),
  discountType: z.enum(["PERCENT", "FIXED"], { message: "Discount type is required" }),
  discountValue: z.coerce.number().positive("Must be greater than 0"),
  minOrderAmount: z.coerce.number().nonnegative().default(0),
  usageLimit: z.coerce.number().int().nonnegative().default(0),
  usageLimitPerUser: z.coerce.number().int().nonnegative().default(0),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
});

type CouponFormData = z.infer<typeof couponSchema>;

export default function CreateCouponsPage() {
  const [createCoupon, { isLoading }] = useCreateCouponMutation();

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<CouponFormData>({
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

  const onSubmit = async (data: CouponFormData) => {
    try {
      // Basic date validation
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

      await createCoupon(payload).unwrap();
      toast.success("Coupon created successfully");
      reset();
    } catch (e) {
      toast.error("Failed to create coupon");
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">Create Coupon</h1>
            <p className="text-gray-600 mt-1">Define a new promotion code</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input placeholder="e.g., SAVE10" {...register("code")} />
                {errors.code && <p className="text-sm text-red-600">{errors.code.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Discount Type *</Label>
                <Controller
                  control={control}
                  name="discountType"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <Input type="number" step="0.01" min="0" {...register("discountValue")} />
                {errors.discountValue && <p className="text-sm text-red-600">{errors.discountValue.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Minimum Order Amount</Label>
                <Input type="number" step="0.01" min="0" {...register("minOrderAmount")} />
                {errors.minOrderAmount && <p className="text-sm text-red-600">{errors.minOrderAmount.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Usage Limit (0 = unlimited)</Label>
                <Input type="number" min="0" {...register("usageLimit")} />
                {errors.usageLimit && <p className="text-sm text-red-600">{errors.usageLimit.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Usage Limit Per User (0 = unlimited)</Label>
                <Input type="number" min="0" {...register("usageLimitPerUser")} />
                {errors.usageLimitPerUser && <p className="text-sm text-red-600">{errors.usageLimitPerUser.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input type="datetime-local" {...register("startDate")} />
                {errors.startDate && <p className="text-sm text-red-600">{errors.startDate.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>End Date *</Label>
                <Input type="datetime-local" {...register("endDate")} />
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
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Optional short description" {...register("description")} />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isLoading} className="px-8">
                {isLoading ? "Creating..." : "Create Coupon"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}



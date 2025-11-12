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
 
 

const couponSchema = z
  .object({
    code: z
      .string()
      .min(1, "Code is required")
      .transform((v) => v.toUpperCase()),
    discountType: z.enum(["PERCENT", "FIXED", "FREE_DELIVERY"], { message: "Discount type is required" }),
    discountValue: z.preprocess(
      (val) => (typeof val === "string" ? Number(val) : val),
      z.number().refine((v) => !Number.isNaN(v) && v >= 0, {
        message: "Discount value must be a non-negative number",
      }).optional()
    ),
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
        return data.discountValue !== undefined && Number(data.discountValue) <= 100;
      }
      return true;
    },
    { message: "Percentage discount cannot exceed 100%", path: ["discountValue"] }
  )
  .refine(
    (data) => {
      // FREE_DELIVERY doesn't require discountValue, or it should be 0
      if (data.discountType === "FREE_DELIVERY") {
        return true; // Always valid for FREE_DELIVERY
      }
      // PERCENT and FIXED require discountValue
      if (data.discountType === "PERCENT" || data.discountType === "FIXED") {
        return data.discountValue !== undefined && Number(data.discountValue) > 0;
      }
      return true;
    },
    { 
      message: "Discount value is required for PERCENT and FIXED types", 
      path: ["discountValue"] 
    }
  );

interface CouponFormInput {
  code: string;
  discountType: "PERCENT" | "FIXED" | "FREE_DELIVERY";
  discountValue?: string | number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  description?: string;
}

export default function CreateCouponsPage() {
  const [createCoupon, { isLoading }] = useCreateCouponMutation();

  const { register, handleSubmit, control, formState: { errors }, reset, watch, setValue, clearErrors } = useForm<CouponFormInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(couponSchema) as any,
    defaultValues: {
      code: "",
      discountType: "PERCENT",
      discountValue: 10,
      startDate: "",
      endDate: "",
      isActive: true,
      description: "",
    }
  });

  const discountType = watch("discountType");

  // Clear discountValue and validation errors when switching to FREE_DELIVERY
  React.useEffect(() => {
    if (discountType === "FREE_DELIVERY") {
      setValue("discountValue", undefined);
      clearErrors("discountValue");
    }
  }, [discountType, setValue, clearErrors]);

  const onSubmit = async (data: CouponFormInput) => {
    try {
      // Basic date validation
      const starts = new Date(data.startDate).getTime();
      const ends = new Date(data.endDate).getTime();
      if (Number.isFinite(starts) && Number.isFinite(ends) && ends < starts) {
        toast.error("End date must be after start date");
        return;
      }

      const payload: Record<string, unknown> = {
        code: data.code.trim(),
        discountType: data.discountType,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive,
        description: data.description || "",
      };
      
      // Only include discountValue for PERCENT and FIXED types
      if (data.discountType !== "FREE_DELIVERY" && data.discountValue !== undefined) {
        payload.discountValue = typeof data.discountValue === 'string' ? Number(data.discountValue) : data.discountValue;
      } else if (data.discountType === "FREE_DELIVERY") {
        // For FREE_DELIVERY, set discountValue to 0 or omit it
        payload.discountValue = 0;
      }

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
            {/* Primary fields in a balanced two-column grid */}
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
                        <SelectItem value="FREE_DELIVERY">Free Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.discountType && <p className="text-sm text-red-600">{errors.discountType.message as string}</p>}
              </div>

              <div className="space-y-2">
                <Controller
                  control={control}
                  name="discountType"
                  render={({ field: typeField }) => (
                    <>
                      <Label>Discount Value {typeField.value !== "FREE_DELIVERY" ? "*" : ""}</Label>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        {...register("discountValue")} 
                        disabled={typeField.value === "FREE_DELIVERY"}
                        placeholder={typeField.value === "FREE_DELIVERY" ? "Not required for Free Delivery" : ""}
                      />
                      {errors.discountValue && typeField.value !== "FREE_DELIVERY" && (
                        <p className="text-sm text-red-600">{errors.discountValue.message}</p>
                      )}
                      {typeField.value === "FREE_DELIVERY" && (
                        <p className="text-xs text-gray-500">Free Delivery coupons don't require a discount value</p>
                      )}
                    </>
                  )}
                />
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

              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Optional short description" {...register("description")} />
              </div>
            </div>

            {/* Status + submit in a single row */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-2">
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

              <div className="flex justify-end md:justify-start">
                <Button type="submit" disabled={isLoading} className="px-8">
                  {isLoading ? "Creating..." : "Create Coupon"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}



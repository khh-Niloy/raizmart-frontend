"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateBrandMutation } from "@/app/redux/features/brand/brand.api";
import { toast } from "sonner";

// Validation schema
const brandSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
});

type BrandFormData = z.infer<typeof brandSchema>;

export default function CreateBrandPage() {
  const [createBrand, { isLoading }] = useCreateBrandMutation();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: BrandFormData) => {
    try {
      const res = await createBrand(data).unwrap();
      console.log("Brand created:", res);
      toast.success("Brand created successfully!");
      reset();
    } catch (error) {
      console.error("Create brand failed:", error);
      toast.error("Failed to create brand. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">Create Brand</h1>
            <p className="text-gray-600 mt-1">Add a new brand to your inventory</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6 space-y-6">
            {/* Brand Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Brand Name *
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter brand name"
                className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>


            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 disabled:opacity-60"
              >
                {isLoading ? "Creating..." : "Create Brand"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

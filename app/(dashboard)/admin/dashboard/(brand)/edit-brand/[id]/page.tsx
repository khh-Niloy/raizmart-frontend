"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  useGetBrandsQuery,
  useUpdateBrandMutation,
} from "@/app/redux/features/brand/brand.api";

const brandSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
});

type BrandFormData = z.infer<typeof brandSchema>;

export default function EditBrandPage() {
  const params = useParams();
  const brandId = params.id as string;

  const { data: brandsResponse, isFetching: isBrandsLoading } =
    useGetBrandsQuery(undefined);
  const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
  });

  // Load brand data when component mounts
  useEffect(() => {
    if (brandsResponse && brandId) {
      const brand = brandsResponse.find((b: any) => b._id === brandId);
      if (brand) {
        reset({
          name: brand.name,
        });
      }
    }
  }, [brandsResponse, brandId, reset]);

  const onSubmit = async (data: BrandFormData) => {
    try {
      const payload = {
        id: brandId,
        ...data,
      };
      console.log("Update brand payload:", payload);
      const res = await updateBrand(payload).unwrap();
      console.log("Brand updated:", res);
      toast.success("Brand updated successfully!");
    } catch (error) {
      console.error("Update brand failed:", error);
      toast.error("Failed to update brand. Please try again.");
    }
  };

  if (isBrandsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Edit Brand</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Brand Name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter brand name"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isUpdating}
            >
              {isUpdating ? "Updating..." : "Update Brand"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


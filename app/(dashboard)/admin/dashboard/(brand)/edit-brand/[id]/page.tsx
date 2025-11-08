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
  image: z.any().optional(),
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

  const [currentImage, setCurrentImage] = React.useState<string | undefined>(undefined);

  // Load brand data when component mounts
  interface Brand {
    _id?: string;
    id?: string;
    name?: string;
    image?: string;
  }

  useEffect(() => {
    if (brandsResponse && brandId) {
      // Ensure data is an array (transformResponse already extracts data, so brandsResponse should be the array)
      const brands: Brand[] = Array.isArray(brandsResponse) ? brandsResponse : [];
      const brand = brands.find((b: Brand) => (b._id ?? b.id) === brandId);
      if (brand) {
        setCurrentImage(brand.image ?? undefined);
        reset({
          name: brand.name,
        });
      }
    }
  }, [brandsResponse, brandId, reset]);

  const onSubmit = async (data: BrandFormData) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.image && data.image instanceof FileList && data.image.length > 0) {
        formData.append('image', data.image[0]);
      }
      await updateBrand({ id: brandId, formData }).unwrap();
      toast.success("Brand updated successfully!");
    } catch {
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
    <div className="min-h-screen bg-white">
      <Card className="w-full px-4 sm:px-6 lg:px-8 py-8 border-none">
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
            {!!currentImage && (
              <div className="my-2 flex items-center">
                <img
                  src={currentImage?.startsWith?.('http') ? currentImage : '/' + currentImage?.replace?.(/^\/*/, '')}
                  alt="Brand"
                  className="h-14 w-14 rounded border border-gray-200 object-contain mr-2"
                />
                <span className="text-xs text-gray-600">Current Image</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="image">Brand Image (optional)</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                {...register("image")}
                className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.image && (
                <p className="text-sm text-red-500">{errors.image.message as string}</p>
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





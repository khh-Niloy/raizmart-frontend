"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useGetCategoriesQuery, useUpdateCategoryMutation } from "@/app/redux/features/category-subcategory/category-subcategory.api";
import { useParams } from "next/navigation";
import { toast } from "sonner";

// Validation schema
const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  isActive: z.boolean(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function EditCategoryPage() {
  const params = useParams();
  const categoryId = params.id as string;
  
  const { data: categoriesResponse, isFetching: isCategoriesLoading } = useGetCategoriesQuery(undefined);
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      isActive: true,
    },
  });

  // Load existing category data
  useEffect(() => {
    if (categoriesResponse && categoryId) {
      const categories: any[] = (categoriesResponse?.data ?? categoriesResponse ?? []) as any[];
      const currentCategory = categories.find(
        (item: any) => (item.id ?? item._id) === categoryId
      );
      
      if (currentCategory) {
        const formData = {
          name: currentCategory.name ?? "",
          isActive: currentCategory.isActive ?? true,
        };
        reset(formData);
      }
    }
  }, [categoriesResponse, categoryId, reset]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const payload = {
        id: categoryId,
        ...data,
      };
      console.log("Update category payload:", payload);
      const res = await updateCategory(payload).unwrap();
      console.log("Category updated:", res);
      toast.success("Category updated successfully!");
    } catch (error) {
      console.error("Update category failed:", error);
      toast.error("Failed to update category. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">Edit Category</h1>
            <p className="text-gray-600 mt-1">Update category information</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6 space-y-6">
            {/* Category Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Category Name *
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter category name"
                className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Active Status */}
            <div className="space-y-2">
              <Label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Status
              </Label>
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Label htmlFor="isActive" className="text-sm text-gray-600">
                      {field.value ? "Active" : "Inactive"}
                    </Label>
                  </div>
                )}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 space-x-4">
              <Button
                type="button"
                variant="outline"
                className="px-8 py-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCategoriesLoading || isUpdating}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 disabled:opacity-60"
              >
                {isUpdating ? "Updating..." : "Update Category"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

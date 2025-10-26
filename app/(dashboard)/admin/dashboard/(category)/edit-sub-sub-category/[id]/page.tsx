"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useGetSubcategoriesQuery, useGetSubSubcategoriesQuery, useUpdateSubSubcategoryMutation } from "@/app/redux/features/category-subcategory/category-subcategory.api";
import { useParams } from "next/navigation";
import { toast } from "sonner";

// Validation schema
const subSubCategorySchema = z.object({
  name: z.string().min(1, "Sub-sub-category name is required"),
  subcategory: z.string().min(1, "Please select a parent sub-category"),
  isActive: z.boolean(),
});

type SubSubCategoryFormData = z.infer<typeof subSubCategorySchema>;

export default function EditSubSubCategoryPage() {
  const params = useParams();
  const subSubCategoryId = params.id as string;
  
  const { data: subcategoriesResponse, isFetching: isSubcategoriesLoading } = useGetSubcategoriesQuery(undefined);
  const { data: subSubCategoriesResponse, isFetching: isSubSubCategoriesLoading } = useGetSubSubcategoriesQuery(undefined);
  const [updateSubSubcategory, { isLoading: isUpdating }] = useUpdateSubSubcategoryMutation();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SubSubCategoryFormData>({
    resolver: zodResolver(subSubCategorySchema),
    defaultValues: {
      name: "",
      subcategory: "",
      isActive: true,
    },
  });

  // Load existing sub-sub-category data
  useEffect(() => {
    if (subSubCategoriesResponse && subSubCategoryId) {
      const subSubCategories: any[] = (subSubCategoriesResponse?.data ?? subSubCategoriesResponse ?? []) as any[];
      const currentSubSubCategory = subSubCategories.find(
        (item: any) => (item.id ?? item._id) === subSubCategoryId
      );
      
      if (currentSubSubCategory) {
        const formData = {
          name: currentSubSubCategory.name ?? "",
          subcategory: currentSubSubCategory.subcategory?.id ?? currentSubSubCategory.subcategory ?? "",
          isActive: currentSubSubCategory.isActive ?? true,
        };
        reset(formData);
      }
    }
  }, [subSubCategoriesResponse, subSubCategoryId, reset]);

  const onSubmit = async (data: SubSubCategoryFormData) => {
    try {
      const payload = {
        id: subSubCategoryId,
        ...data,
      };
      console.log("Update sub-sub-category payload:", payload);
      const res = await updateSubSubcategory(payload).unwrap();
      console.log("Sub-sub-category updated:", res);
      toast.success("Sub-sub-category updated successfully!");
    } catch (error) {
      console.error("Update sub-sub-category failed:", error);
      toast.error("Failed to update sub-sub-category. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">Edit Sub-Sub-Category</h1>
            <p className="text-gray-600 mt-1">Update sub-sub-category information</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6 space-y-6">
            {/* Sub-Sub-Category Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Sub-Sub-Category Name *
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter sub-sub-category name"
                className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Parent Sub-Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="subcategory" className="text-sm font-medium text-gray-700">
                Parent Sub-Category *
              </Label>
              <Controller
                control={control}
                name="subcategory"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={isSubcategoriesLoading}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={isSubcategoriesLoading ? "Loading sub-categories..." : "Select a parent sub-category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {(subcategoriesResponse?.data ?? subcategoriesResponse ?? []).map((subcategory: any) => (
                        <SelectItem key={subcategory.id ?? subcategory._id} value={(subcategory.id ?? subcategory._id) as string}>
                          {subcategory.name ?? subcategory.subcategoryName ?? "Unnamed"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.subcategory && (
                <p className="text-sm text-red-600">{errors.subcategory.message}</p>
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
                disabled={isSubcategoriesLoading || isSubSubCategoriesLoading || isUpdating}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 disabled:opacity-60"
              >
                {isUpdating ? "Updating..." : "Update Sub-Sub-Category"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

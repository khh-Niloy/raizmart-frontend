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
import { useGetCategoriesQuery, useGetSubcategoriesQuery, useUpdateSubcategoryMutation } from "@/app/redux/features/category-subcategory/category-subcategory.api";
import { useParams } from "next/navigation";
import { toast } from "sonner";

// Validation schema
const subcategorySchema = z.object({
  name: z.string().min(1, "Sub-category name is required"),
  category: z.string().min(1, "Please select a parent category"),
  isActive: z.boolean(),
});

type SubcategoryFormData = z.infer<typeof subcategorySchema>;

export default function EditSubcategoryPage() {
  const params = useParams();
  const subcategoryId = params.id as string;
  
  const { data: categoriesResponse, isFetching: isCategoriesLoading } = useGetCategoriesQuery(undefined);
  const { data: subcategoriesResponse, isFetching: isSubcategoriesLoading } = useGetSubcategoriesQuery(undefined);
  const [updateSubcategory, { isLoading: isUpdating }] = useUpdateSubcategoryMutation();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SubcategoryFormData>({
    resolver: zodResolver(subcategorySchema),
    defaultValues: {
      name: "",
      category: "",
      isActive: true,
    },
  });

  // Load existing subcategory data
  useEffect(() => {
    if (subcategoriesResponse && subcategoryId) {
      const subcategories: any[] = (subcategoriesResponse?.data ?? subcategoriesResponse ?? []) as any[];
      const currentSubcategory = subcategories.find(
        (item: any) => (item.id ?? item._id) === subcategoryId
      );
      
      if (currentSubcategory) {
        const formData = {
          name: currentSubcategory.name ?? "",
          category: currentSubcategory.category?.id ?? currentSubcategory.category ?? "",
          isActive: currentSubcategory.isActive ?? true,
        };
        reset(formData);
      }
    }
  }, [subcategoriesResponse, subcategoryId, reset]);

  const onSubmit = async (data: SubcategoryFormData) => {
    try {
      const payload = {
        id: subcategoryId,
        ...data,
      };
      console.log("Update subcategory payload:", payload);
      const res = await updateSubcategory(payload).unwrap();
      console.log("Subcategory updated:", res);
      toast.success("Subcategory updated successfully!");
    } catch (error) {
      console.error("Update subcategory failed:", error);
      toast.error("Failed to update subcategory. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">Edit Sub-category</h1>
            <p className="text-gray-600 mt-1">Update sub-category information</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6 space-y-6">
            {/* Sub-category Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Sub-category Name *
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter sub-category name"
                className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Parent Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                Parent Category *
              </Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={isCategoriesLoading}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={isCategoriesLoading ? "Loading categories..." : "Select a parent category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {(categoriesResponse?.data ?? categoriesResponse ?? []).map((category: any) => (
                        <SelectItem key={category.id ?? category._id} value={(category.id ?? category._id) as string}>
                          {category.name ?? category.categoryName ?? "Unnamed"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-sm text-red-600">{errors.category.message}</p>
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
                disabled={isCategoriesLoading || isSubcategoriesLoading || isUpdating}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 disabled:opacity-60"
              >
                {isUpdating ? "Updating..." : "Update Sub-category"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}






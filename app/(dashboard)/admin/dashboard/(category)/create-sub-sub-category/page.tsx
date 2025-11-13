"use client";

import React from "react";
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
import { useGetSubcategoriesQuery, useCreateSubSubcategoryMutation } from "@/app/redux/features/category-subcategory/category-subcategory.api";
import { toast } from "sonner";

// Validation schema
const subSubCategorySchema = z.object({
  name: z.string().min(1, "Sub-sub-category name is required"),
  subcategory: z.string().min(1, "Please select a parent sub-category"),
  image: z.any().optional(),
});

type SubSubCategoryFormData = z.infer<typeof subSubCategorySchema>;

export default function CreateSubSubCategoryPage() {
  const { data: subcategoriesResponse, isFetching: isSubcategoriesLoading } = useGetSubcategoriesQuery(undefined);
  const [createSubSubcategory, { isLoading: isCreating }] = useCreateSubSubcategoryMutation();

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
    },
  });

  const onSubmit = async (data: SubSubCategoryFormData) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('subcategory', data.subcategory);
      if (data.image && data.image instanceof FileList && data.image.length > 0) {
        formData.append('image', data.image[0]);
      }
      console.log("Sub-sub-category FormData:", Array.from(formData.entries()));
      const res = await createSubSubcategory(formData).unwrap();
      console.log("Sub-sub-category created:", res);
      toast.success("Sub-sub-category created successfully!");
      reset({
        name: "",
        subcategory: "",
      });
    } catch (error) {
      console.error("Create sub-sub-category failed:", error);
      toast.error("Failed to create sub-sub-category. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">Create Sub-Sub-Category</h1>
            <p className="text-gray-600 mt-1">Add a new sub-sub-category under an existing sub-category</p>
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
            {/* Image upload */}
            <div className="space-y-2">
              <Label htmlFor="image" className="text-sm font-medium text-gray-700">
                Image
              </Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                {...register('image')}
                className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.image && (
                <p className="text-sm text-red-600">{errors.image.message as string}</p>
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
                  <Select
                    key={field.value || "empty"}
                    value={field.value || undefined}
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                    disabled={isSubcategoriesLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={isSubcategoriesLoading ? "Loading sub-categories..." : "Select a parent sub-category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {(Array.isArray(subcategoriesResponse) ? subcategoriesResponse : []).map((subcategory: { id?: string; _id?: string; name?: string; subcategoryName?: string }) => (
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

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <Button
                type="submit"
                disabled={isSubcategoriesLoading || isCreating}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 disabled:opacity-60"
              >
                {isCreating ? "Creating..." : "Create Sub-Sub-Category"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

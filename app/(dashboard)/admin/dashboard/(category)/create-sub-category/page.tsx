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
import { useGetCategoriesQuery, useCreateSubcategoryMutation } from "@/app/redux/features/category-subcategory/category-subcategory.api";

// Parent categories will be fetched from API

// Validation schema
const subCategorySchema = z.object({
  name: z.string().min(1, "Sub-category name is required"),
  category: z.string().min(1, "Please select a parent category"),
});

type SubCategoryFormData = z.infer<typeof subCategorySchema>;

export default function CreateSubCategoryPage() {
  const { data: categoriesResponse, isFetching: isCategoriesLoading } = useGetCategoriesQuery(undefined);
  const [createSubcategory, { isLoading: isCreating }] = useCreateSubcategoryMutation();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SubCategoryFormData>({
    resolver: zodResolver(subCategorySchema),
    defaultValues: {
      name: "",
      category: "",
    },
  });

  const onSubmit = async (data: SubCategoryFormData) => {
    try {
      const payload = {
        name: data.name,
        category: data.category,
      };
      console.log(payload)
      const res = await createSubcategory(payload).unwrap();
      console.log("Sub-category created:", res);
      reset();
    } catch (error) {
      console.error("Create sub-category failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">Create Sub-Category</h1>
            <p className="text-gray-600 mt-1">Add a new sub-category under an existing parent category</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6 space-y-6">
            {/* Sub-Category Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Sub-Category Name *
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
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isCategoriesLoading}>
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

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 disabled:opacity-60"
              >
                {isCreating ? "Creating..." : "Create Sub-Category"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

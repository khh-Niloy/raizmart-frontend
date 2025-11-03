"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCategoryMutation } from "@/app/redux/features/category-subcategory/category-subcategory.api";
import { toast } from "sonner";

// Validation schema
const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  image: z.any().optional(), // Add image field (will validate in handler)
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function CreateCategoryPage() {
  const [createCategory, { isLoading }] = useCreateCategoryMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      // Check for file
      if (data.image && data.image instanceof FileList && data.image.length > 0) {
        formData.append("image", data.image[0]);
      }
      // Create with FormData
      const res = await createCategory(formData).unwrap();
      console.log("Category created:", res);
      toast.success("Category created successfully!");
      reset();
    } catch (error) {
      console.error("Create category failed:", error);
      toast.error("Failed to create category. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">Create Category</h1>
            <p className="text-gray-600 mt-1">Add a new category to your inventory</p>
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
            {/* Category Image */}
            <div className="space-y-2">
              <Label htmlFor="image" className="text-sm font-medium text-gray-700">
                Category Image
              </Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                {...register("image")}
                className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.image && (
                <p className="text-sm text-red-600">{errors.image.message as string}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 disabled:opacity-60"
              >
                {isLoading ? "Creating..." : "Create Category"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

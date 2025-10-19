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

// Mock data for parent categories (in real app, this would come from API)
const parentCategories = [
  { id: "1", name: "Electronics" },
  { id: "2", name: "Fashion" },
  { id: "3", name: "Home & Kitchen" },
  { id: "4", name: "Sports" },
  { id: "5", name: "Books" },
  { id: "6", name: "Toys & Games" },
  { id: "7", name: "Health & Beauty" },
  { id: "8", name: "Automotive" },
];

// Validation schema
const subCategorySchema = z.object({
  subCategoryName: z.string().min(1, "Sub-category name is required"),
  parentCategoryId: z.string().min(1, "Please select a parent category"),
});

type SubCategoryFormData = z.infer<typeof subCategorySchema>;

export default function CreateSubCategoryPage() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SubCategoryFormData>({
    resolver: zodResolver(subCategorySchema),
    defaultValues: {
      subCategoryName: "",
      parentCategoryId: "",
    },
  });

  const onSubmit = (data: SubCategoryFormData) => {
    console.log("Sub-category data:", data);
    // Handle form submission here
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
              <Label htmlFor="subCategoryName" className="text-sm font-medium text-gray-700">
                Sub-Category Name *
              </Label>
              <Input
                id="subCategoryName"
                {...register("subCategoryName")}
                placeholder="Enter sub-category name"
                className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.subCategoryName && (
                <p className="text-sm text-red-600">{errors.subCategoryName.message}</p>
              )}
            </div>

            {/* Parent Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="parentCategoryId" className="text-sm font-medium text-gray-700">
                Parent Category *
              </Label>
              <Controller
                control={control}
                name="parentCategoryId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a parent category" />
                    </SelectTrigger>
                    <SelectContent>
                      {parentCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.parentCategoryId && (
                <p className="text-sm text-red-600">{errors.parentCategoryId.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
              >
                Create Sub-Category
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

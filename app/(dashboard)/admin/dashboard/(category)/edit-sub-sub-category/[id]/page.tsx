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
  isActive: z.boolean().optional(),
  image: z.any().optional(),
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

  const [currentImage, setCurrentImage] = React.useState<string | undefined>(undefined);

  // Load existing sub-sub-category data
  useEffect(() => {
    if (subSubCategoriesResponse && subSubCategoryId && subcategoriesResponse) {
      const subSubCategories = (subSubCategoriesResponse?.data ?? subSubCategoriesResponse ?? []) as any[];
      const currentSubSubCategory = subSubCategories.find(
        (item: any) => (item.id ?? item._id) === subSubCategoryId
      );
      if (currentSubSubCategory) {
        setCurrentImage(currentSubSubCategory?.image ?? undefined);
        const subVal =
          typeof currentSubSubCategory.subcategory === "object"
            ? String(currentSubSubCategory.subcategory._id ?? currentSubSubCategory.subcategory.id)
            : String(currentSubSubCategory.subcategory ?? "");
        const subExists = (subcategoriesResponse?.data ?? subcategoriesResponse ?? [])
          .some((sc: any) => String(sc.id ?? sc._id) === subVal);
        if (subExists) {
          reset({
            name: currentSubSubCategory.name ?? "",
            subcategory: subVal,
            isActive: currentSubSubCategory.isActive ?? true
          });
        }
      }
    }
  }, [subSubCategoriesResponse, subcategoriesResponse, subSubCategoryId, reset]);

  const onSubmit = async (data: SubSubCategoryFormData) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('subcategory', data.subcategory);
      formData.append('isActive', String(data.isActive));
      if (data.image && data.image instanceof FileList && data.image.length > 0) {
        formData.append('image', data.image[0]);
      }
      await updateSubSubcategory({ id: subSubCategoryId, formData }).unwrap();
      toast.success("Sub-sub-category updated successfully!");
    } catch (error) {
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
            {/* Sub-Sub-Category Name & Image preview inline */}
            <div className="flex items-center gap-6 space-y-0 mb-2">
              <div className="flex-1">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Sub-Sub-Category Name *
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Enter sub-sub-category name"
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                {errors?.name && (
                  <p className="text-sm text-red-600">{errors?.name?.message}</p>
                )}
              </div>
              {!!currentImage && (
                <div className="flex-shrink-0 ml-2">
                  <img
                    src={currentImage?.startsWith?.("http") ? currentImage : "/" + currentImage?.replace?.(/^\/*/, "")}
                    alt="Current Sub-sub-category"
                    className="h-14 w-14 rounded border border-gray-200 object-contain"
                  />
                </div>
              )}
            </div>
            {/* Image upload field */}
            <div className="space-y-2">
              <Label htmlFor="image" className="text-sm font-medium text-gray-700">
                Image
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

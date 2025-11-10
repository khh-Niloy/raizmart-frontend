"use client";

import React, { useEffect } from "react";
import Image from "next/image";
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
import {
  useGetCategoriesQuery,
  useGetSubcategoriesQuery,
  useUpdateSubcategoryMutation,
} from "@/app/redux/features/category-subcategory/category-subcategory.api";
import { useParams } from "next/navigation";
import { toast } from "sonner";

// Validation schema
const subcategorySchema = z.object({
  name: z.string().min(1, "Sub-category name is required"),
  category: z.string().min(1, "Please select a parent category"),
  isActive: z.boolean(),
  image: z.any().optional(),
});

type SubcategoryFormData = z.infer<typeof subcategorySchema>;

export default function EditSubcategoryPage() {
  const params = useParams();
  const subcategoryId = params.id as string;

  const { data: categoriesResponse, isFetching: isCategoriesLoading } =
    useGetCategoriesQuery(undefined);
  const { data: subcategoriesResponse, isFetching: isSubcategoriesLoading } =
    useGetSubcategoriesQuery(undefined);
  const [updateSubcategory, { isLoading: isUpdating }] =
    useUpdateSubcategoryMutation();

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

  const [currentImage, setCurrentImage] = React.useState<string | undefined>(
    undefined
  );

  interface Subcategory {
    id?: string;
    _id?: string;
    name?: string;
    isActive?: boolean;
    image?: string;
    category?: string | { _id?: string; id?: string };
  }

  interface Category {
    id?: string;
    _id?: string;
  }

  // Load existing subcategory data
  useEffect(() => {
    if (subcategoriesResponse && categoriesResponse && subcategoryId) {
      // same...
      // Ensure data is an array (transformResponse already extracts data, so subcategoriesResponse should be the array)
      const subcategories: Subcategory[] = Array.isArray(subcategoriesResponse) ? subcategoriesResponse : [];
      const currentSubcategory = subcategories.find(
        (item: Subcategory) => (item.id ?? item._id) === subcategoryId
      );
      if (currentSubcategory) {
        setCurrentImage(currentSubcategory?.image ?? undefined);
        const catValue =
          typeof currentSubcategory.category === "object"
            ? String(
                currentSubcategory.category._id ??
                  currentSubcategory.category.id
              )
            : String(currentSubcategory.category ?? "");
        // Check if catValue is in categories list
        // Ensure data is an array (transformResponse already extracts data, so categoriesResponse should be the array)
        const categories: Category[] = Array.isArray(categoriesResponse) ? categoriesResponse : [];
        const catExists = categories.some((cat: Category) => String(cat.id ?? cat._id) === catValue);
        if (catExists) {
          reset({
            name: currentSubcategory.name ?? "",
            category: catValue,
            isActive: currentSubcategory.isActive ?? true,
          });
        }
      }
    }
  }, [subcategoriesResponse, categoriesResponse, subcategoryId, reset]);

  const onSubmit = async (data: SubcategoryFormData) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("category", data.category);
      formData.append("isActive", String(data.isActive));
      if (
        data.image &&
        data.image instanceof FileList &&
        data.image.length > 0
      ) {
        formData.append("image", data.image[0]);
      }
      await updateSubcategory({
        id: subcategoryId,
        formData,
      }).unwrap();
      toast.success("Subcategory updated successfully!");
    } catch {
      toast.error("Failed to update subcategory. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              Edit Sub-category
            </h1>
            <p className="text-gray-600 mt-1">
              Update sub-category information
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 pb-6 space-y-6"
          >
            {/* Sub-category Name & Image preview inline */}
            <div className="flex items-center gap-6 space-y-0 mb-2">
              <div className="flex-1">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700"
                >
                  Sub-category Name *
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Enter sub-category name"
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                {errors?.name && (
                  <p className="text-sm text-red-600">
                    {errors?.name?.message}
                  </p>
                )}
              </div>
            </div>
            {!!currentImage && (
              <div className="flex-shrink-0 my-5 relative h-14 w-14">
                <Image
                  src={currentImage}
                  alt="Current Sub-category"
                  fill
                  className="rounded border border-gray-200 object-contain"
                />
              </div>
            )}
            {/* Image upload field */}
            <div className="space-y-2">
              <Label
                htmlFor="image"
                className="text-sm font-medium text-gray-700"
              >
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
                <p className="text-sm text-red-600">
                  {errors.image.message as string}
                </p>
              )}
            </div>

            {/* Parent Category Selection */}
            <div className="space-y-2">
              <Label
                htmlFor="category"
                className="text-sm font-medium text-gray-700"
              >
                Parent Category *
              </Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isCategoriesLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          isCategoriesLoading
                            ? "Loading categories..."
                            : "Select a parent category"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        Array.isArray(categoriesResponse) ? categoriesResponse : []
                      ).map((category: { id?: string; _id?: string; name?: string; categoryName?: string }) => (
                        <SelectItem
                          key={category.id ?? category._id}
                          value={(category.id ?? category._id) as string}
                        >
                          {category.name ?? category.categoryName ?? "Unnamed"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-sm text-red-600">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Active Status */}
            <div className="space-y-2">
              <Label
                htmlFor="isActive"
                className="text-sm font-medium text-gray-700"
              >
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
              <Button type="button" variant="outline" className="px-8 py-2">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isCategoriesLoading || isSubcategoriesLoading || isUpdating
                }
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

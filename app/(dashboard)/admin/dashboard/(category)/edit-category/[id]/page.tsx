"use client";

import React from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} from "@/app/redux/features/category-subcategory/category-subcategory.api";
import { useParams } from "next/navigation";
import { toast } from "sonner";

// Validation schema
const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  isActive: z.boolean(),
  image: z.any().optional(), // Add image field for edit too
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function EditCategoryPage() {
  const params = useParams();
  const categoryId = params?.id as string | undefined;

  const { data: categoriesResponse, isFetching: isCategoriesLoading } =
    useGetCategoriesQuery(undefined);
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [currentImage, setCurrentImage] = React.useState<string | undefined>(
    undefined
  );

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

  interface Category {
    id?: string;
    _id?: string;
    name?: string;
    isActive?: boolean;
    image?: string;
  }

  // Load existing category data
  React.useEffect(() => {
    if (categoriesResponse && categoryId) {
      // Ensure data is an array (transformResponse already extracts data, so categoriesResponse should be the array)
      const categories: Category[] = Array.isArray(categoriesResponse) ? categoriesResponse : [];
      const currentCategory = categories.find(
        (item: Category) => (item.id ?? item._id) === categoryId
      );

      if (currentCategory) {
        setCurrentImage(currentCategory.image ?? undefined);
        const formData = {
          name: currentCategory.name ?? "",
          isActive: currentCategory.isActive ?? true,
        };
        reset(formData);
      }
    }
  }, [categoriesResponse, categoryId, reset]);

  // Log params and categoryId for robust debugging
  React.useEffect(() => {
    console.log("EditCategoryPage params:", params, "categoryId:", categoryId);
  }, [params, categoryId]);

  const onSubmit = async (data: CategoryFormData) => {
    if (!categoryId) {
      toast.error("Category ID missing (bad route?)");
      console.error(
        "Cannot update: categoryId is",
        categoryId,
        "params:",
        params
      );
      return;
    }
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("isActive", String(data.isActive));
      if (
        data.image &&
        data.image instanceof FileList &&
        data.image.length > 0
      ) {
        formData.append("image", data.image[0]);
      }

      await updateCategory({ id: categoryId, formData }).unwrap();
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
            <h1 className="text-2xl font-semibold text-gray-900">
              Edit Category
            </h1>
            <p className="text-gray-600 mt-1">Update category information</p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 pb-6 space-y-6"
          >
            {/* Category Name */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
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
            {/* Category Image (Existing & Upload) */}
            <div className="space-y-2">
              <Label
                htmlFor="image"
                className="text-sm font-medium text-gray-700"
              >
                Category Image
              </Label>
              {currentImage && (
                <div className="mb-2">
                  {/* If backend serves absolute/relative path, may need prefix if not full URL */}
                  <div className="relative h-24 w-auto max-w-xs">
                    <Image
                      src={
                        currentImage.startsWith("http")
                          ? currentImage
                          : "/" + currentImage.replace(/^\/*/, "")
                      }
                      alt="Current Category"
                      fill
                      className="rounded border border-gray-200 object-contain"
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Existing image. Upload below to change.
                  </div>
                </div>
              )}
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

            {/* Active Status */}
            {/* <div className="space-y-2">
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
            </div> */}

            {/* Submit Button */}
            <div className="flex justify-end pt-6 space-x-4">
              <Button type="button" variant="outline" className="px-8 py-2">
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

"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useGetBlogCategoryByIdQuery,
  useUpdateBlogCategoryMutation,
} from "@/app/redux/features/blog-category/blog-category.api";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

// Validation schema - all fields optional for edit
const schema = z.object({
  name: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EditBlogCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params?.id as string | undefined;

  const { data: categoryResponse, isFetching: isLoadingCategory } =
    useGetBlogCategoryByIdQuery(categoryId!, {
      skip: !categoryId,
    });
  const [updateBlogCategory, { isLoading: isUpdating }] =
    useUpdateBlogCategoryMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  // Load existing category data
  useEffect(() => {
    if (categoryResponse) {
      const category: any = categoryResponse?.data ?? categoryResponse;
      const formData = {
        name: category?.name ?? "",
      };
      reset(formData);
    }
  }, [categoryResponse, reset]);

  const onSubmit = async (data: FormData) => {
    if (!categoryId) {
      toast.error("Blog category ID is missing");
      return;
    }

    try {
      // Only send fields that have values
      const payload: any = {};
      if (data.name && data.name.trim() !== "") {
        payload.name = data.name.trim();
      }

      // Only proceed if there's at least one field to update
      if (Object.keys(payload).length === 0) {
        toast.error("Please provide at least one field to update");
        return;
      }

      const res = await updateBlogCategory({ id: categoryId, payload }).unwrap();
      console.log(res);
      toast.success("Blog category updated successfully!");
      router.push("/admin/dashboard/all-blog-category");
    } catch (e: any) {
      console.error(e);
      const errorMessage =
        e?.data?.message || e?.message || "Failed to update blog category. Please try again.";
      toast.error(errorMessage);
    }
  };

  if (isLoadingCategory) {
    return (
      <div className="min-h-screen bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white">
            <div className="px-6 py-4">
              <div className="text-gray-600">Loading blog category...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              Edit Blog Category
            </h1>
            <p className="text-gray-600 mt-1">
              Update blog category information (all fields are optional)
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 pb-6 space-y-6 max-w-lg"
          >
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Name
              </Label>
              <Input
                id="name"
                placeholder="Enter name"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="flex justify-end pt-2 space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="px-8 py-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 disabled:opacity-60"
              >
                {isUpdating ? "Updating..." : "Update"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


"use client";

import React, { useEffect, useRef, useState } from "react";
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
import TiptapEditor from "@/components/ui/tiptap-editor";
import { toast } from "sonner";
import {
  useGetBlogCategoriesQuery,
  useGetBlogByIdQuery,
  useUpdateBlogMutation,
} from "@/app/redux/features/blog-category/blog-category.api";
import { useParams, useRouter } from "next/navigation";

// Form validation schema - all fields optional for edit
const blogSchema = z.object({
  blogTitle: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  image: z.any().optional(),
  blogContent: z.string().optional(),
  status: z.enum(["active", "inactive", "draft"]).optional(),
});

type BlogFormData = z.infer<typeof blogSchema>;

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const blogId = params?.id as string | undefined;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    setValue,
    watch,
    reset,
  } = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      blogTitle: "",
      category: "",
      tags: "",
      blogContent: "",
      status: undefined,
    },
  });

  const blogContent = watch("blogContent");
  const image = watch("image");
  const category = watch("category");
  const status = watch("status");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentImage, setCurrentImage] = useState<string | undefined>(
    undefined
  );
  const formInitialized = useRef(false);

  // Debug: Log current form values
  useEffect(() => {
    const blogContentPreview =
      typeof blogContent === "string"
        ? blogContent.substring(0, 50)
        : blogContent
        ? JSON.stringify(blogContent).substring(0, 50)
        : "empty";
    console.log("Current form values:", {
      category,
      status,
      blogContent: blogContentPreview,
    });
  }, [category, status, blogContent]);

  // Load blog data
  const { data: blogResponse, isFetching: isLoadingBlog } = useGetBlogByIdQuery(
    blogId!,
    {
      skip: !blogId,
    }
  );

  // Load blog categories
  const { data: blogCategoriesResp, isFetching: isBlogCategoriesLoading } =
    useGetBlogCategoriesQuery(undefined);
  interface BlogCategory {
    id?: string;
    _id?: string;
    name?: string;
    categoryName?: string;
  }

  interface BlogData {
    image?: string;
    tags?: string[] | string;
    category?: string | { _id?: string; id?: string };
    status?: string;
    blogTitle?: string;
    title?: string;
    [key: string]: unknown;
  }

  const blogCategories: BlogCategory[] = React.useMemo(() => {
    // Ensure data is an array (transformResponse already extracts data, so blogCategoriesResp should be the array)
    return Array.isArray(blogCategoriesResp) ? blogCategoriesResp : [];
  }, [blogCategoriesResp]);

  // Update blog mutation
  const [updateBlog, { isLoading: isUpdatingBlog }] = useUpdateBlogMutation();

  // Load existing blog data - wait for both blog and categories to load
  useEffect(() => {
    if (blogResponse && !isBlogCategoriesLoading && !formInitialized.current) {
      // transformResponse already extracts data, so blogResponse should be the blog object
      const blog = blogResponse as BlogData;

      console.log("Raw blog data:", blog);
      console.log("Available categories:", blogCategories);

      // Set current image for display
      if (blog.image) {
        setCurrentImage(
          blog.image.startsWith("http")
            ? blog.image
            : `/${blog.image.replace(/^\/*/, "")}`
        );
      }

      // Convert tags array to string if needed
      const tagsString = Array.isArray(blog.tags)
        ? blog.tags.join(", ")
        : blog.tags || "";

      // Get category ID - handle both populated and unpopulated category
      let categoryId = "";
      if (blog.category) {
        if (typeof blog.category === "string") {
          categoryId = blog.category;
        } else if (blog.category._id) {
          categoryId = String(blog.category._id);
        } else if (blog.category.id) {
          categoryId = String(blog.category.id);
        }
      }

      // Get status
      const status = blog.status || "active";

      console.log("Extracted values:", {
        categoryId,
        status,
        blogCategory: blog.category,
        availableCategoryIds: blogCategories.map((c: BlogCategory) =>
          String(c.id ?? c._id)
        ),
      });

      // Handle blogContent - can be string or object (Tiptap JSON)
      const blogContentValue = blog.blogContent || blog.content;
      const blogContentString = typeof blogContentValue === 'string' 
        ? blogContentValue 
        : blogContentValue 
          ? JSON.stringify(blogContentValue)
          : "";

      const formData: BlogFormData = {
        blogTitle: blog.blogTitle || blog.title || "",
        category: categoryId,
        tags: tagsString,
        image: undefined, // File uploads need to be handled separately
        blogContent: blogContentString,
        status: status as "active" | "inactive" | "draft",
      };

      console.log("Form data to set:", formData);

      // Reset form with all data
      reset(formData, {
        keepDefaultValues: false,
      });

      // Ensure Select values are explicitly set (sometimes reset doesn't trigger Select updates immediately)
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        if (categoryId) {
          console.log("Explicitly setting category value:", categoryId);
          setValue("category", categoryId, {
            shouldValidate: false,
            shouldDirty: false,
          });
        }
        if (status) {
          console.log("Explicitly setting status value:", status);
          setValue("status", status as "active" | "inactive" | "draft", {
            shouldValidate: false,
            shouldDirty: false,
          });
        }
      });

      formInitialized.current = true;
    }
  }, [blogResponse, blogCategories, isBlogCategoriesLoading, reset, setValue]);

  const onSubmit = async (data: BlogFormData) => {
    if (!blogId) {
      toast.error("Blog ID is missing");
      return;
    }

    try {
      // Create FormData for file upload
      const formData = new FormData();

      // Build update payload - only include fields that are provided and have values
      // Map frontend field names to backend expected field names
      if (data.blogTitle !== undefined && data.blogTitle.trim() !== "") {
        formData.append("title", data.blogTitle.trim()); // Backend expects "title"
      }

      if (data.category !== undefined && data.category !== "") {
        formData.append("category", data.category);
      }

      if (data.tags !== undefined && data.tags.trim() !== "") {
        // Convert tags string to array
        const tagsArray = data.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag);
        formData.append("tags", JSON.stringify(tagsArray));
      }

      // Handle image - if new file uploaded, use it; otherwise keep existing
      // Backend expects "thumbnail" as fieldname for the file
      if (data.image && data.image instanceof File) {
        formData.append("thumbnail", data.image); // Backend expects "thumbnail"
      }

      if (data.blogContent !== undefined && data.blogContent.trim() !== "") {
        // Convert blogContent to JSON string if it's an object
        const contentToSend = typeof data.blogContent === 'string' 
          ? data.blogContent 
          : JSON.stringify(data.blogContent);
        formData.append("content", contentToSend); // Backend expects "content"
      }

      if (data.status !== undefined) {
        // Only send status if it's not "draft" (backend doesn't support draft)
        if (data.status !== "draft") {
          formData.append("status", data.status);
        }
      }

      // Check if at least one field is being updated
      const hasUpdates =
        formData.has("title") ||
        formData.has("category") ||
        formData.has("tags") ||
        formData.has("thumbnail") ||
        formData.has("content") ||
        formData.has("status");

      if (!hasUpdates) {
        toast.error("Please provide at least one field to update");
        return;
      }

      console.log("Blog update FormData:", {
        title: data.blogTitle,
        category: data.category,
        tags: data.tags,
        hasThumbnail: !!data.image,
        content: data.blogContent,
        status: data.status,
      });

      // Call the API
      await updateBlog({ id: blogId, formData }).unwrap();

      toast.success("Blog updated successfully!");
      router.push("/admin/dashboard/all-blog");
    } catch (error: unknown) {
      console.error("Error updating blog:", error);
      const errorData = error as { data?: { message?: string }; message?: string };
      const errorMessage =
        errorData?.data?.message ||
        errorData?.message ||
        "Failed to update blog. Please try again.";
      toast.error(errorMessage);
    }
  };

  if (isLoadingBlog) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Blog Post</h1>
          <p className="text-gray-600 mt-2">Loading blog data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Blog Post</h1>
        <p className="text-gray-600 mt-2">
          Update your blog post (all fields are optional)
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Title Field */}
        <div className="space-y-2">
          <Label htmlFor="blogTitle" className="text-sm font-medium">
            Blog Title
          </Label>
          <Input
            id="blogTitle"
            {...register("blogTitle")}
            placeholder="Enter your blog title"
            className="w-full"
          />
          {errors.blogTitle && (
            <p className="text-sm text-red-600">{errors.blogTitle.message}</p>
          )}
        </div>

        {/* Category and Tags Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category
            </Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => {
                const fieldValue = field.value
                  ? String(field.value)
                  : undefined;
                console.log("Category Controller render:", {
                  fieldValue,
                  availableCategories: blogCategories.map((c: BlogCategory) =>
                    String(c.id ?? c._id)
                  ),
                });
                return (
                  <Select
                    value={fieldValue}
                    onValueChange={(value) => {
                      console.log("Category changed to:", value);
                      field.onChange(value);
                    }}
                    disabled={isBlogCategoriesLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          isBlogCategoriesLoading
                            ? "Loading categories..."
                            : "Select a category"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {blogCategories.map((c: BlogCategory) => {
                        const id = (c.id ?? c._id) as string;
                        const name = (c.name ??
                          c.categoryName ??
                          "Unnamed") as string;
                        const valueString = String(id);
                        return (
                          <SelectItem key={id} value={valueString}>
                            {name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                );
              }}
            />
            {errors.category && (
              <p className="text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="text-sm font-medium">
              Tags
            </Label>
            <Input
              id="tags"
              {...register("tags")}
              placeholder="tag1, tag2, tag3"
              className="w-full"
            />
            <p className="text-xs text-gray-500">Separate tags with commas</p>
          </div>
        </div>

        {/* Status Field */}
        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm font-medium">
            Status
          </Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => {
              console.log("Status Controller render:", {
                fieldValue: field.value,
              });
              return (
                <Select
                  value={field.value || undefined}
                  onValueChange={(value) => {
                    console.log("Status changed to:", value);
                    field.onChange(value as "active" | "inactive" | "draft");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              );
            }}
          />
          {errors.status && (
            <p className="text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>

        {/* Thumbnail Image */}
        <div className="space-y-2">
          <Label htmlFor="image" className="text-sm font-medium">
            Thumbnail Image
          </Label>
          {currentImage && !image && (
            <div className="mb-2 relative w-full h-40">
              <Image
                src={currentImage}
                alt="Current thumbnail"
                fill
                className="rounded border object-contain"
              />
              <div className="text-xs text-gray-500 mt-1">
                Existing image. Upload below to change.
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Input
              id="image"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                setValue("image", file);
                setCurrentImage(undefined); // Clear existing image preview
                // Allow re-selecting the same file by clearing the input value
                e.currentTarget.value = "";
              }}
            />
            {(image || currentImage) && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setValue("image", undefined);
                  setCurrentImage(undefined);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Remove
              </Button>
            )}
          </div>
          {image && (
            <div className="mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(image as File)}
                alt="New thumbnail preview"
                className="max-h-40 rounded border object-contain"
              />
            </div>
          )}
        </div>

        {/* Blog Content */}
        <div className="space-y-2">
          <Label htmlFor="blogContent" className="text-sm font-medium">
            Blog Content
          </Label>
          <TiptapEditor
            value={blogContent || ""}
            onChange={(value) => setValue("blogContent", value)}
            placeholder="Start writing your blog post..."
          />
          {errors.blogContent && (
            <p className="text-sm text-red-600">{errors.blogContent.message}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isUpdatingBlog}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
          >
            {isSubmitting || isUpdatingBlog
              ? "Updating..."
              : "Update Blog Post"}
          </Button>
        </div>
      </form>
    </div>
  );
}

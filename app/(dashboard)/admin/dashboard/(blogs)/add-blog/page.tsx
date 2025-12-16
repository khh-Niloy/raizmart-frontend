"use client";

import React from 'react';
import dynamic from "next/dynamic";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useGetBlogCategoriesQuery, useCreateBlogMutation } from '@/app/redux/features/blog-category/blog-category.api';
import { IMAGE_ACCEPT, validateImageFileChange } from "@/lib/imageValidation";

const TiptapEditor = dynamic(() => import("@/components/ui/tiptap-editor"), {
  ssr: false,
  loading: () => <div className="min-h-[200px] rounded-md border border-dashed border-gray-200 bg-gray-50 animate-pulse" />,
});

// Form validation schema
const blogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  category: z.string().min(1, 'Category is required'),
  tags: z.string().optional(),
  thumbnail: z.any().optional(),
  content: z.string().min(1, 'Content is required'),
});

type BlogFormData = z.infer<typeof blogSchema>;

export default function AddBlogPage() {
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      content: '',
    },
  });

  const content = watch('content');
  const thumbnail = watch('thumbnail') as File | undefined;
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Load blog categories
  const { data: blogCategoriesResp, isFetching: isBlogCategoriesLoading } = useGetBlogCategoriesQuery(undefined);
  interface BlogCategory {
    id?: string;
    _id?: string;
    name?: string;
    categoryName?: string;
  }

  // Ensure data is an array (transformResponse already extracts data, so blogCategoriesResp should be the array)
  const blogCategories: BlogCategory[] = Array.isArray(blogCategoriesResp) 
    ? blogCategoriesResp 
    : [];

  // Create blog mutation
  const [createBlog, { isLoading: isCreatingBlog }] = useCreateBlogMutation();

  const onSubmit = async (data: BlogFormData) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add basic fields
      formData.append('title', data.title);
      formData.append('category', data.category);
      formData.append('content', data.content);
      
      // Add tags as JSON string
      if (data.tags) {
        const tagsArray = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        formData.append('tags', JSON.stringify(tagsArray));
      }
      
      // Add thumbnail file if present
      if (data.thumbnail && data.thumbnail instanceof File) {
        formData.append('thumbnail', data.thumbnail);
      }
      
      // Add timestamps
      formData.append('createdAt', new Date().toISOString());
      formData.append('updatedAt', new Date().toISOString());

      console.log('Blog FormData to submit:', {
        title: data.title,
        category: data.category,
        content: data.content,
        tags: data.tags,
        hasThumbnail: !!data.thumbnail
      });
      
      // Call the API
      await createBlog(formData).unwrap();
      
      toast.success('Blog created successfully!');
      reset();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error creating blog:', error);
      toast.error('Failed to create blog. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Blog Post</h1>
        <p className="text-gray-600 mt-2">Write and publish your blog post</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Title Field */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium">
            Blog Title *
          </Label>
          <Input
            id="title"
            {...register('title')}
            placeholder="Enter your blog title"
            className="w-full"
          />
          {errors.title && (
            <p className="text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>


        {/* Category and Tags Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category *
            </Label>
            <Select onValueChange={(value) => setValue('category', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={isBlogCategoriesLoading ? 'Loading categories...' : 'Select a category'} />
              </SelectTrigger>
              <SelectContent>
                {blogCategories.map((c: BlogCategory) => {
                  const id = (c.id ?? c._id) as string;
                  const name = (c.name ?? c.categoryName ?? 'Unnamed') as string;
                  return (
                    <SelectItem key={id} value={id}>{name}</SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
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
              {...register('tags')}
              placeholder="tag1, tag2, tag3"
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Separate tags with commas
            </p>
          </div>
        </div>

        {/* Thumbnail Image */}
        <div className="space-y-2">
          <Label htmlFor="thumbnail" className="text-sm font-medium">
            Thumbnail Image
          </Label>
          <div className="flex items-center gap-3">
            <Input
              id="thumbnail"
              type="file"
              accept={IMAGE_ACCEPT}
              ref={fileInputRef}
              onChange={(e) => {
                const isValid = validateImageFileChange(e);
                if (!isValid) {
                  setValue("thumbnail", undefined);
                  return;
                }
                const file = e.target.files?.[0];
                setValue("thumbnail", file);
                e.currentTarget.value = "";
              }}
            />
            {thumbnail && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setValue('thumbnail', undefined);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                Remove
              </Button>
            )}
          </div>
          {thumbnail && (
            <div className="mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(thumbnail)}
                alt="Thumbnail preview"
                className="max-h-40 rounded border"
              />
            </div>
          )}
        </div>

        {/* Blog Content */}
        <div className="space-y-2">
          <Label htmlFor="content" className="text-sm font-medium">
            Blog Content *
          </Label>
          <TiptapEditor
            value={content}
            onChange={(value) => setValue('content', value)}
            placeholder="Start writing your blog post..."
          />
          {errors.content && (
            <p className="text-sm text-red-600">{errors.content.message}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
          <Button
            type="submit"
            disabled={isSubmitting || isCreatingBlog}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
          >
            {isSubmitting || isCreatingBlog ? 'Creating...' : 'Create Blog Post'}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="flex-1 sm:flex-none"
          >
            Clear Form
          </Button>
        </div>
      </form>
    </div>
  );
}

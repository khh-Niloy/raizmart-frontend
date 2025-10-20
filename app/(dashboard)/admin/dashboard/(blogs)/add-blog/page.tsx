"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TiptapEditor from '@/components/ui/tiptap-editor';
import { toast } from 'sonner';
import { useGetBlogCategoriesQuery } from '@/app/redux/features/blog-category/blog-category.api';

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
  const blogCategories: any[] = (blogCategoriesResp?.data ?? blogCategoriesResp ?? []) as any[];

  const onSubmit = async (data: BlogFormData) => {
    try {
      // Prepare blog data
      const blogData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log('Blog data to submit:', blogData);
      
      // TODO: Replace with actual API call
      // const formData = new FormData();
      // Object.entries(blogData).forEach(([key, value]) => {
      //   if (key === 'thumbnail' && value instanceof File) {
      //     formData.append('thumbnail', value);
      //   } else if (Array.isArray(value)) {
      //     formData.append(key, JSON.stringify(value));
      //   } else if (value != null) {
      //     formData.append(key, String(value));
      //   }
      // });
      // await createBlog(formData);
      
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
                {blogCategories.map((c: any) => {
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
              accept="image/*"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                setValue('thumbnail', file);
                // Allow re-selecting the same file by clearing the input value
                e.currentTarget.value = '';
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
            disabled={isSubmitting}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
          >
            {isSubmitting ? 'Creating...' : 'Create Blog Post'}
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

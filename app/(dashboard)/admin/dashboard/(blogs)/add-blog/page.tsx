"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// Form validation schema
const blogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  slug: z.string().min(1, 'Slug is required').max(100, 'Slug must be less than 100 characters'),
  excerpt: z.string().min(1, 'Excerpt is required').max(200, 'Excerpt must be less than 200 characters'),
  category: z.string().min(1, 'Category is required'),
  tags: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  status: z.enum(['draft', 'published']),
});

type BlogFormData = z.infer<typeof blogSchema>;

export default function AddBlogPage() {
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      status: 'draft',
    },
  });

  // Auto-generate slug from title
  const title = watch('title');
  React.useEffect(() => {
    if (title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setValue('slug', slug);
    }
  }, [title, setValue]);

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
      // await createBlog(blogData);
      
      toast.success('Blog created successfully!');
      reset();
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

        {/* Slug Field */}
        <div className="space-y-2">
          <Label htmlFor="slug" className="text-sm font-medium">
            URL Slug *
          </Label>
          <Input
            id="slug"
            {...register('slug')}
            placeholder="url-friendly-slug"
            className="w-full"
          />
          {errors.slug && (
            <p className="text-sm text-red-600">{errors.slug.message}</p>
          )}
          <p className="text-xs text-gray-500">
            This will be used in the URL. Auto-generated from title.
          </p>
        </div>

        {/* Excerpt Field */}
        <div className="space-y-2">
          <Label htmlFor="excerpt" className="text-sm font-medium">
            Excerpt *
          </Label>
          <textarea
            id="excerpt"
            {...register('excerpt')}
            placeholder="Brief description of your blog post"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
          {errors.excerpt && (
            <p className="text-sm text-red-600">{errors.excerpt.message}</p>
          )}
        </div>

        {/* Category and Tags Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category *
            </Label>
            <select
              id="category"
              {...register('category')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a category</option>
              <option value="technology">Technology</option>
              <option value="business">Business</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="health">Health</option>
              <option value="travel">Travel</option>
              <option value="food">Food</option>
              <option value="fashion">Fashion</option>
              <option value="sports">Sports</option>
              <option value="education">Education</option>
              <option value="other">Other</option>
            </select>
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

        {/* Status Field */}
        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm font-medium">
            Status
          </Label>
          <select
            id="status"
            {...register('status')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {/* Blog Content */}
        <div className="space-y-2">
          <Label htmlFor="content" className="text-sm font-medium">
            Blog Content *
          </Label>
          <textarea
            id="content"
            {...register('content')}
            placeholder="Start writing your blog post..."
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500">
            Write your blog content here. You can use basic formatting.
          </p>
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

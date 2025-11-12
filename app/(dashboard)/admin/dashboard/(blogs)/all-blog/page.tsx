"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useGetBlogsQuery, useDeleteBlogMutation } from "@/app/redux/features/blog-category/blog-category.api";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface Blog {
  id?: string;
  _id?: string;
  blogTitle?: string;
  title?: string;
  category?: string | { name?: string };
  status?: string;
  image?: string;
  tags?: string[] | string;
}

export default function AllBlogPage() {
  const router = useRouter();
  const { data, isFetching } = useGetBlogsQuery(undefined);
  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);
  
  // Ensure data is an array (transformResponse already extracts data, so data should be the array)
  const blogs: Blog[] = Array.isArray(data) ? data : [];

  const handleEdit = (id: string | number) => {
    router.push(`/admin/dashboard/edit-blog/${id}`);
  };

  const openDeleteDialog = (blog: Blog) => {
    setBlogToDelete(blog);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!blogToDelete) return;
    const blogId = blogToDelete.id ?? blogToDelete._id;
    if (!blogId) return;
    
    try {
      await deleteBlog(blogId as string).unwrap();
      toast.success("Blog deleted successfully");
      setIsDeleteOpen(false);
      setBlogToDelete(null);
    } catch (error) {
      toast.error("Failed to delete blog");
      console.error("Delete error:", error);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">All Blog Posts</h1>
            <p className="text-gray-600 mt-1">Browse and manage all blog posts</p>
          </div>

          <div className="px-6 pb-6">
            {isFetching ? (
              <div className="text-gray-600">Loading...</div>
            ) : blogs.length === 0 ? (
              <div className="text-gray-600">No blog posts found.</div>
            ) : (
              <div className="space-y-4">
                {blogs.map((blog: Blog) => {
                  const id = blog.id ?? blog._id;
                  if (!id) return null;
                  
                  const title = blog.blogTitle ?? blog.title ?? 'Untitled';
                  const category = typeof blog.category === 'string' 
                    ? blog.category 
                    : blog.category?.name ?? 'No category';
                  const status = blog.status ?? 'draft';
                  const image = blog.image;
                  const tags = Array.isArray(blog.tags) 
                    ? blog.tags.join(', ') 
                    : (blog.tags || 'No tags');

                  return (
                    <div
                      key={id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Image */}
                        {image && (
                          <div className="flex-shrink-0 relative w-32 h-24">
                            <Image
                              src={
                                image.startsWith('http')
                                  ? image
                                  : `/${image.replace(/^\/*/, '')}`
                              }
                              alt={title || 'Blog image'}
                              fill
                              className="object-cover rounded border"
                            />
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {title}
                              </h3>
                              <div className="mt-1 space-y-1">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Category:</span> {category}
                                </p>
                                {tags !== 'No tags' && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Tags:</span> {tags}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadgeColor(status)}`}
                              >
                                {status}
                              </span>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="px-4 py-1 h-9"
                                  onClick={() => handleEdit(id as string | number)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  className="px-4 py-1 h-9"
                                  onClick={() => openDeleteDialog(blog)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blog</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete{" "}
              <span className="font-medium">
                {blogToDelete?.blogTitle ?? blogToDelete?.title ?? "this blog"}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

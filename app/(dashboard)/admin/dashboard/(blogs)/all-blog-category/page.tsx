"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useGetBlogCategoriesQuery } from "@/app/redux/features/blog-category/blog-category.api";
import { useRouter } from "next/navigation";

interface BlogCategory {
  id?: string;
  _id?: string;
  name?: string;
  categoryName?: string;
}

export default function AllBlogCategoryPage() {
  const router = useRouter();
  const { data, isFetching } = useGetBlogCategoriesQuery(undefined);
  // Ensure data is an array (transformResponse already extracts data, so data should be the array)
  const categories: BlogCategory[] = Array.isArray(data) ? data : [];

  const handleEdit = (id: string | number) => {
    router.push(`/admin/dashboard/edit-blog-category/${id}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">All Blog Categories</h1>
            <p className="text-gray-600 mt-1">Browse all blog categories</p>
          </div>

          <div className="px-6 pb-6">
            {isFetching ? (
              <div className="text-gray-600">Loading...</div>
            ) : categories.length === 0 ? (
              <div className="text-gray-600">No categories found.</div>
            ) : (
              <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
                {categories.map((cat: BlogCategory) => {
                  const categoryId = cat.id ?? cat._id;
                  if (!categoryId) return null;
                  
                  return (
                    <li key={categoryId} className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-gray-900 font-medium">{cat.name ?? cat.categoryName ?? "Unnamed"}</span>
                        <Button
                          type="button"
                          variant="outline"
                          className="px-4 py-1 h-9"
                          onClick={() => handleEdit(categoryId)}
                        >
                          Update
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

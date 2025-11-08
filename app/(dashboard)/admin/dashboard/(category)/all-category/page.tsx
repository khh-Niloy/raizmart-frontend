"use client";

import React from "react";
import { useGetCategoriesQuery } from "@/app/redux/features/category-subcategory/category-subcategory.api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit } from "lucide-react";

interface Category {
  id?: string;
  _id?: string;
  name?: string;
  categoryName?: string;
  image?: string;
}

export default function AllCategoryPage() {
  const { data, isFetching } = useGetCategoriesQuery(undefined);
  // Ensure data is an array (transformResponse already extracts data, so data should be the array)
  const categories: Category[] = Array.isArray(data) ? data : [];

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              All Categories
            </h1>
            <p className="text-gray-600 mt-1">Browse all categories</p>
          </div>

          <div className="px-6 pb-6">
            {isFetching ? (
              <div className="text-gray-600">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className="text-gray-600">No categories found.</div>
            ) : (
              <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
                {categories.map((cat: Category) => (
                  <li key={cat.id ?? cat._id} className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 font-medium flex-1">
                          {cat?.name ?? cat?.categoryName ?? "Unnamed"}
                        </span>
                        {!!cat?.image && (
                          <img
                            src={cat?.image}
                            alt="Category"
                            className="h-12 w-12 object-contain rounded border border-gray-200 bg-white"
                          />
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/dashboard/edit-category/${
                            cat.id ?? cat._id
                          }`}
                          className="cursor-pointer"
                        >
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="px-4 py-1 h-9"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

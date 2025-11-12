"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useGetCategoriesQuery, useDeleteCategoryMutation } from "@/app/redux/features/category-subcategory/category-subcategory.api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Category {
  id?: string;
  _id?: string;
  name?: string;
  categoryName?: string;
  image?: string;
}

export default function AllCategoryPage() {
  const { data, isFetching } = useGetCategoriesQuery(undefined);
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  
  // Ensure data is an array (transformResponse already extracts data, so data should be the array)
  const categories: Category[] = Array.isArray(data) ? data : [];

  const openDeleteDialog = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    const categoryId = categoryToDelete.id ?? categoryToDelete._id;
    if (!categoryId) return;
    
    try {
      await deleteCategory(categoryId as string).unwrap();
      toast.success("Category deleted successfully");
      setIsDeleteOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      toast.error("Failed to delete category");
      console.error("Delete error:", error);
    }
  };

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
                          <div className="relative h-12 w-12">
                            <Image
                              src={cat?.image}
                              alt="Category"
                              fill
                              className="object-contain rounded border border-gray-200 bg-white"
                            />
                          </div>
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
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="px-4 py-1 h-9"
                          onClick={() => openDeleteDialog(cat)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete{" "}
              <span className="font-medium">
                {categoryToDelete?.name ?? categoryToDelete?.categoryName ?? "this category"}
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

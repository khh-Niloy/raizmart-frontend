"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import { useGetSubSubcategoriesQuery, useDeleteSubSubcategoryMutation } from "@/app/redux/features/category-subcategory/category-subcategory.api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SubSubCategory {
  id?: string;
  _id?: string;
  name?: string;
  isActive?: boolean;
  image?: string;
  subcategory?: string | { name?: string };
  category?: string | { name?: string };
  slug?: string;
  createdAt?: string;
}

export default function AllSubSubCategoryPage() {
  const { data: subSubCategoriesResponse, isFetching } = useGetSubSubcategoriesQuery(undefined);
  console.log(subSubCategoriesResponse);
  const [deleteSubSubcategory, { isLoading: isDeleting }] = useDeleteSubSubcategoryMutation();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [subSubCategoryToDelete, setSubSubCategoryToDelete] = useState<SubSubCategory | null>(null);
  // Ensure data is an array (transformResponse already extracts data, so subSubCategoriesResponse should be the array)
  const subSubCategories: SubSubCategory[] = Array.isArray(subSubCategoriesResponse) ? subSubCategoriesResponse : [];

  const openDeleteDialog = (subSubCategory: SubSubCategory) => {
    setSubSubCategoryToDelete(subSubCategory);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!subSubCategoryToDelete) return;
    const id = subSubCategoryToDelete.id ?? subSubCategoryToDelete._id;
    if (!id) return;

    try {
      await deleteSubSubcategory(id).unwrap();
      toast.success("Sub-sub-category deleted successfully");
      setIsDeleteOpen(false);
      setSubSubCategoryToDelete(null);
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete sub-sub-category. Please try again.");
    }
  };
  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">All Sub-Sub-Categories</h1>
                <p className="text-gray-600 mt-1">Manage your sub-sub-categories</p>
              </div>
              <Link href="/admin/dashboard/create-sub-sub-category" className="cursor-pointer">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Sub-Sub-Category
                </Button>
              </Link>
            </div>
          </div>

          <div className="px-6 py-6">
            {isFetching ? (
              <div className="text-gray-600">Loading sub-sub-categories...</div>
            ) : subSubCategories.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">No sub-sub-categories found</div>
                <p className="text-gray-400 mt-2">Create your first sub-sub-category to get started</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {subSubCategories.map((subSubCategory) => (
                  <Card key={subSubCategory.id ?? subSubCategory._id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {subSubCategory.name}
                          </CardTitle>
                          <Badge variant={subSubCategory.isActive ? "default" : "secondary"}>
                            {subSubCategory.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Link href={`/admin/dashboard/edit-sub-sub-category/${subSubCategory.id ?? subSubCategory._id}`} className="cursor-pointer">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="px-4 py-1 h-9"
                            onClick={() => openDeleteDialog(subSubCategory)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {!!subSubCategory?.image && (
                              <div className="relative h-14 w-14 ml-10">
                                <Image
                                  src={subSubCategory.image}
                                  alt="Image"
                                  fill
                                  className="object-contain rounded border border-gray-200 bg-white"
                                />
                              </div>
                    )}
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Parent Sub-Category:</span>
                          <p className="text-gray-900">
                            {typeof subSubCategory.subcategory === 'string' 
                              ? subSubCategory.subcategory 
                              : subSubCategory.subcategory?.name ?? "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Root Category:</span>
                          <p className="text-gray-900">
                            {typeof subSubCategory.category === 'string' 
                              ? subSubCategory.category 
                              : subSubCategory.category?.name ?? "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Created:</span>
                          <p className="text-gray-900">{subSubCategory.createdAt ? new Date(subSubCategory.createdAt).toLocaleDateString() : "N/A"}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className="font-medium text-sm text-gray-600">Path:</span>
                        <p className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded mt-1">
                          {(typeof subSubCategory.category === 'string' 
                            ? subSubCategory.category 
                            : subSubCategory.category?.name ?? "category").toLowerCase()}/
                          {(typeof subSubCategory.subcategory === 'string' 
                            ? subSubCategory.subcategory 
                            : subSubCategory.subcategory?.name ?? "subcategory").toLowerCase()}/
                          {subSubCategory.slug ?? subSubCategory.name?.toLowerCase().replace(/\s+/g, '-') ?? "sub-sub-category"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Sub-Sub-Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete{" "}
              <span className="font-medium">
                {subSubCategoryToDelete?.name ?? "this sub-sub-category"}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

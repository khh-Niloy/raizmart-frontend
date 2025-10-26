"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import { useGetSubSubcategoriesQuery, useDeleteSubSubcategoryMutation } from "@/app/redux/features/category-subcategory/category-subcategory.api";

export default function AllSubSubCategoryPage() {
  const { data: subSubCategoriesResponse, isFetching } = useGetSubSubcategoriesQuery(undefined);
  console.log(subSubCategoriesResponse);
  const [deleteSubSubcategory, { isLoading: isDeleting }] = useDeleteSubSubcategoryMutation();
  const subSubCategories: any[] = (subSubCategoriesResponse?.data ?? subSubCategoriesResponse ?? []) as any[];

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this sub-sub-category?")) {
      try {
        await deleteSubSubcategory(id).unwrap();
        console.log("Sub-sub-category deleted successfully");
      } catch (error) {
        console.error("Delete failed:", error);
      }
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
              <Link href="/admin/dashboard/create-sub-sub-category">
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
                          <CardTitle className="text-lg">{subSubCategory.name}</CardTitle>
                          <Badge variant={subSubCategory.isActive ? "default" : "secondary"}>
                            {subSubCategory.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link href={`/admin/dashboard/edit-sub-sub-category/${subSubCategory.id ?? subSubCategory._id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(subSubCategory.id ?? subSubCategory._id)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            {isDeleting ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Parent Sub-Category:</span>
                          <p className="text-gray-900">{subSubCategory.subcategory?.name ?? subSubCategory.subcategory ?? "N/A"}</p>
                        </div>
                        <div>
                          <span className="font-medium">Root Category:</span>
                          <p className="text-gray-900">{subSubCategory.category?.name ?? subSubCategory.category ?? "N/A"}</p>
                        </div>
                        <div>
                          <span className="font-medium">Created:</span>
                          <p className="text-gray-900">{subSubCategory.createdAt ? new Date(subSubCategory.createdAt).toLocaleDateString() : "N/A"}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className="font-medium text-sm text-gray-600">Path:</span>
                        <p className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded mt-1">
                          {(subSubCategory.category?.name ?? subSubCategory.category ?? "category").toLowerCase()}/{(subSubCategory.subcategory?.name ?? subSubCategory.subcategory ?? "subcategory").toLowerCase()}/{subSubCategory.slug ?? subSubCategory.name?.toLowerCase().replace(/\s+/g, '-') ?? "sub-sub-category"}
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
    </div>
  );
}

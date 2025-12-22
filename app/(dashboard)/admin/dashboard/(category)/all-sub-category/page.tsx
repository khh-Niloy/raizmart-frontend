"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  useGetSubcategoriesQuery, 
  useGetCategoriesQuery, 
  useDeleteSubcategoryMutation,
  useToggleSubcategoryFeaturedMutation
} from "@/app/redux/features/category-subcategory/category-subcategory.api";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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

export default function AllSubCategoryPage() {
  interface Subcategory {
    id?: string;
    _id?: string;
    name?: string;
    subCategoryName?: string;
    image?: string;
    category?: string | { _id?: string; id?: string; name?: string; categoryName?: string };
    isFeatured?: boolean;
  }

  interface Category {
    id?: string;
    _id?: string;
    name?: string;
    categoryName?: string;
  }

  const { data, isFetching } = useGetSubcategoriesQuery(undefined);
  const { data: categoriesData, isFetching: isCatsLoading } = useGetCategoriesQuery(undefined);
  const [deleteSubcategory, { isLoading: isDeleting }] = useDeleteSubcategoryMutation();
  const [toggleFeatured] = useToggleSubcategoryFeaturedMutation();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<Subcategory | null>(null);
  
  // Ensure data is an array (transformResponse already extracts data, so data should be the array)
  const subcategories: Subcategory[] = Array.isArray(data) ? data : [];
  const categories: Category[] = React.useMemo(() => {
    const cats: Category[] = Array.isArray(categoriesData) ? categoriesData : [];
    return cats;
  }, [categoriesData]);

  const idToCategoryName = React.useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c: Category) => {
      const id = (c.id ?? c._id) as string;
      const name = (c.name ?? c.categoryName ?? "Unnamed") as string;
      if (id) map.set(id, name);
    });
    return map;
  }, [categories]);

  const openDeleteDialog = (subcategory: Subcategory) => {
    setSubcategoryToDelete(subcategory);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!subcategoryToDelete) return;
    const subcategoryId = subcategoryToDelete.id ?? subcategoryToDelete._id;
    if (!subcategoryId) return;
    
    try {
      await deleteSubcategory(subcategoryId as string).unwrap();
      toast.success("Subcategory deleted successfully");
      setIsDeleteOpen(false);
      setSubcategoryToDelete(null);
    } catch (error) {
      toast.error("Failed to delete subcategory");
      console.error("Delete error:", error);
    }
  };

  const handleToggleFeatured = async (subcategory: Subcategory, checked: boolean) => {
    const subcategoryId = subcategory.id ?? subcategory._id;
    if (!subcategoryId) return;

    try {
      await toggleFeatured({ id: subcategoryId, isFeatured: checked }).unwrap();
      toast.success(`Subcategory ${checked ? 'added to' : 'removed from'} featured`);
    } catch (error) {
      toast.error("Failed to update featured status");
      console.error("Featured toggle error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">All Sub-Categories</h1>
            <p className="text-gray-600 mt-1">Browse all sub-categories</p>
          </div>

          <div className="px-6 pb-6">
            {isFetching ? (
              <div className="text-gray-600">Loading sub-categories...</div>
            ) : subcategories.length === 0 ? (
              <div className="text-gray-600">No sub-categories found.</div>
            ) : (
              <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
                {subcategories.map((sc: Subcategory) => {
                  const subName = sc?.name ?? sc?.subCategoryName ?? "Unnamed";
                  // category may be an id (string) or a populated object
                  let parentName: string | undefined;
                  if (typeof sc?.category === 'string') {
                    parentName = idToCategoryName.get(sc.category);
                  } else if (sc?.category && typeof sc.category === 'object') {
                    parentName = sc.category.name ?? sc.category.categoryName;
                  }
                  const parentLabel = parentName ?? (isCatsLoading ? "Loading..." : "—");
                  return (
                    <li key={sc.id ?? sc._id} className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900 font-medium">{subName}</span>
                            {!!sc?.image && (
                              <div className="relative h-7 w-7">
                                <Image
                                  src={sc?.image?.startsWith?.('http') ? sc.image : '/' + sc?.image?.replace?.(/^\/*/, '')}
                                  alt="Subcategory"
                                  fill
                                  className="object-contain rounded border border-gray-200 bg-white"
                                />
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">Parent: {parentLabel}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 mr-4">
                            <Switch
                              checked={sc.isFeatured || false}
                              onCheckedChange={(checked) => handleToggleFeatured(sc, checked)}
                            />
                            <span className="text-sm text-gray-600">Featured</span>
                          </div>
                          <Link href={`/admin/dashboard/edit-sub-category/${sc.id ?? sc._id}`} className="cursor-pointer">
                            <Button type="button" variant="outline" size="sm" className="px-4 py-1 h-9">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="px-4 py-1 h-9"
                            onClick={() => openDeleteDialog(sc)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subcategory</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete{" "}
              <span className="font-medium">
                {subcategoryToDelete?.name ?? subcategoryToDelete?.subCategoryName ?? "this subcategory"}
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

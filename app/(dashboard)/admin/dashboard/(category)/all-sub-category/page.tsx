"use client";

import React from "react";
import { useGetSubcategoriesQuery, useGetCategoriesQuery } from "@/app/redux/features/category-subcategory/category-subcategory.api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit } from "lucide-react";

export default function AllSubCategoryPage() {
  const { data, isFetching } = useGetSubcategoriesQuery(undefined);
  const { data: categoriesData, isFetching: isCatsLoading } = useGetCategoriesQuery(undefined);
  const subcategories: any[] = (data?.data ?? data ?? []) as any[];
  const categories: any[] = (categoriesData?.data ?? categoriesData ?? []) as any[];

  const idToCategoryName = React.useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c: any) => {
      const id = (c.id ?? c._id) as string;
      const name = (c.name ?? c.categoryName ?? "Unnamed") as string;
      if (id) map.set(id, name);
    });
    return map;
  }, [categories]);

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
                {subcategories.map((sc: any) => {
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
                              <img
                                src={sc?.image?.startsWith?.('http') ? sc.image : '/' + sc?.image?.replace?.(/^\/*/, '')}
                                alt="Subcategory"
                                className="h-7 w-7 object-contain rounded border border-gray-200 bg-white"
                              />
                            )}
                          </div>
                          <span className="text-xs text-gray-500">Parent: {parentLabel}</span>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/admin/dashboard/edit-sub-category/${sc.id ?? sc._id}`} className="cursor-pointer">
                            <Button type="button" variant="outline" size="sm" className="px-4 py-1 h-9">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
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
    </div>
  );
}

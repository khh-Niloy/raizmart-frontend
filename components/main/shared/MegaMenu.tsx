"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  useGetCategoriesQuery,
  useGetSubSubcategoriesQuery,
} from "@/app/redux/features/category-subcategory/category-subcategory.api";

interface Category {
  _id: string;
  name: string;
  slug: string;
  subcategories: Subcategory[]; // This is populated with actual subcategory objects
  createdAt: string;
  updatedAt: string;
}

interface Subcategory {
  _id: string;
  name: string;
  category: string;
  slug: string;
  subSubcategories?: SubSubcategory[];
}

interface SubSubcategory {
  _id: string;
  name: string;
  subcategory: string | { _id: string };
  slug: string;
}

export default function MegaMenu() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(
    null
  );
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const { data: categories, isLoading: categoriesLoading } =
    useGetCategoriesQuery(undefined);
  const { data: subSubcategories, isLoading: subSubcategoriesLoading } =
    useGetSubSubcategoriesQuery(undefined);

  const categoriesList: Category[] = Array.isArray(categories) ? categories : [];
  const subSubcategoriesList: SubSubcategory[] = Array.isArray(subSubcategories) ? subSubcategories : [];

  const handleCategoryHover = (categoryId: string) => {
    setActiveCategory(categoryId);
    setActiveSubcategory(null);
  };

  const handleSubcategoryHover = (subcategoryId: string) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setActiveSubcategory(subcategoryId);
  };

  const handleMouseLeave = () => {
    setActiveCategory(null);
    setActiveSubcategory(null);
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  if (categoriesLoading || subSubcategoriesLoading) {
    return (
      <div className="flex items-center space-x-8">
        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-6 w-28 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
      <div className="flex items-center space-x-8 relative flex-wrap">
        {categoriesList.map((category) => {
          const categorySubcategories = category.subcategories || [];
          const hasSubcategories = categorySubcategories.length > 0;

          return (
            <div
              key={category._id}
              className="relative group"
              onMouseEnter={() => handleCategoryHover(category._id)}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                href={`/category/${category.slug}`}
                className="flex items-center space-x-1 text-white hover:font-bold transition-all duration-300 ease-in-out font-medium py-2 hover:font-semibold"
              >
                <span className="transition-transform duration-300 whitespace-nowrap ease-in-out">
                  {category.name}
                </span>
                {hasSubcategories && (
                  <ChevronDown className="h-4 w-4 transition-transform duration-300 ease-in-out group-hover:rotate-180" />
                )}
              </Link>

              {/* 3-Level Dropdown */}
              {activeCategory === category._id && hasSubcategories && (
                <div className="absolute top-full left-0 min-w-[200px] bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-2">
                  {/* Subcategories */}
                  {categorySubcategories
                    .filter((sub) => sub.name && sub.name.trim() !== "")
                    .map((subcategory, index) => {
                      // Try to get sub-sub-categories from populated data first
                      let subSubcategoriesForThisSub =
                        (subcategory.subSubcategories || []).filter(
                          (ss) => ss.name && ss.name.trim() !== ""
                        );

                      // Fallback: If no populated data, filter from separate API call
                      if (
                        subSubcategoriesForThisSub.length === 0 &&
                        subSubcategoriesList.length > 0
                      ) {
                        subSubcategoriesForThisSub = subSubcategoriesList.filter(
                          (subSub: SubSubcategory) => {
                            if (!subSub.name || subSub.name.trim() === "")
                              return false;
                            if (typeof subSub.subcategory === "string") {
                              return subSub.subcategory === subcategory._id;
                            } else if (
                              subSub.subcategory &&
                              typeof subSub.subcategory === "object" &&
                              "_id" in subSub.subcategory
                            ) {
                              return subSub.subcategory._id === subcategory._id;
                            }
                            return false;
                          }
                        );
                      }

                      const hasSubSubcategories =
                        subSubcategoriesForThisSub.length > 0;

                      return (
                        <div
                          key={subcategory._id}
                          className="relative"
                          onMouseEnter={() =>
                            handleSubcategoryHover(subcategory._id)
                          }
                        >
                          <Link
                            href={`/category/${category.slug}/${subcategory.slug}`}
                            className="flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-50 hover:font-bold hover:text-[#02C1BE] transition-all duration-200 ease-in-out mx-2 rounded-md"
                            style={{
                              animationDelay: `${index * 50}ms`,
                              animation: "slideInFromLeft 0.3s ease-out forwards",
                            }}
                          >
                            <span className="whitespace-nowrap">
                              {subcategory.name}
                            </span>
                            {hasSubSubcategories && (
                              <ChevronDown className="h-3 w-3 ml-2 -rotate-90" />
                            )}
                          </Link>

                          {/* Sub-Subcategories Dropdown */}
                          {activeSubcategory === subcategory._id &&
                            hasSubSubcategories && (
                              <div
                                className="absolute left-full top-0 w-56 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-2 ml-1"
                                onMouseEnter={() => {
                                  if (hoverTimeout) {
                                    clearTimeout(hoverTimeout);
                                    setHoverTimeout(null);
                                  }
                                }}
                              >
                                {subSubcategoriesForThisSub.map(
                                  (subSubcategory, subIndex) => {
                                    const subSubcategorySlug =
                                      subSubcategory.slug ||
                                      subSubcategory.name
                                        ?.toLowerCase()
                                        .replace(/\s+/g, "-") ||
                                      "sub-sub-category";
                                    return (
                                      <Link
                                        key={subSubcategory._id}
                                        href={`/category/${category.slug}/${subcategory.slug}/${subSubcategorySlug}`}
                                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:font-bold hover:text-[#02C1BE] transition-all duration-200 ease-in-out mx-2 rounded-md"
                                        style={{
                                          animationDelay: `${subIndex * 30}ms`,
                                          animation:
                                            "slideInFromLeft 0.2s ease-out forwards",
                                        }}
                                      >
                                        <span className="whitespace-nowrap">
                                          {subSubcategory.name}
                                        </span>
                                      </Link>
                                    );
                                  }
                                )}
                              </div>
                            )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

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
  subcategory: string;
  slug: string;
}

export default function MegaMenu() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(
    null
  );
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isHoveringSubSubcategory, setIsHoveringSubSubcategory] = useState(false);

  const { data: categories, isLoading: categoriesLoading } =
    useGetCategoriesQuery(undefined);
  const { data: subSubcategories, isLoading: subSubcategoriesLoading } =
    useGetSubSubcategoriesQuery(undefined);

  const categoriesList: Category[] = categories || [];
  const subSubcategoriesList: SubSubcategory[] = subSubcategories || [];

  const handleCategoryHover = (categoryId: string) => {
    setActiveCategory(categoryId);
    setActiveSubcategory(null);
  };

  const handleSubcategoryHover = (subcategoryId: string) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsHoveringSubSubcategory(false);
    setActiveSubcategory(subcategoryId);
  };

  const handleSubcategoryMouseLeave = () => {
    // Only hide if not hovering over sub-subcategory
    if (!isHoveringSubSubcategory) {
      const timeout = setTimeout(() => {
        setActiveSubcategory(null);
      }, 100);
      setHoverTimeout(timeout);
    }
  };

  const handleSubSubcategoryMouseEnter = () => {
    setIsHoveringSubSubcategory(true);
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const handleSubSubcategoryMouseLeave = () => {
    setIsHoveringSubSubcategory(false);
    const timeout = setTimeout(() => {
      setActiveSubcategory(null);
    }, 100);
    setHoverTimeout(timeout);
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
        <div className="animate-pulse bg-gray-200 h-6 w-24 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-6 w-20 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-6 w-28 rounded"></div>
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
      <div className="flex items-center space-x-8 relative">
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
                <span className="transition-transform duration-300 ease-in-out">
                  {category.name}
                </span>
                {hasSubcategories && (
                  <ChevronDown className="h-4 w-4 transition-transform duration-300 ease-in-out group-hover:rotate-180" />
                )}
              </Link>

              {/* 3-Level Dropdown */}
              {activeCategory === category._id && hasSubcategories && (
                <div className="absolute top-full left-0 w-64 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
                  {/* Subcategories */}
                  {categorySubcategories.map((subcategory, index) => {
                    // Try to get sub-sub-categories from populated data first
                    let subSubcategoriesForThisSub =
                      subcategory.subSubcategories || [];

                    // Fallback: If no populated data, filter from separate API call
                    if (
                      subSubcategoriesForThisSub.length === 0 &&
                      subSubcategoriesList.length > 0
                    ) {
                      subSubcategoriesForThisSub = subSubcategoriesList.filter(
                        (subSub: any) => {
                          if (typeof subSub.subcategory === "string") {
                            return subSub.subcategory === subcategory._id;
                          } else if (
                            subSub.subcategory &&
                            typeof subSub.subcategory === "object"
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
                        className="relative group"
                        onMouseEnter={() =>
                          handleSubcategoryHover(subcategory._id)
                        }
                        onMouseLeave={handleSubcategoryMouseLeave}
                      >
                        {/* Single hover area that includes both subcategory and sub-subcategory */}
                        <div className="flex">
                          {/* Subcategory Link */}
                          <Link
                            href={`/category/${category.slug}/${subcategory.slug}`}
                            className="flex items-center justify-between px-4 py-2 text-gray-700 rounded-lg hover:font-bold hover:text-[#02C1BE] transition-all duration-200 ease-in-out w-[200px]"
                            style={{
                              animationDelay: `${index * 50}ms`,
                              animation: "slideInFromLeft 0.3s ease-out forwards",
                            }}
                          >
                            <span>{subcategory.name}</span>
                            {hasSubSubcategories && (
                              <ChevronDown className="h-3 w-3 ml-2" />
                            )}
                          </Link>

                          {/* Sub-Subcategories Dropdown - Always rendered but conditionally visible */}
                          {hasSubSubcategories && (
                            <div
                              className={`absolute left-[200px] top-0 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50 transition-all duration-200 ${
                                activeSubcategory === subcategory._id 
                                  ? 'opacity-100 visible' 
                                  : 'opacity-0 invisible'
                              }`}
                              style={{ marginLeft: '-1px' }}
                              onMouseEnter={handleSubSubcategoryMouseEnter}
                              onMouseLeave={handleSubSubcategoryMouseLeave}
                            >
                              {subSubcategoriesForThisSub.map(
                                (subSubcategory, subIndex) => {
                                  // Generate slug if it doesn't exist
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
                                      className="block px-4 py-2 text-gray-700 rounded-lg hover:font-bold hover:text-[#02C1BE] transition-all duration-200 ease-in-out"
                                      style={{
                                        animationDelay: `${subIndex * 30}ms`,
                                        animation:
                                          "slideInFromLeft 0.2s ease-out forwards",
                                      }}
                                    >
                                      {subSubcategory.name}
                                    </Link>
                                  );
                                }
                              )}
                            </div>
                          )}
                        </div>
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

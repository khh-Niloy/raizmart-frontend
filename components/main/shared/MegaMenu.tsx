"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  useGetCategoriesQuery,
  useGetSubcategoriesQuery,
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
}

export default function MegaMenu() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data: categories, isLoading: categoriesLoading } =
    useGetCategoriesQuery(undefined);
  const { data: subcategories, isLoading: subcategoriesLoading } =
    useGetSubcategoriesQuery(undefined);

  const categoriesList: Category[] = categories || [];
  const subcategoriesList: Subcategory[] = subcategories || [];

  const handleCategoryHover = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const handleMouseLeave = () => {
    setActiveCategory(null);
  };

  if (categoriesLoading || subcategoriesLoading) {
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
                className="flex items-center space-x-1 text-gray-600 hover:text-[#02C1BE] transition-all duration-300 ease-in-out font-medium py-2 hover:font-semibold"
              >
                <span className="transition-transform duration-300 ease-in-out">
                  {category.name}
                </span>
                {hasSubcategories && (
                  <ChevronDown className="h-4 w-4 transition-transform duration-300 ease-in-out group-hover:rotate-180" />
                )}
              </Link>

              {/* Simple Dropdown */}
              {activeCategory === category._id && hasSubcategories && (
                <div className="absolute top-full left-0 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50 ">
                  {/* Parent category link - commented out as requested */}

                  {/* Subcategories */}
                  {categorySubcategories.map((subcategory, index) => (
                    <Link
                      key={subcategory._id}
                      href={`/category/${category.slug}/${subcategory.slug}`}
                      className="block px-4 py-2 text-gray-700 rounded-lg hover:bg-[#02C1BE] hover:text-white transition-all duration-200 ease-in-out"
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animation: "slideInFromLeft 0.3s ease-out forwards",
                      }}
                    >
                      {subcategory.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
